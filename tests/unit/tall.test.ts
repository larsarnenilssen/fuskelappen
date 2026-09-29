import { describe, expect, it } from 'vitest';
import { tolkTall } from '../../src/core/tall.ts';

describe('tolkTall', () => {
  it('godtar desimalkomma, punktum og mellomrom', () => {
    expect(tolkTall('12,5')).toEqual({ ok: true, verdi: 12.5 });
    expect(tolkTall('12.5')).toEqual({ ok: true, verdi: 12.5 });
    expect(tolkTall(' 1 687,5 ')).toEqual({ ok: true, verdi: 1687.5 });
    expect(tolkTall('1 687,5')).toEqual({ ok: true, verdi: 1687.5 });
    expect(tolkTall('−3')).toEqual({ ok: true, verdi: -3 });
    expect(tolkTall(',5')).toEqual({ ok: true, verdi: 0.5 });
  });

  it('avviser ugyldige tall', () => {
    expect(tolkTall('')).toEqual({ ok: false, feil: 'tom' });
    expect(tolkTall('abc')).toEqual({ ok: false, feil: 'ugyldig' });
    expect(tolkTall('1,2,3')).toEqual({ ok: false, feil: 'ugyldig' });
    expect(tolkTall(',')).toEqual({ ok: false, feil: 'ugyldig' });
    expect(tolkTall('-')).toEqual({ ok: false, feil: 'ugyldig' });
  });

  it('sjekker grenser', () => {
    expect(tolkTall('5', { min: 10 })).toEqual({ ok: false, feil: 'forLite' });
    expect(tolkTall('50', { maks: 40 })).toEqual({ ok: false, feil: 'forStort' });
    expect(tolkTall('40', { min: 0, maks: 40 })).toEqual({ ok: true, verdi: 40 });
  });
});
