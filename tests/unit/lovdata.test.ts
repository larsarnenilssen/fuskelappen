// Lov og forskrift (fase 3, avgjørelse 039): leseren for Lovdatas datasett, utvalget og dataene i appen.
// Leseren testes mot et lite utdrag med samme struktur som filene hos Lovdata (tests/fixtures/lovdata/lov.html).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { datasettnavn, lesLovdokument, tolkOverskrift } from '../../scripts/lovdata/les.ts';
import { lesFil } from '../../scripts/innhold/last.ts';
import { kapittelliste, lovdokumentSkjema, lovoversiktSkjema, lovutvalgSkjema } from '../../src/modules/lov/skjema.ts';
import { alleParagrafer, alleSeksjoner, rentekst } from '../../src/modules/lov/typer.ts';
import { kilderegisterSkjema } from '../../src/core/innhold/skjema.ts';
import { lokalForskrift } from '../../scripts/hent-lovdata.ts';

const rot = join(__dirname, '../..');
const html = readFileSync(join(rot, 'tests/fixtures/lovdata/lov.html'), 'utf8');
const oppsett = { id: 'provelova', kilde: 'opplaeringslova', gyldighet: { niva: 'nasjonal' as const }, hentet: '2026-10-02' };

describe('leseren for Lovdata', () => {
  const d = lesLovdokument(html, { ...oppsett, kapitler: ['1', '16'] });
  const paragrafer = alleParagrafer(d.seksjoner);
  const p = (nr: string) => paragrafer.find((x) => x.paragraf.nr === nr)?.paragraf;

  it('leser tittel, korttittel, målform, dato og adresse hos Lovdata', () => {
    expect(d.tittel).toBe('Lov om prøve (prøvelova)');
    expect(d.korttittel).toBe('Prøvelova');
    expect(d.malform).toBe('nn');
    expect(d.type).toBe('lov');
    expect(d.refid).toBe('lov/2023-06-09-30');
    expect(d.sistEndret).toBe('2026-08-01');
    expect(lovdokumentSkjema.parse(d)).toEqual(d);
  });

  it('tar med kapitlene i utvalget og delene rundt dem, og hopper over resten uten å lese det', () => {
    // Kapittel 2 har en tabell, og vedlegget har tekst rett i seksjonen. Ingen av dem er med i utvalget.
    expect(d.seksjoner.map((s) => s.overskrift)).toEqual(['Første del – innleiande reglar', 'Tredje del – vidaregåande opplæring']);
    expect(alleSeksjoner(d.seksjoner).map((s) => `${s.type}:${s.nr ?? ''}`)).toEqual(['del:', 'kapittel:1', 'del:', 'kapittel:16', 'avsnitt:']);
    expect(paragrafer.map((x) => x.paragraf.visNr)).toEqual(['§ 1-1', '§ 1-2', '§ 16-1', '§ 16-2']);
  });

  it('leser ledd, lister, tekst etter listen, lenker og endringer', () => {
    const p2 = p('1-2');
    expect(p2?.tittel).toBe('Verkeområde');
    expect(p2?.ledd[0]?.tekst).toEqual(['Lova gjeld ikkje for skolar som er godkjende etter ', { t: 'privatskolelova', l: 'lov/2003-07-04-84' }, '.']);
    expect(p2?.ledd[1]?.liste?.map((x) => [x.merke, rentekst(x.ledd[0]?.tekst ?? [])])).toEqual([
      ['a.', 'eigarforhold'],
      ['b.', 'kven som er opptaksmyndigheit'],
    ]);
    expect(p2?.ledd[1]?.etter).toEqual([[{ t: '§ 1-1', l: 'lov/2023-06-09-30/§1-1' }, ' gjeld likevel.']]);
    expect(p2?.endringer).toEqual([['Endra ved lov ', { t: '14 juni 2024 nr. 36', l: 'lov/2024-06-14-36' }, '.']]);
  });

  it('leser fotnoter, merknader under kapitteloverskriften og opphevede paragrafer', () => {
    expect(p('16-1')?.ledd[0]?.tekst).toEqual(['Lova gjeld frå den tida', { f: '1' }, ' Kongen fastset.']);
    expect(rentekst(p('16-1')?.fotnoter[0]?.tekst ?? [])).toBe('Frå 1. august 2024 iflg. res. 31 mai 2024 nr. 1028.');
    expect(alleSeksjoner(d.seksjoner).find((s) => s.nr === '16')?.merknader).toEqual([['(', { t: 'opplæringslova § 1-4', l: 'lov/2023-06-09-30/§1-4' }, ')']]);
    // Parentesen rundt tittelen fjernes i visningen (eier 02.10.2026).
    expect(p('16-2')).toMatchObject({ tittel: 'Oppheva', ledd: [] });
  });

  it('stopper når et kapittel i utvalget mangler', () => {
    expect(() => lesLovdokument(html, { ...oppsett, kapitler: ['1', '99'] })).toThrow(/fant ikke kapittel 99/);
  });

  it('stopper når teksten har noe appen ikke leser, så ingen tekst forsvinner', () => {
    expect(() => lesLovdokument(html, { ...oppsett, kapitler: ['2'] })).toThrow(/innhold appen ikke leser: table i § 2-1/);
    expect(() => lesLovdokument(html, { ...oppsett, kapitler: null })).toThrow(/innhold appen ikke leser/);
  });

  it('tolker kapitteloverskrifter', () => {
    expect(tolkOverskrift('kap16', 'Kapittel 16 Rådgiving')).toEqual({ type: 'kapittel', nr: '16' });
    expect(tolkOverskrift('kapIV', 'Kapittel IV. Om saksforberedelse')).toEqual({ type: 'kapittel', nr: 'IV' });
    expect(tolkOverskrift('kap5a', 'Kapittel 5 A. Særlege reglar')).toEqual({ type: 'kapittel', nr: '5A' });
    expect(tolkOverskrift('del3', 'Tredje del – vidaregåande opplæring')).toEqual({ type: 'del', nr: null });
    expect(tolkOverskrift('kapI', 'I. Fellesreglar')).toEqual({ type: 'avsnitt', nr: null });
  });

  it('finner filnavnet i datasettet fra adressen hos Lovdata', () => {
    expect(datasettnavn('https://lovdata.no/lov/2023-06-09-30')).toBe('nl-20230609-030');
    expect(datasettnavn('https://lovdata.no/lov/1967-02-10')).toBe('nl-19670210-000');
    expect(datasettnavn('https://lovdata.no/forskrift/2024-06-03-900')).toBe('sf-20240603-0900');
    expect(() => datasettnavn('https://www.udir.no/')).toThrow();
  });
});

describe('utvalget i content/lovverk.yaml', () => {
  const utvalg = lovutvalgSkjema.parse(lesFil(rot, join(rot, 'content/lovverk.yaml')));
  const register = kilderegisterSkjema.parse(lesFil(rot, join(rot, 'content/kilder.yaml')));

  it('skriver ut spenn av kapitler', () => {
    expect(kapittelliste(['1', '5-7', 'IV'])).toEqual(['1', '5', '6', '7', 'IV']);
    expect(() => kapittelliste(['7-5'])).toThrow();
  });

  it('har eiers utvalg av kapitler i opplæringslova og opplæringsforskrifta (02.10.2026)', () => {
    const kap = (id: string) => kapittelliste(utvalg.dokumenter.find((d) => d.id === id)?.kapitler ?? []);
    expect(kap('opplaeringslova')).toEqual(['1', ...Array.from({ length: 17 }, (_, i) => String(i + 5)), '23', '24', '25', '27', '28', '29', '30']);
    expect(kap('opplaeringsforskrifta')).toEqual([...Array.from({ length: 17 }, (_, i) => String(i + 4)), '22', '23']);
  });

  it('peker på aktive kilder fra Lovdata: datasettene, eller siden for lokale forskrifter med fylke', () => {
    for (const d of utvalg.dokumenter) {
      const kilde = register.kilder.find((k) => k.id === d.kilde);
      expect(kilde, d.kilde).toBeDefined();
      expect(kilde?.aktiv, d.kilde).toBe(true);
      // Arbeidsmiljøloven har sjekkmetode lovdata fra fase 1 (fingeravtrykk av kapittel 10). Endringene i teksten står
      // likevel i kontrollsaken, fordi ukesrapporten tar med alle dokumentene fra hentingen.
      expect(['lovtekst', 'lovdata'], d.kilde).toContain(kilde?.sjekkmetode);
      if (lokalForskrift(kilde?.url ?? '')) {
        expect(kilde?.type, d.kilde).toBe('side');
        expect(d.gyldighet.niva, d.id).toBe('fylke');
        expect(d.malform, d.id).toBeDefined();
        expect(d.kapitler, d.id).toBeUndefined();
      } else {
        expect(kilde?.type, d.kilde).toBe('lovdata-datasett');
        expect(() => datasettnavn(kilde?.url ?? '')).not.toThrow();
      }
    }
  });
});

describe('dataene i data/lovdata', () => {
  const mappe = join(rot, 'data/lovdata');
  const filer = existsSync(mappe) ? readdirSync(mappe).filter((f) => f.endsWith('.json') && f !== 'oversikt.json') : [];

  it.runIf(filer.length > 0)('følger skjemaet, og oversikten stemmer med dokumentene', () => {
    const oversikt = lovoversiktSkjema.parse(JSON.parse(readFileSync(join(mappe, 'oversikt.json'), 'utf8')));
    expect(oversikt.dokumenter.map((d) => `${d.id}.json`).sort()).toEqual([...filer].sort());
    for (const f of filer) {
      const d = lovdokumentSkjema.parse(JSON.parse(readFileSync(join(mappe, f), 'utf8')));
      const o = oversikt.dokumenter.find((x) => x.id === d.id);
      expect(o?.antallParagrafer).toBe(alleParagrafer(d.seksjoner).length);
      // Ingen paragrafnummer to ganger i samme dokument, så adressene er entydige.
      const nr = alleParagrafer(d.seksjoner).map((x) => x.paragraf.nr);
      expect(new Set(nr).size, d.id).toBe(nr.length);
    }
  });
});

describe('hentingen', () => {
  it('finner nye, fjernede og endrede paragrafer', async () => {
    const { sammenlignLovdokument } = await import('../../scripts/hent-lovdata.ts');
    const gammel = lesLovdokument(html, { ...oppsett, kapitler: ['1', '16'] });
    const ny = structuredClone(gammel);
    const kap1 = alleSeksjoner(ny.seksjoner).find((s) => s.nr === '1');
    if (!kap1?.paragrafer[0] || !kap1.paragrafer[1]) throw new Error('mangler kapittel 1');
    kap1.paragrafer[0].ledd = [{ tekst: ['Ny tekst.'] }];
    kap1.paragrafer.splice(1, 1);
    kap1.paragrafer.push({ ...kap1.paragrafer[0], nr: '1-3', visNr: '§ 1-3', tittel: 'Ny paragraf' });
    expect(sammenlignLovdokument(gammel, ny)).toEqual(['Ny paragraf: § 1-3 Ny paragraf', 'Paragraf fjernet: § 1-2 Verkeområde', 'Endret: § 1-1 Formålet med lova']);
    expect(sammenlignLovdokument(gammel, gammel)).toEqual([]);
  });

  it('godtar ikke en henting som har mistet mange paragrafer eller har paragrafer uten tekst', async () => {
    const { validerLovdokument } = await import('../../scripts/hent-lovdata.ts');
    const full = lesLovdokument(html, { ...oppsett, kapitler: ['1', '16'] });
    const liten = lesLovdokument(html, { ...oppsett, kapitler: ['1'] });
    expect(validerLovdokument(full, null)).toEqual([]);
    expect(validerLovdokument(liten, full).join(' ')).toMatch(/falt fra 4 til 2/);
    const tom = structuredClone(full);
    const p = alleParagrafer(tom.seksjoner)[0]?.paragraf;
    if (p) p.ledd = [];
    expect(validerLovdokument(tom, null).join(' ')).toMatch(/Paragrafer uten tekst: § 1-1/);
  });

  it('kontrollsaken lister endringene i lov og forskrift til orientering', async () => {
    const { lagUkesrapport } = await import('../../scripts/kilder/ukesrapport.ts');
    const register = kilderegisterSkjema.parse(lesFil(rot, join(rot, 'content/kilder.yaml')));
    const rapport = lagUkesrapport({
      register,
      kildestatus: { kjort: '2026-10-05T04:17:00Z', kilder: {} },
      verdistatus: null,
      endringer: {},
      indeks: [],
      repo: 'larsarnenilssen/fuskelappen',
      lovdata: { dokumenter: [{ id: 'opplaeringslova', endringer: ['Endret: § 11-1 Tilpassa opplæring'] }] },
    } as unknown as Parameters<typeof lagUkesrapport>[0]);
    expect(JSON.stringify(rapport)).toContain('opplaeringslova: Endret: § 11-1 Tilpassa opplæring');
  });

  it('varsler når siste periode for et regelverk går ut innen et halvt år', async () => {
    const { regelverkSomGarUt } = await import('../../scripts/kilder/ukesrapport.ts');
    const r = (id: string, regelverk: string, gyldig_til: string, niva = 'nasjonal') => ({ id, regelverk, gyldig_til, gyldighet: { niva } });
    const sett = [r('sfs-a', 'sfs', '2026-12-31'), r('sfs-b', 'sfs', '2027-12-31'), r('hta-a', 'hta', '2026-12-31'), r('lokal', 'hta', '2030-01-01', 'fylke')];
    expect(regelverkSomGarUt(sett, '2026-10-05')).toEqual([{ regelverk: 'hta', regelsett: 'hta-a', gyldigTil: '2026-12-31' }]);
    expect(regelverkSomGarUt(sett, '2027-08-01').map((u) => u.regelverk).sort()).toEqual(['hta', 'sfs']);
  });

  it('kontrollsaken sier hvilket innhold og hvilke tall som viser til en endret paragraf, med et punkt å krysse av', async () => {
    const { lagUkesrapport, lovBerort } = await import('../../scripts/kilder/ukesrapport.ts');
    const { lagKontrollindeks } = await import('../../src/core/kontroll/indeks.ts');
    const { lesInnhold, lesRegelsett } = await import('../../scripts/innhold/alt.ts');
    const register = kilderegisterSkjema.parse(lesFil(rot, join(rot, 'content/kilder.yaml')));
    const indeks = lagKontrollindeks(register.kilder, lesRegelsett(rot), lesInnhold(rot), {}, null, '2026-10-05');
    const lovdata = { dokumenter: [{ id: 'opplaeringsforskrifta', kilde: 'opplaeringsforskrifta', endringer: ['Endret: § 4-19 Poengutrekning ved fordeling av plassar til vidaregåande trinn 1'] }] };
    const berort = lovBerort({ indeks, lovdata });
    // Regelverdien med § 4-19 som punkt, og innhold som viser til paragrafen (regelen «Til Vg1»).
    expect(berort.some((b) => b.includes('snitt_desimaler'))).toBe(true);
    expect(berort.some((b) => b.includes('«Til Vg1»'))).toBe(true);
    const rapport = lagUkesrapport({
      register,
      kildestatus: { kjort: '2026-10-05T04:17:00Z', kilder: {} },
      verdistatus: null,
      endringer: {},
      indeks,
      repo: 'larsarnenilssen/fuskelappen',
      lovdata,
    } as unknown as Parameters<typeof lagUkesrapport>[0]);
    expect(rapport.tekst).toContain('- [ ] Jeg har sett på innholdet og tallene');
    expect(rapport.punkter).toBeGreaterThan(0);
  });
});
