// Poengberegningen ved inntak: kanttilfeller som fasittestene (tests/fasit/inntak) ikke dekker.
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { finnVerdi } from '../../src/core/regler/motor.ts';
import { avrund, beregnVg1, beregnVg2Vg3, beste, type Hent } from '../../src/modules/inntak/beregning/poeng.ts';
import { lesRegelsett } from '../../scripts/innhold/alt.ts';

const regelsett = lesRegelsett(join(__dirname, '../..'));
const hent: Hent = (nokkel) => finnVerdi(regelsett, nokkel, { dato: '2026-10-03' });

describe('poengberegning ved inntak', () => {
  it('avrunder etter vanlige regler, også når flyttall gir 4,12499…', () => {
    expect(avrund(4.125, 2)).toBe(4.13);
    expect(avrund(33 / 8, 2)).toBe(4.13);
    expect(avrund(4.12499, 2)).toBe(4.12);
    expect(avrund(4.428571, 2)).toBe(4.43);
  });

  it('velger den beste av to karakterer, og en karakter går foran IV og fritak', () => {
    expect(beste(3, 5, hent)).toBe(5);
    expect(beste(5, 3, hent)).toBe(5);
    expect(beste('IV', 2, hent)).toBe(2);
    expect(beste(4, 'fritak', hent)).toBe(4);
    expect(beste('fritak', 4, hent)).toBe(4);
    expect(beste(4, null, hent)).toBe(4);
  });

  it('valgfag teller ikke når søkeren har tatt fag fra videregående i stedet', () => {
    const r = beregnVg1(hent, { standpunkt: [5, 4], eksamen: [], valgfag: [2, 2], valgfagErstattet: true });
    expect(r.poeng).toBe(45);
    expect(r.steg.find((s) => s.id === 'utelatt')?.utelatt).toEqual({ valgfag_erstattet: 2 });
  });

  it('sier fra om individuell behandling når mer enn halvparten av fagene mangler karakter', () => {
    expect(beregnVg1(hent, { standpunkt: [4, 'IV', 'fritak', 5], eksamen: [], valgfag: [] }).individuell).toBe(false);
    expect(beregnVg1(hent, { standpunkt: [4, 'IV', 'fritak'], eksamen: [], valgfag: [] }).individuell).toBe(true);
    expect(beregnVg2Vg3(hent, { trinn: 'Vg2', rader: [{ type: 'standpunkt', vurdering: 'deltatt' }] }).individuell).toBe(true);
    expect(beregnVg2Vg3(hent, { trinn: 'Vg2', rader: [{ type: 'standpunkt', vurdering: 4 }] }).individuell).toBe(false);
  });

  it('halvårsvurdering fra Vg1 teller til Vg2, men ikke til Vg3 når samme fag har halvårsvurdering på Vg2', () => {
    const rader = [
      { trinn: 'Vg1' as const, type: 'halvar' as const, fag: 'norsk', vurdering: 3 as const },
      { trinn: 'Vg2' as const, type: 'halvar' as const, fag: 'norsk', vurdering: 5 as const },
    ];
    expect(beregnVg2Vg3(hent, { trinn: 'Vg3', rader }).sum).toBe(5);
    expect(beregnVg2Vg3(hent, { trinn: 'Vg2', rader: rader.slice(0, 1) }).sum).toBe(3);
  });

  it('til Vg3 gjelder den siste vurderingen i fag som fortsetter, og standpunkt står (eier 03.10.2026)', () => {
    const rader = [
      { trinn: 'Vg1' as const, type: 'halvar' as const, fag: 'kroppsoving', vurdering: 3 as const },
      { trinn: 'Vg2' as const, type: 'standpunkt' as const, fag: 'kroppsoving', vurdering: 5 as const },
      { trinn: 'Vg1' as const, type: 'standpunkt' as const, fag: 'engelsk', vurdering: 4 as const },
    ];
    const r = beregnVg2Vg3(hent, { trinn: 'Vg3', rader });
    expect(r.teller).toEqual([5, 4]);
    expect(r.steg.find((s) => s.id === 'utelatt')?.utelatt).toEqual({ halvar_erstattet: 1 });
  });

  it('har trinnene i utregningen med kilde', () => {
    const r = beregnVg1(hent, { standpunkt: [5, 4, 'IV'], eksamen: [4], valgfag: [5] });
    expect(r.steg.map((s) => s.id)).toEqual(['karakterer', 'null', 'valgfag', 'snitt', 'avrunding', 'poeng']);
    expect(r.steg.find((s) => s.id === 'poeng')?.kilder[0]?.id).toBe('opplaeringsforskrifta');
  });
});
