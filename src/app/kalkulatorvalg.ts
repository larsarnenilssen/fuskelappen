// Generelle valg i kalkulatorene som huskes på enheten (eier 04.10.2026): øktlengden. Den gjelder skolen og ikke en
// enkelt sak, så den er den samme i Fraværsgrensen, Vikartimer og gruppene i Beskjeftigelse og Arbeidsplan. Det
// brukeren fyller inn om en sak (fag, timer, fravær), huskes bare i nettleserhistorikken som før.
import { tilstand } from './tilstand.ts';

export interface Oktlengde {
  minutter: number;
  /** Brukeren har skrevet inn minuttene selv («Annet»). */
  fritt: boolean;
}

/** Øktlengden sist valgt, eller null når ingen er valgt eller lagringen ikke kan leses. */
export function lesOktlengde(): Oktlengde | null {
  try {
    const raa = JSON.parse(tilstand.lesValg('oktlengde') ?? 'null') as Partial<Oktlengde> | null;
    if (!raa || typeof raa.minutter !== 'number' || !(raa.minutter > 0) || raa.minutter > 600) return null;
    return { minutter: raa.minutter, fritt: raa.fritt === true };
  } catch {
    return null;
  }
}

/** Husker øktlengden. Tomme eller ugyldige minutter huskes ikke. */
export function huskOktlengde(minutter: number | null, fritt: boolean): void {
  if (minutter === null || !(minutter > 0) || minutter > 600) return;
  tilstand.skrivValg('oktlengde', JSON.stringify({ minutter, fritt }));
}
