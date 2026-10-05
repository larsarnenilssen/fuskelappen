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

describe('knappen med det valgte fylket (eier 05.10.2026)', () => {
  it('viser skoler, kontor og lokale forskrifter i fylket, og alle når knappen er av', async () => {
    const { harAndreFylker, treffIFylket } = await import('../../src/core/sok/synlige.ts');
    const steder: Sokeoppforing[] = [
      { id: 's1', type: 'skole', tittel: { nb: 'Arna skole', nn: 'Arna skule' }, rute: '/s1', modul: 'opplaeringslop', sted: ['46'] },
      { id: 's2', type: 'skole', tittel: { nb: 'Askim skole', nn: 'Askim skule' }, rute: '/s2', modul: 'opplaeringslop', sted: ['31'] },
      { id: 'k1', type: 'kontor', tittel: { nb: 'Felles skolekontor', nn: 'Felles skulekontor' }, rute: '/k1', modul: 'opplaeringslop', sted: ['31', '46'] },
      { id: 'n', type: 'begrep', tittel: { nb: 'Skole', nn: 'Skule' }, rute: '/n', modul: 'begreper' },
    ];
    const indeks = lastIndeks(serialiser(byggIndeks(steder, synonymer)), synonymer);
    const treff = sok(indeks, 'skole');
    expect(treff.find((t) => t.id === 'k1')?.sted).toEqual(['31', '46']);
    expect(treff.find((t) => t.id === 'n')?.sted).toBeNull();
    expect(treffIFylket(treff, '46').map((t) => t.id).sort()).toEqual(['k1', 'n', 's1']);
    expect(harAndreFylker(treff, '46')).toBe(true);
    expect(harAndreFylker(treffIFylket(treff, '46'), '46')).toBe(false);
  });
});

describe('filtrene i søket (avgjørelse 058)', () => {
  it('teller treffene i hver gruppe, i fast rekkefølge, og filtrerer på gruppe', async () => {
    const { filtrerTreff, tellGrupper } = await import('../../src/core/sok/grupper.ts');
    const treff = [{ type: 'skole' as const }, { type: 'fag' as const }, { type: 'kalkulator' as const }, { type: 'tilbud' as const }, { type: 'lov' as const }];
    expect(tellGrupper(treff)).toEqual([
      { gruppe: 'sider', antall: 1 },
      { gruppe: 'regelverk', antall: 1 },
      { gruppe: 'fag', antall: 1 },
      { gruppe: 'tilbud', antall: 2 },
    ]);
    expect(filtrerTreff(treff, 'tilbud')).toEqual([{ type: 'skole' }, { type: 'tilbud' }]);
    expect(filtrerTreff(treff, 'alle')).toHaveLength(5);
  });

  it('alle gruppene har navn på begge målformer', async () => {
    const { SOKEGRUPPER } = await import('../../src/core/sok/grupper.ts');
    const { hentTekst } = await import('../../src/core/i18n/tekst.ts');
    for (const m of ['nb', 'nn'] as const) {
      for (const g of [...SOKEGRUPPER, 'alle', 'etikett'] as const) expect(hentTekst(m, `sok.filter.${g}`)).not.toMatch(/^sok\./);
    }
  });
});
