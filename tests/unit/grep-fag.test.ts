// Fase 2: fagindeksen og læreplanfilene bygges fra rådata i Grep (scripts/grep/bygg.ts), og endringer
// mellom to hentinger rapporteres (scripts/kilder/grep.ts).
import { describe, expect, it } from 'vitest';
import { byggFagindeks, byggLaereplan, htmlTilAvsnitt, laereplankoder, type Grepelement, type Raadata } from '../../scripts/grep/bygg.ts';
import { grepdetaljer, grepsammendrag, sammenlignGrep, type Grepdata } from '../../scripts/kilder/grep.ts';
import { fagspor, validerFagdata } from '../../scripts/hent-grep.ts';
import { fagindeksSkjema, laereplanSkjema } from '../../src/modules/fag/skjema.ts';

const PUB = 'https://data.udir.no/kl06/v201906/status/status_publisert';
const UTG = 'https://data.udir.no/kl06/v201906/status/status_utgaatt';
const tittel = (nb: string, nn = nb) => [
  { spraak: 'default', verdi: nb },
  { spraak: 'nob', verdi: nb },
  { spraak: 'nno', verdi: nn },
];
const ref = (kode: string, status = PUB, ekstra: Record<string, unknown> = {}) => ({ kode, status, ...ekstra });
const lk20 = (kode: string, km: string[], gyldighet: Record<string, string | null>, status = PUB) =>
  ref(kode, status, { 'url-data': `https://data.udir.no/kl06/v201906/laereplaner-lk20/${kode}`, gyldighet: { 'gyldig-fra': gyldighet.fra, 'gyldig-til': gyldighet.til }, 'tilhoerende-kompetansemaalsett': km.map((k) => ref(k)) });

const ELEV = 'http://psi.udir.no/ontologi/eksamen_vurdering_elev';

function raadata(): Raadata {
  const fagkoder = new Map<string, Grepelement>([
    [
      'NOR1260',
      {
        kode: 'NOR1260',
        status: PUB,
        tittel: tittel('Norsk, vg1, skriftlig', 'Norsk, vg1, skriftleg'),
        'omfang-totalt': '113',
        fagtype: { kode: 'fagtype_fellesfag' },
        vurderingsordning: [
          { elevtype: ELEV, standpunktvurdering: false, trekkordning: { kode: 'trekkordning_1', tittel: 'Ingen eksamen' }, 'eksamensform-paa-vitnemaalet': { kode: 'eksamensform_1', tittel: 'Ingen eksamen' }, vurderingsuttrykk: { kode: 'vurderingsuttrykk_tall', tittel: 'Tall' } },
        ],
      },
    ],
    ['NOR1261', { kode: 'NOR1261', status: PUB, tittel: tittel('Norsk, vg1, muntlig'), 'omfang-totalt': null, fagtype: { kode: 'fagtype_fellesfag' }, vurderingsordning: [] }],
    ['NOR1299', { kode: 'NOR1299', status: UTG, tittel: tittel('Utgått'), fagtype: { kode: 'fagtype_fellesfag' } }],
    ['HEA2005', { kode: 'HEA2005', status: PUB, tittel: tittel('Helsefremmende arbeid', 'Helsefremjande arbeid'), 'omfang-totalt': '197', fagtype: { kode: 'fagtype_felles_programfag' } }],
  ]);
  return {
    utdanningsprogram: [
      { kode: 'ST', status: PUB, tittel: tittel('Studiespesialisering') },
      { kode: 'HS', status: PUB, tittel: tittel('Helse- og oppvekstfag') },
      { kode: 'MK', status: UTG, tittel: tittel('Medier og kommunikasjon') },
    ],
    programomrader: [
      { kode: 'STUSP1----', status: PUB, tittel: tittel('Studiespesialisering vg1'), aarstrinn: { kode: 'vg1' }, opplaeringssted: [{ uri: 'http://psi.udir.no/kl06/opplaeringssted_skole' }] },
      {
        kode: 'HSHEA2----',
        status: PUB,
        tittel: tittel('Helsearbeiderfag'),
        aarstrinn: { kode: 'vg2' },
        aarstimer: '982',
        opplaeringssted: [{ uri: 'http://psi.udir.no/kl06/opplaeringssted_skole' }],
        // Kryssløp fra vg1 studiespesialisering. Programområder som ikke er med (HSHSF1), tas ikke med.
        'bygger-paa-programomraade': [ref('HSHSF1----'), ref('STUSP1----'), ref('GAMMEL----', UTG)],
        merkelapper: [ref('paabygg'), ref('utgaatt', UTG)],
      },
      { kode: 'PBPBY3----', status: PUB, tittel: tittel('Vg3 påbygging'), aarstrinn: { kode: 'vg3' }, opplaeringssted: [] },
    ],
    opplaeringsfag: [
      {
        kode: 'NOR1Z63',
        status: PUB,
        opplaeringsnivaa: { kode: 'opplaeringsnivaa_videregaaende' },
        fagtype: { kode: 'fagtype_fellesfag' },
        'for-aarstrinn': [{ kode: 'vg1' }],
        'programomraader-referanse': [ref('STUSP1----'), ref('UKJENT----')],
        'fagkode-referanser': [ref('NOR1260'), ref('NOR1261'), ref('NOR1299', UTG)],
        // Gammel plan som er utgått, og ny plan som gjelder fra 2026.
        'laereplan-referanse': [lk20('NOR01-06', ['KV1'], { fra: '2020-08-01T00:00:00', til: '2026-07-31T00:00:00' }, UTG), lk20('NOR01-08', ['KV2'], { fra: '2026-08-01T00:00:00', til: null })],
      },
      {
        kode: 'HEA2Z04',
        status: PUB,
        opplaeringsnivaa: { kode: 'opplaeringsnivaa_videregaaende' },
        fagtype: { kode: 'fagtype_felles_programfag' },
        'for-aarstrinn': [{ kode: 'vg2' }],
        'programomraader-referanse': [ref('HSHEA2----')],
        'fagkode-referanser': [ref('HEA2005')],
        'laereplan-referanse': [lk20('HEA02-04', ['KV366'], { fra: '2021-08-01T00:00:00', til: null })],
      },
      { kode: 'NOR0Z01', status: PUB, opplaeringsnivaa: { kode: 'opplaeringsnivaa_grunnskole' }, 'fagkode-referanser': [ref('NOR0214')] },
    ],
    fagkoder,
    laereplaner: new Map<string, Grepelement>([
      ['NOR01-06', { kode: 'NOR01-06', status: UTG }],
      ['NOR01-08', { kode: 'NOR01-08', status: PUB }],
      ['HEA02-04', { kode: 'HEA02-04', status: PUB }],
    ]),
    kompetansemaalsett: new Map(),
  };
}

describe('htmlTilAvsnitt', () => {
  it('gjør avsnitt, linjeskift og tegnreferanser om til ren tekst', () => {
    expect(htmlTilAvsnitt('<p>Første <strong>avsnitt</strong>.</p><p>Linje&nbsp;1<br>linje 2 &amp; mer</p><p> </p>')).toEqual(['Første avsnitt.', 'Linje 1\nlinje 2 & mer']);
    expect(htmlTilAvsnitt(null)).toEqual([]);
    expect(htmlTilAvsnitt('Uten avsnitt')).toEqual(['Uten avsnitt']);
  });
});

describe('fagindeksen', () => {
  const indeks = byggFagindeks(raadata(), '2026-09-30T12:00:00.000Z');

  it('har publiserte fagkoder i videregående med navn på begge målformer, type, trinn og programområder', () => {
    expect(Object.keys(indeks.fag)).toEqual(['HEA2005', 'NOR1260', 'NOR1261']);
    expect(indeks.fag.NOR1260).toMatchObject({ navn: { nb: 'Norsk, vg1, skriftlig', nn: 'Norsk, vg1, skriftleg' }, type: 'fellesfag', trinn: ['Vg1'], po: ['STUSP1----'], timer: 113 });
    expect(indeks.fag.NOR1261?.timer).toBeNull();
    expect(indeks.fag.HEA2005).toMatchObject({ type: 'felles_programfag', trinn: ['Vg2'], po: ['HSHEA2----'], lp: 'HEA02-04', km: ['KV366'] });
    expect(() => fagindeksSkjema.parse(indeks)).not.toThrow();
  });

  it('velger læreplanen som gjelder på datoen', () => {
    expect(indeks.fag.NOR1260).toMatchObject({ lp: 'NOR01-08', km: ['KV2'] });
    const iFjor = byggFagindeks(raadata(), '2025-09-30T12:00:00.000Z');
    expect(iFjor.fag.NOR1260).toMatchObject({ lp: 'NOR01-06', km: ['KV1'] });
    expect(laereplankoder(indeks)).toEqual({ laereplaner: ['HEA02-04', 'NOR01-08'], kompetansemaalsett: ['KV2', 'KV366'] });
  });

  it('tar med vurderingsordningen for elever med koder, og titlene fra Grep for ukjente koder', () => {
    expect(indeks.fag.NOR1260?.elev).toEqual({ standpunkt: false, trekk: 'trekkordning_1', eksamensordning: null, eksamensform: 'eksamensform_1', uttrykk: 'vurderingsuttrykk_tall' });
    expect(indeks.fag.NOR1260?.privatist).toBeNull();
    expect(indeks.koder.trekkordning_1).toBe('Ingen eksamen');
  });

  it('kjenner utdanningsprogrammene, med påbygging (PB) fra programområdet', () => {
    expect(Object.keys(indeks.utdanningsprogram)).toEqual(['HS', 'PB', 'ST']);
    expect(indeks.programomrader['HSHEA2----']).toEqual({ navn: { nb: 'Helsearbeiderfag', nn: 'Helsearbeiderfag' }, program: 'HS', trinn: 'Vg2', sted: 'skole', bygger: ['STUSP1----'], timer: 982, merkelapper: ['paabygg'] });
    expect(indeks.programomrader['PBPBY3----']).toMatchObject({ program: 'PB', trinn: 'Vg3', sted: 'ukjent' });
  });
});

describe('læreplanene', () => {
  const plan: Grepelement = {
    kode: 'TLM03-01',
    status: PUB,
    tittel: { tekst: [{ spraak: 'default', verdi: 'Læreplan i truck- og liftmekanikarfaget' }, { spraak: 'nob', verdi: 'Læreplan i truck- og liftmekanikerfaget' }, { spraak: 'nno', verdi: 'Læreplan i truck- og liftmekanikarfaget' }] },
    fastsettelsesinformasjon: { 'fastsatt-dato': '2021-02-11T00:00:00', 'fastsatt-spraak': { kode: 'nno' } },
    gyldighetsperiode: { 'gyldig-fra': { dato: '2022-08-01T00:00:00' } },
    'kompetansemaal-kapittel': { kompetansemaalsett: [{ kode: 'KV619' }, { kode: 'MANGLER' }] },
    'vurderingsordninger-kapittel': {
      vurderingsordninger: [
        {
          overskrift: { tekst: [{ spraak: 'nob', verdi: 'Fagprøve' }, { spraak: 'nno', verdi: 'Fagprøve' }] },
          beskrivelse: { tekst: [{ spraak: 'nob', verdi: '<p>Lærlingen skal</p>' }, { spraak: 'nno', verdi: '<p>Lærlingen skal ha fagprøve.</p>' }] },
        },
      ],
    },
  };
  const sett = new Map<string, Grepelement>([
    [
      'KV619',
      {
        kode: 'KV619',
        status: PUB,
        tittel: { tekst: [{ spraak: 'default', verdi: 'Kompetansemål og vurdering vg3' }, { spraak: 'nno', verdi: 'Kompetansemål og vurdering vg3' }] },
        'kompetansemaal-ingress': { tekst: [{ spraak: 'nno', verdi: 'Mål for opplæringa er at lærlingen skal kunne' }] },
        kompetansemaal: [
          { kode: 'KM1', status: PUB, tittel: 'planleggje  og dokumentere arbeidsoppgåver' },
          { kode: 'KM2', status: UTG, tittel: 'utgått mål' },
        ],
        underveisvurdering: { beskrivelse: { tekst: [{ spraak: 'nob', verdi: '<p>Underveis</p>' }, { spraak: 'nno', verdi: '<p>Undervegs</p>' }] } },
        'etter-fag': [ref('TLM3Z01')],
        'etter-aarstrinn': [{ kode: 'vg3' }],
      },
    ],
  ]);
  const lp = byggLaereplan(plan, sett);

  it('er på målformen planen er fastsatt i, uoversatt', () => {
    expect(lp).toMatchObject({ kode: 'TLM03-01', tittel: 'Læreplan i truck- og liftmekanikarfaget', spraak: 'nno', fastsatt: '2021-02-11', gyldigFra: '2022-08-01' });
    expect(lp.vurderingsordning).toEqual([{ overskrift: 'Fagprøve', tekst: ['Lærlingen skal ha fagprøve.'] }]);
    expect(lp.kompetansemaalsett[0]).toMatchObject({ ingress: 'Mål for opplæringa er at lærlingen skal kunne', underveis: ['Undervegs'], standpunkt: [], fag: ['TLM3Z01'], trinn: ['Vg3'] });
  });

  it('har bare publiserte kompetansemål, og hopper over sett som mangler', () => {
    expect(lp.kompetansemaalsett).toHaveLength(1);
    expect(lp.kompetansemaalsett[0]?.maal).toEqual([{ kode: 'KM1', tekst: 'planleggje og dokumentere arbeidsoppgåver' }]);
    expect(() => laereplanSkjema.parse(lp)).not.toThrow();
  });
});

describe('validering før skriving', () => {
  it('stopper for små datasett, så forrige snapshot blir stående', () => {
    const indeks = byggFagindeks(raadata(), '2026-09-30T12:00:00.000Z');
    expect(() => validerFagdata(indeks, new Map())).toThrow(/fagkoder i videregående/);
  });
});

describe('endringsrapporten for fag og læreplaner', () => {
  const tom: Grepdata = { programomrader: {}, fagkoder: {}, arstimer: {} };
  const indeks = byggFagindeks(raadata(), '2026-09-30T12:00:00.000Z');
  const forrige: Grepdata = { ...tom, fag: fagspor(indeks), laereplaner: { 'HEA02-04': 'a', 'NOR01-06': 'b' } };

  it('første henting med fagindeks lister ikke alt som nytt', () => {
    const e = sammenlignGrep(tom, { ...tom, fag: fagspor(indeks), laereplaner: { 'HEA02-04': 'a' } });
    expect(grepsammendrag(e)).toBe('Ingen endringer.');
  });

  it('viser nye, fjernede og endrede fag og læreplaner', () => {
    const spor = fagspor(indeks);
    const ny: Grepdata = {
      ...tom,
      fag: { ...spor, HEA2005: { ...(spor.HEA2005 as NonNullable<(typeof spor)['HEA2005']>), timer: 140 }, NYA1001: { navn: 'Nytt fag', timer: 56, vurdering: 'ingen' } },
      laereplaner: { 'HEA02-04': 'endret', 'NOR01-08': 'c' },
    };
    const e = sammenlignGrep(forrige, ny);
    expect(grepsammendrag(e)).toBe('1 nytt fag, 1 endring i et fag, 1 ny læreplan, 1 læreplan fjernet, 1 endret læreplan.');
    expect(grepdetaljer(e)).toEqual([
      'Nytt fag: NYA1001 Nytt fag',
      'Endret fag: HEA2005 Helsefremmende arbeid: årstimer 197 → 140',
      'Ny læreplan: NOR01-08',
      'Læreplan fjernet: NOR01-06',
      'Endret læreplan: HEA02-04 (https://www.udir.no/lk20/hea02-04)',
    ]);
  });
});

describe('endringer i tilbudsstrukturen', () => {
  const tom: Grepdata = { programomrader: {}, fagkoder: {}, arstimer: {} };
  const po = { navn: 'Helsearbeiderfag', trinn: 'Vg2', sted: 'skole', bygger: 'HSHSF1----', timer: 982 };
  it('viser nye, nedlagte og endrede programområder, og fag som flyttes til et annet trinn', () => {
    const forrige: Grepdata = { ...tom, tilbud: { 'HSHEA2----': po, 'HSGML2----': { ...po, navn: 'Gammelt' } }, fag: { HEA2005: { navn: 'Helsefremmende arbeid', timer: 197, vurdering: 'x', trinn: 'Vg2' } } };
    const ny: Grepdata = {
      ...tom,
      tilbud: { 'HSHEA2----': { ...po, bygger: 'HSHSF1----, STUSP1----', timer: 981 }, 'HSNYT2----': { ...po, navn: 'Nytt' } },
      fag: { HEA2005: { navn: 'Helsefremmende arbeid', timer: 197, vurdering: 'x', trinn: 'Vg1' } },
    };
    expect(grepdetaljer(sammenlignGrep(forrige, ny))).toEqual([
      'Endret fag: HEA2005 Helsefremmende arbeid: trinn Vg2 → Vg1',
      'Nytt programområde: HSNYT2 Nytt (Vg2)',
      'Programområde lagt ned: HSGML2 Gammelt (Vg2)',
      'Endret programområde: HSHEA2 Helsearbeiderfag (Vg2): bygger på HSHSF1---- → HSHSF1----, STUSP1----; timer 982 → 981',
    ]);
  });
});
