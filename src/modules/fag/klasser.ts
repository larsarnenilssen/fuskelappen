// Hvilke fag fagsøket viser som standard, og hvordan treffene grupperes (avgjørelse 031). Rene funksjoner.
//
// «Vanlige fag» er fagene i det ordinære tilbudet i skole og yrkesfaglig fordypning (eier 01.10.2026). Resten vises
// når brukeren slår dem på: varianter for særskilte grupper, opplæring i bedrift og andre fagkoder (uten timetall
// eller læreplan, vurderingskoder, individuell opplæringsplan). Et søk på en hel fagkode viser alltid faget.
import type { Fag, Fagindeks, Fagtype } from './skjema.ts';
import type { Rolle } from './tilbud/modell.ts';

export type Fagklasse = 'vanlig' | 'variant' | 'bedrift' | 'andre';

/** Klassene som er skjult til brukeren slår dem på, i den rekkefølgen de står i grensesnittet. */
export const SKJULTE: readonly Exclude<Fagklasse, 'vanlig'>[] = ['variant', 'bedrift', 'andre'];

/** Fag for særskilte grupper som ikke står i noe tilbud, kjennes igjen på navnet (som i tilbudsmodellen). */
const VARIANT = /tegnspråk|samisk|kvensk|finsk som andrespråk|kort botid|grunnleggende norsk|minoritet|styrket|morsmål|katolske|for døve/i;

export function fagklasse(fag: Fag, rolle: Rolle | undefined, indeks: Fagindeks): Fagklasse {
  if (fag.type === 'yrkesfaglig_fordypning' || rolle === 'ordinar') return 'vanlig';
  if (rolle === 'alternativ' || VARIANT.test(fag.navn.nb)) return 'variant';
  if (fag.po.length > 0 && fag.po.every((p) => indeks.programomrader[p]?.sted === 'bedrift')) return 'bedrift';
  return 'andre';
}

export function fagklasser(indeks: Fagindeks, roller: Readonly<Record<string, Rolle>>): Map<string, Fagklasse> {
  return new Map(Object.entries(indeks.fag).map(([kode, fag]) => [kode, fagklasse(fag, roller[kode], indeks)]));
}

/** Rekkefølgen på gruppene. Yrkesfaglig fordypning står først når et yrkesfaglig program er valgt. */
export function gruppeRekkefolge(yrkesfaglig: boolean): Fagtype[] {
  const vanlig: Fagtype[] = ['fellesfag', 'felles_programfag', 'valgfritt_programfag', 'yrkesfaglig_fordypning', 'individuell_opplaeringsplan', 'annet'];
  return yrkesfaglig ? ['yrkesfaglig_fordypning', ...vanlig.filter((t) => t !== 'yrkesfaglig_fordypning')] : vanlig;
}

export interface Undergruppe<T> {
  /** Læreplankoden, eller null for fag uten læreplan. */
  laereplan: string | null;
  /** Tittelen på læreplanen, ellers det fagene har felles i starten av navnet, ellers læreplankoden. */
  tittel: string;
  treff: T[];
}

/** De hele ordene navnene starter likt med: «Matematikk R1», «Matematikk S2» → «Matematikk». */
export function fellesStart(navn: readonly string[]): string {
  const [forste, ...resten] = navn.map((n) => n.split(/\s+/));
  if (!forste) return '';
  let n = forste.length;
  for (const ord of resten) {
    let i = 0;
    while (i < n && i < ord.length && ord[i] === forste[i]) i++;
    n = i;
  }
  return forste.slice(0, n).join(' ').replace(/[\s,:;–-]+$/, '');
}

/**
 * Treffene gruppert etter læreplan, i rekkefølgen læreplanen først dukker opp. Brukes i store grupper, f.eks. de
 * mange fremmedspråkene og valgfrie programfagene på studieforberedende, så listen viser «Fremmedspråk (340)».
 */
export function etterLaereplan<T extends { fag: Fag }>(treff: readonly T[], malform: 'nb' | 'nn', titler: Readonly<Record<string, string>> = {}): Undergruppe<T>[] {
  const grupper = new Map<string, T[]>();
  for (const t of treff) {
    const lp = t.fag.lp ?? '';
    grupper.set(lp, [...(grupper.get(lp) ?? []), t]);
  }
  return [...grupper].map(([lp, liste]) => ({
    laereplan: lp || null,
    tittel: (lp && titler[lp]) || (liste.length > 1 ? fellesStart(liste.map((t) => t.fag.navn[malform])) : (liste[0]?.fag.navn[malform] ?? '')) || lp,
    treff: liste,
  }));
}
