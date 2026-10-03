import { describe, expect, it } from 'vitest';
import { fasestatus, finnFeil, finnVei, korstesteVei, lagKart, lesSvar, stegIRekkefolge, tilbakeTil, tilstand, videre, type Stegnode } from '../../src/core/veiviser/veiviser.ts';

// Et lite eksempel med et spørsmål som kan føre tilbake (løkke via svar), og to utfall.
const steg: Stegnode[] = [
  { id: 'a', neste: 'b' },
  { id: 'b', sporsmal: { svar: [{ id: 'nei', neste: 'ok' }, { id: 'ja', neste: 'c' }] } },
  { id: 'c', neste: 'd' },
  { id: 'd', sporsmal: { svar: [{ id: 'nok', neste: 'b' }, { id: 'ikke', neste: 'slutt' }] } },
  { id: 'ok' },
  { id: 'slutt' },
];
const kart = lagKart('a', steg);

describe('veiviser: veien', () => {
  it('starter på startsteget uten tilstand', () => {
    expect(finnVei(kart, [])).toEqual({ bak: [], gjeldende: 'a', svar: [], korrigert: false });
  });

  it('går videre gjennom steg uten spørsmål til steget i adressen', () => {
    const vei = finnVei(kart, [], 'b');
    expect(vei.gjeldende).toBe('b');
    expect(vei.bak).toEqual([{ steg: 'a' }]);
  });

  it('bruker svarene på veien', () => {
    const vei = finnVei(kart, ['ja'], 'd');
    expect(vei.bak).toEqual([{ steg: 'a' }, { steg: 'b', svar: 'ja' }, { steg: 'c' }]);
    expect(vei.gjeldende).toBe('d');
    expect(vei.korrigert).toBe(false);
  });

  it('kan gå samme steg flere ganger når svarene fører tilbake', () => {
    const vei = finnVei(kart, ['ja', 'nok', 'ja', 'ikke'], 'slutt');
    expect(vei.bak.map((p) => p.steg)).toEqual(['a', 'b', 'c', 'd', 'b', 'c', 'd']);
    expect(vei.gjeldende).toBe('slutt');
  });

  it('står på det siste steget som kan nås når adressen ikke stemmer', () => {
    expect(finnVei(kart, ['ukjent'], 'd')).toMatchObject({ gjeldende: 'b', korrigert: true });
    expect(finnVei(kart, ['nei'], 'd')).toMatchObject({ gjeldende: 'ok', korrigert: true });
    expect(finnVei(kart, [], 'finnes-ikke')).toMatchObject({ gjeldende: 'b', korrigert: true });
  });

  it('går videre med og uten svar, og tilbake til et tidligere punkt', () => {
    const vei = finnVei(kart, ['ja'], 'd');
    expect(videre(kart, vei, 'ikke')).toEqual({ steg: 'slutt', svar: 'ja.ikke' });
    expect(videre(kart, vei, 'ukjent')).toBeNull();
    expect(videre(kart, finnVei(kart, []))).toEqual({ steg: 'b' });
    expect(tilbakeTil(kart, vei, 0)).toEqual({});
    expect(tilbakeTil(kart, vei, 1)).toEqual({ steg: 'b' });
    expect(tilbakeTil(kart, vei, 2)).toEqual({ steg: 'c', svar: 'ja' });
  });

  it('tilstanden kan leses tilbake til samme vei', () => {
    const vei = finnVei(kart, ['ja', 'nok', 'ja'], 'd');
    const t = tilstand(kart, vei.gjeldende, vei.svar);
    expect(finnVei(kart, lesSvar(t.svar ?? null), t.steg)).toEqual(vei);
    expect(lesSvar('a..b')).toEqual(['a', 'b']);
    expect(lesSvar(null)).toEqual([]);
  });
});

describe('veiviser: kontroll av kartet', () => {
  it('finner ingen feil i et riktig kart', () => {
    expect(finnFeil(kart)).toEqual([]);
  });

  it('finner steg som mangler, ikke kan nås, eller går i løkke uten spørsmål', () => {
    const feil = finnFeil(lagKart('a', [{ id: 'a', neste: 'b' }, { id: 'b', neste: 'a' }, { id: 'c', neste: 'x' }]));
    expect(feil).toContain('«c» peker på «x», som ikke finnes');
    expect(feil).toContain('«c» kan ikke nås fra starten');
    expect(feil.some((f) => f.startsWith('Løkke uten spørsmål'))).toBe(true);
    expect(finnFeil(lagKart('z', []))).toContain('Startsteget «z» finnes ikke');
  });
});

describe('veiviser: faser', () => {
  it('fasene før er ferdige, og fasene etter kommer senere', () => {
    expect(fasestatus(['x', 'y', 'z'], 'y')).toEqual(['ferdig', 'gjeldende', 'senere']);
    expect(fasestatus(['x', 'y'], undefined)).toEqual(['senere', 'senere']);
  });
});

describe('veiviser: kartet over hele prosessen', () => {
  it('finner korteste vei til et steg, med svarene', () => {
    expect(korstesteVei(kart, 'a')).toEqual({ steg: 'a', svar: [] });
    expect(korstesteVei(kart, 'd')).toEqual({ steg: 'd', svar: ['ja'] });
    expect(korstesteVei(kart, 'slutt')).toEqual({ steg: 'slutt', svar: ['ja', 'ikke'] });
    expect(korstesteVei(kart, 'finnes-ikke')).toBeNull();
    // Veien leses tilbake til samme steg.
    const v = korstesteVei(kart, 'slutt');
    expect(finnVei(kart, v?.svar ?? [], v?.steg).gjeldende).toBe('slutt');
  });

  it('gir stegene i rekkefølgen de nås fra starten', () => {
    expect(stegIRekkefolge(kart)).toEqual(['a', 'b', 'ok', 'c', 'd', 'slutt']);
  });
});
