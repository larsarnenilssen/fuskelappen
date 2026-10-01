// Lenker til kildene eier sjekker kontrollspørsmål og praksis mot (scripts/kontroll/kildelenker.ts).
import { describe, expect, it } from 'vitest';
import { kildelenker, praksiskilder } from '../../scripts/kontroll/kildelenker.ts';
import type { Kilderegister } from '../../src/core/innhold/skjema.ts';
import type { Kildekontroll } from '../../src/core/kontroll/indeks.ts';

const register = {
  kilder: [
    { id: 'sfs', navn: 'SFS 2213', url: 'https://ks.no/sfs' },
    { id: 'skriv', navn: 'Udirs skriv', url: 'https://udir.no/skriv/' },
  ],
} as unknown as Kilderegister;

describe('kildelenker', () => {
  it('samler punktene per kilde, og viser egne adresser for seg', () => {
    expect(
      kildelenker(
        [
          { id: 'sfs', punkt: '5.1', url: null },
          { id: 'sfs', punkt: '5.2', url: null },
          { id: 'sfs', punkt: 'Vedlegg 1', url: null },
          { id: 'skriv', punkt: '3.1', url: 'https://udir.no/skriv/#3.1' },
          { id: 'ukjent', punkt: null, url: null },
        ],
        register,
      ),
    ).toBe('[SFS 2213](https://ks.no/sfs): punkt 5.1, punkt 5.2 og Vedlegg 1; [Udirs skriv](https://udir.no/skriv/#3.1): punkt 3.1; ukjent');
  });

  it('finner kildene bak det en praksis berører: regelverdier og innhold', () => {
    const indeks: Kildekontroll[] = [
      {
        kilde: 'sfs',
        verdier: [{ type: 'verdi', id: 'r/arsverk', regelsett: 'r', nokkel: 'arsverk', punkt: '4', verdi: 1687.5, enhet: null, grunnlag: 'kilde', harSitat: true, eier: 'utkast', kontrollert: null, auto: null }],
        innhold: [{ type: 'innhold', id: 'metode', tittel: 'Metode', elementtype: 'forklaring', fil: 'f', punkter: ['5.2'], eier: 'utkast', kontrollert: null, sporsmal: ['?'], kilder: [{ id: 'sfs', punkt: '5.2', url: null }] }],
      },
    ];
    expect(kildelenker(praksiskilder({ berorer: ['r/arsverk', 'metode'] }, indeks), register)).toBe('[SFS 2213](https://ks.no/sfs): punkt 4 og punkt 5.2');
  });
});
