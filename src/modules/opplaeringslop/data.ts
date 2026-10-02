// Tilbudene i videregående til Opplæringsløp (avgjørelse 035). Regnes ut når appen bygges (virtual:tilbud) og lastes
// som en egen JS-bit første gang modulen eller lenkene fra fagarket trenger dem.
import type { Programstruktur, Tilbud } from '../fag/tilbud/modell.ts';
import type { Fagindeks } from '../fag/skjema.ts';

/** Et tilbud uten programområdet, som står i fagindeksen. */
export type Tilbudsdata = Omit<Tilbud, 'programomrade'>;

export interface Tilbudene {
  /** Skoleåret fag- og timefordelingen gjelder, f.eks. «2026-2027», eller null uten rundskriv. */
  skolear: string | null;
  struktur: Programstruktur[];
  tilbud: Readonly<Record<string, Tilbudsdata>>;
}

let tilbud: Promise<Tilbudene> | null = null;

export function lastTilbud(): Promise<Tilbudene> {
  tilbud ??= import('virtual:tilbud').then((m) => m.default as Tilbudene);
  // En feil (f.eks. uten nett før appen er installert) skal kunne prøves på nytt.
  tilbud.catch(() => {
    tilbud = null;
  });
  return tilbud;
}

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
