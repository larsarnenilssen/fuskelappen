// Typene for overordnet del (pakke 6, avgjørelse 037), uten zod, så modulmanifestet og sidene kan bruke dem uten å
// ta med skjemabiblioteket i startpakken. Skjemaet står i skjema.ts.

/** Et avsnitt eller en punktliste. */
export type Blokk = { type: 'avsnitt'; tekst: string } | { type: 'liste'; punkter: string[] };

export interface Del {
  /** Siste ledd i adressen på udir.no, f.eks. «1.1-menneskeverdet». */
  id: string;
  /** Kapittelnummeret, f.eks. «1.1», eller null («Om overordnet del»). */
  nr: string | null;
  tittel: { nb: string; nn: string };
  url: string;
  ingress: { nb: Blokk[]; nn: Blokk[] };
  tekst: { nb: Blokk[]; nn: Blokk[] };
  deler: Del[];
}

export interface OverordnetDel {
  kilde: 'udir-overordnet-del';
  url: string;
  hentet: string;
  deler: Del[];
}

/** Alle delene i rekkefølge, med delene inni etter hverandre. */
export function alleDeler(deler: readonly Del[]): Del[] {
  return deler.flatMap((d) => [d, ...alleDeler(d.deler)]);
}
