// Data fra Grep (Udir), hentet hver uke av npm run hent:grep (avgjørelse 018 og 022):
// - fagindeksen (data/grep/fagindeks.json): alle fag, programområder og utdanningsprogram i videregående,
// - læreplanene (data/grep/laereplaner/<kode>.json), som hentes når et fag åpnes,
// - grunnleggende ferdigheter og tverrfaglige temaer (data/grep/laereplanverket.json),
// - rollene til fagkodene og titlene på læreplanene (virtual:fagroller, regnet ut når appen bygges).
// Fagsøket i kalkulatorene (virtual:fagsok) bygges også fra fagindeksen. Se src/data/README.md.
import type { Fagindeks, Laereplan } from '../modules/fag/skjema.ts';
import type { Rolle } from '../modules/fag/tilbud/modell.ts';
import { enGang } from './enGang.ts';

export const lastFagindeks = enGang(() => import('../../data/grep/fagindeks.json').then((m) => m.default as unknown as Fagindeks));

export interface Laereplanverket {
  ferdigheter: { kode: string; navn: { nb: string; nn: string } }[];
  temaer: { kode: string; navn: { nb: string; nn: string } }[];
}

export const lastLaereplanverket = enGang(() => import('../../data/grep/laereplanverket.json').then((m) => m.default as unknown as Laereplanverket));

/** Rollene til fagkodene i tilbudene (avgjørelse 031) og titlene på læreplanene, f.eks. «Fremmedspråk». */
export interface Fagroller {
  roller: Readonly<Record<string, Rolle>>;
  laereplaner: Readonly<Record<string, string>>;
}

export const lastFagroller = enGang(() => import('virtual:fagroller').then((m): Fagroller => ({ roller: m.default, laereplaner: m.laereplaner })));

const planer = new Map<string, () => Promise<Laereplan>>();

/** Én læreplan. Filene ligger ved siden av appen og tas vare på av tjenestearbeideren til bruk uten nett. */
export function lastLaereplan(kode: string): Promise<Laereplan> {
  let last = planer.get(kode);
  if (!last) {
    last = enGang(() =>
      fetch(`${import.meta.env.BASE_URL}data/grep/laereplaner/${encodeURIComponent(kode)}.json`).then(async (svar) => {
        if (!svar.ok) throw new Error(`Fant ikke læreplanen ${kode} (${svar.status})`);
        return (await svar.json()) as Laereplan;
      }),
    );
    planer.set(kode, last);
  }
  return last();
}
