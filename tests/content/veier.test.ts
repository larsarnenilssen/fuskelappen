// Veiene for lærlinger og kandidater (fase 6, pakke 6, avgjørelse 069) testes som veiviserne: alle veier kan nås fra
// et utgangspunkt, alle overganger peker på en vei eller side som finnes, og ingen overgang mangler kilde. Kildene
// finnes i kilderegisteret, og paragrafene i lov og forskrift finnes i Regelverk.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { lesInnhold } from '../../scripts/innhold/alt.ts';
import type { KildeRef, Kilderegister, Utgangspunktelement, Veielement } from '../../src/core/innhold/skjema.ts';
import { alleParagrafer, type Lovdokument } from '../../src/modules/lov/typer.ts';

const rot = join(__dirname, '../..');
const alle = lesInnhold(rot).map((x) => x.element);
const veier = alle.filter((e): e is Veielement => e.type === 'vei');
const utgangspunkter = alle.filter((e): e is Utgangspunktelement => e.type === 'utgangspunkt');
const begreper = new Set(alle.filter((e) => e.type === 'begrep').map((e) => e.id));
const register = parse(readFileSync(join(rot, 'content/kilder.yaml'), 'utf8')) as Kilderegister;
const kilder = new Set(register.kilder.map((k) => k.id));

/** Sidene stegene og overgangene kan lenke til, utenom begrepene. */
const SIDER = ['/inntak', '/opplaeringslop/lop', '/opplaeringslop/PB', '/opplaeringslop/laerlinger-og-kandidater', '/vurdering/fag-og-svenneproven'];

const paragrafer = new Map<string, Set<string>>();
function paragrafFinnes(dok: string, nr: string): boolean {
  if (!paragrafer.has(dok)) {
    const d = JSON.parse(readFileSync(join(rot, 'data/lovdata', `${dok}.json`), 'utf8')) as Lovdokument;
    paragrafer.set(dok, new Set(alleParagrafer(d.seksjoner).map((p) => p.paragraf.nr)));
  }
  return paragrafer.get(dok)?.has(nr) ?? false;
}

function kildefeil(k: KildeRef): string | null {
  if (!kilder.has(k.id)) return `${k.id} finnes ikke i kilderegisteret`;
  if (!k.punkt) return `${k.id} mangler punkt`;
  if (k.id === 'opplaeringslova' || k.id === 'opplaeringsforskrifta') {
    const nr = /^§ (\S+)/.exec(k.punkt)?.[1];
    if (!nr || !paragrafFinnes(k.id, nr)) return `${k.id} ${k.punkt} finnes ikke`;
  }
  return null;
}

function ruteFinnes(rute: string): boolean {
  if (rute.startsWith('/begreper/')) return begreper.has(rute.slice('/begreper/'.length));
  return SIDER.includes(rute);
}

describe('veiene for lærlinger og kandidater', () => {
  it('finnes: veier til alle tre målene og utgangspunkter', () => {
    expect(new Set(veier.map((v) => v.mal))).toEqual(new Set(['fagbrev', 'praksisbrev', 'kompetansebevis']));
    expect(utgangspunkter.length).toBeGreaterThan(0);
  });

  it('alle veier kan nås: hver vei er målet for minst én overgang', () => {
    const naas = new Set(utgangspunkter.flatMap((u) => u.overganger.flatMap((o) => (o.til ? [o.til] : []))));
    expect(veier.filter((v) => !naas.has(v.id)).map((v) => v.id)).toEqual([]);
  });

  it('alle overganger peker på en vei eller en side som finnes', () => {
    const ider = new Set(veier.map((v) => v.id));
    const feil = utgangspunkter.flatMap((u) => u.overganger.flatMap((o) => (o.til && !ider.has(o.til) ? [`${u.id} → ${o.til}`] : o.side && !ruteFinnes(o.side.rute) ? [`${u.id} → ${o.side.rute}`] : [])));
    expect(feil).toEqual([]);
  });

  it('veien videre fra hver vei er et utgangspunkt som finnes', () => {
    const ider = new Set(utgangspunkter.map((u) => u.id));
    expect(veier.filter((v) => !ider.has(v.etter)).map((v) => `${v.id} → ${v.etter}`)).toEqual([]);
  });

  it('ingen overgang mangler kilde, og kildene finnes med punkt', () => {
    const feil = utgangspunkter.flatMap((u) =>
      u.overganger.flatMap((o, i) => (o.kilder.length === 0 ? [`${u.id} overgang ${i + 1} har ingen kilde`] : o.kilder.flatMap((k) => kildefeil(k) ?? []).map((f) => `${u.id} overgang ${i + 1}: ${f}`))),
    );
    expect(feil).toEqual([]);
  });

  it('kildene til veiene og utgangspunktene finnes med punkt', () => {
    const feil = [...veier, ...utgangspunkter].flatMap((e) => e.kilder.flatMap((k) => kildefeil(k) ?? []).map((f) => `${e.id}: ${f}`));
    expect(feil).toEqual([]);
  });

  it('utgangspunktet har med kildene til alle overgangene sine', () => {
    const nokkel = (k: KildeRef) => `${k.id}|${k.punkt ?? ''}`;
    const feil = utgangspunkter.flatMap((u) => {
      const egne = new Set(u.kilder.map(nokkel));
      return u.overganger.flatMap((o) => o.kilder.filter((k) => !egne.has(nokkel(k))).map((k) => `${u.id}: ${nokkel(k)}`));
    });
    expect(feil).toEqual([]);
  });

  it('stegene lenker til sider og begreper som finnes, og veien ender i en prøve', () => {
    const feil = veier.flatMap((v) => v.steg.filter((s) => !ruteFinnes(s.rute)).map((s) => `${v.id}: ${s.rute}`));
    expect(feil).toEqual([]);
    expect(veier.filter((v) => v.steg.at(-1)?.del !== 'prove').map((v) => v.id)).toEqual([]);
  });

  it('veiene og utgangspunktene har unike plasser i rekkefølgen', () => {
    for (const liste of [veier, utgangspunkter]) {
      const plasser = liste.map((e) => e.rekkefolge);
      expect(new Set(plasser).size).toBe(plasser.length);
    }
  });
});
