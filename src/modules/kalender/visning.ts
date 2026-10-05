// Datoene slik kalenderen viser dem (avgjørelse 066): dagen og ukedagen til venstre på tidslinjen, og kortformen på
// forsiden. Rene funksjoner.
import type { Malform } from '../../core/i18n/tekst.ts';
import { kortManed, manedsnavn } from '../../core/tidslinje.ts';

const lokale = (m: Malform) => (m === 'nn' ? 'nn-NO' : 'nb-NO');

const tilDato = (iso: string) => Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));

/** Ukedagen med tre bokstaver, uten punktum («man»). Kortformen i Intl er ulik mellom nettleserne. */
export function ukedagKort(iso: string, malform: Malform): string {
  return new Intl.DateTimeFormat(lokale(malform), { weekday: 'long', timeZone: 'UTC' }).format(tilDato(iso)).slice(0, 3);
}

/** «mandag 5. oktober». */
export function datoLang(iso: string, malform: Malform): string {
  const ukedag = new Intl.DateTimeFormat(lokale(malform), { weekday: 'long', timeZone: 'UTC' }).format(tilDato(iso));
  return `${ukedag} ${Number(iso.slice(8, 10))}. ${manedsnavn(Number(iso.slice(5, 7)), malform)}`;
}

export interface Datocelle {
  /** Stort: «5.», «5.–9.», «1. sep» når posten startet i en tidligere måned. */
  dag: string;
  /** Under: ukedagen («man», «man–fre»), eller null når perioden slutter i en annen måned. */
  ukedag: string | null;
  /** Sluttdatoen når perioden slutter i en annen måned («1. jan»), til «til 1. jan». */
  til: string | null;
}

/**
 * Datoen til venstre på tidslinjen i måneden `maned` (ÅÅÅÅ-MM). En periode over to måneder står som «23.» med «til 1.
 * jan» under. Startet perioden før måneden, står startmåneden med («1. sep»).
 */
export function datocelle(fra: string, til: string | undefined, maned: string, malform: Malform): Datocelle {
  const d = (iso: string) => Number(iso.slice(8, 10));
  const m = (iso: string) => kortManed(Number(iso.slice(5, 7)), malform);
  const dag = fra.slice(0, 7) === maned ? `${d(fra)}.` : `${d(fra)}. ${m(fra)}`;
  if (!til || til === fra) return { dag, ukedag: ukedagKort(fra, malform), til: null };
  if (fra.slice(0, 7) === til.slice(0, 7)) return { dag: `${d(fra)}.–${d(til)}.`, ukedag: `${ukedagKort(fra, malform)}–${ukedagKort(til, malform)}`, til: null };
  return { dag, ukedag: null, til: `${d(til)}. ${m(til)}` };
}

/** «5.–9. okt», «23. des–1. jan», «12. nov», til forsiden. */
export function datoKort(fra: string, til: string | undefined, malform: Malform): string {
  const d = (iso: string) => Number(iso.slice(8, 10));
  const m = (iso: string) => kortManed(Number(iso.slice(5, 7)), malform);
  if (!til || til === fra) return `${d(fra)}. ${m(fra)}`;
  if (fra.slice(0, 7) === til.slice(0, 7)) return `${d(fra)}.–${d(til)}. ${m(til)}`;
  return `${d(fra)}. ${m(fra)}–${d(til)}. ${m(til)}`;
}

/** «Oktober» fra ÅÅÅÅ-MM. */
export function manedTittel(maned: string, malform: Malform): string {
  const navn = manedsnavn(Number(maned.slice(5, 7)), malform);
  return navn.charAt(0).toUpperCase() + navn.slice(1);
}

/** «juli–august». */
export function periodeTekst(fra: number, til: number, malform: Malform): string {
  return `${manedsnavn(fra, malform)}–${manedsnavn(til, malform)}`;
}
