// Linjenavnene i rundskrivet på nynorsk, og navn appen ikke kjenner (eier 02.10.2026). Testene bruker egne eksempler,
// ikke dataene: et nytt navn i rundskrivet skal meldes i kontrollsaken, ikke stoppe den ukentlige hentingen.
import { describe, expect, it } from 'vitest';
import type { Tilbudsdel, Tilpasning } from '../../src/modules/fag/tilbud/modell.ts';
import { linjenavn, ordning, ukjenteNavn } from '../../src/modules/opplaeringslop/navn.ts';

const del = (linje: string): Tilbudsdel => ({ type: 'plass', linje, kategori: 'valgfritt', timer: 140, antall: 1, kandidater: [], anbefalt: null });
const tilpasning = (navn: string, linje: string): Tilpasning => ({ navn, total: null, linjer: [{ linje, ordinar: 140, timer: null, koder: [] }] });

describe('linjenavn', () => {
  it('gir nynorsk og skriver ut forkortelser på bokmål', () => {
    expect(linjenavn('Fremmedspråk', 'nn')).toEqual({ tekst: 'Framandspråk', kilde: false });
    expect(linjenavn('Fremmedspråk', 'nb')).toEqual({ tekst: 'Fremmedspråk', kilde: false });
    expect(linjenavn('Programfag fra studief. eller yrkesf. utdanningsprogram', 'nb').tekst).toBe('Programfag fra studieforberedende eller yrkesfaglige utdanningsprogram');
  });

  it('viser ukjente navn som i rundskrivet, så ingenting går i stykker', () => {
    expect(linjenavn('Programfag fra nytt område', 'nn')).toEqual({ tekst: 'Programfag fra nytt område', kilde: true });
  });

  it('kjenner igjen de tilpassede ordningene og finner navn som mangler', () => {
    expect(ordning('Med stud.spes Vg1')).toBe('medStudiespesialisering');
    expect(ordning('Uten fr.språk gr.sk')).toBe('utenFremmedsprak');
    expect(ordning('Med påbygg vg2')).toBeNull();
    const t = { deler: [del('Norsk'), del('Programfag fra nytt område')], tilpasninger: [tilpasning('Samisk', 'Historie'), tilpasning('Med påbygg vg2', 'Ny linje')] };
    expect(ukjenteNavn([t])).toEqual({ linjer: ['Ny linje', 'Programfag fra nytt område'], ordninger: ['Med påbygg vg2'] });
  });
});
