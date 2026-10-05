// Kommende endringer i lovene og forskriftene (scripts/lovdata/kommende.ts, fase 6, pakke 5): notatene i datasettene
// og kunngjøringene i Norsk Lovtidend avdeling I. Sidene fra Lovtidend er utdrag hentet 05.10.2026 (grenen
// utforsk-lovtidend). lti-ikraft.html og lti-lov.html er laget etter malen til en ekte side, se kommentaren i filene.
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  brukKunngjoringer,
  endringerFraNotater,
  erAktuell,
  kommendeSkjema,
  lesAvd1kunngjoring,
  lesDepartementer,
  lesLovtidendAvd1,
  lesNotat,
  lesNotaterFraXml,
  lovtittel,
  type Lovverkdokument,
  navnestamme,
  notaterIDokument,
  oppdaterKommende,
  tolkIkraft,
} from '../../scripts/lovdata/kommende.ts';
import { lesLovtidendside } from '../../scripts/lovdata/register.ts';
import { type Lovdokument, lovdokumentSkjema } from '../../src/modules/lov/skjema.ts';

const side = (navn: string) => readFileSync(`tests/fixtures/lovdata/${navn}.html`, 'utf8');
const dokument = (id: string): Lovdokument => lovdokumentSkjema.parse(JSON.parse(readFileSync(`data/lovdata/${id}.json`, 'utf8')));
const LOVVERK = ['opplaeringslova', 'opplaeringsforskrifta', 'forvaltningsloven', 'offentleglova', 'arkivlova', 'offentlegforskrifta', 'arkivforskrifta', 'helse-og-miljo', 'arbeidsmiljoloven'];
const lovverk: Lovverkdokument[] = LOVVERK.map(dokument).map((d) => ({ id: d.id, refid: d.refid, korttittel: d.korttittel, tittel: d.tittel, paragrafer: notaterIDokument(d) }));
const IDAG = '2026-10-05';

describe('notatene i datasettene', () => {
  it('lager tittelen på endringsloven og leser datoen for ikrafttredelse', () => {
    expect(lovtittel('lov/2026-06-12-22')).toBe('lov 12. juni 2026 nr. 22');
    expect(lovtittel('forskrift/2026-10-02-1990')).toBe('forskrift 2. oktober 2026 nr. 1990');
    expect(tolkIkraft('i kraft 1 juli 2028')).toBe('2028-07-01');
    expect(tolkIkraft('i kraft 1 jan 2026 iflg. res. 19 des 2025 nr. 2711')).toBe('2026-01-01');
    expect(tolkIkraft('01.10.2026')).toBe('2026-10-01');
    expect(tolkIkraft('01.10.2026, for 01.08.2026 – 31.07.2027')).toBe('2026-10-01');
    expect(tolkIkraft('i kraft frå den tid Kongen bestemmer')).toBeNull();
    expect(tolkIkraft('Byrådet bestemmer')).toBeNull();
  });

  it('tar bare med endringer som kommer, ikke dem som har skjedd', () => {
    const p66 = lovverk[0]?.paragrafer.find((p) => p.nr === '6-6');
    expect(p66?.endringer.flatMap((n) => lesNotat(n))).toEqual([{ refid: 'lov/2026-06-12-22', iKraft: '2028-07-01', iKraftTekst: 'i kraft 1 juli 2028' }]);
    expect(lesNotat(['Endres ved lover ', { t: '1 mars 2027 nr. 3', l: 'lov/2027-03-01-3' }, ' (i kraft 1 juli 2027), ', { t: '2 mars 2027 nr. 4', l: 'lov/2027-03-02-4' }, ' (i kraft fra den tid Kongen bestemmer).'])).toEqual([
      { refid: 'lov/2027-03-01-3', iKraft: '2027-07-01', iKraftTekst: 'i kraft 1 juli 2027' },
      { refid: 'lov/2027-03-02-4', iKraft: null, iKraftTekst: 'i kraft fra den tid Kongen bestemmer' },
    ]);
    expect(lesNotat(['Endra ved lov ', { t: '14 juni 2024 nr. 36', l: 'lov/2024-06-14-36' }, ' (i kraft 1 aug 2024).'])).toEqual([]);
  });

  it('finner endringene i opplæringslova, offentleglova og arbeidsmiljøloven, gruppert per endringslov', () => {
    const e = endringerFraNotater(lovverk, IDAG);
    expect(e.map((x) => [x.dokument, x.paragrafer, x.endretVed.tittel, x.iKraft])).toEqual([
      ['opplaeringslova', ['6-6'], 'lov 12. juni 2026 nr. 22', '2028-07-01'],
      ['offentleglova', ['2', '6', '7', '8', '30'], 'lov 19. juni 2026 nr. 36', null],
      ['arbeidsmiljoloven', ['14-2'], 'lov 19. juni 2026 nr. 48', null],
    ]);
    expect(e[0]?.kunngjoring).toBe('https://lovdata.no/dokument/LTI/lov/2026-06-12-22');
    // Etter datoen er endringen ikke kommende lenger.
    expect(endringerFraNotater(lovverk, '2028-07-01').map((x) => x.dokument)).not.toContain('opplaeringslova');
  });

  it('leser notatene i hele dokumentet fra datasettet, og departementet', () => {
    const xml = side('lov').replace('Endra ved lov', 'Vert endra ved lov');
    const notater = lesNotaterFraXml(xml);
    expect(notater.length).toBeGreaterThan(0);
    expect(notater.flatMap((p) => p.endringer.flatMap((n) => lesNotat(n))).map((x) => x.refid)).toContain('lov/2024-06-14-36');
    expect(lesDepartementer('<header class="documentHeader"><dl><dd class="ministry"><ul><li>Kunnskapsdepartementet</li></ul></dd></dl></header>')).toEqual(['Kunnskapsdepartementet']);
    expect(lesDepartementer(side('lov'))).toEqual([]);
  });

  it('den lagrede filen følger skjemaet og har endringene i notatene i data/lovdata', () => {
    // Hentingen i Actions leser også notatene utenfor utvalget av kapitler og Lovtidend, så filen kan ha flere.
    const lagret = kommendeSkjema.parse(JSON.parse(readFileSync('data/lovdata/kommende.json', 'utf8')));
    const ider = new Set(lagret.endringer.map((e) => e.id));
    expect(endringerFraNotater(lovverk, lagret.lest).filter((e) => !ider.has(e.id))).toEqual([]);
    expect(lagret.endringer.every((e) => LOVVERK.includes(e.dokument))).toBe(true);
  });
});

describe('Lovtidend avdeling I', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('leser lover og forskrifter i listen, med departementet', () => {
    const s = lesLovtidendside(side('lovtidend-avd1'));
    expect(s.treff).toContainEqual({ refid: 'lov/2026-10-02-60', avdeling: 'LTI', tittel: 'Lov om endringar i opplæringslova (skoleruta)', departement: 'Kunnskapsdepartementet' });
    expect(s.treff.find((k) => k.refid === 'forskrift/2026-09-03-1972')).toEqual({ refid: 'forskrift/2026-09-03-1972', avdeling: 'LTII', tittel: 'Ikrafttredelse av forskrift 10. juni 2026 nr. 1971 om endring i forskrift om kommunale bostøtter, Oslo kommune, Oslo' });
  });

  it('velger kunngjøringene fra departementene, med et dokument i tittelen eller med en endringslov som venter', () => {
    const s = lesLovtidendside(side('lovtidend-avd1'));
    const navn = lovverk.map((d) => navnestamme(d.korttittel));
    expect(navn).toContain('opplæringslov');
    const aktuelle = (dep: string[], venter: string[]) => s.treff.filter((k) => erAktuell(k, new Set(dep), navn, venter)).map((k) => k.refid);
    // Uten departementer: bare titlene. «… endringar i offentleglova» og «… opplæringslova» treffer.
    expect(aktuelle([], [])).toEqual(['forskrift/2026-10-02-1990', 'lov/2026-10-02-60']);
    expect(aktuelle(['Kultur- og likestillingsdepartementet', 'Landbruks- og matdepartementet'], [])).toEqual(['forskrift/2026-10-02-1990', 'lov/2026-10-02-60', 'forskrift/2026-10-02-1980', 'forskrift/2026-09-29-1974']);
    expect(s.treff.filter((k) => erAktuell(k, new Set(), [], ['lov/2026-06-19-36'])).map((k) => k.refid)).toEqual(['forskrift/2026-10-02-1990']);
  });

  it('en ikrafttredelse gir datoen til endringen som venter, og en ny endringslov blir en ny endring', () => {
    const fraNotater = endringerFraNotater(lovverk, IDAG);
    const ikraft = lesAvd1kunngjoring(side('lti-ikraft'), { refid: 'forskrift/2026-10-02-1990', tittel: '' });
    expect(ikraft).toEqual({ refid: 'forskrift/2026-10-02-1990', tittel: 'Ikrafttredelse av lov 19. juni 2026 nr. 36 om endringar i offentleglova', endrer: ['lov/2006-05-19-16', 'lov/2026-06-19-36'], iKraftTekst: '01.01.2027' });
    const lov = lesAvd1kunngjoring(side('lti-lov'), { refid: 'lov/2026-10-02-60', tittel: '' });
    const r = brukKunngjoringer(fraNotater, [ikraft, lov], lovverk);
    const off = r.endringer.find((e) => e.dokument === 'offentleglova');
    expect(off).toMatchObject({ iKraft: '2027-01-01', iKraftTekst: '01.01.2027', kunngjoring: 'https://lovdata.no/dokument/LTI/forskrift/2026-10-02-1990', kilde: 'datasett', paragrafer: ['2', '6', '7', '8', '30'] });
    // Ikrafttredelsen endrer også offentleglova selv, men blir ikke en egen endring.
    expect(r.endringer.filter((e) => e.dokument === 'offentleglova')).toHaveLength(1);
    expect(r.endringer.find((e) => e.endretVed.refid === 'lov/2026-10-02-60')).toEqual({
      id: 'opplaeringslova-lov-2026-10-02-60',
      dokument: 'opplaeringslova',
      paragrafer: [],
      endretVed: { refid: 'lov/2026-10-02-60', tittel: 'lov 2. oktober 2026 nr. 60' },
      iKraft: null,
      iKraftTekst: 'Kongen bestemmer',
      kunngjoring: 'https://lovdata.no/dokument/LTI/lov/2026-10-02-60',
      kilde: 'lovtidend',
    });
    expect(r.rapport.map((l) => l.dokument)).toEqual(['offentleglova', 'opplaeringslova']);
  });

  it('paragrafer i «Endrer» blir med, og en ikrafttredelse uten endringen fra før blir en ny endring', () => {
    const r = brukKunngjoringer([], [{ refid: 'forskrift/2027-01-10-5', tittel: 'Ikrafttredelse av lov 2. oktober 2026 nr. 60', endrer: ['lov/2023-06-09-30/§14-1', 'lov/2026-10-02-60'], iKraftTekst: '01.08.2027' }], lovverk);
    expect(r.endringer).toEqual([
      expect.objectContaining({ dokument: 'opplaeringslova', paragrafer: ['14-1'], endretVed: { refid: 'lov/2026-10-02-60', tittel: 'lov 2. oktober 2026 nr. 60' }, iKraft: '2027-08-01', kilde: 'lovtidend' }),
    ]);
  });

  it('beholder datoen fra Lovtidend til datasettet har den, beholder endringene fra Lovtidend og fjerner dem som gjelder', () => {
    const forste = oppdaterKommende(null, endringerFraNotater(lovverk, IDAG), [lesAvd1kunngjoring(side('lti-ikraft'), { refid: 'forskrift/2026-10-02-1990', tittel: '' }), lesAvd1kunngjoring(side('lti-lov'), { refid: 'lov/2026-10-02-60', tittel: '' })], lovverk, { idag: IDAG, lovtidendAvd1: '2026-10-02T15:00' });
    expect(forste.kommende.endringer.map((e) => [e.dokument, e.iKraft])).toEqual([
      ['offentleglova', '2027-01-01'],
      ['opplaeringslova', '2028-07-01'],
      ['arbeidsmiljoloven', null],
      ['opplaeringslova', null],
    ]);
    // Uken etter: datasettet sier fortsatt «Kongen bestemmer», og Lovtidend har ikke noe nytt.
    const andre = oppdaterKommende(forste.kommende, endringerFraNotater(lovverk, '2026-10-12'), [], lovverk, { idag: '2026-10-12', lovtidendAvd1: '2026-10-09T15:00' });
    expect(andre.kommende.endringer).toEqual(forste.kommende.endringer);
    expect(andre.rapport).toEqual([]);
    // Etter 1. januar 2027 er endringen i offentleglova borte.
    const senere = oppdaterKommende(andre.kommende, endringerFraNotater(lovverk, '2027-01-02'), [], lovverk, { idag: '2027-01-02', lovtidendAvd1: null });
    expect(senere.kommende.endringer.map((e) => e.dokument)).not.toContain('offentleglova');
    expect(senere.rapport.map((l) => l.tekst)).toContain('Borte: offentleglova endret ved lov 19. juni 2026 nr. 36 (gjelder fra 2027-01-01).');
  });

  it('leser tidspunktene etter forrige gang, og bare sidene til de aktuelle kunngjøringene', async () => {
    const hentet: string[] = [];
    vi.stubGlobal('fetch', async (url: string) => {
      const u = decodeURIComponent(url);
      hentet.push(u);
      const html = u.endsWith('avdeling=LTI')
        ? side('lovtidend-avd1')
        : u.includes('kunngjortDato=02.10.2026 kl. 15.00')
          ? side('lovtidend-avd1')
          : u.endsWith('/dokument/LTI/forskrift/2026-10-02-1990')
            ? side('lti-ikraft')
            : u.endsWith('/dokument/LTI/lov/2026-10-02-60')
              ? side('lti-lov')
              : null;
      return html === null ? new Response('', { status: 404 }) : new Response(html, { status: 200 });
    });
    const r = await lesLovtidendAvd1('2026-10-02T14:50', { departementer: new Set(['Kunnskapsdepartementet']), navn: ['offentleglov'], venter: [], idag: IDAG, pauseMs: 0 });
    expect(hentet.filter((u) => u.includes('kunngjortDato='))).toEqual(['https://lovdata.no/register/lovtidend?avdeling=LTI&kunngjortDato=02.10.2026 kl. 15.00']);
    expect(hentet.filter((u) => u.includes('/dokument/'))).toEqual(['https://lovdata.no/dokument/LTI/forskrift/2026-10-02-1990', 'https://lovdata.no/dokument/LTI/lov/2026-10-02-60']);
    expect(r.nyeste).toBe('2026-10-02T15:00');
    expect(r.kunngjoringer.map((k) => k.iKraftTekst)).toEqual(['01.01.2027', 'Kongen bestemmer']);
    expect(r.rapport).toEqual([]);
  });
});
