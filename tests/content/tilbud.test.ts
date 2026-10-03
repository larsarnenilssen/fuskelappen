// Tilbudsstrukturen på de ekte dataene (data/grep/ og data/udir/), avgjørelse 024. Testene sjekker egenskaper
// som skal gjelde uansett skoleår, så de fanger opp når Grep eller rundskrivet endres på en måte modellen ikke tåler.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { byggStruktur, byggTilbud, erVariant, opphentingsfag } from '../../src/modules/fag/tilbud/modell.ts';
import { lesTilbudsindeks } from '../../scripts/data/les.ts';
import { fordelingOgNeste, lagRapportFraRepo, lesFagBygger, uenigheterFraRepo } from '../../scripts/tilbud/rapport.ts';
import { lesLopskilder } from '../../scripts/data/les.ts';
import { manglerI } from '../../src/modules/fag/tilbud/kildesamsvar.ts';
import { utdanningslopSkjema } from '../../src/modules/fag/utdanning/skjema.ts';

const rot = fileURLToPath(new URL('../..', import.meta.url));
// Som appen: Grep, med grunnlaget for inntak fra VIGO for påbygging (medGrunnlagFraVigo).
const indeks = lesTilbudsindeks(rot);
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

  it('lærefagene kan føre videre til Vg4 påbygging, fra grunnlaget for inntak i VIGO (eier 03.10.2026)', () => {
    const vg4 = Object.keys(indeks.programomrader).find((k) => k.startsWith('PBPBY4') && indeks.programomrader[k]?.byggerFraVigo);
    expect(vg4).toBeDefined();
    const laerefag = tilbud.filter((t) => t.programomrade.sted === 'bedrift' && !t.variant);
    const medVg4 = laerefag.filter((t) => t.pabygging.includes(vg4 ?? ''));
    expect(medVg4.length / laerefag.length).toBeGreaterThan(0.5);
    for (const t of medVg4) expect(t.fraVigo, t.kode).toBe(true);
  });

  it('Vg1 studiespesialisering viser Vg2 på yrkesfag med opphentingsfaget for seg, ikke som kryssløp (eier 03.10.2026)', () => {
    expect(opphentingsfag(indeks).length).toBeGreaterThan(0);
    const st = tilbud.find((t) => t.kode === 'STUSP1----');
    expect(st?.opphenting.til.length).toBeGreaterThan(20);
    expect(st?.kryssTil.filter((k) => indeks.programomrader[k]?.trinn === 'Vg2' && !['ST', 'PB'].includes(indeks.programomrader[k]?.program ?? ''))).toEqual([]);
  });

  it('data/status/lopsamsvar.json er oppdatert (kjør «npm run tilbud:rapport»)', () => {
    expect(JSON.parse(readFileSync(join(rot, 'data/status/lopsamsvar.json'), 'utf8')).uenige).toEqual(uenigheterFraRepo(rot));
  });

  it('løpene fra utdanning.no er gyldige, og kildesamsvaret gir det eier har sett (avgjørelse 052)', () => {
    const k = lesLopskilder(rot);
    expect(utdanningslopSkjema.safeParse(k.utdanning).success).toBe(true);
    // Vg4 påbygging etter lærefag: VIGO og utdanning.no er enige, Grep sier ikke noe.
    expect(manglerI('HSHEA3----', 'PBPBY4----', k)).toEqual([]);
    // Et kryssløp bare Grep har (03.10.2026).
    expect(manglerI('BAKEM2----', 'BARLF3----', k)).toEqual(['vigo', 'utdanning']);
  });
});
