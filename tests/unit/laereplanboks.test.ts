import { describe, expect, it } from 'vitest';
import { fagPerTrinn, kortFagnavn, laereplanerPerMalgruppe } from '../../src/components/Laereplanboks.tsx';
import type { Fagindeks } from '../../src/modules/fag/skjema.ts';

const fag = (lp: string, trinn: string[]) => ({ navn: { nb: 'x', nn: 'x' }, type: 'fellesfag', trinn, timer: null, lp, elev: null });
// Bare feltene grupperingen bruker.
const indeks = {
  fag: {
    B2: fag('AAA01-01', ['Vg2', 'Vg3']),
    A3: fag('AAA01-01', ['Vg3']),
    A1: fag('AAA01-01', ['Vg1']),
    A2: fag('AAA01-01', ['Vg2']),
    B1: fag('AAA01-01', ['Vg1']),
    C1: fag('BBB01-01', ['Vg1']),
  },
} as unknown as Fagindeks;

describe('læreplanboksen', () => {
  it('grupperer fagkodene til læreplanen per trinn, i rekkefølge, og fag på flere trinn under hvert av dem', () => {
    expect(fagPerTrinn(indeks, 'AAA01-01')).toEqual([
      ['Vg1', ['A1', 'B1']],
      ['Vg2', ['A2', 'B2']],
      ['Vg3', ['A3', 'B2']],
    ]);
    expect(fagPerTrinn(indeks, 'CCC01-01')).toEqual([]);
  });

  it('korter fagnavnet til det som kommer etter læreplanen', () => {
    expect(kortFagnavn('Grunnleggende norsk for språklige minoriteter, nivå 1, vg1 studieforberedende utdanningsprogram')).toBe(
      'Nivå 1, vg1 studieforberedende utdanningsprogram',
    );
    expect(kortFagnavn('Norsk')).toBe('Norsk');
  });

  it('grupperer læreplanene etter målgruppe, elever først, og utelater tomme grupper', () => {
    const lp = (kode: string, malgruppe: 'elever' | 'voksne') => ({ kode, malgruppe, merknad: { nb: 'x', nn: 'x' } });
    const voksen = lp('GNS02-01', 'voksne');
    const elev1 = lp('NOR07-03', 'elever');
    const elev2 = lp('NOR09-05', 'elever');
    expect(laereplanerPerMalgruppe([voksen, elev1, elev2])).toEqual([
      ['elever', [elev1, elev2]],
      ['voksne', [voksen]],
    ]);
    expect(laereplanerPerMalgruppe([elev1])).toEqual([['elever', [elev1]]]);
  });
});
