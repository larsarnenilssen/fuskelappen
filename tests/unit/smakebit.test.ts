import { describe, expect, it } from 'vitest';
import { forsteSetning, svargrupper } from '../../src/components/Veiviser.tsx';

describe('smakebiten i et lukket steg', () => {
  it('er den første setningen i teksten', () => {
    expect(forsteSetning('<p>Søknaden sendes til fylket. Søkere som flytter, sender til det nye fylket.</p>')).toBe('Søknaden sendes til fylket.');
  });

  it('avslutter ikke ved punktum etter tall eller forkortelser', () => {
    expect(forsteSetning('<p>Fristen er 1. februar, f.eks. for søkere med vedtak. Ellers 1. mars.</p>')).toBe('Fristen er 1. februar, f.eks. for søkere med vedtak.');
  });

  it('avslutter ved kolon foran en liste, og kutter lange setninger', () => {
    expect(forsteSetning('<p>Fylkeskommunen fatter et vedtak om hva eleven skal få:</p><ul><li>Norsk</li></ul>')).toBe('Fylkeskommunen fatter et vedtak om hva eleven skal få:');
    const lang = forsteSetning(`<p>${'ord '.repeat(80)}slutt.</p>`, 40);
    expect(lang.length).toBeLessThanOrEqual(42);
    expect(lang.endsWith('…')).toBe(true);
  });
});

describe('svarene i grupper', () => {
  const svar = (id: string, gruppe?: string) => ({ id, neste: 'x', tekst: { nb: id, nn: id }, ...(gruppe ? { gruppe: { nb: gruppe, nn: gruppe } } : {}) });

  it('samler svar etter hverandre med samme gruppe under én overskrift', () => {
    const grupper = svargrupper([svar('a', 'Fortrinnsrett'), svar('b', 'Fortrinnsrett'), svar('c', 'Uten'), svar('d', 'Uten')], 'nb');
    expect(grupper.map((g) => [g.tittel, g.svar.map((a) => a.id)])).toEqual([
      ['Fortrinnsrett', ['a', 'b']],
      ['Uten', ['c', 'd']],
    ]);
  });

  it('svar uten gruppe står i én liste uten overskrift', () => {
    expect(svargrupper([svar('ja'), svar('nei')], 'nb')).toEqual([{ tittel: null, svar: [svar('ja'), svar('nei')] }]);
  });
});
