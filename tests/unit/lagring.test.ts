import { describe, expect, it } from 'vitest';
import {
  GAMLE_LAGRINGSNOKLER,
  LAGRINGSNOKKEL,
  eksportfilnavn,
  lagEksport,
  lesEksport,
  lesLagret,
  lesValg,
  migrer,
  slettLagret,
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

  it('husker dagens jukselapp og dagen den sist ble vist først, uten ny skjemaversjon (fase 8)', () => {
    const lager = new MinneLager();
    expect(lesLagret(lager).data.forside.jukselapp).toBeUndefined();
    const data = { ...standard(), forside: { ...standard().forside, jukselapp: true, jukselappVist: '2026-10-08', visning: 'jukselapp' } };
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
    expect(migrer(v1)).toEqual({ ...v1, skjemaversjon: 3, skjultKildevarsel: null, forside: { rekkefolge: [], lukket: [], bareFavoritter: false } });
    const lager = new MinneLager();
    lager.setItem(LAGRINGSNOKKEL, JSON.stringify(v1));
    expect(lesLagret(lager)).toMatchObject({ status: 'ok', data: { skjemaversjon: 3, favoritter: ['a'] } });
  });

  it('migrerer data fra skjemaversjon 2 med standard forside (avgjørelse 056)', () => {
    const v2 = { skjemaversjon: 2, innstillinger: { malform: 'nb', tema: 'system', fylke: null, skole: null }, favoritter: ['b'], scenarier: {}, skjultKildevarsel: null };
    expect(migrer(v2)).toEqual({ ...v2, skjemaversjon: 3, forside: { rekkefolge: [], lukket: [], bareFavoritter: false } });
  });

  it('leser data lagret før appen het Jukselappen, og skriver under den nye nøkkelen (avgjørelse 034 og 058)', () => {
    expect(LAGRINGSNOKKEL).toBe('jukselappen');
    expect(GAMLE_LAGRINGSNOKLER).toEqual(['fuskelappen', 'protokollen']);
    for (const gammelNokkel of GAMLE_LAGRINGSNOKLER) {
      const lager = new MinneLager();
      const gammel = { ...standard(), favoritter: ['a'] };
      lager.setItem(gammelNokkel, JSON.stringify(gammel));
      expect(lesLagret(lager)).toEqual({ data: gammel, status: 'ok' });
      const ny = { ...gammel, favoritter: ['b'] };
      skrivLagret(lager, ny);
      expect(lager.getItem(LAGRINGSNOKKEL)).toBe(JSON.stringify(ny));
      expect(lesLagret(lager).data.favoritter).toEqual(['b']);
    }
  });

  it('foretrekker Fuskelappen foran Protokollen, og «Slett alt» sletter også de gamle nøklene (avgjørelse 058)', () => {
    const lager = new MinneLager();
    lager.setItem('protokollen', JSON.stringify({ ...standard(), favoritter: ['eldst'] }));
    lager.setItem('fuskelappen', JSON.stringify({ ...standard(), favoritter: ['nyere'] }));
    lager.setItem('fuskelappen-lopvisning', 'alle');
    expect(lesLagret(lager).data.favoritter).toEqual(['nyere']);
    expect(lesValg(lager, 'lopvisning')).toBe('alle');
    slettLagret(lager);
    expect(lesLagret(lager).status).toBe('ny');
    expect(lesValg(lager, 'lopvisning')).toBeNull();
  });

  it('gir favoritter til sider som er flyttet, den nye id-en, én gang (avgjørelse 078)', () => {
    const data = migrer({ ...standard(), favoritter: ['vurdering:eksamen', 'eksamen:eksamen', 'vurdering:klage-pa-karakter', 'vurdering:fravaer'] });
    expect(data?.favoritter).toEqual(['eksamen:eksamen', 'eksamen:klage-pa-karakter', 'vurdering:fravaer']);
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
    // Filer eksportert før appen het Jukselappen, kan fortsatt importeres.
    expect(lesEksport(JSON.stringify({ app: 'fuskelappen', eksportert: '', appversjon: '0.33.0', data }))).toEqual(data);
    expect(lesEksport(JSON.stringify({ app: 'protokollen', eksportert: '', appversjon: '0.16.1', data }))).toEqual(data);
    expect(lesEksport('ikke json')).toBeNull();
    expect(eksportfilnavn(new Date('2026-09-29T10:00:00Z'))).toBe('jukselappen-2026-09-29.json');
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
