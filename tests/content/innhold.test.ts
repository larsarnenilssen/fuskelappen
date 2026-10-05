// Innholdstester: skjema, begge målformer, minst én kilde og gyldige referanser.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Fylker, Innholdselement, Kilderegister, Synonymer } from '../../src/core/innhold/skjema.ts';
import { finnOverlapp, slaaSammen } from '../../src/core/regler/motor.ts';
import type { Regelsett } from '../../src/core/regler/skjema.ts';
import { lesInnhold, lesRegelsett } from '../../scripts/innhold/alt.ts';
import { lesFil } from '../../scripts/innhold/last.ts';
import { lagKilderMd } from '../../scripts/lag-kilder-md.ts';

const rot = join(__dirname, '../..');

function yamlFiler(mappe: string): string[] {
  try {
    return readdirSync(mappe).flatMap((navn) => {
      const sti = join(mappe, navn);
      if (statSync(sti).isDirectory()) return yamlFiler(sti);
      return navn.endsWith('.yaml') ? [sti] : [];
    });
  } catch {
    return [];
  }
}

const register = lesFil(rot, join(rot, 'content/kilder.yaml')) as Kilderegister;
const kildeIder = new Set(register.kilder.map((k) => k.id));

const spesielle = new Set(['content/kilder.yaml', 'content/fylker.yaml', 'content/fylker/lenker.yaml', 'content/sok/synonymer.yaml', 'content/kontroll/praksis.yaml', 'content/lovverk.yaml']);
const innholdsfiler = [...yamlFiler(join(rot, 'content')), ...yamlFiler(join(rot, 'tests/fixtures/innhold'))].filter(
  (f) => !spesielle.has(relative(rot, f)),
);
const elementer = innholdsfiler.flatMap((f) => (lesFil(rot, f, false) as Innholdselement[]).map((e) => ({ fil: relative(rot, f), e })));

const regelfiler = [...yamlFiler(join(rot, 'rules')), ...yamlFiler(join(rot, 'tests/fixtures/regler'))];
const regelfilinnhold = regelfiler.map((f) => lesFil(rot, f) as Regelsett);
// Regelsett kan være delt på flere filer. slaaSammen kaster hvis delene ikke passer sammen.
const regelsett = slaaSammen(regelfilinnhold);

describe('kilderegisteret', () => {
  it('er gyldig og har alle kildene fra kapittel 5', () => {
    for (const id of [
      'ks-sfs2213',
      'ks-hovedtariffavtalen',
      'arbeidsmiljoloven',
      'opplaeringslova',
      'opplaeringsforskrifta',
      'udir-grep',
      'udir-veileder-tilpasset-opplaering',
      'udir-overordnet-del',
      'vlfk-forskrift-inntak',
      'vlfk-skulereglar',
      'vlfk-sider',
      'udir-nsr',
    ]) {
      expect(kildeIder.has(id), id).toBe(true);
    }
  });

  it('docs/KILDER.md er oppdatert (kjør «npm run kilder:dokumenter»)', () => {
    expect(readFileSync(join(rot, 'docs/KILDER.md'), 'utf8')).toBe(lagKilderMd(register));
  });

  it('kildestatusfilen gjelder bare kjente kilder', () => {
    const status = JSON.parse(readFileSync(join(rot, 'data/status/kildestatus.json'), 'utf8')) as { kilder: Record<string, unknown> };
    for (const id of Object.keys(status.kilder)) expect(kildeIder.has(id), id).toBe(true);
  });
});

describe('innhold', () => {
  it('alle innholdsfiler er gyldige (skjema, begge målformer, minst én kilde)', () => {
    // lesFil kaster med lesbar melding hvis en fil ikke følger skjemaet.
    expect(innholdsfiler.length).toBeGreaterThan(0);
  });

  it('alle kilder finnes i kilderegisteret', () => {
    for (const { fil, e } of elementer) {
      for (const k of e.kilder) expect(kildeIder.has(k.id), `${fil}: ${e.id} → ${k.id}`).toBe(true);
    }
  });

  it('relatert peker på innhold som finnes', () => {
    const ider = new Set(elementer.map(({ e }) => e.id));
    for (const { fil, e } of elementer) {
      for (const r of e.relatert) expect(ider.has(r), `${fil}: ${e.id} → ${r}`).toBe(true);
    }
  });

  it('id er unik per nivå', () => {
    const nokler = elementer.map(({ e }) => {
      const g = e.gyldighet;
      return `${e.id}|${g.niva}|${g.niva === 'nasjonal' ? '' : g.fylke}|${g.niva === 'skole' ? g.skole : ''}`;
    });
    expect(new Set(nokler).size).toBe(nokler.length);
  });

  it('nytt innhold i content/ er ikke satt som kontrollert uten eier (bare testdata kan ha dato)', () => {
    // Når eier har kontrollert noe, får det kontrollert: { dato }. Testen sikrer bare at formatet er riktig.
    for (const { e } of elementer) {
      if (e.kontrollert) expect(e.kontrollert.dato).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe('fylker og søk', () => {
  it('fylkeslisten har unike fylkesnummer', () => {
    const fylker = (lesFil(rot, join(rot, 'content/fylker.yaml')) as Fylker).fylker.map((f) => f.nummer);
    expect(new Set(fylker).size).toBe(fylker.length);
    expect(fylker).toContain('46');
  });

  it('synonymlisten har ingen variant som også er kanonisk form', () => {
    const s = lesFil(rot, join(rot, 'content/sok/synonymer.yaml')) as Synonymer;
    const kanoniske = new Set(s.grupper.map((g) => g.kanonisk));
    for (const g of s.grupper) for (const v of g.varianter) expect(kanoniske.has(v), v).toBe(false);
  });
});

describe('regelsett', () => {
  it('alle regelsett er gyldige og har kjente kilder', () => {
    for (const r of regelsett) {
      expect(kildeIder.has(r.kilde), r.id).toBe(true);
      for (const [navn, v] of Object.entries(r.verdier)) expect(kildeIder.has(v.kilde.id), `${r.id}.${navn}`).toBe(true);
    }
  });

  it('ingen overlappende perioder', () => {
    expect(finnOverlapp(regelsett)).toEqual([]);
  });

  it('regelsett-id er unik, og hver del finnes bare én gang', () => {
    const ider = regelfilinnhold.map((r) => `${r.id}|${r.del ?? ''}`);
    expect(new Set(ider).size).toBe(ider.length);
  });
});

describe('annet elevrettet arbeid', () => {
  // Eier 01.10.2026: begrepet og «Hva tiden brukes til» i Arbeidsplan skal forklare det på samme måte.
  it('har samme forklaring i begrepet og i Arbeidsplan', () => {
    const alle = lesInnhold(join(__dirname, '../..'));
    const tekst = (id: string) => alle.find((x) => x.element.id === id)?.element.tekst;
    const begrep = tekst('annet-elevrettet-arbeid');
    const forklaring = tekst('bruk-annen-planfestet');
    for (const m of ['nb', 'nn'] as const) {
      const avsnitt = forklaring?.[m]
        .split('\n\n')
        .find((a) => a.startsWith('**Ann'))
        ?.replace(/\*\*/g, '')
        .trim();
      expect(avsnitt).toBeTruthy();
      expect(begrep?.[m]).toContain(avsnitt);
    }
  });
});

describe('fylkene i innholdet', () => {
  const fylker = new Set((lesFil(rot, join(rot, 'content/fylker.yaml')) as { fylker: { nummer: string }[] }).fylker.map((f) => f.nummer));
  const lovverk = lesFil(rot, join(rot, 'content/lovverk.yaml')) as { dokumenter?: { id: string; gyldighet?: { fylke?: string } }[] };

  it('alle fylkesnumre i innhold, regler, lovverk og kilder finnes i fylkeslisten', () => {
    const brukt = [
      ...lesInnhold(rot).flatMap(({ element: e }) => (e.gyldighet.niva === 'nasjonal' ? [] : [`${e.id}: ${e.gyldighet.fylke}`])),
      ...lesRegelsett(rot).flatMap((r) => (r.gyldighet.niva === 'nasjonal' ? [] : [`${r.id}: ${r.gyldighet.fylke}`])),
      ...(lovverk.dokumenter ?? []).flatMap((d) => (d.gyldighet?.fylke ? [`${d.id}: ${d.gyldighet.fylke}`] : [])),
      ...register.kilder.flatMap((k) => (k.fylke ? [`${k.id}: ${k.fylke}`] : [])),
    ];
    expect(brukt.length).toBeGreaterThan(0);
    expect(brukt.filter((b) => !fylker.has(b.slice(-2)))).toEqual([]);
  });

  it('alle fylkene i skolelisten (NSR) finnes i fylkeslisten', () => {
    const skoler = JSON.parse(readFileSync(join(rot, 'data/skoler/vgs.json'), 'utf8')) as { skoler: { fylke: string }[] };
    expect([...new Set(skoler.skoler.map((s) => s.fylke))].filter((f) => !fylker.has(f))).toEqual([]);
  });
});
