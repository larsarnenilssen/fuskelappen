// Resultatene fra Elevundersøkelsen (data/elevundersokelsen/resultater.json), hentet hver uke fra Udirs
// statistikkbank av scripts/hent-elevundersokelsen.ts (fase 7, avgjørelse 077). Se src/data/README.md.
import type { Elevundersokelsen } from '../modules/elevundersokelsen/skjema.ts';
import { enGang } from './enGang.ts';

export const lastElevundersokelsen = enGang(() => import('../../data/elevundersokelsen/resultater.json').then((m) => m.default as unknown as Elevundersokelsen));
