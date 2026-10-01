// Tilbudsmodellen (src/modules/fag/tilbud/modell.ts) med små testdata (avgjørelse 024).
import { describe, expect, it } from 'vitest';
import type { Fag, Fagindeks, Programomrade } from '../../src/modules/fag/skjema.ts';
import { byggStruktur, byggTilbud, erVariant, fagroller, linjetype, programgruppe, skolearFor, velgFordeling } from '../../src/modules/fag/tilbud/modell.ts';
import type { Fagfordeling, Fordelingstabell } from '../../src/modules/fag/tilbud/skjema.ts';
import { kontrollenker, vilbliLenke, vilbliTekst } from '../../src/modules/fag/tilbud/vilbli.ts';

const fag = (navn: string, type: Fag['type'], po: string[], timer: number | null, lp: string | null = null): Fag => ({ navn: { nb: navn, nn: navn }, type, trinn: [], po, timer, lp, km: [], elev: null, privatist: null });
const po = (navn: string, program: string, trinn: Programomrade['trinn'], bygger: string[] = [], sted: Programomrade['sted'] = 'skole'): Programomrade => ({ navn: { nb: navn, nn: navn }, program, trinn, sted, bygger, timer: null, merkelapper: [] });

const indeks: Fagindeks = {
  kilde: 'udir-grep',
  hentet: '2026-10-01T00:00:00Z',
  lisens: 'NLOD 2.0',
  koder: {},
  utdanningsprogram: { HS: { nb: 'Helse- og oppvekstfag', nn: 'Helse- og oppvekstfag' }, ST: { nb: 'Studiespesialisering', nn: 'Studiespesialisering' } },
  programomrader: {
    'HSHSF1----': po('Helse- og oppvekstfag', 'HS', 'Vg1'),
    'HSHEA2----': po('Helsearbeiderfag', 'HS', 'Vg2', ['HSHSF1----', 'STUSP1----']),
    'HSHEA3----': po('Helsearbeiderfaget', 'HS', 'Vg3', ['HSHEA2----'], 'bedrift'),
    'STUSP1----': po('Studiespesialisering', 'ST', 'Vg1'),
    'STUSP1RS--': po('Studiespesialisering, Steiner', 'ST', 'Vg1'),
    'STSSA2----': po('Samfunnsfag og økonomi', 'ST', 'Vg2', ['STUSP1----']),
  },
  fag: {
    NOR1262: fag('Norsk, vg2 yrkesfag', 'fellesfag', ['HSHEA2----'], 112, 'NOR01-07'),
    NOR1263: fag('Norsk, muntlig', 'fellesfag', ['HSHEA2----'], null, 'NOR01-07'),
    NOR1274: fag('Norsk for elever med samisk som førstespråk', 'fellesfag', ['HSHEA2----'], 112),
    SFS1026: fag('Samisk som førstespråk, vg2', 'fellesfag', ['HSHEA2----'], 45),
    KRO1018: fag('Kroppsøving vg2', 'fellesfag', ['HSHEA2----', 'STSSA2----'], 56),
    HEA2005: fag('Helsefremming', 'felles_programfag', ['HSHEA2----'], 159),
    HEA2006: fag('Kommunikasjon', 'felles_programfag', ['HSHEA2----'], 159),
    HEA2007: fag('Yrkesutøvelse', 'felles_programfag', ['HSHEA2----'], 159),
    YFO2002: fag('Yrkesfaglig opphenting', 'felles_programfag', ['HSHEA2----'], 196),
    YFF4209: fag('Yrkesfaglig fordypning vg2', 'yrkesfaglig_fordypning', ['HSHEA2----'], 253),
    YFF4210: fag('Yrkesfaglig fordypning vg2, kort', 'yrkesfaglig_fordypning', ['HSHEA2----'], 197),
    HEA3004: fag('Helsearbeiderfaget', 'felles_programfag', ['HSHEA3----'], null),
    PSY2001: fag('Psykologi 1', 'valgfritt_programfag', ['STSSA2----'], 140),
  },
};

const fordeling = (omfang: string, tittel: string, kolonner: string[], rader: [string, ...(number | null)[]][]): Fordelingstabell => ({
  nr: '17a',
  tittel,
  type: 'fordeling',
  omfang,
  kolonner: kolonner.map((navn, i) => ({ nr: i + 1, navn })),
  rader: rader.map(([linje, ...timer]) => ({ linje, timer })),
});
const ff: Fagfordeling = {
  kilde: 'udir-fag-og-timefordeling',
  rundskriv: 'Udir-1-2026',
  skolear: '2026-2027',
  hentet: '2026-10-01T00:00:00Z',
  lisens: 'NLOD 2.0',
  sider: [],
  merknader: [],
  tabeller: [
    fordeling('vg2', 'Tabell 17a Fag- og timefordeling på vg1 og vg2 i yrkesfaglige utdanningsprogram', ['Ordinær', 'Med stud.spes Vg1', 'Samisk'], [
      ['Norsk/norsk for elever med samisk/norsk for elever med tegnspråk', 112, 112, 112],
      ['Førstespråk samisk/norsk', null, null, 45],
      ['Kroppsøving', 56, 56, 56],
      ['Sum fellesfag', 168, 168, 213],
      ['Felles programfag fra eget programområde', 477, 477, 477],
      ['Yrkesfaglig fordypning', 253, 57, 208],
      ['Yrkesfaglig opphenting', null, 196, null],
      ['Totalt omfang', 898, 898, 898],
    ]),
    { ...fordeling('Vg2', 'Tabell 4 Fag- og timefordeling i utdanningsprogram for studiespesialisering', ['Ordinær'], [
      ['Kroppsøving', 56],
      ['Programfag fra eget programområde (fordypning)', 280],
      ['Programfag fra studieforb. utdanningsprogram', 140],
      ['Totalt omfang', 476],
    ]), nr: '4' },
  ],
};

describe('linjene i rundskrivet', () => {
  it('får riktig type', () => {
    expect(linjetype('Norsk')).toBe('fellesfag');
    expect(linjetype('Sum fellesfag')).toBe('sum');
    expect(linjetype('Totalt omfang')).toBe('totalt');
    expect(linjetype('Yrkesfaglig fordypning')).toBe('yff');
    expect(linjetype('Yrkesfaglig opphenting')).toBe('opphenting');
    expect(linjetype('Felles programfag fra eget utdanningsprogram')).toBe('felles_programfag');
    expect(linjetype('Programfag fra eget programområde (fordypning)')).toBe('fordypning');
    expect(linjetype('Programfag fra eget programområde eller studieforberedende utdanningsprogram')).toBe('valgfritt');
    expect(linjetype('Programfag fra studieforb. utdanningsprogram')).toBe('valgfritt');
  });

  it('skiller program og varianter', () => {
    expect(programgruppe('ST')).toBe('studieforberedende');
    expect(programgruppe('HS')).toBe('yrkesfaglig');
    expect(programgruppe('PB')).toBe('pabygging');
    expect(erVariant('STUSP1RS--')).toBe(true);
    expect(erVariant('STUSP1----')).toBe(false);
  });
});

describe('tilbudet for et programområde', () => {
  const hea = byggTilbud('HSHEA2----', indeks, ff);

  it('følger den ordinære kolonnen, og summen stemmer med rundskrivet', () => {
    expect(hea.tabell).toEqual({ nr: '17a', omfang: 'vg2' });
    expect(hea.deler.map((d) => d.linje)).toEqual(['Norsk/norsk for elever med samisk/norsk for elever med tegnspråk', 'Kroppsøving', 'Felles programfag fra eget programområde', 'Yrkesfaglig fordypning']);
    expect(hea.sum).toBe(898);
    expect(hea.totalt).toBe(898);
    expect(hea.avvik).toEqual([]);
  });

  it('skiller ordinær kode, vurderingskode og alternativ', () => {
    const norsk = hea.deler[0];
    expect(norsk).toMatchObject({ type: 'fag', koder: ['NOR1262'], vurdering: ['NOR1263'], alternativer: ['NOR1274'] });
    // Samisk som førstespråk står bare i den samiske kolonnen: alternativ, ikke ordinært fag.
    expect(hea.alternativer).toEqual(['SFS1026']);
  });

  it('gjør YFF til en obligatorisk plass og anbefaler koden med samme timetall', () => {
    expect(hea.deler[3]).toMatchObject({ type: 'plass', kategori: 'yff', timer: 253, kandidater: ['YFF4209', 'YFF4210'], anbefalt: 'YFF4209' });
  });

  it('holder opphenting utenfor felles programfag og knytter den til tilpasningen', () => {
    expect(hea.deler[2]).toMatchObject({ koder: ['HEA2005', 'HEA2006', 'HEA2007'], avvik: [] });
    const stud = hea.tilpasninger.find((t) => t.navn === 'Med stud.spes Vg1');
    expect(stud?.linjer).toEqual([
      { linje: 'Yrkesfaglig fordypning', ordinar: 253, timer: 57, koder: [] },
      { linje: 'Yrkesfaglig opphenting', ordinar: null, timer: 196, koder: ['YFO2002'] },
    ]);
  });

  it('skiller forrige trinn, kryssløp og videre løp', () => {
    expect(hea.fra).toEqual(['HSHSF1----']);
    expect(hea.kryssFra).toEqual(['STUSP1----']);
    expect(hea.videre).toEqual(['HSHEA3----']);
    expect(byggTilbud('STUSP1----', indeks, ff).kryssTil).toEqual(['HSHEA2----']);
  });

  it('gir plasser for fordypning og valgfrie programfag med antall fag', () => {
    const ssa = byggTilbud('STSSA2----', indeks, ff);
    expect(ssa.deler[1]).toMatchObject({ kategori: 'fordypning', timer: 280, antall: 2, kandidater: ['PSY2001'] });
    expect(ssa.deler[2]).toMatchObject({ kategori: 'valgfritt', timer: 140, antall: 1, kandidater: ['PSY2001'] });
    expect(ssa.sum).toBe(476);
  });

  it('gir lærefaget i bedrift uten tabell, og melder avvik når summen ikke stemmer', () => {
    expect(byggTilbud('HSHEA3----', indeks, ff)).toMatchObject({ tabell: null, deler: [{ linje: 'Opplæring i bedrift', koder: ['HEA3004'] }] });
    const feil = { ...ff, tabeller: ff.tabeller.map((t) => (t.nr === '17a' && t.type === 'fordeling' ? { ...t, rader: t.rader.map((r) => (r.linje === 'Totalt omfang' ? { ...r, timer: [900, 898, 898] } : r)) } : t)) };
    expect(byggTilbud('HSHEA2----', indeks, feil).avvik).toContain('Summen av delene er 898 timer, rundskrivet sier 900.');
  });
});

describe('felles programfag som Grep knytter til programområdet', () => {
  // Samme vg2-tabell (477 timer felles programfag) med tre tenkte programområder.
  const lag = (fag: Record<string, Fag>): Fagindeks => ({
    ...indeks,
    programomrader: { 'XXAAA2----': po('Tenkt vg2', 'HS', 'Vg2') },
    fag: { ...fag, YFF4209: fag_('Yrkesfaglig fordypning vg2', 'yrkesfaglig_fordypning', 253), NOR1262: fag_('Norsk', 'fellesfag', 112), KRO1018: fag_('Kroppsøving', 'fellesfag', 56) },
  });
  const fag_ = (navn: string, type: Fag['type'], timer: number | null, lp: string | null = null, trinn: Fag['trinn'] = ['Vg2']): Fag => ({ ...fag(navn, type, ['XXAAA2----'], timer, lp), trinn });
  const programfag = (i: Fagindeks) => byggTilbud('XXAAA2----', i, ff).deler.find((d) => d.linje.startsWith('Felles programfag'));

  it('velger læreplanen som stemmer med summen, og holder den andre utenfor', () => {
    const i = lag({ AAA1: fag_('Skole 1', 'felles_programfag', 337, 'SKOLE'), AAA2: fag_('Skole 2', 'felles_programfag', 140, 'SKOLE'), AAA3: fag_('Skole, eksamen', 'felles_programfag', null, 'SKOLE'), BBB1: fag_('Bedrift 1', 'felles_programfag', 337, 'BEDRIFT'), BBB2: fag_('Bedrift, eksamen', 'felles_programfag', null, 'BEDRIFT') });
    expect(programfag(i)).toMatchObject({ koder: ['AAA1', 'AAA2'], vurdering: ['AAA3'], utvalg: null, avvik: [] });
    expect(byggTilbud('XXAAA2----', i, ff).andreFag).toEqual(['BBB1', 'BBB2']);
  });

  it('lar eleven velge blant valgfrie programfag i samme læreplan når timene mangler', () => {
    const i = lag({ MAR1: fag_('Skipstekniske tjenester', 'felles_programfag', 197, 'MAR'), MAR2: fag_('Dokumentasjon', 'felles_programfag', 140, 'MAR'), MAR3: fag_('Dekk', 'valgfritt_programfag', 140, 'MAR'), MAR4: fag_('Maskin', 'valgfritt_programfag', 140, 'MAR') });
    expect(programfag(i)).toMatchObject({ koder: ['MAR1', 'MAR2'], utvalg: { grunn: 'valg', timer: 140, antall: 1, koder: ['MAR3', 'MAR4'] }, avvik: [] });
  });

  it('fyller resten med fag som går over flere trinn, og melder avvik når det ikke går', () => {
    const over = (navn: string, timer: number) => fag_(navn, 'felles_programfag', timer, 'IDR', ['Vg2', 'Vg3']);
    const i = lag({ IDR1: fag_('Treningslære vg2', 'felles_programfag', 197, 'IDR2'), IDR2: over('Aktivitetslære 1', 140), IDR3: over('Aktivitetslære 2', 140), IDR4: over('Aktivitetslære 3', 140) });
    expect(programfag(i)).toMatchObject({ koder: ['IDR1'], utvalg: { grunn: 'flere_trinn', timer: 280, antall: null, koder: ['IDR2', 'IDR3', 'IDR4'] }, avvik: [] });
    const for_ = lag({ ROM1: fag_('Romfysikk', 'felles_programfag', 140, 'ROM') });
    expect(programfag(for_)).toMatchObject({ avvik: ['Felles programfag fra eget programområde: rundskrivet har 477 timer, fagene i Grep har til sammen 140.'] });
  });
});

describe('programområder merket «påbygg» i Grep', () => {
  it('får fellesfag som mangler, fra påbygging på samme trinn', () => {
    const i: Fagindeks = {
      ...indeks,
      utdanningsprogram: { NA: { nb: 'Naturbruk', nn: 'Naturbruk' }, PB: { nb: 'Påbygging', nn: 'Påbygging' } },
      programomrader: {
        'NANAB3----': { ...po('Studieforberedende vg3 innen naturbruk', 'NA', 'Vg3'), merkelapper: ['paabygg'] },
        'PBPBY3----': { ...po('Vg3 påbygging', 'PB', 'Vg3'), merkelapper: ['paabygg'] },
      },
      fag: {
        NOR1270: fag('Norsk, vg3 påbygging', 'fellesfag', ['PBPBY3----'], 281),
        KRO1019: fag('Kroppsøving vg3', 'fellesfag', ['NANAB3----', 'PBPBY3----'], 56),
      },
    };
    const f: Fagfordeling = {
      ...ff,
      tabeller: [{ ...fordeling('Vg3', 'Tabell 24 Fag- og timefordeling på studieforberedende vg3 innenfor de yrkesfaglige utdanningsprogrammene for naturbruk', ['Ordinær'], [['Norsk', 281], ['Kroppsøving', 56], ['Totalt omfang', 337]]), nr: '24' }],
    };
    const t = byggTilbud('NANAB3----', i, f);
    expect(t.deler).toMatchObject([
      { linje: 'Norsk', koder: ['NOR1270'], lantFra: 'PBPBY3----', avvik: [] },
      { linje: 'Kroppsøving', koder: ['KRO1019'], lantFra: null },
    ]);
    expect(t.avvik).toEqual([]);
  });
});

describe('strukturen', () => {
  it('ordner programmene studieforberedende først, med varianter sist', () => {
    const s = byggStruktur(indeks);
    expect(s.map((p) => p.program)).toEqual(['ST', 'HS']);
    expect(s[0]?.inngang).toEqual(['STUSP1----', 'STUSP1RS--']);
    expect(s[1]?.utenfor).toEqual([]);
  });

  it('merker rollen til hver fagkode', () => {
    const roller = fagroller(Object.keys(indeks.programomrader).map((k) => byggTilbud(k, indeks, ff)));
    expect(roller.get('NOR1262')).toBe('ordinar');
    expect(roller.get('NOR1263')).toBe('vurdering');
    expect(roller.get('NOR1274')).toBe('alternativ');
    expect(roller.get('SFS1026')).toBe('alternativ');
    expect(roller.get('YFO2002')).toBe('alternativ');
  });
});

describe('skoleåret', () => {
  it('begynner 1. august', () => {
    expect(skolearFor('2026-10-01')).toBe('2026-2027');
    expect(skolearFor('2027-07-31')).toBe('2026-2027');
    expect(skolearFor('2027-08-01')).toBe('2027-2028');
  });

  it('velger fordelingen for skoleåret, ellers den siste før', () => {
    const f = [{ skolear: '2027-2028' }, { skolear: '2026-2027' }];
    expect(velgFordeling(f, '2026-10-01')?.skolear).toBe('2026-2027');
    expect(velgFordeling(f, '2028-10-01')?.skolear).toBe('2027-2028');
    expect(velgFordeling(f, '2025-10-01')?.skolear).toBe('2026-2027');
    expect(velgFordeling([], '2026-10-01')).toBeNull();
  });
});

describe('lenker til Vilbli', () => {
  it('skriver tekst i adressen uten æøå og mellomrom', () => {
    expect(vilbliTekst('Møre og Romsdal')).toBe('more-og-romsdal');
    expect(vilbliTekst('Helse- og oppvekstfag')).toBe('helse-og-oppvekstfag');
    expect(vilbliTekst('Trøndelag')).toBe('trondelag');
  });

  it('lager lenken til skolene for hele landet eller et fylke', () => {
    expect(vilbliLenke('HSHEA2----', indeks, { side: 'p5' })).toBe('https://www.vilbli.no/nb/nb/no/helse-og-oppvekstfag/program/v.hs/v.hshea2----/p5');
    expect(vilbliLenke('HSHEA2----', indeks, { side: 'p2', fylke: 'Møre og Romsdal' })).toBe('https://www.vilbli.no/nb/nb/more-og-romsdal/helse-og-oppvekstfag/program/v.hs/v.hshea2----/p2');
    expect(vilbliLenke('FINNES0---', indeks, { side: 'p5' })).toBeNull();
    // Lærefag: bare koden (hele løpet sender til vg1 på Vilbli).
    expect(vilbliLenke('HSHEA3----', indeks, { side: 'p5' })).toBe('https://www.vilbli.no/nb/nb/no/helse-og-oppvekstfag/program/v.hs/v.hshea3----/p5');
  });

  it('legger påbygging under programmet brukeren kom fra, ellers det første den bygger på', () => {
    const i = {
      ...indeks,
      utdanningsprogram: { ...indeks.utdanningsprogram, BA: { nb: 'Bygg- og anleggsteknikk', nn: 'Bygg- og anleggsteknikk' } },
      programomrader: { ...indeks.programomrader, 'BATMF2----': po('Tømrer', 'BA', 'Vg2'), 'PBPBY3----': po('Påbygging', 'PB', 'Vg3', ['HSHEA2----', 'BATMF2----']) },
    };
    expect(vilbliLenke('PBPBY3----', i, { side: 'p5', via: 'HSHEA2----' })).toBe('https://www.vilbli.no/nb/nb/no/helse-og-oppvekstfag/program/v.hs/v.pbpby3----/p5');
    expect(vilbliLenke('PBPBY3----', i, { side: 'p5' })).toBe('https://www.vilbli.no/nb/nb/no/bygg-og-anleggsteknikk/program/v.ba/v.pbpby3----/p5');
  });

  it('gir lenkene til kontrollrunden, og hopper over programområder som mangler', () => {
    const l = kontrollenker(indeks);
    expect(l.map((x) => x.tekst)).toEqual(['Vg2 helsearbeiderfag, hele landet', 'Vg2 helsearbeiderfag, Vestland', 'Lærefag: helsearbeiderfaget', 'Vg2 helsearbeiderfag, Møre og Romsdal']);
    expect(l[2]?.url).toContain('/program/v.hs/v.hshea3----/p5');
  });
});
