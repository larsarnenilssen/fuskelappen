// CI etter hva som er endret (avgjørelse 067): ser på filene en PR endrer, og velger hvor mye CI skal kjøre.
//   ingen: bare dokumentasjon. Ingen tester.
//   rask:  bare versjonsnummeret i package.json og package-lock.json, en ny versjonsoverskrift i CHANGELOG.md og
//          eventuelt dokumentasjon. Lint, typesjekk, enhetstester og bygg, ikke ende-til-ende.
//   alt:   alt annet. Som før.
// Ren logikk, testes i tests/unit/ci-endringer.test.ts. Kjøres av .github/workflows/ci.yml med Node uten
// avhengigheter (--experimental-strip-types), så CI ikke trenger npm ci for å velge.
// Bruk: node --experimental-strip-types scripts/ci/endringer.ts <base-sha>
import { execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, readFileSync } from 'node:fs';

export type Nivaa = 'ingen' | 'rask' | 'alt';

/** Dokumentasjon som testene leser eller sammenligner med dataene. Endres de, kjøres alt. */
export const TESTEDE_DOKUMENTER: readonly string[] = ['docs/KOBLING.md', 'docs/TILBUDSSTRUKTUR.md', 'docs/KILDER.md', 'README.md'];

/** Filene der bare versjonsnummeret kan være endret. */
export const VERSJONSFILER: readonly string[] = ['package.json', 'package-lock.json'];

/**
 * Dokumentasjon: alt under docs/ og *.md utenom innholdet. Unntak: dokumentene testene leser, og *.md under tests/
 * (fasittestene krever tests/fasit/README.md).
 */
export function erDokumentasjon(fil: string): boolean {
  if (TESTEDE_DOKUMENTER.includes(fil)) return false;
  if (fil.startsWith('content/') || fil.startsWith('tests/')) return false;
  return fil.startsWith('docs/') || fil.endsWith('.md');
}

/** Innholdet i package.json eller package-lock.json uten versjonsnummeret til appen, som tekst. */
export function utenVersjon(fil: string, tekst: string): string {
  const data = JSON.parse(tekst) as { version?: unknown; packages?: Record<string, { version?: unknown }> };
  delete data.version;
  if (fil === 'package-lock.json') delete data.packages?.['']?.version;
  return JSON.stringify(data);
}

/** Sann når bare versjonsnummeret er endret. En fil som er ny, slettet eller ikke kan leses, regnes som endret. */
export function bareVersjon(fil: string, base: string | null, ny: string | null): boolean {
  if (!VERSJONSFILER.includes(fil) || base === null || ny === null) return false;
  try {
    return utenVersjon(fil, base) === utenVersjon(fil, ny);
  } catch {
    return false;
  }
}

/** Overskriften for en versjon i CHANGELOG.md, f.eks. «## [0.36.1] – 2026-10-05» (med tankestrek). */
export const VERSJONSOVERSKRIFT = /^## \[\d+\.\d+\.\d+\] – \d{4}-\d{2}-\d{2}$/;

/**
 * Sann når CHANGELOG.md bare har fått nye versjonsoverskrifter eller endrede tomme linjer. Linjene fra før må stå
 * uendret og i samme rekkefølge. En fil som er ny eller slettet, regnes som endret.
 */
export function bareVersjonsoverskrift(base: string | null, ny: string | null): boolean {
  if (base === null || ny === null) return false;
  const utenTomme = (tekst: string) => tekst.split('\n').map((l) => l.replace(/\r$/, '')).filter((l) => l.trim() !== '');
  const forrige = utenTomme(base);
  let i = 0;
  for (const linje of utenTomme(ny)) {
    if (linje === forrige[i]) i += 1;
    else if (!VERSJONSOVERSKRIFT.test(linje)) return false;
  }
  return i === forrige.length;
}

/**
 * Nivået for de endrede filene. lesFil gir innholdet før (base) og etter (ny), eller null når filen ikke finnes.
 * Ingen endrede filer gir alt, fordi det kan bety at sammenligningen ikke virket.
 */
export function velgNivaa(filer: readonly string[], lesFil: (fil: string) => { base: string | null; ny: string | null }): Nivaa {
  if (filer.length === 0) return 'alt';
  if (filer.every(erDokumentasjon)) return 'ingen';
  const rask = filer.every((f) => {
    // CHANGELOG.md er dokumentasjon, men i en versjons-PR skal den bare ha fått overskriften for versjonen.
    if (f !== 'CHANGELOG.md' && erDokumentasjon(f)) return true;
    const { base, ny } = lesFil(f);
    return f === 'CHANGELOG.md' ? bareVersjonsoverskrift(base, ny) : bareVersjon(f, base, ny);
  });
  return rask ? 'rask' : 'alt';
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const base = process.argv[2];
  if (!base) throw new Error('Mangler base: node --experimental-strip-types scripts/ci/endringer.ts <base-sha>');
  const git = (...args: string[]) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  // Uten --no-renames viser en flyttet fil bare det nye navnet.
  const filer = git('diff', '--name-only', '--no-renames', `${base}...HEAD`).split('\n').filter(Boolean);
  const lesFil = (fil: string) => {
    let forrige: string | null;
    try {
      forrige = git('show', `${base}:${fil}`);
    } catch {
      forrige = null;
    }
    return { base: forrige, ny: existsSync(fil) ? readFileSync(fil, 'utf8') : null };
  };
  const nivaa = velgNivaa(filer, lesFil);
  console.log(`Endrede filer (${filer.length}):`);
  for (const f of filer) console.log(`  ${f}`);
  console.log(`Nivå: ${nivaa}`);
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `nivaa=${nivaa}\n`);
}
