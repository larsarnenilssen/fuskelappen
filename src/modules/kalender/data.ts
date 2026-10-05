// Fristene fra alle modulene, til kalenderen og boksen på forsiden (avgjørelse 066). Lastes når de trengs.
import type { Frist } from '../../core/innhold/skjema.ts';
import { aktiveModuler } from '../register.ts';

let frister: Promise<Frist[]> | null = null;

/** Fristene fra `frister()` i alle de aktive modulene. */
export function hentAlleFrister(): Promise<Frist[]> {
  frister ??= Promise.all(aktiveModuler.map((m) => m.frister())).then((l) => l.flat());
  return frister;
}
