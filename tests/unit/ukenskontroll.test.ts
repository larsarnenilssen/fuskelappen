// Ukens kontroll i kontrollsaken (avgjørelse 106): fem punkter som ikke er kontrollert, valgt etter risiko og rotert
// med ukenummeret, i en del som ikke gir e-post, med samme avkrysning som kontrollrunden.
import { describe, expect, it } from 'vitest';
import { avkryssede } from '../../scripts/kilder/godkjenning.ts';
import { lagUkesrapport, planleggKontrollsak, type Ukesgrunnlag } from '../../scripts/kilder/ukesrapport.ts';
import { ikkeKontrollert, lagUkensKontroll, risikoniva, ukenummer, velgUkensKontroll } from '../../scripts/kilder/ukenskontroll.ts';
import { lesMerke, planleggVarsel, punktlinjer } from '../../scripts/varsel/plan.ts';
import type { Kilderegister } from '../../src/core/innhold/skjema.ts';
import type { Kildekontroll, Kontrollinnhold, Kontrollverdi } from '../../src/core/kontroll/indeks.ts';

const verdi = (id: string, over: Partial<Kontrollverdi> = {}): Kontrollverdi => ({
  type: 'verdi',
  id,
  regelsett: id.split('/')[0] ?? '',
  nokkel: id.split('/')[1] ?? '',
  punkt: '4',
  verdi: 1687.5,
  enhet: 'timer',
  grunnlag: 'kilde',
  harSitat: true,
  eier: 'utkast',
  kontrollert: null,
  auto: null,
  ...over,
});

const innhold = (id: string, fil: string, over: Partial<Kontrollinnhold> = {}): Kontrollinnhold => ({
  type: 'innhold',
  id,
  tittel: `Tittel ${id}`,
  elementtype: 'forklaring',
  fil,
  punkter: [],
  eier: 'utkast',
  kontrollert: null,
  sporsmal: [`Stemmer ${id}?`],
  kilder: [{ id: 'lov', punkt: '§ 1-1', url: null }],
  ...over,
});

const samsvar = { status: 'samsvarer' as const, kilde: 'avtale', sjekket: '2026-10-05', siden: '2026-10-05', forslag: null, melding: null };

const indeks: Kildekontroll[] = [
  {
    kilde: 'avtale',
    verdier: [verdi('s/arsverk', { auto: samsvar }), verdi('s/avledet', { grunnlag: 'avledet' }), verdi('s/ferdig', { eier: 'kontrollert', kontrollert: '2026-10-01' }), verdi('s/avvik', { auto: { ...samsvar, status: 'avvik' } })],
    innhold: [],
  },
  {
    kilde: 'lov',
    verdier: [],
    innhold: [
      innhold('bortvisning', 'content/skolemiljo/skoleregler.yaml'),
      innhold('fagvalg', 'content/fag/fagvalg.yaml'),
      innhold('arsverk', 'content/begreper/arbeidstid.yaml', { elementtype: 'begrep' }),
      innhold('frister-vestland', 'content/inntak/frister-vestland.yaml'),
      innhold('gammel', 'content/vurdering/x.yaml', { eier: 'bor_kontrolleres', kontrollert: '2025-01-01' }),
    ],
  },
  // Samme element under to kilder skal bare telles én gang.
  { kilde: 'annen', verdier: [], innhold: [innhold('bortvisning', 'content/skolemiljo/skoleregler.yaml')] },
];

const register = {
  kilder: [
    { id: 'lov', navn: 'Opplæringslova', url: 'https://lovdata.no/lov/2023-06-09-30', aktiv: true, godkjent: '2026-10-08' },
    { id: 'avtale', navn: 'SFS 2213', url: 'https://example.org/sfs', aktiv: true, godkjent: '2026-10-08' },
    { id: 'annen', navn: 'Annen', url: 'https://example.org/annen', aktiv: true, godkjent: '2026-10-08' },
  ],
} as unknown as Kilderegister;

describe('ukens kontroll: utvalget', () => {
  it('tar bare det som ikke er kontrollert, én gang hvert, og ikke verdier med avvik (de står for seg)', () => {
    expect(ikkeKontrollert(indeks).map((p) => p.id).sort()).toEqual(['arsverk', 'bortvisning', 'fagvalg', 'frister-vestland', 's/arsverk', 's/avledet']);
  });

  it('ordner etter risiko: verdier uten samsvar, verdier med samsvar, tunge moduler, annet innhold, begreper og fylker', () => {
    const fylke = new Set(['frister-vestland']);
    const niva = Object.fromEntries(ikkeKontrollert(indeks).map((p) => [p.id, risikoniva(p, fylke)]));
    expect(niva).toEqual({ 's/avledet': 0, 's/arsverk': 1, bortvisning: 2, fagvalg: 3, arsverk: 4, 'frister-vestland': 4 });
    expect(velgUkensKontroll(ikkeKontrollert(indeks), '2026-10-12', 4, fylke).map((p) => p.id)).toEqual(['s/avledet', 's/arsverk', 'bortvisning', 'fagvalg']);
  });

  it('er lik for samme uke og roterer innenfor nivået fra uke til uke, så alt kommer igjen', () => {
    const mange = Array.from({ length: 12 }, (_, i) => verdi(`r/v${String(i).padStart(2, '0')}`));
    const uke = (d: string) => velgUkensKontroll(mange, d, 5).map((p) => p.id);
    expect(ukenummer('2026-10-13')).toBe(ukenummer('2026-10-12'));
    expect(ukenummer('2026-10-19')).toBe(ukenummer('2026-10-12') + 1);
    expect(uke('2026-10-12')).toEqual(uke('2026-10-18'));
    expect(uke('2026-10-19')).not.toEqual(uke('2026-10-12'));
    const sett = new Set(['2026-10-12', '2026-10-19', '2026-10-26'].flatMap(uke));
    expect(sett.size).toBe(12);
  });

  it('det som blir kontrollert, faller ut av seg selv', () => {
    const forst = velgUkensKontroll(ikkeKontrollert(indeks), '2026-10-12', 2).map((p) => p.id);
    expect(forst).toContain('s/avledet');
    const etter = indeks.map((k) => ({ ...k, verdier: k.verdier.map((v) => (v.id === 's/avledet' ? { ...v, eier: 'kontrollert' as const, kontrollert: '2026-10-12' } : v)) }));
    expect(velgUkensKontroll(ikkeKontrollert(etter), '2026-10-12', 2).map((p) => p.id)).not.toContain('s/avledet');
  });
});

describe('ukens kontroll i saken', () => {
  const ukens = lagUkensKontroll(indeks, register, '2026-10-12', 'eier/repo', { antall: 3, verdidetaljer: new Map([['s/arsverk', { sitat: 'et årsverk på 1687,5 timer' }]]) });

  it('viser tittel, verdi, sitat, kontrollspørsmål og kilder med lenke, og avkrysning som /godkjent kan lese', () => {
    const tekst = ukens.linjer.join('\n');
    expect(ukens.antall).toBe(3);
    expect(tekst).toContain('## Ukens kontroll');
    expect(tekst).toContain('- [ ] Regelverdien `s/arsverk`: 1687,5 timer <!-- kontroll:verdi:s/arsverk -->');
    expect(tekst).toContain('  - Sitat: «et årsverk på 1687,5 timer»');
    expect(tekst).toContain('- [ ] «Tittel bortvisning» (forklaring i [content/skolemiljo/skoleregler.yaml](https://github.com/eier/repo/blob/main/content/skolemiljo/skoleregler.yaml)) <!-- kontroll:innhold:bortvisning -->');
    expect(tekst).toContain('  - Spørsmål: Stemmer bortvisning?');
    expect(tekst).toContain('  - Kilder å sjekke mot: [Opplæringslova](https://lovdata.no/lov/2023-06-09-30): § 1-1');
    expect(tekst).toContain('Ikke kontrollert ennå: 2 regelverdier og 4 tekster.');
    expect(avkryssede(tekst.replaceAll('- [ ]', '- [x]'))).toEqual([
      { type: 'verdi', id: 's/avledet' },
      { type: 'verdi', id: 's/arsverk' },
      { type: 'innhold', id: 'bortvisning' },
    ]);
  });

  it('er tom når alt er kontrollert', () => {
    expect(lagUkensKontroll([], register, '2026-10-12', 'eier/repo')).toEqual({ linjer: [], antall: 0 });
  });

  const grunnlag = (over: Partial<Ukesgrunnlag> = {}): Ukesgrunnlag => ({
    register,
    kildestatus: { skjema: 1, kjort: '2026-10-12T04:17:00Z', kilder: {} },
    verdistatus: null,
    endringer: {},
    // Uten innhold som bør kontrolleres på nytt, så bare ukens kontroll står igjen.
    indeks: indeks.map((k) => ({ ...k, innhold: k.innhold.filter((i) => i.eier === 'utkast') })),
    repo: 'eier/repo',
    ...over,
  });

  it('holder saken åpen uten å gi e-post hver uke, selv om utvalget skifter', () => {
    const r = lagUkesrapport(grunnlag({ ukens }));
    expect(r).toMatchObject({ aapen: true, punkter: 0, tittel: 'Kontroll: ukens kontroll' });
    expect(punktlinjer(r.tekst)).toEqual([]);
    const [opprett] = planleggKontrollsak(r, null, [], '2026-10-12');
    expect(opprett?.type).toBe('opprett');
    const sak = { nummer: 7, tekst: opprett && 'tekst' in opprett ? opprett.tekst : '' };
    // Neste uke er utvalget et annet, men det gir ingen kommentar. Heller ingen påminnelse etter to eller fire uker.
    const neste = lagUkesrapport(grunnlag({ ukens: lagUkensKontroll(indeks, register, '2026-10-19', 'eier/repo', { antall: 3 }) }));
    expect(planleggKontrollsak(neste, sak, [], '2026-10-19')[0]).toMatchObject({ type: 'oppdater', kommentar: null });
    expect(planleggKontrollsak(neste, sak, [], '2026-11-09')[0]).toMatchObject({ type: 'oppdater', kommentar: null });
    // Saken lukkes ikke så lenge noe ikke er kontrollert.
    expect(planleggKontrollsak(neste, sak, [], '2026-11-09')[0]?.type).not.toBe('lukk');
  });

  it('gir e-post som før når noe annet nytt kommer til, med ukens kontroll i hele listen', () => {
    const sak = { nummer: 7, tekst: lagret(planleggKontrollsak(lagUkesrapport(grunnlag({ ukens })), null, [], '2026-10-12')[0]) };
    const feilet = { status: 'feilet' as const, sjekket: '2026-10-19T04:17:00Z', fingeravtrykk: null, endret_siden: null, melding: 'Feil' };
    const r = lagUkesrapport(grunnlag({ ukens, kildestatus: { skjema: 1, kjort: '2026-10-19T04:17:00Z', kilder: { lov: feilet } } }));
    const [h] = planleggKontrollsak(r, sak, [], '2026-10-19');
    const kommentar = h && 'kommentar' in h ? (h.kommentar ?? '') : '';
    expect(kommentar).toContain('Nytt siden sist');
    expect(kommentar).toContain('## Ukens kontroll');
    expect([...(lesMerke(lagret(h))?.punkter ?? [])]).toHaveLength(1);
  });

  it('påminnelsen annenhver uke gjelder fortsatt det som står utenfor ukens kontroll', () => {
    const tekst = `- A feilet\n\n${ukens.linjer.join('\n')}`;
    const varsel = (idag: string) => ({ tittel: 'Sak', tekst, idag, paminnelseDager: 14, lukk: () => 'Løst.' });
    const sak = { nummer: 1, tekst: lagret(planleggVarsel(varsel('2026-10-05'), null)[0]) };
    expect(planleggVarsel(varsel('2026-10-19'), sak)[0]).toMatchObject({ kommentar: expect.stringContaining('Påminnelse') });
  });
});

describe('lenker til fylkene i kontrollsaken', () => {
  it('lister lenkene som ikke er bekreftet på åtte uker, med lenke og avkrysning som setter bekreftet', () => {
    const r = lagUkesrapport({
      register,
      kildestatus: { skjema: 1, kjort: '2026-12-07T04:17:00Z', kilder: {} },
      verdistatus: null,
      endringer: {},
      indeks: [],
      repo: 'eier/repo',
      fylkeslenker: [{ fylke: '46', navn: 'Vestland fylkeskommune', tema: 'inntak', url: 'https://www.vestlandfylke.no/inntak/', bekreftet: '2026-10-09' }],
    });
    expect(r).toMatchObject({ aapen: true, punkter: 1 });
    expect(r.tekst).toContain('- [ ] [Vestland fylkeskommune: inntak](https://www.vestlandfylke.no/inntak/), sist bekreftet 09.10.2026 <!-- fylkeslenke:46:inntak -->');
    expect(avkryssede(r.tekst.replace('- [ ] [Vestland', '- [x] [Vestland'))).toEqual([{ type: 'fylkeslenke', id: '46:inntak' }]);
  });
});

function lagret(h: ReturnType<typeof planleggVarsel>[number] | undefined): string {
  return h && 'tekst' in h ? h.tekst : '';
}
