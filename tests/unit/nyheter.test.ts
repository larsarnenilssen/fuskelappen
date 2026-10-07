// Nyhetene (fase 7b): lesingen av feeder og lister, filteret for videregående og utvalget i appen.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { rensUrl, slaaSammen, tilSaker } from '../../scripts/hent-nyheter.ts';
import { lesFil } from '../../scripts/innhold/last.ts';
import { erRelevant, vurder } from '../../scripts/nyheter/filter.ts';
import { kortIngress, lesDato, lesFeed, lesUdir, lesUtdanningsforbundet, rensTekst } from '../../scripts/nyheter/les.ts';
import type { Kilderegister } from '../../src/core/innhold/skjema.ts';
import type { Nyhetskilder } from '../../src/modules/nyheter/kildeskjema.ts';
import { nyheterSkjema, type Nyhet } from '../../src/modules/nyheter/skjema.ts';
import { lesFilter, nyesteSaker, NYHETSKILDER, perDag, synligeKilder, velgSaker } from '../../src/modules/nyheter/utvalg.ts';

const rot = join(__dirname, '../..');
const fil = lesFil(rot, join(rot, 'content/nyheter/kilder.yaml')) as Nyhetskilder;
const { filter } = fil;

describe('lesingen', () => {
  it('leser RSS med CDATA, tegn og kategorier', () => {
    const xml = `<rss><channel><item><title><![CDATA[Ny forskrift &amp; frister]]></title><link>https://eks.no/a?utm_source=x&amp;id=2</link>
      <pubDate>Tue, 06 Oct 2026 22:30:00 GMT</pubDate><description>&lt;p&gt;Om &lt;b&gt;inntak&lt;/b&gt;&lt;/p&gt;</description><category>Skole</category></item></channel></rss>`;
    const [s] = lesFeed(xml);
    expect(s).toMatchObject({ tittel: 'Ny forskrift & frister', dato: '2026-10-07', ingress: 'Om inntak', stikkord: ['Skole'] });
    expect(rensUrl(s?.url ?? '')).toBe('https://eks.no/a?id=2');
  });

  it('leser Atom', () => {
    const xml = `<feed><entry><title>Tittel</title><link rel="alternate" href="https://eks.no/b"/><published>2026-10-01T08:00:00+02:00</published><summary>Kort</summary></entry></feed>`;
    expect(lesFeed(xml)).toEqual([{ tittel: 'Tittel', url: 'https://eks.no/b', dato: '2026-10-01', ingress: 'Kort', stikkord: [] }]);
  });

  it('leser nyhetslisten til Udir og Utdanningsforbundet', () => {
    const udir = `<div class="news-element"><div class="news-element__tag">Artikkel</div><h2 class="news-element__title"><a href="/om-udir/x/">H&oslash;ring</a></h2><div class="news-element__excerpt"><p>Tekst</p></div><time class="news-element__time">06.10.2026</time></div>`;
    expect(lesUdir(udir, 'https://www.udir.no/om-udir/siste-nytt/')).toEqual([{ tittel: 'Høring', url: 'https://www.udir.no/om-udir/x/', dato: '2026-10-06', ingress: 'Tekst', stikkord: ['Artikkel'] }]);
    const udf = `<article><a href="/nyheter/2026/a"><h2 class="Kort_title__x">Tittel</h2><p class="Kort_ingress__y">Ingress</p><p class="Kort_publishDate__z">Publisert<!-- --> 05.10.2026</p></a></article>`;
    expect(lesUtdanningsforbundet(udf, 'https://www.utdanningsforbundet.no/nyheter')).toEqual([{ tittel: 'Tittel', url: 'https://www.utdanningsforbundet.no/nyheter/2026/a', dato: '2026-10-05', ingress: 'Ingress', stikkord: [] }]);
  });

  it('renser tekst, korter ingressen og leser datoer', () => {
    expect(rensTekst('<p>A&nbsp;&amp;&#229;</p>')).toBe('A &å');
    expect(kortIngress('ord '.repeat(100), 50).length).toBeLessThanOrEqual(52);
    expect(lesDato('1.2.2026')).toBe('2026-02-01');
    expect(lesDato('ikke en dato')).toBeNull();
  });
});

describe('filteret for videregående', () => {
  it.each([
    ['No får alle elevar i vidaregåande utstyrsstipend', '', 'sterk'],
    ['Høring om overgangsordning for modulstrukturerte læreplaner', 'opplæringsforskriften § 23-8', 'sterk'],
    ['Råd om digitale hjelpemidler i vurderingen', '', 'generell'],
    ['En ny skoledag for 1. og 2. trinn', 'elevene i skolen', 'utelukket'],
    ['Rekordmange får tilbud om fagskoleutdanning', 'fagbrev', 'utelukket'],
    ['Søkertall for midler til barnehagelærerutdanning', '', 'utelukket'],
    ['Strategi for Ny-Ålesund Forskningsstasjon', '', 'ingen'],
  ])('%s → %s', (tittel, tekst, svar) => {
    expect(vurder(filter, tittel, tekst)).toBe(svar);
  });

  it('et ord treffer starten på et ord, ikke midt i', () => {
    expect(erRelevant(filter, 'Elevene får mer tid')).toBe(true);
    expect(erRelevant(filter, 'Nyttig verktøy for deleveranser')).toBe(false);
  });
});

describe('hentingen', () => {
  const kilde = fil.kilder.find((k) => k.id === 'skolelederforbundet');
  it('utelater medlemstilbud og saker uten dato eller eldre enn grensen', () => {
    if (!kilde) throw new Error('Mangler kilden');
    const raa = [
      { tittel: 'Kampanjemåned: Gunstig tannhelseforsikring', url: 'https://a.no/1', dato: '2026-10-01', ingress: null, stikkord: [] },
      { tittel: 'Start med lederen', url: 'https://a.no/2', dato: '2026-09-29', ingress: 'Ingress', stikkord: [] },
      { tittel: 'Uten dato', url: 'https://a.no/3', dato: null, ingress: null, stikkord: [] },
      { tittel: 'Gammel', url: 'https://a.no/4', dato: '2026-01-01', ingress: null, stikkord: [] },
    ];
    expect(tilSaker(kilde, filter, raa, '2026-07-01')).toEqual([{ kilde: 'skolelederforbundet', tittel: 'Start med lederen', dato: '2026-09-29', url: 'https://a.no/2', ingress: 'Ingress' }]);
  });

  it('beholder saker fra før som har falt ut av feeden', () => {
    const ny: Nyhet = { kilde: 'udir', tittel: 'Ny', dato: '2026-10-07', url: 'https://u.no/ny' };
    const gammel: Nyhet = { kilde: 'udir', tittel: 'Gammel', dato: '2026-09-01', url: 'https://u.no/gammel' };
    expect(slaaSammen([ny], [gammel, ny], '2026-07-01')).toEqual([ny, gammel]);
    expect(slaaSammen([ny], [gammel], '2026-09-15')).toEqual([ny]);
  });
});

describe('kildene og dataene', () => {
  const register = lesFil(rot, join(rot, 'content/kilder.yaml')) as Kilderegister;
  const ider = new Set(register.kilder.map((k) => k.id));

  it('hver kilde finnes i kilderegisteret, og id-ene er unike', () => {
    for (const k of fil.kilder) expect(ider.has(k.kilde), k.kilde).toBe(true);
    expect(new Set(fil.kilder.map((k) => k.id)).size).toBe(fil.kilder.length);
  });

  it('organisasjonene er interesseparter, og Statsforvalteren har fylke', () => {
    for (const k of fil.kilder.filter((k) => k.id.startsWith('statsforvalteren'))) expect(k.fylker?.length, k.id).toBeGreaterThan(0);
  });

  it('data/nyheter/nyheter.json passer skjemaet og har bare kjente kilder', () => {
    const d = nyheterSkjema.parse(JSON.parse(readFileSync(join(rot, 'data/nyheter/nyheter.json'), 'utf8')));
    const kjente = new Set(fil.kilder.map((k) => k.id));
    for (const s of d.saker) expect(kjente.has(s.kilde), s.kilde).toBe(true);
  });
});

describe('utvalget i appen', () => {
  const saker: Nyhet[] = [
    { kilde: 'udir', tittel: 'A', dato: '2026-10-07', url: 'https://u.no/a' },
    { kilde: 'udir', tittel: 'B', dato: '2026-10-07', url: 'https://u.no/b' },
    { kilde: 'udir', tittel: 'C', dato: '2026-10-06', url: 'https://u.no/c' },
    { kilde: 'utdanningsforbundet', tittel: 'D', dato: '2026-10-05', url: 'https://u.no/d' },
  ];

  it('filtrerer på hvem og kilde, og grupperer per dag', () => {
    const kilder = synligeKilder(NYHETSKILDER, null);
    expect(velgSaker(saker, kilder, { type: 'organisasjon', kilde: null }).map((s) => s.tittel)).toEqual(['D']);
    expect(velgSaker(saker, kilder, { type: null, kilde: 'udir' })).toHaveLength(3);
    expect(perDag(saker).map((d) => [d.dato, d.saker.length])).toEqual([['2026-10-07', 2], ['2026-10-06', 1], ['2026-10-05', 1]]);
  });

  it('forsiden har høyst to saker fra hver kilde', () => {
    expect(nyesteSaker({ skjema: 1, hentet: '', kilder: {}, saker }, null).map((s) => s.tittel)).toEqual(['A', 'B', 'D']);
  });

  it('filteret i adressen godtar bare kjente verdier', () => {
    expect(lesFilter(new URLSearchParams('hvem=myndighet&kilde=udir'))).toEqual({ type: 'myndighet', kilde: 'udir' });
    expect(lesFilter(new URLSearchParams('hvem=x&kilde=y'))).toEqual({ type: null, kilde: null });
  });
});
