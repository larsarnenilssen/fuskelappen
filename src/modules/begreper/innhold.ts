// Laster begrepene fra content/begreper/ ved behov. I utvikling og testing kommer testbegreper i tillegg.
import { ekstraBegreper } from 'virtual:testoppsett';
import type { Innholdselement } from '../../core/innhold/skjema.ts';
import { filnavn, TEMA_FOR_FIL, type Begrepstema } from './tema.ts';

const filer = import.meta.glob<Innholdselement[]>('/content/begreper/*.yaml', { import: 'default' });

export interface Begrepsbank {
  begreper: Innholdselement[];
  /** Temaet til hvert begrep, etter filen det står i. Testbegrepene har ikke tema. */
  tema: ReadonlyMap<string, Begrepstema>;
}

let lopende: Promise<Begrepsbank> | null = null;

export function hentBegrepsbank(): Promise<Begrepsbank> {
  lopende ??= Promise.all([
    ...Object.entries(filer).map(([sti, last]) => last().then((liste) => ({ tema: TEMA_FOR_FIL[filnavn(sti)], liste }))),
    ...(Object.values(ekstraBegreper) as (() => Promise<Innholdselement[]>)[]).map((last) => last().then((liste) => ({ tema: undefined, liste }))),
  ]).then((filene) => {
    const tema = new Map<string, Begrepstema>();
    for (const fil of filene) for (const b of fil.liste) if (fil.tema) tema.set(b.id, fil.tema);
    const begreper = filene
      .flatMap((f) => f.liste)
      .filter((e) => e.type === 'begrep')
      .sort((a, b) => a.tittel.nb.localeCompare(b.tittel.nb, 'nb'));
    return { begreper, tema };
  });
  return lopende;
}

export function hentBegreper(): Promise<Innholdselement[]> {
  return hentBegrepsbank().then((bank) => bank.begreper);
}
