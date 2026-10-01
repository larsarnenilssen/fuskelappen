// Fag- og timefordelingen fra rundskrivet Udir-1 i data/udir/ (avgjørelse 024).
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { fagfordelingSkjema, type Fagfordeling, type Fordelingstabell } from '../../src/modules/fag/tilbud/skjema.ts';

const rot = fileURLToPath(new URL('../..', import.meta.url));
const filer = readdirSync(join(rot, 'data/udir')).filter((f) => /^fagfordeling-\d{4}-\d{4}\.json$/.test(f));

describe('fag- og timefordelingen', () => {
  it('finnes for minst ett skoleår, og hver fil har riktig form og skoleår i navnet', () => {
    expect(filer.length).toBeGreaterThan(0);
    for (const f of filer) {
      const data = fagfordelingSkjema.parse(JSON.parse(readFileSync(join(rot, 'data/udir', f), 'utf8')));
      expect(f).toBe(`fagfordeling-${data.skolear}.json`);
      expect(data.tabeller.filter((t) => t.type === 'fordeling').length).toBeGreaterThanOrEqual(20);
    }
  });

  it('har tabellene for studieforberedende og yrkesfaglige program og påbygging', () => {
    const data = JSON.parse(readFileSync(join(rot, 'data/udir', filer[0] as string), 'utf8')) as Fagfordeling;
    const nr = new Set(data.tabeller.map((t) => t.nr));
    for (const n of ['4', '7', '9', '13', '15', '17a', '18', '19d', '21', '26']) expect(nr.has(n), `tabell ${n}`).toBe(true);
    const yf = data.tabeller.find((t): t is Fordelingstabell => t.type === 'fordeling' && t.nr === '17a' && t.omfang.toLowerCase() === 'vg1');
    expect(yf?.rader.find((r) => r.linje === 'Totalt omfang')?.timer[0]).toBe(981);
  });
});
