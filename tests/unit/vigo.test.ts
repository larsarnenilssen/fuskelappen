// Dataene fra VIGO Kodeverksbase: bygging, kontroll og sammenligning (scripts/vigo/bygg.ts) og oppslag
// (src/modules/fag/vigo/oppslag.ts), med små testdata (avgjørelse 026).
import { describe, expect, it } from 'vitest';
import { byggFagrelasjoner, byggMerknader, erOpplaeringsfagkode, lesMerknad, lesSokerstatus, sammenlignVigo, validerVigo } from '../../scripts/vigo/bygg.ts';
import { brukesSammenMed, erstatterKoder, gjeldendeKoder, nyLaereplan, sokMerknader } from '../../src/modules/fag/vigo/oppslag.ts';
import type { Fagrelasjoner } from '../../src/modules/fag/vigo/skjema.ts';

const fag = (navn: string, validTo: string | null = null, expired: string | null = null) => ({ courseName: navn, validTo, expired });
const erstatter = [
  { code1: 'LBR3012', code2: 'LBR3004', course1: fag('Maskiner og teknologi i landbruk'), course2: fag('Traktor og maskiner', '2022-07-31') },
  // Delt opp i to nye koder.
  { code1: 'FIN1006', code2: 'FIN1002', course1: fag('Ny 1'), course2: fag('Gammel', null, 'Ja') },
  { code1: 'FIN1007', code2: 'FIN1002', course1: fag('Ny 2'), course2: fag('Gammel', null, 'Ja') },
  // Kjede: AAA1001 → AAA1002 → AAA1003.
  { code1: 'AAA1002', code2: 'AAA1001', course1: fag('B'), course2: fag('A') },
  { code1: 'AAA1003', code2: 'AAA1002', course1: fag('C'), course2: fag('B') },
  // VIGOs egne koder for opplæringsfag og rader uten fag er ikke med.
  { code1: 'NOR1Z27', code2: 'NOR1Z13', course1: fag('x'), course2: fag('y') },
  { code1: 'MAT01-06', code2: 'MAT01-05' },
];
const erstattesAv = [{ code1: 'MAT01-05', code2: 'MAT01-06' }];
const brukesSammen = [
  { code1: 'LBR3020', code2: 'LBR3018', grepCourse1: { name: 'Tverrfaglig eksamen landbruk' }, grepCourse2: { name: 'Husdyrproduksjon' } },
  { code1: 'LBR3020', code2: 'LBR3017', grepCourse1: { name: 'Tverrfaglig eksamen landbruk' }, grepCourse2: { name: 'Planteproduksjon' } },
];

// «entry-requirements»: bare nasjonalt (99) og bare programområder i fagindeksen.
const grunnlag = [
  { countyNr: 99, programAreaCode: 'HSHEA3----', providesCompetenceCode: 'PBPBY4----' },
  { countyNr: 99, programAreaCode: 'HSHEA3----', providesCompetenceCode: 'PBPBY4YK--' },
  { countyNr: 46, programAreaCode: 'HSHSF1----', providesCompetenceCode: 'HSHEA2----' },
  { countyNr: 99, programAreaCode: 'HSHSF1----', providesCompetenceCode: 'HSHEA2----' },
];
const programomrader = new Set(['HSHEA3----', 'PBPBY4----', 'HSHSF1----', 'HSHEA2----']);

const paabygning = [
  { code1: 'DRA2011', code2: 'DRA2010' },
  { code1: 'DRA2011', code2: 'DRA2001' },
  { code1: 'NOR1Z27', code2: 'NOR1Z13' },
];

describe('bygging av fagrelasjonene', () => {
  const { data } = byggFagrelasjoner({ erstatter, erstattesAv, brukesSammen, paabygning, grunnlag }, '2026-10-01T00:00:00Z', programomrader);

  it('gir erstatninger med navn og sluttdato, også når en kode er delt opp', () => {
    expect(data.erstatninger.LBR3004).toEqual({ ny: ['LBR3012'], navn: 'Traktor og maskiner', utgatt: '2022-07-31' });
    expect(data.erstatninger.FIN1002).toEqual({ ny: ['FIN1006', 'FIN1007'], navn: 'Gammel', utgatt: 'ukjent' });
    expect(data.erstatninger['NOR1Z13']).toBeUndefined();
    expect(erOpplaeringsfagkode('NOR1Z13')).toBe(true);
    expect(erOpplaeringsfagkode('NOR1260')).toBe(false);
  });

  it('gir nye læreplaner og fag som brukes sammen, med navn', () => {
    expect(data.laereplaner).toEqual({ 'MAT01-05': 'MAT01-06' });
    expect(data.brukesSammen).toEqual({ LBR3020: ['LBR3017', 'LBR3018'] });
    expect(data.navn.LBR3020).toBe('Tverrfaglig eksamen landbruk');
  });

  it('gir grunnlaget for inntak, bare nasjonalt og for programområder i fagindeksen', () => {
    expect(data.grunnlag).toEqual({ 'HSHEA3----': ['PBPBY4----'], 'HSHSF1----': ['HSHEA2----'] });
  });

  it('gir fag som bygger på andre fag, uten VIGOs egne koder', () => {
    expect(data.byggerPaa).toEqual({ DRA2011: ['DRA2001', 'DRA2010'] });
  });

  it('slår opp gjeldende koder, også gjennom en kjede', () => {
    const finnes = (k: string) => ['LBR3012', 'FIN1006', 'FIN1007', 'AAA1003'].includes(k);
    expect(gjeldendeKoder('LBR3004', data, finnes)).toEqual(['LBR3012']);
    expect(gjeldendeKoder('FIN1002', data, finnes)).toEqual(['FIN1006', 'FIN1007']);
    expect(gjeldendeKoder('AAA1001', data, finnes)).toEqual(['AAA1003']);
    expect(gjeldendeKoder('LBR3012', data, finnes)).toEqual([]);
  });

  it('finner hva et fag erstatter, hva det brukes sammen med og ny læreplan', () => {
    expect(erstatterKoder('LBR3012', data)).toEqual([{ kode: 'LBR3004', navn: 'Traktor og maskiner', utgatt: '2022-07-31' }]);
    expect(brukesSammenMed('LBR3018', data)).toEqual(['LBR3020']);
    expect(brukesSammenMed('LBR3020', data)).toEqual(['LBR3017', 'LBR3018']);
    expect(nyLaereplan('MAT01-05', data)).toBe('MAT01-06');
    expect(nyLaereplan('MAT01-06', data)).toBeNull();
  });
});

describe('merknadene', () => {
  const rad = (code: string, nb: string, nn: string, ekstra: Record<string, unknown> = {}) => ({ code, norwegianName: nb, nynorskName: nn, samiName: null, englishName: 'x', primarySchool: false, highSchool: true, vocationalSchool: false, requireAttachment: 'N', vitnemal: 'J', kompBevis: 'N', ...ekstra });
  const m = byggMerknader(
    {
      fag: [rad('FAM10', 'Ti', 'Ti'), rad('FAM02', 'Fritatt fra vurdering med karakter', 'Friteken frå vurdering med karakter'), rad('FAM06', '1. termin', '1. termin', { expired: 'Ja', validTo: '2011-11-01T00:00:00' })],
      vitnemal: [rad('VMM01', 'Fulgt opplæringen fra <ddmmåå>.', 'Følgt opplæringa frå <ddmmåå>.', { vitnemal: null, kompBevis: null })],
      sokerstatuser: [
        { code: 'INNTO', number: 18, type: 'S', text: 'Inntatt ordinært. Svart ja til tilbud om plass.' },
        { code: 'SBEHA', number: 3, type: 'S', text: 'Ønske til skole, ikke behandlet' },
        { code: 'STOPP', number: 77, type: 'SL', text: 'Søknaden er stoppet (satt i passiv).' },
      ],
    },
    '2026-10-01T00:00:00Z',
  );

  it('leses med tekst på bokmål og nynorsk, bruk og sluttdato, sortert på kode', () => {
    expect(m.fagmerknader.map((x) => x.kode)).toEqual(['FAM02', 'FAM06', 'FAM10']);
    expect(m.fagmerknader[0]).toMatchObject({ nn: 'Friteken frå vurdering med karakter', videregaende: true, grunnskole: false, vitnemal: true, kompetansebevis: false, utgatt: null });
    expect(m.fagmerknader[1]?.utgatt).toBe('2011-11-01');
    expect(m.vitnemalsmerknader[0]).toMatchObject({ kode: 'VMM01', vitnemal: null });
    expect(lesMerknad({ code: 'FAM99' })).toBeNull();
  });

  it('statusene på søkerønsker står i rekkefølgen VIGO nummererer dem, med elevplass og læreplass', () => {
    expect(m.sokerstatuser.map((x) => x.kode)).toEqual(['SBEHA', 'INNTO', 'STOPP']);
    expect(m.sokerstatuser[2]).toMatchObject({ nr: 77, videregaende: true, fagopplaering: true, nn: 'Søknaden er stoppet (satt i passiv).' });
    expect(m.sokerstatuser[0]).toMatchObject({ videregaende: true, fagopplaering: false });
    expect(lesSokerstatus({ code: 'X', text: 'Uten nummer' })).toBeNull();
  });

  it('kan søkes i på kode og tekst', () => {
    expect(sokMerknader(m.fagmerknader, 'fam02').map((x) => x.kode)).toEqual(['FAM02']);
    expect(sokMerknader(m.fagmerknader, 'friteken vurdering').map((x) => x.kode)).toEqual(['FAM02']);
    expect(sokMerknader(m.fagmerknader, '')).toHaveLength(3);
  });

  it('kontrolleres, og endringer meldes', () => {
    const { data } = byggFagrelasjoner({ erstatter, erstattesAv, brukesSammen, paabygning, grunnlag }, 'x', programomrader);
    expect(validerVigo(data, m)).toHaveLength(7);
    const ny: Fagrelasjoner = { ...data, grunnlag: { 'HSHEA3----': ['PBPBY4----', 'PBPBY4YK--'] }, erstatninger: { ...data.erstatninger, NYA1001: { ny: ['NYA1002'], navn: 'Ny', utgatt: null } }, brukesSammen: { LBR3020: ['LBR3017'] }, byggerPaa: { DRA2011: ['DRA2010'], DRA2013: ['DRA2012'] } };
    const m2 = { ...m, fagmerknader: [...m.fagmerknader.map((x) => (x.kode === 'FAM10' ? { ...x, nb: 'Ti, endret' } : x)), { ...m.fagmerknader[0], kode: 'FAM70', nb: 'Ny merknad' } as (typeof m.fagmerknader)[number]] };
    expect(sammenlignVigo({ rel: data, m }, { rel: ny, m: m2 })).toEqual([
      'Ny erstatning: NYA1001 Ny → NYA1002',
      'Brukes sammen, fjernede koblinger (1): LBR3020 + LBR3018',
      'Bygger på, nye koblinger (1): DRA2013 på DRA2012',
      'Bygger på, fjernede koblinger (1): DRA2011 på DRA2001',
      'Grunnlag for inntak, nye koblinger (1): HSHEA3---- → PBPBY4YK--',
      'Grunnlag for inntak, fjernede koblinger (1): HSHSF1---- → HSHEA2----',
      'Endret fagmerknad FAM10: Ti, endret',
      'Ny fagmerknad FAM70: Ny merknad',
    ]);
    expect(sammenlignVigo(null, { rel: data, m })).toEqual([]);
  });
});
