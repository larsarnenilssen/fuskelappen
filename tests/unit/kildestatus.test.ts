import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { app } from '../../src/config/app.ts';
import {
  ENDRET_NYLIG_DAGER,
  erEndretNylig,
  erUtdatert,
  kildevisning,
  tellKilder,
  lesKildestatus,
  nesteKildesjekk,
  samletStatus,
  varselnokkel,
  visningsstatus,
  type Kildestatusfil,
} from '../../src/core/kildestatus/kildestatus.ts';

const post = (status: 'ok' | 'endret' | 'feilet') => ({
  status,
  sjekket: '2026-09-28T03:00:00Z',
  fingeravtrykk: null,
  endret_siden: null,
  melding: null,
});

const fil = (kjort: string, ...statuser: ('ok' | 'endret' | 'feilet')[]): Kildestatusfil => ({
  skjema: 1,
  kjort,
  kilder: Object.fromEntries(statuser.map((s, i) => [`k${i}`, post(s)])),
});

describe('kildestatus', () => {
  const naa = new Date('2026-09-29T12:00:00Z');

  it('er utdatert når siste kjøring er eldre enn 14 dager', () => {
    expect(erUtdatert('2026-09-15T12:00:01Z', naa)).toBe(false);
    expect(erUtdatert('2026-09-15T11:59:59Z', naa)).toBe(true);
    expect(erUtdatert('ikke en dato', naa)).toBe(true);
    expect(samletStatus(fil('2026-09-01T00:00:00Z', 'ok'), naa)).toBe('utdatert');
  });

  it('samlet status', () => {
    expect(samletStatus(null, naa)).toBe('ukjent');
    expect(samletStatus(fil('2026-09-28T03:00:00Z', 'ok', 'ok'), naa)).toBe('ok');
    // At en kilde er endret, er ikke et varsel i appen (avgjørelse 089).
    expect(samletStatus(fil('2026-09-28T03:00:00Z', 'ok', 'endret'), naa)).toBe('ok');
    expect(samletStatus(fil('2026-09-28T03:00:00Z', 'endret', 'feilet'), naa)).toBe('feilet');
  });

  it('viser om kilden virker eller ikke svarer, og for seg om den er endret de siste 30 dagene (avgjørelse 107)', () => {
    expect(ENDRET_NYLIG_DAGER).toBe(30);
    expect(kildevisning(post('ok'))).toBe('virker');
    // «endret» betyr at eier ikke har gått gjennom endringen. Det vises ikke; datoen for endringen gjør.
    expect(kildevisning(post('endret'))).toBe('virker');
    expect(erEndretNylig(post('endret'), naa)).toBe(false);
    // En kilde som er endret nylig, virker også.
    const endret = { ...post('endret'), endret_siden: '2026-09-01T04:00:00Z' };
    expect(kildevisning(endret)).toBe('virker');
    expect(erEndretNylig(endret, naa)).toBe(true);
    // 30 dager før 29.09 kl. 12 er 30.08 kl. 12.
    expect(erEndretNylig({ ...post('ok'), endret_siden: '2026-08-30T12:00:00Z' }, naa)).toBe(true);
    expect(erEndretNylig({ ...post('ok'), endret_siden: '2026-08-30T11:59:59Z' }, naa)).toBe(false);
    expect(kildevisning(post('feilet'))).toBe('svarerIkke');
    expect(erEndretNylig({ ...post('feilet'), endret_siden: '2026-09-20T04:00:00Z' }, naa)).toBe(true);
    const f = fil('2026-09-28T03:00:00Z', 'ok', 'endret', 'feilet');
    f.kilder.k0 = { ...post('ok'), endret_siden: '2026-09-20T04:00:00Z' };
    expect(tellKilder(f, naa)).toEqual({ virker: 2, svarerIkke: 1, endretNylig: 1 });
  });

  it('avviser ugyldig statusfil', () => {
    expect(lesKildestatus({ skjema: 2 })).toBeNull();
    expect(lesKildestatus(fil('2026-09-28T03:00:00Z', 'ok'))).not.toBeNull();
  });
});

describe('skjult varsel', () => {
  const naa = new Date('2026-09-29T12:00:00Z');
  const feilet = fil('2026-09-28T03:00:00Z', 'feilet');

  it('skjuler bare det varselet brukeren har valgt', () => {
    const nokkel = varselnokkel(feilet, 'feilet');
    expect(nokkel).toBe('2026-09-28T03:00:00Z|feilet');
    expect(visningsstatus(feilet, naa, nokkel)).toBe('skjult');
    expect(visningsstatus(feilet, naa, null)).toBe('feilet');
  });

  it('viser varselet igjen etter neste kjøring eller ny status', () => {
    const skjult = varselnokkel(feilet, 'feilet');
    expect(visningsstatus(fil('2026-09-29T03:00:00Z', 'feilet'), naa, skjult)).toBe('feilet');
    expect(visningsstatus(fil('2026-09-28T03:00:00Z', 'endret'), naa, skjult)).toBe('ok');
    // Blir statusen utdatert, er det et nytt varsel.
    expect(visningsstatus(feilet, new Date('2026-10-20T12:00:00Z'), skjult)).toBe('utdatert');
  });

  it('ok og ukjent kan ikke skjules', () => {
    expect(varselnokkel(fil('2026-09-28T03:00:00Z', 'ok'), 'ok')).toBeNull();
    expect(varselnokkel(null, 'ukjent')).toBeNull();
  });
});

describe('neste kildesjekk', () => {
  const plan = { ukedag: 1, time: 4, minutt: 17 };

  it('finner neste mandag kl. 04:17 UTC', () => {
    // Tirsdag 29.9.2026 → mandag 5.10.2026
    expect(nesteKildesjekk(new Date('2026-09-29T12:00:00Z'), plan).toISOString()).toBe('2026-10-05T04:17:00.000Z');
    // Mandag før kjøringen → samme dag
    expect(nesteKildesjekk(new Date('2026-10-05T04:00:00Z'), plan).toISOString()).toBe('2026-10-05T04:17:00.000Z');
    // Mandag etter kjøringen → uka etter
    expect(nesteKildesjekk(new Date('2026-10-05T04:17:00Z'), plan).toISOString()).toBe('2026-10-12T04:17:00.000Z');
  });

  it('planen i app.ts stemmer med cron i kilder.yml', () => {
    const yml = readFileSync(join(__dirname, '../../.github/workflows/kilder.yml'), 'utf8');
    const cron = /cron:\s*'([^']+)'/.exec(yml)?.[1];
    const { minutt, time, ukedag } = app.kildesjekk;
    expect(cron).toBe(`${minutt} ${time} * * ${ukedag}`);
  });
});
