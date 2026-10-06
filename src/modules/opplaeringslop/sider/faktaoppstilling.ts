// Oppstillingen av faktaene i «Om veien» i to kolonner (eier 06.10.2026): feltene fyller hele bredden eller deler den
// to og to, så boksen ikke får tomrom. Ren funksjon, testet i tests/unit/faktaoppstilling.test.ts.

export type Faktaplass = 'hoy' | 'bred';

/**
 * Plassen til feltene som ikke står vanlig, to og to. Med et partall felt står alle to og to. Med et oddetall står
 * fellesfagene over to rader når de står i høyre kolonne og har et felt etter seg (f.eks. «Melder opp» og
 * «Dokumentasjon» under hverandre til venstre). Ellers går det siste feltet over hele bredden.
 */
export function faktaoppstilling(felt: readonly string[]): Partial<Record<string, Faktaplass>> {
  const n = felt.length;
  if (n % 2 === 0) return {};
  const f = felt.indexOf('fellesfag');
  if (f >= 0 && f % 2 === 1 && f < n - 1) return { fellesfag: 'hoy' };
  const siste = felt[n - 1];
  return siste === undefined ? {} : { [siste]: 'bred' };
}
