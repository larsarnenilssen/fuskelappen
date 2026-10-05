// Reglene for lenkesjekken (avgjørelse 062, eier 05.10.2026): alle lenker i appen sjekkes, også dem som kommer til
// senere, uten at noen må føre dem inn et sted.
// - Lenker som står i innholdet (content/), i koden (src/) og i kilderegisteret, finnes automatisk og sjekkes hver gang.
// - Lenker i genererte data (data/) sjekkes hver gang eller med stikkprøver, etter filen de står i (DATAFILER).
// - Lenker koden bygger av data (f.eks. en lenke til hver læreplan), lages av lenkebyggerne under og sjekkes med
//   stikkprøver.
// tests/unit/lenkesjekk.test.ts feiler når en ny datafil med lenker eller en ny kodefil som bygger lenker ikke står
// her. Da må det avgjøres om lenkene skal sjekkes hver gang eller med stikkprøver.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { kontrollenker } from '../../src/modules/fag/tilbud/vilbli.ts';
import { udirLenke } from '../../src/modules/fag/oppslag.ts';
import type { Fagindeks } from '../../src/modules/fag/skjema.ts';

export type Lenketype = 'fast' | 'stikkprove';

/** Datafilene med lenker, og hvordan lenkene i dem sjekkes. Første regel som passer, gjelder. */
export const DATAFILER: readonly { fil: RegExp; type: Lenketype; grunn: string }[] = [
  { fil: /^data\/utdanning\/skoler\.json$/, type: 'stikkprove', grunn: 'Nettsidene til om lag 400 skoler fra utdanning.no.' },
  { fil: /^data\/udir\/opplaeringskontor\.json$/, type: 'stikkprove', grunn: 'Nettsidene til om lag 200 opplæringskontor fra NOR.' },
  { fil: /^data\/udir\/overordnet-del\.json$/, type: 'fast', grunn: 'Kildene til overordnet del på udir.no.' },
  { fil: /^data\/udir\/fagfordeling-.*\.json$/, type: 'fast', grunn: 'Kildene til fag- og timefordelingen.' },
  { fil: /^data\/eksamen\/datoer\.json$/, type: 'fast', grunn: 'Sidene eksamensdatoene er hentet fra.' },
  { fil: /^data\/inntak\/datoer\.json$/, type: 'fast', grunn: 'Fylkenes sider inntaksdatoene er hentet fra.' },
];

/** Lenker som ikke sjekkes: adresser i eksempler og maler. */
export const IKKE_SJEKK: readonly RegExp[] = [/^https?:\/\/(www\.)?example\./, /^https?:\/\/localhost/];

const lesJson = <T>(rot: string, fil: string): T | null => (existsSync(join(rot, fil)) ? (JSON.parse(readFileSync(join(rot, fil), 'utf8')) as T) : null);

/** Alle «l»-lenkene i teksten til dokumentene fra Lovdata (adresser hos Lovdata, f.eks. «lov/2023-06-09-30/§11-1»). */
function lovdatalenker(rot: string): string[] {
  const mappe = join(rot, 'data/lovdata');
  if (!existsSync(mappe)) return [];
  const ut = new Set<string>();
  for (const f of readdirSync(mappe)) {
    if (!f.endsWith('.json') || ['oversikt.json', 'lokale.json', 'kommende.json'].includes(f)) continue;
    for (const m of readFileSync(join(mappe, f), 'utf8').matchAll(/"l":\s*"([^"]+)"/g)) ut.add(`https://lovdata.no/${m[1]}`);
  }
  return [...ut];
}

export interface Lenkebygger {
  /** Kodefilen som bygger lenkene. */
  fil: string;
  navn: string;
  /** Lenkene koden kan bygge, laget av de samme dataene som appen bruker. */
  lenker: (rot: string) => string[];
}

/** Kodefilene som bygger lenker av data, og lenkene de kan bygge. Sjekkes med stikkprøver. */
export const LENKEBYGGERE: readonly Lenkebygger[] = [
  {
    fil: 'src/modules/lov/data.ts',
    navn: 'Dokumentene hos Lovdata',
    lenker: (rot) => (lesJson<{ dokumenter: { refid: string }[] }>(rot, 'data/lovdata/oversikt.json')?.dokumenter ?? []).map((d) => `https://lovdata.no/${d.refid}`),
  },
  { fil: 'src/modules/lov/sider/felles.tsx', navn: 'Lenkene i lov- og forskriftsteksten', lenker: lovdatalenker },
  {
    fil: 'src/modules/fag/tilbud/vilbli.ts',
    navn: 'Vilbli',
    lenker: (rot) => {
      const indeks = lesJson<Fagindeks>(rot, 'data/grep/fagindeks.json');
      return indeks ? kontrollenker(indeks).map((l) => l.url) : [];
    },
  },
  {
    fil: 'src/modules/fag/oppslag.ts',
    navn: 'Læreplanene på udir.no',
    lenker: (rot) => [...new Set(Object.values(lesJson<Fagindeks>(rot, 'data/grep/fagindeks.json')?.fag ?? {}).flatMap((f) => (f.lp ? [udirLenke(f.lp)] : [])))],
  },
  {
    fil: 'src/modules/opplaeringslop/sider/Kontor.tsx',
    navn: 'Lærebedriftene på utdanning.no',
    lenker: (rot) => (lesJson<{ kontor: { orgnr: string }[] }>(rot, 'data/udir/opplaeringskontor.json')?.kontor ?? []).map((k) => `https://utdanning.no/finnlarebedrift/bedrift/${k.orgnr}/`),
  },
  {
    fil: 'src/modules/fag/sider/Fag.tsx',
    navn: 'Fagene på NDLA',
    lenker: (rot) => Object.values(lesJson<{ fag: Record<string, { sti: string }[]> }>(rot, 'data/ndla/fag.json')?.fag ?? {}).flatMap((l) => l.map((f) => `https://ndla.no${f.sti}`)),
  },
  {
    fil: 'src/modules/opplaeringslop/sider/Tilbud.tsx',
    navn: 'Utdanningene og yrkene på utdanning.no',
    lenker: (rot) => {
      const y = lesJson<{ programomrader: Record<string, { sti: string; yrker: { sti: string }[] }> }>(rot, 'data/utdanning/yrker.json')?.programomrader ?? {};
      return [...new Set(Object.values(y).flatMap((p) => [`https://utdanning.no${p.sti}`, ...p.yrker.map((x) => `https://utdanning.no${x.sti}`)]))];
    },
  },
];
