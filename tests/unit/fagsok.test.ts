// Fagsøket i arbeidstidskalkulatorene: fag, program, trinn, fagkoder, prefikser og kallenavn.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { finnVerdi, slaaSammen, somTabell } from '../../src/core/regler/motor.ts';
import type { Regelsett } from '../../src/core/regler/skjema.ts';
import { lesArsrammer, radNavn } from '../../src/modules/arbeidstid/beregning/index.ts';
import { lagFagindeks, normaliser, sokFag } from '../../src/modules/arbeidstid/fagsok.ts';
import { lesFil } from '../../scripts/innhold/last.ts';

const rot = join(__dirname, '../..');
const regler = slaaSammen(
  readdirSync(join(rot, 'rules'), { recursive: true })
    .map(String)
    .filter((f) => f.endsWith('.yaml'))
    .map((f) => lesFil(rot, join(rot, 'rules', f)) as Regelsett),
);
const hent = (n: string) => finnVerdi(regler, n, { dato: '2026-09-29' });
const rader = lesArsrammer(hent('sfs2213.arsrammer'));
const grep = JSON.parse(readFileSync(join(rot, 'data/grep/programomrader.json'), 'utf8')) as { programomrader: Record<string, Record<string, [string, string][]>> };
const fagkoder = JSON.parse(readFileSync(join(rot, 'data/grep/fagkoder.json'), 'utf8')) as { fagkoder: Record<string, [string, string][]> };
const indeks = lagFagindeks(rader, {
  programnavn: somTabell(hent('sfs2213.programnavn')),
  fagnavn: somTabell(hent('sfs2213.fagnavn')),
  kallenavn: somTabell(hent('sfs2213.kallenavn')),
  programomrader: grep.programomrader,
  fagkoder: fagkoder.fagkoder,
});
const forste = (s: string) => {
  const t = sokFag(indeks, s)[0];
  return t ? radNavn(t.rad) : null;
};

describe('fagsøk', () => {
  it('normaliserer tegnsetting og store bokstaver', () => {
    expect(normaliser('Rest. og mat')).toBe('rest og mat');
    expect(normaliser('1P-Y')).toBe('1p y');
  });

  it('alle programnavn og fagnavn i vedlegg 1 har en oppføring i søketabellen', () => {
    const program = new Set(somTabell(hent('sfs2213.programnavn')).map((p) => p.vedlegg));
    const fag = new Set(somTabell(hent('sfs2213.fagnavn')).map((f) => f.vedlegg));
    for (const r of rader) {
      expect(program.has(r.program), r.program).toBe(true);
      if (r.fag) expect(fag.has(r.fag), r.fag).toBe(true);
    }
  });

  it('finner fag, program og trinn', () => {
    expect(forste('engelsk stud vg1')).toBe('Engelsk – Stud.spes Vg1');
    expect(forste('engelsk studiespesialisering vg1')).toBe('Engelsk – Stud.spes Vg1');
    expect(forste('kroppsøving yrkesfag vg2')).toBe('Kroppsøv. – Yrkesfag Vg2');
    expect(forste('restaurant vg1')).toBe('Felles programfag – Rest. og mat Vg1');
  });

  it('finner prefikser i fagkodene og programområdene fra Grep', () => {
    expect(forste('BAT')).toBe('Felles programfag – Bygg og anl. Vg1');
    expect(forste('HEA')).toBe('Felles programfag – Helse/sos Vg2');
    expect(forste('ENG vg1 yrkesfag')).toBe('Engelsk – Yrkesfag Vg1');
    const treff = sokFag(indeks, 'HEA')[0];
    expect(treff?.ekstra.join(' ')).toContain('HEA Helsearbeiderfag');
  });

  it('finner kallenavn og fagkoder', () => {
    expect(forste('R1')).toBe('Matematikk – Stud.spes Vg2');
    expect(sokFag(indeks, 'R1')[0]?.rad.kategori).toBe('Valgfrie programfag');
    // 2P finnes på tre program. Alle skal komme foran 2P-Y (påbygging).
    expect(sokFag(indeks, '2P').slice(0, 3).map((t) => radNavn(t.rad)).sort()).toEqual(
      ['Matematikk – Idrett Vg2', 'Matematikk – MDD Vg2', 'Matematikk – Stud.spes Vg2'],
    );
    expect(forste('biologi 2')).toBe('Bio – Stud.spes Vg3');
    expect(forste('REA3036')).toBe('Bio – Stud.spes Vg3');
    expect(forste('1P-Y')).toBe('Matematikk – Yrkesfag Vg1');
  });

  it('finner fagnavn og fagkoder fra Grep', () => {
    // Faget finnes både på Vg1 (HSF1006) og Vg2 (HEA2005); koden skiller dem.
    expect(sokFag(indeks, 'helsefremmende arbeid').slice(0, 2).map((t) => radNavn(t.rad)).sort()).toEqual([
      'Felles programfag – Helse/sos Vg1',
      'Felles programfag – Helse/sos Vg2',
    ]);
    expect(forste('HEA2005')).toBe('Felles programfag – Helse/sos Vg2');
    expect(forste('arbeidsmiljø og dokumentasjon')).toBe('Felles programfag – Bygg og anl. Vg1');
    expect(forste('samfunnskunnskap')).toMatch(/^Samf\.fag – /);
    expect(forste('ENG1009')).toBe('Engelsk – Yrkesfag Vg1');
    expect(sokFag(indeks, 'HEA2005')[0]?.ekstra.join(' ')).toContain('HEA2005 Helsefremmende arbeid');
  });

  it('gir ingen treff for tomt eller ukjent søk', () => {
    expect(sokFag(indeks, '')).toEqual([]);
    expect(sokFag(indeks, 'finnesikke')).toEqual([]);
  });
});
