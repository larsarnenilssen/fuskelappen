import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Synonymer } from '../../src/core/innhold/skjema.ts';
import { byggIndeks, lagNormaliserer, lastIndeks, serialiser, sok, type Sokeoppforing } from '../../src/core/sok/sok.ts';
import { synligeTreff } from '../../src/core/sok/synlige.ts';
import { lesFil } from '../../scripts/innhold/last.ts';

const rot = join(__dirname, '../..');
const synonymer = lesFil(rot, join(rot, 'content/sok/synonymer.yaml')) as Synonymer;

const oppforinger: Sokeoppforing[] = [
  {
    id: 'a',
    type: 'begrep',
    tittel: { nb: 'Skolemiljø', nn: 'Skulemiljø' },
    tekst: { nb: '<p>Elevenes rett til et trygt miljø.</p>', nn: '<p>Retten elevane har til eit trygt miljø.</p>' },
    rute: '/a',
    modul: 'm',
  },
  { id: 'b', type: 'side', tittel: { nb: 'Skulereglar i Vestland', nn: 'Skulereglar i Vestland' }, rute: '/b', modul: 'm' },
  { id: 'c', type: 'begrep', tittel: { nb: 'Fravær', nn: 'Fravær' }, rute: '/c', modul: 'm' },
  { id: 'd', type: 'begrep', tittel: { nb: 'Årsramme', nn: 'Årsramme' }, stikkord: ['beskjeftigelse'], rute: '/d', modul: 'm' },
  { id: 'e', type: 'fag', tittel: { nb: 'Norsk', nn: 'Norsk' }, stikkord: ['NOR1267'], rute: '/e', modul: 'm' },
];

const indeks = byggIndeks(oppforinger, synonymer);
const ider = (s: string) => sok(indeks, s).map((r) => r.id);

describe('normalisering mellom målformene', () => {
  const n = lagNormaliserer(synonymer);
  it('gjør nynorske former om til bokmål, også i sammensatte ord', () => {
    expect(n('skule')).toBe(n('skole'));
    expect(n('Skulemiljø')).toBe('skolemiljø');
    expect(n('grunnskule')).toBe('grunnskole');
    expect(n('fråvær')).toBe('fravær');
    expect(n('lærar')).toBe('lærer');
    expect(n('opplæringslova')).toBe('opplæringsloven');
  });
});

describe('søk', () => {
  it('«skule» finner innhold skrevet med «skole», og omvendt', () => {
    expect(ider('skule')).toContain('a');
    expect(ider('skole')).toContain('a');
    expect(ider('skoleregler')).toContain('b');
    expect(ider('skulereglar')).toContain('b');
  });

  it('finner nynorsk stavemåte av fravær', () => {
    expect(ider('fråvær')).toContain('c');
  });

  it('tåler skrivefeil og treffer stikkord og fagkode', () => {
    expect(ider('årsrame')).toContain('d');
    expect(ider('beskjeftigelse')).toContain('d');
    expect(ider('nor1267')).toContain('e');
  });

  it('søker ikke på under to tegn', () => {
    expect(sok(indeks, 's')).toEqual([]);
  });

  it('indeksen kan lagres og lastes', () => {
    const lastet = lastIndeks(serialiser(indeks), synonymer);
    expect(sok(lastet, 'skule').map((r) => r.id)).toEqual(ider('skule'));
    expect(sok(lastet, 'skule')[0]?.tittel).toEqual({ nb: 'Skolemiljø', nn: 'Skulemiljø' });
  });
});

describe('fylkesinnhold i søket', () => {
  const indeks = byggIndeks(
    [
      { id: 'begrep:arsramme', type: 'begrep', tittel: { nb: 'Årsramme', nn: 'Årsramme' }, rute: '/begreper/arsramme', modul: 'begreper' },
      { id: 'begrep:inntaksomrade', type: 'begrep', tittel: { nb: 'Inntaksområde', nn: 'Inntaksområde' }, rute: '/begreper/inntaksomrade', modul: 'begreper', fylke: '46' },
    ],
    synonymer,
  );

  it('treff som bare gjelder et fylke, vises bare når det fylket er valgt', () => {
    const treff = sok(indeks, 'inntaksområde');
    expect(treff.map((t) => t.fylke)).toEqual(['46']);
    expect(synligeTreff(treff, '46')).toHaveLength(1);
    expect(synligeTreff(treff, null)).toHaveLength(0);
    expect(synligeTreff(treff, '03')).toHaveLength(0);
    expect(synligeTreff(sok(indeks, 'årsramme'), null)).toHaveLength(1);
  });
});
