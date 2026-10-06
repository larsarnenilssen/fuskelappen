// Regelverket og kildene nederst i kort og bokser (Kortfot, avgjørelse 071): paragrafene til «I regelverket» hentes
// fra kildene når kortet ikke oppgir dem selv, og hver kilde står én gang. Rene funksjoner.
import lovverk from '../../content/lovverk.yaml';
import type { KildeRef } from '../core/innhold/skjema.ts';

/** Lovene og forskriftene som står i Lov og forskrift (content/lovverk.yaml). */
const LOVDOKUMENTER = new Set((lovverk as { dokumenter: { id: string }[] }).dokumenter.map((d) => d.id));

/**
 * Paragrafene i kildene: «§ 5-1 andre ledd» i opplæringslova blir `opplaeringslova/5-1`. Bare dokumenter som står i
 * Lov og forskrift, og hver paragraf én gang.
 */
export function paragraferFra(kilder: readonly KildeRef[]): string[] {
  const ut: string[] = [];
  for (const k of kilder) {
    if (!LOVDOKUMENTER.has(k.id)) continue;
    for (const m of (k.punkt ?? '').matchAll(/§\s*(\d+-\d+[a-z]?)/g)) {
      const ref = `${k.id}/${m[1] ?? ''}`;
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
