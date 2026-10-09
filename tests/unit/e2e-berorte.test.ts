// Utvalget av berørte ende-til-ende-tester (avgjørelse 055).
import { describe, expect, it } from 'vitest';
import { grepFor, KJERNE, velgTester } from '../../scripts/e2e/velg.ts';

describe('berørte ende-til-ende-tester', () => {
  it('en modul gir spesifikasjonene sine, og overflyt og teksthøyde for rutene sine', () => {
    const u = velgTester(['src/modules/inntak/sider/Frister.tsx', 'content/inntak/frister.yaml']);
    expect(u.speker).toEqual(['inntak']);
    expect(u.ruter).toEqual(['#/inntak']);
    expect(grepFor(u)).toBe('(inntak\\.spec\\.ts|(overflyt|teksthoyde)\\.spec\\.ts .*(#/inntak))');
  });

  it('strenger og data peker til modulene som bruker dem', () => {
    expect(velgTester(['src/strings/moduler/vurdering.nb.ts']).speker).toEqual(['laerlinger', 'vurdering']);
    expect(velgTester(['data/lovdata/opplaeringsforskrifta.json']).speker).toEqual(['fylker', 'regelverk']);
    expect(velgTester(['rules/sfs2213/2025.yaml']).speker).toEqual(['arbeidstid', 'kalkulator-fag']);
  });

  it('felles kode gir kjernetestene, og overflyt og teksthøyde for alle rutene', () => {
    const u = velgTester(['src/components/Kortfot.tsx']);
    expect(u.speker).toEqual([...KJERNE].sort());
    expect(u.ruter).toBe('alle');
    expect(grepFor(u)).toContain('(overflyt|teksthoyde)\\.spec\\.ts');
  });

  it('faktaene i en modul og kortet gir testene for dagens jukselapp', () => {
    expect(velgTester(['src/modules/vurdering/fakta.ts']).speker).toEqual(['jukselapp', 'laerlinger', 'vurdering']);
    expect(velgTester(['src/core/jukselapp/fakta.ts']).speker).toContain('jukselapp');
    expect(velgTester(['src/app/Jukselappkort.tsx']).speker).toContain('jukselapp');
    expect(velgTester(['src/app/Forsidepanel.tsx']).speker).toContain('jukselapp');
  });

  it('meldingen om ny versjon og punktene gir testen for den', () => {
    expect(velgTester(['content/versjoner.yaml'])).toEqual({ speker: ['nyversjon'], ruter: [], grunner: ['content/versjoner.yaml: meldingen om ny versjon'] });
    expect(velgTester(['src/components/Overlegg.tsx']).speker).toContain('nyversjon');
    expect(velgTester(['src/app/Oppdateringsvarsel.tsx']).speker).toContain('nyversjon');
    expect(velgTester(['src/strings/velkomst.nb.ts'])).toEqual({ speker: ['velkomst'], ruter: [], grunner: ['src/strings/velkomst.nb.ts: velkomsten'] });
    expect(velgTester(['src/app/velkomst/apne.ts']).speker).toEqual(expect.arrayContaining(['velkomst', 'innstillinger']));
  });

  it('en endret test kjøres selv', () => {
    expect(velgTester(['tests/e2e/fag.spec.ts']).speker).toEqual(['fag']);
  });

  it('dokumentasjon, enhetstester og skript gir ingen ende-til-ende-tester', () => {
    const u = velgTester(['docs/avgjorelser/055-e2e.md', 'CHANGELOG.md', 'tests/unit/x.test.ts', 'scripts/hent-grep.ts', '.github/workflows/ci.yml']);
    expect(grepFor(u)).toBeNull();
  });
});
