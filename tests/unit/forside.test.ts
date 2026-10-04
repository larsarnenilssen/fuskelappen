// Rekkefølgen og flyttingen på forsiden (avgjørelse 056).
import { describe, expect, it } from 'vitest';
import { flytt, flyttInnenfor, modulForFavoritt, ordneGrupper } from '../../src/core/forside/ordning.ts';

describe('forsiden', () => {
  it('flytter et element opp og ned, og lar listen være når plassen er utenfor', () => {
    expect(flytt(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd']);
    expect(flytt(['a', 'b', 'c', 'd'], 3, 0)).toEqual(['d', 'a', 'b', 'c']);
    expect(flytt(['a', 'b'], 0, 5)).toEqual(['a', 'b']);
  });

  it('tom rekkefølge gir standard', () => {
    expect(ordneGrupper(['favoritter', 'inntak', 'fag'], [])).toEqual(['favoritter', 'inntak', 'fag']);
  });

  it('bruker brukerens rekkefølge, tar bort ukjente og setter nye inn etter gruppen foran i standarden', () => {
    expect(ordneGrupper(['favoritter', 'inntak', 'fag', 'elev'], ['fag', 'gammel', 'favoritter', 'inntak'])).toEqual(['fag', 'elev', 'favoritter', 'inntak']);
    expect(ordneGrupper(['ny', 'favoritter', 'fag'], ['fag', 'favoritter'])).toEqual(['ny', 'fag', 'favoritter']);
  });

  it('flytter innenfor et utvalg og lar resten stå', () => {
    // Favorittene under én kategori (b, d) byttes, a og c står der de sto.
    expect(flyttInnenfor(['a', 'b', 'c', 'd'], ['b', 'd'], 1, 0)).toEqual(['a', 'd', 'c', 'b']);
    expect(flyttInnenfor(['a', 'b', 'c'], ['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a']);
  });

  it('finner modulen til en favoritt', () => {
    expect(modulForFavoritt('inntak:frister')).toBe('inntak');
    expect(modulForFavoritt('begreper:standpunktkarakter')).toBe('begreper');
  });
});
