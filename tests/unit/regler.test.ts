import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { finnLokaleNokler, finnOverlapp, finnSupplerende, finnVerdi, Regelfeil, slaaSammen, somTabell, somTall, velgPeriode } from '../../src/core/regler/motor.ts';
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

  it('finner lokale verdier som supplerer, med et prefiks, bare for brukerens fylke og skole', () => {
    expect(finnLokaleNokler(alle, 'testregelverk.reg', { dato: '2026-09-01', fylke: '46', skole: '999999999' })).toEqual(['testregelverk.regler']);
    // Fylkesverdier som erstatter (uker), er ikke med.
    expect(finnLokaleNokler(alle, 'testregelverk.uk', { dato: '2026-09-01', fylke: '46' })).toEqual([]);
    expect(finnLokaleNokler(alle, 'testregelverk.reg', { dato: '2026-09-01' })).toEqual([]);
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

describe('regelsett delt på flere filer', () => {
  const del = (navn: string, verdier: Regelsett['verdier'], endring: Partial<Regelsett> = {}): Regelsett => ({
    id: 'delt-2026',
    regelverk: 'delt',
    del: navn,
    gyldig_fra: '2026-01-01',
    gyldig_til: '2026-12-31',
    kilde: 'ks-sfs2213',
    gyldighet: { niva: 'nasjonal' },
    verdier,
    ...endring,
  });
  const v = (verdi: number) => ({ verdi, kilde: { id: 'ks-sfs2213' }, kontrollert: null });

  it('slår sammen delene til ett regelsett', () => {
    const samlet = slaaSammen([del('a', { en: v(1) }), del('b', { to: v(2) })]);
    expect(samlet).toHaveLength(1);
    expect(samlet[0]?.del).toBeUndefined();
    expect(finnVerdi(samlet, 'delt.to', { dato: '2026-05-01' }).verdi).toBe(2);
  });

  it('avviser samme nøkkel i to deler og ulik periode', () => {
    expect(() => slaaSammen([del('a', { en: v(1) }), del('b', { en: v(2) })])).toThrow(Regelfeil);
    expect(() => slaaSammen([del('a', { en: v(1) }), del('b', { to: v(2) }, { gyldig_til: '2026-06-30' })])).toThrow(Regelfeil);
  });

  it('gir tall og tabeller med typesjekk', () => {
    const samlet = slaaSammen([del('a', { tall: v(3), tabell: { verdi: [{ a: 1, b: 'x' }], kilde: { id: 'ks-sfs2213' }, kontrollert: null } })]);
    expect(somTall(finnVerdi(samlet, 'delt.tall', { dato: '2026-05-01' }))).toBe(3);
    expect(somTabell(finnVerdi(samlet, 'delt.tabell', { dato: '2026-05-01' }))).toEqual([{ a: 1, b: 'x' }]);
    expect(() => somTall(finnVerdi(samlet, 'delt.tabell', { dato: '2026-05-01' }))).toThrow(Regelfeil);
    expect(() => somTabell(finnVerdi(samlet, 'delt.tall', { dato: '2026-05-01' }))).toThrow(Regelfeil);
  });
});

describe('SFS 2213 med lokale testverdier', () => {
  const regelmappe = (m: string) =>
    readdirSync(join(rot, m), { recursive: true })
      .map(String)
      .filter((f) => f.endsWith('.yaml'))
      .map((f) => lesFil(rot, join(rot, m, f)) as Regelsett);
  const samlet = slaaSammen([...regelmappe('rules'), ...alle]);
  const dato = '2026-09-29';

  it('bruker nasjonal verdi uten valgt fylke', () => {
    expect(finnVerdi(samlet, 'sfs2213.planfestet_timer', { dato })).toMatchObject({ verdi: 1150, niva: 'nasjonal' });
  });

  it('fylkesverdi erstatter nasjonal, og skoleverdi går foran fylket', () => {
    expect(finnVerdi(samlet, 'sfs2213.planfestet_timer', { dato, fylke: '46' })).toMatchObject({ verdi: 1100, niva: 'fylke' });
    expect(finnVerdi(samlet, 'sfs2213.planfestet_timer', { dato, fylke: '46', skole: '999999999' })).toMatchObject({ verdi: 1050, niva: 'skole' });
    expect(finnVerdi(samlet, 'sfs2213.arsverk_timer', { dato, fylke: '46', skole: '999999999' })).toMatchObject({ verdi: 1687.5, niva: 'nasjonal' });
  });

  it('årsrammene fra vedlegg 1 er del av samme periode', () => {
    const o = finnVerdi(samlet, 'sfs2213.arsrammer', { dato });
    expect(o.periode).toBe('sfs2213-2026-2027');
    expect(somTabell(o).length).toBeGreaterThan(100);
  });
});
