import { describe, expect, it } from 'vitest';
import type { Gyldighet } from '../../src/core/innhold/skjema.ts';
import { beregnStatus, erSynlig, grupperEtterNiva, velgSynlige } from '../../src/core/innhold/status.ts';

const kilder = [{ id: 'ks-sfs2213' }];

describe('innholdsstatus', () => {
  it('utkast når ikke kontrollert', () => {
    expect(beregnStatus({ kontrollert: null, kilder }, {}, '2026-09-29')).toBe('utkast');
  });

  it('kontrollert, og bør kontrolleres etter 12 måneder', () => {
    expect(beregnStatus({ kontrollert: { dato: '2026-01-10' }, kilder }, {}, '2026-09-29')).toBe('kontrollert');
    expect(beregnStatus({ kontrollert: { dato: '2025-09-28' }, kilder }, {}, '2026-09-29')).toBe('bor_kontrolleres');
    expect(beregnStatus({ kontrollert: { dato: '2025-09-29' }, kilder }, {}, '2026-09-29')).toBe('kontrollert');
  });

  it('kilde_endret når kilden er endret etter kontroll', () => {
    const endret = { 'ks-sfs2213': { status: 'endret' as const, endret_siden: '2026-09-01T03:00:00Z' } };
    expect(beregnStatus({ kontrollert: { dato: '2026-08-01' }, kilder }, endret, '2026-09-29')).toBe('kilde_endret');
    expect(beregnStatus({ kontrollert: { dato: '2026-09-15' }, kilder }, endret, '2026-09-29')).toBe('kontrollert');
    const ok = { 'ks-sfs2213': { status: 'ok' as const, endret_siden: null } };
    expect(beregnStatus({ kontrollert: { dato: '2026-08-01' }, kilder }, ok, '2026-09-29')).toBe('kontrollert');
  });
});

const el = (id: string, gyldighet: Gyldighet) => ({ id, gyldighet });

describe('gyldighet', () => {
  const nasjonal = el('a', { niva: 'nasjonal' });
  const fylke = el('a', { niva: 'fylke', fylke: '46', forhold: 'erstatter' });
  const skole = el('a', { niva: 'skole', fylke: '46', skole: '1', forhold: 'erstatter' });
  const tillegg = el('b', { niva: 'skole', fylke: '46', skole: '1', forhold: 'supplerer' });
  const annet = el('c', { niva: 'fylke', fylke: '11', forhold: 'supplerer' });
  const alle = [nasjonal, fylke, skole, tillegg, annet];

  it('viser bare nasjonalt innhold uten valgt fylke', () => {
    expect(velgSynlige(alle, { fylke: null, skole: null })).toEqual([nasjonal]);
    expect(erSynlig(fylke, { fylke: null, skole: null })).toBe(false);
  });

  it('erstatter mer generelt innhold med lokalt', () => {
    expect(velgSynlige(alle, { fylke: '46', skole: null })).toEqual([fylke]);
    expect(velgSynlige(alle, { fylke: '46', skole: '1' })).toEqual([skole, tillegg]);
    expect(velgSynlige(alle, { fylke: '11', skole: null })).toEqual([nasjonal, annet]);
  });

  it('grupperer etter nivå', () => {
    const g = grupperEtterNiva([nasjonal, fylke, tillegg]);
    expect(g.nasjonal).toEqual([nasjonal]);
    expect(g.fylke).toEqual([fylke]);
    expect(g.skole).toEqual([tillegg]);
  });
});
