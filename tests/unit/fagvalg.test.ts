// Fagvalg med fagkode i kalkulatorene (src/modules/arbeidstid/fagvalg.ts), på de ekte dataene.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { finnVerdi, slaaSammen } from '../../src/core/regler/motor.ts';
import type { Regelsett } from '../../src/core/regler/skjema.ts';
import { finnKobling, lesArsrammer, lesKoblinger, velgArsramme } from '../../src/modules/arbeidstid/beregning/index.ts';
import { fagvalgFraKobling, koblingsmetode } from '../../src/modules/arbeidstid/fagvalg.ts';
import type { Fagindeks } from '../../src/modules/fag/skjema.ts';
import { lesFil } from '../../scripts/innhold/last.ts';

const rot = join(__dirname, '../..');
const regler = slaaSammen(
  readdirSync(join(rot, 'rules'), { recursive: true })
    .map(String)
    .filter((f) => f.endsWith('.yaml'))
    .map((f) => lesFil(rot, join(rot, 'rules', f)) as Regelsett),
);
const hent = (n: string) => finnVerdi(regler, n, { dato: '2026-09-30' });
const rader = lesArsrammer(hent('sfs2213.arsrammer'));
const tabeller = lesKoblinger(hent);
const indeks = JSON.parse(readFileSync(join(rot, 'data/grep/fagindeks.json'), 'utf8')) as Fagindeks;
const velg = (kode: string) => {
  const f = indeks.fag[kode];
  if (!f) throw new Error(kode);
  return fagvalgFraKobling(kode, f.navn, f.timer, finnKobling(kode, indeks, tabeller, rader));
};

describe('fagvalg med fagkode', () => {
  it('et koblet fag gir rad, metode og årstimer fra Grep', () => {
    const p = velg('HEA2005');
    expect(p).toMatchObject({ valg: '23', fagkoder: ['HEA2005'], fag: { kode: 'HEA2005', timer: 197, nr: 23, metode: 'regel' } });
    expect(koblingsmetode(p)).toBe('regel');
  });

  it('en annen rad eller egen årsramme er overstyrt (manuell)', () => {
    const p = velg('HEA2005');
    expect(koblingsmetode({ ...p, valg: '2' })).toBe('manuell');
    expect(koblingsmetode({ ...p, valg: 'manuell', t60: 600 })).toBe('manuell');
    expect(koblingsmetode({ valg: '23', t60: null, stjerne: false })).toBeNull();
  });

  it('et flertydig fag venter på valg av program og trinn, med kandidatene', () => {
    const p = velg('SAM3045');
    expect(p.valg).toBe('');
    expect(p.fag?.kandidater.map((k) => `${k.program} ${k.trinn} ${k.t60}`)).toEqual(['ST Vg2 525', 'ST Vg3 496']);
    expect(koblingsmetode(p)).toBeNull();
  });

  it('et fag uten kobling har årstimer, men ingen rad', () => {
    const p = velg('IDR3013');
    expect(p).toMatchObject({ valg: '', fag: { timer: 140, nr: null, metode: null, kandidater: [] } });
    expect(koblingsmetode({ ...p, valg: 'manuell', t60: 525 })).toBe('manuell');
  });

  it('fagkoden står i utregningen ved raden i vedlegg 1', () => {
    const rad = rader.find((r) => r.nr === 23);
    if (!rad) throw new Error('rad 23');
    const { arsramme } = velgArsramme(hent, [{ type: 'rad', rad, fagkode: 'HEA2005' }], null);
    expect(arsramme).toMatchObject({ verdi: 607.5, rad: 'Felles programfag – Helse/sos Vg2 · HEA2005' });
  });
});
