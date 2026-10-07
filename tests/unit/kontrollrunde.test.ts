// Kontrollrundene i mai og august (avgjørelse 019).
import { describe, expect, it } from 'vitest';
import { lagKontrollrunde, praksisTilBekreftelse, rundemerke, rundeperiode } from '../../scripts/kilder/kontrollrunde.ts';
import type { Kilderegister, Praksis } from '../../src/core/innhold/skjema.ts';
import type { Kildekontroll } from '../../src/core/kontroll/indeks.ts';

const praksis: Praksis[] = [
  { id: 'a', tittel: 'Lønn i brutte måneder', sporsmal: 'Stemmer 21,67?', appen: 'Arbeidsdager ÷ 21,67.', grunnlag: 'Eier.', berorer: ['x'], bekreftet: null },
  { id: 'b', tittel: 'Planleggingsdager', sporsmal: 'Stemmer 45 timer?', appen: '45 timer.', grunnlag: 'Eier.', berorer: ['y'], bekreftet: { dato: '2026-08-03' } },
  { id: 'c', tittel: 'Gammel', sporsmal: 'Stemmer det?', appen: 'Noe.', grunnlag: 'Eier.', berorer: ['z'], bekreftet: { dato: '2025-05-01' } },
];

describe('kontrollrunder', () => {
  it('kommer første uken i mai og august', () => {
    expect(rundeperiode('2027-05-03')).toBe('2027-05');
    expect(rundeperiode('2026-08-03')).toBe('2026-08');
    expect(rundeperiode('2026-08-10')).toBeNull();
    expect(rundeperiode('2026-10-05')).toBeNull();
  });

  it('tar med praksis som ikke er bekreftet, eller som er bekreftet for mer enn 12 måneder siden', () => {
    expect(praksisTilBekreftelse(praksis, '2027-05-03').map((p) => p.id)).toEqual(['a', 'c']);
  });

  it('lager en sak med avkrysning for praksis og for det som bør kontrolleres på nytt', () => {
    const indeks: Kildekontroll[] = [
      {
        kilde: 'k',
        verdier: [{ type: 'verdi', id: 's/v', regelsett: 's', nokkel: 'v', punkt: '4', verdi: 1, enhet: null, grunnlag: 'kilde', harSitat: true, eier: 'bor_kontrolleres', kontrollert: '2025-04-01', auto: null }],
        innhold: [{ type: 'innhold', id: 'i', tittel: 'Årsverk', elementtype: 'begrep', fil: 'f', punkter: ['4'], eier: 'utkast', kontrollert: null, sporsmal: [], kilder: [{ id: 'k', punkt: '4', url: null }] }],
      },
    ];
    const register = { kilder: [{ id: 'k', navn: 'SFS 2213', url: 'https://ks.no/sfs2213' }] } as unknown as Kilderegister;
    const r = lagKontrollrunde('2027-05', praksisTilBekreftelse(praksis, '2027-05-03'), indeks, 'eier/repo', [], register);
    // To praksiser, én verdi og påminnelsen om inntaksdatoene.
    expect(r.tittel).toBe('Kontrollrunde mai 2027: 4 punkter');
    expect(r.tekst).toContain('Når hovedtariffavtalen endres 1. mai');
    expect(r.tekst).toContain('- [ ] **Lønn i brutte måneder:** Stemmer 21,67? <!-- praksis:a -->');
    expect(r.tekst).toContain('Sist bekreftet: 01.05.2025.');
    // Kildene bak det praksisen og verdien berører, med punkt, så eier kan sjekke svaret der.
    expect(r.tekst).toContain('  - Kilder å sjekke mot: [SFS 2213](https://ks.no/sfs2213): punkt 4');
    expect(r.tekst).toContain('- [ ] Regelverdien `s/v`: kontrollert for mer enn 12 måneder siden (01.04.2025). <!-- kontroll:verdi:s/v -->');
    expect(r.tekst).toContain('1 begrep, forklaring eller verdi er ikke kontrollert.');
    expect(r.tekst).toContain(rundemerke('2027-05'));
    expect(r.tekst).not.toContain('Lenker til Vilbli');
  });

  it('minner i mai om inntaksdatoene for sommeren, med sidene de hentes fra', () => {
    const r = lagKontrollrunde('2027-05', [], [], 'eier/repo');
    expect(r.tittel).toBe('Kontrollrunde mai 2027: 1 punkt');
    expect(r.tekst).toContain('## Inntaksdatoene for neste inntak');
    expect(r.tekst).toContain('andre inntak i 2027');
    expect(r.tekst).toContain('<!-- inntak:2027 -->');
    expect(r.tekst).toContain('](https://www.tromsfylke.no/');
    expect(lagKontrollrunde('2027-08', [], [], 'eier/repo').tekst).not.toContain('Inntaksdatoene');
  });

  it('tar med kildene som stenger for kildesjekken, i begge rundene', () => {
    const register = { kilder: [{ id: 'ks-sfs2213', navn: 'SFS 2213 (særavtalene hos KS)', url: 'https://www.ks.no/saravtaler/' }] } as unknown as Kilderegister;
    for (const periode of ['2027-05', '2027-08']) {
      const r = lagKontrollrunde(periode, [], [], 'eier/repo', [], register);
      expect(r.tekst).toContain('## Kilder som stenger for kildesjekken');
      expect(r.tekst).toContain('- [ ] [SFS 2213 (særavtalene hos KS)](https://www.ks.no/saravtaler/): Har KS lagt ut en ny SFS 2213');
      expect(r.tekst).toContain('<!-- handsjekk:ks-sfs2213 -->');
    }
    expect(lagKontrollrunde('2027-08', [], [], 'eier/repo', [], register).tittel).toBe('Kontrollrunde august 2027: 1 punkt');
    // Vestland: ett punkt med en lenke per side på vestlandfylke.no.
    const medVestland = {
      kilder: [
        ...register.kilder,
        { id: 'vlfk-eksamen', navn: 'vestlandfylke.no – eksamen', url: 'https://www.vestlandfylke.no/eksamen/' },
        { id: 'vlfk-fagproven', navn: 'vestlandfylke.no – fagprøven', url: 'https://www.vestlandfylke.no/fagproven/' },
        { id: 'vlfk-skulereglar', navn: 'Skulereglar', url: 'https://www.vlfk.no/' },
      ],
    } as unknown as Kilderegister;
    const v = lagKontrollrunde('2027-05', [], [], 'eier/repo', [], medVestland);
    expect(v.tekst).toContain('- [ ] **Vestland fylkeskommune (vestlandfylke.no):**');
    expect(v.tekst).toContain('  - [vestlandfylke.no – fagprøven](https://www.vestlandfylke.no/fagproven/)');
    expect(v.tekst).not.toContain('Skulereglar');
    // Inntaksdatoene, KS og Vestland.
    expect(v.tittel).toBe('Kontrollrunde mai 2027: 3 punkter');
    // Uten kilden i registeret står ikke delen.
    expect(lagKontrollrunde('2027-08', [], [], 'eier/repo').tekst).not.toContain('stenger for kildesjekken');
  });

  it('tar med lenkene til Vilbli som skal sjekkes for hånd', () => {
    const r = lagKontrollrunde('2027-08', [], [], 'eier/repo', [{ tekst: 'Vg2 helsearbeiderfag', url: 'https://www.vilbli.no/x/p5' }]);
    expect(r.tittel).toBe('Kontrollrunde august 2027: 1 punkt');
    expect(r.tekst).toContain('## Lenker til Vilbli');
    expect(r.tekst).toContain('- [ ] [Vg2 helsearbeiderfag](https://www.vilbli.no/x/p5) <!-- vilbli:1 -->');
  });
});
