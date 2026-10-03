// Steg 2 i kontrollsystemet: endringer per punkt, tabeller rad for rad, Grep-endringer og den ukentlige
// kontrollsaken (avgjørelse 018).
import { describe, expect, it } from 'vitest';
import { delIBiter, finnEndringer, naermestePunkt } from '../../scripts/kilder/avsnitt.ts';
import { grepsammendrag, sammenlignGrep, type Grepdata } from '../../scripts/kilder/grep.ts';
import { grepLaereplanlinjer } from '../../scripts/kilder/ukesrapport.ts';
import { lesVedlegg1, sammenlignVedlegg1, sjekkGarantilonn } from '../../scripts/kilder/tabeller.ts';
import { lagUkesrapport, lesTilstand, planleggKontrollsak, punktTreff, type Ukesgrunnlag } from '../../scripts/kilder/ukesrapport.ts';
import type { Kilderegister } from '../../src/core/innhold/skjema.ts';
import type { Kildekontroll } from '../../src/core/kontroll/indeks.ts';
import type { Tabellrad } from '../../src/core/regler/skjema.ts';

const avtale =
  '4. Arbeidsåret Lærernes samlede arbeidsoppgaver skal utføres innenfor et årsverk på 1687,5 timer. ' +
  '5. Arbeidstid 5.1. Organisering av arbeidstiden Planfestet arbeidstid kan maksimalt være 9 timer pr. dag og inntil 37,5 timer pr. uke. ' +
  'Dersom man ikke blir enige om noe annet, er den planfestede arbeidstiden 1.150 timer. ' +
  '9. Diverse bestemmelser 9.1. Godtgjøring Godtgjøring for kontaktlærertjeneste er minimum kr. 12 000 pr. år.';

describe('endringer per punkt', () => {
  it('deler i setninger, men ikke etter forkortelser som «kr.» og «pr.»', () => {
    const biter = delIBiter(avtale).map((b) => b.tekst);
    expect(biter).toContain('Godtgjøring Godtgjøring for kontaktlærertjeneste er minimum kr. 12 000 pr. år.');
    expect(biter.some((b) => b.startsWith('Organisering av arbeidstiden Planfestet arbeidstid kan maksimalt være 9 timer pr. dag'))).toBe(true);
  });

  it('finner nærmeste punkt, også et punkt som begynner der teksten begynner', () => {
    expect(naermestePunkt(avtale, avtale.indexOf('Dersom man'))).toBe('5.1');
    expect(naermestePunkt('7.4.2 Feriepenger beregnes', 0)).toBe('7.4.2');
    expect(naermestePunkt('§ 10-4. Begrensning av arbeidstiden (1) Den alminnelige', 20)).toBe('§ 10-4');
  });

  it('viser den nye teksten og punktet den står under', () => {
    const gamle = delIBiter(avtale).map((b) => b.hash);
    const ny = avtale.replace('maksimalt være 9 timer', 'maksimalt være 10 timer').replace('pr. år.', 'pr. år. Dette er nytt.');
    expect(finnEndringer(gamle, ny)).toEqual([
      { punkt: '5.1', ny: ['Organisering av arbeidstiden Planfestet arbeidstid kan maksimalt være 10 timer pr. dag og inntil 37,5 timer pr. uke.'], fjernet: 1 },
      { punkt: '9.1', ny: ['Dette er nytt.'], fjernet: 0 },
    ]);
    expect(finnEndringer(gamle, avtale)).toEqual([]);
  });

  it('teller fjernet tekst', () => {
    const gamle = delIBiter(avtale).map((b) => b.hash);
    const ny = avtale.replace('Dersom man ikke blir enige om noe annet, er den planfestede arbeidstiden 1.150 timer. ', '');
    expect(finnEndringer(gamle, ny)).toEqual([{ punkt: '9', ny: [], fjernet: 1 }]);
  });
});

const vedlegg = `<table><tr><td>Barnetrinnet</td><td>741/988</td></tr></table>
<table>
<tr><td>Årsramme 642/856</td></tr>
<tr><td>Felles programfag</td><td>Utd.program</td><td>Trinn</td></tr>
<tr><td></td><td>Naturbruk</td><td>Vg1</td></tr>
<tr><td>Årsramme 496/661</td></tr>
<tr><td>Fellesfag</td><td>Utd.program</td><td>Trinn</td></tr>
<tr><td>Norsk*</td><td>Stud.spes</td><td>Vg1</td></tr>
<tr><td></td><td></td><td></td></tr>
</table>`;
const regelrader = [
  { nr: 1, t60: 642, t45: 856, kategori: 'Felles programfag', fag: null, program: 'Naturbruk', trinn: 'Vg1', stjerne: false },
  { nr: 2, t60: 496, t45: 661, kategori: 'Fellesfag', fag: 'Norsk', program: 'Stud.spes', trinn: 'Vg1', stjerne: true },
] as Tabellrad[];

describe('tabeller rad for rad', () => {
  it('leser vedlegg 1 for videregående fra dokumentet', () => {
    expect(lesVedlegg1(vedlegg)).toEqual([
      { t60: 642, t45: 856, kategori: 'Felles programfag', fag: null, program: 'Naturbruk', trinn: 'Vg1', stjerne: false },
      { t60: 496, t45: 661, kategori: 'Fellesfag', fag: 'Norsk', program: 'Stud.spes', trinn: 'Vg1', stjerne: true },
    ]);
  });

  it('finner endrede, nye og fjernede rader', () => {
    expect(sammenlignVedlegg1(regelrader, lesVedlegg1(vedlegg))).toMatchObject({ status: 'samsvarer', melding: 'Alle 2 radene stemmer.' });
    const endret = lesVedlegg1(vedlegg.replace('496/661', '500/667').replace('Naturbruk', 'Naturbruk og hage'));
    expect(sammenlignVedlegg1(regelrader, endret)).toEqual({
      status: 'avvik',
      melding: '3 rader stemmer ikke med kilden.',
      detaljer: [
        'Ny rad i kilden: Felles programfag · (felles programfag) · Naturbruk og hage · Vg1: 642/856',
        'Endret: Fellesfag · Norsk · Stud.spes · Vg1: 496/661 * → 500/667 *',
        'Ikke lenger i kilden: Felles programfag · (felles programfag) · Naturbruk · Vg1: 642/856',
      ],
    });
  });

  it('sjekker garantilønnen i teksten i hovedtariffavtalen', () => {
    const rader = [{ id: 'laerer', navn: 'Lærer', ar_0: 545400, ar_6: 558400, ar_8: 568600, ar_10: 620800, ar_16: 639900 }] as Tabellrad[];
    const tekst = 'Lærer og Stillinger med krav om 3-årig U/H- utdanning Tillegg for ansiennitet 545 400 13 000 10 200 52 200 19 100 Laveste årslønn 558 400 568 600 620 800 639 900 Adjunkt';
    expect(sjekkGarantilonn(rader, [0, 6, 8, 10, 16], tekst).status).toBe('samsvarer');
    expect(sjekkGarantilonn(rader, [0, 6, 8, 10, 16], tekst.replace('568 600', '570 000'))).toMatchObject({ status: 'avvik', melding: '1 rad stemmer ikke med kilden.' });
  });
});

describe('Grep-endringer', () => {
  const gammel: Grepdata = {
    programomrader: { BA: { '1': [['BAT', 'Bygg- og anleggsteknikk']] } },
    fagkoder: { ENG: [['ENG1007', 'Engelsk']] },
    arstimer: { ENG1007: 140, KRO1017: 56 },
  };

  it('finner nye koder, nye navn og endrede årstimetall', () => {
    const ny: Grepdata = {
      programomrader: { BA: { '1': [['BAT', 'Bygg- og anleggsteknikk']], '2': [['ANL', 'Anleggsteknikk']] } },
      fagkoder: { ENG: [['ENG1007', 'Engelsk fellesfag'], ['ENG1009', 'Engelsk']] },
      arstimer: { ENG1007: 140, KRO1017: 57, ENG1009: 140 },
    };
    const e = sammenlignGrep(gammel, ny);
    expect(e).toEqual({
      programomrader: { nye: ['BAANL2 Anleggsteknikk'], fjernet: [] },
      fagkoder: { nye: ['ENG1009 Engelsk'], fjernet: [], nyttNavn: ['ENG1007: Engelsk → Engelsk fellesfag'] },
      arstimer: { endret: ['KRO1017: 56 → 57'], nye: ['ENG1009: 140'], fjernet: [] },
    });
    expect(grepsammendrag(e)).toBe('1 nytt programområde, 1 ny fagkode, 1 fag med nytt navn, 1 endret årstimetall, 1 nytt årstimetall.');
    expect(grepsammendrag(sammenlignGrep(gammel, gammel))).toBe('Ingen endringer.');
  });
});

describe('den ukentlige kontrollsaken', () => {
  const register = {
    kilder: [
      { id: 'avtale', navn: 'SFS 2213', url: 'https://example.org/sfs', sjekkmetode: 'kf-infoserie', aktiv: true },
      { id: 'lov', navn: 'Arbeidsmiljøloven', url: 'https://example.org/aml', sjekkmetode: 'lovdata', aktiv: true },
      { id: 'grep', navn: 'Grep', url: 'https://example.org/grep', sjekkmetode: 'grep', aktiv: true },
    ],
  } as unknown as Kilderegister;
  const indeks: Kildekontroll[] = [
    {
      kilde: 'avtale',
      verdier: [
        { type: 'verdi', id: 's/planfestet_maks_dag', regelsett: 's', nokkel: 'planfestet_maks_dag', punkt: '5.1', verdi: 9, enhet: 'timer', grunnlag: 'kilde', harSitat: true, eier: 'utkast', kontrollert: null, auto: null },
        { type: 'verdi', id: 's/arsverk', regelsett: 's', nokkel: 'arsverk', punkt: '4', verdi: 1687.5, enhet: 'timer', grunnlag: 'kilde', harSitat: true, eier: 'utkast', kontrollert: null, auto: null },
      ],
      innhold: [{ type: 'innhold', id: 'moetetid', tittel: 'Møtetid', elementtype: 'forklaring', fil: 'x.yaml', punkter: ['5.1'], eier: 'utkast', kontrollert: null, sporsmal: ['Er møtetid forklart riktig?'], kilder: [{ id: 'avtale', punkt: '5.1', url: null }] }],
    },
  ];
  const ok = { status: 'ok' as const, sjekket: '2026-10-05T04:17:00Z', fingeravtrykk: 'sha256:a', endret_siden: null, melding: null };
  const grunnlag = (over: Partial<Ukesgrunnlag> = {}): Ukesgrunnlag => ({
    register,
    kildestatus: { skjema: 1, kjort: '2026-10-05T04:17:00Z', kilder: { avtale: ok, lov: ok, grep: ok } },
    verdistatus: null,
    endringer: {},
    indeks,
    repo: 'eier/protokollen',
    ...over,
  });

  it('er tom når alt er i orden', () => {
    expect(lagUkesrapport(grunnlag())).toMatchObject({ aapen: false, punkter: 0 });
    expect(lagUkesrapport(grunnlag({ kobling: { nyeUkoblede: [], nyeAvvik: [] } }))).toMatchObject({ aapen: false, punkter: 0 });
  });

  it('tar med nye avvik i koblingen som punkter, og nye ukoblede fag til orientering', () => {
    const r = lagUkesrapport(grunnlag({ kobling: { nyeUkoblede: ['NYA1001 Nytt fag (programfag uten rad i vedlegg 1)'], nyeAvvik: ['NOR1260 står i kobling_fellesfag, men finnes ikke lenger i Grep.'] } }));
    expect(r.punkter).toBe(1);
    expect(r.aapen).toBe(true);
    expect(r.tekst).toContain('## Kobling fra fagkode til årsramme');
    expect(r.tekst).toContain('- [ ] Nytt avvik i koblingen: NOR1260 står i kobling_fellesfag');
    expect(r.tekst).toContain('- Ett nytt fag i Grep uten kobling til årsramme.');
    expect(r.tekst).toContain('  - NYA1001 Nytt fag');
    expect(r.tekst).toContain('https://github.com/eier/protokollen/blob/main/docs/KOBLING.md');
  });

  it('tar med nye uenigheter om løpene som punkter, og uenigheter som er borte, til orientering (avgjørelse 052)', () => {
    const r = lagUkesrapport(grunnlag({ lopsamsvar: { nye: ['BAKEM2---- → BARLF3----: står i grep, ikke i vigo, utdanning'], borte: ['SRSSR2---- → SRSLG3----: står i vigo, ikke i utdanning'] } }));
    expect(r.punkter).toBe(1);
    expect(r.tekst).toContain('## Løpene i Grep, VIGO og utdanning.no');
    expect(r.tekst).toContain('- [ ] Ny uenighet om løpet BAKEM2---- → BARLF3----');
    expect(r.tekst).toContain('- Én uenighet er borte, fordi kildene nå er enige:');
    expect(lagUkesrapport(grunnlag({ lopsamsvar: { nye: [], borte: [] } }))).toMatchObject({ aapen: false, punkter: 0 });
  });

  it('tar med endringer i overordnet del til orientering (avgjørelse 037)', () => {
    const r = lagUkesrapport(grunnlag({ overordnet: { endringer: ['Endret tekst: 1.1 Menneskeverdet'] } }));
    expect(r.punkter).toBe(0);
    expect(r.aapen).toBe(true);
    expect(r.tekst).toContain('## Overordnet del');
    expect(r.tekst).toContain('  - Endret tekst: 1.1 Menneskeverdet');
  });

  it('melder nye navn i fag- og timefordelingen som appen ikke har nynorsk for (eier 02.10.2026)', () => {
    expect(lagUkesrapport(grunnlag({ navn: { linjer: [], ordninger: [] } }))).toMatchObject({ aapen: false, punkter: 0 });
    const r = lagUkesrapport(grunnlag({ navn: { linjer: ['Programfag fra nytt område'], ordninger: ['Med påbygg vg2'] } }));
    expect(r.punkter).toBe(2);
    expect(r.tekst).toContain('## Nye navn i fag- og timefordelingen');
    expect(r.tekst).toContain('- [ ] Linjenavn uten nynorsk: «Programfag fra nytt område».');
    expect(r.tekst).toContain('- [ ] Ny tilpasset ordning i rundskrivet: «Med påbygg vg2».');
  });

  it('viser endringen, hva den kan berøre, avvik i tall og kilder som feilet', () => {
    const r = lagUkesrapport(
      grunnlag({
        kildestatus: {
          skjema: 1,
          kjort: '2026-10-05T04:17:00Z',
          kilder: {
            avtale: { ...ok, status: 'endret', fingeravtrykk: 'sha256:b', endret_siden: '2026-10-05T04:17:00Z' },
            lov: { ...ok, status: 'feilet', melding: 'Tidsavbrudd' },
            grep: { ...ok, melding: 'Tatt inn automatisk: 1 ny fagkode.' },
          },
        },
        endringer: { avtale: [{ punkt: '5.1', ny: ['Planfestet arbeidstid kan maksimalt være 10 timer pr. dag.'], fjernet: 1 }] },
        verdistatus: {
          skjema: 1,
          kjort: '2026-10-05T04:17:00Z',
          verdier: { 's/planfestet_maks_dag': { status: 'avvik', kilde: 'avtale', sjekket: '2026-10-05T04:17:00Z', siden: '2026-10-05T04:17:00Z', forslag: 10, melding: 'Kilden har nå 10 der verdien sto.' } },
        },
      }),
    );
    expect(r.punkter).toBe(2);
    expect(r.tittel).toBe('Kontroll: 2 punkter å se på');
    expect(r.tekst).toContain('**Punkt 5.1** (endret tekst):');
    expect(r.tekst).toContain('> Planfestet arbeidstid kan maksimalt være 10 timer pr. dag.');
    expect(r.tekst).toContain('Kan berøre: regelverdien `planfestet_maks_dag`, «Møtetid» (forklaring).');
    expect(r.tekst).toContain('- [ ] Jeg har sett på endringene i SFS 2213, og det nye fingeravtrykket kan godkjennes. <!-- godkjenn-kilde:avtale:sha256:b -->');
    expect(r.tekst).toContain('- [ ] `s/planfestet_maks_dag`: Kilden har nå 10 der verdien sto. Forslag: 10. <!-- verdi:s/planfestet_maks_dag:10 -->');
    expect(r.tekst).toContain('- Arbeidsmiljøloven: Tidsavbrudd (siden 05.10.2026)');
    expect(r.tekst).toContain('- Tatt inn automatisk: 1 ny fagkode.');
    expect(lesTilstand(r.tekst)).toBe(r.tilstand);
  });

  it('punkter treffer samme punkt, underpunkt og overordnet punkt', () => {
    expect(punktTreff('7.3', '7.3 b')).toBe(true);
    expect(punktTreff('4', '4 a')).toBe(true);
    expect(punktTreff('12.4', 'Kap. 1 § 12.4')).toBe(true);
    expect(punktTreff('5.1', '5.2')).toBe(false);
    expect(punktTreff('5.1', '5')).toBe(true);
  });

  it('kommenterer bare når noe er nytt, lukker når alt er i orden, og lukker gamle saker per kilde', () => {
    const r = lagUkesrapport(grunnlag({ kildestatus: { skjema: 1, kjort: '2026-10-05T04:17:00Z', kilder: { avtale: ok, lov: { ...ok, status: 'feilet', melding: 'Feil' }, grep: ok } } }));
    expect(planleggKontrollsak(r, null, [])).toEqual([{ type: 'opprett', tittel: r.tittel, tekst: r.tekst }]);
    expect(planleggKontrollsak(r, { nummer: 5, tekst: r.tekst }, [])).toEqual([{ type: 'oppdater', nummer: 5, tittel: r.tittel, tekst: r.tekst, kommentar: null }]);
    expect(planleggKontrollsak(r, { nummer: 5, tekst: 'gammel' }, [])[0]).toMatchObject({ type: 'oppdater', kommentar: expect.stringContaining('noe nytt') });
    expect(planleggKontrollsak(lagUkesrapport(grunnlag()), { nummer: 5, tekst: r.tekst }, [2])).toEqual([
      { type: 'lukk', nummer: 5, kommentar: expect.stringContaining('ingenting') },
      { type: 'lukk', nummer: 2, kommentar: expect.stringContaining('ukentlig kontrollsak') },
    ]);
  });
});

describe('læreplaner i kontrollsaken', () => {
  it('lister endrede læreplaner med lenke til udir.no, og fag med endret vurdering', () => {
    const tom = { programomrader: { nye: [], fjernet: [] }, fagkoder: { nye: [], fjernet: [], nyttNavn: [] }, arstimer: { endret: [], nye: [], fjernet: [] } };
    const e = { ...tom, laereplaner: { nye: [], fjernet: ['GML01-01'], endret: ['HEA02-04'] }, fag: { nye: [], fjernet: [], endret: ['HEA2005 Helsefremmende arbeid: vurderingsordning a → b'] } };
    expect(grepLaereplanlinjer(e)).toEqual([
      '  - Endret læreplan: [HEA02-04](https://www.udir.no/lk20/hea02-04)',
      '  - Læreplan fjernet: GML01-01',
      '  - Endret fag: HEA2005 Helsefremmende arbeid: vurderingsordning a → b',
    ]);
    expect(grepLaereplanlinjer(null)).toEqual([]);
    expect(grepLaereplanlinjer(e, 1)).toEqual(['  - Endret læreplan: [HEA02-04](https://www.udir.no/lk20/hea02-04)', '  - … og 2 til. Se jobbsammendraget.']);
  });
});
