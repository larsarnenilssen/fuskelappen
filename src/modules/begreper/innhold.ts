// Laster begrepene fra content/begreper/ ved behov. I utvikling og testing kommer testbegreper i tillegg.
import { ekstraBegreper } from 'virtual:testoppsett';
import type { Innholdselement } from '../../core/innhold/skjema.ts';

const filer = import.meta.glob<Innholdselement[]>('/content/begreper/*.yaml', { import: 'default' });

let lopende: Promise<Innholdselement[]> | null = null;

export function hentBegreper(): Promise<Innholdselement[]> {
  lopende ??= Promise.all(
    [...Object.values(filer), ...(Object.values(ekstraBegreper) as (() => Promise<Innholdselement[]>)[])].map((last) => last()),
  ).then((lister) =>
    lister
      .flat()
      .filter((e) => e.type === 'begrep')
      .sort((a, b) => a.tittel.nb.localeCompare(b.tittel.nb, 'nb')),
  );
  return lopende;
}
