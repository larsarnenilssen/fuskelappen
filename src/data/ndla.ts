// Fagene på NDLA per fagkode, hentet hver uke av npm run hent:ndla (avgjørelse 053). Fagarket lenker til faget.
// Se src/data/README.md.
import type { Ndla } from '../modules/fag/ndla/skjema.ts';
import { enGang } from './enGang.ts';

export const lastNdla = enGang(() => import('../../data/ndla/fag.json').then((m) => m.default as unknown as Ndla));
