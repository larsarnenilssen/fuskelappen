// Regelverk (avgjørelse 039): leseren for sidene hos Lovdata (lokale forskrifter), titlene, søket på tvers av
// målform, avtalene med egne ord og lenkene i innholdet.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { lokalForskrift, ukenummer } from '../../scripts/hent-lovdata.ts';
import { lesInnhold } from '../../scripts/innhold/alt.ts';
import { lesFil } from '../../scripts/innhold/last.ts';
import { lovdatalenke, ryddOverskrift, ryddTittel } from '../../scripts/lovdata/les.ts';
import { lesLovdataside } from '../../scripts/lovdata/side.ts';
import type { Synonymer } from '../../src/core/innhold/skjema.ts';
import { lagOrdformer } from '../../src/core/sok/ordformer.ts';
import { avtaler, avtaleSomDokument, rentekstFraHtml } from '../../src/modules/lov/avtaler.ts';
import { sokIDokumenter, utvalgstekst } from '../../src/modules/lov/data.ts';
import { type Lovutvalg } from '../../src/modules/lov/skjema.ts';
import { alleParagrafer, alleSeksjoner, type Lovdokument, rentekst } from '../../src/modules/lov/typer.ts';

const rot = join(__dirname, '../..');
const oppsett = { id: 'prove', kilde: 'vestland-forskrift-inntak', gyldighet: { niva: 'fylke' as const, fylke: '46' }, hentet: '2026-10-02', kapitler: null, malform: 'nn' as const, refid: 'forskrift/2020-09-29-9999' };

describe('leseren for sidene hos Lovdata (lokale forskrifter)', () => {
  const html = readFileSync(join(rot, 'tests/fixtures/lovdata/side.html'), 'utf8');
  const d = lesLovdataside(html, oppsett);
  const p = (nr: string) => alleParagrafer(d.seksjoner).find(({ paragraf }) => paragraf.nr === nr)?.paragraf;

  it('leser tittel, siste endring, kapitler og paragrafer', () => {
    expect(d).toMatchObject({ tittel: 'Forskrift om prøvereglar, Prøve fylkeskommune', type: 'forskrift', malform: 'nn', refid: 'forskrift/2020-09-29-9999', sistEndret: '2026-08-01' });
    expect(alleSeksjoner(d.seksjoner).map((s) => [s.type, s.nr, s.overskrift])).toEqual([
      ['kapittel', '1', 'Kapittel 1 Innleiande føresegn'],
      ['kapittel', '2', 'Kapittel 2 Sanksjonar'],
    ]);
    expect(p('1-1')).toMatchObject({ visNr: '§ 1-1', tittel: 'Formål' });
  });

  it('leser ledd, lenker, fotnoter om endringer og lister med flere nivåer', () => {
    const lenke = p('1-1')?.ledd[0]?.tekst.find((s) => typeof s !== 'string' && 'l' in s);
    expect(lenke).toEqual({ t: 'opplæringslova § 10-7', l: 'lov/2023-06-09-30/§10-7' });
    expect(rentekst(p('1-1')?.endringer[0] ?? [])).toBe('Endra ved forskrift 16 juni 2026 nr. 9998.');
    expect(alleSeksjoner(d.seksjoner)[0]?.merknader).toHaveLength(1);
    const ledd = p('2-1')?.ledd ?? [];
    expect(ledd.map((l) => rentekst(l.tekst))).toEqual(['(1) Sanksjonar utan klagerett:', '(2) Andre sanksjonar.']);
    expect(ledd[0]?.liste?.map((x) => x.merke)).toEqual(['1.', '2.']);
    expect(ledd[0]?.liste?.[0]?.ledd[0]?.liste?.[0]).toMatchObject({ merke: 'a.' });
  });

  it('stopper med en tydelig feil når siden har innhold leseren ikke kjenner', () => {
    expect(() => lesLovdataside(html.replace('<p data-uid="0" class="morTag_a avsnitt">', '<blockquote class="ukjent">').replace('</p>\n<table class="textList', '</blockquote>\n<table class="textList'), oppsett)).toThrow(/innhold appen ikke leser/);
    expect(() => lesLovdataside('<html><body></body></html>', oppsett)).toThrow(/documentBody/);
  });

  it('kjenner igjen adressen til en lokal forskrift, og henter i uke 13, 26, 39 og 52', () => {
    expect(lokalForskrift('https://lovdata.no/dokument/LF/forskrift/2020-09-29-3380')).toEqual({ refid: 'forskrift/2020-09-29-3380', fil: 'lf-20200929-3380.html' });
    expect(lokalForskrift('https://lovdata.no/forskrift/2024-06-03-900')).toBeNull();
    expect(ukenummer(new Date('2026-01-01'))).toBe(1);
    expect(ukenummer(new Date('2026-03-26'))).toBe(13);
    expect(ukenummer(new Date('2026-12-28'))).toBe(53);
  });
});

describe('titler og lenker fra Lovdata', () => {
  it('rydder paragraftitler og kapitteloverskrifter, men ikke forkortelser', () => {
    expect(ryddTittel('(habilitetskrav).')).toBe('Habilitetskrav');
    expect(ryddTittel('Opplæring i punktskrift m.m.')).toBe('Opplæring i punktskrift m.m.');
    expect(ryddTittel('Virkeområde.')).toBe('Virkeområde');
    expect(ryddOverskrift('Kapittel II. Om ugildhet.')).toBe('Kapittel II Om ugildhet');
    expect(ryddOverskrift('I. Fellesreglar')).toBe('I. Fellesreglar');
  });

  it('gjør lenker hos Lovdata om til formen i datasettene', () => {
    expect(lovdatalenke('/dokument/NL/lov/2023-06-09-30/%C2%A75-1')).toBe('lov/2023-06-09-30/§5-1');
    expect(lovdatalenke('https://lovdata.no/forskrift/2024-06-03-900')).toBe('forskrift/2024-06-03-900');
  });

  it('skriver utvalget kort, også med romertall, og deler ikke et spenn over to linjer', () => {
    expect(utvalgstekst(['1', '5', '6', '7', '9'], 'og').replace(/⁠/g, '')).toBe('1, 5–7 og 9');
    expect(utvalgstekst(['II', 'III', 'IV', 'V', 'VI'], 'og')).toBe('II⁠–⁠VI');
    expect(utvalgstekst(['4', '10'], 'og')).toBe('4 og 10');
  });
});

describe('søket på tvers av målform', () => {
  const ordformer = lagOrdformer(lesFil(rot, join(rot, 'content/sok/synonymer.yaml')) as Synonymer);
  const dok: Lovdokument = {
    id: 'prove',
    kilde: 'opplaeringslova',
    type: 'lov',
    tittel: 'Prøvelova',
    korttittel: 'Prøvelova',
    malform: 'nn',
    refid: 'lov/2023-06-09-30',
    sistEndret: null,
    hentet: '2026-10-02',
    gyldighet: { niva: 'nasjonal' },
    utvalg: null,
    seksjoner: [
      {
        id: 'kap1',
        type: 'kapittel',
        nr: '1',
        overskrift: 'Kapittel 1',
        merknader: [],
        seksjoner: [],
        paragrafer: [
          { nr: '1-1', visNr: '§ 1-1', tittel: 'Individuelt tilrettelagd opplæring', ledd: [{ tekst: ['Skulen skal gi personleg rettleiing og ikkje krenkingar.'] }], endringer: [], fotnoter: [] },
          { nr: '1-2', visNr: '§ 1-2', tittel: 'Bortvising', ledd: [{ tekst: ['Eleven kan visast bort.'] }], endringer: [], fotnoter: [] },
        ],
      },
    ],
  };
  const treff = (sok: string) => sokIDokumenter([dok], sok, ordformer).map((t) => t.paragraf.nr);

  it('finner nynorsk tekst med bokmål', () => {
    expect(treff('individuelt tilrettelagt')).toEqual(['1-1']);
    expect(treff('skolen personlig veiledning')).toEqual(['1-1']);
    expect(treff('ikke krenkelser')).toEqual(['1-1']);
    expect(treff('bortvisning')).toEqual(['1-2']);
  });

  it('setter paragrafen med nummeret først, og markerer hele ordet i utdraget', () => {
    expect(treff('§ 1-2')[0]).toBe('1-2');
    expect(sokIDokumenter([dok], 'personlig', ordformer)[0]?.utdrag?.treff).toBe('personleg');
  });
});

describe('avtalene med egne ord (eier 02.10.2026)', () => {
  const utvalg = lesFil(rot, join(rot, 'content/lovverk.yaml')) as Lovutvalg;
  const innhold = lesInnhold(rot);
  const elementer = new Map(innhold.map((x) => [x.element.id, x]));

  it('har Hovedtariffavtalen og SFS 2213, og hver bestemmelse finnes, er en forklaring og viser til avtalen', () => {
    expect(utvalg.avtaler.map((a) => a.id)).toEqual(['hovedtariffavtalen', 'sfs2213']);
    for (const a of utvalg.avtaler) {
      for (const id of a.kapitler.flatMap((k) => k.elementer)) {
        const e = elementer.get(id);
        expect(e, id).toBeDefined();
        expect(e?.fil, id).toMatch(/^content\/lov\//);
        expect(e?.element.type, id).toBe('forklaring');
        expect(e?.element.kilder.map((k) => k.id), id).toContain(a.kilde);
        expect(e?.element.kontrollsporsmal?.length, id).toBeGreaterThan(0);
      }
    }
  });

  it('har med alle bestemmelsene i content/lov/, én gang', () => {
    const iAvtaler = utvalg.avtaler.flatMap((a) => a.kapitler.flatMap((k) => k.elementer));
    const iFiler = innhold.filter((x) => x.fil.startsWith('content/lov/')).map((x) => x.element.id);
    expect([...iAvtaler].sort()).toEqual([...iFiler].sort());
    expect(new Set(iAvtaler).size).toBe(iAvtaler.length);
  });

  it('gjør en avtale om til et dokument som kan søkes i', () => {
    expect(rentekstFraHtml('<p>Lønn &amp; ferie</p>\n<p>«12 000 kroner»</p>')).toBe('Lønn & ferie «12 000 kroner»');
    const a = avtaler.find((x) => x.id === 'sfs2213');
    expect(a).toBeDefined();
    const bestemmelser = new Map(innhold.filter((x) => x.fil.startsWith('content/lov/')).map((x) => [x.element.id, x.element]));
    const d = avtaleSomDokument(a as NonNullable<typeof a>, bestemmelser, 'nb');
    expect(d).toMatchObject({ id: 'sfs2213', type: 'avtale', korttittel: 'SFS 2213 Arbeidstid for lærere' });
    expect(alleParagrafer(d.seksjoner).map(({ paragraf }) => paragraf.nr)).toContain('sfs-livsfasetiltak');
    expect(sokIDokumenter([d], 'livsfasetiltak').map((t) => t.paragraf.nr)).toContain('sfs-livsfasetiltak');
  });
});

describe('lenkene i innholdet', () => {
  const innhold = lesInnhold(rot);
  const utvalg = lesFil(rot, join(rot, 'content/lovverk.yaml')) as Lovutvalg;
  const mappe = join(rot, 'data/lovdata');
  const lovdokumenter = existsSync(mappe)
    ? new Map(
        readdirSync(mappe)
          .filter((f) => f.endsWith('.json') && !['oversikt.json', 'lokale.json', 'kommende.json'].includes(f))
          .map((f) => {
            const d = JSON.parse(readFileSync(join(mappe, f), 'utf8')) as Lovdokument;
            return [d.id, new Set(alleParagrafer(d.seksjoner).map(({ paragraf }) => paragraf.nr))] as const;
          }),
      )
    : new Map<string, Set<string>>();
  const avtaleelementer = new Map(utvalg.avtaler.map((a) => [a.id, new Set(a.kapitler.flatMap((k) => k.elementer))]));
  const ider = new Set(innhold.map((x) => x.element.id));

  it.runIf(lovdokumenter.size > 0)('peker på paragrafer, bestemmelser og begreper som finnes', () => {
    const feil: string[] = [];
    for (const { element } of innhold) {
      const tekst = `${element.tekst.nb} ${element.tekst.nn}`;
      for (const [, sti] of tekst.matchAll(/href="#(\/[^"]+)"/g)) {
        const [, modul, a, b] = (sti as string).split('/');
        if (modul === 'lov' && a) {
          const ok = lovdokumenter.has(a) ? !b || lovdokumenter.get(a)?.has(decodeURIComponent(b)) : avtaleelementer.has(a) && (!b || avtaleelementer.get(a)?.has(b));
          if (!ok) feil.push(`${element.id}: ${sti}`);
        }
        if (modul === 'begreper' && a && !ider.has(a)) feil.push(`${element.id}: ${sti}`);
      }
    }
    expect(feil).toEqual([]);
  });
});
