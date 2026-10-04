// Laster veiviseren, sidene om underveis- og sluttvurdering og orden og oppførsel (fase 6, pakke 1) og reglene for
// fraværsgrensen (pakke 2) fra content/vurdering/ ved behov.
import type { Innholdselement, Stegelement, Vanligelement, Veiviserelement } from '../../core/innhold/skjema.ts';

const filer = import.meta.glob<Innholdselement[]>('/content/vurdering/*.yaml', { import: 'default' });

/** En forklaring, med feltene som bare vanlige elementer har (paragrafer, sammenligning). */
export type Forklaringselement = Vanligelement;

export interface Vurderingsinnhold {
  veivisere: Veiviserelement[];
  steg: Stegelement[];
  forklaringer: Forklaringselement[];
  /** Reglene for fraværsgrensen («Slik regnes grensen»), under kalkulatoren. */
  regler: Innholdselement[];
}

let lopende: Promise<Vurderingsinnhold> | null = null;

export function hentInnhold(): Promise<Vurderingsinnhold> {
  lopende ??= Promise.all(Object.values(filer).map((last) => last())).then((lister) => {
    const alle = lister.flat();
    return {
      veivisere: alle.filter((e): e is Veiviserelement => e.type === 'veiviser'),
      steg: alle.filter((e): e is Stegelement => e.type === 'steg'),
      forklaringer: alle.filter((e): e is Forklaringselement => e.type === 'forklaring'),
      regler: alle.filter((e) => e.type === 'regel'),
    };
  });
  lopende.catch(() => {
    lopende = null;
  });
  return lopende;
}

export const veiviserRute = (id: string) => `/vurdering/${id}`;
export const underveisSluttRute = '/vurdering/underveis-og-sluttvurdering';
export const ordenRute = '/vurdering/orden-og-oppforsel';
export const fravaerRute = '/vurdering/fravaer';

/** Elementene på en side, i rekkefølgen de står i filen: id-er som starter med prefikset. */
export const medPrefiks = (liste: readonly Forklaringselement[], prefiks: string) => liste.filter((e) => e.id.startsWith(prefiks));
