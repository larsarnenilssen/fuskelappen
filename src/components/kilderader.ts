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

const UTVALGET = new Map(
  (lovverk as { dokumenter: { id: string; kapitler?: string[] | null; paragrafer?: string[] | null }[] }).dokumenter.map((d) => [d.id, d] as const),
);

/** Om kapitlet står i listen over kapitler i utvalget, også i et spenn som «5-21». */
function kapittelIListen(kapittel: string, kapitler: readonly string[]): boolean {
  return kapitler.some((k) => {
    const spenn = /^(\d+)-(\d+)$/.exec(k);
    return spenn ? /^\d+$/.test(kapittel) && Number(kapittel) >= Number(spenn[1]) && Number(kapittel) <= Number(spenn[2]) : k === kapittel;
  });
}

/**
 * Om en paragraf som et kort oppgir selv («straffeloven/196») eller som står i kildene, kan vises under «I regelverket».
 * Et dokument som er nytt i Lov og forskrift og ikke hentet ennå, vises ikke, så lenken ikke går til en side som mangler.
 * Det gjør heller ikke en paragraf utenfor utvalget i content/lovverk.yaml: kapitlet går fram av nummeret («6-2» står i
 * kapittel 6). Nummer uten kapittel («17» i forvaltningsloven) regnes som med. Andre referanser (f.eks. avtalene) står
 * som før. Et kapittel som er nytt i utvalget, men ikke hentet ennå, tas bort av `Paragraflenker`.
 */
export function kanVisesIRegelverket(ref: string): boolean {
  const i = ref.indexOf('/');
  const dokument = ref.slice(0, Math.max(0, i));
  const utvalg = UTVALGET.get(dokument);
  if (!utvalg) return true;
  if (!HENTET.has(dokument)) return false;
  const nr = ref.slice(i + 1);
  if (utvalg.paragrafer) return utvalg.paragrafer.includes(nr);
  const kapittel = /^(\d+[A-Z]?)-/.exec(nr)?.[1];
  return !utvalg.kapitler || !kapittel || kapittelIListen(kapittel, utvalg.kapitler);
}
