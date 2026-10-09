// Bekreftelsen av lenkene til fylkenes temasider (avgjørelse 106): tittelen leses og vurderes mot temaet, filen endres
// linje for linje, og en adresse som bare virker med eller uten www, gir ingen falsk alarm.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { alleLenker, ikkeBekreftet, lesOverskrifter, passerTema, settFylkeslenke, skalSjekkes, vurderLenke } from '../../scripts/lenker/fylkeslenker.ts';
import { annenVariant, sjekkUrl, vurderSvar } from '../../scripts/lenker/sjekk.ts';
import type { Fylkeslenker } from '../../src/core/innhold/skjema.ts';

describe('tittelen og temaet', () => {
  it('leser tittel, og:title og første overskrift, uten tagger og med æ, ø og å', () => {
    const html = '<html><head><title>S&oslash;ke skoleplass - Telemark fylkeskommune</title><meta property="og:title" content="Søke skoleplass"></head><body><h1 class="x">Søke <span>skoleplass</span></h1></body></html>';
    expect(lesOverskrifter(html)).toEqual({ tittel: 'Søke skoleplass - Telemark fylkeskommune | Søke skoleplass', h1: 'Søke skoleplass' });
    expect(lesOverskrifter('<p>ingenting</p>')).toEqual({ tittel: null, h1: null });
  });

  it('godtar ord for temaet på bokmål og nynorsk, også i begynnelsen av sammensatte ord', () => {
    expect(passerTema('inntak', 'Søknad og inntak til vidaregåande opplæring')).toBe(true);
    expect(passerTema('inntak', 'Søke skoleplass')).toBe(true);
    expect(passerTema('sprak', 'Vidaregåande opplæring for minoritetsspråklege')).toBe(true);
    expect(passerTema('tilrettelegging', 'Tilrettelegging ved læringsutfordringar')).toBe(true);
    expect(passerTema('tilrettelegging', 'Pedagogisk-psykologisk tjeneste')).toBe(true);
    expect(passerTema('fagprove', 'Fag-, sveine- og kompetanseprøve')).toBe(true);
    expect(passerTema('klage-standpunkt', 'Klage på eksamens- og standpunktkarakterer')).toBe(true);
    expect(passerTema('privatist', 'Meld deg opp til privatisteksamen')).toBe(true);
  });

  it('avviser en tittel om noe annet, og sider om at siden ikke finnes', () => {
    expect(passerTema('fagprove', 'Vurdering og klagerett - Agder fylkeskommune')).toBe(false);
    expect(passerTema('privatist', 'Karakter og klage')).toBe(false);
    expect(passerTema('eksamen', 'Fant ikke siden - eksamen')).toBe(false);
    expect(passerTema('inntak', '404 Not Found')).toBe(false);
    // «sok» skal treffe begynnelsen av et ord, ikke midt i et ord.
    expect(passerTema('inntak', 'Besøk oss')).toBe(false);
  });

  it('bekrefter bare 200 med passende tittel, og ikke en videresending til forsiden', () => {
    const side = (tittel: string) => `<title>${tittel}</title>`;
    expect(vurderLenke('https://a.no/x/', 'eksamen', { status: 200, til: null, html: side('Eksamen for elever'), melding: null })).toMatchObject({ ok: true });
    expect(vurderLenke('https://a.no/x/', 'eksamen', { status: 404, til: null, html: side('Eksamen'), melding: null })).toEqual({ ok: false, arsak: 'svarte 404' });
    expect(vurderLenke('https://a.no/x/', 'eksamen', { status: null, til: null, html: null, melding: 'tidsavbrudd' })).toEqual({ ok: false, arsak: 'svarer ikke (tidsavbrudd)' });
    expect(vurderLenke('https://a.no/x/', 'eksamen', { status: 200, til: 'https://a.no/', html: side('Eksamen'), melding: null })).toMatchObject({ ok: false });
    expect(vurderLenke('https://a.no/x/', 'eksamen', { status: 200, til: null, html: '<p>x</p>', melding: null })).toEqual({ ok: false, arsak: 'siden har ingen tittel' });
    // En videresending mellom variantene med og uten www er samme side.
    expect(vurderLenke('https://www.a.no/x/', 'eksamen', { status: 200, til: 'https://a.no/x/', html: side('Eksamen'), melding: null })).toMatchObject({ ok: true });
  });
});

describe('www eller ikke', () => {
  it('gir den andre varianten av vertsnavnet, begge veier, med sti og spørring', () => {
    expect(annenVariant('https://www.vestfoldfylke.no/no/meny/?a=1')).toBe('https://vestfoldfylke.no/no/meny/?a=1');
    expect(annenVariant('https://bfk.no/tjenester/')).toBe('https://www.bfk.no/tjenester/');
    expect(annenVariant('http://localhost:5173/x')).toBeNull();
    expect(annenVariant('https://127.0.0.1/x')).toBeNull();
    expect(annenVariant('mailto:a@b.no')).toBeNull();
  });

  it('regner en videresending mellom variantene som samme side, ikke som flytting', () => {
    expect(vurderSvar('https://www.bfk.no/x/', 200, 'https://bfk.no/x/')).toBe('ok');
    expect(vurderSvar('https://bfk.no/x', 200, 'https://www.bfk.no/x/')).toBe('ok');
    expect(vurderSvar('https://bfk.no/x/', 200, 'https://www.bfk.no/y/')).toBe('flyttet');
  });

  afterEach(() => vi.unstubAllGlobals());

  const nett = (svarer: (url: string) => boolean) =>
    vi.fn(async (url: string) => {
      if (!svarer(url)) throw new TypeError('fetch failed', { cause: Object.assign(new Error('getaddrinfo ENOTFOUND'), { code: 'ENOTFOUND' }) });
      return { status: 200, url, body: null } as unknown as Response;
    });

  it('lenkesjekken prøver den andre varianten når nettstedet ikke svarer, så en www-feil ikke gir falsk alarm', async () => {
    vi.stubGlobal('fetch', nett((u) => !u.startsWith('https://www.')));
    const r = await sjekkUrl('https://www.vestfoldfylke.no/x/');
    expect(r).toMatchObject({ svar: 'ok', status: 200, til: 'https://vestfoldfylke.no/x/' });
    expect(r.melding).toContain('Svarer bare som vestfoldfylke.no');
    vi.stubGlobal('fetch', nett((u) => u.startsWith('https://www.')));
    expect(await sjekkUrl('https://bfk.no/x/')).toMatchObject({ svar: 'ok', til: 'https://www.bfk.no/x/' });
  });

  it('virker begge variantene, brukes adressen som den er; virker ingen, er det feil som før', async () => {
    const begge = nett(() => true);
    vi.stubGlobal('fetch', begge);
    expect(await sjekkUrl('https://www.a.no/x/')).toMatchObject({ svar: 'ok', til: null, melding: null });
    expect(begge).toHaveBeenCalledTimes(1);
    vi.stubGlobal('fetch', nett(() => false));
    expect(await sjekkUrl('https://www.a.no/x/')).toMatchObject({ svar: 'feil', status: null });
  });
});

describe('lenker.yaml', () => {
  const yaml = [
    'fylker:',
    '  - fylke: "39"',
    '    navn: Vestfold fylkeskommune',
    '    lenker:',
    '      forside: { url: "https://www.vestfoldfylke.no/no/", bekreftet: null }',
    '      inntak: { url: "https://www.vestfoldfylke.no/no/inntak/", bekreftet: 2026-09-01 }',
    '  - fylke: "40"',
    '    navn: Telemark fylkeskommune',
    '    lenker:',
    '      inntak: { url: "https://www.telemarkfylke.no/inntak/", bekreftet: null }',
    '',
  ].join('\n');

  it('endrer bare datoen og eventuelt adressen for én lenke, linje for linje', () => {
    const ny = settFylkeslenke(yaml, '39', 'inntak', { bekreftet: '2026-10-09', url: 'https://vestfoldfylke.no/no/inntak/' }) ?? '';
    expect(ny.split('\n').length).toBe(yaml.split('\n').length);
    expect(ny).toContain('      inntak: { url: "https://vestfoldfylke.no/no/inntak/", bekreftet: 2026-10-09 }');
    expect(ny).toContain('      inntak: { url: "https://www.telemarkfylke.no/inntak/", bekreftet: null }');
    expect(settFylkeslenke(yaml, '40', 'inntak', { bekreftet: '2026-10-09' })).toContain('telemarkfylke.no/inntak/", bekreftet: 2026-10-09 }');
    expect(settFylkeslenke(yaml, '40', 'forside', { bekreftet: '2026-10-09' })).toBeNull();
    expect(settFylkeslenke(yaml, '99', 'inntak', { bekreftet: '2026-10-09' })).toBeNull();
  });

  it('sjekker lenker som er eldre enn fire uker, og melder dem som ikke er bekreftet på åtte uker', () => {
    const lenker = [
      { fylke: '1', navn: 'A', tema: 'inntak' as const, url: 'https://a.no/', bekreftet: null },
      { fylke: '1', navn: 'A', tema: 'eksamen' as const, url: 'https://a.no/e', bekreftet: '2026-10-01' },
      { fylke: '1', navn: 'A', tema: 'sprak' as const, url: 'https://a.no/s', bekreftet: '2026-08-20' },
    ];
    expect(skalSjekkes(lenker, '2026-10-09').map((l) => l.tema)).toEqual(['inntak', 'sprak']);
    expect(ikkeBekreftet(lenker, '2026-10-09').map((l) => l.tema)).toEqual(['inntak']);
    expect(ikkeBekreftet(lenker, '2026-12-01').map((l) => l.tema)).toEqual(['inntak', 'eksamen', 'sprak']);
  });

  it('den virkelige filen har formen skriptet kan endre, for hver lenke', async () => {
    const tekst = readFileSync(join(process.cwd(), 'content/fylker/lenker.yaml'), 'utf8');
    const { parse } = await import('yaml');
    for (const l of alleLenker(parse(tekst) as Fylkeslenker)) expect(settFylkeslenke(tekst, l.fylke, l.tema, { bekreftet: '2026-10-09' }), `${l.fylke} ${l.tema}`).not.toBeNull();
  });
});
