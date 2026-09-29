// Laster forklaringer og metodebeskrivelser fra content/arbeidstid/ ved behov.
import type { Innholdselement } from '../../core/innhold/skjema.ts';

const filer = import.meta.glob<Innholdselement[]>('/content/arbeidstid/*.yaml', { import: 'default' });

let lopende: Promise<Innholdselement[]> | null = null;

export function hentArbeidstidInnhold(): Promise<Innholdselement[]> {
  lopende ??= Promise.all(Object.values(filer).map((last) => last())).then((lister) => lister.flat());
  return lopende;
}
