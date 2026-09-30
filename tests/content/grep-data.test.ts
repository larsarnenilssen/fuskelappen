// Dataene fra Grep i data/grep/ (fase 2): fagindeksen og filene per læreplan har riktig form og henger sammen.
// Kjøres også på nye data hver uke før de tas inn (kilder.yml).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { validerFagdata } from '../../scripts/hent-grep.ts';
import { fagindeksSkjema, laereplanSkjema, type Laereplan } from '../../src/modules/fag/skjema.ts';

const rot = fileURLToPath(new URL('../..', import.meta.url));
const mappe = join(rot, 'data/grep/laereplaner');
const indeks = fagindeksSkjema.parse(JSON.parse(readFileSync(join(rot, 'data/grep/fagindeks.json'), 'utf8')));
const planer = new Map(
  readdirSync(mappe)
    .filter((f) => f.endsWith('.json'))
    .map((f) => [f.slice(0, -5), laereplanSkjema.parse(JSON.parse(readFileSync(join(mappe, f), 'utf8'))) as Laereplan]),
);

describe('Grep-dataene', () => {
  it('består valideringen hentingen gjør før den skriver', () => {
    expect(() => validerFagdata(indeks, planer)).not.toThrow();
  });

  it('har en læreplanfil for hver læreplan fagene viser til, og ingen filer til overs', () => {
    const iBruk = new Set(Object.values(indeks.fag).flatMap((f) => (f.lp ? [f.lp] : [])));
    for (const lp of iBruk) expect(existsSync(join(mappe, `${lp}.json`)), lp).toBe(true);
    expect([...planer.keys()].filter((k) => !iBruk.has(k))).toEqual([]);
  });

  it('har kompetansemålsettene fagene viser til, i riktig læreplan', () => {
    const mangler = Object.entries(indeks.fag).filter(([, f]) => f.lp && f.km.some((k) => !planer.get(f.lp as string)?.kompetansemaalsett.some((s) => s.kode === k)));
    // Noen få sett kan mangle i planen i Grep; det skal være unntaket.
    expect(mangler.length, mangler.slice(0, 5).map(([k]) => k).join(', ')).toBeLessThan(20);
  });

  it('har læreplanene på målformen de er fastsatt i (bokmål, nynorsk eller samisk)', () => {
    const spraak = new Set([...planer.values()].map((p) => p.spraak));
    expect([...spraak].every((s) => ['nob', 'nno', 'sme', 'sma', 'smj'].includes(s))).toBe(true);
    expect([...planer.values()].filter((p) => p.spraak === 'nno').length).toBeGreaterThan(20);
  });

  it('peker bare på kjente programområder, og programområdene på kjente utdanningsprogram', () => {
    for (const f of Object.values(indeks.fag)) for (const p of f.po) expect(indeks.programomrader[p], p).toBeDefined();
    for (const [k, p] of Object.entries(indeks.programomrader)) expect(indeks.utdanningsprogram[p.program], k).toBeDefined();
  });
});
