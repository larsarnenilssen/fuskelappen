// Nøkkeltallene for videregående opplæring (data/statistikk/statistikk.json), hentet hver uke fra Udirs statistikkbank
// av scripts/hent-statistikk.ts (avgjørelse 080). Se src/data/README.md.
import type { Ssb } from '../core/statistikk/ssb-skjema.ts';
import type { Statistikk } from '../core/statistikk/skjema.ts';
import { enGang } from './enGang.ts';

export const lastStatistikk = enGang(() => import('../../data/statistikk/statistikk.json').then((m) => m.default as unknown as Statistikk));

/** Tallene fra SSBs statistikkbank (data/statistikk/ssb.json), hentet hver uke av scripts/hent-ssb.ts (avgjørelse 090). */
export const lastSsb = enGang(() => import('../../data/statistikk/ssb.json').then((m) => m.default as unknown as Ssb));
