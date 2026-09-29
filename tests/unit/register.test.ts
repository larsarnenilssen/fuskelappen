import { describe, expect, it } from 'vitest';
import { kjerneoppforinger } from '../../src/app/kjerneoppforinger.ts';
import {
  aktiveModuler,
  alleModuler,
  kategorierMedModuler,
  samleFavorittbare,
  samleSokeoppforinger,
} from '../../src/modules/register.ts';

describe('modulregisteret', () => {
  it('finner modulene automatisk, også testmodulen i testmodus', () => {
    const ider = alleModuler.map((m) => m.id);
    expect(ider).toContain('begreper');
    expect(ider).toContain('testmodul');
  });

  it('skjulte moduler er ikke aktive', () => {
    expect(aktiveModuler.map((m) => m.id)).not.toContain('begreper');
  });

  it('testmodulen havner i riktig kategori på forsiden', () => {
    const kategori = kategorierMedModuler().find((k) => k.id === 'skolemiljo');
    expect(kategori?.moduler.map((m) => m.id)).toContain('testmodul');
  });

  it('testmodulen og dens funksjoner kommer med i søket', async () => {
    const oppforinger = await samleSokeoppforinger();
    const ider = oppforinger.map((o) => o.id);
    expect(ider).toContain('modul:testmodul');
    expect(ider).toContain('testmodul:skoleregler');
    expect(new Set(ider).size).toBe(ider.length);
  });

  it('samler favorittbare fra alle synlige moduler', async () => {
    const f = await samleFavorittbare();
    expect(f.get('testmodul:funksjon')?.rute).toBe('/testmodul');
    expect(f.get('begreper:testbegrep-skolemiljo')?.type).toBe('begrep');
  });

  it('kjernesidene er søkbare på begge målformer', () => {
    for (const o of kjerneoppforinger()) {
      expect(o.tittel.nb.length).toBeGreaterThan(0);
      expect(o.tittel.nn.length).toBeGreaterThan(0);
    }
  });
});
