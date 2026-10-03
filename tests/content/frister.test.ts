// Fristene i content/ (avgjørelse 046): paragrafene finnes i Regelverk, gruppene er de filtrene tidslinjen kjenner, og
// fylkets frister supplerer de nasjonale.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { lesInnhold } from '../../scripts/innhold/alt.ts';
import type { Frist } from '../../src/core/innhold/skjema.ts';
import { alleParagrafer, type Lovdokument, paragraftekst } from '../../src/modules/lov/typer.ts';
import { normaliserTekst } from '../../src/core/kontroll/tekst.ts';
import { FILTRE } from '../../src/modules/inntak/tidslinje.ts';

const rot = join(__dirname, '../..');
const frister = lesInnhold(rot)
  .map((x) => x.element)
  .filter((e): e is Frist => e.type === 'frist');
const inntak = frister.filter((f) => f.modul === 'inntak');

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

describe('frister', () => {
  it('paragrafene finnes i Regelverk', () => {
    for (const f of frister) for (const p of f.paragrafer) expect(finnes(p), `${f.id}: ${p}`).toBe(true);
  });

  it('fristene for inntak har grupper som tidslinjen kan filtrere på', () => {
    expect(inntak.length).toBeGreaterThan(0);
    for (const f of inntak) for (const g of f.grupper) expect(FILTRE.filter((x) => x !== 'alle'), `${f.id}: ${g}`).toContain(g);
  });

  it('fylkets frister for inntak supplerer de nasjonale og har egne id-er', () => {
    const lokale = inntak.filter((f) => f.gyldighet.niva !== 'nasjonal');
    expect(lokale.length).toBeGreaterThan(0);
    for (const f of lokale) expect(f.gyldighet, f.id).toMatchObject({ niva: 'fylke', forhold: 'supplerer' });
    expect(new Set(inntak.map((f) => f.id)).size).toBe(inntak.length);
  });
});

describe('fristdatoene står i paragrafene', () => {
  const MANEDER = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'];
  const tekster = new Map<string, string>();
  for (const fil of readdirSync(join(rot, 'data/lovdata')).filter((f) => f.endsWith('.json'))) {
    const dok = JSON.parse(readFileSync(join(rot, 'data/lovdata', fil), 'utf8')) as Partial<Lovdokument>;
    // Oversiktsfilen har ingen paragrafer.
    if (!dok.seksjoner) continue;
    for (const { paragraf } of alleParagrafer(dok.seksjoner)) tekster.set(`${dok.id}/${paragraf.nr}`, normaliserTekst(paragraftekst(paragraf)));
  }

  // Bare frister med fast dato og uten tidspunkt med ord. Datoen må stå i en av paragrafene fristen viser til, så en
  // endring i lov eller forskrift (hentes hver uke) gir en feilende test i stedet for en gammel dato i appen.
  const medDato = frister.filter((f) => f.regel?.type === 'arlig' && !f.naar && f.paragrafer.length > 0);
  it('det finnes frister å sjekke', () => expect(medDato.length).toBeGreaterThan(0));
  for (const f of medDato) {
    it(f.id, () => {
      const r = f.regel as { dag: number; maned: number };
      const dato = `${r.dag}. ${MANEDER[r.maned - 1]}`;
      expect(f.paragrafer.some((p) => (tekster.get(p) ?? '').includes(dato)), `${dato} i ${f.paragrafer.join(', ')}`).toBe(true);
    });
  }
});
