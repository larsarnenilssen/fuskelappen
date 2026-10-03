// Hvilke søketreff som gjelder for brukeren. Egen fil, så søkeboksen på forsiden ikke laster søkebiblioteket
// (MiniSearch) før søket brukes (startpakken).
import type { Sokeresultat } from './sok.ts';

/** Treffene som gjelder for brukeren: nasjonale, og fylkesinnhold bare for det valgte fylket. */
export function synligeTreff(treff: readonly Sokeresultat[], fylke: string | null): Sokeresultat[] {
  return treff.filter((t) => t.fylke === null || t.fylke === fylke);
}
