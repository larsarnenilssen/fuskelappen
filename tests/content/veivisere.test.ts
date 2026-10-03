// Veiviserne i content/ (avgjørelse 041): kartet henger sammen, stegene hører til en veiviser som finnes, fasene
// finnes, paragrafene finnes i Regelverk, og læreplanene finnes i Grep og stemmer med vurderingsordningen.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { lesInnhold } from '../../scripts/innhold/alt.ts';
import type { Stegelement, Veiviserelement } from '../../src/core/innhold/skjema.ts';
import { finnFeil, lagKart } from '../../src/core/veiviser/veiviser.ts';
import type { Fagindeks } from '../../src/modules/fag/skjema.ts';
import { alleParagrafer, type Lovdokument } from '../../src/modules/lov/typer.ts';

const rot = join(__dirname, '../..');
const alle = lesInnhold(rot).map((x) => x.element);
const veivisere = alle.filter((e): e is Veiviserelement => e.type === 'veiviser');
const steg = alle.filter((e): e is Stegelement => e.type === 'steg');

const paragrafer = new Map<string, Set<string>>();
function finnes(ref: string): boolean {
  const [dok = '', nr = ''] = ref.split('/');
  if (!paragrafer.has(dok)) {
    try {
      const d = JSON.parse(readFileSync(join(rot, 'data/lovdata', `${dok}.json`), 'utf8')) as Lovdokument;
      paragrafer.set(dok, new Set(alleParagrafer(d.seksjoner).map((p) => p.paragraf.nr)));
    } catch {
      paragrafer.set(dok, new Set());
    }
  }
  return paragrafer.get(dok)?.has(nr) ?? false;
}

const fagindeks = JSON.parse(readFileSync(join(rot, 'data/grep/fagindeks.json'), 'utf8')) as Fagindeks;

describe('veivisere', () => {
  it('det finnes minst én veiviser', () => {
    expect(veivisere.length).toBeGreaterThan(0);
  });

  it('hvert steg hører til en veiviser som finnes', () => {
    const ider = new Set(veivisere.map((v) => v.id));
    for (const s of steg) expect(ider.has(s.veiviser), `${s.id} → ${s.veiviser}`).toBe(true);
  });

  for (const v of veivisere) {
    describe(v.id, () => {
      const egne = steg.filter((s) => s.veiviser === v.id && s.gyldighet.niva === 'nasjonal');

      it('kartet henger sammen: alle steg kan nås, ingen peker på steg som ikke finnes, ingen løkker uten spørsmål', () => {
        expect(finnFeil(lagKart(v.start, egne))).toEqual([]);
      });

      it('stegene bruker fasene i veiviseren', () => {
        const faser = new Set(v.faser.map((f) => f.id));
        for (const s of egne) if (s.fase) expect(faser.has(s.fase), `${s.id}: ${s.fase}`).toBe(true);
      });

      it('paragrafene finnes i Regelverk', () => {
        for (const s of egne) for (const p of s.paragrafer) expect(finnes(p), `${s.id}: ${p}`).toBe(true);
      });

      // «Kompetansegivende» i innholdet skal stemme med Grep: læreplanen har fag med tallkarakter for elevene. Endrer
      // Grep vurderingsordningen, feiler testen, og innholdet må kontrolleres på nytt.
      it('læreplanene finnes i Grep, og kompetansegivende stemmer med vurderingsuttrykket', () => {
        for (const s of egne) {
          for (const lp of s.laereplaner) {
            const fag = Object.values(fagindeks.fag).filter((f) => f.lp === lp.kode);
            expect(fag.length, `${s.id}: ${lp.kode} har ingen fag i fagindeksen`).toBeGreaterThan(0);
            const karakter = fag.some((f) => f.elev?.uttrykk === 'vurderingsuttrykk_tall');
            expect(karakter, `${s.id}: ${lp.kode}`).toBe(lp.kompetansegivende);
          }
        }
      });
    });
  }
});
