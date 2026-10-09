// Hvilke søketreff som gjelder for brukeren. Egen fil, så søkeboksen på forsiden ikke laster søkebiblioteket
// (MiniSearch) før søket brukes (startpakken).
import type { Sokeomrade, Sokeresultat } from './sok.ts';

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

/** Så mye lavere poeng får treff om grunnskolen, og om privatskoler når «Privatskole» ikke er valgt (avgjørelse 100). */
export const NEDTONING = 0.5;

/**
 * Treff om grunnskolen, og om privatskoler når brukeren ikke har valgt «Privatskole», står lenger ned. De tas ikke bort.
 * Ellers står treffene i samme rekkefølge (avgjørelse 100).
 */
export function rangerTreff<T extends { score: number; omrade?: readonly Sokeomrade[] | null }>(treff: readonly T[], privatskole: boolean): T[] {
  const faktor = (t: T) => (t.omrade?.includes('grunnskole') ? NEDTONING : 1) * (!privatskole && t.omrade?.includes('privatskole') ? NEDTONING : 1);
  return treff
    .map((t, i) => ({ t: { ...t, score: t.score * faktor(t) }, i }))
    .sort((a, b) => b.t.score - a.t.score || a.i - b.i)
    .map((x) => x.t);
}
