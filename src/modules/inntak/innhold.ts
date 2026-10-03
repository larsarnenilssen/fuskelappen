// Laster veiviseren og stegene fra content/inntak/ ved behov.
import type { Frist, Innholdselement, Stegelement, Veiviserelement } from '../../core/innhold/skjema.ts';

const filer = import.meta.glob<Innholdselement[]>('/content/inntak/*.yaml', { import: 'default' });

export interface Inntaksinnhold {
  veivisere: Veiviserelement[];
  steg: Stegelement[];
  frister: Frist[];
}

let lopende: Promise<Inntaksinnhold> | null = null;

export function hentInnhold(): Promise<Inntaksinnhold> {
  lopende ??= Promise.all(Object.values(filer).map((last) => last())).then((lister) => {
    const alle = lister.flat();
    return {
      veivisere: alle.filter((e): e is Veiviserelement => e.type === 'veiviser'),
      steg: alle.filter((e): e is Stegelement => e.type === 'steg'),
      frister: alle.filter((e): e is Frist => e.type === 'frist'),
    };
  });
  lopende.catch(() => {
    lopende = null;
  });
  return lopende;
}

export const veiviserRute = (id: string) => `/inntak/${id}`;
export const fristerRute = '/inntak/frister';

/** Har appen lokalt innhold om inntak for fylket? */
export function harLokalt(innhold: Inntaksinnhold, fylke: string | null): boolean {
  return fylke !== null && [...innhold.veivisere, ...innhold.steg, ...innhold.frister].some((e) => e.gyldighet.niva !== 'nasjonal' && e.gyldighet.fylke === fylke);
}
