// Fag- og timefordelingen fra rundskrivet Udir-1 (data/udir/fagfordeling-<skoleår>.json), hentet hver uke
// (avgjørelse 037). Egen fil, fordi skoleårsvalget ikke skal med i startpakken. Se src/data/README.md.
import type { Fagfordeling } from '../modules/fag/tilbud/skjema.ts';
import { enGang } from './enGang.ts';
import { fordelingsfil, iDag } from './skolear.ts';

const fordelinger = import.meta.glob<Fagfordeling>('/data/udir/fagfordeling-*.json', { import: 'default' });

/** Fag- og timefordelingen som gjelder for skoleåret i dag (velgFordeling), som i resten av appen. */
export const lastFagfordeling = enGang(() => {
  const fil = fordelingsfil(Object.keys(fordelinger), iDag());
  const last = fil ? fordelinger[fil] : undefined;
  return last ? last() : Promise.reject(new Error('Fant ikke fag- og timefordelingen.'));
});
