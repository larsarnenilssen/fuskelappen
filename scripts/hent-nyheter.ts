// Henter de siste nyhetene fra kildene i content/nyheter/kilder.yaml til data/nyheter/nyheter.json (fase 7b).
//
// - Én forespørsel per kilde: en RSS- eller Atom-feed, eller nyhetslisten på én side. Ingen bilder, ingen hele tekster,
//   og ingen henting av hver enkelt sak.
// - Kilder som også skriver om barnehage, grunnskole og høyere utdanning, filtreres med ordene i kilder.yaml.
// - Feiler en kilde, eller gir den null saker, beholdes sakene fra før, og kilden får status `feilet` eller `tom`.
// - Sakene fra før beholdes også når feeden bare viser de siste, så listen har sakene fra de siste MAKS_DAGER dagene.
// - Filen skrives bare når innholdet er endret, og kontrolleres mot skjemaet før den skrives.
//
// Bruk: tsx scripts/hent-nyheter.ts [--rapport]
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Nyhetskilde, Nyhetskilder } from '../src/modules/nyheter/kildeskjema.ts';
import { nyheterSkjema, type Nyhet, type Nyheter, type NyhetskildeStatus } from '../src/modules/nyheter/skjema.ts';
import { lesForrige, skrivHvisEndret } from './data/hent.ts';
import { lesFil } from './innhold/last.ts';
import { USER_AGENT } from './kilder/metoder.ts';
import { erRelevant, vurder, type Nyhetsfilter } from './nyheter/filter.ts';
import { lesLovdata } from './nyheter/lovdata.ts';
import { kortIngress, lesFeed, lesUdir, lesUtdanningsforbundet, type RaSak } from './nyheter/les.ts';

const rot = fileURLToPath(new URL('..', import.meta.url));
const FIL = join(rot, 'data/nyheter/nyheter.json');
/** Saker eldre enn dette tas ikke med. */
const MAKS_DAGER = 90;
/** Høyst så mange saker per kilde. */
const MAKS_PER_KILDE = 25;

async function hentTekst(url: string): Promise<string> {
  let feil: unknown;
  for (let forsok = 1; forsok <= 3; forsok++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'application/rss+xml, application/atom+xml, application/xml, text/html;q=0.9' }, signal: AbortSignal.timeout(60_000) });
      if (!r.ok) throw new Error(`${url} svarte ${r.status}`);
      return await r.text();
    } catch (e) {
      feil = e;
      await new Promise((v) => setTimeout(v, 2000 * forsok));
    }
  }
  throw feil instanceof Error ? feil : new Error(String(feil));
}

function les(kilde: Nyhetskilde, tekst: string): RaSak[] {
  if (kilde.format === 'udir') return lesUdir(tekst, kilde.url);
  if (kilde.format === 'utdanningsforbundet') return lesUtdanningsforbundet(tekst, kilde.url);
  return lesFeed(tekst);
}

/** Adressen uten sporingsparametre (utm_*). */
export function rensUrl(url: string): string {
  try {
    const u = new URL(url);
    for (const n of [...u.searchParams.keys()]) if (n.startsWith('utm_')) u.searchParams.delete(n);
    return u.toString();
  } catch {
    return url;
  }
}

export function tilSaker(kilde: Nyhetskilde, filter: Nyhetsfilter, raa: RaSak[], fra: string): Nyhet[] {
  const utelat = kilde.utelat?.length ? new RegExp(kilde.utelat.map((o) => o.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i') : null;
  return raa.flatMap((s) => {
    if (!s.dato || s.dato < fra) return [];
    if (utelat?.test(s.tittel)) return [];
    if (kilde.filter === 'vgs' && !erRelevant(filter, s.tittel, [s.ingress ?? '', ...s.stikkord].join(' '))) return [];
    const ingress = kilde.ingress && s.ingress ? kortIngress(s.ingress) : undefined;
    const ingressNn = kilde.ingress && s.ingressNn ? kortIngress(s.ingressNn) : undefined;
    return [{ kilde: kilde.id, tittel: s.tittel, dato: s.dato, url: rensUrl(s.url), ...(ingress ? { ingress } : {}), ...(s.tittelNn ? { tittelNn: s.tittelNn } : {}), ...(ingressNn ? { ingressNn } : {}) }];
  });
}

/** Om en sak fra før fortsatt passer filteret og ordene kilden utelater. */
export function beholdes(kilde: Nyhetskilde, filter: Nyhetsfilter, s: Nyhet): boolean {
  return tilSaker(kilde, filter, [{ tittel: s.tittel, dato: s.dato, url: s.url, ingress: s.ingress ?? null, stikkord: [] }], '0000-00-00').length > 0;
}

/**
 * Nye og gamle saker fra én kilde: uten dobbelt, nyeste først, høyst MAKS_PER_KILDE. En sak vi har sett før, beholder
 * datoen den fikk første gang, fordi noen feeder bare har datoen saken sist ble endret (Statsforvalteren).
 */
export function slaaSammen(nye: Nyhet[], gamle: Nyhet[], fra: string): Nyhet[] {
  const forrigeDato = new Map(gamle.map((s) => [s.url, s.dato]));
  const sett = new Set<string>();
  return [...nye.map((s) => ({ ...s, dato: forrigeDato.get(s.url) ?? s.dato })), ...gamle]
    .filter((s) => s.dato >= fra && !sett.has(s.url) && sett.add(s.url))
    .sort((a, b) => b.dato.localeCompare(a.dato))
    .slice(0, MAKS_PER_KILDE);
}

async function main() {
  const rapport = process.argv.includes('--rapport');
  const { filter, kilder } = lesFil(rot, join(rot, 'content/nyheter/kilder.yaml')) as Nyhetskilder;
  const forrige = lesForrige<Nyheter>(FIL);
  const naa = new Date();
  const fra = new Date(naa.getTime() - MAKS_DAGER * 86_400_000).toISOString().slice(0, 10);
  const status: Record<string, NyhetskildeStatus> = {};
  const saker: Nyhet[] = [];

  await Promise.all(
    kilder.map(async (kilde) => {
      // Sakene fra før vurderes på nytt, så et endret filter også gjelder dem.
      const gamle = forrige?.saker.filter((s) => s.kilde === kilde.id && beholdes(kilde, filter, s)) ?? [];
      const feilSiden = forrige?.kilder[kilde.id]?.feilSiden ?? naa.toISOString().slice(0, 10);
      try {
        const raa = kilde.format === 'lovdata' ? lesLovdata(rot, naa.toISOString().slice(0, 10)) : les(kilde, await hentTekst(kilde.url));
        const nye = tilSaker(kilde, filter, raa, fra);
        if (rapport) {
          console.log(`\n${kilde.id}: ${raa.length} i feeden, ${nye.length} med`);
          for (const s of raa) console.log(`  ${s.dato ?? '??????????'} ${kilde.filter === 'vgs' ? vurder(filter, s.tittel, [s.ingress ?? '', ...s.stikkord].join(' ')).padEnd(9) : 'alle     '} ${s.tittel}`);
        }
        // Lovdata har ofte ingen vedtatte endringer som ikke gjelder ennå. Det er ikke en feil.
        if (raa.length === 0 && kilde.format !== 'lovdata') {
          status[kilde.id] = { status: 'tom', feilSiden, melding: 'Fant ingen saker. Formatet kan være endret.' };
          saker.push(...gamle);
          return;
        }
        status[kilde.id] = { status: 'ok' };
        saker.push(...slaaSammen(nye, gamle, fra));
      } catch (e) {
        status[kilde.id] = { status: 'feilet', feilSiden, melding: e instanceof Error ? e.message : String(e) };
        saker.push(...gamle);
      }
    }),
  );

  saker.sort((a, b) => b.dato.localeCompare(a.dato) || a.kilde.localeCompare(b.kilde));
  const ny: Nyheter = { skjema: 1, hentet: naa.toISOString(), kilder: Object.fromEntries(kilder.map((k) => [k.id, status[k.id] ?? { status: 'feilet' }])), saker };
  const sjekk = nyheterSkjema.safeParse(ny);
  if (!sjekk.success) throw new Error(`Nyhetene passer ikke skjemaet: ${sjekk.error.message}`);
  const skrevet = skrivHvisEndret(FIL, forrige, ny);
  const feilet = Object.entries(status).filter(([, s]) => s.status !== 'ok');
  console.log(`Nyheter: ${saker.length} saker fra ${kilder.length} kilder${skrevet ? '' : ' (uendret)'}.`);
  for (const [id, s] of feilet) console.log(`  ${id}: ${s.status}${s.melding ? ` – ${s.melding}` : ''}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) await main();
