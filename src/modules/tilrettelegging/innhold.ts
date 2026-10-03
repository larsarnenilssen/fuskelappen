// Laster veiviserne og stegene fra content/tilrettelegging/ ved behov.
import type { Innholdselement, Stegelement, Veiviserelement } from '../../core/innhold/skjema.ts';

const filer = import.meta.glob<Innholdselement[]>('/content/tilrettelegging/*.yaml', { import: 'default' });

export interface Veiviserinnhold {
  veivisere: Veiviserelement[];
  steg: Stegelement[];
}

let lopende: Promise<Veiviserinnhold> | null = null;

export function hentInnhold(): Promise<Veiviserinnhold> {
  lopende ??= Promise.all(Object.values(filer).map((last) => last())).then((lister) => {
    const alle = lister.flat();
    return {
      veivisere: alle.filter((e): e is Veiviserelement => e.type === 'veiviser'),
      steg: alle.filter((e): e is Stegelement => e.type === 'steg'),
    };
  });
  lopende.catch(() => {
    lopende = null;
  });
  return lopende;
}

export const veiviserRute = (id: string) => `/tilrettelegging/${id}`;
