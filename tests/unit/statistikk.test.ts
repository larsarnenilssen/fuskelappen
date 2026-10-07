// Nøkkeltallene fra Udirs statistikkbank (avgjørelse 080): CSV-en leses riktig, radene får riktig enhet, og
// gjennomføringen regnes om fra fylkene før 2020 til dagens fylker.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { validerStatistikk } from '../../scripts/hent-statistikk.ts';
import { enhetsrader, kolonne, lesCsv, regnOmTilNyeFylker, tall } from '../../scripts/statistikk/udir.ts';
import { statistikkSkjema } from '../../src/core/statistikk/skjema.ts';

const rot = join(__dirname, '../..');

const CSV = [
  'sep=\t',
  'EnhetNivaa\tNasjonaltkode\tFylkekode\tOrganisasjonsnummer\tNasjonalt\tFylke\tEnhetNavn\t2025-26.Alle trinn.Antall elever\t2025-26.Alle trinn.Antall skoler',
  '1\tI\t00\tI\tHele landet\tAlle fylker\tAlle skoler\t193 809\t418',
  '2\tI\t46\t46\tHele landet\tVestland\tAlle skoler\t22 706\t56',
  '3\tI\t46\t974557320\tHele landet\tVestland\tSlåtthaug videregående skole\t489\t',
  '2\tI\tUF\tUF\tHele landet\tUkjent\tAlle skoler\t*\t',
].join('\r\n');

describe('lesingen av tabellene fra statistikkbanken', () => {
  it('leser tall med mellomrom og desimalkomma, skjermede tall som «*» og tomme som null', () => {
    expect(tall('193 809')).toBe(193809);
    expect(tall('81,8')).toBe(81.8);
    expect(tall('*')).toBe('*');
    expect(tall('')).toBeNull();
    expect(tall('-')).toBeNull();
  });

  it('finner kolonnen på delene i navnet, og radene får landet, fylket og skolen som enhet', () => {
    const t = lesCsv(CSV);
    expect(kolonne(t, '2025-26', 'Antall elever')).toBe(7);
    expect(kolonne(t, '2024-25', 'Antall elever')).toBe(-1);
    const rader = enhetsrader(t);
    expect(rader.map((r) => r.enhet)).toEqual(['L', 'F46', 'S974557320']);
    expect(rader[2]).toMatchObject({ fylke: '46', navn: 'Slåtthaug videregående skole' });
  });

  it('regner om gjennomføringen fra fylkene før 2020 med tellerne og nevnerne (Vestland er Hordaland og Sogn og Fjordane)', () => {
    const ut = regnOmTilNyeFylker({ '12': { teller: 5130, nevner: 6332 }, '14': { teller: 1323, nevner: 1572 }, '03': { teller: 5969, nevner: 7000 }, '09': { teller: '*', nevner: 1556 }, '10': { teller: 2114, nevner: 2561 } });
    expect(ut.F46).toBe(81.6);
    expect(ut.F03).toBe(85.3);
    // Et skjermet tall i ett av de gamle fylkene gir ingen andel for det nye.
    expect(ut.F42).toBeNull();
  });
});

describe('datafilen', () => {
  const fil = join(rot, 'data/statistikk/statistikk.json');
  it.runIf(existsSync(fil))('følger skjemaet og har tall for landet, alle fylkene og skolene', () => {
    const d = statistikkSkjema.parse(JSON.parse(readFileSync(fil, 'utf8')));
    expect(validerStatistikk(d)).toEqual([]);
  });
});
