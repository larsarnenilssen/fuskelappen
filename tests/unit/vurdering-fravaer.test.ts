// Fraværsgrensen: kanttilfeller som fasittestene (tests/fasit/vurdering) ikke dekker.
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { finnVerdi } from '../../src/core/regler/motor.ts';
import { beregnGrenser, type Hent, sjekkFravaer } from '../../src/modules/vurdering/beregning/fravaer.ts';
import { lesRegelsett } from '../../scripts/innhold/alt.ts';

const regelsett = lesRegelsett(join(__dirname, '../..'));
const hent: Hent = (nokkel) => finnVerdi(regelsett, nokkel, { dato: '2026-10-04' });
const tomt = { udokumentert: 0, helse: 0, helseEtter: 0, andre: 0 };

describe('fraværsgrensen', () => {
  it('gjelder ikke før § 9-8 ble endret 1.8.2025', () => {
    expect(() => finnVerdi(regelsett, 'vurdering.fravaer_grense_prosent', { dato: '2025-07-31' })).toThrow();
  });

  it('regner ikke grensen ned når den er et helt tall', () => {
    // 14 × 60 ÷ 60 kan bli 13,999… med flyttall.
    const g = beregnGrenser(hent, { arstimer: 140, minutter: 60 });
    expect(g.grense.innenfor).toBe(14);
    expect(g.steg.map((s) => s.id)).toEqual(['arstimer', 'grense', 'innenfor', 'skjonn', 'skjonnInnenfor']);
  });

  it('regner om til økter når øktene ikke er 60 minutter', () => {
    const g = beregnGrenser(hent, { arstimer: 140, minutter: 90 });
    expect(g.grense.okter).toBeCloseTo(9.333, 3);
    expect(g.grense.innenfor).toBe(9);
    expect(g.steg.some((s) => s.id === 'okter')).toBe(true);
  });

  it('tar med kilden til årstimetallet når faget er valgt', () => {
    const g = beregnGrenser(hent, { arstimer: 140, minutter: 60, arstimerKilde: { id: 'udir-grep', punkt: 'ENG1007' } });
    expect(g.steg[0]?.kilder[0]?.id).toBe('udir-grep');
  });

  it('avviser årstimetall og øktlengde som ikke kan brukes', () => {
    expect(() => beregnGrenser(hent, { arstimer: 0, minutter: 60 })).toThrow();
    expect(() => beregnGrenser(hent, { arstimer: 140, minutter: 0 })).toThrow();
    expect(() => beregnGrenser(hent, { arstimer: Number.NaN, minutter: 45 })).toThrow();
  });

  it('lar helsefravær «etter grensen» telle til grensen er nådd', () => {
    const g = beregnGrenser(hent, { arstimer: 140, minutter: 60 });
    const r = sjekkFravaer(g, { ...tomt, udokumentert: 10, helseEtter: 6 });
    expect(r.helseEtterTeller).toBe(4);
    expect(r.teller).toBe(14);
    expect(r.utfall).toBe('innenfor');
  });

  it('bruker hele økter når grensen ikke er et helt antall økter', () => {
    const g = beregnGrenser(hent, { arstimer: 140, minutter: 45 });
    const r = sjekkFravaer(g, { ...tomt, udokumentert: 17, helseEtter: 3 });
    expect(r.teller).toBe(18);
    expect(r.utfall).toBe('innenfor');
    expect(sjekkFravaer(g, { ...tomt, udokumentert: 19 }).utfall).toBe('skjonn');
  });

  it('regner prosent og klokketimer av fraværet som teller', () => {
    const g = beregnGrenser(hent, { arstimer: 140, minutter: 45 });
    const r = sjekkFravaer(g, { ...tomt, udokumentert: 20, andre: 4 });
    expect(r.timer).toBe(15);
    expect(r.prosent).toBeCloseTo(10.714, 3);
    expect(r.samlet).toBe(24);
  });

  it('ser bort fra tomme og negative felt', () => {
    const g = beregnGrenser(hent, { arstimer: 140, minutter: 60 });
    expect(sjekkFravaer(g, { udokumentert: Number.NaN, helse: -3, helseEtter: 0, andre: 0 }).teller).toBe(0);
  });
});
