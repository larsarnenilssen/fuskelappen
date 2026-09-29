// Oppslag i UI-tekstene. Rene funksjoner; Preact-kroken ligger i app/tilstand.
import { nb } from '../../strings/nb.ts';
import { nn } from '../../strings/nn.ts';
import type { Malform, Tekster, Tekstnokkel } from '../../strings/typer.ts';
import type { Flerspraak } from '../innhold/skjema.ts';

export type { Malform, Tekstnokkel };

export const tekstTabeller: Record<Malform, Tekster> = { nb, nn };

export type Verdier = Record<string, string | number>;

function slaaOpp(tabell: unknown, nokkel: string): string | undefined {
  let node: unknown = tabell;
  for (const del of nokkel.split('.')) {
    if (typeof node !== 'object' || node === null) return undefined;
    node = (node as Record<string, unknown>)[del];
  }
  return typeof node === 'string' ? node : undefined;
}

export function fyllInn(mal: string, verdier?: Verdier): string {
  if (!verdier) return mal;
  return mal.replace(/\{(\w+)\}/g, (hele, navn: string) => (navn in verdier ? String(verdier[navn]) : hele));
}

export function hentTekst(malform: Malform, nokkel: Tekstnokkel, verdier?: Verdier): string {
  const mal = slaaOpp(tekstTabeller[malform], nokkel) ?? slaaOpp(tekstTabeller.nb, nokkel) ?? nokkel;
  return fyllInn(mal, verdier);
}

/** En tekst er enten en nøkkel i strings eller en ferdig nb/nn-tekst fra innholdet. */
export type Tekstverdi = Tekstnokkel | Flerspraak;

export function visTekst(verdi: Tekstverdi, malform: Malform): string {
  return typeof verdi === 'string' ? hentTekst(malform, verdi) : verdi[malform];
}

export function begge(verdi: Tekstverdi): Flerspraak {
  return { nb: visTekst(verdi, 'nb'), nn: visTekst(verdi, 'nn') };
}

export function formaterTall(tall: number, desimaler = 2): string {
  return new Intl.NumberFormat('nb-NO', { maximumFractionDigits: desimaler }).format(tall);
}

export function formaterDato(iso: string, malform: Malform): string {
  const dato = new Date(iso);
  if (Number.isNaN(dato.getTime())) return iso;
  return new Intl.DateTimeFormat(malform === 'nn' ? 'nn-NO' : 'nb-NO', { day: 'numeric', month: 'long', year: 'numeric' }).format(dato);
}
