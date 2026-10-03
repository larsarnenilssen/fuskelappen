// Lenkene til begrepsbanken i teksten i content/ (avgjørelse 050). Nye begreper lenkes automatisk når tittelen er
// ordet som står i teksten. Ellers må begrepet ha `lenkeord`, eller `lenkeord: { nb: [], nn: [] }` for å ikke lenkes.
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { lesInnhold } from '../../scripts/innhold/alt.ts';
import { filtype, lesBegrepsord, lesFil } from '../../scripts/innhold/last.ts';
import { enkelTittel, monsterFor } from '../../src/core/innhold/begrepslenker.ts';
import type { Innholdselement } from '../../src/core/innhold/skjema.ts';

const rot = join(__dirname, '../..');
const alle = lesInnhold(rot).map((x) => x.element);
const begreper = alle.filter((e) => e.type === 'begrep');
const fylkeFor = (e: Innholdselement) => (e.gyldighet.niva === 'nasjonal' ? null : e.gyldighet.fylke);
const begrepFylke = new Map(begreper.map((b) => [b.id, fylkeFor(b)]));

const yamlFiler = (m: string): string[] =>
  readdirSync(m).flatMap((f) => {
    const s = join(m, f);
    return statSync(s).isDirectory() ? yamlFiler(s) : f.endsWith('.yaml') ? [s] : [];
  });
const html = yamlFiler(join(rot, 'content'))
  .filter((f) => filtype(relative(rot, f)) === 'innhold')
  .flatMap((f) => lesFil(rot, f) as Innholdselement[]);

describe('lenkeord', () => {
  it('bare begreper har lenkeord', () => {
    for (const e of alle) if (e.lenkeord) expect(e.type, e.id).toBe('begrep');
  });

  it('et begrep uten enkel tittel har lenkeord, så nye begreper får lenker eller er valgt bort', () => {
    for (const b of begreper) for (const m of ['nb', 'nn'] as const) if (!enkelTittel(b.tittel[m])) expect(b.lenkeord, `${b.id} (${m}): «${b.tittel[m]}»`).toBeDefined();
  });

  it('to begreper har ikke samme lenkeord', () => {
    for (const m of ['nb', 'nn'] as const) {
      const sett = new Map<string, string>();
      for (const b of lesBegrepsord(rot))
        for (const o of b.ord[m]) {
          expect(sett.get(o.toLowerCase()), `«${o}» (${m}) i ${b.id}`).toBeUndefined();
          sett.set(o.toLowerCase(), b.id);
        }
    }
  });

  it('hvert lenkeord treffer seg selv', () => {
    for (const b of lesBegrepsord(rot)) for (const o of [...b.ord.nb, ...b.ord.nn]) expect(monsterFor(o).test(o), `${b.id}: ${o}`).toBe(true);
  });
});

describe('lenkene i teksten', () => {
  const lenker = html.flatMap((e) =>
    [e.tekst.nb, e.tekst.nn, ...(e.type === 'steg' && e.forklaring ? [e.forklaring.nb, e.forklaring.nn] : [])].flatMap((h) =>
      [...h.matchAll(/<a class="begrepslenke" href="#\/begreper\/([a-z0-9-]+)">/g)].map((m) => ({ fra: e, til: m[1] ?? '' })),
    ),
  );

  it('det finnes lenker', () => expect(lenker.length).toBeGreaterThan(200));

  it('alle går til begreper som finnes, og ikke til begrepet selv', () => {
    for (const l of lenker) {
      expect(begrepFylke.has(l.til), `${l.fra.id} → ${l.til}`).toBe(true);
      expect(l.til, l.fra.id).not.toBe(l.fra.id);
    }
  });

  it('fylkesbegreper lenkes bare fra tekst for samme fylke', () => {
    for (const l of lenker) {
      const fylke = begrepFylke.get(l.til);
      if (fylke) expect(fylkeFor(l.fra), `${l.fra.id} → ${l.til}`).toBe(fylke);
    }
  });

  it('hvert begrep lenkes høyst én gang per tekst', () => {
    for (const e of html)
      for (const h of [e.tekst.nb, e.tekst.nn]) {
        const ider = [...h.matchAll(/class="begrepslenke" href="#\/begreper\/([a-z0-9-]+)"/g)].map((m) => m[1]);
        expect(new Set(ider).size, e.id).toBe(ider.length);
      }
  });
});
