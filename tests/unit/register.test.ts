import { describe, expect, it } from 'vitest';
import { kjerneoppforinger } from '../../src/app/kjerneoppforinger.ts';
import { lesHash, matchRute } from '../../src/app/ruter.ts';
import { ruter as e2eRuter } from '../e2e/hjelp.ts';
import {
  aktiveModuler,
  alleModuler,
  alleRuter,
  kategorierMedModuler,
  ikonForFavoritt,
  samleFavorittbare,
  samleSokeoppforinger,
  synligeModuler,
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
    const faste = Object.values(kilder).flatMap((tekst) => [...tekst.matchAll(/<(?:FavorittKnapp\s+id|Sidetopp\s[^>]*favoritt)="([^"]+)"/g)].map((m) => m[1] ?? ''));
    expect(faste.length).toBeGreaterThan(0);
    for (const id of faste) expect(f.has(id), id).toBe(true);
    // Id-er som bygges av data: veiviserne, kalkulatorene, fagene og begrepene.
    for (const id of [
      'inntak:rett-inntak-soknad',
      'tilrettelegging:tilpasset-og-individuell',
      'vurdering:grunnlag-for-vurdering',
      'arbeidstid:beskjeftigelse',
      'begreper:standpunktkarakter',
      // Oversiktssidene, dokumentene, programmene og tilbudene, og elementene uten egen side (avgjørelse 058).
      ...['begreper', 'fag', 'inntak', 'lov', 'opplaeringslop', 'tilrettelegging', 'vurdering'].map((m) => `${m}:oversikt`),
      'lov:opplaeringslova',
      'lov:opplaeringslova:11-1',
      'lov:hovedtariffavtalen',
      'laereplanverket:2.5.1',
      'opplaeringslop:HS',
      'opplaeringslop:HSHEA2',
    ]) {
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

  it('en favoritt under en lenke med ikon på en oversiktsside får det ikonet, også med spørreparametre (avgjørelse 058)', async () => {
    const f = await samleFavorittbare();
    const skole = [...f.values()].find((x) => x.id.startsWith('opplaeringslop:skole:'));
    const kontor = [...f.values()].find((x) => x.id.startsWith('opplaeringslop:kontor:'));
    expect(skole?.rute).toMatch(/^\/opplaeringslop\/skoler\?/);
    expect(ikonForFavoritt(skole?.id ?? '', skole)).toBe('skole');
    expect(ikonForFavoritt(kontor?.id ?? '', kontor)).toBe('kontor');
    expect(ikonForFavoritt('opplaeringslop:skoler', f.get('opplaeringslop:skoler'))).toBe('skole');
    expect(ikonForFavoritt('opplaeringslop:lop', f.get('opplaeringslop:lop'))).toBe('veiviser');
    expect(ikonForFavoritt('vurdering:fravaer', f.get('vurdering:fravaer'))).toBe('klokke');
    expect(ikonForFavoritt('lov:oversikt', f.get('lov:oversikt'))).toBe('paragraf');
    // Alle favorittene under en underside får ikonet dens, i alle modulene.
    for (const m of synligeModuler) {
      for (const u of m.undersider ?? []) {
        for (const [id, fav] of f) {
          const sti = fav.rute.split('?')[0] ?? '';
          if (id.startsWith(`${m.id}:`) && !fav.ikon && (sti === u.rute || sti.startsWith(`${u.rute}/`))) expect(ikonForFavoritt(id, fav), id).toBe(u.ikon);
        }
      }
    }
  });

  it('favoritt-id-ene er unike på tvers av modulene, og de spurte finnes også når bare de er spurt etter (avgjørelse 058)', async () => {
    const lister = await Promise.all(synligeModuler.map((m) => m.favorittbare()));
    const ider = lister.flat().map((x) => x.id);
    expect(ider.filter((id, i) => ider.indexOf(id) !== i)).toEqual([]);
    const f = await samleFavorittbare();
    const skole = [...f.keys()].find((id) => id.startsWith('opplaeringslop:skole:')) ?? '';
    const spurte = ['lov:opplaeringslova:11-1', 'laereplanverket:2.5.1', skole, 'opplaeringslop:HSHEA2', 'fag:oversikt'];
    expect([...(await samleFavorittbare(undefined, spurte)).keys()]).toEqual(expect.arrayContaining(spurte));
  });

  it('alle favorittene i alle modulene får et ikon, også i nye moduler (avgjørelse 056)', async () => {
    const f = await samleFavorittbare();
    expect(f.size).toBeGreaterThan(0);
    for (const [id, favoritt] of f) expect(ikonForFavoritt(id, favoritt), id).not.toBeNull();
  });

  it('hver rute i modulene har en adresse i ende-til-ende-testene, så stjernen og overflyten testes der (avgjørelse 058)', () => {
    const truffet = new Set<string>();
    for (const adresse of e2eRuter) {
      const { sti } = lesHash(adresse);
      const treff = alleRuter().find(({ rute }) => matchRute(rute.sti, sti));
      if (treff) truffet.add(treff.rute.sti);
    }
    // Ruter uten egen side: /arbeidstid sender til forsiden, og /laereplanverket/overordnet-del er samme side som
    // /laereplanverket.
    const utenEgenSide = ['/arbeidstid', '/laereplanverket/overordnet-del'];
    const mangler = alleRuter()
      .map(({ rute }) => rute.sti)
      .filter((sti) => !truffet.has(sti) && !utenEgenSide.includes(sti));
    expect(mangler, 'Legg til en adresse for ruten i tests/e2e/hjelp.ts').toEqual([]);
  });

  it('kjernesidene er søkbare på begge målformer', () => {
    for (const o of kjerneoppforinger()) {
      expect(o.tittel.nb.length).toBeGreaterThan(0);
      expect(o.tittel.nn.length).toBeGreaterThan(0);
    }
  });
});
