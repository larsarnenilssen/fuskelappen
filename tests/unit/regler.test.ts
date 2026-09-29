import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { finnOverlapp, finnSupplerende, finnVerdi, Regelfeil, velgPeriode } from '../../src/core/regler/motor.ts';
import type { Regelsett } from '../../src/core/regler/skjema.ts';
import { lesFil } from '../../scripts/innhold/last.ts';

const rot = join(__dirname, '../..');
const mappe = join(rot, 'tests/fixtures/regler');
const alle = readdirSync(mappe).map((f) => lesFil(rot, join(mappe, f)) as Regelsett);

describe('regelmotor', () => {
  it('velger periode etter dato', () => {
    expect(velgPeriode(alle, 'testregelverk', { dato: '2026-09-01' }).id).toBe('testregelverk-2026-2027');
    expect(velgPeriode(alle, 'testregelverk', { dato: '2028-03-01' }).id).toBe('testregelverk-2028');
    expect(() => velgPeriode(alle, 'testregelverk', { dato: '2030-01-01' })).toThrow(Regelfeil);
  });

  it('lar brukeren velge en annen periode', () => {
    const v = finnVerdi(alle, 'testregelverk.arsverk_timer', { dato: '2026-09-01', periode: 'testregelverk-2028' });
    expect(v).toMatchObject({ verdi: 1100, periode: 'testregelverk-2028', niva: 'nasjonal' });
  });

  it('returnerer verdi, nivå og kilde', () => {
    const v = finnVerdi(alle, 'testregelverk.arsverk_timer', { dato: '2026-09-01' });
    expect(v).toEqual({
      verdi: 1000,
      enhet: 'timer',
      niva: 'nasjonal',
      fylke: null,
      skole: null,
      kilde: { id: 'ks-sfs2213', punkt: '4' },
      kontrollert: null,
      regelsett: 'testregelverk-2026-2027',
      periode: 'testregelverk-2026-2027',
    });
  });

  it('bruker lokale verdier i rekkefølgen skole → fylke → nasjonal', () => {
    const dato = '2026-09-01';
    expect(finnVerdi(alle, 'testregelverk.uker', { dato }).verdi).toBe(38);
    expect(finnVerdi(alle, 'testregelverk.uker', { dato, fylke: '46' })).toMatchObject({ verdi: 37, niva: 'fylke', fylke: '46' });
    expect(finnVerdi(alle, 'testregelverk.uker', { dato, fylke: '46', skole: '999999999' })).toMatchObject({
      verdi: 36,
      niva: 'skole',
      skole: '999999999',
    });
    // Annet fylke: nasjonal verdi.
    expect(finnVerdi(alle, 'testregelverk.uker', { dato, fylke: '11' }).niva).toBe('nasjonal');
    // Verdier skolen ikke har, faller tilbake til nasjonal.
    expect(finnVerdi(alle, 'testregelverk.arsverk_timer', { dato, fylke: '46', skole: '999999999' }).niva).toBe('nasjonal');
  });

  it('bruker ikke lokale verdier utenfor deres gyldighet', () => {
    expect(finnVerdi(alle, 'testregelverk.uker', { dato: '2027-09-01', fylke: '46' }).niva).toBe('nasjonal');
  });

  it('holder lokal vurdering innenfor valgt periode', () => {
    // Datoen er i 2026, men valgt periode er 2028: lokale regelsett fra 2026 skal ikke brukes.
    const v = finnVerdi(alle, 'testregelverk.uker', { dato: '2026-09-01', periode: 'testregelverk-2028', fylke: '46' });
    expect(v).toMatchObject({ verdi: 39, niva: 'nasjonal' });
  });

  it('samler verdier som supplerer, gruppert etter nivå', () => {
    const g = finnSupplerende(alle, 'testregelverk.regler', { dato: '2026-09-01', fylke: '46', skole: '999999999' });
    expect(g.nasjonal.map((o) => o.verdi)).toEqual([['nasjonal-regel']]);
    expect(g.skole.map((o) => o.verdi)).toEqual([['skolens-egen-regel']]);
    expect(g.fylke).toEqual([]);
    const utenSkole = finnSupplerende(alle, 'testregelverk.regler', { dato: '2026-09-01' });
    expect(utenSkole.skole).toEqual([]);
  });

  it('feiler tydelig for ukjent nøkkel', () => {
    expect(() => finnVerdi(alle, 'testregelverk.finnes_ikke', { dato: '2026-09-01' })).toThrow(Regelfeil);
    expect(() => finnVerdi(alle, 'utennokkel', { dato: '2026-09-01' })).toThrow(Regelfeil);
  });

  it('oppdager overlappende perioder', () => {
    expect(finnOverlapp(alle)).toEqual([]);
    const [forste] = alle.filter((r) => r.id === 'testregelverk-2026-2027');
    const kopi = { ...(forste as Regelsett), id: 'kopi', gyldig_fra: '2027-06-01', gyldig_til: '2028-06-30' };
    expect(finnOverlapp([...alle, kopi]).length).toBeGreaterThan(0);
    expect(() => velgPeriode([...alle, kopi], 'testregelverk', { dato: '2027-07-01' })).toThrow(/Overlappende/);
  });
});
