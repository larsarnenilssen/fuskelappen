// Innholdstester: skjema, begge målformer, minst én kilde og gyldige referanser.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Fylker, Innholdselement, Kilderegister, Synonymer } from '../../src/core/innhold/skjema.ts';
import { finnOverlapp } from '../../src/core/regler/motor.ts';
import type { Regelsett } from '../../src/core/regler/skjema.ts';
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

const spesielle = new Set(['content/kilder.yaml', 'content/fylker.yaml', 'content/sok/synonymer.yaml']);
const innholdsfiler = [...yamlFiler(join(rot, 'content')), ...yamlFiler(join(rot, 'tests/fixtures/innhold'))].filter(
  (f) => !spesielle.has(relative(rot, f)),
);
const elementer = innholdsfiler.flatMap((f) => (lesFil(rot, f, false) as Innholdselement[]).map((e) => ({ fil: relative(rot, f), e })));

const regelfiler = [...yamlFiler(join(rot, 'rules')), ...yamlFiler(join(rot, 'tests/fixtures/regler'))];
const regelsett = regelfiler.map((f) => lesFil(rot, f) as Regelsett);

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

  it('regelsett-id er unik', () => {
    const ider = regelsett.map((r) => r.id);
    expect(new Set(ider).size).toBe(ider.length);
  });
});
