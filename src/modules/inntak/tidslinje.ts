// Tidslinjen for inntak (avgjørelse 046): fristene over ett inntaksår, fra oktober til september. De rene funksjonene
// står i core/tidslinje.ts og deles med tidslinjen i Vurdering. Her står månedene og filtrene for inntak.
import type { Frist } from '../../core/innhold/skjema.ts';
import { perManed as perManedI, sorter as sorterI } from '../../core/tidslinje.ts';

export { dag, gjelder, heleAret, kortManed, maned, manedsnavn, manedsoverskrift, nesteFrist, tidspunkt } from '../../core/tidslinje.ts';

/** Inntaksåret starter i oktober, når kommunen melder elever som kan ha fortrinnsrett, og slutter i september. */
export const MANEDER: readonly number[] = [10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/** Filtrene på tidslinjen. `alle` viser alt. De andre er id-er i `grupper` på fristene. */
export const FILTRE = ['alle', 'elever', 'voksne', 'fortrinnsrett'] as const;
export type Filter = (typeof FILTRE)[number];

export function lesFilter(verdi: string | null): Filter {
  return (FILTRE as readonly string[]).includes(verdi ?? '') ? (verdi as Filter) : 'alle';
}

/** Fristene sortert gjennom inntaksåret (se core/tidslinje.ts). */
export const sorter = (frister: readonly Frist[]): Frist[] => sorterI(frister, MANEDER);

/** Alle tolv månedene i inntaksåret, med fristene i hver. */
export const perManed = (frister: readonly Frist[]) => perManedI(frister, MANEDER);
