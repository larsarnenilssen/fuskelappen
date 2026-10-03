// Fagene i et løp (Vg1 eller Vg2) til poengberegningen, fra fag- og timefordelingen i data/udir. Testene bruker de
// ekte dataene, så de feiler hvis Udir endrer tabellene på en måte kalkulatoren ikke forstår.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Fagfordeling } from '../../src/modules/fag/tilbud/skjema.ts';
import { lopsrader, programomraderVg2, UTDANNINGSPROGRAM } from '../../src/modules/inntak/beregning/lop.ts';

const mappe = join(__dirname, '../../data/udir');
const fil = readdirSync(mappe).filter((f) => f.startsWith('fagfordeling-')).sort().at(-1) as string;
const data = JSON.parse(readFileSync(join(mappe, fil), 'utf8')) as Fagfordeling;
const navn = (r: ReturnType<typeof lopsrader>) => r.map((x) => `${x.fag ?? x.programfag}:${x.type}`);

describe('løp til poengberegningen', () => {
  it('studiespesialisering Vg1: fellesfagene med standpunkt, og halvår i fag som fortsetter', () => {
    expect(navn(lopsrader(data, 'ST', 'Vg1'))).toEqual([
      'norsk:halvar',
      'matematikk:standpunkt',
      'naturfag:standpunkt',
      'engelsk:standpunkt',
      'fremmedsprak:halvar',
      'samfunnskunnskap:standpunkt',
      'geografi:standpunkt',
      'kroppsoving:halvar',
    ]);
  });

  it('studiespesialisering Vg2: norsk, historie og kroppsøving fortsetter og har halvår', () => {
    expect(navn(lopsrader(data, 'ST', 'Vg2'))).toEqual(['norsk:halvar', 'matematikk:standpunkt', 'fremmedsprak:standpunkt', 'historie:halvar', 'kroppsoving:halvar']);
  });

  it('helse- og oppvekstfag: felles programfag fra tabell 18 og 19, før yrkesfaglig fordypning', () => {
    expect(navn(lopsrader(data, 'HS', 'Vg1'))).toEqual([
      'matematikk:standpunkt',
      'naturfag:standpunkt',
      'engelsk:standpunkt',
      'kroppsoving:halvar',
      'Helsefremmende arbeid:standpunkt',
      'Kommunikasjon og samhandling:standpunkt',
      'Yrkesliv i helse- og oppvekstfag:standpunkt',
      'yff:standpunkt',
    ]);
    expect(programomraderVg2(data, 'HS')).toContain('Helsearbeiderfag');
    expect(navn(lopsrader(data, 'HS', 'Vg2', 'Helsearbeiderfag'))).toEqual([
      'norsk:standpunkt',
      'samfunnskunnskap:standpunkt',
      'kroppsoving:standpunkt',
      'Helsefremmende arbeid:standpunkt',
      'Kommunikasjon og samhandling:standpunkt',
      'Yrkesliv i helsearbeiderfag:standpunkt',
      'yff:standpunkt',
    ]);
  });

  it('alle utdanningsprogrammene har fag på Vg1 og Vg2, og yrkesfagene har felles programfag', () => {
    for (const p of UTDANNINGSPROGRAM) {
      expect(lopsrader(data, p.kode, 'Vg1').length, `${p.kode} Vg1`).toBeGreaterThan(2);
      expect(lopsrader(data, p.kode, 'Vg2').length, `${p.kode} Vg2`).toBeGreaterThan(1);
      if (p.retning === 'yrkesfag') {
        expect(lopsrader(data, p.kode, 'Vg1').some((r) => r.programfag), `${p.kode} programfag Vg1`).toBe(true);
        const po = programomraderVg2(data, p.kode);
        expect(po.length, `${p.kode} programområder Vg2`).toBeGreaterThan(0);
        expect(lopsrader(data, p.kode, 'Vg2', po[0] ?? null).some((r) => r.programfag), `${p.kode} programfag Vg2`).toBe(true);
      }
    }
  });
});
