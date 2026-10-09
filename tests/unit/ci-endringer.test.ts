// CI etter hva som er endret (avgjørelse 067): bare dokumentasjon gir ingen tester, bare versjonsnummeret den raske
// jobben, og alt annet hele CI.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { bareVersjon, bareVersjonsoverskrift, erDokumentasjon, erRaskDokumentasjon, RASKE_MAPPER, TESTEDE_DOKUMENTER, velgNivaa } from '../../scripts/ci/endringer.ts';

const rot = join(__dirname, '../..');

const pakke = (versjon: string, ekstra: Record<string, unknown> = {}) => `${JSON.stringify({ name: 'jukselappen', version: versjon, private: true, ...ekstra }, null, 2)}\n`;
const laas = (versjon: string, avhengighet = '7.2.0') =>
  `${JSON.stringify(
    {
      name: 'jukselappen',
      version: versjon,
      lockfileVersion: 3,
      packages: { '': { name: 'jukselappen', version: versjon }, 'node_modules/minisearch': { version: avhengighet } },
    },
    null,
    2,
  )}\n`;

/** CHANGELOG.md som i en versjons-PR (som 0.36.1): overskriften for versjonen kommer under [Unreleased]. */
const logg = (versjon: string | null) =>
  ['# Endringslogg', '', '## [Unreleased]', '', ...(versjon ? [`## [${versjon}] – 2026-10-05`, ''] : []), '### Lagt til', '', '- **Noe nytt.**', '', '## [0.36.0] – 2026-10-05', '', '- **Noe eldre.**', ''].join('\n');

/** Filene før og etter, som lesFil i skriptet. */
const filer = (forrige: Record<string, string>, etter: Record<string, string>) => (fil: string) => ({ base: forrige[fil] ?? null, ny: etter[fil] ?? null });

describe('dokumentasjon', () => {
  it('docs/ og *.md utenom innholdet er dokumentasjon, også arkivet og DRIFT.md', () => {
    expect(erDokumentasjon('docs/arkiv/arbeidsordrer/fase-6-pakke-5.md')).toBe(true);
    expect(erDokumentasjon('docs/arkiv/arbeidsordrer/bilder/designloft-mobil-1.jpg')).toBe(true);
    expect(erDokumentasjon('docs/arkiv/OPPDRAG.md')).toBe(true);
    expect(erDokumentasjon('DRIFT.md')).toBe(true);
    expect(erDokumentasjon('.claude/skills/ny-versjon/SKILL.md')).toBe(true);
    expect(erDokumentasjon('docs/KONTROLL.md')).toBe(true);
    expect(erDokumentasjon('CHANGELOG.md')).toBe(true);
    expect(erDokumentasjon('AGENTS.md')).toBe(true);
    expect(erDokumentasjon('rules/README.md')).toBe(true);
  });

  it('innholdet, dokumentene testene leser, og *.md under tests/ er ikke dokumentasjon', () => {
    expect(erDokumentasjon('content/begreper/vurdering.yaml')).toBe(false);
    expect(erDokumentasjon('content/notat.md')).toBe(false);
    expect(erDokumentasjon('tests/fasit/README.md')).toBe(false);
    for (const f of TESTEDE_DOKUMENTER) expect(erDokumentasjon(f), f).toBe(false);
    expect(erDokumentasjon('src/app/App.tsx')).toBe(false);
    expect(erDokumentasjon('.github/workflows/ci.yml')).toBe(false);
  });

  it('avgjørelsene og oversikten over dem trenger den raske jobben (avgjørelse 105)', () => {
    for (const f of ['docs/avgjorelser/067-ci-etter-endringer.md', 'docs/avgjorelser/README.md']) {
      expect(erDokumentasjon(f), f).toBe(false);
      expect(erRaskDokumentasjon(f), f).toBe(true);
    }
    expect(erRaskDokumentasjon('docs/EIER.md')).toBe(false);
  });

  it('dokumentene testene leser, står i TESTEDE_DOKUMENTER', () => {
    // Testene leser dokumentene med join(rot, …) og filnavnet. Kommer det et nytt, må det føres opp.
    const lest = new Set<string>();
    for (const mappe of ['tests/unit', 'tests/content', 'tests/fasit']) {
      for (const fil of readdirSync(join(rot, mappe)).filter((f) => f.endsWith('.ts'))) {
        const tekst = readFileSync(join(rot, mappe, fil), 'utf8');
        for (const m of tekst.matchAll(/join\(rot, '([^']+\.md)'\)/g)) lest.add(m[1] as string);
      }
    }
    for (const f of lest) expect(erDokumentasjon(f), f).toBe(false);
    const iRaskeMapper = (f: string) => RASKE_MAPPER.some((m) => f.startsWith(m));
    expect([...lest].filter((f) => !iRaskeMapper(f)).sort()).toEqual([...TESTEDE_DOKUMENTER].sort());
  });
});

describe('bare versjonsnummeret', () => {
  it('package.json med bare ny versjon', () => {
    expect(bareVersjon('package.json', pakke('0.36.0'), pakke('0.36.1'))).toBe(true);
    expect(bareVersjon('package.json', pakke('0.36.0'), pakke('0.36.1', { scripts: { ny: 'x' } }))).toBe(false);
  });

  it('package-lock.json med ny versjon øverst og i packages[""]', () => {
    expect(bareVersjon('package-lock.json', laas('0.36.0'), laas('0.36.1'))).toBe(true);
    expect(bareVersjon('package-lock.json', laas('0.36.0'), laas('0.36.1', '7.3.0'))).toBe(false);
  });

  it('nye, slettede og ødelagte filer, og andre filer, regnes som endret', () => {
    expect(bareVersjon('package.json', null, pakke('0.36.1'))).toBe(false);
    expect(bareVersjon('package.json', pakke('0.36.0'), null)).toBe(false);
    expect(bareVersjon('package.json', pakke('0.36.0'), '{')).toBe(false);
    expect(bareVersjon('vite.config.ts', 'a', 'a')).toBe(false);
  });
});

describe('ny versjonsoverskrift i CHANGELOG.md', () => {
  it('bare en ny overskrift i formatet «## [x.y.z] – åååå-mm-dd» og tomme linjer', () => {
    expect(bareVersjonsoverskrift(logg(null), logg('0.36.1'))).toBe(true);
    expect(bareVersjonsoverskrift(logg(null), `${logg('0.36.1')}\n\n`)).toBe(true);
    expect(bareVersjonsoverskrift(logg(null), logg(null))).toBe(true);
  });

  it('endret tekst, en overskrift i et annet format eller en fjernet linje regnes som endret', () => {
    expect(bareVersjonsoverskrift(logg(null), logg('0.36.1').replace('Noe nytt', 'Noe annet'))).toBe(false);
    expect(bareVersjonsoverskrift(logg(null), logg('0.36.1').replace(' – ', ' - '))).toBe(false);
    expect(bareVersjonsoverskrift(logg(null), logg('0.36.1').replace('## [0.36.1]', '## 0.36.1'))).toBe(false);
    expect(bareVersjonsoverskrift(logg(null), logg('0.36.1').replace('- **Noe eldre.**', ''))).toBe(false);
    expect(bareVersjonsoverskrift(logg(null), logg('0.36.1').replace('### Lagt til', '## [0.36.2] – 2026-10-06'))).toBe(false);
    expect(bareVersjonsoverskrift(null, logg('0.36.1'))).toBe(false);
  });
});

describe('nivået', () => {
  const forrige = { 'package.json': pakke('0.36.0'), 'package-lock.json': laas('0.36.0'), 'CHANGELOG.md': logg(null) };
  const versjon = { 'package.json': pakke('0.36.1'), 'package-lock.json': laas('0.36.1'), 'CHANGELOG.md': logg('0.36.1') };

  it('bare dokumentasjon gir ingen tester', () => {
    expect(velgNivaa(['docs/EIER.md', 'docs/arkiv/OPPDRAG.md', 'DRIFT.md', 'AGENTS.md', 'CHANGELOG.md'], filer({}, {}))).toBe('ingen');
  });

  it('avgjørelsene gir den raske jobben, så testen av oversikten kjøres', () => {
    expect(velgNivaa(['docs/avgjorelser/105-drift.md', 'docs/avgjorelser/README.md', 'DRIFT.md'], filer({}, {}))).toBe('rask');
    expect(velgNivaa(['docs/avgjorelser/105-drift.md', 'src/app/App.tsx'], filer({}, {}))).toBe('alt');
  });

  it('dokumentene testene leser, gir alt', () => {
    expect(velgNivaa(['docs/EIER.md', 'docs/KOBLING.md'], filer({}, {}))).toBe('alt');
    expect(velgNivaa(['README.md'], filer({}, {}))).toBe('alt');
  });

  it('en versjons-PR gir den raske jobben, også med dokumentasjon', () => {
    expect(velgNivaa(['CHANGELOG.md', 'package.json', 'package-lock.json'], filer(forrige, versjon))).toBe('rask');
    expect(velgNivaa(['CHANGELOG.md', 'docs/EIER.md', 'package.json', 'package-lock.json'], filer(forrige, versjon))).toBe('rask');
    expect(velgNivaa(['package.json', 'package-lock.json'], filer(forrige, versjon))).toBe('rask');
  });

  it('en versjons-PR der CHANGELOG.md har fått mer enn overskriften, gir alt', () => {
    const mer = { ...versjon, 'CHANGELOG.md': `${logg('0.36.1')}\n- **Mer.**\n` };
    expect(velgNivaa(['CHANGELOG.md', 'package.json', 'package-lock.json'], filer(forrige, mer))).toBe('alt');
  });

  it('en ny avhengighet, kode eller tester gir alt', () => {
    expect(velgNivaa(['package.json', 'package-lock.json'], filer(forrige, { ...versjon, 'package-lock.json': laas('0.36.1', '7.3.0') }))).toBe('alt');
    expect(velgNivaa(['CHANGELOG.md', 'package.json', 'package-lock.json', 'tests/unit/flytting.test.ts'], filer(forrige, versjon))).toBe('alt');
    expect(velgNivaa(['src/app/App.tsx'], filer({}, {}))).toBe('alt');
  });

  it('ingen endrede filer gir alt, fordi sammenligningen kan ha feilet', () => {
    expect(velgNivaa([], filer({}, {}))).toBe('alt');
  });
});
