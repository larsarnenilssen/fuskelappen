// Prøvehenting av mulige nyhetskilder (npm run nyheter:prove). Skriver en rapport i Markdown: om kilden svarer, hvor
// mange saker den har, hvor ofte den publiserer, og hva filteret ville tatt med. Ingenting lagres, og appen viser ikke
// kildene. Brukes til å avgjøre om en kilde skal med (eier 07.10.2026), og går i arbeidsflyten Nyheter i PR-er og ved
// manuell kjøring, fordi flere av kildene er stengt fra skymiljøet.
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Nyhetskilder, Provekilde } from '../../src/modules/nyheter/kildeskjema.ts';
import { lesFil } from '../innhold/last.ts';
import { USER_AGENT } from '../kilder/metoder.ts';
import { vurder, type Nyhetsfilter } from './filter.ts';
import { lesFeed, lesHkdir, lesJsonliste, lesLenkeliste, rensTekst, type RaSak } from './les.ts';

const rot = fileURLToPath(new URL('../..', import.meta.url));

async function hent(url: string): Promise<{ status: number; tekst: string }> {
  const r = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(30_000) });
  return { status: r.status, tekst: await r.text() };
}

const celle = (t: string) => t.replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();

/** Hva filteret ville gjort med saken: «med» eller hvorfor ikke. `streng`: bare sterke ord i tittelen. */
export function provevurdering(filter: Nyhetsfilter, k: Pick<Provekilde, 'streng' | 'alle'>, s: RaSak): string {
  if (k.alle) return 'med (alle)';
  const v = vurder(filter, s.tittel, [s.ingress ?? '', ...s.stikkord].join(' '));
  if (k.streng) return vurder(filter, s.tittel) === 'sterk' ? 'med (streng)' : `ikke (streng; vanlig: ${v})`;
  return v === 'sterk' || v === 'generell' ? `med (${v})` : `ikke (${v})`;
}

/** Saker per uke, regnet fra den eldste til den nyeste saken i feeden. */
function perUke(saker: RaSak[]): string {
  const datoer = saker.map((s) => s.dato).filter((d): d is string => d !== null).sort();
  const [forste, siste] = [datoer[0], datoer.at(-1)];
  if (!forste || !siste || datoer.length < 2) return '–';
  const dager = Math.max(1, (Date.parse(siste) - Date.parse(forste)) / 86_400_000);
  return (datoer.length / (dager / 7)).toFixed(1).replace('.', ',');
}

async function main() {
  const { filter, prove, oppdag } = lesFil(rot, join(rot, 'content/nyheter/kilder.yaml')) as Nyhetskilder;
  const ut: string[] = ['## Prøvekilder for nyhetene', ''];
  for (const k of prove) {
    ut.push(`### ${k.navn}`, '', `\`${k.url}\``, '');
    try {
      const { status, tekst } = await hent(k.url);
      const saker =
        status !== 200
          ? []
          : k.format === 'hkdir'
            ? lesHkdir(tekst, k.url)
            : k.format === 'jsonliste'
              ? lesJsonliste(tekst, k.url)
              : k.format === 'lenkeliste'
                ? lesLenkeliste(tekst, k.url)
                : lesFeed(tekst);
      const med = saker.filter((s) => provevurdering(filter, k, s).startsWith('med'));
      ut.push(`Svar ${status}, ${Math.round(tekst.length / 1024)} kB. ${saker.length} saker, om lag ${perUke(saker)} per uke. ${med.length} ville vært med.`, '');
      if (saker.length === 0) {
        // Hvor sakene kommer fra: teksten rundt «published» (Angular-maler, ng-init) og adressene i skriptene.
        const i = tekst.search(/ng-init|published|"items"|nyhetsarkiv/i);
        ut.push('Teksten rundt det første treffet på ng-init, published, items eller nyhetsarkiv:', '', '```', tekst.slice(Math.max(0, i - 400), i + 1200).replace(/\s+/g, ' '), '```', '');
        const adresser = [...new Set([...tekst.matchAll(/["'](\/[a-z0-9/_-]*(?:api|service|nyhet|news|search|sok)[a-z0-9/_?=&.-]*)["']/gi)].map((m) => m[1]))].slice(0, 15);
        ut.push(`Adresser i siden: ${adresser.length ? adresser.map((a) => `\`${a}\``).join(', ') : 'ingen'}`, '');
      }
      if (saker.length > 0) {
        ut.push('| Dato | Filteret | Tittel |', '|---|---|---|');
        for (const s of [...med, ...saker.filter((x) => !med.includes(x))].slice(0, 25)) ut.push(`| ${s.dato ?? '?'} | ${provevurdering(filter, k, s)} | ${celle(s.tittel)} |`);
        ut.push('');
      }
    } catch (e) {
      ut.push(`Feilet: ${e instanceof Error ? e.message : String(e)}`, '');
    }
  }
  ut.push('## Feeder og robots.txt', '');
  for (const side of oppdag) {
    try {
      const { status, tekst } = await hent(side);
      const feeder = [...tekst.matchAll(/<link[^>]+type="application\/(?:rss|atom)\+xml"[^>]*>/gi)].map((m) => /href="([^"]+)"/.exec(m[0])?.[1]).filter(Boolean);
      const lenker = [...new Set([...tekst.matchAll(/href="([^"]*(?:rss|feed|atom)[^"]*)"/gi)].map((m) => m[1]))].slice(0, 15);
      const robots = await hent(new URL('/robots.txt', side).toString()).catch(() => null);
      const regler = robots?.status === 200 ? robots.tekst.split('\n').filter((l) => /^(user-agent|disallow|allow)/i.test(l.trim())).slice(0, 25) : [];
      ut.push(`### ${side}`, '', `Svar ${status}. Feeder i <head>: ${feeder.length ? feeder.join(', ') : 'ingen'}.`, '');
      // Er siden en nyhetsliste uten feed: overskriftene og datoene som står der, så det kan avgjøres om listen kan leses.
      const overskrifter = [...tekst.matchAll(/<h[234][^>]*>([\s\S]*?)<\/h[234]>/gi)].map((m) => rensTekst(m[1] ?? '')).filter(Boolean).slice(0, 12);
      const datoer = [...tekst.matchAll(/<time[^>]*>([\s\S]*?)<\/time>|\b(\d{1,2}\.\s?(?:\d{1,2}\.|[a-zæøå]+)\s?\d{4})\b/gi)].map((m) => rensTekst(m[1] ?? m[2] ?? '')).slice(0, 12);
      if (overskrifter.length) ut.push(`Overskrifter: ${overskrifter.map((o) => `«${o}»`).join(', ')}`, '');
      if (datoer.length) ut.push(`Datoer på siden: ${datoer.join(', ')}`, '');
      // Lenken nærmest foran hver dato: på en nyhetsliste er det som regel tittelen på saken.
      const datoMonster = /\b\d{1,2}\.\s?(?:\d{1,2}\.|[a-zæøå]+)\s?\d{4}\b/gi;
      const saker = [...tekst.matchAll(datoMonster)].slice(0, 12).map((m) => {
        const foran = tekst.slice(Math.max(0, (m.index ?? 0) - 1500), m.index);
        const lenker = [...foran.matchAll(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
        const siste = lenker.at(-1);
        return siste ? `${m[0]}: «${rensTekst(siste[2] ?? '')}» (${siste[1]})` : `${m[0]}: ingen lenke foran`;
      });
      if (saker.length) ut.push('Lenken foran hver dato:', '', ...saker.map((x) => `- ${x}`), '');
      // HTML-en rundt den første datoen, og tegn på at listen er bygd med JavaScript (data i <script> eller et API).
      const forste = datoMonster.exec(tekst);
      datoMonster.lastIndex = 0;
      if (forste) {
        const utsnitt = tekst
          .slice(Math.max(0, forste.index - 900), forste.index + 600)
          .replace(/<svg[\s\S]*?<\/svg>/gi, '<svg/>')
          .replace(/\s(?:class|style|srcset|sizes|data-[\w-]+)="[^"]*"/gi, '')
          .replace(/\s+/g, ' ');
        ut.push('HTML rundt den første datoen:', '', '```html', utsnitt, '```', '');
      }
      const skript = {
        nextData: tekst.includes('__NEXT_DATA__'),
        json: (tekst.match(/<script[^>]+type="application\/(?:ld\+)?json"/gi) ?? []).length,
        api: [...new Set([...tekst.matchAll(/["'](\/?(?:api|_next\/data|service)\/[^"']{3,120})["']/gi)].map((m) => m[1]))].slice(0, 10),
      };
      ut.push(`Skript: __NEXT_DATA__ ${skript.nextData ? 'ja' : 'nei'}, JSON-blokker ${skript.json}, adresser til API: ${skript.api.length ? skript.api.map((a) => `\`${a}\``).join(', ') : 'ingen'}.`, '');
      if (lenker.length) ut.push(`Lenker med rss/feed/atom: ${lenker.map((l) => `\`${l}\``).join(', ')}`, '');
      ut.push(robots ? `robots.txt (${robots.status}):` : 'robots.txt: ingen svar', '', '```', ...regler, '```', '');
    } catch (e) {
      ut.push(`### ${side}`, '', `Feilet: ${e instanceof Error ? e.message : String(e)}`, '');
    }
  }
  console.log(ut.join('\n'));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) await main();
