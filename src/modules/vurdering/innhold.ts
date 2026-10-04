// Laster veiviserne, sidene om underveis- og sluttvurdering og orden og oppførsel (fase 6, pakke 1), reglene for
// fraværsgrensen (pakke 2) og eksamen, prøvene og fristene (pakke 3) fra content/vurdering/ ved behov.
import type { Frist, Innholdselement, Stegelement, Vanligelement, Veiviserelement } from '../../core/innhold/skjema.ts';
import type { Underside } from '../typer.ts';

const filer = import.meta.glob<Innholdselement[]>('/content/vurdering/*.yaml', { import: 'default' });

/** En forklaring, med feltene som bare vanlige elementer har (paragrafer, sammenligning). */
export type Forklaringselement = Vanligelement;

export interface Vurderingsinnhold {
  veivisere: Veiviserelement[];
  steg: Stegelement[];
  forklaringer: Forklaringselement[];
  /** Reglene for fraværsgrensen («Slik regnes grensen»), under kalkulatoren. */
  regler: Innholdselement[];
  /** Fristene på tidslinjen «Eksamen og klage gjennom året». */
  frister: Frist[];
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
      frister: alle.filter((e): e is Frist => e.type === 'frist'),
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
export const eksamenRute = '/vurdering/eksamen';
export const proveneRute = '/vurdering/fag-og-svenneproven';
export const fristerRute = '/vurdering/eksamen-og-klage';
export const klageRute = veiviserRute('klage-pa-karakter');

/** Udirs side om fag- og svenneprøver (kilden udir-fag-og-svenneprover), som siden om prøvene lenker til. */
export const UDIR_PROVER = 'https://www.udir.no/eksamen-og-prover/eksamen/fag-og-svenneprover/';
/** Eksamensplanen hos Udir. Tidslinjen lenker dit (datoene hentes ikke derfra, fordi robots.txt stenger). */
export const EKSAMENSPLAN = 'https://eksamensplan.udir.no/';

/** Kortene med ikon på oversikten. Oversikten og favorittene henter ikonet herfra (`undersider`, avgjørelse 058). */
export const UNDERSIDER = {
  underveisSlutt: { rute: underveisSluttRute, ikon: 'bok' },
  fravaer: { rute: fravaerRute, ikon: 'klokke' },
  orden: { rute: ordenRute, ikon: 'person' },
  eksamen: { rute: eksamenRute, ikon: 'dokument' },
  frister: { rute: fristerRute, ikon: 'flagg' },
  provene: { rute: proveneRute, ikon: 'kontor' },
} as const satisfies Record<string, Underside>;

/** Elementene på en side, i rekkefølgen de står i filen: id-er som starter med prefikset. */
export const medPrefiks = (liste: readonly Forklaringselement[], prefiks: string) => liste.filter((e) => e.id.startsWith(prefiks));
