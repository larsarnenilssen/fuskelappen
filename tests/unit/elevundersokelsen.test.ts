// Elevundersøkelsen (fase 7, avgjørelse 077): radene fra Udirs statistikkbank blir til resultatene i appen, skjermede
// tall står som «*», og sammenligningen starter med skolen, fylket og landet.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { byggResultater, type Rad, tall, validerResultater } from '../../scripts/elevundersokelsen/bygg.ts';
import { elevundersokelsenSkjema } from '../../src/modules/skolemiljo/elevundersokelsen/skjema.ts';
import { type Elevundersokelsen } from '../../src/modules/skolemiljo/elevundersokelsen/skjema.ts';
import { egenSerie, endring, mobbeskala, retning, serieFra, serieTekst, standardSerier, standardTrinn, sterkestOgSvakest, verdi } from '../../src/modules/skolemiljo/elevundersokelsen/visning.ts';

const rot = join(__dirname, '../..');
const fylker = new Set(['42', '46']);
const sporsmal = [
  { kode: 'EUIndeks_1398', navn: 'Mobbing på skolen', type: 'mobbing' as const },
  { kode: 'EUIndeks_1379', navn: 'Trivsel', type: 'indeks' as const },
];
const rad = (r: Partial<Rad>): Rad => ({
  Spoersmaalkode: 'EUIndeks_1379',
  Skoleaarnavn: '2025-26',
  EnhetNivaa: 1,
  Fylkekode: '00',
  Organisasjonsnummer: 'I',
  EnhetNavn: 'Alle skoler',
  TrinnKode: '1',
  EierformNavn: 'Alle eierformer',
  Score: '4,2',
  AntallBesvart: '63 187',
  ...r,
});

describe('hentingen fra statistikkbanken', () => {
  it('leser tall med desimalkomma og mellomrom, og skjermede tall som «*»', () => {
    expect(tall('4,2')).toBe(4.2);
    expect(tall('62 093')).toBe(62093);
    expect(tall('*')).toBe('*');
    expect(tall(null)).toBeNull();
  });

  it('bygger landet, fylket og skolen, med eierform for landet og fylket, og hopper over gamle fylker', () => {
    const d = byggResultater(
      [
        rad({}),
        rad({ EierformNavn: 'Privat eiet', Score: '4,4' }),
        rad({ EnhetNivaa: 2, Organisasjonsnummer: '46', Fylkekode: '46', Fylke: 'Vestland', TrinnKode: '2', Score: '4,1' }),
        rad({ EnhetNivaa: 2, Organisasjonsnummer: '30', Fylkekode: '30', Fylke: 'Viken' }),
        rad({ EnhetNivaa: 3, Organisasjonsnummer: '974557584', Fylkekode: '46', EnhetNavn: 'Fyllingsdalen  videregående skole ', Score: '*', AntallBesvart: '*' }),
        rad({ EnhetNivaa: 3, Organisasjonsnummer: '974557584', Fylkekode: '46', EnhetNavn: 'Fyllingsdalen videregående skole', EierformNavn: 'Offentlig skole', Score: '3,0' }),
        rad({ Spoersmaalkode: 'EUIndeks_1398', Score: null, AndelMobbet: '5,5', Skoleaarnavn: '2024-25' }),
      ],
      { skolear: ['2024-25', '2025-26'], sporsmal, fylker, kilde: 'udir-elevundersokelsen', hentet: '2026-10-06' },
    );
    expect(elevundersokelsenSkjema.parse(d)).toBeTruthy();
    expect(Object.keys(d.enheter)).toEqual(['F46', 'L', 'S974557584']);
    expect(d.enheter.S974557584).toEqual({ navn: 'Fyllingsdalen videregående skole', fylke: '46' });
    expect(d.verdier['L|a']?.EUIndeks_1379).toEqual([
      [null, null, null],
      [4.2, null, null],
    ]);
    expect(d.verdier['L|p']?.EUIndeks_1379?.[1]?.[0]).toBe(4.4);
    expect(d.verdier['F46|a']?.EUIndeks_1379?.[1]?.[1]).toBe(4.1);
    // Skolen står bare for alle eierformer, og det skjermede tallet er «*».
    expect(d.verdier['S974557584|a']?.EUIndeks_1379?.[1]?.[0]).toBe('*');
    expect(d.verdier['S974557584|o']).toBeUndefined();
    expect(d.verdier['L|a']?.EUIndeks_1398?.[0]?.[0]).toBe(5.5);
    expect(d.antall['L|a']?.EUIndeks_1379?.[1]?.[0]).toBe(63187);
    expect(d.antall['L|a']?.EUIndeks_1398).toBeUndefined();
  });

  it('valideringen stopper en henting uten landet, fylkene og skolene', () => {
    const d = byggResultater([rad({})], { skolear: ['2025-26'], sporsmal, fylker, kilde: 'k', hentet: 'h' });
    expect(validerResultater(d).join(' ')).toMatch(/fylker.*skoler/);
  });
});

describe('sammenligningen', () => {
  const fil = join(rot, 'data/elevundersokelsen/resultater.json');
  const d = existsSync(fil) ? elevundersokelsenSkjema.parse(JSON.parse(readFileSync(fil, 'utf8'))) : null;

  it('seriene står i adressen, og en skole har bare alle eierformer', () => {
    expect(serieFra('F46|p')).toEqual({ enhet: 'F46', eierform: 'p' });
    expect(serieFra('S974557584|p')).toEqual({ enhet: 'S974557584', eierform: 'a' });
    expect(serieFra('L')).toEqual({ enhet: 'L', eierform: 'a' });
    expect(serieFra('X1')).toBeNull();
    expect(serieTekst({ enhet: 'F46', eierform: 'a' })).toBe('F46');
    expect(serieTekst({ enhet: 'L', eierform: 'p' })).toBe('L|p');
  });

  it('endringen fra året før er rundet til én desimal, og bare når begge er tall', () => {
    expect(endring(4.3, 4.1)).toBe(0.2);
    expect(endring('*', 4.1)).toBeNull();
  });

  it('bedre er lavere for mobbing og høyere for indeksene, og 0 er ingen av delene (eier 06.10.2026)', () => {
    expect(retning('mobbing', -0.6)).toBe('bedre');
    expect(retning('mobbing', 0.6)).toBe('svakere');
    expect(retning('indeks', 0.1)).toBe('bedre');
    expect(retning('indeks', -0.1)).toBe('svakere');
    expect(retning('indeks', 0)).toBeNull();
    expect(retning('indeks', null)).toBeNull();
  });

  it('«Kort om»: de tre mest over og mest under landet, uten skjermede tall, og skolen før fylket', () => {
    const koder = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const skole = [4.4, 3.9, 4.0, 3.5, 4.1, '*', 3.8] as const;
    const landet = [4.1, 4.0, 4.0, 3.7, 4.0, 4.0, 3.6] as const;
    const data: Elevundersokelsen = {
      kilde: 'test',
      hentet: '2026-10-06',
      skolear: ['2025-26'],
      sporsmal: koder.map((kode) => ({ kode, navn: kode, type: 'indeks' as const })),
      enheter: { L: { navn: 'Hele landet' }, S1: { navn: 'Skolen', fylke: '46' }, F46: { navn: 'Vestland' } },
      verdier: {
        'S1|a': Object.fromEntries(koder.map((k, i) => [k, [[skole[i] ?? null, null, null]]])),
        'L|a': Object.fromEntries(koder.map((k, i) => [k, [[landet[i] ?? null, null, null]]])),
        'F46|a': {},
      },
      antall: {},
    };
    const { sterkest, svakest } = sterkestOgSvakest(data, { enhet: 'S1', eierform: 'a' }, { enhet: 'L', eierform: 'a' }, koder, 0);
    expect(sterkest.map((f) => [f.kode, f.forskjell])).toEqual([['A', 0.3], ['G', 0.2], ['E', 0.1]]);
    expect(svakest.map((f) => [f.kode, f.forskjell])).toEqual([['D', -0.2], ['B', -0.1], ['C', 0]]);
    expect(egenSerie(data, { fylke: '46', skole: '1' })).toEqual({ enhet: 'S1', eierform: 'a' });
    expect(egenSerie(data, { fylke: '46', skole: '9' })).toEqual({ enhet: 'F46', eierform: 'a' });
    expect(egenSerie(data, { fylke: null, skole: null })).toBeNull();
  });

  it.runIf(d !== null)('starter med skolen, fylket og landet, og privatskoler mot privatskolene i landet (eier 06.10.2026)', () => {
    if (!d) return;
    const skole = Object.entries(d.enheter).find(([k, e]) => k.startsWith('S') && e.fylke === '46')?.[0].slice(1) ?? '';
    expect(standardSerier(d, { fylke: '46', skole, privatskole: false }).map(serieTekst)).toEqual([`S${skole}`, 'F46', 'L']);
    expect(standardSerier(d, { fylke: '46', skole, privatskole: true }).map(serieTekst)).toEqual([`S${skole}`, 'F46', 'L|p']);
    expect(standardSerier(d, { fylke: null, skole: null, privatskole: false }).map(serieTekst)).toEqual(['L', 'L|o', 'L|p']);
    // Landet har tall for alle trinn, og mobbing er en andel i prosent.
    const l = { enhet: 'L', eierform: 'a' as const };
    expect(standardTrinn(d, l)).toBe(0);
    expect(typeof verdi(d, l, 'EUIndeks_1398', d.skolear.length - 1, 0)).toBe('number');
    expect(mobbeskala(d, [l], ['EUIndeks_1398'], 0)).toBeGreaterThanOrEqual(10);
  });
});
