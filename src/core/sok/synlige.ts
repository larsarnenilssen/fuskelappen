// Hvilke søketreff som gjelder for brukeren. Egen fil, så søkeboksen på forsiden ikke laster søkebiblioteket
// (MiniSearch) før søket brukes (startpakken).
import type { Sokeresultat } from './sok.ts';

/** Treffene som gjelder for brukeren: nasjonale, og fylkesinnhold bare for det valgte fylket. */
export function synligeTreff(treff: readonly Sokeresultat[], fylke: string | null): Sokeresultat[] {
  return treff.filter((t) => t.fylke === null || t.fylke === fylke);
}

/** Treffene i det valgte fylket: de som ikke hører til et sted, og de som hører til fylket (eier 05.10.2026). */
export function treffIFylket(treff: readonly Sokeresultat[], fylke: string): Sokeresultat[] {
  return treff.filter((t) => !t.sted || t.sted.includes(fylke));
}

/** Om noen av treffene hører til et annet fylke, så knappen med fylket i søket har noe å gjøre. */
export function harAndreFylker(treff: readonly Sokeresultat[], fylke: string): boolean {
  return treff.some((t) => t.sted && !t.sted.includes(fylke));
}
