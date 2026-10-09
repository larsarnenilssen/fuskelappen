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
  SIKKERHETSKOPINOKKEL,
  SKJEMAVERSJON,
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

  it('husker dagen brukeren gikk fra dagens jukselapp til sin egen visning, uten ny skjemaversjon', () => {
    const lager = new MinneLager();
    const data = { ...standard(), forside: { ...standard().forside, jukselapp: true, visning: 'nyheter', jukselappForlatt: '2026-10-08' } };
    expect(skrivLagret(lager, data)).toBe(true);
    expect(lesLagret(lager)).toEqual({ data, status: 'ok' });
  });

  it('tåler ødelagte data og feil i lagringen', () => {
    const lager = new MinneLager();
    lager.setItem(LAGRINGSNOKKEL, '{ikke json');
    expect(lesLagret(lager).status).toBe('ugyldig');
    // Ugyldige felt får reserveverdien, resten leses (avgjørelse 097).
    lager.setItem(LAGRINGSNOKKEL, JSON.stringify({ skjemaversjon: 1, innstillinger: { malform: 'sv' } }));
    expect(lesLagret(lager).status).toBe('reparert');
    lager.setItem(LAGRINGSNOKKEL, JSON.stringify([1, 2]));
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
    expect(migrer({ ...standard(), skjemaversjon: '3' })).toBeNull();
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

describe('lagringen sletter ikke brukerdata (avgjørelse 097)', () => {
  const brukerdata = () => ({
    ...standard('nn'),
    favoritter: ['begreper:arsramme', 'eksamen:eksamen'],
    scenarier: { 'arbeidstid:arbeidsplan': [{ lagret: '2026-10-01T10:00:00.000Z', skjema: { a: 1 } }] },
    egneRegler: [{ kode: 'x' }],
  });

  it('tåler ukjente felt på alle nivåer og beholder dem ved neste lagring', () => {
    const lager = new MinneLager();
    const lagret = {
      ...brukerdata(),
      nyttFelt: { fra: 'en nyere versjon' },
      innstillinger: { ...brukerdata().innstillinger, nyInnstilling: true },
      forside: { ...brukerdata().forside, nyVisning: ['a'] },
    };
    lager.setItem(LAGRINGSNOKKEL, JSON.stringify(lagret));
    const { data, status } = lesLagret(lager);
    expect(status).toBe('ok');
    expect(data).toEqual(lagret);
    expect(lager.getItem(SIKKERHETSKOPINOKKEL)).toBeNull();

    // Slik tilstanden endrer data: med spredning, så de ukjente feltene blir med.
    const endret = { ...data, favoritter: [...data.favoritter, 'ny'], forside: { ...data.forside, bareFavoritter: true } };
    skrivLagret(lager, endret);
    const igjen = JSON.parse(lager.getItem(LAGRINGSNOKKEL) ?? '{}') as Record<string, unknown>;
    expect(igjen).toMatchObject({
      nyttFelt: { fra: 'en nyere versjon' },
      innstillinger: { nyInnstilling: true, malform: 'nn' },
      forside: { nyVisning: ['a'], bareFavoritter: true },
      favoritter: ['begreper:arsramme', 'eksamen:eksamen', 'ny'],
    });
    expect(lesLagret(lager)).toEqual({ data: endret, status: 'ok' });
  });

  it('et ugyldig felt gjør ikke resten ugyldig', () => {
    const lager = new MinneLager();
    const lagret = { ...brukerdata(), skjultKildevarsel: 5, innstillinger: { ...brukerdata().innstillinger, tema: 'blaa', fylke: 'Oslo' } };
    lager.setItem(LAGRINGSNOKKEL, JSON.stringify(lagret));
    const { data, status } = lesLagret(lager, 'nb');
    expect(status).toBe('reparert');
    expect(data.favoritter).toEqual(brukerdata().favoritter);
    expect(data.scenarier).toEqual(brukerdata().scenarier);
    expect(data.egneRegler).toEqual(brukerdata().egneRegler);
    expect(data.skjultKildevarsel).toBeNull();
    // Gyldige innstillinger beholdes, de ugyldige får standardverdien.
    expect(data.innstillinger).toEqual({ malform: 'nn', tema: 'system', fylke: null, skole: null });
  });

  it('hopper over ugyldige elementer i lister og fjerner ugyldige valgfrie felt', () => {
    const lagret = {
      ...brukerdata(),
      favoritter: ['a', '', 7, null, 'b'],
      forside: { rekkefolge: ['x', 3], lukket: 'feil', bareFavoritter: 'ja', visning: 42, jukselapp: true },
    };
    const data = migrer(lagret);
    expect(data?.favoritter).toEqual(['a', 'b']);
    expect(data?.forside).toEqual({ rekkefolge: ['x'], lukket: [], bareFavoritter: false, jukselapp: true });
  });

  it('gir reserveverdier for påkrevde felt som mangler', () => {
    const { favoritter } = brukerdata();
    const lager = new MinneLager();
    lager.setItem(LAGRINGSNOKKEL, JSON.stringify({ skjemaversjon: 3, favoritter }));
    const { data, status } = lesLagret(lager, 'nn');
    expect(status).toBe('reparert');
    expect(data).toEqual({ ...standard('nn'), favoritter });
  });

  it('tar vare på råteksten før ugyldige data overskrives, og «Slett alt» sletter kopien', () => {
    const lager = new MinneLager();
    lager.setItem(LAGRINGSNOKKEL, '{"favoritter": ["a"');
    expect(lesLagret(lager).status).toBe('ugyldig');
    expect(lager.getItem(SIKKERHETSKOPINOKKEL)).toBe('{"favoritter": ["a"');
    // Neste lagring overskriver hovednøkkelen, men ikke kopien.
    skrivLagret(lager, standard());
    expect(lesLagret(lager).status).toBe('ok');
    expect(lager.getItem(SIKKERHETSKOPINOKKEL)).toBe('{"favoritter": ["a"');

    const reparert = JSON.stringify({ ...brukerdata(), skjultKildevarsel: 5 });
    lager.setItem(LAGRINGSNOKKEL, reparert);
    expect(lesLagret(lager).status).toBe('reparert');
    expect(lager.getItem(SIKKERHETSKOPINOKKEL)).toBe(reparert);

    slettLagret(lager);
    expect(lager.getItem(SIKKERHETSKOPINOKKEL)).toBeNull();
    expect(lager.data.size).toBe(0);
  });

  it('tar vare på data fra en nyere skjemaversjon før de overskrives', () => {
    const lager = new MinneLager();
    const nyere = JSON.stringify({ ...brukerdata(), skjemaversjon: SKJEMAVERSJON + 1 });
    lager.setItem(LAGRINGSNOKKEL, nyere);
    expect(lesLagret(lager).status).toBe('ugyldig');
    expect(lager.getItem(SIKKERHETSKOPINOKKEL)).toBe(nyere);
  });

  it('migrerer eldre versjoner og leser dem felt for felt', () => {
    const v1 = {
      skjemaversjon: 1,
      innstillinger: { malform: 'nn', tema: 'mork', fylke: '46', skole: null, gammelt: 1 },
      favoritter: ['vurdering:eksamen', 5],
      scenarier: {},
    };
    expect(migrer(v1)).toEqual({
      skjemaversjon: 3,
      innstillinger: { malform: 'nn', tema: 'mork', fylke: '46', skole: null, gammelt: 1 },
      favoritter: ['eksamen:eksamen'],
      scenarier: {},
      skjultKildevarsel: null,
      forside: standard().forside,
    });
  });

  it('eksport og import tar med ukjente felt', () => {
    const data = { ...brukerdata(), ukjent: 'beholdes' };
    expect(lesEksport(lagEksport(data, '0.50.0', new Date('2026-10-09T10:00:00Z')))).toEqual(data);
  });

  it('kaster ikke når kopien ikke kan lagres', () => {
    const fullt: Lager = {
      getItem: () => '{ikke json',
      setItem() {
        throw new Error('QuotaExceededError');
      },
      removeItem() {},
    };
    expect(lesLagret(fullt).status).toBe('ugyldig');
  });
});
