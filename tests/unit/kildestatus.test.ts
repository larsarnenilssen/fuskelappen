import { describe, expect, it } from 'vitest';
import { erUtdatert, lesKildestatus, samletStatus, type Kildestatusfil } from '../../src/core/kildestatus/kildestatus.ts';

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
    expect(samletStatus(fil('2026-09-28T03:00:00Z', 'ok', 'endret'), naa)).toBe('endret');
    expect(samletStatus(fil('2026-09-28T03:00:00Z', 'endret', 'feilet'), naa)).toBe('feilet');
  });

  it('avviser ugyldig statusfil', () => {
    expect(lesKildestatus({ skjema: 2 })).toBeNull();
    expect(lesKildestatus(fil('2026-09-28T03:00:00Z', 'ok'))).not.toBeNull();
  });
});
