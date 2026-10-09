// Nyhetene (fase 7b): lesingen av feeder og lister, filteret for videregående og utvalget i appen.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { beholdes, rensUrl, slaaSammen, tilSaker } from '../../scripts/hent-nyheter.ts';
import { lesFil } from '../../scripts/innhold/last.ts';
import { erRelevant, vurder } from '../../scripts/nyheter/filter.ts';
import { lesLovdata } from '../../scripts/nyheter/lovdata.ts';
import { nyhetsstatus } from '../../scripts/nyheter/status.ts';
import { kortIngress, lesDato, lesFeed, lesHkdir, lesJsonliste, lesLenkeliste, lesUdir, lesUtdanningsforbundet, rensTekst } from '../../scripts/nyheter/les.ts';
import type { Kilderegister } from '../../src/core/innhold/skjema.ts';
import type { Nyhetskilder } from '../../src/modules/nyheter/kildeskjema.ts';
import { nyheterSkjema, type Nyhet } from '../../src/modules/nyheter/skjema.ts';
import { forsidefilterVerdi, forTrettiDager, lesFilter, lesForsidefilter, nyesteSaker, NYHETSKILDER, perDag, synligeKilder, velgSaker } from '../../src/modules/nyheter/utvalg.ts';

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

  it('leser nyhetslister som JSON, også i et attributt, og lenker med dato (prøvehentingen)', () => {
    const json = JSON.stringify({ items: [{ title: 'Inntaket er klart', url: '/nyheiter/inntak', description: 'Fleire fekk førstevalet.', updatedDateTime: '2026-08-07T10:00:00+02:00' }] });
    expect(lesJsonliste(json, 'https://www.vestlandfylke.no/')).toEqual([{ tittel: 'Inntaket er klart', url: 'https://www.vestlandfylke.no/nyheiter/inntak', dato: '2026-08-07', ingress: 'Fleire fekk førstevalet.', stikkord: [] }]);
    const html = `<div ng-init='vm.init(${JSON.stringify([{ title: 'Høring om tilbudsstruktur', url: 'https://t.no/a', published: '2026-06-16', ingress: 'Ny struktur.' }])})'></div>`;
    expect(lesJsonliste(html, 'https://t.no/')[0]).toMatchObject({ tittel: 'Høring om tilbudsstruktur', dato: '2026-06-16' });
    const liste = `<ul><li><div><a href="/no/aktuelt/elevar">Nye elevplassar i vidaregåande skule</a><span>07.10.2026</span></div></li></ul>`;
    expect(lesLenkeliste(liste, 'https://vestfoldfylke.no/no/aktuelt/')).toEqual([{ tittel: 'Nye elevplassar i vidaregåande skule', url: 'https://vestfoldfylke.no/no/aktuelt/elevar', dato: '2026-10-07', ingress: null, stikkord: [] }]);
  });

  it('leser «Aktuelt» hos HKdir', () => {
    const html = `<div><a href="/aktuelt/endringer-i-uvd-ordningen"><div><p>Endringer i UVD-ordningen</p></div><span>Publisert<!-- -->: <!-- -->30. september 2026</span> <p>Det blir endringer i ordningen.</p></a><a href="/aktuelt">Alle</a></div>`;
    expect(lesHkdir(html, 'https://hkdir.no/aktuelt')).toEqual([
      { tittel: 'Endringer i UVD-ordningen', url: 'https://hkdir.no/aktuelt/endringer-i-uvd-ordningen', dato: '2026-09-30', ingress: 'Det blir endringer i ordningen.', stikkord: [] },
    ]);
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
    ['Fordeling av skjønnsmidlar', 'Statsforvaltaren gjer ei heilskapleg vurdering av økonomien til kommunane.', 'ingen'],
    ['Matfylket Innlandet', 'Et samarbeid mellom Innlandet fylkeskommune og Statsforvalteren.', 'ingen'],
    ['Inn på tunet for enkeltelever', 'Et tiltak for elever med vedtak om individuelt tilrettelagt opplæring.', 'generell'],
    ['Webinar om tiltak', 'For elever i skolen.', 'generell'],
    ['Webinar om tiltak', 'For elever.', 'ingen'],
    ['PISA 2025: nedgang for norske elever', '34 prosent av tiendeklassingene', 'generell'],
    ['En ny skoledag for 1. og 2. trinn', 'elevene i skolen', 'utelukket'],
    ['Slik skal elevene lære mer i skolen', 'Smågruppeundervisning på 1. og 2. trinn', 'generell'],
    ['Eksamen i sikker nettleser', 'Fra våren 2027 skal elever i grunnskolen ta eksamen i sikker nettleser.', 'generell'],
    ['Statsbudsjettet 2027: 20,9 millioner til digital opplæring i fengsel', '', 'generell'],
    ['Webinar om tiltak', 'For elever i skolen fra 1. til 4. trinn i barneskolen.', 'utelukket'],
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

  it('forskning.no: saker om barn og foreldre er bare med med et sterkt ord', () => {
    const fno = fil.kilder.find((k) => k.id === 'forskning-no');
    if (!fno) throw new Error('Mangler kilden');
    const sak = (tittel: string, ingress: string) => ({ tittel, ingress, url: `https://f.no/${tittel.length}`, dato: '2026-10-01', stikkord: [] });
    const med = tilSaker(fno, filter, [
      sak('Trygg og ryddig skolegård. Men hva vil barna selv ha?', 'Elever i skolen ble spurt.'),
      sak('Slik kan elevene på yrkesfag få mer ut av matte-undervisningen', 'Elever i skolen.'),
      sak('Hvem er eksamensvurderingen egentlig til for?', 'Lærere og elever.'),
    ], '2026-07-01').map((s) => s.tittel);
    expect(med).toEqual(['Slik kan elevene på yrkesfag få mer ut av matte-undervisningen', 'Hvem er eksamensvurderingen egentlig til for?']);
  });

  it('saker fra før vurderes på nytt med filteret', () => {
    const kd = fil.kilder.find((k) => k.id === 'regjeringen-kd');
    if (!kd) throw new Error('Mangler kilden');
    expect(beholdes(kd, filter, { kilde: 'regjeringen-kd', tittel: 'Ny forskrift for Forsvarets høgskole', dato: '2026-08-24', url: 'https://r.no/1' })).toBe(false);
    expect(beholdes(kd, filter, { kilde: 'regjeringen-kd', tittel: 'Utstyrsstipend til alle i videregående', dato: '2026-06-19', url: 'https://r.no/2' })).toBe(true);
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

  // Filen ligger på grenen nyheter, ikke på main (avgjørelse 098). Arbeidsflyten Nyheter henter den og kjører testen
  // før den lagres. Uten filen (f.eks. i CI for en PR) hoppes testen over.
  const nyhetsfil = join(rot, 'data/nyheter/nyheter.json');
  it.skipIf(!existsSync(nyhetsfil))('data/nyheter/nyheter.json passer skjemaet og har bare kjente kilder', () => {
    const d = nyheterSkjema.parse(JSON.parse(readFileSync(nyhetsfil, 'utf8')));
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

  it('forsiden filtrerer på hvem eller kilde, og med én kilde gjelder ikke grensen per kilde', () => {
    const d = { skjema: 1 as const, hentet: '', kilder: {}, saker };
    expect(nyesteSaker(d, null, lesForsidefilter('kilde:udir')).map((s) => s.tittel)).toEqual(['A', 'B', 'C']);
    expect(nyesteSaker(d, null, lesForsidefilter('type:organisasjon')).map((s) => s.tittel)).toEqual(['D']);
    expect(lesForsidefilter('kilde:finnes-ikke')).toEqual({ type: null, kilde: null });
    expect(forsidefilterVerdi(lesForsidefilter('type:myndighet'))).toBe('type:myndighet');
  });

  it('filteret i adressen godtar bare kjente verdier', () => {
    expect(lesFilter(new URLSearchParams('hvem=myndighet&kilde=udir'))).toEqual({ type: 'myndighet', kilde: 'udir' });
    expect(lesFilter(new URLSearchParams('hvem=x&kilde=y'))).toEqual({ type: null, kilde: null });
  });
});

describe('nyhetssiden', () => {
  it('de siste 30 dagene står først', () => {
    expect(forTrettiDager('2026-10-07')).toBe('2026-09-07');
    expect(forTrettiDager('2026-03-01')).toBe('2026-01-30');
  });
});

describe('kildestatus og Lovdata', () => {
  const fil = (status: 'ok' | 'feilet' | 'tom', feilSiden?: string) => ({ skjema: 1 as const, hentet: '', kilder: { udir: { status, ...(feilSiden ? { feilSiden } : {}) } }, saker: [] });

  it('en kilde som har feilet i mer enn to dager, gir feil i kildesjekken', () => {
    expect(nyhetsstatus(fil('ok'), ['udir'], '2026-10-07T04:00:00Z').status).toBe('ok');
    expect(nyhetsstatus(fil('feilet', '2026-10-06'), ['udir'], '2026-10-07T04:00:00Z').status).toBe('ok');
    expect(nyhetsstatus(fil('tom', '2026-10-01'), ['udir'], '2026-10-07T04:00:00Z')).toMatchObject({ status: 'feilet' });
    expect(nyhetsstatus(null, ['udir'], '2026-10-07T04:00:00Z').status).toBe('feilet');
  });

  it('endringene fra Lovdata får tittel og ingress på begge målformer', () => {
    for (const s of lesLovdata(rot, '2026-10-07')) {
      expect(s.tittel).toMatch(/^Vedtatt endring i /);
      expect(s.tittelNn ?? s.tittel).toMatch(/^Vedteken endring i /);
      expect(s.url).toMatch(/^https:\/\/lovdata\.no\//);
    }
  });
});
