// Inntaksdatoene (fase 6, pakke 5): ukene og årene, lesingen av fylkenes sider med korte utdrag av teksten, og
// samlingen per fylke og inntaksår (eier 05.10.2026: fylkets egne datoer, ingen regel om to fylker).
import { describe, expect, it } from 'vitest';
import { inntaksdatoerSkjema } from '../../src/modules/inntak/datoer-skjema.ts';
import { behold, sorter } from '../../scripts/hent-inntak.ts';
import { INNTAKSKILDER } from '../../scripts/inntak/kilder.ts';
import { lesManedsdel, periodeForManedsdel, aarFraUkedag, finnAar, fredagIUke, type Inntakskilde, lesInntakskilde, lesUker, mandagIUke, samleInntak, sammenlignInntak, utdrag } from '../../scripts/inntak/les.ts';
import data from '../../data/inntak/datoer.json';

const kilde = (id: string): Inntakskilde => {
  const k = INNTAKSKILDER.find((x) => x.id === id);
  if (!k) throw new Error(`Fant ikke kilden ${id}`);
  return k;
};
const les = (id: string, tekst: string) => lesInntakskilde(kilde(id), tekst, '2026-10-05');
const felt = (id: string, tekst: string) => Object.fromEntries(les(id, tekst).kandidater.map((k) => [`${k.aar} ${k.felt}`, k.verdi]));

describe('uker og år', () => {
  it('gir mandagen i den første uken og fredagen i den siste', () => {
    expect(mandagIUke(2026, 28)).toBe('2026-07-06');
    expect(fredagIUke(2026, 29)).toBe('2026-07-17');
    expect(mandagIUke(2027, 1)).toBe('2027-01-04');
    // 2026 begynner på en torsdag, så uke 1 begynner 29. desember 2025.
    expect(mandagIUke(2026, 1)).toBe('2025-12-29');
  });

  it('leser uker på bokmål og nynorsk', () => {
    expect(lesUker('Uke 28/29 i juli')).toEqual({ fra: 28, til: 29 });
    expect(lesUker('veke 28–29')).toEqual({ fra: 28, til: 29 });
    expect(lesUker('Uke 32 Skolene overtar')).toEqual({ fra: 32, til: 32 });
    expect(lesUker('ingen uke her')).toBeNull();
  });

  it('finner året fra ukedagen til en dato, og gjetter ikke når flere år passer', () => {
    expect(aarFraUkedag('Mandag', { dag: 2, maned: 2, aar: null, kl: null }, 2026)).toBe(2026);
    expect(aarFraUkedag('tirsdag', { dag: 2, maned: 2, aar: null, kl: null }, 2026)).toBe(2027);
    expect(aarFraUkedag('fredag', { dag: 2, maned: 2, aar: null, kl: null }, 2026)).toBeNull();
    expect(finnAar({ aar: [/Inntakskalender (?<aar>\d{4})/] }, 'Inntakskalender 2027', '2026-10-05')).toBe(2027);
    expect(finnAar({ aar: [/Inntakskalender (?<aar>\d{4})/] }, 'Inntakskalender', '2026-10-05')).toBeNull();
  });

  it('utdraget er setningen med datoen', () => {
    const tekst = 'Søke skoleplass\nI 2027 har vi hovedinntak 7. juli og sisteinntak 5. august. Etter inntakene er svarfristen 2 uker. Mer tekst.';
    expect(utdrag(tekst, tekst.indexOf('svarfristen'))).toBe('Etter inntakene er svarfristen 2 uker.');
    expect(utdrag('Uke 28/29 i juli\nSøkere får svar. Mer.', 0, true)).toBe('Uke 28/29 i juli Søkere får svar.');
  });
});

describe('fylkenes sider', () => {
  it('Trøndelag: eksakte svarfrister og omtrentlige inntak', () => {
    const f = felt('trondelag-inntak-sporsmal', 'Dato for inntak skoleåret 2026/2027:\nFortrinnsinntak ca. 1. april - svarfrist 23. april\nFørste inntak ca. 8. juli - svarfrist 15. juli\nAndre inntak ca. 5.august - svarfrist 10. august\nTredje inntak ca. 13. august - svarfrist 16. august');
    expect(f['2026 forste-inntak']).toEqual({ fra: '2026-07-08', omtrent: true, forbehold: 'ca', tekst: 'Første inntak ca. 8. juli - svarfrist 15. juli' });
    expect(f['2026 svarfrist-forste']).toEqual({ fra: '2026-07-15', tekst: 'Første inntak ca. 8. juli - svarfrist 15. juli' });
    expect(f['2026 andre-inntak']?.fra).toBe('2026-08-05');
    expect(f['2026 svarfrist-tredje']?.fra).toBe('2026-08-16');
    expect(f['2026 fortrinnsinntak']).toMatchObject({ fra: '2026-04-01', omtrent: true });
  });

  it('Trøndelag: siden om første inntak, med året fra skoleruta', () => {
    const f = felt('trondelag-inntak-forste', 'Første skoledag er mandag 17. august. Se skolerute 2026/2027.\n1. inntak: ca. 8. juli\nSvarfrist: 15. juli\n2. inntak: ca. 5. august\nSvarfrist: 10. august\n3. inntak: ca. 13. august\nSvarfrist: 16. august');
    expect(f['2026 svarfrist-forste']).toEqual({ fra: '2026-07-15', tekst: 'Svarfrist: 15. juli' });
    expect(f['2026 tredje-inntak']).toMatchObject({ fra: '2026-08-13', omtrent: true });
  });

  it('Telemark: setningen for året som er gått, og boksen for neste inntak', () => {
    const tekst = 'Vigo.no åpner for søking onsdag 6. januar 2027 og søknadsfristen er 1. mars.\nHovedinntak: 7. juli, kl. 08.00\nSisteinntak: 4. august, kl. 08.00\nI 2026 har vi hovedinntak 8. juli og sisteinntak 5. august og du må logge inn på vigo.no for å se ditt resultat. Etter inntakene er svarfristen ca. 1 uke.';
    const f = felt('telemark-inntak', tekst);
    expect(f['2026 forste-inntak']?.fra).toBe('2026-07-08');
    expect(f['2026 andre-inntak']?.fra).toBe('2026-08-05');
    expect(f['2026 svarfrist-forste']).toEqual({ relativ: 'ca. 1 uke etter inntaket', tekst: 'Etter inntakene er svarfristen ca. 1 uke.' });
    expect(f['2027 forste-inntak']).toEqual({ fra: '2027-07-07', tekst: 'Hovedinntak: 7. juli, kl. 08.00' });
    expect(f['2027 andre-inntak']?.fra).toBe('2027-08-04');
    // Uten boksen mangler ingenting, fordi boksen ikke alltid står der.
    expect(les('telemark-inntak', tekst.split('\n')[3] as string).mangler).toEqual([]);
  });

  it('Vestfold: hovedinntak, sisteinntak og svarfrist i to uker', () => {
    const f = felt('vestfold-inntak', 'I 2027 har vi hovedinntak 7. juli og sisteinntak 5. august og du må logge inn på vigo.no for å se ditt resultat. Etter inntakene er svarfristen 2 uker.');
    expect(f['2027 forste-inntak']?.fra).toBe('2027-07-07');
    expect(f['2027 andre-inntak']?.fra).toBe('2027-08-05');
    expect(f['2027 svarfrist-andre']?.relativ).toBe('2 uker etter inntaket');
  });

  it('Akershus: «senest» er omtrentlig, og året kommer fra ukedagen til søknadsfristen', () => {
    const f = felt('akershus-inntak', 'Mandag 2. februar er frist for lærekandidater\nSenest 10. juli er førsteinntaket klart.\nSenest 25. juli er andreinntaket klart.');
    expect(f['2026 forste-inntak']).toEqual({ fra: '2026-07-10', omtrent: true, forbehold: 'senest', tekst: 'Senest 10. juli er førsteinntaket klart.' });
    expect(f['2026 andre-inntak']?.fra).toBe('2026-07-25');
  });

  it('Agder: hovedinntaket, svarfristen med år og suppleringsinntaket', () => {
    const f = felt(
      'agder-inntak',
      'Fordeling av skoleplassene, kalt hovedinntaket, gjennomføres senest 10. juli. Når inntaket er gjennomført får du sms.\nFrist for å takke ja/takke nei til skoleplass/venteplass er 26. juli 2026.\nDet er ingen endring på listene mellom hovedinntaket (senest 10. juli) og suppleringsinntaket (senest 8. august).',
    );
    expect(f['2026 forste-inntak']).toMatchObject({ fra: '2026-07-10', omtrent: true, tekst: 'Fordeling av skoleplassene, kalt hovedinntaket, gjennomføres senest 10. juli.' });
    expect(f['2026 svarfrist-forste']).toMatchObject({ fra: '2026-07-26' });
    expect(f['2026 andre-inntak']).toMatchObject({ fra: '2026-08-08', omtrent: true });
  });

  it('Troms: uker fra inntakskalenderen, med svarfristen i dager', () => {
    const tekst = [
      'Inntakskalender 2026',
      'Uke 28/29 i juli',
      'Søkere med ungdomsrett får svar på søknaden i vigo.no. De som har registrert mobilnummer får SMS.',
      'Uke 29/30 i juli',
      'Siste frist for å svare på tilbud om skoleplass eller ventelisteplass er 5 dager etter at 1. inntak er klart. Husk mobilnummer.',
      'Uke 30/31 i juli',
      'Søkere på venteliste, søkere med voksenrett, og gjesteelever får svar på søknaden i vigo.no.',
      'Uke 31/32 i juli',
      'Siste frist for å svare på tilbud om skoleplass eller ventelisteplass er 5 dager etter at 2. inntak er klart.',
      'Uke 32/33 i august',
      'Skolene overtar inntaket. Alle endringer administreres av skolene.',
    ].join('\n');
    const f = felt('troms-inntak', tekst);
    expect(f['2026 forste-inntak']).toEqual({ fra: '2026-07-06', til: '2026-07-17', uke: '28–29', tekst: 'Uke 28/29 i juli Søkere med ungdomsrett får svar på søknaden i vigo.no.' });
    expect(f['2026 svarfrist-forste']).toMatchObject({ fra: '2026-07-13', til: '2026-07-24', uke: '29–30', relativ: '5 dager etter at 1. inntak er klart' });
    expect(f['2026 andre-inntak']?.uke).toBe('30–31');
    expect(f['2026 svarfrist-andre']?.relativ).toBe('5 dager etter at 2. inntak er klart');
    expect(f['2026 skolene-overtar']).toMatchObject({ fra: '2026-08-03', til: '2026-08-14', uke: '32–33' });
  });

  it('Finnmark: uker, og én uke når skolene overtar', () => {
    const tekst = [
      'Vigo åpner for innsøking mandag 5. januar 2026.',
      'Uke 27/28 Søkere med opplæringsrett for ungdom får svar på søknaden i Vigo.',
      'Uke 28/29 Siste frist for å svare på første inntak er 5 virkedager etter mottatt tilbud.',
      'Uke 29/30 Søkere på venteliste og øvrige søkere får svar på søknaden i Vigo.',
      'Uke 30/31 Siste frist for å svare på andre inntak er 5 virkedager etter mottatt tilbud.',
      'Uke 32 Skolene overtar inntaks- og ventelistene.',
    ].join('\n');
    const f = felt('finnmark-inntak', tekst);
    expect(f['2026 forste-inntak']).toMatchObject({ fra: '2026-06-29', til: '2026-07-10', uke: '27–28' });
    expect(f['2026 svarfrist-andre']?.relativ).toBe('5 virkedager etter mottatt tilbud');
    expect(f['2026 skolene-overtar']).toEqual({ fra: '2026-08-03', til: '2026-08-07', uke: '32', tekst: 'Uke 32 Skolene overtar inntaks- og ventelistene.' });
  });

  it('melder mønstre som ikke finner noe, og sider uten årstall, i stedet for å gjette', () => {
    expect(les('akershus-inntak', 'Ingen datoer her').mangler).toEqual(['forste-inntak', 'andre-inntak']);
    expect(les('akershus-inntak', 'Senest 10. juli er førsteinntaket klart.\nSenest 25. juli er andreinntaket klart.').mangler).toEqual([
      'forste-inntak (fant ikke inntaksåret på siden)',
      'andre-inntak (fant ikke inntaksåret på siden)',
    ]);
  });
});

describe('samlingen', () => {
  const k = (kilde: string, fra: string) => ({ kilde, fylke: '50', aar: '2026', felt: 'forste-inntak' as const, verdi: { fra, tekst: `ca. ${fra}` } });

  it('to sider med samme dato gir én dato med begge kildene', () => {
    const s = samleInntak([k('a', '2026-07-08'), k('b', '2026-07-08')]);
    expect(s.fylker['50']?.['2026']?.['forste-inntak']).toEqual({ fra: '2026-07-08', tekst: 'ca. 2026-07-08', kilder: ['a', 'b'] });
    expect(s.uenige).toEqual([]);
  });

  it('sider i samme fylke som er uenige, gir kontrollsak, og den første datoen blir stående', () => {
    const s = samleInntak([k('a', '2026-07-08'), k('b', '2026-07-09')]);
    expect(s.fylker['50']?.['2026']?.['forste-inntak']?.fra).toBe('2026-07-08');
    expect(s.uenige).toEqual(['Fylke 50, 2026, forste-inntak: 2026-07-08 (a) mot 2026-07-09 (b)']);
  });

  it('endringene sammenlignes dato for dato', () => {
    const a = samleInntak([k('a', '2026-07-08')]).fylker;
    const b = samleInntak([k('a', '2026-07-09')]).fylker;
    expect(sammenlignInntak(a, b)).toEqual(['fylke 50 2026 forste-inntak: 2026-07-08 → 2026-07-09']);
    expect(sammenlignInntak(null, b)).toEqual([]);
  });

  it('datoene fra en side som ikke kunne hentes, beholdes fra forrige fil', () => {
    const forrige = samleInntak([k('a', '2026-07-08'), { ...k('b', '2026-08-05'), felt: 'andre-inntak' }]).fylker;
    const ny = samleInntak([k('a', '2026-07-08')]).fylker;
    expect(behold(ny, forrige, new Set(['b']))).toEqual(['b']);
    expect(ny['50']?.['2026']?.['andre-inntak']?.fra).toBe('2026-08-05');
  });

  it('feltene står i fast rekkefølge', () => {
    const s = samleInntak([{ ...k('a', '2026-08-05'), felt: 'andre-inntak' }, k('a', '2026-07-08')]).fylker;
    expect(Object.keys(sorter(s)['50']?.['2026'] ?? {})).toEqual(['forste-inntak', 'andre-inntak']);
  });
});

describe('kildene og datafilen', () => {
  it('kildene har unike id-er og gyldige fylker', () => {
    expect(new Set(INNTAKSKILDER.map((k) => k.id)).size).toBe(INNTAKSKILDER.length);
    for (const k of INNTAKSKILDER) expect(/^\d{2}$/.test(k.fylke), k.id).toBe(true);
  });

  it('datafilen følger skjemaet, og kildene i den finnes', () => {
    const d = inntaksdatoerSkjema.parse(data);
    for (const aarene of Object.values(d.fylker))
      for (const felter of Object.values(aarene)) for (const v of Object.values(felter)) for (const id of v?.kilder ?? []) expect(d.kilder[id], id).toBeDefined();
  });
});

describe('delene av måneden (eier 05.10.2026)', () => {
  it('begynnelsen, midten og slutten av en måned blir perioder', () => {
    expect(lesManedsdel('Svar kommer i begynnelsen av juli')).toEqual({ del: 'begynnelsen', maned: 7 });
    expect(lesManedsdel('i starten av juli')).toEqual({ del: 'begynnelsen', maned: 7 });
    expect(lesManedsdel('i slutten av juli')).toEqual({ del: 'slutten', maned: 7 });
    expect(lesManedsdel('8. juli')).toBeNull();
    expect(periodeForManedsdel(2027, 7, 'begynnelsen')).toEqual({ fra: '2027-07-01', til: '2027-07-14' });
    expect(periodeForManedsdel(2027, 7, 'midten')).toEqual({ fra: '2027-07-12', til: '2027-07-16' });
    expect(periodeForManedsdel(2027, 7, 'slutten')).toEqual({ fra: '2027-07-18', til: '2027-07-31' });
  });
});

describe('sider uten årstall (eier 05.10.2026)', () => {
  const vaar = (id: string, tekst: string) =>
    Object.fromEntries(
      lesInntakskilde(kilde(id), tekst, '2027-03-01').kandidater.map((k) => {
        const v: Partial<typeof k.verdi> = { ...k.verdi };
        delete v.tekst;
        return [`${k.aar} ${k.felt}`, v];
      }),
    );

  it('fra januar til august gjelder datoene inntaket samme år, og året er merket som antatt', () => {
    expect(vaar('ostfold-inntak', 'Cirka 6. juli er første inntak klart.\nCirka 4. august er andre inntak klart.')).toEqual({
      '2027 forste-inntak': { fra: '2027-07-06', omtrent: true, forbehold: 'ca', aarAntatt: true },
      '2027 andre-inntak': { fra: '2027-08-04', omtrent: true, forbehold: 'ca', aarAntatt: true },
    });
    expect(vaar('buskerud-inntak', 'Senest 6. juli er førsteinntaket klart. Andreinntaket er klart i begynnelsen av august.')).toEqual({
      '2027 forste-inntak': { fra: '2027-07-06', omtrent: true, forbehold: 'senest', aarAntatt: true },
      '2027 andre-inntak': { fra: '2027-08-01', til: '2027-08-14', omtrent: true, forbehold: 'begynnelsen', aarAntatt: true },
    });
    expect(
      vaar('rogaland-inntak', '1. inntak til skoleplass vil være klart i begynnelsen av juli, mens 2. inntak vil være klart i midten av juli. Søkerne i Rogaland har en svarfrist på 6 dager.'),
    ).toEqual({
      '2027 forste-inntak': { fra: '2027-07-01', til: '2027-07-14', omtrent: true, forbehold: 'begynnelsen', aarAntatt: true },
      '2027 andre-inntak': { fra: '2027-07-12', til: '2027-07-16', omtrent: true, forbehold: 'midten', aarAntatt: true },
      '2027 svarfrist-forste': { relativ: '6 dager etter inntaket', aarAntatt: true },
      '2027 svarfrist-andre': { relativ: '6 dager etter inntaket', aarAntatt: true },
    });
    expect(vaar('more-og-romsdal-inntak', 'Inntaket skjer i to omgangar. Det første i starten av juli, det andre i slutten av juli.')).toEqual({
      '2027 forste-inntak': { fra: '2027-07-01', til: '2027-07-14', omtrent: true, forbehold: 'begynnelsen', aarAntatt: true },
      '2027 andre-inntak': { fra: '2027-07-18', til: '2027-07-31', omtrent: true, forbehold: 'slutten', aarAntatt: true },
    });
  });

  it('fra september til desember tas siden ikke med, og ingenting meldes som manglende', () => {
    expect(les('ostfold-inntak', 'Cirka 6. juli er første inntak klart.')).toEqual({ kandidater: [], mangler: [] });
  });

  it('i august gjelder datoene fortsatt inntaket samme år', () => {
    const r = lesInntakskilde(kilde('ostfold-inntak'), 'Cirka 4. august er andre inntak klart.', '2027-08-31');
    expect(r.kandidater.map((k) => [k.aar, k.verdi.fra])).toEqual([['2027', '2027-08-04']]);
    expect(r.mangler).toEqual(['forste-inntak']);
  });
});
