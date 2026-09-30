// Tekst og tall i kildetekster: normalisering og tall skrevet på norsk (1687,5 · 12 000 · 1.150).
// Rene funksjoner. Brukes av verdisjekken og kildejobben.

/** Normaliserer tekst før sammenligning: samme Unicode-form og alle mellomrom slått sammen til ett. */
export function normaliserTekst(tekst: string): string {
  return tekst.normalize('NFC').replace(/\s+/g, ' ').trim();
}

export interface Talltreff {
  /** Tallet slik det står i teksten, f.eks. «1.150» eller «12 000». */
  tekst: string;
  verdi: number;
  start: number;
  slutt: number;
}

/**
 * Et tall på norsk: tusenskille med mellomrom eller punktum (12 000, 1.150) og desimalkomma (1687,5).
 * Et tall rett etter et siffer, komma eller punktum telles ikke, så «5.1.» og «1.1.2026» gir bare første ledd.
 */
export const TALL = String.raw`(?<![\d,.])(?:\d{1,3}(?:[ \u00a0.]\d{3})+|\d+)(?:,\d+)?(?!\d)`;

export function finnTall(tekst: string): Talltreff[] {
  return [...tekst.matchAll(new RegExp(TALL, 'g'))].map((m) => ({
    tekst: m[0],
    verdi: lesTall(m[0]),
    start: m.index,
    slutt: m.index + m[0].length,
  }));
}

/** Leser et tall skrevet på norsk. «1.150» og «12 000» er tusen, «1687,5» har desimalkomma. */
export function lesTall(tekst: string): number {
  return Number(tekst.replace(/[ \u00a0.]/g, '').replace(',', '.'));
}

export function likeTall(a: number, b: number): boolean {
  return Math.abs(a - b) < 1e-9;
}
