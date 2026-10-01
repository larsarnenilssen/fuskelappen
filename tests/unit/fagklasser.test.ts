// Hvilke fag fagsøket viser som standard, og hvordan treffene grupperes (avgjørelse 031). På de ekte dataene.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { etterLaereplan, fagklasser, fellesStart, gruppeRekkefolge } from '../../src/modules/fag/klasser.ts';
import { filterFraAdresse, filterTilAdresse, sokFag, tomtFilter } from '../../src/modules/fag/oppslag.ts';
import type { Fagindeks } from '../../src/modules/fag/skjema.ts';
import { beregnFagroller } from '../../src/modules/fag/tilbud/modell.ts';
import type { Fagfordeling } from '../../src/modules/fag/tilbud/skjema.ts';

const rot = fileURLToPath(new URL('../..', import.meta.url));
const indeks = JSON.parse(readFileSync(join(rot, 'data/grep/fagindeks.json'), 'utf8')) as Fagindeks;
const fordeling = JSON.parse(readFileSync(join(rot, 'data/udir/fagfordeling-2026-2027.json'), 'utf8')) as Fagfordeling;
const klasser = fagklasser(indeks, Object.fromEntries(beregnFagroller(indeks, fordeling)));
const sok = (f: Partial<typeof tomtFilter>) => sokFag(indeks, { ...tomtFilter, ...f }, klasser);

describe('vanlige fag i fagsøket', () => {
  it('helse- og oppvekstfag viser de vanlige fagene, og skjuler varianter, bedrift og andre koder', () => {
    const { treff, skjult } = sok({ program: 'HS' });
    const koder = treff.map((t) => t.kode);
    expect(koder).toContain('HEA2005');
    expect(koder).toContain('YFF4101');
    expect(treff.some((t) => /kvensk|morsmål|tegnspråk|kort botid/i.test(t.fag.navn.nb))).toBe(false);
    expect(skjult.variant).toBeGreaterThan(0);
    expect(skjult.bedrift).toBeGreaterThan(0);
    expect(treff.length).toBeLessThan(100);
  });

  it('viser variantene når brukeren slår dem på', () => {
    const koder = sok({ program: 'HS', vis: 'variant' }).treff.map((t) => t.kode);
    expect(koder).toContain('KEF1001');
    expect(sok({ program: 'HS', vis: 'variant' }).skjult.variant).toBe(0);
  });

  it('et søk på en hel fagkode viser alltid faget, også når det er skjult', () => {
    expect(klasser.get('KEF1001')).toBe('variant');
    expect(sok({ tekst: 'kef1001' }).treff.map((t) => t.kode)).toEqual(['KEF1001']);
  });

  it('yrkesfaglig fordypning er alltid et vanlig fag', () => {
    for (const [kode, fag] of Object.entries(indeks.fag)) if (fag.type === 'yrkesfaglig_fordypning') expect(klasser.get(kode), kode).toBe('vanlig');
  });

  it('valget står i adressen', () => {
    const f = { ...tomtFilter, program: 'HS', vis: 'variant,bedrift' };
    expect(filterTilAdresse(f)).toEqual({ program: 'HS', vis: 'variant,bedrift' });
    expect(filterFraAdresse(new URLSearchParams('vis=andre'))).toEqual({ ...tomtFilter, vis: 'andre' });
  });

  it('uten klasser vises alle fagene, som før', () => {
    expect(sokFag(indeks, { ...tomtFilter, program: 'HS' }).treff.length).toBe(sokFag(indeks, { ...tomtFilter, program: 'HS', vis: 'variant,bedrift,andre' }, klasser).treff.length);
  });
});

describe('gruppering', () => {
  it('yrkesfaglig fordypning står først når et yrkesfaglig program er valgt', () => {
    expect(gruppeRekkefolge(true)[0]).toBe('yrkesfaglig_fordypning');
    expect(gruppeRekkefolge(false)[0]).toBe('fellesfag');
  });

  it('finner det navnene har felles i starten, som hele ord', () => {
    expect(fellesStart(['Matematikk R1', 'Matematikk S2'])).toBe('Matematikk');
    expect(fellesStart(['Historie og filosofi 1', 'Historie og filosofi 2'])).toBe('Historie og filosofi');
    expect(fellesStart(['Tysk 1', 'Fransk 1'])).toBe('');
  });

  it('grupperer etter læreplan med tittelen på læreplanen, og bruker felles navn når tittelen mangler', () => {
    const treff = sok({ program: 'ST', type: 'valgfritt_programfag' }).treff;
    const grupper = etterLaereplan(treff, 'nb', { 'MAT03-02': 'Matematikk for realfag' });
    const mat = grupper.find((g) => g.laereplan === 'MAT03-02');
    expect(mat?.tittel).toBe('Matematikk for realfag');
    expect(mat?.treff.map((t) => t.kode)).toContain('REA3056');
    expect(grupper.find((g) => g.treff.some((t) => t.fag.navn.nb.startsWith('Biologi')))?.tittel).toBe('Biologi');
    expect(grupper.reduce((s, g) => s + g.treff.length, 0)).toBe(treff.length);
  });
});

describe('programmene på fagarket', () => {
  it('samler alle yrkesfaglige og alle studieforberedende utdanningsprogram', async () => {
    const { programSammendrag, programmerFor } = await import('../../src/modules/fag/oppslag.ts');
    const yff = indeks.fag.YFF4106;
    expect(yff).toBeDefined();
    if (!yff) return;
    expect(programSammendrag(indeks, programmerFor(indeks, yff))).toEqual({ alleYrkesfaglige: true, alleStudieforberedende: false, andre: [] });
    expect(programSammendrag(indeks, ['HS', 'ST'])).toEqual({ alleYrkesfaglige: false, alleStudieforberedende: false, andre: ['HS', 'ST'] });
  });
});
