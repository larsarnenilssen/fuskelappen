// Skoler og tilbud, yrker, opplæringskontorer og NDLA (avgjørelse 053): byggingen fra kildene (scripts/*/bygg.ts),
// koblingen til skolen brukeren har valgt (src/modules/opplaeringslop/skoler.ts) og valget «Min skole» / «Alle»
// i lagringsmodulen.
import { describe, expect, it } from 'vitest';
import { byggNdla, sammenlignNdla, validerNdla } from '../../scripts/ndla/bygg.ts';
import { byggOpplaeringskontor, nettside, sammenlignOpplaeringskontor } from '../../scripts/nor/bygg.ts';
import { byggSkoler, byggYrker, grepkode, sammenlignSkoler, sammenlignYrker } from '../../scripts/utdanning/bygg.ts';
import { byggSkolenummer } from '../../scripts/vigo/bygg.ts';
import { lesValg, skrivValg, slettLagret, type Lager, VALGNOKLER, LAGRINGSNOKKEL } from '../../src/core/lagring/lagring.ts';
import { antallMedTilbud, filtrerSkoler, kobleSkoler, valgtSkole } from '../../src/modules/opplaeringslop/skoler.ts';

const hentet = '2026-10-03T12:00:00.000Z';
const grep = { 'STUSP1----': {}, 'HSHEA2----': {}, 'PBPBY4----': {} };

describe('skolene fra utdanning.no', () => {
  it('fører lokale varianter til programområdet i Grep og tar ikke med koder Grep ikke har', () => {
    expect(grepkode('STUSP1--T-', grep)).toBe('STUSP1----');
    expect(grepkode('PBPBY4YK--', grep)).toBe('PBPBY4----');
    expect(grepkode('XXXXX1----', grep)).toBeNull();
  });

  it('tar med skolene med fylke, med nettside og privat skole', () => {
    const s = byggSkoler(
      [
        { skolenummer: '46015', skolenavn: ' Åsane ', sektor: 'Offentlig', lenke: 'asane.vgs.no', kommunenr: '4601', by: 'Ulset', fylkenr: '46', studieplasser: 900, tilbyr_programmer: ['STUSP1--T-', 'STUSP1----', 'HSHEA2----', 'XXXXX1----'] },
        { skolenummer: '00342', skolenavn: 'Aglo', sektor: 'Privat', lenke: null, kommunenr: '5035', by: null, fylkenr: '50', tilbyr_programmer: [] },
        { skolenummer: null, skolenavn: 'Nettskulen', fylkenr: null, tilbyr_programmer: ['STUSP1----'] },
      ],
      grep,
      hentet,
    );
    expect(s.skoler.map((x) => x.navn)).toEqual(['Aglo', 'Åsane']);
    expect(s.skoler[1]).toMatchObject({ nr: '46015', fylke: '46', sted: 'Ulset', privat: false, nettside: 'https://asane.vgs.no/', tilbud: ['HSHEA2----', 'STUSP1----'] });
    expect(s.skoler[0]).toMatchObject({ privat: true, nettside: null });
  });

  it('melder nye skoler og endrede tilbud', () => {
    const gammel = byggSkoler([{ skolenummer: '46015', skolenavn: 'Åsane', fylkenr: '46', tilbyr_programmer: ['STUSP1----'] }], grep, hentet);
    const ny = byggSkoler(
      [
        { skolenummer: '46015', skolenavn: 'Åsane', fylkenr: '46', tilbyr_programmer: ['HSHEA2----'] },
        { skolenummer: '46016', skolenavn: 'Laksevåg', fylkenr: '46', tilbyr_programmer: [] },
      ],
      grep,
      hentet,
    );
    expect(sammenlignSkoler(gammel, ny)).toEqual(['Nye skoler (1): Laksevåg', 'Endrede tilbud (1): Åsane: +HSHEA2---- −STUSP1----']);
    expect(sammenlignSkoler(null, ny)).toEqual([]);
  });
});

describe('koblingen til skolen brukeren har valgt', () => {
  const skoler = kobleSkoler(
    byggSkoler(
      [
        { skolenummer: '46015', skolenavn: 'Åsane vidaregåande skule', by: 'Ulset', fylkenr: '46', tilbyr_programmer: ['HSHEA2----', 'STUSP1----'] },
        { skolenummer: '03072', skolenavn: 'Ullern videregående skole', by: 'Oslo', fylkenr: '03', tilbyr_programmer: ['STUSP1----'] },
      ],
      grep,
      hentet,
    ).skoler,
    { '46015': '974557479' },
  );

  it('finner skolen med organisasjonsnummeret fra innstillingene', () => {
    expect(valgtSkole(skoler, '974557479')?.navn).toBe('Åsane vidaregåande skule');
    expect(valgtSkole(skoler, '000000000')).toBeNull();
    expect(valgtSkole(skoler, null)).toBeNull();
    expect(skoler.find((s) => s.nr === '03072')?.orgnr).toBeNull();
  });

  it('filtrerer på fylke, tilbud og søk uten aksenter, og teller skolene med et tilbud', () => {
    expect(filtrerSkoler(skoler, { fylke: '46', tilbud: null, sok: '' })).toHaveLength(1);
    expect(filtrerSkoler(skoler, { fylke: null, tilbud: 'STUSP1----', sok: 'asane' }).map((s) => s.nr)).toEqual(['46015']);
    expect(filtrerSkoler(skoler, { fylke: null, tilbud: null, sok: 'oslo' }).map((s) => s.nr)).toEqual(['03072']);
    expect(antallMedTilbud(skoler, 'STUSP1----', null)).toBe(2);
    expect(antallMedTilbud(skoler, 'STUSP1----', '46')).toBe(1);
  });
});

describe('skolenummeret fra VIGO', () => {
  it('lagrer bare skolenummer og organisasjonsnummer, ikke navn eller kontaktinformasjon', () => {
    const d = byggSkolenummer(
      [
        { number: 3072, orgNr: '974590964', name: 'Ullern', nsrSchoolLeaderName: 'Navn Navnesen', nsrSchoolLeaderPhone: '12345678', validTo: null },
        { number: 46015, orgNr: '974557479', validTo: '2020-01-01' },
        { number: 56070, orgNr: null },
      ],
      hentet,
    );
    expect(d.orgnr).toEqual({ '03072': '974590964' });
    expect(JSON.stringify(d)).not.toMatch(/Navn|12345678|Ullern/);
  });
});

describe('yrkene fra utdanning.no', () => {
  const info = [
    {
      programomradekode10: 'HSHEA3----',
      sluttkompetanse: 'Fagbrev',
      utdanningsbeskrivelse: {
        utdanningsbeskrivelse_tittel: 'Helsearbeiderfaget',
        utdanningsbeskrivelse_lenke: '/utdanningsoversikt/helsearbeiderfaget',
        utdanningsbeskrivelse_body: '<p>Fullført og bestått opplæring fører fram til fagbrev.&nbsp;Yrkestittel er helsefagarbeider.</p>',
        yrker: [
          { yrkesbeskrivelse_tittel: 'Miljøarbeider', yrkesbeskrivelse_lenke: '/yrker/beskrivelse/miljoarbeider' },
          { yrkesbeskrivelse_tittel: 'Helsefagarbeider', yrkesbeskrivelse_lenke: '/yrker/beskrivelse/helsefagarbeider' },
          { yrkesbeskrivelse_tittel: 'Uten lenke', yrkesbeskrivelse_lenke: null },
        ],
      },
    },
    { programomradekode10: 'STUSP1----', utdanningsbeskrivelse: { utdanningsbeskrivelse_tittel: 'Studiespesialisering', utdanningsbeskrivelse_lenke: '/x', yrker: [] } },
  ];

  it('tar med yrkene sortert og teksten uten HTML, og bare programområder med yrker', () => {
    const y = byggYrker(info, hentet);
    expect(Object.keys(y.programomrader)).toEqual(['HSHEA3----']);
    expect(y.programomrader['HSHEA3----']).toEqual({
      sluttkompetanse: 'Fagbrev',
      tittel: 'Helsearbeiderfaget',
      sti: '/utdanningsoversikt/helsearbeiderfaget',
      tekst: 'Fullført og bestått opplæring fører fram til fagbrev. Yrkestittel er helsefagarbeider.',
      yrker: [
        { tittel: 'Helsefagarbeider', sti: '/yrker/beskrivelse/helsefagarbeider' },
        { tittel: 'Miljøarbeider', sti: '/yrker/beskrivelse/miljoarbeider' },
      ],
    });
    expect(sammenlignYrker(y, byggYrker([info[0] as (typeof info)[0]], hentet))).toEqual([]);
  });
});

describe('opplæringskontorene fra NOR', () => {
  const fylke = (nr: string, org: string) => ({ Fylkesnummer: nr, Organisasjonsnummer: org });
  const enheter = [
    {
      Organisasjonsnummer: '959334188',
      Navn: 'Bilbransjens opplæringskontor AS',
      ErAktiv: true,
      ErOpplaeringskontor: true,
      Fylke: fylke('46', '821311632'),
      Kommune: { Navn: 'Bergen', Kommunenummer: '4601' },
      Internettadresse: 'www.bilfag-bergen.no',
      AntallLaerlinger: 139,
      ForeldreRelasjoner: [
        { Enhet: { Organisasjonsnummer: '821311632' }, Relasjonstype: { Id: '23' } },
        { Enhet: { Organisasjonsnummer: '821311632' }, Relasjonstype: { Id: '21' } },
        { Enhet: { Organisasjonsnummer: '921693230' }, Relasjonstype: { Id: '21' } },
      ],
    },
    { Organisasjonsnummer: '938371547', Navn: 'Adam og Eva', ErAktiv: true, ErOpplaeringskontor: true, Fylke: fylke('03', '921693230'), Kommune: { Navn: 'Oslo', Kommunenummer: '0301' }, Internettadresse: 'ikke en adresse', ForeldreRelasjoner: [] },
    { Organisasjonsnummer: '999600468', Navn: 'Nedlagt', ErAktiv: false, ErOpplaeringskontor: true, Fylke: fylke('20', '1'), Kommune: { Navn: 'Vadsø', Kommunenummer: '2003' } },
  ];

  it('tar med de aktive kontorene med fylkene de er godkjent i, fra relasjonen «Godkjent i fylker struktur»', () => {
    const d = byggOpplaeringskontor(enheter, hentet);
    expect(d.kontor.map((k) => k.navn)).toEqual(['Adam og Eva', 'Bilbransjens opplæringskontor AS']);
    expect(d.kontor[1]).toMatchObject({ kommune: 'Bergen', nettside: 'https://www.bilfag-bergen.no/', laerlinger: 139, godkjentI: ['03', '46'] });
    // Uten relasjonen gjelder fylket kontoret holder til i.
    expect(d.kontor[0]).toMatchObject({ godkjentI: ['03'], nettside: null, laerlinger: null });
  });

  it('lager nettadresser bare av gyldige adresser', () => {
    expect(nettside('http://aglo.no')).toBe('http://aglo.no/');
    expect(nettside('')).toBeNull();
    expect(nettside('to ord')).toBeNull();
  });

  it('melder nye og endrede kontorer, men ikke endret antall lærlinger', () => {
    const gammel = byggOpplaeringskontor(enheter, hentet);
    const ny = byggOpplaeringskontor(
      enheter.map((e) => (e.Organisasjonsnummer === '959334188' ? { ...e, AntallLaerlinger: 140 } : e.Organisasjonsnummer === '938371547' ? { ...e, Kommune: { Navn: 'Bærum', Kommunenummer: '3201' } } : e)),
      hentet,
    );
    expect(sammenlignOpplaeringskontor(gammel, ny)).toEqual(['Endret (1): Adam og Eva']);
  });
});

describe('fagene på NDLA', () => {
  const noder = [
    { name: 'Samfunnskunnskap', url: '/f/samfunnskunnskap/052a', translations: [{ name: 'Samfunnskunnskap', language: 'nb' }, { name: 'Samfunnskunnskap nn', language: 'nn' }], metadata: { grepCodes: ['SAK1001', 'KV48', 'SAK1001'], visible: true, customFields: { subjectCategory: 'active' } } },
    { name: 'Gammelt fag', url: '/f/gammelt/1', metadata: { grepCodes: ['SAK1001'], visible: true, customFields: { subjectCategory: 'archive' } } },
    { name: 'Skjult', url: '/f/skjult/2', metadata: { grepCodes: ['SAK1001'], visible: false, customFields: { subjectCategory: 'active' } } },
  ];

  it('kobler bare fagkoder i fagindeksen til aktive fag som vises på ndla.no', () => {
    const d = byggNdla(noder, new Set(['SAK1001']), hentet);
    expect(d.fag).toEqual({ SAK1001: [{ navn: { nb: 'Samfunnskunnskap', nn: 'Samfunnskunnskap nn' }, sti: '/f/samfunnskunnskap/052a' }] });
    expect(validerNdla(d)).toEqual(['Fant bare 1 fagkoder med fag på NDLA.']);
    expect(sammenlignNdla(d, byggNdla([], new Set(), hentet))).toEqual(['Fjernede koblinger (1): SAK1001 → Samfunnskunnskap']);
  });
});

describe('valget «Min skole» / «Alle»', () => {
  it('lagres under en egen nøkkel og slettes med resten', () => {
    const data = new Map<string, string>();
    const lager: Lager = { getItem: (n) => data.get(n) ?? null, setItem: (n, v) => void data.set(n, v), removeItem: (n) => void data.delete(n) };
    expect(lesValg(lager, 'lopvisning')).toBeNull();
    skrivValg(lager, 'lopvisning', 'alle');
    data.set(LAGRINGSNOKKEL, '{}');
    expect(lesValg(lager, 'lopvisning')).toBe('alle');
    expect(VALGNOKLER.lopvisning).toBe(`${LAGRINGSNOKKEL}-lopvisning`);
    slettLagret(lager);
    expect(data.size).toBe(0);
    // Lagring som ikke virker, gir ingen feil.
    const odelagt: Lager = { getItem: () => { throw new Error('x'); }, setItem: () => { throw new Error('x'); }, removeItem: () => undefined };
    expect(lesValg(odelagt, 'lopvisning')).toBeNull();
    expect(() => skrivValg(odelagt, 'lopvisning', 'alle')).not.toThrow();
  });
});
