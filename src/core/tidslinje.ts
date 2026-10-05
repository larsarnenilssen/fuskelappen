// Tidslinjer med frister gjennom året (avgjørelse 046): inntaksåret i Inntak (oktober–september) og skoleåret i
// Vurdering (august–juli, fase 6, pakke 3). Rene funksjoner. Månedene i året sendes inn, så samme kode brukes for begge.
import type { Malform } from './i18n/tekst.ts';
import type { Frist } from './innhold/skjema.ts';

/**
 * En frist på tidslinjen. Frister med en dato fra dataene (f.eks. eksamensdatoene, avgjørelse 059) har `dato`, og
 * kan ha en sluttdato (`til`) og et klokkeslett (`kl`, «09.00»). `aar` sier at datoen er for ett bestemt år, så året
 * vises.
 */
export type Tidslinjefrist = Frist & { til?: string; kl?: string; aar?: boolean };

/** Gjelder fristen hele året, f.eks. søknad fra voksne? Slike frister står over månedene, ikke i én måned. */
export function heleAret(f: Frist): boolean {
  return f.regel?.type === 'lopende' && !f.dato;
}

/** Måneden fristen står i, eller null når den gjelder hele året. Frister med en dato står i måneden for datoen. */
export function maned(f: Frist): number | null {
  if (f.dato) return Number(f.dato.slice(5, 7));
  if (f.regel) return f.regel.type === 'lopende' ? null : f.regel.type === 'perioden' ? f.regel.fra : f.regel.maned;
  return null;
}

/** Dagen i måneden, eller null når fristen ikke har en fast dag. */
export function dag(f: Frist): number | null {
  if (f.dato) return Number(f.dato.slice(8, 10));
  return f.regel?.type === 'arlig' ? f.regel.dag : null;
}

/** En frist gjelder et filter når den har gruppen, eller når den ikke har noen grupper (gjelder alle). */
export function gjelder(f: Frist, filter: string): boolean {
  return filter === 'alle' || f.grupper.length === 0 || (f.grupper as readonly string[]).includes(filter);
}

/**
 * Fristene sortert gjennom året som starter med den første av `maneder`: etter måned og dag. Frister uten fast dag
 * står sist i måneden, i rekkefølgen de står i innholdet. Frister som gjelder hele året, står først. Samme dag står
 * nasjonale frister først.
 */
export function sorter<F extends Frist>(frister: readonly F[], maneder: readonly number[]): F[] {
  const plass = (f: F) => {
    const m = maned(f);
    const lokal = f.gyldighet.niva === 'nasjonal' ? 0 : 0.5;
    return m === null ? -1 : maneder.indexOf(m) * 100 + (dag(f) ?? 99) + lokal;
  };
  return frister
    .map((f, i) => ({ f, i }))
    .sort((a, b) => plass(a.f) - plass(b.f) || a.i - b.i)
    .map(({ f }) => f);
}

/** Alle månedene i året, med fristene i hver. */
export function perManed<F extends Frist>(frister: readonly F[], maneder: readonly number[]): { maned: number; frister: F[] }[] {
  const sortert = sorter(frister, maneder);
  return maneder.map((m) => ({ maned: m, frister: sortert.filter((f) => maned(f) === m) }));
}

/** «12. november 2026», med eller uten året. */
function datoTekst(iso: string, malform: Malform, medAar: boolean): string {
  const [aar, m, d] = iso.split('-').map(Number) as [number, number, number];
  return `${d}. ${manedsnavn(m, malform)}${medAar ? ` ${aar}` : ''}`;
}

/** En dato eller en periode med dato: «16.–27. november 2026», «1. september–1. oktober 2026», «12. november kl. 09.00». */
export function datoperiode(dato: string, til: string | undefined, kl: string | undefined, malform: Malform, medAar: boolean): string {
  let tekst: string;
  if (til && til !== dato) {
    const sammeAar = til.slice(0, 4) === dato.slice(0, 4);
    const sammeManed = sammeAar && til.slice(5, 7) === dato.slice(5, 7);
    tekst = sammeManed ? `${Number(dato.slice(8, 10))}.–${datoTekst(til, malform, medAar)}` : `${datoTekst(dato, malform, medAar && !sammeAar)}–${datoTekst(til, malform, medAar)}`;
  } else tekst = datoTekst(dato, malform, medAar);
  return kl ? `${tekst} kl. ${kl}` : tekst;
}

/**
 * «1. februar» for en fast dag, ellers tidspunktet med ord, ellers navnet på måneden. En frist med dato fra dataene
 * får året, sluttdatoen og klokkeslettet: «16.–27. november 2026», «12. november 2026 kl. 09.00».
 */
export function tidspunkt(f: Tidslinjefrist, malform: Malform): string {
  if (f.dato && (f.aar || f.til || f.kl)) return datoperiode(f.dato, f.til, f.kl, malform, f.aar ?? false);
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
 * Den neste fristen fra en dato (ÅÅÅÅ-MM-DD), gjennom året og rundt nyttår. Frister med en dato for et bestemt år
 * regnes fra datoen, og er med bare når de ikke er passert. Andre frister uten fast dag regnes fra den 1. i måneden.
 * Frister som gjelder hele året, er ikke med.
 */
export function nesteFrist<F extends Tidslinjefrist>(frister: readonly F[], idag: string): F | null {
  const m = Number(idag.slice(5, 7));
  const d = Number(idag.slice(8, 10));
  const dagnummer = (iso: string) => Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10))) / 86_400_000;
  const avstand = (f: F) => {
    if (f.aar && f.dato) {
      const slutt = f.til ?? f.dato;
      if (slutt < idag) return Number.POSITIVE_INFINITY;
      return Math.max(0, dagnummer(f.dato) - dagnummer(idag));
    }
    const fm = maned(f) ?? m;
    const fd = dag(f) ?? 1;
    const dager = (fm - m) * 31 + (fd - d);
    return dager >= 0 ? dager : dager + 12 * 31;
  };
  const kandidater = frister.filter((f) => !heleAret(f) && Number.isFinite(avstand(f)));
  return [...kandidater].sort((a, b) => avstand(a) - avstand(b))[0] ?? null;
}
