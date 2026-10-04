import { describe, expect, it } from 'vitest';
import { kjerneoppforinger } from '../../src/app/kjerneoppforinger.ts';
import {
  aktiveModuler,
  alleModuler,
  kategorierMedModuler,
  ikonForFavoritt,
  samleFavorittbare,
  samleSokeoppforinger,
} from '../../src/modules/register.ts';

describe('modulregisteret', () => {
  it('finner modulene automatisk, også testmodulen i testmodus', () => {
    const ider = alleModuler.map((m) => m.id);
    expect(ider).toContain('begreper');
    expect(ider).toContain('testmodul');
  });

  it('bare moduler med status aktiv er aktive', () => {
    expect(aktiveModuler.every((m) => m.status === 'aktiv')).toBe(true);
    // Fase 1: arbeidstid og begrepsbanken er tatt i bruk.
    expect(aktiveModuler.map((m) => m.id)).toEqual(expect.arrayContaining(['arbeidstid', 'begreper']));
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

  it('hver stjerneknapp i modulene har en favoritt som finnes, ellers står den som «ikke lenger tilgjengelig»', async () => {
    const f = await samleFavorittbare();
    // Faste id-er i koden, f.eks. id="inntak:frister".
    const kilder = import.meta.glob('../../src/modules/*/**/*.tsx', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
    const faste = Object.values(kilder).flatMap((tekst) => [...tekst.matchAll(/<FavorittKnapp\s+id="([^"]+)"/g)].map((m) => m[1] ?? ''));
    expect(faste.length).toBeGreaterThan(0);
    for (const id of faste) expect(f.has(id), id).toBe(true);
    // Id-er som bygges av data: veiviserne, kalkulatorene, fagene og begrepene.
    for (const id of ['inntak:rett-inntak-soknad', 'tilrettelegging:tilpasset-og-individuell', 'vurdering:grunnlag-for-vurdering', 'arbeidstid:beskjeftigelse', 'begreper:standpunktkarakter']) {
      expect(f.has(id), id).toBe(true);
    }
  });

  it('en favoritt uten eget ikon får ikonet til inngangen over, ellers modulens (avgjørelse 056)', async () => {
    const f = await samleFavorittbare();
    // Kalkulatoren har en inngang på forsiden med eget ikon.
    expect(ikonForFavoritt('arbeidstid:beskjeftigelse', f.get('arbeidstid:beskjeftigelse'))).toBe('kalkulator');
    // Fristene har eget ikon.
    expect(ikonForFavoritt('inntak:frister', f.get('inntak:frister'))).toBe('klokke');
    // Veiviseren i Vurdering ligger under modulen.
    expect(ikonForFavoritt('vurdering:grunnlag-for-vurdering', f.get('vurdering:grunnlag-for-vurdering'))).toBe('vurdering');
    expect(ikonForFavoritt('finnesikke:x', undefined)).toBeNull();
  });

  it('alle favorittene i alle modulene får et ikon, også i nye moduler (avgjørelse 056)', async () => {
    const f = await samleFavorittbare();
    expect(f.size).toBeGreaterThan(0);
    for (const [id, favoritt] of f) expect(ikonForFavoritt(id, favoritt), id).not.toBeNull();
  });

  it('kjernesidene er søkbare på begge målformer', () => {
    for (const o of kjerneoppforinger()) {
      expect(o.tittel.nb.length).toBeGreaterThan(0);
      expect(o.tittel.nn.length).toBeGreaterThan(0);
    }
  });
});
