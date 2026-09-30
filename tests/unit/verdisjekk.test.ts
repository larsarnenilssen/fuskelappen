// Verdisjekken: tall på norsk, sitat i kildeteksten og forslag når tallet er endret.
import { describe, expect, it } from 'vitest';
import { lagKontrollindeks, tellKontroll } from '../../src/core/kontroll/indeks.ts';
import { finnTall, lesTall } from '../../src/core/kontroll/tekst.ts';
import { sjekkbareVerdier, sjekkSitat, sjekkVerdier } from '../../src/core/kontroll/verdisjekk.ts';
import type { Innholdselement } from '../../src/core/innhold/skjema.ts';
import type { Regelsett } from '../../src/core/regler/skjema.ts';
import { lagKontrollrapport } from '../../scripts/kontroll/rapport.ts';

describe('tall på norsk', () => {
  it('leser desimalkomma og tusenskille med mellomrom eller punktum', () => {
    expect(finnTall('et årsverk på 1687,5 timer (1650 timer').map((t) => t.verdi)).toEqual([1687.5, 1650]);
    expect(finnTall('1.300, 1.225 og 1.150 timer').map((t) => t.verdi)).toEqual([1300, 1225, 1150]);
    expect(finnTall('minimum kr. 12 000 pr. år').map((t) => t.verdi)).toEqual([12000]);
    expect(finnTall('årsramme 607,5/810 og 1-15 elever').map((t) => t.verdi)).toEqual([607.5, 810, 1, 15]);
    expect(lesTall('12,0')).toBe(12);
  });

  it('tar bare første ledd i punktnumre og datoer', () => {
    expect(finnTall('6.5.3 50 %').map((t) => t.verdi)).toEqual([6, 50]);
    expect(finnTall('gjelder fra 1.1.2026').map((t) => t.verdi)).toEqual([1]);
  });
});

const kilde = 'Lærernes samlede arbeidsoppgaver skal utføres innenfor et årsverk på 1687,5 timer (1650 timer for lærere som er 60 år og eldre). a) Arbeidsårets lengde';
const sitat = 'utføres innenfor et årsverk på 1687,5 timer (1650 timer for lærere som er 60 år og eldre)';

describe('sitat i kildeteksten', () => {
  it('samsvarer når sitatet står i kilden, også med andre mellomrom og linjeskift', () => {
    expect(sjekkSitat(sitat, 1687.5, kilde.replace('årsverk på', 'årsverk\n  på')).status).toBe('samsvarer');
  });

  it('gir forslag med det nye tallet når tallet er endret', () => {
    const ny = kilde.replace('1687,5', '1 700');
    expect(sjekkSitat(sitat, 1687.5, ny)).toEqual({ status: 'avvik', forslag: 1700, melding: 'Kilden har nå 1 700 der verdien sto.' });
  });

  it('samsvarer fortsatt når bare et annet tall i sitatet er endret', () => {
    const ny = kilde.replace('1687,5', '1700');
    const r = sjekkSitat(sitat, 1650, ny);
    expect(r.status).toBe('samsvarer');
    expect(r.forslag).toBeNull();
    expect(r.melding).toMatch(/andre tall i sitatet er endret/);
  });

  it('avvik uten forslag når teksten rundt tallet er endret', () => {
    expect(sjekkSitat(sitat, 1687.5, 'Årsverket er 1687,5 timer.')).toEqual({ status: 'avvik', forslag: null, melding: 'Sitatet står ikke lenger i kilden.' });
  });
});

const regelsett: Regelsett[] = [
  {
    id: 'test-2026',
    regelverk: 'test',
    gyldig_fra: '2026-01-01',
    gyldig_til: '2026-12-31',
    kilde: 'kilde-a',
    gyldighet: { niva: 'nasjonal' },
    verdier: {
      arsverk: { verdi: 1687.5, kilde: { id: 'kilde-a', punkt: '4' }, kontrollert: null, sitat },
      arsverk_60: { verdi: 1650, kilde: { id: 'kilde-a', punkt: '4' }, kontrollert: { dato: '2026-01-10' }, sitat },
      uten_sitat: { verdi: 5, kilde: { id: 'kilde-b' }, kontrollert: null, grunnlag: 'praksis', merknad: 'Praksis.' },
      tabell: { verdi: [{ a: 1 }], kilde: { id: 'kilde-a' }, kontrollert: null },
    },
  },
];

describe('verdisjekk for alle verdier', () => {
  it('sjekker bare tallverdier med sitat, og beholder «siden» når statusen er den samme', () => {
    const verdier = sjekkbareVerdier(regelsett);
    expect(verdier.map((v) => v.nokkel)).toEqual(['test-2026/arsverk', 'test-2026/arsverk_60']);
    const forste = sjekkVerdier(verdier, { 'kilde-a': { tekst: kilde } }, null, '2026-10-05T04:17:00Z');
    expect(forste.verdier['test-2026/arsverk']).toMatchObject({ status: 'samsvarer', siden: '2026-10-05T04:17:00Z' });
    const andre = sjekkVerdier(verdier, { 'kilde-a': { tekst: kilde } }, forste, '2026-10-12T04:17:00Z');
    expect(andre.verdier['test-2026/arsverk']).toMatchObject({ sjekket: '2026-10-12T04:17:00Z', siden: '2026-10-05T04:17:00Z' });
    const endret = sjekkVerdier(verdier, { 'kilde-a': { tekst: kilde.replace('1687,5', '1700') } }, andre, '2026-10-19T04:17:00Z');
    expect(endret.verdier['test-2026/arsverk']).toMatchObject({ status: 'avvik', forslag: 1700, siden: '2026-10-19T04:17:00Z' });
  });

  it('er «ikke sjekket» når kilden ikke kunne leses eller ikke sjekkes', () => {
    const verdier = sjekkbareVerdier(regelsett);
    const feilet = sjekkVerdier(verdier, { 'kilde-a': { feil: 'Tidsavbrudd' } }, null, '2026-10-05T04:17:00Z');
    expect(feilet.verdier['test-2026/arsverk']).toMatchObject({ status: 'ikke_sjekket', melding: 'Kilden kunne ikke leses: Tidsavbrudd' });
    const ikke = sjekkVerdier(verdier, {}, null, '2026-10-05T04:17:00Z');
    expect(ikke.verdier['test-2026/arsverk']?.status).toBe('ikke_sjekket');
  });
});

describe('kontrollindeks og kontrollrapport', () => {
  const innhold: { fil: string; element: Innholdselement }[] = [
    {
      fil: 'content/test.yaml',
      element: {
        id: 'arsverk',
        type: 'begrep',
        tittel: { nb: 'Årsverk', nn: 'Årsverk' },
        tekst: { nb: 'Tekst.', nn: 'Tekst.' },
        gyldighet: { niva: 'nasjonal' },
        kilder: [
          { id: 'kilde-a', punkt: '4' },
          { id: 'kilde-a', punkt: '5.1' },
        ],
        kontrollert: null,
        stikkord: [],
        relatert: [],
      },
    },
  ];
  const register = {
    kilder: [
      { id: 'kilde-a', navn: 'Kilde A', url: 'https://example.org/a', aktiv: true, sjekkmetode: 'side' },
      { id: 'kilde-b', navn: 'Kilde B', url: 'https://example.org/b', aktiv: false, sjekkmetode: 'ingen' },
    ],
  } as unknown as Parameters<typeof lagKontrollrapport>[1];
  const kildestatus = {
    skjema: 1 as const,
    kjort: '2026-10-05T04:17:00Z',
    kilder: { 'kilde-a': { status: 'endret' as const, sjekket: '2026-10-05T04:17:00Z', fingeravtrykk: 'x', endret_siden: '2026-10-05T04:17:00Z', melding: null } },
  };
  const verdistatus = sjekkVerdier(sjekkbareVerdier(regelsett), { 'kilde-a': { tekst: kilde.replace('1687,5', '1700') } }, null, '2026-10-05T04:17:00Z');
  const indeks = lagKontrollindeks(register.kilder, regelsett, innhold, kildestatus.kilder, verdistatus, '2026-10-06');

  it('samler verdier og innhold per kilde, med ett innholdselement per kilde og alle punktene', () => {
    const a = indeks.find((k) => k.kilde === 'kilde-a');
    expect(a?.verdier.map((v) => v.nokkel)).toEqual(['arsverk', 'arsverk_60', 'tabell']);
    expect(a?.innhold).toHaveLength(1);
    expect(a?.innhold[0]?.punkter).toEqual(['4', '5.1']);
    expect(a?.verdier.find((v) => v.nokkel === 'arsverk_60')?.eier).toBe('kilde_endret');
  });

  it('teller status for eiers kontroll og for den automatiske sjekken', () => {
    expect(tellKontroll(indeks)).toMatchObject({ kildeEndret: 1, ikkeKontrollert: 4, samsvarer: 1, avvik: 1, utenSitat: 0 });
  });

  it('rapporten viser det som må ses på, og tabellene per kilde', () => {
    const md = lagKontrollrapport(indeks, register, kildestatus, verdistatus, '2026-10-06');
    expect(md).toContain('Oppdatert 06.10.2026.');
    expect(md).toContain('- **Kilde A:** ⚠️ endret siden 05.10.2026, venter på godkjenning');
    expect(md).toContain('- `test-2026/arsverk`: ⚠️ avvik siden 05.10.2026. Kilden har nå 1700 der verdien sto.');
    expect(md).toContain('- `test-2026/arsverk_60`: ⚠️ kilden er endret etter kontrollen 10.01.2026');
    expect(md).toContain('| Årsverk (`arsverk`) | begrep | 4, 5.1 | `content/test.yaml` | ikke kontrollert |');
    expect(md).toContain('| `uten_sitat` (test-2026) | – | 5 | praksis, sjekkes ikke automatisk | ikke kontrollert |');
  });
});
