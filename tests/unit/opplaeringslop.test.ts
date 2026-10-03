// Tilbudsdataene til Opplæringsløp (avgjørelse 035), regnet ut fra de ekte dataene slik appen bygges.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { tilbudPlugin } from '../../scripts/vite/plugins.ts';
import type { Fagindeks } from '../../src/modules/fag/skjema.ts';
import { fullKode, kortKode, skoleForst, type Tilbudene, tilbudRute } from '../../src/modules/opplaeringslop/data.ts';
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

  it('på vg2 studieforberedende velger eleven matematikk 2P, R1 eller S1 (Udir-1 punkt 3.3.1.4, eier 03.10.2026)', () => {
    for (const kode of ['STSSA2----', 'STREA2----', 'IDIDR2----']) {
      const mat = data.tilbud[kode]?.deler.find((d) => d.type === 'fag' && d.linje === 'Matematikk');
      expect(mat, kode).toMatchObject({ kategori: 'fellesfag', timer: 84, koder: ['MAT1023', 'REA3056', 'REA3060'], erstatning: ['REA3056', 'REA3060'] });
    }
    // Vg1 har 1P eller 1T, og Vg3 påbygging har ingen slike valg.
    const vg1 = data.tilbud['STUSP1----']?.deler.find((d) => d.type === 'fag' && d.linje === 'Matematikk');
    expect(vg1).toMatchObject({ koder: ['MAT1019', 'MAT1021'] });
    expect(vg1).not.toHaveProperty('erstatning');
    expect(data.tilbud['PBPBY3----']?.deler.find((d) => d.type === 'fag' && d.linje === 'Matematikk')).not.toHaveProperty('erstatning');
  });

  it('på vg1 yrkesfag står 1P og 1T som merknad, ikke som valg (Udir-1 punkt 3.5, eier 03.10.2026)', () => {
    const mat = data.tilbud['HSHSF1----']?.deler.find((d) => d.type === 'fag' && d.linje === 'Matematikk');
    expect(mat).toMatchObject({ timer: 84, koder: ['MAT1117', 'MAT1137'], iStedet: ['MAT1019', 'MAT1021'] });
    for (const kode of ['STUSP1----', 'PBPBY3----']) {
      expect(data.tilbud[kode]?.deler.find((d) => d.type === 'fag' && d.linje === 'Matematikk'), kode).not.toHaveProperty('iStedet');
    }
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

describe('rekkefølgen på tilbudene videre (eier 02.10.2026)', () => {
  it('setter tilbud i skole før opplæring i bedrift, ellers i samme rekkefølge', () => {
    const programomrader = {
      A: { sted: 'bedrift' },
      B: { sted: 'skole' },
      C: { sted: 'bedrift' },
      D: { sted: 'skole' },
    } as unknown as Fagindeks['programomrader'];
    expect(skoleForst(['A', 'B', 'C', 'D', 'X'], { programomrader })).toEqual(['B', 'D', 'X', 'A', 'C']);
  });
});
