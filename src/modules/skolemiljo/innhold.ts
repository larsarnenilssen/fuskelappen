// Skolemiljø (fase 7): veiviseren for aktivitetsplikten og stegene, og kortene om skolereglene, fra content/skolemiljo/.
// Lastes ved behov.
import type { Underside } from '../typer.ts';
import type { Innholdselement, Stegelement, Vanligelement, Veiviserelement } from '../../core/innhold/skjema.ts';

export type Forklaringselement = Vanligelement;

const filer = import.meta.glob<Innholdselement[]>('/content/skolemiljo/*.yaml', { import: 'default' });

export interface Skolemiljoinnhold {
  veivisere: Veiviserelement[];
  steg: Stegelement[];
  forklaringer: Forklaringselement[];
}

let lopende: Promise<Skolemiljoinnhold> | null = null;

export function hentInnhold(): Promise<Skolemiljoinnhold> {
  lopende ??= Promise.all(Object.values(filer).map((last) => last())).then((lister) => {
    const alle = lister.flat();
    return {
      veivisere: alle.filter((e): e is Veiviserelement => e.type === 'veiviser'),
      steg: alle.filter((e): e is Stegelement => e.type === 'steg'),
      forklaringer: alle.filter((e): e is Forklaringselement => e.type === 'forklaring'),
    };
  });
  lopende.catch(() => {
    lopende = null;
  });
  return lopende;
}

export const veiviserRute = (id: string) => `/skolemiljo/${id}`;
export const skolereglerRute = '/skolemiljo/skoleregler';
export const elevundersokelsenRute = '/skolemiljo/elevundersokelsen';
/** Opplæringslova kapittel 12 som egen side (eier 06.10.2026). */
export const kapittel12Rute = '/skolemiljo/trygt-og-godt-skolemiljo';

/** Lenkene med ikon på oversikten (avgjørelse 058). */
export const UNDERSIDER = {
  kapittel12: { rute: kapittel12Rute, ikon: 'skole' },
  skoleregler: { rute: skolereglerRute, ikon: 'paragraf' },
  elevundersokelsen: { rute: elevundersokelsenRute, ikon: 'vurdering' },
} as const satisfies Record<string, Underside>;

/** Elementene på en side, i rekkefølgen de står i filen: id-er som starter med prefikset. */
export const medPrefiks = (liste: readonly Forklaringselement[], prefiks: string) => liste.filter((e) => e.id.startsWith(prefiks));
