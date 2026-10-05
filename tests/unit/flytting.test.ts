import { describe, expect, it } from 'vitest';
import { erFlyttet, FLYTTEPARAMETER, flyttelenke, lesFlytting } from '../../src/app/flytting.ts';
import { standard } from '../../src/core/lagring/lagring.ts';

describe('flytting til ny adresse', () => {
  it('tar med innstillingene og favorittene i lenken, også æøå', () => {
    const data = {
      ...standard('nn'),
      innstillinger: { malform: 'nn' as const, tema: 'mork' as const, fylke: '46', skole: { id: '974', navn: 'Årstad vgs – Bjørgvin' } },
      favoritter: ['begreper:arsramme', 'fylker:46'],
    };
    const lenke = flyttelenke('https://jukselappen.no/', data, '0.36.1', new Date('2026-10-05T12:00:00Z'));
    expect(lenke.startsWith(`https://jukselappen.no/#/innstillinger?${FLYTTEPARAMETER}=`)).toBe(true);
    // Lenken kan brukes som den er: bare tegn som ikke må kodes i adressen.
    expect(lenke.split('=')[1]).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(lesFlytting(lenke.split('=')[1] ?? '')).toEqual(data);
  });

  it('gir null for verdier som ikke kan leses', () => {
    expect(lesFlytting('ikke-gyldig')).toBeNull();
    expect(lesFlytting('')).toBeNull();
  });

  it('ser bare etter flyttingen på github.io', async () => {
    expect(await erFlyttet('localhost')).toBe(false);
    expect(await erFlyttet('jukselappen.no')).toBe(false);
  });
});
