// «Om veien» i to kolonner: feltene fyller hele bredden eller deler den to og to (eier 06.10.2026).
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { lesInnhold } from '../../scripts/innhold/alt.ts';
import type { Veielement } from '../../src/core/innhold/skjema.ts';
import { faktaoppstilling } from '../../src/modules/opplaeringslop/sider/faktaoppstilling.ts';

const ALLE = ['kontrakt', 'prove', 'melderOpp', 'fellesfag', 'dokumentasjon', 'voksne'];

describe('faktaoppstilling', () => {
  it('med voksne står alle seks to og to', () => {
    expect(faktaoppstilling(ALLE)).toEqual({});
  });

  it('uten voksne står fellesfagene over to rader, med «Melder opp» og «Dokumentasjon» til venstre', () => {
    expect(faktaoppstilling(ALLE.filter((f) => f !== 'voksne'))).toEqual({ fellesfag: 'hoy' });
  });

  it('når fellesfagene ikke kan stå over to rader, går det siste feltet over hele bredden', () => {
    expect(faktaoppstilling(['fellesfag', 'melderOpp', 'voksne'])).toEqual({ voksne: 'bred' });
    expect(faktaoppstilling(['kontrakt', 'prove', 'melderOpp'])).toEqual({ melderOpp: 'bred' });
  });

  it('hver vei i «Om veien» får en oppstilling uten tomrom', () => {
    const veier = lesInnhold(join(__dirname, '../..'))
      .map((x) => x.element)
      .filter((e): e is Veielement => e.type === 'vei');
    expect(veier.length).toBeGreaterThan(0);
    for (const v of veier) {
      for (const m of ['nb', 'nn'] as const) {
        const felt = ALLE.filter((f) => (f === 'voksne' ? Boolean(v.voksne?.[m]) : true));
        const plass = faktaoppstilling(felt);
        // Et partall felt står to og to. Et oddetall trenger nøyaktig ett felt over to rader eller hele bredden.
        expect(felt.length % 2 === 0 ? Object.keys(plass).length : Object.keys(plass).length - 1, `${v.id} (${m})`).toBe(0);
      }
    }
  });
});
