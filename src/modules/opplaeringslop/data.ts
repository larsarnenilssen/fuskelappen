// Tilbudene i videregående til Opplæringsløp (avgjørelse 035). Regnes ut når appen bygges (virtual:tilbud) og lastes
// som en egen JS-bit første gang modulen eller lenkene fra fagarket trenger dem.
import type { Fagindeks } from '../fag/skjema.ts';

// Lastingen og typene står i datalaget (avgjørelse 049).
export { lastTilbud } from '../../data/udir.ts';
export type { Tilbudene, Tilbudsdata } from '../../data/udir.ts';

/** Kort kode i adressen: HSHEA2---- → HSHEA2. */
export const kortKode = (kode: string) => kode.replace(/-+$/, '');

/** Full kode fra adressen: HSHEA2 → HSHEA2----. Programområdekodene i Grep er ti tegn. */
export const fullKode = (kort: string) => kort.toUpperCase().padEnd(10, '-');

/** Rute til et tilbud. Programmet står først, så tilbakeknappen og lenkene viser hvor i løpet tilbudet hører til. */
export const tilbudRute = (program: string, kode: string, via?: string | null) =>
  `/opplaeringslop/${program}/${kortKode(kode)}${via ? `?via=${kortKode(via)}` : ''}`;

/**
 * Tilbud i skole før opplæring i bedrift, ellers i samme rekkefølge. Etter vg1 i yrkesfag kan det være mange tilbud
 * videre, og vg2 i skole skal stå øverst (eier 02.10.2026).
 */
export function skoleForst(koder: readonly string[], indeks: Pick<Fagindeks, 'programomrader'>): string[] {
  const iBedrift = (k: string) => (indeks.programomrader[k]?.sted === 'bedrift' ? 1 : 0);
  return [...koder].sort((a, b) => iBedrift(a) - iBedrift(b));
}
