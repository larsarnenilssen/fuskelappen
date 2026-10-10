// Plasseringen av gruppene på forsiden i spalter (avgjørelse 108).
import { describe, expect, it } from 'vitest';
import { plasserGrupper } from '../../src/core/forside/oppsett.ts';

const apen = (hoyde: number) => ({ hoyde, lukket: false });
const lukket = (hoyde = 50) => ({ hoyde, lukket: true });

describe('plasseringen av gruppene på forsiden', () => {
  it('åpne grupper står i rader, med overskriftene på linje', () => {
    expect(plasserGrupper([apen(300), apen(200), apen(100), apen(250)], 2)).toEqual([
      { spalte: 0, topp: 0 },
      { spalte: 1, topp: 0 },
      { spalte: 0, topp: 300 },
      { spalte: 1, topp: 300 },
    ]);
  });

  it('lukkede grupper rykker opp i luften ved siden av en åpen gruppe, så langt de får plass', () => {
    expect(plasserGrupper([apen(300), lukket(), lukket(), lukket(), lukket(), lukket(), apen(200)], 2)).toEqual([
      { spalte: 0, topp: 0 },
      { spalte: 1, topp: 0 },
      { spalte: 1, topp: 50 },
      { spalte: 1, topp: 100 },
      { spalte: 1, topp: 150 },
      { spalte: 1, topp: 200 },
      // Den neste åpne starter en ny rad under den høyeste.
      { spalte: 0, topp: 300 },
    ]);
  });

  it('en lukket gruppe som ikke får plass, starter en ny rad', () => {
    expect(plasserGrupper([apen(120), lukket(), lukket(), lukket()], 2)).toEqual([
      { spalte: 0, topp: 0 },
      { spalte: 1, topp: 0 },
      { spalte: 1, topp: 50 },
      { spalte: 0, topp: 120 },
    ]);
    // Med slingring får den plass når den går litt forbi.
    expect(plasserGrupper([apen(140), lukket(), lukket(), lukket()], 2, 10)[3]).toEqual({ spalte: 1, topp: 100 });
  });

  it('to lukkede ved siden av hverandre er en vanlig rad', () => {
    expect(plasserGrupper([lukket(), lukket(), lukket(), apen(200)], 2)).toEqual([
      { spalte: 0, topp: 0 },
      { spalte: 1, topp: 0 },
      { spalte: 0, topp: 50 },
      { spalte: 1, topp: 50 },
    ]);
  });

  it('lukkede grupper fyller også luften under den lavere av to åpne, og under en lukket til venstre', () => {
    expect(plasserGrupper([apen(300), apen(180), lukket(), lukket(), lukket(), lukket(), apen(100)], 2)).toEqual([
      { spalte: 0, topp: 0 },
      { spalte: 1, topp: 0 },
      { spalte: 1, topp: 180 },
      { spalte: 1, topp: 230 },
      { spalte: 0, topp: 300 },
      { spalte: 1, topp: 300 },
      { spalte: 0, topp: 350 },
    ]);
    expect(plasserGrupper([lukket(), apen(200), lukket()], 2)[2]).toEqual({ spalte: 0, topp: 50 });
  });

  it('tre spalter, og én spalte', () => {
    expect(plasserGrupper([apen(300), lukket(), apen(100), lukket(), lukket()], 3)).toEqual([
      { spalte: 0, topp: 0 },
      { spalte: 1, topp: 0 },
      { spalte: 2, topp: 0 },
      { spalte: 1, topp: 50 },
      // Slutter to spalter like høyt, brukes den til venstre.
      { spalte: 1, topp: 100 },
    ]);
    expect(plasserGrupper([apen(100), lukket()], 1)).toEqual([
      { spalte: 0, topp: 0 },
      { spalte: 0, topp: 100 },
    ]);
  });
});
