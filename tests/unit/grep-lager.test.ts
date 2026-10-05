// Lageret for Grep-hentingen (avgjørelse 060): bare nye og endrede elementer hentes, og lageret tåler avbrudd.
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { beskjaer, lesLager, maaHentes, maksAlder, sistEndretFra, skrivLager, type Lagerpost } from '../../scripts/grep/lager.ts';

const post = (sistEndret: string | null, hentet: string): Lagerpost => ({ sistEndret, hentet, data: { kode: 'NOR1267', status: 'publisert' } });

describe('Grep-lageret', () => {
  it('henter elementer som mangler eller har ny dato i listen', () => {
    expect(maaHentes(undefined, 'fagkoder/NOR1267', '2020-06-12T12:37:26', '2026-10-05')).toBe(true);
    expect(maaHentes(post('2020-06-12T12:37:26', '2026-10-05'), 'fagkoder/NOR1267', '2025-01-01T00:00:00', '2026-10-05')).toBe(true);
    expect(maaHentes(post('2020-06-12T12:37:26', '2026-10-05'), 'fagkoder/NOR1267', '2020-06-12T12:37:26', '2026-10-12')).toBe(false);
  });

  it('bruker posten uten dato i listen til den er for gammel', () => {
    expect(maaHentes(post(null, '2026-10-05'), 'fagkoder/X', null, '2026-10-12')).toBe(false);
    expect(maaHentes(post(null, '2025-01-01'), 'fagkoder/X', null, '2026-10-12')).toBe(true);
  });

  it('henter på nytt etter mellom 180 og 359 dager, spredt etter koden', () => {
    const alder = ['fagkoder/A', 'fagkoder/B', 'fagkoder/C', 'opplaeringsfag/NOR1Z47'].map(maksAlder);
    for (const a of alder) {
      expect(a).toBeGreaterThanOrEqual(180);
      expect(a).toBeLessThan(360);
    }
    expect(new Set(alder).size).toBeGreaterThan(1);
    const n = 'fagkoder/NOR1267';
    const dato = (dager: number) => new Date(Date.parse('2026-01-01') + dager * 86_400_000).toISOString().slice(0, 10);
    expect(maaHentes(post('d', '2026-01-01'), n, 'd', dato(maksAlder(n) - 1))).toBe(false);
    expect(maaHentes(post('d', '2026-01-01'), n, 'd', dato(maksAlder(n)))).toBe(true);
  });

  it('fjerner elementer som ikke lenger er i bruk, og leser datoene fra listen', () => {
    expect(Object.keys(beskjaer({ 'fagkoder/A': post(null, 'x'), 'fagkoder/B': post(null, 'x') }, new Set(['fagkoder/B'])))).toEqual(['fagkoder/B']);
    expect(sistEndretFra([{ kode: 'A', status: 's', 'sist-endret': '2020-01-01' }, { kode: 'B', status: 's' }])).toEqual(new Map([['A', '2020-01-01']]));
  });

  it('skriver og leser lageret, og starter tomt når filen er ødelagt', () => {
    const mappe = mkdtempSync(join(tmpdir(), 'grep-lager-'));
    const fil = join(mappe, 'lager.json.gz');
    expect(lesLager(fil)).toEqual({});
    skrivLager(fil, { 'fagkoder/A': post('d', '2026-10-05') });
    expect(lesLager(fil)).toEqual({ 'fagkoder/A': post('d', '2026-10-05') });
    writeFileSync(fil, 'ikke gzip');
    expect(lesLager(fil)).toEqual({});
  });
});
