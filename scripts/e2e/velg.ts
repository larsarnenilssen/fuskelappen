// Velger hvilke ende-til-ende-tester som berøres av endrede filer (avgjørelse 055). Lokalt kjøres bare disse, i
// WebKit mobil. Hele suiten kjøres i CI.

/** Spesifikasjonene for hver modul. Moduler uten egen spesifikasjon dekkes av overflyt-testene for rutene sine. */
const MODULSPEKER: Record<string, readonly string[]> = {
  arbeidstid: ['arbeidstid', 'kalkulator-fag'],
  begreper: ['kodelister', 'modul-og-sok'],
  fag: ['fag', 'kalkulator-fag'],
  inntak: ['inntak'],
  laereplanverket: ['laereplanverket'],
  lov: ['regelverk'],
  opplaeringslop: ['opplaeringslop'],
  tilrettelegging: ['tilrettelegging'],
  vurdering: ['vurdering'],
};

/** Data fra kildene og modulene som viser dem. */
const DATAMODULER: Record<string, readonly string[]> = {
  grep: ['fag', 'opplaeringslop', 'laereplanverket', 'arbeidstid'],
  fagfordeling: ['fag', 'arbeidstid'],
  lovdata: ['lov'],
  vigo: ['begreper', 'fag', 'opplaeringslop', 'vurdering'],
  utdanning: ['opplaeringslop'],
  skoler: ['opplaeringslop'],
  ndla: ['fag'],
  udir: ['inntak', 'vurdering'],
  skolear: ['inntak', 'arbeidstid'],
};

/** Regelsettene i rules/ og modulene som bruker dem. */
const REGELMODULER: Record<string, readonly string[]> = {
  sfs2213: ['arbeidstid'],
  hta: ['arbeidstid'],
  inntak: ['inntak'],
  vurdering: ['vurdering', 'fag'],
};

/** Felles kode: kjernetestene for skallet, navigasjonen og de felles komponentene, og overflyt for alle rutene. */
export const KJERNE = ['navigasjon', 'komponenter', 'modul-og-sok', 'malform-tema', 'innstillinger', 'favoritter', 'om', 'kildestatus', 'pwa'] as const;

export interface Utvalg {
  /** Spesifikasjonene som kjøres i sin helhet. */
  speker: string[];
  /** Rutene (f.eks. «#/inntak») som overflyttesten kjøres for. `alle` når felles kode er endret. */
  ruter: string[] | 'alle';
  /** Hvorfor, linje for linje, til utskriften. */
  grunner: string[];
}

/** Filer som ikke påvirker appen i nettleseren. Testmodulen i tests/fixtures er med i e2e-bygget og regnes som felles. */
function utenBetydning(fil: string): boolean {
  if (fil.endsWith('.md')) return true;
  if (/^(docs|\.github|tests\/(unit|content|fasit))\//.test(fil)) return true;
  return fil.startsWith('scripts/') && fil !== 'scripts/bygg-sokeindeks.ts';
}

/** Modulene en fil hører til, eller `null` når filen er felles. */
function modulerFor(fil: string): readonly string[] | null {
  let m = /^src\/modules\/([^/]+)\//.exec(fil);
  if (m?.[1] && m[1] in MODULSPEKER) return [m[1]];
  m = /^content\/([^/]+)\//.exec(fil);
  if (m?.[1] && m[1] in MODULSPEKER) return [m[1]];
  m = /^src\/strings\/moduler\/([^.]+)\./.exec(fil);
  if (m?.[1] && m[1] in MODULSPEKER) return [m[1]];
  m = /^data\/([^/]+)\//.exec(fil) ?? /^src\/data\/([^.]+)\.ts$/.exec(fil);
  if (m?.[1] && m[1] in DATAMODULER) return DATAMODULER[m[1]] ?? null;
  m = /^rules\/([^/]+)\//.exec(fil);
  if (m?.[1] && m[1] in REGELMODULER) return REGELMODULER[m[1]] ?? null;
  return null;
}

export function velgTester(endrede: readonly string[]): Utvalg {
  const speker = new Set<string>();
  const ruter = new Set<string>();
  const grunner: string[] = [];
  let felles = false;
  for (const fil of endrede) {
    if (utenBetydning(fil)) continue;
    const e2e = /^tests\/e2e\/([^/]+)\.spec\.ts$/.exec(fil);
    if (e2e?.[1]) {
      speker.add(e2e[1]);
      grunner.push(`${fil}: testen selv`);
      continue;
    }
    if (fil === 'scripts/bygg-sokeindeks.ts') {
      speker.add('modul-og-sok');
      grunner.push(`${fil}: søket`);
      continue;
    }
    if (fil === 'data/status/kildestatus.json' || fil === 'content/kilder.yaml') {
      speker.add('kildestatus');
      speker.add('om');
      grunner.push(`${fil}: kildene`);
      continue;
    }
    const moduler = modulerFor(fil);
    if (moduler) {
      for (const modul of moduler) {
        for (const s of MODULSPEKER[modul] ?? []) speker.add(s);
        ruter.add(`#/${modul}`);
      }
      grunner.push(`${fil}: ${moduler.join(', ')}`);
      continue;
    }
    felles = true;
    grunner.push(`${fil}: felles kode`);
  }
  if (felles) for (const s of KJERNE) speker.add(s);
  return { speker: [...speker].sort(), ruter: felles ? 'alle' : [...ruter].sort(), grunner };
}

/** Escaper tegn med betydning i et regulært uttrykk. */
const escape = (tekst: string) => tekst.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Uttrykket til `--grep`: hele spesifikasjonene, og overflyttestene for rutene. `null` når ingenting skal kjøres. */
export function grepFor(utvalg: Utvalg): string | null {
  const deler = utvalg.speker.map((s) => `${escape(s)}\\.spec\\.ts`);
  if (utvalg.ruter === 'alle') deler.push('overflyt\\.spec\\.ts');
  else if (utvalg.ruter.length > 0) deler.push(`overflyt\\.spec\\.ts .*(${utvalg.ruter.map(escape).join('|')})`);
  return deler.length > 0 ? `(${deler.join('|')})` : null;
}
