// Regelverket og kildene nederst i kortene om lærlinger og kandidater (eier 06.10.2026): paragrafene til «I regelverket»
// hentes fra kildene, og kildene står bare én gang.
import { describe, expect, it } from 'vitest';
import { paragraferFra, unikeKilder } from '../../src/modules/opplaeringslop/fagbrev/data.ts';

describe('kildene nederst i kortene', () => {
  it('paragrafene i lov og forskrift blir lenker til Regelverk, hver paragraf én gang', () => {
    expect(
      paragraferFra([
        { id: 'opplaeringslova', punkt: '§ 5-1 andre ledd' },
        { id: 'opplaeringsforskrifta', punkt: '§ 9-30 og § 9-31' },
        { id: 'opplaeringslova', punkt: '§ 5-1 sjette ledd' },
        { id: 'udir-retten-til-vgo', punkt: 'Hvordan bli lærekandidat' },
      ]),
    ).toEqual(['opplaeringslova/5-1', 'opplaeringsforskrifta/9-30', 'opplaeringsforskrifta/9-31']);
  });

  it('samme kilde med samme punkt står bare én gang', () => {
    const k = { id: 'opplaeringslova', punkt: '§ 7-3' };
    expect(unikeKilder([k, { ...k }, { id: 'opplaeringslova', punkt: '§ 7-2' }])).toHaveLength(2);
  });
});
