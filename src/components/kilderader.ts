// Regelverket og kildene nederst i kort og bokser (Kortfot, avgjørelse 071): paragrafene til «I regelverket» hentes
// fra kildene når kortet ikke oppgir dem selv, og hver kilde står én gang. Rene funksjoner.
import lovverk from '../../content/lovverk.yaml';
import type { KildeRef } from '../core/innhold/skjema.ts';

/**
 * Lovene og forskriftene som står i Lov og forskrift (content/lovverk.yaml) og er hentet (data/lovdata/). Et dokument
 * som er nytt i utvalget, får «I regelverket» når kildesjekken har hentet teksten. Til da lenker kilden til Lovdata.
 */
const HENTET = new Set(Object.keys(import.meta.glob('../../data/lovdata/*.json')).map((f) => f.replace(/^.*\/(.+)\.json$/, '$1')));
const LOVDOKUMENTER = new Set((lovverk as { dokumenter: { id: string }[] }).dokumenter.map((d) => d.id).filter((id) => HENTET.has(id)));

/**
 * Paragrafene i kildene: «§ 5-1 andre ledd» i opplæringslova blir `opplaeringslova/5-1`. Bare dokumenter som står i
 * Lov og forskrift, og hver paragraf én gang.
 */
export function paragraferFra(kilder: readonly KildeRef[]): string[] {
  const ut: string[] = [];
  for (const k of kilder) {
    if (!LOVDOKUMENTER.has(k.id)) continue;
    // Kapitler med bokstav og paragrafer med bokstav: «§ 5A-7» og «§ 2-3 a» i privatskolelova.
    for (const m of (k.punkt ?? '').matchAll(/§\s*(\d+[A-Z]?-\d+(?:\s?[a-z](?![a-zæøå]))?)/g)) {
      const ref = `${k.id}/${(m[1] ?? '').replace(/\s/g, '')}`;
      if (!ut.includes(ref)) ut.push(ref);
    }
  }
  return ut;
}

/** Kildene uten dubletter (samme kilde og punkt), i rekkefølgen de står. */
export function unikeKilder(kilder: readonly KildeRef[]): KildeRef[] {
  const sett = new Set<string>();
  return kilder.filter((k) => {
    const n = `${k.id}|${k.punkt ?? ''}`;
    if (sett.has(n)) return false;
    sett.add(n);
    return true;
  });
}

/** Om teksten til et dokument i Lov og forskrift er hentet, så paragrafene kan åpnes i appen. */
export const erHentet = (dokument: string): boolean => LOVDOKUMENTER.has(dokument);
