// Kontrollrundene i mai og august (avgjørelse 019).
import { describe, expect, it } from 'vitest';
import { lagKontrollrunde, praksisTilBekreftelse, rundemerke, rundeperiode } from '../../scripts/kilder/kontrollrunde.ts';
import type { Praksis } from '../../src/core/innhold/skjema.ts';
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
        innhold: [{ type: 'innhold', id: 'i', tittel: 'Årsverk', elementtype: 'begrep', fil: 'f', punkter: ['4'], eier: 'utkast', kontrollert: null, sporsmal: [] }],
      },
    ];
    const r = lagKontrollrunde('2027-05', praksisTilBekreftelse(praksis, '2027-05-03'), indeks, 'eier/repo');
    expect(r.tittel).toBe('Kontrollrunde mai 2027: 3 punkter');
    expect(r.tekst).toContain('Når hovedtariffavtalen endres 1. mai');
    expect(r.tekst).toContain('- [ ] **Lønn i brutte måneder:** Stemmer 21,67? <!-- praksis:a -->');
    expect(r.tekst).toContain('Sist bekreftet: 01.05.2025.');
    expect(r.tekst).toContain('- [ ] Regelverdien `s/v`: kontrollert for mer enn 12 måneder siden (01.04.2025). <!-- kontroll:verdi:s/v -->');
    expect(r.tekst).toContain('1 begrep, forklaring eller verdi er ikke kontrollert.');
    expect(r.tekst).toContain(rundemerke('2027-05'));
    expect(r.tekst).not.toContain('Lenker til Vilbli');
  });

  it('tar med lenkene til Vilbli som skal sjekkes for hånd', () => {
    const r = lagKontrollrunde('2027-08', [], [], 'eier/repo', [{ tekst: 'Vg2 helsearbeiderfag', url: 'https://www.vilbli.no/x/p5' }]);
    expect(r.tittel).toBe('Kontrollrunde august 2027: 1 punkt');
    expect(r.tekst).toContain('## Lenker til Vilbli');
    expect(r.tekst).toContain('- [ ] [Vg2 helsearbeiderfag](https://www.vilbli.no/x/p5) <!-- vilbli:1 -->');
  });
});
