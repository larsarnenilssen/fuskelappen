// Laster veiviseren, stegene, fristene og reglene for poengberegningen fra content/inntak/ ved behov.
import type { Frist, Innholdselement, Stegelement, Vanligelement, Veiviserelement } from '../../core/innhold/skjema.ts';
import type { Underside } from '../typer.ts';
import { kalenderLenke } from '../kalender/adresse.ts';

const filer = import.meta.glob<Innholdselement[]>('/content/inntak/*.yaml', { import: 'default' });

export interface Inntaksinnhold {
  veivisere: Veiviserelement[];
  steg: Stegelement[];
  frister: Frist[];
  /** Reglene for poengberegningen («Slik regnes poengene»). */
  regler: Innholdselement[];
  /** Kortene på siden «Mer opplæring» (`mo-`). */
  forklaringer: Forklaringselement[];
}

/** Et vanlig innholdselement av typen forklaring, f.eks. et kort på siden «Mer opplæring». */
export type Forklaringselement = Vanligelement;

let lopende: Promise<Inntaksinnhold> | null = null;

export function hentInnhold(): Promise<Inntaksinnhold> {
  lopende ??= Promise.all(Object.values(filer).map((last) => last())).then((lister) => {
    const alle = lister.flat();
    return {
      veivisere: alle.filter((e): e is Veiviserelement => e.type === 'veiviser'),
      steg: alle.filter((e): e is Stegelement => e.type === 'steg'),
      frister: alle.filter((e): e is Frist => e.type === 'frist'),
      regler: alle.filter((e) => e.type === 'regel'),
      forklaringer: alle.filter((e): e is Forklaringselement => e.type === 'forklaring'),
    };
  });
  lopende.catch(() => {
    lopende = null;
  });
  return lopende;
}

export const veiviserRute = (id: string) => `/inntak/${id}`;
/** Den gamle adressen til Kalender for inntak. Sender videre til kalenderen (avgjørelse 066). */
export const gammelFristerRute = '/inntak/frister';
/** Kalenderen filtrert på inntak (fase 6, pakke 5). */
export const fristerRute = kalenderLenke('inntak');
export const poengRute = '/inntak/poeng';
export const merOpplaeringRute = '/inntak/mer-opplaering';

/** Kortene på en side med et gitt prefiks, i rekkefølgen i filen. */
export function medPrefiks(alle: readonly Forklaringselement[], prefiks: string): Forklaringselement[] {
  return alle.filter((e) => e.id.startsWith(prefiks));
}

/** Kortene med ikon på oversikten. Oversikten og favorittene henter ikonet herfra (`undersider`, avgjørelse 058). */
export const UNDERSIDER = {
  frister: { rute: fristerRute, ikon: 'klokke' },
  poeng: { rute: poengRute, ikon: 'kalkulator' },
  merOpplaering: { rute: merOpplaeringRute, ikon: 'igjen' },
} as const satisfies Record<string, Underside>;

/** Har appen lokalt innhold om inntak for fylket? */
export function harLokalt(innhold: Inntaksinnhold, fylke: string | null): boolean {
  return fylke !== null && [...innhold.veivisere, ...innhold.steg, ...innhold.frister, ...innhold.regler].some((e) => e.gyldighet.niva !== 'nasjonal' && e.gyldighet.fylke === fylke);
}
