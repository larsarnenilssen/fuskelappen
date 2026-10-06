// Samsvar mellom Grep, VIGO og utdanning.no om løpene (src/modules/fag/tilbud/kildesamsvar.ts, avgjørelse 052 og 070) og
// byggingen av løpene fra utdanning.no (scripts/utdanning/bygg.ts).
import { describe, expect, it } from 'vitest';
import { byggUtdanningslop, sammenlignUtdanningslop, validerUtdanningslop } from '../../scripts/utdanning/bygg.ts';
import type { Programomrade } from '../../src/modules/fag/skjema.ts';
import { alleKoblinger, harI, type Lopskilder, manglerI, medLopFraKildene, uenigheter, utdanningIGrep } from '../../src/modules/fag/tilbud/kildesamsvar.ts';

const po = (bygger: string[] = []): Programomrade => ({ navn: { nb: 'x', nn: 'x' }, program: 'BA', trinn: 'Vg2', sted: 'skole', bygger, timer: null, merkelapper: [] });
const kilder: Lopskilder = {
  grep: {
    programomrader: {
      'BABAT1----': po(),
      'BAKEM2----': po(['BABAT1----']),
      'BARLF2----': po(['BABAT1----']),
      'BARLF3----': po(['BAKEM2----', 'BARLF2----']),
      'PBPBY4----': po(),
      'SRSSR2----': po(),
      'SRSIK3----': po(),
    },
  },
  vigo: { 'BAKEM2----': ['PBPBY3----'], 'BARLF2----': ['BARLF3----'], 'BARLF3----': ['PBPBY4----'], 'SRSSR2----': ['SRSIK3----'] },
  utdanning: { videre: { 'BAKEM2----': ['BAVBL3----'], 'BARLF3----': ['PBPBY4YK--'], 'SRSSR2----': ['SRSLG3----'] } },
};

describe('manglerI', () => {
  it('en kilde som beskriver løpet uten koblingen, er uenig', () => {
    expect(manglerI('BAKEM2----', 'BARLF3----', kilder)).toEqual(['vigo', 'utdanning']);
    expect(manglerI('BARLF2----', 'BARLF3----', kilder)).toEqual([]);
  });

  it('Grep teller bare når programområdet har «bygger på» i Grep', () => {
    expect(manglerI('BARLF3----', 'PBPBY4----', kilder)).toEqual([]);
    expect(manglerI('SRSSR2----', 'SRSIK3----', kilder)).toEqual(['utdanning']);
  });

  it('en kode bare utdanning.no har, er samme programområde som koden i Grep med de seks første tegnene', () => {
    expect(manglerI('BARLF3----', 'PBPBY4----', { ...kilder, utdanning: { videre: { 'BARLF3----': ['PBPBY4YK--'] } } })).toEqual([]);
  });

  it('uten data fra utdanning.no teller bare Grep og VIGO', () => {
    expect(manglerI('BAKEM2----', 'BARLF3----', { ...kilder, utdanning: null })).toEqual(['vigo']);
  });
});

describe('uenigheter på et tilbud og alle koblinger', () => {
  it('gir løpene på tilbudet som en kilde er uenig om, eller som bare én kilde har', () => {
    const t = { kode: 'BAKEM2----', fra: ['BABAT1----'], kryssFra: [], videre: ['BARLF3----'], pabygging: [], kryssTil: [] };
    expect(uenigheter(t, kilder)).toEqual({
      'BABAT1----': { har: ['grep'], mangler: [] },
      'BARLF3----': { har: ['grep'], mangler: ['vigo', 'utdanning'] },
    });
    // Har to kilder løpet, og ingen er uenig, merkes det ikke.
    const enig = { kode: 'BARLF3----', fra: ['BARLF2----'], kryssFra: [], videre: [], pabygging: ['PBPBY4----'], kryssTil: [] };
    expect(uenigheter(enig, kilder)).toEqual({});
  });

  it('samler koblingene fra alle kildene, med variantkoder fra utdanning.no slått sammen', () => {
    const alle = alleKoblinger(kilder);
    expect(alle.find((l) => l.fra === 'BARLF3----' && l.til === 'PBPBY4----')).toEqual({ fra: 'BARLF3----', til: 'PBPBY4----', har: ['utdanning', 'vigo'], mangler: [] });
    expect(alle.find((l) => l.fra === 'BAKEM2----' && l.til === 'BARLF3----')?.mangler).toEqual(['vigo', 'utdanning']);
    // Koblinger til koder som ikke finnes i Grep, er ikke med.
    expect(alle.some((l) => l.til === 'BAVBL3----' || l.til === 'PBPBY3----')).toBe(false);
  });
});

describe('gamle koder på utdanning.no og løp som bare VIGO eller utdanning.no har (avgjørelse 070)', () => {
  const vg3 = (program: string, bygger: string[]): Programomrade => ({ ...po(bygger), program, trinn: 'Vg3', sted: 'bedrift' });
  const flytt: Lopskilder = {
    grep: {
      programomrader: {
        'IMMED2----': po(),
        'TPPIN2----': po(),
        'TPGPT3----': vg3('TP', ['TPPIN2----']),
        'IMGPT3----': vg3('IM', ['IMMED2----', 'TPPIN2----']),
        'SRSSR2----': po(),
        'SRSIK3----': vg3('SR', []),
      },
    },
    vigo: { 'IMMED2----': ['IMGPT3----'], 'SRSSR2----': ['SRSIK3----'] },
    utdanning: { videre: { 'IMMED2----': ['TPGPT3----'], 'TPPIN2----': ['TPGPT3----'] } },
  };

  it('en gammel kode for et flyttet lærefag leses som den nye, bare når den gamle ikke har løpet i Grep', () => {
    expect(utdanningIGrep('IMMED2----', 'TPGPT3----', flytt.grep)).toBe('IMGPT3----');
    expect(utdanningIGrep('TPPIN2----', 'TPGPT3----', flytt.grep)).toBe('TPGPT3----');
    expect(harI('IMMED2----', 'IMGPT3----', flytt)).toEqual(['grep', 'vigo', 'utdanning']);
    expect(alleKoblinger(flytt).some((l) => l.fra === 'IMMED2----' && l.til === 'TPGPT3----')).toBe(false);
  });

  it('løp som bare VIGO eller utdanning.no har, legges til «bygger på», og Grep endres ikke', () => {
    const ny = medLopFraKildene(flytt.grep as Parameters<typeof medLopFraKildene>[0], flytt);
    expect(ny.programomrader['SRSIK3----']).toMatchObject({ bygger: ['SRSSR2----'], byggerFraVigo: true });
    expect(ny.programomrader['IMGPT3----']?.bygger).toEqual(['IMMED2----', 'TPPIN2----']);
    expect(flytt.grep.programomrader['SRSIK3----']?.bygger).toEqual([]);
    const t = { kode: 'SRSSR2----', fra: [], kryssFra: [], videre: ['SRSIK3----'], pabygging: [], kryssTil: [] };
    expect(uenigheter(t, flytt)).toEqual({ 'SRSIK3----': { har: ['vigo'], mangler: [] } });
  });
});

describe('løpene fra utdanning.no', () => {
  const lop = byggUtdanningslop(
    [
      { fra: 'STUSP1----', barn: { programomradekode10: 'STREA2----', programomrade_tittel: 'Vg2 Realfag', is_krysslop: false } },
      { fra: 'TPTIP1----', barn: { programomradekode10: 'ELKVV2----', programomrade_tittel: 'Vg2 Kulde', is_krysslop: true } },
      { fra: 'TPTIP1----', barn: { programomradekode10: 'ELKVV2----', is_krysslop: true } },
    ],
    { 'STUSP1----': 'Vg1 Studiespesialisering' },
    'x',
  );

  it('bygges med titler, løp videre og kryssløp, uten dubletter', () => {
    expect(lop.videre).toEqual({ 'STUSP1----': ['STREA2----'], 'TPTIP1----': ['ELKVV2----'] });
    expect(lop.kryss).toEqual({ 'TPTIP1----': ['ELKVV2----'] });
    expect(lop.noder['ELKVV2----']).toBe('Vg2 Kulde');
  });

  it('kontrolleres, og endringer meldes', () => {
    expect(validerUtdanningslop(lop).length).toBeGreaterThan(0);
    const ny = { ...lop, videre: { ...lop.videre, 'STUSP1----': ['STREA2----', 'STSSA2----'] } };
    expect(sammenlignUtdanningslop(lop, ny)).toEqual(['Nye koblinger (1): STUSP1---- → STSSA2----']);
    expect(sammenlignUtdanningslop(null, ny)).toEqual([]);
  });
});
