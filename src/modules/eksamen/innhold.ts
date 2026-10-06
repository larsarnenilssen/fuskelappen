// Laster innholdet i Eksamen og klage fra content/eksamen/ ved behov: eksamen, prøvene i fag- og yrkesopplæringen,
// veiviseren for klage på karakter og fristene i kalenderen. Sidene stod i Vurdering til eier skilte dem ut som egen
// modul (06.10.2026, avgjørelse 078).
import type { Frist, Innholdselement, Stegelement, Vanligelement, Veiviserelement } from '../../core/innhold/skjema.ts';
import type { Underside } from '../typer.ts';
import { kalenderLenke } from '../kalender/adresse.ts';

const filer = import.meta.glob<Innholdselement[]>('/content/eksamen/*.yaml', { import: 'default' });

/** En forklaring, med feltene som bare vanlige elementer har (paragrafer, sammenligning). */
export type Forklaringselement = Vanligelement;

export interface Eksamensinnhold {
  veivisere: Veiviserelement[];
  steg: Stegelement[];
  forklaringer: Forklaringselement[];
  /** Fristene i kalenderen, filtrert på eksamen. */
  frister: Frist[];
}

let lopende: Promise<Eksamensinnhold> | null = null;

export function hentInnhold(): Promise<Eksamensinnhold> {
  lopende ??= Promise.all(Object.values(filer).map((last) => last())).then((lister) => {
    const alle = lister.flat();
    return {
      veivisere: alle.filter((e): e is Veiviserelement => e.type === 'veiviser'),
      steg: alle.filter((e): e is Stegelement => e.type === 'steg'),
      forklaringer: alle.filter((e): e is Forklaringselement => e.type === 'forklaring'),
      frister: alle.filter((e): e is Frist => e.type === 'frist'),
    };
  });
  lopende.catch(() => {
    lopende = null;
  });
  return lopende;
}

export const veiviserRute = (id: string) => `/eksamen/${id}`;
export const eksamenRute = '/eksamen/regler';
export const proveneRute = '/eksamen/fag-og-svenneproven';
/** Kalenderen filtrert på eksamen (fase 6, pakke 5). */
export const fristerRute = kalenderLenke('eksamen');
export const klageRute = veiviserRute('klage-pa-karakter');

/** Udirs side om fag- og svenneprøver (kilden udir-fag-og-svenneprover), som siden om prøvene lenker til. */
export const UDIR_PROVER = 'https://www.udir.no/eksamen-og-prover/eksamen/fag-og-svenneprover/';
/** Eksamensplanen hos Udir. Kalenderen lenker dit (datoene hentes ikke derfra, fordi robots.txt stenger). */
export const EKSAMENSPLAN = 'https://eksamensplan.udir.no/';

/** Kortene med ikon på oversikten. Oversikten og favorittene henter ikonet herfra (`undersider`, avgjørelse 058). */
export const UNDERSIDER = {
  eksamen: { rute: eksamenRute, ikon: 'dokument' },
  frister: { rute: fristerRute, ikon: 'flagg' },
  provene: { rute: proveneRute, ikon: 'kontor' },
} as const satisfies Record<string, Underside>;

/** Elementene på en side, i rekkefølgen de står i filen: id-er som starter med prefikset. */
export const medPrefiks = (liste: readonly Forklaringselement[], prefiks: string) => liste.filter((e) => e.id.startsWith(prefiks));
