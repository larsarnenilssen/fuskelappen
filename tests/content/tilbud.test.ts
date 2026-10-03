// Tilbudsstrukturen på de ekte dataene (data/grep/ og data/udir/), avgjørelse 024. Testene sjekker egenskaper
// som skal gjelde uansett skoleår, så de fanger opp når Grep eller rundskrivet endres på en måte modellen ikke tåler.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import type { Fagindeks } from '../../src/modules/fag/skjema.ts';
import { byggStruktur, byggTilbud, erVariant } from '../../src/modules/fag/tilbud/modell.ts';
import { fordelingOgNeste, lagRapportFraRepo, lesFagBygger } from '../../scripts/tilbud/rapport.ts';

const rot = fileURLToPath(new URL('../..', import.meta.url));
const indeks = JSON.parse(readFileSync(join(rot, 'data/grep/fagindeks.json'), 'utf8')) as Fagindeks;
const { fordeling } = fordelingOgNeste(rot, new Date().toISOString().slice(0, 10));
const tilbud = Object.keys(indeks.programomrader).map((k) => byggTilbud(k, indeks, fordeling, lesFagBygger(rot)));
const hoved = tilbud.filter((t) => !t.variant);

describe('tilbudsstrukturen', () => {
  it('docs/TILBUDSSTRUKTUR.md er oppdatert (kjør «npm run tilbud:rapport»)', () => {
    expect(readFileSync(join(rot, 'docs/TILBUDSSTRUKTUR.md'), 'utf8')).toBe(lagRapportFraRepo(rot));
  });

  it('hvert programområde i skole med tabell har en sum som stemmer med rundskrivet', () => {
    const feil = hoved.filter((t) => t.tabell && t.sum !== t.totalt).map((t) => `${t.kode}: ${t.sum} ≠ ${t.totalt}`);
    expect(feil).toEqual([]);
  });

  it('nesten alle programområder i skole finner en tabell i rundskrivet', () => {
    const iSkole = hoved.filter((t) => t.programomrade.sted === 'skole');
    expect(iSkole.filter((t) => t.tabell).length / iSkole.length).toBeGreaterThan(0.95);
  });

  it('alle linjer i rundskrivet blir gjenkjent', () => {
    expect(tilbud.flatMap((t) => t.avvik.filter((a) => a.type === 'ukjentLinje'))).toEqual([]);
  });

  it('yrkesfaglig fordypning er en obligatorisk plass med en anbefalt kode på vg1 og vg2 i yrkesfag', () => {
    const yf = hoved.filter((t) => t.gruppe === 'yrkesfaglig' && t.tabell && ['Vg1', 'Vg2'].includes(t.programomrade.trinn));
    expect(yf.length).toBeGreaterThan(40);
    for (const t of yf) {
      const yff = t.deler.find((d) => d.type === 'plass' && d.kategori === 'yff');
      expect(yff, t.kode).toBeDefined();
      expect(yff?.type === 'plass' && yff.anbefalt, t.kode).toBeTruthy();
    }
  });

  it('ingen fagkode er både ordinær og alternativ i samme tilbud', () => {
    for (const t of tilbud) {
      const ordinare = new Set(t.deler.flatMap((d) => (d.type === 'fag' ? d.koder : [])));
      const alternativer = [...t.alternativer, ...t.deler.flatMap((d) => (d.type === 'fag' ? d.alternativer : []))];
      expect(alternativer.filter((k) => ordinare.has(k)), t.kode).toEqual([]);
    }
  });

  it('har inngang i alle utdanningsprogram, og kryssløp er aldri hovedløpet', () => {
    for (const s of byggStruktur(indeks)) {
      expect(s.inngang.filter((k) => !erVariant(k)).length, s.program).toBeGreaterThan(0);
      for (const k of s.inngang) expect(indeks.programomrader[k]?.program).toBe(s.program);
    }
    for (const t of tilbud) for (const k of t.videre) expect(indeks.programomrader[k]?.program).toBe(t.programomrade.program);
  });
});
