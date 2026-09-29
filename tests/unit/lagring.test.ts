import { describe, expect, it } from 'vitest';
import {
  LAGRINGSNOKKEL,
  eksportfilnavn,
  lagEksport,
  lesEksport,
  lesLagret,
  migrer,
  skrivLagret,
  standard,
  velgFylke,
  type Lager,
} from '../../src/core/lagring/lagring.ts';

class MinneLager implements Lager {
  data = new Map<string, string>();
  getItem(k: string) {
    return this.data.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.data.set(k, v);
  }
  removeItem(k: string) {
    this.data.delete(k);
  }
}

const odelagtLager: Lager = {
  getItem() {
    throw new Error('SecurityError');
  },
  setItem() {
    throw new Error('QuotaExceededError');
  },
  removeItem() {
    throw new Error('SecurityError');
  },
};

describe('lagring', () => {
  it('gir standardverdier første gang', () => {
    const { data, status } = lesLagret(new MinneLager(), 'nn');
    expect(status).toBe('ny');
    expect(data.innstillinger).toEqual({ malform: 'nn', tema: 'system', fylke: null, skole: null });
  });

  it('lagrer og leser tilbake', () => {
    const lager = new MinneLager();
    const data = { ...standard(), favoritter: ['begreper:arsramme'] };
    data.innstillinger = { malform: 'nn', tema: 'mork', fylke: '46', skole: { id: '974712539', navn: 'Testskule' } };
    expect(skrivLagret(lager, data)).toBe(true);
    expect(lesLagret(lager)).toEqual({ data, status: 'ok' });
  });

  it('tåler ødelagte data og feil i lagringen', () => {
    const lager = new MinneLager();
    lager.setItem(LAGRINGSNOKKEL, '{ikke json');
    expect(lesLagret(lager).status).toBe('ugyldig');
    lager.setItem(LAGRINGSNOKKEL, JSON.stringify({ skjemaversjon: 1, innstillinger: { malform: 'sv' } }));
    expect(lesLagret(lager).status).toBe('ugyldig');
    expect(lesLagret(odelagtLager).status).toBe('utilgjengelig');
    expect(skrivLagret(odelagtLager, standard())).toBe(false);
    expect(lesLagret(null).status).toBe('utilgjengelig');
  });

  it('migrerer data fra skjemaversjon 1', () => {
    const v1 = {
      skjemaversjon: 1,
      innstillinger: { malform: 'nn', tema: 'mork', fylke: '46', skole: null },
      favoritter: ['a'],
      scenarier: {},
    };
    expect(migrer(v1)).toEqual({ ...v1, skjemaversjon: 2, skjultKildevarsel: null });
    const lager = new MinneLager();
    lager.setItem(LAGRINGSNOKKEL, JSON.stringify(v1));
    expect(lesLagret(lager)).toMatchObject({ status: 'ok', data: { skjemaversjon: 2, favoritter: ['a'] } });
  });

  it('avviser data fra en nyere skjemaversjon', () => {
    expect(migrer({ ...standard(), skjemaversjon: 99 })).toBeNull();
    expect(migrer({ ...standard(), skjemaversjon: 0 })).toBeNull();
    expect(migrer({ ...standard(), skjemaversjon: 2, skjultKildevarsel: 5 })).toBeNull();
  });

  it('eksporterer og importerer', () => {
    const data = { ...standard('nn'), favoritter: ['a', 'b'] };
    const tekst = lagEksport(data, '0.1.0', new Date('2026-09-29T10:00:00Z'));
    expect(lesEksport(tekst)).toEqual(data);
    expect(lesEksport('{"app":"annen"}')).toBeNull();
    expect(lesEksport('ikke json')).toBeNull();
    expect(eksportfilnavn(new Date('2026-09-29T10:00:00Z'))).toBe('protokollen-2026-09-29.json');
  });

  it('nullstiller skolen når fylket byttes', () => {
    const inn = { malform: 'nb' as const, tema: 'system' as const, fylke: '46', skole: { id: '1', navn: 'A' } };
    const skolensFylke = (id: string) => (id === '1' ? '46' : null);
    expect(velgFylke(inn, '46', skolensFylke).skole).toEqual({ id: '1', navn: 'A' });
    expect(velgFylke(inn, '11', skolensFylke)).toMatchObject({ fylke: '11', skole: null });
    expect(velgFylke(inn, null, skolensFylke)).toMatchObject({ fylke: null, skole: null });
    expect(velgFylke({ ...inn, skole: { id: null, navn: 'Fritekst' } }, '11', skolensFylke).skole).toBeNull();
  });
});
