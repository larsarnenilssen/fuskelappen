// Lasting av fagdataene fra Grep. Fagindeksen er en egen JS-bit som lastes første gang den trengs (og følger med
// når appen installeres). Læreplanene er egne filer under data/grep/laereplaner/ som hentes når et fag åpnes,
// og som tjenestearbeideren tar vare på til bruk uten nett (avgjørelse 022).
import type { Fagindeks, Laereplan } from './skjema.ts';
import type { Rolle } from './tilbud/modell.ts';
import type { Fagrelasjoner } from './vigo/skjema.ts';

let indeks: Promise<Fagindeks> | null = null;

export function lastFagindeks(): Promise<Fagindeks> {
  indeks ??= import('../../../data/grep/fagindeks.json').then((m) => m.default as unknown as Fagindeks);
  return indeks;
}

// Fagrelasjonene fra VIGO Kodeverksbase (avgjørelse 026) er en egen JS-bit, som lastes når den trengs.
let relasjoner: Promise<Fagrelasjoner> | null = null;

export function lastFagrelasjoner(): Promise<Fagrelasjoner> {
  relasjoner ??= import('../../../data/vigo/fagrelasjoner.json').then((m) => m.default as unknown as Fagrelasjoner);
  return relasjoner;
}

// Rollene til fagkodene i tilbudene (avgjørelse 031) er en liten JS-bit som regnes ut når appen bygges.
export interface Fagroller {
  roller: Readonly<Record<string, Rolle>>;
  /** Titlene på læreplanene, f.eks. «Fremmedspråk». */
  laereplaner: Readonly<Record<string, string>>;
}

let roller: Promise<Fagroller> | null = null;

export function lastFagroller(): Promise<Fagroller> {
  roller ??= import('virtual:fagroller').then((m) => ({ roller: m.default, laereplaner: m.laereplaner }));
  return roller;
}

const planer = new Map<string, Promise<Laereplan>>();

export function lastLaereplan(kode: string): Promise<Laereplan> {
  let p = planer.get(kode);
  if (!p) {
    p = fetch(`${import.meta.env.BASE_URL}data/grep/laereplaner/${encodeURIComponent(kode)}.json`).then(async (svar) => {
      if (!svar.ok) throw new Error(`Fant ikke læreplanen ${kode} (${svar.status})`);
      return (await svar.json()) as Laereplan;
    });
    // En feil (f.eks. uten nett) skal kunne prøves på nytt.
    p.catch(() => planer.delete(kode));
    planer.set(kode, p);
  }
  return p;
}
