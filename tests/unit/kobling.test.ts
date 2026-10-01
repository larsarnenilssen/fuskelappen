// Koblingen fra fagkode til årsramme (src/modules/arbeidstid/beregning/kobling.ts), med små testdata.
import { describe, expect, it } from 'vitest';
import type { Arsrammerad } from '../../src/modules/arbeidstid/beregning/arsrammer.ts';
import { finnKobling, grepPar, type Koblingstabeller } from '../../src/modules/arbeidstid/beregning/kobling.ts';
import type { Fag, Fagindeks } from '../../src/modules/fag/skjema.ts';
import { finnAvvik } from '../../scripts/kobling/rapport.ts';

const rad = (nr: number, t60: number, kategori: string, fag: string | null, program: string, trinn: string, stjerne = false): Arsrammerad => ({ nr, t60, t45: Math.round((t60 * 4) / 3), kategori, fag, program, trinn, stjerne });
const rader = [
  rad(1, 525, 'Felles programfag', 'Norsk', 'Yrkesfag', 'Vg2', true),
  rad(2, 496, 'Fellesfag', 'Norsk', 'Stud.spes', 'Vg1', true),
  rad(3, 607.5, 'Felles programfag', null, 'Helse/sos', 'Vg2'),
  rad(4, 525, 'Valgfrie programfag', 'Psykologi', 'Stud.spes', 'Vg2'),
  rad(5, 496, 'Valgfrie programfag', 'Psykologi', 'Stud.spes', 'Vg3'),
];
const fag = (type: Fag['type'], po: string[], timer: number | null = 140): Fag => ({ navn: { nb: 'Fag', nn: 'Fag' }, type, trinn: [], po, timer, lp: null, km: [], elev: null, privatist: null });
const indeks: Pick<Fagindeks, 'fag' | 'programomrader'> = {
  programomrader: {
    'HSHEA2----': { navn: { nb: 'Helsearbeiderfag', nn: 'Helsearbeidarfag' }, program: 'HS', trinn: 'Vg2', sted: 'skole', bygger: [], timer: null, merkelapper: [] },
    'HSHEA3----': { navn: { nb: 'Helsearbeiderfaget', nn: 'Helsearbeidarfaget' }, program: 'HS', trinn: 'Vg3', sted: 'bedrift', bygger: [], timer: null, merkelapper: [] },
    'STUSP1----': { navn: { nb: 'Studiespesialisering', nn: 'Studiespesialisering' }, program: 'ST', trinn: 'Vg1', sted: 'skole', bygger: [], timer: null, merkelapper: [] },
    'STSSA2----': { navn: { nb: 'SSØ vg2', nn: 'SSØ vg2' }, program: 'ST', trinn: 'Vg2', sted: 'skole', bygger: [], timer: null, merkelapper: [] },
    'STSSA3----': { navn: { nb: 'SSØ vg3', nn: 'SSØ vg3' }, program: 'ST', trinn: 'Vg3', sted: 'skole', bygger: [], timer: null, merkelapper: [] },
  },
  fag: {
    NOR1260: fag('fellesfag', ['STUSP1----'], 113),
    NOR1262: fag('fellesfag', ['HSHEA2----'], 112),
    // Et fellesfag med samme prefiks som en regel skal aldri kobles med regelen.
    HEA1999: fag('fellesfag', ['HSHEA2----']),
    HEA2005: fag('felles_programfag', ['HSHEA2----'], 197),
    HEA2008: fag('felles_programfag', ['HSHEA2----'], null),
    HEA2099: fag('felles_programfag', ['HSHEA2----']),
    HEA3004: fag('felles_programfag', ['HSHEA3----']),
    SAM3072: fag('valgfritt_programfag', ['STSSA2----', 'STSSA3----']),
    IOP1000: fag('individuell_opplaeringsplan', []),
  },
};
const tabeller: Koblingstabeller = {
  programnavn: [
    { vedlegg: 'Yrkesfag', navn: 'Yrkesfag', grep: ['HS'] },
    { vedlegg: 'Stud.spes', navn: 'Studiespesialisering', grep: ['ST'] },
    { vedlegg: 'Helse/sos', navn: 'Helse- og oppvekstfag', grep: ['HS'] },
  ],
  eksplisitte: [
    { tabell: 'kobling_fellesfag', nr: 1, program: 'HS', trinn: 'Vg2', fagkoder: ['NOR1262'] },
    { tabell: 'kobling_fellesfag', nr: 2, program: 'ST', trinn: 'Vg1', fagkoder: ['NOR1260'] },
    { tabell: 'kobling_programfag', nr: 4, program: 'ST', trinn: 'Vg2', fagkoder: ['SAM3072'] },
    { tabell: 'kobling_programfag', nr: 5, program: 'ST', trinn: 'Vg3', fagkoder: ['SAM3072'] },
  ],
  regler: [{ tabell: 'kobling_regler', id: 'hs-vg2', prefikser: ['HEA'], program: 'HS', trinn: 'Vg2', fagtype: 'felles_programfag', nr: 3, unntak: ['HEA2099'] }],
};
const finn = (kode: string, valg = {}) => finnKobling(kode, indeks, tabeller, rader, valg);

describe('koblingen fra fagkode til årsramme', () => {
  it('kobler fellesfag eksplisitt', () => {
    const r = finn('NOR1262');
    expect(r.status).toBe('koblet');
    if (r.status === 'koblet') expect(r.kandidat).toMatchObject({ program: 'HS', trinn: 'Vg2', metode: 'eksplisitt', rad: { nr: 1, t60: 525 } });
  });

  it('kobler felles programfag med regel på prefiks, program og trinn', () => {
    const r = finn('HEA2005');
    expect(r.status === 'koblet' && r.kandidat).toMatchObject({ metode: 'regel', fra: 'hs-vg2', rad: { nr: 3, t60: 607.5 } });
  });

  it('bruker aldri prefiksregler for fellesfag', () => {
    expect(finn('HEA1999')).toEqual({ status: 'ukoblet', grunn: 'fellesfag_ikke_koblet', kandidater: [] });
  });

  it('følger ikke regelen for unntak, fag uten årstimer og opplæring i bedrift', () => {
    expect(finn('HEA2099').status).toBe('ukoblet');
    expect(finn('HEA2008')).toMatchObject({ status: 'ukoblet', grunn: 'uten_arstimer' });
    expect(finn('HEA3004')).toMatchObject({ status: 'ukoblet', grunn: 'bedrift' });
    expect(finn('IOP1000')).toMatchObject({ status: 'ukoblet', grunn: 'fagtype' });
    expect(finn('XYZ1000')).toMatchObject({ status: 'ukoblet', grunn: 'ukjent_fagkode' });
  });

  it('er flertydig når program eller trinn gir ulik årsramme, og entydig når trinnet er valgt', () => {
    const r = finn('SAM3072');
    expect(r.status).toBe('flertydig');
    expect(r.kandidater.map((k) => `${k.trinn} ${k.rad.t60}`)).toEqual(['Vg2 525', 'Vg3 496']);
    const vg3 = finn('SAM3072', { trinn: 'Vg3' });
    expect(vg3.status === 'koblet' && vg3.kandidat.rad.nr).toBe(5);
  });

  it('henter program og trinn fra programområdene i Grep, uten opplæring i bedrift', () => {
    expect(grepPar(indeks.fag.SAM3072 as Fag, indeks.programomrader)).toEqual([
      { program: 'ST', trinn: 'Vg2' },
      { program: 'ST', trinn: 'Vg3' },
    ]);
  });
});

describe('avvik i koblingstabellene', () => {
  it('finner rader med feil program, trinn eller kategori, og fagkoder med feil fagtype', () => {
    const feil: Koblingstabeller = {
      ...tabeller,
      eksplisitte: [
        { tabell: 'kobling_fellesfag', nr: 2, program: 'HS', trinn: 'Vg2', fagkoder: ['NOR1262'] },
        { tabell: 'kobling_fellesfag', nr: 3, program: 'HS', trinn: 'Vg2', fagkoder: ['HEA2005', 'UTG1000'] },
      ],
    };
    const tekster = finnAvvik(indeks, feil, rader).map((a) => `${a.alvor}: ${a.tekst}`);
    expect(tekster).toEqual(
      expect.arrayContaining([
        'feil: kobling_fellesfag (HS Vg2): rad 2 gjelder «Stud.spes», som ikke er koblet til HS i tabellen over programnavn.',
        'feil: kobling_fellesfag (HS Vg2): rad 2 gjelder Vg1, ikke Vg2.',
        'feil: kobling_fellesfag (HS Vg2): rad 3 er ikke et fellesfag i vedlegg 1.',
        'feil: HEA2005 Fag står i kobling_fellesfag, men er felles programfag i Grep.',
        'advarsel: UTG1000 står i kobling_fellesfag (rad 3), men finnes ikke lenger i Grep.',
      ]),
    );
  });

  it('godtar en rad for et annet program eller trinn når koblingen har en merknad (eiers valg)', () => {
    const medVilje: Koblingstabeller = {
      ...tabeller,
      eksplisitte: [
        { tabell: 'kobling_fellesfag', nr: 2, program: 'HS', trinn: 'Vg2', fagkoder: ['NOR1262'], merknad: 'Eier: som ST' },
        { tabell: 'kobling_programfag', nr: 2, program: 'ST', trinn: 'Vg2', fagkoder: ['SAM3072'], merknad: 'Eier: som fellesfaget' },
      ],
      regler: [{ ...tabeller.regler[0]!, nr: 1, merknad: 'Eier: annen rad' }],
    };
    const tekster = finnAvvik(indeks, medVilje, rader).map((a) => a.tekst);
    expect(tekster.filter((t) => /gjelder|er ikke et/.test(t))).toEqual([]);
  });

  it('finner samme fagkode, program og trinn med ulike årsrammer', () => {
    const dobbel: Koblingstabeller = { ...tabeller, eksplisitte: [...tabeller.eksplisitte, { tabell: 'kobling_programfag', nr: 5, program: 'ST', trinn: 'Vg2', fagkoder: ['SAM3072'] }] };
    expect(finnAvvik(indeks, dobbel, rader).map((a) => a.tekst)).toContain('SAM3072 Fag får ulike årsrammer for ST Vg2: 525 og 496.');
  });
});
