// Regelperiodene (avgjørelse 097). En ny nasjonal periode for et regelverk, f.eks. SFS 2213 fra 1.1.2028, må ha alle
// nøklene den gjeldende perioden har og koden henter med hentVerdi(). Ellers får brukeren en teknisk feil som «Fant
// ikke … i …» når perioden begynner å gjelde. Testen leser bare regelsettene og endrer ingen verdier.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { lesRegelsett } from '../../scripts/innhold/alt.ts';
import { lesFil } from '../../scripts/innhold/last.ts';
import type { Regelsett } from '../../src/core/regler/skjema.ts';
import { nb } from '../../src/strings/nb.ts';

const rot = join(__dirname, '../..');
const regelsett = lesRegelsett(rot);

/**
 * Nøklene som mangler i hver nasjonale periode, sammenlignet med de andre periodene for samme regelverk. Alle periodene
 * skal ha de samme nøklene. Gir «periode: nøkkel» for hver nøkkel som mangler.
 */
function manglerIPerioder(alle: readonly Regelsett[]): string[] {
  const nasjonale = alle.filter((r) => r.gyldighet.niva === 'nasjonal');
  const feil: string[] = [];
  for (const regelverk of new Set(nasjonale.map((r) => r.regelverk))) {
    const perioder = nasjonale.filter((r) => r.regelverk === regelverk);
    const alleNokler = new Set(perioder.flatMap((r) => Object.keys(r.verdier)));
    for (const p of perioder) for (const n of alleNokler) if (!(n in p.verdier)) feil.push(`${p.id}: ${n}`);
  }
  return feil.sort();
}

function kodefiler(mappe: string): string[] {
  return readdirSync(mappe).flatMap((navn) => {
    const sti = join(mappe, navn);
    if (statSync(sti).isDirectory()) return kodefiler(sti);
    return /\.tsx?$/.test(navn) && !navn.endsWith('.d.ts') ? [sti] : [];
  });
}

/** Om nøkkelen er en tekst i src/strings (f.eks. «inntak.tittel»), ikke en regelverdi. */
function erTekstnokkel(nokkel: string): boolean {
  let node: unknown = nb;
  for (const del of nokkel.split('.')) {
    if (typeof node !== 'object' || node === null || !(del in node)) return false;
    node = (node as Record<string, unknown>)[del];
  }
  return true;
}

/** Nøkler koden bygger selv, og som derfor ikke står som tekst i koden: `sfs2213.${nokkel}` i kobling.ts. */
const BYGDE_NOKLER = ['sfs2213.kobling_fellesfag', 'sfs2213.kobling_programfag'];

/**
 * Regelnøklene koden henter: tekster i anførselstegn på formen «regelverk.verdi» for regelverkene i rules/, som ikke er
 * en tekst i src/strings. Prefikser som «inntak.tilleggspoeng_» gjelder lokale verdier som supplerer, og tas ikke med.
 */
function noklerIKoden(regelverk: ReadonlySet<string>): Map<string, string[]> {
  const funnet = new Map<string, string[]>();
  const leggTil = (nokkel: string, fil: string) => funnet.set(nokkel, [...(funnet.get(nokkel) ?? []), fil]);
  for (const fil of kodefiler(join(rot, 'src'))) {
    const tekst = readFileSync(fil, 'utf8');
    for (const [, nokkel, verk] of tekst.matchAll(/['"`](([a-z0-9]+)\.[a-z0-9_]+)['"`]/g)) {
      if (!nokkel || !verk || !regelverk.has(verk) || nokkel.endsWith('_') || erTekstnokkel(nokkel)) continue;
      leggTil(nokkel, relative(rot, fil));
    }
  }
  for (const nokkel of BYGDE_NOKLER) leggTil(nokkel, 'src/modules/arbeidstid/beregning/kobling.ts');
  return funnet;
}

describe('regelperiodene', () => {
  const nasjonale = regelsett.filter((r) => r.gyldighet.niva === 'nasjonal');
  const regelverk = new Set(nasjonale.map((r) => r.regelverk));

  it('hver nasjonal periode for samme regelverk har de samme nøklene', () => {
    expect(manglerIPerioder(regelsett), 'Legg nøkkelen inn i perioden, eller fjern den fra de andre').toEqual([]);
  });

  it('finner en nøkkel som mangler i en ny periode (testregelsettene)', () => {
    const fixtures = ['testregelverk-2026-2027.yaml', 'testregelverk-2028.yaml'].map((f) => lesFil(rot, join(rot, 'tests/fixtures/regler', f)) as Regelsett);
    expect(manglerIPerioder(fixtures)).toEqual(['testregelverk-2028: regler']);
  });

  it('nøklene koden henter med hentVerdi(), finnes i hver nasjonal periode', () => {
    const nokler = noklerIKoden(regelverk);
    // Sikrer at søket i koden virker: koden henter om lag 45 regelnøkler.
    expect(nokler.size).toBeGreaterThan(30);
    for (const verk of ['sfs2213', 'hta', 'inntak', 'vurdering']) expect([...nokler.keys()].some((n) => n.startsWith(`${verk}.`)), verk).toBe(true);
    const mangler: string[] = [];
    for (const [nokkel, filer] of nokler) {
      const [verk = '', navn = ''] = nokkel.split('.');
      for (const p of nasjonale.filter((r) => r.regelverk === verk)) {
        if (!(navn in p.verdier)) mangler.push(`${p.id}: ${navn} (brukt i ${[...new Set(filer)].join(', ')})`);
      }
    }
    expect(mangler).toEqual([]);
  });
});
