// Setter eksamensdatoene inn i fristene på tidslinjen (fase 6, pakke 3, avgjørelse 059). Rene funksjoner.
// En frist med `eksamensdato` får datoen fra perioden som har datoen i skoleåret (august–juli). Fylkenes egne datoer
// vises bare for fylket brukeren har valgt, og merkes med fylket. Uten data står fristen med måneden og `naar`.
import type { Frist } from '../../../core/innhold/skjema.ts';
import type { Tidslinjefrist } from '../../../core/tidslinje.ts';
import type { Eksamensdato, Eksamensdatoer } from './skjema.ts';

/** Skoleåret fra august til juli, som tidslinjen viser. */
export const MANEDER_SKOLEAR: readonly number[] = [8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7];

/** Filtrene på tidslinjen. `alle` viser alt. De andre er id-er i `grupper` på fristene. */
export const FILTRE = ['alle', 'elever', 'privatister', 'laerlinger'] as const;
export type Filter = (typeof FILTRE)[number];

export function lesFilter(verdi: string | null): Filter {
  return (FILTRE as readonly string[]).includes(verdi ?? '') ? (verdi as Filter) : 'alle';
}

/** Datoen for feltet i perioden (høst eller vår) som ligger i skoleåret som starter i august `skolear`. */
export function finnDato(perioder: Eksamensdatoer['nasjonal'] | undefined, periode: 'host' | 'var', felt: string, skolear: number): Eksamensdato | null {
  if (!perioder) return null;
  const fra = `${skolear}-08-01`;
  const til = `${skolear + 1}-07-31`;
  for (const [id, felter] of Object.entries(perioder)) {
    if (!id.startsWith(`${periode}-`)) continue;
    const d = felter[felt];
    const dato = d?.fra ?? d?.til;
    if (d && dato && dato >= fra && dato <= til) return d;
  }
  return null;
}

/**
 * Fristene med datoene fra eksamensdatoene for skoleåret. Fristene uten `eksamensdato` er uendret. `fylke` er fylket
 * brukeren har valgt.
 */
export function medEksamensdatoer(frister: readonly Frist[], data: Eksamensdatoer | null, skolear: number, fylke: string | null): Tidslinjefrist[] {
  return frister.map((f) => {
    const e = f.eksamensdato;
    if (!e || !data) return f;
    const perioder = e.fylke ? (fylke ? data.fylker[fylke] : undefined) : data.nasjonal;
    const d = finnDato(perioder, e.periode, e.felt, skolear);
    if (!d) return f;
    const dato = (d.fra ?? d.til) as string;
    const kilder = d.kilder.flatMap((id) => {
      const k = data.kilder[id];
      return k ? [{ id: 'eksamensdatoer', punkt: k.navn, url: k.url }] : [];
    });
    // Datoen erstatter måneden fra regelen.
    const uten: Frist = { ...f };
    delete uten.regel;
    return {
      ...uten,
      dato,
      ...(d.fra && d.til && d.til !== d.fra ? { til: d.til } : {}),
      ...(d.kl ? { kl: d.kl } : {}),
      aar: true,
      kilder: [...f.kilder, ...kilder],
      ...(e.fylke && fylke ? { gyldighet: { niva: 'fylke' as const, fylke, forhold: 'supplerer' as const } } : {}),
    };
  });
}
