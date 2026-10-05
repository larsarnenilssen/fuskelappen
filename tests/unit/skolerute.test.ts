// Skoleruta fra fylkenes lokale forskrifter (scripts/skolerute/tolk.ts, fase 6, pakke 5). Testene leser de sju
// forskriftene i data/lovdata, så de feiler hvis en ny henting gir tabeller tolkningen ikke forstår.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { skoleruteJson, sammenlignSkoleruter } from '../../scripts/hent-skolerute.ts';
import { lesLovdataside } from '../../scripts/lovdata/side.ts';
import { finnDatoer, grupper, type Hendelse, klassifiser, lagSkoleruter, linjer, tilDatoer, tolkDatoOgHending, tolkMerknad, tolkSkolerute } from '../../scripts/skolerute/tolk.ts';
import { type Lovdokument, lovdokumentSkjema } from '../../src/modules/lov/skjema.ts';

const dokument = (id: string): Lovdokument => lovdokumentSkjema.parse(JSON.parse(readFileSync(`data/lovdata/${id}.json`, 'utf8')));
const FILER = [
  'vestland-skolerute-2026-2027',
  'rogaland-skolerute-2025-2028',
  'troms-skolerute-2026-2027',
  'troms-skolerute-2027-2028-fra-2027-08-01',
  'troms-skolerute-2028-2029-fra-2028-08-01',
  'finnmark-skolerute-2026-2027',
  'finnmark-skolerute-2027-2028-fra-2027-08-01',
];
const ruter = lagSkoleruter(FILER.map(dokument), '2026-10-05');
const finn = (fylke: string, type: Hendelse['type'], skolear: string) => ruter.fylker[fylke]?.hendelser.filter((h) => h.type === type && h.skolear === skolear).map((h) => [h.fra, h.til ?? null]);
const k = { dokument: 'x', skolear: '2026-2027', radmaned: null };

describe('datoene i teksten', () => {
  it('leser ukedag, dag og måned, og hopper over ukenummer og «2. pinsedag»', () => {
    expect(finnDatoer('Veke 41, måndag 5.–fredag 9. oktober').map((t) => [t.ukedag, t.dag, t.maned])).toEqual([
      [1, 5, null],
      [5, 9, 10],
    ]);
    expect(finnDatoer('Mandag 21. mai – 2. pinsedag').map((t) => t.dag)).toEqual([21]);
    expect(finnDatoer('Mandag 16 august – første skoledag').map((t) => [t.dag, t.maned])).toEqual([[16, 8]]);
    expect(finnDatoer('Vinterferie 23. til 27. februar (veke 9).').map((t) => t.dag)).toEqual([23, 27]);
  });

  it('gir spenn, lister og måneden fra datoen ved siden av', () => {
    const tekst = 'Vinterferie onsdag 24. februar–fredag 26.';
    const [u] = grupper(tekst, finnDatoer(tekst));
    expect(u?.art).toBe('spenn');
    expect(tilDatoer(u as NonNullable<typeof u>, '2026-2027', 2)).toEqual({ datoer: ['2027-02-24', '2027-02-26'] });
    const fom = 'fri fra og med mandag 28. september – til og med fredag 2. oktober';
    expect(grupper(fom, finnDatoer(fom))[0]?.art).toBe('spenn');
    const liste = 'Mandag 16. og tirsdag 17. november';
    expect(grupper(liste, finnDatoer(liste))[0]?.art).toBe('liste');
  });

  it('godtar ikke feil ukedag, datoer utenfor skoleåret eller spenn som går bakover', () => {
    expect(tolkMerknad('Første skoledag tirsdag 17. august.', { ...k, radmaned: 8 }).ulest[0]?.grunn).toMatch(/er ikke en tirsdag/);
    expect(tolkMerknad('Høstferie 9. til 5. oktober', { ...k, radmaned: 10 }).ulest[0]?.grunn).toMatch(/bakover/);
    expect(tolkMerknad('Fri 31. juli og 1. august', { ...k, skolear: '2026-2027', radmaned: 7 }).ulest[0]?.grunn).toMatch(/utenfor skoleåret|rekkefølge/);
    expect(tolkMerknad('Haustferie 12. til 16. oktober (veke 41)', { ...k, radmaned: 10 }).ulest[0]?.grunn).toMatch(/ikke i uke 41/);
  });

  it('deler en celle der linjeskiftene har blitt mellomrom', () => {
    expect(linjer('Mandag 5. juni – andre pinsedag Siste skoledag – onsdag 21. juni')).toEqual(['Mandag 5. juni – andre pinsedag', 'Siste skoledag – onsdag 21. juni']);
    expect(linjer('Mandag 17. mai – Grunnlovsdag / Andre pinsedag.')).toHaveLength(1);
  });

  it('klassifiserer på bokmål og nynorsk', () => {
    expect(klassifiser('Haustferie 6. til 10. oktober', 10)).toBe('hostferie');
    expect(klassifiser('Første skuledag', 8)).toBe('forste-skoledag');
    expect(klassifiser('Første skoledag – mandag 4. januar.', 1)).toBe('forste-etter-jul');
    expect(klassifiser('Oppstart etter påske – tirsdag 30. mars.', 3)).toBe('forste-etter-paske');
    expect(klassifiser('Felles planleggingsdag tysdag 4. november (fri for elevar).', 11)).toBe('planlegging');
    expect(klassifiser('Kristi himmelfartsdag torsdag 14. mai.', 5)).toBe('helligdag');
    expect(klassifiser('Arbeidaranes dag fredag 1. mai.', 5)).toBe('helligdag');
    expect(klassifiser('Fredag 30. april – fridag skole.', 4)).toBe('elevfri');
    expect(klassifiser('Siste skoledag – fredag 18. juni.', 6)).toBe('siste-skoledag');
    expect(klassifiser('Siste skoledag før jul – fredag 18. desember.', 12)).toBe('annet');
  });

  it('hopper over det som fastsettes lokalt', () => {
    expect(tolkMerknad('Siste skoledag før jul blir fastsett lokalt på skolen og publiserast på skolens heimesider.', { ...k, radmaned: 12 })).toEqual({ hendelser: [], ulest: [] });
    const r = tolkMerknad('Andre pinsedag måndag 5. juni. Siste skoledag før ferien blir fastsett lokalt på skolen.', { ...k, skolear: '2027-2028', radmaned: 6 });
    expect(r.hendelser.map((h) => [h.type, h.fra, h.tekst])).toEqual([['helligdag', '2028-06-05', 'Andre pinsedag måndag 5. juni.']]);
  });
});

describe('dato og hending i hver sin kolonne (Vestland)', () => {
  it('parer linjene én og én når antallet er likt', () => {
    const r = tolkDatoOgHending('Fredag 7. mai\nFredag 28. mai', 'Elevfri dag\nElevfri dag', { ...k, radmaned: 5 });
    expect(r.hendelser.map((h) => [h.type, h.fra])).toEqual([
      ['elevfri', '2027-05-07'],
      ['elevfri', '2027-05-28'],
    ]);
  });

  it('gir ulest når linjene ikke kan pares, eller cellene har mistet linjeskiftene', () => {
    expect(tolkDatoOgHending('Veke 9 måndag 1.–fredag 5. mars\nSiste skuledag før påske fredag 19. mars\nFørste skuledag etter påske tysdag 30. mars', 'Påskeferie', { ...k, radmaned: 3 }).hendelser).toEqual([]);
    expect(tolkDatoOgHending('Fredag 7. mai Fredag 28. mai', 'Elevfri dag Elevfri dag', { ...k, radmaned: 5 }).ulest).toHaveLength(1);
    expect(tolkDatoOgHending('Fredag 29. januar', 'Første skuledag måndag 4. januar Elevfri dag', { ...k, radmaned: 1 }).hendelser).toEqual([]);
  });

  it('leser cellene med linjeskift fra siden hos Lovdata', () => {
    const html = readFileSync('tests/fixtures/lovdata/lf-skulerute.html', 'utf8');
    const d = lesLovdataside(html, { id: 'vestland-skolerute-2026-2027', kilde: 'lovdata-lokale', kapitler: null, refid: 'forskrift/2026-08-06-1634', gyldighet: { niva: 'fylke', fylke: '46' }, hentet: '2026-10-05', lokaltype: 'skolerute', malform: 'nn' });
    const tabell = d.seksjoner[0]?.paragrafer[1]?.ledd.find((l) => l.tabell)?.tabell;
    expect(tabell?.rader.find((r) => r[0]?.[0] === 'Mai')?.[1]).toEqual(['Fredag 7. mai\nFredag 28. mai']);
    const r = tolkSkolerute(d);
    expect(r.hendelser.filter((h) => h.type === 'elevfri').map((h) => h.fra)).toEqual(['2026-11-06', '2027-05-07', '2027-05-28']);
    // Mars (tre datoer, én hending) og januar (én dato, to hendinger) kan ikke pares.
    expect(r.ulest.map((u) => u.grunn)).toEqual(['1 linjer med dato og 2 med hending.', '3 linjer med dato og 1 med hending.']);
  });
});

describe('de sju skolerutene i Lovdata', () => {
  it('Troms 2026–2027', () => {
    expect(finn('55', 'forste-skoledag', '2026-2027')).toEqual([['2026-08-17', null]]);
    expect(finn('55', 'hostferie', '2026-2027')).toEqual([['2026-09-30', '2026-10-02']]);
    expect(finn('55', 'planlegging', '2026-2027')).toEqual([['2026-11-16', '2026-11-17']]);
    expect(finn('55', 'paskeferie', '2026-2027')).toEqual([['2027-03-22', '2027-03-29']]);
    expect(finn('55', 'forste-etter-paske', '2026-2027')).toEqual([['2027-03-30', null]]);
    expect(finn('55', 'siste-skoledag', '2026-2027')).toEqual([['2027-06-18', null]]);
  });

  it('Troms 2027–2028 og 2028–2029, med linjer som har mistet linjeskiftet', () => {
    expect(finn('55', 'helligdag', '2027-2028')).toEqual([
      ['2028-05-01', null],
      ['2028-05-17', null],
      ['2028-05-25', null],
      ['2028-06-05', null],
    ]);
    expect(finn('55', 'siste-skoledag', '2027-2028')).toEqual([['2028-06-21', null]]);
    expect(finn('55', 'forste-skoledag', '2028-2029')).toEqual([['2028-08-21', null]]);
    expect(finn('55', 'helligdag', '2028-2029')?.map(([fra]) => fra)).toContain('2029-05-21');
  });

  it('Finnmark', () => {
    expect(finn('56', 'vinterferie', '2026-2027')).toEqual([['2027-02-24', '2027-02-26']]);
    expect(finn('56', 'forste-etter-jul', '2026-2027')).toEqual([['2027-01-05', null]]);
    expect(finn('56', 'forste-skoledag', '2027-2028')).toEqual([['2027-08-16', null]]);
    expect(finn('56', 'siste-skoledag', '2027-2028')).toEqual([['2028-06-16', null]]);
  });

  it('Rogaland, tre skoleår i én forskrift, uten dobbel påskeferie', () => {
    expect(ruter.fylker['11']?.dokumenter.map((d) => d.skolear)).toEqual(['2025-2026', '2026-2027', '2027-2028']);
    expect(finn('11', 'hostferie', '2025-2026')).toEqual([['2025-10-06', '2025-10-10']]);
    expect(finn('11', 'paskeferie', '2025-2026')).toEqual([['2026-03-30', '2026-04-06']]);
    expect(finn('11', 'vinterferie', '2027-2028')).toEqual([['2028-02-28', '2028-03-03']]);
    // Siste skoledag og første etter jul fastsettes lokalt.
    expect(finn('11', 'siste-skoledag', '2025-2026')).toEqual([]);
    expect(finn('11', 'forste-etter-jul', '2026-2027')).toEqual([]);
  });

  it('Vestland: skolene følger vertskommunen, og det som ikke kan pares, er ulest', () => {
    expect(ruter.fylker['46']?.dokumenter).toEqual([{ id: 'vestland-skolerute-2026-2027', refid: 'forskrift/2026-08-06-1634', skolear: '2026-2027', malform: 'nn', vertskommune: true }]);
    expect(finn('46', 'hostferie', '2026-2027')).toEqual([['2026-10-05', '2026-10-09']]);
    expect(finn('46', 'juleferie', '2026-2027')).toEqual([['2026-12-23', '2027-01-01']]);
    expect(finn('46', 'paskeferie', '2026-2027')).toEqual([]);
    expect(ruter.ulest.every((u) => u.dokument === 'vestland-skolerute-2026-2027')).toBe(true);
    expect(ruter.ulest.length).toBeGreaterThan(0);
  });

  it('alle hendelser har gyldige datoer i skoleåret, og ingen ligger dobbelt', () => {
    for (const f of Object.values(ruter.fylker)) {
      const nokler = f.hendelser.map((h) => `${h.skolear} ${h.type} ${h.fra} ${h.til ?? ''}`);
      expect(new Set(nokler).size).toBe(nokler.length);
      for (const h of f.hendelser) {
        const start = Number(h.skolear.slice(0, 4));
        expect(h.fra >= `${start}-08-01` && (h.til ?? h.fra) <= `${start + 1}-07-31`).toBe(true);
        if (h.til) expect(h.til > h.fra).toBe(true);
      }
    }
  });

  it('den lagrede filen er laget av dataene i repoet', () => {
    const lagret = JSON.parse(readFileSync('data/skolerute/skolerute.json', 'utf8'));
    expect(skoleruteJson({ ...lagret, lest: '' })).toBe(skoleruteJson({ ...ruter, lest: '' }));
    expect(sammenlignSkoleruter(lagret, ruter)).toEqual({ endringer: [], nyeUlest: [] });
  });
});
