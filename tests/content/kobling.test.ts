// Koblingen fra fagkode til årsramme på de ekte dataene (rules/sfs2213/kobling-fagkode-<periode>.yaml og data/grep/).
// Kjøres også på nye Grep-data hver uke (kilder.yml lager rapporten på nytt først).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { finnKobling, grepPar, koblingskandidater } from '../../src/modules/arbeidstid/beregning/kobling.ts';
import { lagKoblingsrapport, lesKoblingsgrunnlag } from '../../scripts/kobling/rapport.ts';

const rot = fileURLToPath(new URL('../..', import.meta.url));
const { indeks, tabeller, rader, arstimer } = lesKoblingsgrunnlag(rot);
const rapport = readFileSync(join(rot, 'docs/KOBLING.md'), 'utf8');
const { tekst, status } = lagKoblingsrapport(indeks, tabeller, rader, arstimer);

describe('koblingen fra fagkode til årsramme', () => {
  it('docs/KOBLING.md er oppdatert (kjør «npm run kobling:rapport»)', () => {
    expect(rapport).toBe(tekst);
  });

  it('alle fagkoder i videregående i Grep er enten koblet eller står i rapporten over ukoblede', () => {
    const ukoblede = rapport.slice(rapport.indexOf('## Fagkoder som ikke er koblet'));
    const mangler = Object.keys(indeks.fag).filter((k) => finnKobling(k, indeks, tabeller, rader).status === 'ukoblet' && !ukoblede.includes(`- ${k} `));
    expect(mangler).toEqual([]);
    expect(status.antall.koblet + status.antall.flertydig + status.antall.ukoblet).toBe(Object.keys(indeks.fag).length);
  });

  it('ingen fellesfag kobles via prefiksregel', () => {
    const viaRegel = Object.entries(indeks.fag)
      .filter(([, f]) => f.type === 'fellesfag')
      .filter(([k, f]) => koblingskandidater(k, f, grepPar(f, indeks.programomrader), tabeller, rader).some((c) => c.metode === 'regel'));
    expect(viaRegel.map(([k]) => k)).toEqual([]);
    expect(tabeller.regler.every((r) => r.fagtype !== 'fellesfag')).toBe(true);
  });

  it('tabellene motsier ikke vedlegg 1, programnavnene eller Grep', () => {
    expect(status.avvik.filter((a) => a.alvor === 'feil').map((a) => a.tekst)).toEqual([]);
  });

  it('kobler kjente fag til riktig rad i vedlegg 1', () => {
    const rad = (kode: string, valg = {}) => {
      const r = finnKobling(kode, indeks, tabeller, rader, valg);
      return r.status === 'koblet' ? `${r.kandidat.metode} ${r.kandidat.rad.nr} ${r.kandidat.rad.t60}` : r.status;
    };
    expect(rad('NOR1260', { program: 'ST' })).toBe('eksplisitt 99 496');
    expect(rad('NOR1262')).toBe('eksplisitt 64 525');
    expect(rad('KRO1017', { program: 'ST' })).toBe('eksplisitt 6 635');
    expect(rad('KRO1017', { program: 'HS' })).toBe('eksplisitt 9 635');
    expect(rad('HEA2005')).toBe('regel 23 607.5');
    expect(rad('REA3036', { trinn: 'Vg3' })).toBe('eksplisitt 137 496');
    expect(rad('SAM3045')).toBe('flertydig');
    expect(rad('SAM3045', { trinn: 'Vg2' })).toBe('eksplisitt 82 525');
  });
});
