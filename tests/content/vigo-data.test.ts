// Dataene fra VIGO Kodeverksbase i data/vigo/ (avgjørelse 026): form, omfang og sammenheng med fagindeksen.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import type { Fagindeks } from '../../src/modules/fag/skjema.ts';
import { gjeldendeKoder } from '../../src/modules/fag/vigo/oppslag.ts';
import { fagrelasjonerSkjema, merknaderSkjema } from '../../src/modules/fag/vigo/skjema.ts';
import { validerVigo } from '../../scripts/vigo/bygg.ts';

const rot = fileURLToPath(new URL('../..', import.meta.url));
const les = (f: string) => JSON.parse(readFileSync(join(rot, f), 'utf8')) as unknown;
const rel = fagrelasjonerSkjema.parse(les('data/vigo/fagrelasjoner.json'));
const m = merknaderSkjema.parse(les('data/vigo/merknader.json'));
const indeks = les('data/grep/fagindeks.json') as Fagindeks;

describe('dataene fra VIGO Kodeverksbase', () => {
  it('har riktig form og omfang', () => {
    expect(validerVigo(rel, m)).toEqual([]);
  });

  it('har ingen utgåtte koder som fortsatt finnes i fagindeksen fra Grep', () => {
    // En kode som er erstattet, skal ikke være i bruk i Grep. Skjer det, er dataene ute av takt.
    const iBruk = Object.keys(rel.erstatninger).filter((k) => indeks.fag[k]);
    expect(iBruk.length / Object.keys(rel.erstatninger).length).toBeLessThan(0.02);
  });

  it('leder de fleste utgåtte koder til en fagkode i fagindeksen', () => {
    const finnes = (k: string) => indeks.fag[k] !== undefined;
    const tilIndeks = Object.keys(rel.erstatninger).filter((k) => gjeldendeKoder(k, rel, finnes).some(finnes));
    expect(tilIndeks.length).toBeGreaterThan(1000);
  });

  it('har fagmerknader og vitnemålsmerknader med tekst på bokmål og nynorsk', () => {
    expect(m.fagmerknader.find((x) => x.kode === 'FAM01')).toMatchObject({ nb: 'Fritatt fra opplæring', nn: 'Friteken frå opplæring' });
    expect(m.vitnemalsmerknader.some((x) => x.kode === 'VMM01')).toBe(true);
  });
});
