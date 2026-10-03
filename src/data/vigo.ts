// Data fra VIGO Kodeverksbase, hentet hver uke av npm run hent:vigo (avgjørelse 026): fagrelasjonene
// (data/vigo/fagrelasjoner.json) og fagmerknadene og vitnemålsmerknadene (data/vigo/merknader.json).
// Se src/data/README.md.
import type { Fagrelasjoner, Merknader } from '../modules/fag/vigo/skjema.ts';
import { enGang } from './enGang.ts';

export const lastFagrelasjoner = enGang(() => import('../../data/vigo/fagrelasjoner.json').then((m) => m.default as unknown as Fagrelasjoner));

export const lastMerknader = enGang(() => import('../../data/vigo/merknader.json').then((m) => m.default as unknown as Merknader));
