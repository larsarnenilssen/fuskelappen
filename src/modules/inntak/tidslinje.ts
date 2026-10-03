// Tidslinjen for inntak (avgjørelse 046): fristene over ett inntaksår, fra oktober til september. Rene funksjoner.
import type { Malform } from '../../core/i18n/tekst.ts';
import type { Frist } from '../../core/innhold/skjema.ts';

/** Inntaksåret starter i oktober, når kommunen melder elever som kan ha fortrinnsrett, og slutter i september. */
export const MANEDER: readonly number[] = [10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/** Filtrene på tidslinjen. `alle` viser alt. De andre er id-er i `grupper` på fristene. */
export const FILTRE = ['alle', 'ungdom', 'voksne', 'fortrinn'] as const;
export type Filter = (typeof FILTRE)[number];

export function lesFilter(verdi: string | null): Filter {
  return (FILTRE as readonly string[]).includes(verdi ?? '') ? (verdi as Filter) : 'alle';
}

/** Gjelder fristen hele året, f.eks. søknad fra voksne? Slike frister står over månedene, ikke i én måned. */
export function heleAret(f: Frist): boolean {
  return f.regel?.type === 'lopende';
}

/** Måneden fristen står i, eller null når den gjelder hele året. Frister med en fast dato står i måneden for datoen. */
export function maned(f: Frist): number | null {
  if (f.regel) return f.regel.type === 'lopende' ? null : f.regel.maned;
  return Number((f.dato ?? '0000-01').slice(5, 7));
}

/** Dagen i måneden, eller null når fristen ikke har en fast dag. */
export function dag(f: Frist): number | null {
  if (f.regel) return f.regel.type === 'arlig' ? f.regel.dag : null;
  return f.dato ? Number(f.dato.slice(8, 10)) : null;
}

/** En frist gjelder et filter når den har gruppen, eller når den ikke har noen grupper (gjelder alle). */
export function gjelder(f: Frist, filter: Filter): boolean {
  return filter === 'alle' || f.grupper.length === 0 || f.grupper.includes(filter);
}

/**
 * Fristene sortert gjennom inntaksåret: etter måned (fra oktober) og dag. Frister uten fast dag står sist i måneden, i
 * rekkefølgen de står i innholdet. Frister som gjelder hele året, står først. Samme dag står nasjonale frister først.
 */
export function sorter(frister: readonly Frist[]): Frist[] {
  // Samme dag: nasjonale frister før fylkets og skolens.
  const plass = (f: Frist) => {
    const m = maned(f);
    const lokal = f.gyldighet.niva === 'nasjonal' ? 0 : 0.5;
    return m === null ? -1 : MANEDER.indexOf(m) * 100 + (dag(f) ?? 99) + lokal;
  };
  return frister
    .map((f, i) => ({ f, i }))
    .sort((a, b) => plass(a.f) - plass(b.f) || a.i - b.i)
    .map(({ f }) => f);
}

/** Alle tolv månedene i inntaksåret, med fristene i hver. */
export function perManed(frister: readonly Frist[]): { maned: number; frister: Frist[] }[] {
  const sortert = sorter(frister);
  return MANEDER.map((m) => ({ maned: m, frister: sortert.filter((f) => maned(f) === m) }));
}

/** «1. februar» for en fast dag, ellers tidspunktet med ord, ellers navnet på måneden. */
export function tidspunkt(f: Frist, malform: Malform): string {
  const m = maned(f);
  const d = dag(f);
  if (f.naar) return f.naar[malform];
  if (m === null) return '';
  return d !== null ? `${d}. ${manedsnavn(m, malform)}` : manedsnavn(m, malform);
}

/** Navnet på måneden som overskrift («Februar»). */
export function manedsoverskrift(m: number, malform: Malform): string {
  const navn = manedsnavn(m, malform);
  return navn.charAt(0).toUpperCase() + navn.slice(1);
}

/** Navnet på måneden, med Intl («februar»). */
export function manedsnavn(m: number, malform: Malform): string {
  return new Intl.DateTimeFormat(malform === 'nn' ? 'nn-NO' : 'nb-NO', { month: 'long', timeZone: 'UTC' }).format(Date.UTC(2026, m - 1, 15));
}

/** De tre første bokstavene i måneden («feb»), til stripen over året. Kortformen i Intl er ulik mellom nettleserne. */
export function kortManed(m: number, malform: Malform): string {
  return manedsnavn(m, malform).slice(0, 3);
}

/**
 * Den neste fristen fra en dato (ÅÅÅÅ-MM-DD), gjennom året og rundt nyttår. Frister uten fast dag regnes fra den
 * 1. i måneden. Frister som gjelder hele året, er ikke med.
 */
export function nesteFrist(frister: readonly Frist[], idag: string): Frist | null {
  const m = Number(idag.slice(5, 7));
  const d = Number(idag.slice(8, 10));
  const avstand = (f: Frist) => {
    const fm = maned(f) ?? m;
    const fd = dag(f) ?? 1;
    const dager = (fm - m) * 31 + (fd - d);
    return dager >= 0 ? dager : dager + 12 * 31;
  };
  return [...frister].filter((f) => !heleAret(f)).sort((a, b) => avstand(a) - avstand(b))[0] ?? null;
}
