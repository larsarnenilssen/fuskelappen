// Bekrefter lenkene til fylkenes temasider (content/fylker/lenker.yaml, avgjørelse 106): henter hver lenke som ikke
// er bekreftet de siste fire ukene, leser tittelen og den første overskriften, og setter `bekreftet` til dagens dato når
// siden svarer 200 med en tittel som passer temaet. Svarer en adresse ikke, prøves samme adresse med www lagt til
// eller tatt bort (annenVariant i sjekk.ts). Virker bare den andre varianten, byttes adressen, og det står i rapporten.
// Det som ikke kan bekreftes, skrives ut og til .generert/fylkeslenker.json. Lenker som ikke er bekreftet på åtte uker, kommer i kontrollsaken (ukesrapport.ts). Kjøres hver uke av kildesjekken.
// Av hensyn til nettstedene: én forespørsel om gangen per vert, med pause imellom, og den ærlige USER_AGENT.
// Bruk: npm run lenker:fylker [-- --alle] (--alle sjekker alle lenkene, også de som er bekreftet nylig)
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Fylkeslenker } from '../../src/core/innhold/skjema.ts';
import { lesFil } from '../innhold/last.ts';
import { feilmelding, USER_AGENT } from '../kilder/metoder.ts';
import { annenVariant } from './sjekk.ts';
import { alleLenker, type Fylkeslenke, type Lenkesvar, settFylkeslenke, skalSjekkes, type Vurdering, vurderLenke } from './fylkeslenker.ts';

const rot = fileURLToPath(new URL('../..', import.meta.url));
const fil = join(rot, 'content/fylker/lenker.yaml');
const alle = process.argv.includes('--alle');
const TIDSGRENSE_MS = 30_000;
const FORSOK = 3;
const PAUSE_FORSOK_MS = [5_000, 15_000];
const PAUSE_VERT_MS = 2_000;
/** Etter så lang tid startes ingen nye sjekker, så steget i kildesjekken blir ferdig og lagrer det som er gjort. */
const FRIST_MS = 12 * 60_000;

const idag = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Oslo' });
const vent = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function hent(url: string): Promise<Lenkesvar> {
  try {
    const svar = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,*/*;q=0.8' }, redirect: 'follow', signal: AbortSignal.timeout(TIDSGRENSE_MS) });
    const html = await svar.text();
    return { status: svar.status, til: svar.url && svar.url !== url ? svar.url : null, html, melding: null };
  } catch (e) {
    return { status: null, til: null, html: null, melding: feilmelding(e) };
  }
}

/** Henter med nye forsøk når siden ikke svarer eller svarer med en feil på serveren (5xx, 429). */
async function hentMedForsok(url: string): Promise<Lenkesvar> {
  let svar = await hent(url);
  for (let i = 1; i < FORSOK && (svar.status === null || svar.status >= 500 || svar.status === 429); i++) {
    await vent(PAUSE_FORSOK_MS[i - 1] ?? 15_000);
    svar = await hent(url);
  }
  return svar;
}

interface Utfall {
  lenke: Fylkeslenke;
  vurdering: Vurdering;
  /** Ny adresse når bare den andre varianten av vertsnavnet (med eller uten www) virket. */
  nyUrl: string | null;
}

async function sjekk(l: Fylkeslenke): Promise<Utfall> {
  const svar = await hentMedForsok(l.url);
  const vurdering = vurderLenke(l.url, l.tema, svar);
  if (!vurdering.ok && svar.status === null) {
    // Feil på tilkoblingen eller DNS: prøv samme adresse med www lagt til eller tatt bort. En videresending mellom
    // variantene regnes som samme side (vurderSvar). Virker bare den andre varianten, byttes adressen.
    const annen = annenVariant(l.url);
    if (annen) {
      const v = vurderLenke(l.url, l.tema, await hentMedForsok(annen));
      if (v.ok) return { lenke: l, vurdering: v, nyUrl: annen };
    }
  }
  return { lenke: l, vurdering, nyUrl: null };
}

const register = lesFil(rot, fil) as Fylkeslenker;
const lenker = alleLenker(register);
const utvalg = alle ? lenker : skalSjekkes(lenker, idag);
const perVert = new Map<string, Fylkeslenke[]>();
for (const l of utvalg) {
  const vert = new URL(l.url).hostname.replace(/^www\./, '');
  perVert.set(vert, [...(perVert.get(vert) ?? []), l]);
}

const start = Date.now();
const utfall: Utfall[] = [];
const ikkeSjekket: Fylkeslenke[] = [];
// Vertene parallelt, lenkene til samme vert etter hverandre med pause.
await Promise.all(
  [...perVert.values()].map(async (ko) => {
    for (const [i, l] of ko.entries()) {
      if (Date.now() - start > FRIST_MS) {
        ikkeSjekket.push(l);
        continue;
      }
      const u = await sjekk(l);
      utfall.push(u);
      console.log(`${u.vurdering.ok ? 'OK ' : 'NEI'} ${l.navn} ${l.tema}: ${u.vurdering.ok ? u.vurdering.tekst : u.vurdering.arsak}${u.nyUrl ? ` (ny adresse ${u.nyUrl})` : ''}`);
      if (i < ko.length - 1) await vent(PAUSE_VERT_MS);
    }
  }),
);

let yaml = readFileSync(fil, 'utf8');
for (const u of utfall) {
  if (!u.vurdering.ok) continue;
  const ny = settFylkeslenke(yaml, u.lenke.fylke, u.lenke.tema, { bekreftet: idag, ...(u.nyUrl ? { url: u.nyUrl } : {}) });
  if (ny === null) throw new Error(`Fant ikke linjen for ${u.lenke.fylke} ${u.lenke.tema} i content/fylker/lenker.yaml.`);
  yaml = ny;
}
writeFileSync(fil, yaml);

const ok = utfall.filter((u) => u.vurdering.ok);
const feil = utfall.filter((u) => !u.vurdering.ok);
mkdirSync(join(rot, '.generert'), { recursive: true });
writeFileSync(
  join(rot, '.generert/fylkeslenker.json'),
  `${JSON.stringify(
    {
      sjekket: idag,
      bekreftet: ok.map((u) => ({ fylke: u.lenke.fylke, tema: u.lenke.tema, url: u.nyUrl ?? u.lenke.url })),
      ikkeBekreftet: feil.map((u) => ({ fylke: u.lenke.fylke, navn: u.lenke.navn, tema: u.lenke.tema, url: u.lenke.url, arsak: u.vurdering.ok ? '' : u.vurdering.arsak })),
      ikkeSjekket: ikkeSjekket.map((l) => ({ fylke: l.fylke, tema: l.tema, url: l.url })),
    },
    null,
    1,
  )}\n`,
);

const sammendrag = [
  `Fylkeslenker: ${utvalg.length} av ${lenker.length} sjekket på ${Math.round((Date.now() - start) / 1000)} s. Bekreftet ${ok.length}, ikke bekreftet ${feil.length}${ikkeSjekket.length > 0 ? `, ikke rukket ${ikkeSjekket.length}` : ''}.`,
  ...(ok.some((u) => u.nyUrl) ? ['', 'Ny adresse (med eller uten www):', ...ok.filter((u) => u.nyUrl).map((u) => `- ${u.lenke.navn}, ${u.lenke.tema}: ${u.nyUrl}`)] : []),
  ...(feil.length > 0 ? ['', 'Ikke bekreftet:', ...feil.map((u) => `- ${u.lenke.navn}, ${u.lenke.tema}: ${u.vurdering.ok ? '' : u.vurdering.arsak} (${u.lenke.url})`)] : []),
].join('\n');
console.log(`\n${sammendrag}`);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `\n## Lenkene til fylkene\n\n${sammendrag}\n`);
