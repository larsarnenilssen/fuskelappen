// Filteret for kilder som også skriver om barnehage, grunnskole og høyere utdanning (regjeringen, Udir,
// Statsforvalteren, nyhetsmedier og forskning). Ordene står i content/nyheter/kilder.yaml, så eier kan se og endre
// dem. Rene funksjoner, testet i tests/unit/nyheter-filter.test.ts.

export interface Nyhetsfilter {
  /** Ord som alltid gjør en sak relevant, f.eks. «videregående» og «lærling». */
  sterke: string[];
  /** Ord om skole generelt. Gjør saken relevant når ingen ord i `utelukker` står der. */
  generelle: string[];
  /** Ord om andre deler av utdanningen. Utelukker en sak som bare har generelle ord. */
  utelukker: string[];
  /** Ord som alltid utelukker en sak, f.eks. medlemstilbud. */
  aldri: string[];
}

/** Et ord eller uttrykk som starten på et ord, uten hensyn til store og små bokstaver. «elev» treffer «elevene». */
function monster(ord: readonly string[]): RegExp | null {
  if (ord.length === 0) return null;
  const deler = ord.map((o) => o.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+'));
  return new RegExp(`(?<![\\p{L}\\p{N}])(?:${deler.join('|')})`, 'iu');
}

export type Vurdering = 'sterk' | 'generell' | 'utelukket' | 'aldri' | 'ingen';

/**
 * Hvorfor en sak er med eller ikke. Til rapporten og testene.
 * - `aldri`: et ord fra `aldri` står i tittelen eller teksten.
 * - `utelukket`: tittelen handler om en annen del av utdanningen (f.eks. «barnehage» eller «fagskole») og har ingen
 *   sterke ord, eller de generelle ordene står bare i ingressen, og et ord fra `utelukker` står der også.
 * - `ingen`: ingen sterke ord, og ingen generelle ord i tittelen og færre enn to ulike i ingressen.
 * - `sterk` og `generell`: saken er med.
 */
export function vurder(filter: Nyhetsfilter, tittel: string, tekst = ''): Vurdering {
  const [sterke, generelle, utelukker, aldri] = [filter.sterke, filter.generelle, filter.utelukker, filter.aldri].map(monster);
  const alt = `${tittel} ${tekst}`;
  if (aldri?.test(alt)) return 'aldri';
  if (utelukker?.test(tittel) && !sterke?.test(tittel)) return 'utelukket';
  if (sterke?.test(alt)) return 'sterk';
  // Generelle ord: ett i tittelen, eller minst to ulike i ingressen. Står et generelt ord i tittelen, utelukker bare
  // tittelen saken (over), så «Eksamen i sikker nettleser» er med selv om ingressen nevner grunnskolen (eier 07.10.2026).
  if (generelle?.test(tittel)) return 'generell';
  if (antallUlike(filter.generelle, tekst) < 2) return 'ingen';
  return utelukker?.test(tekst) ? 'utelukket' : 'generell';
}

/** Hvor mange av ordene som står i teksten. */
function antallUlike(ord: readonly string[], tekst: string): number {
  return ord.filter((o) => monster([o])?.test(tekst)).length;
}

export function erRelevant(filter: Nyhetsfilter, tittel: string, tekst = ''): boolean {
  const v = vurder(filter, tittel, tekst);
  return v === 'sterk' || v === 'generell';
}
