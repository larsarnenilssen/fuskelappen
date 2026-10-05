// Leser skoleruta i fylkenes lokale forskrifter (data/lovdata/*.json med lokaltype skolerute, avgjørelse 061) til
// data/skolerute/skolerute.json, som kalenderen bruker (fase 6, pakke 5). Kjøres hver uke av kildesjekken, etter
// npm run hent:lovdata. Skriptet leser bare filene i repoet og gjør ingen forespørsler.
//
// - Tolkningen står i scripts/skolerute/tolk.ts og er testet i tests/unit/skolerute.test.ts.
// - Det som ikke kan leses sikkert, står i `ulest` i filen og skrives ut her. Nye uleste rader står i
//   .generert/skolerute-endringer.json, som kildesjekken tar med i kontrollsaken (som eksamensdatoene).
// - Filen skrives bare når innholdet er endret (uten datoen for lesingen).
//
// Bruk: npm run hent:skolerute
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type Lovdokument, lovdokumentSkjema, lovoversiktSkjema } from '../src/modules/lov/skjema.ts';
import { skrivEndringer } from './data/hent.ts';
import { lagSkoleruter, type Skoleruter, type Ulest } from './skolerute/tolk.ts';

const rot = fileURLToPath(new URL('..', import.meta.url));
const FIL = join(rot, 'data/skolerute/skolerute.json');

const ulestLinje = (u: Ulest) => `${u.dokument} (${u.skolear || 'ukjent skoleår'}): «${u.tekst}» – ${u.grunn}`;

/** Endringene fra forrige fil: nye og borte hendelser, og nye uleste rader. */
export function sammenlignSkoleruter(forrige: Skoleruter | null, ny: Skoleruter): { endringer: string[]; nyeUlest: string[] } {
  const hendelser = (s: Skoleruter | null) =>
    new Set(Object.entries(s?.fylker ?? {}).flatMap(([f, x]) => x.hendelser.map((h) => `fylke ${f}, ${h.dokument}: ${h.type} ${h.fra}${h.til ? `–${h.til}` : ''}`)));
  const a = hendelser(forrige);
  const b = hendelser(ny);
  const forrigeUlest = new Set((forrige?.ulest ?? []).map(ulestLinje));
  return {
    endringer: [...[...b].filter((x) => !a.has(x)).map((x) => `Ny: ${x}`), ...[...a].filter((x) => !b.has(x)).map((x) => `Borte: ${x}`)],
    nyeUlest: ny.ulest.map(ulestLinje).filter((l) => !forrigeUlest.has(l)),
  };
}

/** JSON med én linje per hendelse, så endringer er lette å lese i git. */
export function skoleruteJson(s: Skoleruter): string {
  const fylker = Object.entries(s.fylker).map(
    ([nr, f]) =>
      `  ${JSON.stringify(nr)}: {\n   "dokumenter": [\n${f.dokumenter.map((d) => `    ${JSON.stringify(d)}`).join(',\n')}\n   ],\n   "hendelser": [\n${f.hendelser.map((h) => `    ${JSON.stringify(h)}`).join(',\n')}\n   ]\n  }`,
  );
  const ulest = s.ulest.map((u) => `  ${JSON.stringify(u)}`);
  return `{\n "lest": ${JSON.stringify(s.lest)},\n "fylker": {\n${fylker.join(',\n')}\n },\n "ulest": [${ulest.length > 0 ? `\n${ulest.join(',\n')}\n ` : ''}]\n}\n`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const idag = new Date().toISOString().slice(0, 10);
  const oversikt = lovoversiktSkjema.parse(JSON.parse(readFileSync(join(rot, 'data/lovdata/oversikt.json'), 'utf8')));
  const dokumenter: Lovdokument[] = oversikt.dokumenter
    .filter((d) => d.lokaltype === 'skolerute')
    .map((d) => lovdokumentSkjema.parse(JSON.parse(readFileSync(join(rot, 'data/lovdata', `${d.id}.json`), 'utf8'))));
  const forrige = existsSync(FIL) ? (JSON.parse(readFileSync(FIL, 'utf8')) as Skoleruter) : null;
  const ny = lagSkoleruter(dokumenter, idag);
  const uendret = forrige !== null && skoleruteJson({ ...forrige, lest: '' }) === skoleruteJson({ ...ny, lest: '' });
  if (!uendret) {
    mkdirSync(dirname(FIL), { recursive: true });
    writeFileSync(FIL, skoleruteJson(ny));
  }
  const { endringer, nyeUlest } = sammenlignSkoleruter(forrige, ny);
  skrivEndringer(rot, 'skolerute', { endret: !uendret, forste: !forrige, endringer, ulest: ny.ulest.map(ulestLinje), nyeUlest, feil: null });
  const antall = Object.values(ny.fylker).reduce((n, f) => n + f.hendelser.length, 0);
  console.log(`Skolerute: ${dokumenter.length} forskrifter, ${Object.keys(ny.fylker).length} fylker, ${antall} hendelser, ${ny.ulest.length} uleste.`);
  for (const l of ny.ulest.map(ulestLinje)) console.log(`Ulest: ${l}`);
}
