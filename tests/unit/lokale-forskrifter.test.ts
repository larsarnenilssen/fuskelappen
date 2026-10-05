// Lokale forskrifter for alle fylker og skoler (avgjørelse 061): registeret hos Lovdata, typen ut fra hjemmelen,
// fylket og skolen, og id-ene i appen. Eksempelsidene er hentet fra Lovdata 05.10.2026.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { type Titler, velgForskrifter, vurder, type Vurdering } from '../../scripts/lovdata/lokale.ts';
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
    expect(klassifiser({ ...fylket, hjemmel: ['lov/2023-06-09-30/§13-4'] }, [])).toBeNull();
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

const v = (refid: string, type: Vurdering['type'], iKraft: string | null, ekstra: Partial<Vurdering> = {}): Vurdering => ({
  refid,
  tittel: refid,
  type,
  fylke: '46',
  skoler: [],
  malform: 'nn',
  iKraft,
  iKraftTil: null,
  sistEndret: null,
  vurdert: '2026-10-05',
  ...ekstra,
});

describe('forskriftene i appen', () => {
  it('får faste id-er og titler på forskriftens målform', () => {
    const ut = velgForskrifter(
      [v('forskrift/2026-06-16-1587', 'skoleregler', '2026-08-01'), v('forskrift/2025-08-18-2220', 'skoleregler-skole', '2025-08-18', { skoler: ['1'] }), v('forskrift/2025-01-29-147', 'inntak', '2025-02-01', { fylke: '03', malform: 'nb' })],
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
    const ut = velgForskrifter([v('a', 'skoleregler', '2024-08-01'), v('b', 'skoleregler', '2026-08-01'), v('c', 'skoleregler', '2027-08-01')], fylker, skoler, titler, '2026-10-05');
    expect(ut.map((f) => [f.id, f.refid])).toEqual([
      ['vestland-skoleregler', 'b'],
      ['vestland-skoleregler-fra-2027-08-01', 'c'],
    ]);
  });

  it('skoleruter for skoleår som er over, tas ikke med, og forskrifter uten fylke eller skole heller ikke', () => {
    const ut = velgForskrifter(
      [
        v('a', 'skolerute', '2025-08-01', { iKraftTil: '2026-07-31' }),
        v('b', 'skolerute', '2026-08-01', { iKraftTil: '2027-07-31' }),
        v('c', 'skoleregler', '2025-01-01', { fylke: null }),
        v('d', 'skoleregler-skole', '2025-01-01'),
      ],
      fylker,
      skoler,
      titler,
      '2026-10-05',
    );
    expect(ut.map((f) => [f.id, f.korttittel])).toEqual([['vestland-skolerute-2026-2027', 'Skulerute 2026–2027 i Vestland']]);
  });

  it('vurderingen samler fylke, skoler og type fra dokumentsiden', () => {
    const r = vurder('forskrift/2025-08-18-2220', lesMetadata(side('lf-eid')), fylker, skoler, '2026-10-05');
    expect(r).toMatchObject({ type: 'skoleregler-skole', fylke: '46', skoler: ['1'], malform: 'nn', iKraft: '2025-08-18' });
  });
});
