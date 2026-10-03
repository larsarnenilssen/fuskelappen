// Fagene i et løp (Vg1 eller Vg2) til poengberegningen, fra fag- og timefordelingen i data/udir. Testene bruker de
// ekte dataene, så de feiler hvis Udir endrer tabellene på en måte kalkulatoren ikke forstår.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Fagfordeling } from '../../src/modules/fag/tilbud/skjema.ts';
import { type Fellesfag, lopsrader, programomraderVg2, TYPER, UTDANNINGSPROGRAM } from '../../src/modules/inntak/beregning/lop.ts';
import type { Fagindeks } from '../../src/modules/fag/skjema.ts';
import { STUDIEFORBEREDENDE } from '../../src/modules/fag/tilbud/modell.ts';
import { inntakNb } from '../../src/strings/moduler/inntak.nb.ts';
import { inntakNn } from '../../src/strings/moduler/inntak.nn.ts';
import { fordelingsfil } from '../../src/data/skolear.ts';

const mappe = join(__dirname, '../../data/udir');
// Samme valg som appen: filen for skoleåret i dag.
const fil = fordelingsfil(readdirSync(mappe), new Date().toISOString().slice(0, 10)) as string;
const data = JSON.parse(readFileSync(join(mappe, fil), 'utf8')) as Fagfordeling;
const navn = (r: ReturnType<typeof lopsrader>) => r.map((x) => `${x.fag ?? x.programfag}:${x.type}`);

describe('løp til poengberegningen', () => {
  it('velger fag- og timefordelingen for skoleåret, ikke den nyeste filen', () => {
    const filer = ['/data/udir/fagfordeling-2026-2027.json', '/data/udir/fagfordeling-2027-2028.json'];
    expect(fordelingsfil(filer, '2027-05-01')).toBe('/data/udir/fagfordeling-2026-2027.json');
    expect(fordelingsfil(filer, '2027-08-01')).toBe('/data/udir/fagfordeling-2027-2028.json');
  });

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

// TYPER i lop.ts sammenlignet med Grep (data/grep/fagindeks.json), som hentes hver uke. Endrer Udir
// vurderingsordningen, feiler testen, og tabellen må sjekkes.
describe('typen karakter i løpene stemmer med Grep', () => {
  const indeks = JSON.parse(readFileSync(join(__dirname, '../../data/grep/fagindeks.json'), 'utf8')) as Fagindeks;
  const PREFIKS: Record<Fellesfag, string> = {
    norsk: 'NOR', matematikk: 'MAT', naturfag: 'NAT', engelsk: 'ENG', fremmedsprak: 'FSP', samfunnskunnskap: 'SAK',
    geografi: 'GEO', historie: 'HIS', kroppsoving: 'KRO', yff: 'YFF',
  };
  const TRINN = ['Vg1', 'Vg2', 'Vg3'] as const;
  const programomrader = (retning: string, trinn: string) =>
    new Set(
      Object.entries(indeks.programomrader)
        .filter(([, p]) => p.trinn === trinn && p.sted === 'skole' && (retning === 'studieforberedende') === (STUDIEFORBEREDENDE as readonly string[]).includes(p.program) && p.program !== 'PB')
        .map(([k]) => k),
    );
  const harStandpunkt = (fag: Fellesfag, retning: string, trinn: string) =>
    Object.entries(indeks.fag).some(
      ([kode, f]) => kode.startsWith(PREFIKS[fag]) && f.trinn.includes(trinn as 'Vg1') && f.elev?.standpunkt === true && f.po.some((p) => programomrader(retning, trinn).has(p)),
    );

  for (const [fag, retninger] of Object.entries(TYPER) as [Fellesfag, (typeof TYPER)[Fellesfag]][]) {
    for (const [retning, trinnene] of Object.entries(retninger)) {
      for (const [trinn, { type }] of Object.entries(trinnene ?? {})) {
        it(`${fag}, ${retning}, ${trinn}: ${type}`, () => {
          if (type === 'standpunkt') expect(harStandpunkt(fag, retning, trinn)).toBe(true);
          else {
            // Halvår: faget fortsetter og får standpunkt på et senere trinn (opplæringsforskrifta § 9-13).
            const senere = TRINN.slice(TRINN.indexOf(trinn as 'Vg1') + 1);
            expect(senere.some((t) => harStandpunkt(fag, retning, t))).toBe(true);
          }
        });
      }
    }
  }

  it('utdanningsprogrammene og navnene stemmer med Grep', () => {
    for (const p of UTDANNINGSPROGRAM) {
      const grep = indeks.utdanningsprogram[p.kode];
      expect(grep, p.kode).toBeDefined();
      expect(p.navn, p.kode).toBe(grep?.nb);
      expect(inntakNb.poeng.lop.program[p.kode as keyof typeof inntakNb.poeng.lop.program], p.kode).toBe(grep?.nb);
      expect(inntakNn.poeng.lop.program[p.kode as keyof typeof inntakNn.poeng.lop.program], p.kode).toBe(grep?.nn);
      expect(p.retning === 'studieforberedende', p.kode).toBe((STUDIEFORBEREDENDE as readonly string[]).includes(p.kode));
    }
  });
});
