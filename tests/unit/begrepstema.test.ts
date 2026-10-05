import { readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { begrepstemaer, filnavn, TEMA_FOR_FIL } from '../../src/modules/begreper/tema.ts';

describe('temaene i begrepsbanken', () => {
  const filer = readdirSync('content/begreper').filter((f) => f.endsWith('.yaml'));

  it('hver fil i content/begreper har et tema', () => {
    const uten = filer.map(filnavn).filter((f) => !(f in TEMA_FOR_FIL));
    expect(uten).toEqual([]);
  });

  it('hvert tema har minst én fil, og ingen filer er ført opp uten å finnes', () => {
    const navn = new Set(filer.map(filnavn));
    expect(Object.keys(TEMA_FOR_FIL).filter((f) => !navn.has(f))).toEqual([]);
    for (const tema of begrepstemaer) expect(Object.values(TEMA_FOR_FIL)).toContain(tema);
  });
});
