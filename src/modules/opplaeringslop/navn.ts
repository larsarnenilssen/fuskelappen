// Navn fra rundskrivet (Udir-1) i appen: linjenavnene på valgt målform og kolonnene for tilpassede ordninger skrevet
// ut (eier 02.10.2026). Ukjente navn vises som i rundskrivet, så ingenting går i stykker når rundskrivet endres.
// `ukjenteNavn` finner dem, og kildesjekken melder dem i kontrollsaken.
import { LINJENAVN } from '../../strings/linjenavn.ts';
import type { Tilbudsdel, Tilpasning } from '../fag/tilbud/modell.ts';

/** Linjenavnet på målformen. `kilde` er sann når navnet ikke er oversatt og vises som i rundskrivet. */
export function linjenavn(linje: string, malform: 'nb' | 'nn'): { tekst: string; kilde: boolean } {
  const navn = LINJENAVN[linje];
  if (!navn) return { tekst: linje, kilde: true };
  return { tekst: (malform === 'nn' ? navn.nn : navn.nb) ?? linje, kilde: false };
}

export type Ordning = 'samisk' | 'tegnsprak' | 'medStudiespesialisering' | 'utenFremmedsprak';

/** Kolonnenavnene i rundskrivet er forkortet («Med stud.spes vg1», «Uten fr.språk gr.sk»). */
const ORDNINGER: readonly [RegExp, Ordning][] = [
  [/^samisk$/i, 'samisk'],
  [/tegnspr/i, 'tegnsprak'],
  [/^med stud\.?\s*spes/i, 'medStudiespesialisering'],
  [/^uten fr\.?\s*språk/i, 'utenFremmedsprak'],
];

/** Den tilpassede ordningen kolonnen gjelder, eller null når kolonnenavnet ikke er kjent. */
export const ordning = (navn: string): Ordning | null => ORDNINGER.find(([m]) => m.test(navn))?.[1] ?? null;

/** Linjenavn og kolonnenavn i tilbudene som appen ikke kjenner, og som derfor vises som i rundskrivet. */
export function ukjenteNavn(tilbud: readonly { deler: readonly Tilbudsdel[]; tilpasninger: readonly Tilpasning[] }[]): { linjer: string[]; ordninger: string[] } {
  const linjer = new Set<string>();
  const ordninger = new Set<string>();
  for (const t of tilbud) {
    for (const d of t.deler) if (!LINJENAVN[d.linje]) linjer.add(d.linje);
    for (const p of t.tilpasninger) {
      if (!ordning(p.navn)) ordninger.add(p.navn);
      for (const l of p.linjer) if (!LINJENAVN[l.linje]) linjer.add(l.linje);
    }
  }
  return { linjer: [...linjer].sort(), ordninger: [...ordninger].sort() };
}
