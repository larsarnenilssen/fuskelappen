// Tilbudsdataene til Opplæringsløp (avgjørelse 035), regnet ut fra de ekte dataene slik appen bygges.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { tilbudPlugin } from '../../scripts/vite/plugins.ts';
import type { Fagindeks } from '../../src/modules/fag/skjema.ts';
import { fullKode, kortKode, type Tilbudene, tilbudRute } from '../../src/modules/opplaeringslop/data.ts';
import { fagITilbud, programomradegrupper } from '../../src/modules/opplaeringslop/grupper.ts';

const rot = fileURLToPath(new URL('../..', import.meta.url));
const kilde = (tilbudPlugin(rot) as unknown as { load: (id: string) => string }).load('\0virtual:tilbud');
const data = JSON.parse(kilde.replace(/^export default /, '').replace(/;$/, '')) as Tilbudene;
const indeks = JSON.parse(readFileSync(new URL('../../data/grep/fagindeks.json', import.meta.url), 'utf8')) as Fagindeks;

describe('tilbudene til Opplæringsløp', () => {
  it('har programmene med inngang og hvert tilbud uten programområdet', () => {
    expect(data.struktur.find((p) => p.program === 'HS')?.inngang).toContain('HSHSF1----');
    const hea2 = data.tilbud['HSHEA2----'];
    expect(hea2).toBeDefined();
    expect(hea2 && 'programomrade' in hea2).toBe(false);
    expect(hea2?.sum).toBe(982);
    expect(hea2?.videre).toContain('HSHEA3----');
    expect(hea2?.pabygging.length).toBeGreaterThan(0);
  });

  it('korte koder i adressen', () => {
    expect(kortKode('HSHEA2----')).toBe('HSHEA2');
    expect(fullKode('hshea2')).toBe('HSHEA2----');
    expect(tilbudRute('PB', 'PBPBY3----', 'HSHEA2----')).toBe('/opplaeringslop/PB/PBPBY3?via=HSHEA2');
  });
});

describe('fag i tilbud og grupper (eier 02.10.2026)', () => {
  const hea2 = data.tilbud['HSHEA2----']!;
  const ssa2 = data.tilbud['STSSA2----']!;

  it('viser hvordan et fag inngår i et tilbud, med timene', () => {
    expect(fagITilbud(hea2, 'HEA2005', indeks)).toEqual({ kategori: 'felles_programfag', timer: 197, valg: false });
    expect(fagITilbud(hea2, 'HEA2008', indeks)).toEqual({ kategori: 'vurdering', timer: null, valg: false });
    // Matematikk R1 kan tas både som fordypning og til valg. Fordypningen står først i tilbudet.
    expect(fagITilbud(ssa2, 'REA3056', indeks)).toEqual({ kategori: 'fordypning', timer: 140, valg: true });
    expect(fagITilbud(hea2, 'REA3056', indeks)).toBeNull();
  });

  it('grupperer programfag til valg etter programområdene i Grep, uten egen gruppe når alle hører til samme', () => {
    const valgfritt = ssa2.deler.find((d) => d.kategori === 'valgfritt');
    const kandidater = valgfritt?.type === 'plass' ? valgfritt.kandidater : [];
    const grupper = programomradegrupper(kandidater, indeks, 'Vg2', 'nb', 'Andre fag');
    const navn = (grupper ?? []).map(([n]) => n);
    expect(navn).toContain('Realfag');
    expect(navn).toContain('Idrettsfag');
    expect(navn.every((n) => !/vg2$/i.test(n))).toBe(true);
    expect(grupper?.find(([n]) => n === 'Realfag')?.[1]).toContain('REA3056');
    // Hører alle fagene til samme programområde, blir det ingen grupper.
    expect(programomradegrupper(['SPR3022'], indeks, 'Vg2', 'nb', 'Andre fag')).toBeNull();
  });
});
