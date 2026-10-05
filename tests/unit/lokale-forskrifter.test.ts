// Lokale forskrifter for alle fylker og skoler (avgjørelse 061): registeret hos Lovdata, typen ut fra hjemmelen,
// fylket og skolen, og id-ene i appen. Eksempelsidene er hentet fra Lovdata 05.10.2026.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { klassifiserVurdering, type Titler, velgForskrifter, vurder, type Vurdering } from '../../scripts/lovdata/lokale.ts';
import { erKandidat, finnFylke, finnSkoler, klassifiser, lesMetadata, lesRegisterside, normaliserSkolenavn, skolearFor, slug } from '../../scripts/lovdata/register.ts';
import { lesLovdataside } from '../../scripts/lovdata/side.ts';

const side = (navn: string) => readFileSync(`tests/fixtures/lovdata/${navn}.html`, 'utf8');
const fylker = [
  { nummer: '03', navn: 'Oslo' },
  { nummer: '15', navn: 'Møre og Romsdal' },
  { nummer: '46', navn: 'Vestland' },
];
const skoler = [
  { id: '1', navn: 'Eid vidaregåande skule', fylke: '46' },
  { id: '2', navn: 'Arna vidaregåande skule', fylke: '46' },
  { id: '3', navn: 'Førde vidaregåande skule', fylke: '46' },
  { id: '4', navn: 'Høyanger vidaregåande skule', fylke: '46' },
  { id: '5', navn: 'Bergen katedralskole', fylke: '46' },
  { id: '6', navn: 'Eid vidaregåande skule', fylke: '15' },
];
const titler: Titler = {
  skoleregler: { nb: 'Skoleregler i {sted}', nn: 'Skulereglar i {sted}' },
  'skoleregler-voksne': { nb: 'Regler for voksne i {sted}', nn: 'Reglar for vaksne i {sted}' },
  'skoleregler-skole': { nb: 'Skoleregler ved {sted}', nn: 'Skulereglar ved {sted}' },
  inntak: { nb: 'Inntak og formidling i {sted}', nn: 'Inntak og formidling i {sted}' },
  skolerute: { nb: 'Skolerute {skolear} i {sted}', nn: 'Skulerute {skolear} i {sted}' },
  skyss: { nb: 'Skyss og rabattordning i {sted}', nn: 'Skyss og rabattordning i {sted}' },
  fagfordeling: { nb: 'Fag- og timefordeling, {sted}', nn: 'Fag- og timefordeling, {sted}' },
};

describe('registeret hos Lovdata', () => {
  it('leser treffene, antallet og om det finnes en side til', () => {
    const s = lesRegisterside(side('register'));
    expect(s.treff).toHaveLength(20);
    expect(s.treff[0]?.refid).toMatch(/^forskrift\/\d{4}-\d{2}-\d{2}-\d+$/);
    expect(s.antall).toBe(1423);
    expect(s.neste).toBe(true);
  });

  it('kandidatene velges på tittelen, for fylkeskommunen og Oslo kommune', () => {
    expect(erKandidat('Forskrift om skulereglar, Eid vidaregåande skule, Vestland fylkeskommune')).toBe(true);
    expect(erKandidat('Forskrift om lokale tilleggsreglar for Arna vidaregåande skule, Vestland fylkeskommune')).toBe(true);
    expect(erKandidat('Forskrift om inntak til videregående opplæring og formidling til læreplass, Oslo kommune, Oslo')).toBe(true);
    expect(erKandidat('Forskrift om skulerute for skuleåret 2026/2027, Vestland fylkeskommune')).toBe(true);
    expect(erKandidat('Forskrift om ordensreglement for Lia skole, Sandnes kommune, Rogaland')).toBe(false);
    expect(erKandidat('Forskrift om skolerute for grunnskolen, Oslo kommune, Oslo')).toBe(false);
    expect(erKandidat('Forskrift om felles skoleregler for de videregående skolene i Nordland')).toBe(true);
    expect(erKandidat('Forskrift om skoleregler og skoledemokrati for elever, Rogaland')).toBe(true);
    expect(erKandidat('Forskrift om skoleregler og skoledemokrati i Sola-skolen, Sola kommune, Rogaland')).toBe(false);
    expect(erKandidat('Forskrift om rabattordning for elever i videregående opplæring, Rogaland fylkeskommune')).toBe(true);
    expect(erKandidat('Forskrift om omdisponering av timar ved Sveio skule og Vikse skule, Sveio kommune, Vestland')).toBe(false);
    expect(erKandidat('Forskrift om opning av jakt på hjort, Øygarden kommune, Vestland')).toBe(false);
  });
});

describe('dokumentsiden', () => {
  it('leser metadataene: ikrafttredelse, fylket, hjemmelen og målformen', () => {
    const m = lesMetadata(side('lf-skulerute'));
    expect(m).toMatchObject({ dato: 'FOR-2026-08-06-1634', iKraft: '2026-08-01', iKraftTil: '2027-07-31', gjelderFor: 'Vestland', hjemmel: ['lov/2023-06-09-30/§14-1'], malform: 'nn' });
  });

  it('typen følger hjemmelen, og skolens egne regler kjennes igjen', () => {
    const eid = lesMetadata(side('lf-eid'));
    expect(klassifiser(eid, ['1'])).toBe('skoleregler-skole');
    // Uten treff i skoleregisteret er det likevel skolens regler, fordi hjemmelen også er fylkets skoleregler.
    expect(klassifiser(eid, [])).toBe('skoleregler-skole');
    expect(klassifiser(lesMetadata(side('lf-skulerute')), [])).toBe('skolerute');
    const fylket = { ...eid, tittel: 'Forskrift om skulereglar, Vestland fylkeskommune', hjemmel: ['lov/2023-06-09-30/§10-7', 'lov/2023-06-09-30/§20-3'] };
    expect(klassifiser(fylket, [])).toBe('skoleregler');
    expect(klassifiser({ ...fylket, tittel: 'Forskrift om ordensreglement for vaksne, Rogaland fylkeskommune' }, [])).toBe('skoleregler-voksne');
    expect(klassifiser({ ...fylket, tittel: 'Forskrift om inntak, Oslo kommune', hjemmel: ['forskrift/2024-06-03-900/§4-5'] }, [])).toBe('inntak');
    expect(klassifiser({ ...fylket, tittel: 'Forskrift om tilskot, Vestland fylkeskommune', hjemmel: ['lov/2023-06-09-30/§13-4'] }, [])).toBeNull();
  });

  it('fylket fra «Gjelder for», og skolene ved navn i fylket', () => {
    expect(finnFylke('Vestland', fylker)).toBe('46');
    expect(finnFylke('Oslo kommune, Oslo', fylker)).toBe('03');
    expect(finnFylke('Troms, Finnmark', fylker)).toBeNull();
    expect(finnSkoler('Forskrift om skulereglar, Eid vidaregåande skule, Vestland fylkeskommune', '46', skoler).map((s) => s.id)).toEqual(['1']);
    expect(finnSkoler('Forskrift om lokale tilleggsreglar for Arna vgs, Vestland fylkeskommune', '46', skoler).map((s) => s.id)).toEqual(['2']);
    expect(finnSkoler('Forskrift om skulereglar for Førde og Høyanger vidaregåande skular, Vestland fylkeskommune', '46', skoler).map((s) => s.id)).toEqual(['3', '4']);
    expect(finnSkoler('Forskrift om skulereglar, Vestland fylkeskommune', '46', skoler)).toEqual([]);
    expect(normaliserSkolenavn('Eid Vidaregåande Skule')).toBe('eid vgs');
  });

  it('skoleåret til en skolerute, og navnene i adressene', () => {
    expect(skolearFor('2026-08-01', '2027-07-31')).toBe('2026-2027');
    expect(skolearFor('2027-01-01', null)).toBe('2026-2027');
    expect(skolearFor('2025-08-01', '2028-07-31')).toBe('2025-2028');
    expect(slug('Møre og Romsdal')).toBe('more-og-romsdal');
    expect(slug('Eid vidaregåande skule')).toBe('eid-vidaregaande-skule');
  });

  it('leser tabeller og tekst før første paragraf, og ikrafttredelsen', () => {
    const oppsett = { id: 'x', kilde: 'lovdata-lokale', kapitler: null, refid: 'forskrift/2026-08-06-1634', gyldighet: { niva: 'fylke' as const, fylke: '46' }, hentet: '2026-10-05', lokaltype: 'skolerute' as const };
    const rute = lesLovdataside(side('lf-skulerute'), oppsett);
    expect(rute).toMatchObject({ iKraft: '2026-08-01', iKraftTil: '2027-07-31', lokaltype: 'skolerute' });
    const tabell = rute.seksjoner[0]?.paragrafer[1]?.ledd.find((l) => l.tabell)?.tabell;
    expect(tabell?.hode).toEqual([['Månad'], ['Veke/dato'], ['Hending']]);
    expect(tabell?.rader[0]).toEqual([['August'], ['måndag 17. august'], ['Første skuledag']]);
    const arna = lesLovdataside(side('lf-arna'), { ...oppsett, refid: 'forskrift/2024-10-04-3683' });
    expect(arna.seksjoner[0]?.merknader[0]).toEqual(['Reglane er utarbeidd på grunnlag av lokal høyringsprosess hausten 2024.']);
  });
});

const vestland = { gjelderFor: 'Vestland', malform: 'nn' as const };
const v = (refid: string, tittel: string, hjemmel: string[], iKraft: string | null, ekstra: Partial<Vurdering> = {}): Vurdering => ({
  refid,
  tittel,
  hjemmel,
  iKraft,
  iKraftTil: null,
  sistEndret: null,
  vurdert: '2026-10-05',
  ...vestland,
  ...ekstra,
});
const SKOLEREGLER = ['lov/2023-06-09-30/§10-7'];
const UNDER_FYLKET = ['lov/2023-06-09-30/§10-7', 'forskrift/2024-06-18-1455/§15'];

describe('forskriftene i appen', () => {
  it('får faste id-er og titler på forskriftens målform', () => {
    const ut = velgForskrifter(
      [
        v('forskrift/2026-06-16-1587', 'Forskrift om skulereglar, Vestland fylkeskommune', SKOLEREGLER, '2026-08-01'),
        v('forskrift/2025-08-18-2220', 'Forskrift om skulereglar, Eid vidaregåande skule, Vestland fylkeskommune', UNDER_FYLKET, '2025-08-18'),
        v('forskrift/2025-01-29-147', 'Forskrift om inntak til videregående opplæring, Oslo kommune, Oslo', ['forskrift/2024-06-03-900/§4-5'], '2025-02-01', { gjelderFor: 'Oslo kommune, Oslo', malform: 'nb' }),
      ],
      fylker,
      skoler,
      titler,
      '2026-10-05',
    );
    expect(ut.map((f) => [f.id, f.korttittel])).toEqual([
      ['oslo-inntak', 'Inntak og formidling i Oslo'],
      ['eid-vidaregaande-skule-skoleregler', 'Skulereglar ved Eid vidaregåande skule'],
      ['vestland-skoleregler', 'Skulereglar i Vestland'],
    ]);
  });

  it('den som gjelder i dag får id-en, en senere får «-fra-», og en eldre tas ikke med', () => {
    const t = 'Forskrift om skulereglar, Vestland fylkeskommune';
    const ut = velgForskrifter([v('a', t, SKOLEREGLER, '2024-08-01'), v('b', t, SKOLEREGLER, '2026-08-01'), v('c', t, SKOLEREGLER, '2027-08-01')], fylker, skoler, titler, '2026-10-05');
    expect(ut.map((f) => [f.id, f.refid])).toEqual([
      ['vestland-skoleregler', 'b'],
      ['vestland-skoleregler-fra-2027-08-01', 'c'],
    ]);
  });

  it('skoleruter for skoleår som er over, tas ikke med, og en rute for flere skoleår står med alle', () => {
    const t = 'Forskrift om skulerute, Vestland fylkeskommune';
    const rute = ['lov/2023-06-09-30/§14-1'];
    const ut = velgForskrifter(
      [
        v('a', t, rute, '2025-08-01', { iKraftTil: '2026-07-31' }),
        v('b', t, rute, '2026-08-01', { iKraftTil: '2027-07-31' }),
        v('c', 'Forskrift om skole- og feriedagar (skolerute) (2025–2028), Møre og Romsdal fylkeskommune', [], '2025-08-01', { iKraftTil: '2028-07-31', gjelderFor: 'Møre og Romsdal', hjemmel: ['lov/2023-06-09-30'] }),
        v('d', 'Forskrift om skulereglar', SKOLEREGLER, '2025-01-01', { gjelderFor: 'Troms, Finnmark' }),
        v('e', 'Forskrift om lokale tilleggsreglar for Ukjent vidaregåande skule', UNDER_FYLKET, '2025-01-01'),
      ],
      fylker,
      skoler,
      titler,
      '2026-10-05',
    );
    expect(ut.map((f) => [f.id, f.korttittel])).toEqual([
      ['more-og-romsdal-skolerute-2025-2028', 'Skulerute 2025–2028 i Møre og Romsdal'],
      ['vestland-skolerute-2026-2027', 'Skulerute 2026–2027 i Vestland'],
    ]);
  });

  it('typen ut fra tittelen når hjemmelen er en annen enn § 10-7 og § 14-1', () => {
    const m = (tittel: string) => klassifiser({ tittel, hjemmel: ['lov/2023-06-09-30/§20-3'] }, []);
    expect(m('Forskrift om ordensreglar for vidaregåande opplæring for vaksne, Møre og Romsdal fylkeskommune')).toBe('skoleregler-voksne');
    expect(m('Forskrift om rabattordning i stedet for gratis skyss, Rogaland fylkeskommune')).toBe('skyss');
    expect(klassifiser({ tittel: 'Forskrift om omfordeling av timar ved Eid vidaregåande skule', hjemmel: ['forskrift/2024-06-03-900/§1-3'] }, ['1'])).toBe('fagfordeling');
    expect(klassifiser({ tittel: 'Forskrift om inntak, Troms fylkeskommune', hjemmel: ['lov/2023-06-09-30/§5-3'] }, [])).toBe('inntak');
    expect(klassifiser({ tittel: 'Forskrift om skulereglar', hjemmel: ['lov/2005-06-17-62'] }, [])).toBeNull();
    // Forskrifter etter den gamle opplæringslova som Lovdata har som gjeldende, tas med.
    expect(klassifiser({ tittel: 'Forskrift om fleksibilitet i fag- og timefordeling ved Greåker videregående skole', hjemmel: ['lov/1998-07-17-61', 'forskrift/2006-06-23-724/§1-3'] }, ['x'])).toBe('fagfordeling');
  });

  it('metadataene fra dokumentsiden lagres, og typen avgjøres for hver henting', () => {
    const r = vurder('forskrift/2025-08-18-2220', lesMetadata(side('lf-eid')), '2026-10-05');
    expect(r).toMatchObject({ gjelderFor: 'Vestland', malform: 'nn', iKraft: '2025-08-18' });
    expect(klassifiserVurdering(r, fylker, skoler)).toEqual({ type: 'skoleregler-skole', fylke: '46', skoler: ['1'] });
  });
});

describe('kommunenes forskrifter', () => {
  it('tar ikke med skoleregler og skolerute fra en kommune eller et herad', async () => {
    const { erKommunal } = await import('../../scripts/lovdata/register.ts');
    expect(erKandidat('Forskrift om skulereglar for offentlege grunnskular, Kvam herad, Vestland')).toBe(false);
    expect(erKandidat('Forskrift om skulerute 2026–2027, Ulvik herad, Vestland')).toBe(false);
    expect(erKommunal('Forskrift om skulereglar, Ulvik herad, Vestland', 'Ulvik herad, Vestland')).toBe(true);
    // Fylkets forskrift for én skole kan ha kommunen i «Gjelder for».
    expect(erKommunal('Forskrift om fleksibilitet i fag- og timefordeling i videregående opplæring i Akershus fylkeskommune', 'Vestby kommune, Akershus')).toBe(false);
    expect(erKommunal('Forskrift om skoleregler og skoledemokrati, Oslo kommune, Oslo', 'Oslo kommune, Oslo')).toBe(false);
  });
});
