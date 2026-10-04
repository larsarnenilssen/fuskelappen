// Veiviserne i content/ (avgjørelse 041): kartet henger sammen, stegene hører til en veiviser som finnes, fasene
// finnes, paragrafene finnes i Regelverk, og læreplanene finnes i Grep og stemmer med vurderingsordningen.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { lesInnhold } from '../../scripts/innhold/alt.ts';
import type { Stegelement, Veiviserelement } from '../../src/core/innhold/skjema.ts';
import { finnFeil, finnVei, lagKart, lesSvar } from '../../src/core/veiviser/veiviser.ts';
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

  it('lenker i teksten til et steg i en veiviser har svarene på veien dit, så lenken passer (fase 6)', () => {
    const lenke = /#\/[a-z-]+\/([a-z0-9-]+)\?steg=([a-z0-9-]+)(?:&(?:amp;)?svar=([a-z0-9.-]+))?/g;
    for (const e of alle) {
      const tekster = [e.tekst.nb, e.tekst.nn, ...(e.type === 'steg' && e.forklaring ? [e.forklaring.nb, e.forklaring.nn] : [])];
      for (const tekst of tekster) {
        for (const [, veiviserId = '', stegId = '', svar = ''] of tekst.matchAll(lenke)) {
          const v = veivisere.find((x) => x.id === veiviserId);
          expect(v, `${e.id}: veiviseren ${veiviserId}`).toBeDefined();
          if (!v) continue;
          const kart = lagKart(v.start, steg.filter((s) => s.veiviser === v.id));
          const vei = finnVei(kart, lesSvar(svar), stegId);
          expect(vei.korrigert, `${e.id}: ${veiviserId}?steg=${stegId}&svar=${svar}`).toBe(false);
          expect(vei.gjeldende).toBe(stegId);
        }
      }
    }
  });
  it('det finnes minst én veiviser', () => {
    expect(veivisere.length).toBeGreaterThan(0);
  });

  it('hvert steg hører til en veiviser som finnes', () => {
    const ider = new Set(veivisere.map((v) => v.id));
    for (const s of steg) expect(ider.has(s.veiviser), `${s.id} → ${s.veiviser}`).toBe(true);
  });

  it('hver veiviser har sin egen farge og sin egen plass på oversikten (avgjørelse 042)', () => {
    expect(new Set(veivisere.map((v) => v.farge)).size).toBe(veivisere.length);
    expect(new Set(veivisere.map((v) => v.rekkefolge)).size).toBe(veivisere.length);
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
            // Uten merke (GNS02-01, eier 03.10.2026) skal læreplanen heller ikke gi tallkarakter.
            expect(karakter, `${s.id}: ${lp.kode}`).toBe(lp.kompetansegivende ?? false);
          }
        }
      });

      // Lokale steg som supplerer et nasjonalt steg, vises som en boks i det steget (fase 5). De er ikke selv steg på
      // veien, så de kan ikke ha spørsmål eller neste steg.
      it('lokale steg som supplerer, hører til et nasjonalt steg og har paragrafer som finnes', () => {
        const lokale = steg.filter((s) => s.veiviser === v.id && s.gyldighet.niva !== 'nasjonal');
        const nasjonale = new Set(egne.map((s) => s.id));
        for (const s of lokale) {
          expect(s.gyldighet.niva !== 'nasjonal' && s.gyldighet.forhold, s.id).toBe('supplerer');
          expect(nasjonale.has(s.id), `${s.id} supplerer et steg som ikke finnes`).toBe(true);
          expect(s.neste === undefined && s.sporsmal === undefined, `${s.id} har neste eller spørsmål`).toBe(true);
          for (const p of s.paragrafer) expect(finnes(p), `${s.id}: ${p}`).toBe(true);
        }
      });
    });
  }

  // Lenker i teksten til et steg i en veiviser, f.eks. fra inntak til særskilt språkopplæring, skal føre fram til
  // steget uten at adressen må rettes.
  it('lenker til steg i en veiviser fører fram til steget', () => {
    const lenke = /\(#\/[a-z]+\/([a-z0-9-]+)\?steg=([a-z0-9-]+)&svar=([a-z0-9.-]*)\)/g;
    let antall = 0;
    for (const e of alle) {
      const tekster = [e.tekst.nb, e.tekst.nn, ...('forklaring' in e && e.forklaring ? [e.forklaring.nb, e.forklaring.nn] : [])];
      for (const tekst of tekster) {
        for (const [, vid = '', stegId = '', svar = ''] of tekst.matchAll(lenke)) {
          antall++;
          const vv = veivisere.find((x) => x.id === vid);
          expect(vv, `${e.id}: veiviseren ${vid} finnes ikke`).toBeDefined();
          if (!vv) continue;
          const kart = lagKart(vv.start, steg.filter((s) => s.veiviser === vid && s.gyldighet.niva === 'nasjonal'));
          const vei = finnVei(kart, lesSvar(svar), stegId);
          expect({ steg: vei.gjeldende, korrigert: vei.korrigert }, `${e.id} → ${vid}/${stegId}`).toEqual({ steg: stegId, korrigert: false });
        }
      }
    }
    expect(antall).toBeGreaterThan(0);
  });
});
