// Velger hvilke ende-til-ende-tester som berøres av endrede filer (avgjørelse 055). Lokalt kjøres bare disse, i
// WebKit mobil. Hele suiten kjøres i CI.

/** Spesifikasjonene for hver modul. Moduler uten egen spesifikasjon dekkes av overflyt-testene for rutene sine. */
const MODULSPEKER: Record<string, readonly string[]> = {
  arbeidstid: ['arbeidstid', 'kalkulator-fag'],
  begreper: ['begreper', 'kodelister', 'modul-og-sok'],
  eksamen: ['eksamen', 'laerlinger', 'kalender'],
  elevundersokelsen: ['elevundersokelsen'],
  fag: ['fag', 'kalkulator-fag'],
  fylker: ['fylker'],
  inntak: ['inntak'],
  kalender: ['kalender'],
  laereplanverket: ['laereplanverket'],
  lov: ['regelverk'],
  nyheter: ['nyheter'],
  opplaeringslop: ['opplaeringslop', 'laerlinger'],
  skolemiljo: ['skolemiljo'],
  statistikk: ['statistikk'],
  tilrettelegging: ['tilrettelegging'],
  vurdering: ['vurdering', 'laerlinger'],
};

/** Data fra kildene og modulene som viser dem. */
const DATAMODULER: Record<string, readonly string[]> = {
  grep: ['fag', 'opplaeringslop', 'laereplanverket', 'arbeidstid'],
  fagfordeling: ['fag', 'arbeidstid'],
  lovdata: ['lov', 'fylker'],
  vigo: ['begreper', 'fag', 'opplaeringslop', 'vurdering'],
  utdanning: ['opplaeringslop'],
  skoler: ['opplaeringslop'],
  ndla: ['fag'],
  elevundersokelsen: ['elevundersokelsen'],
  statistikk: ['statistikk', 'fylker', 'inntak', 'vurdering', 'eksamen', 'opplaeringslop', 'begreper', 'arbeidstid'],
  udir: ['inntak', 'vurdering'],
  skolerute: ['kalender'],
  skolear: ['inntak', 'arbeidstid', 'vurdering'],
  eksamen: ['eksamen', 'kalender'],
  inntaksdatoer: ['kalender'],
};

/** Regelsettene i rules/ og modulene som bruker dem. */
const REGELMODULER: Record<string, readonly string[]> = {
  sfs2213: ['arbeidstid'],
  hta: ['arbeidstid'],
  inntak: ['inntak'],
  vurdering: ['vurdering', 'fag'],
};

/** Felles kode: kjernetestene for skallet, navigasjonen og de felles komponentene, og overflyt for alle rutene. */
export const KJERNE = ['navigasjon', 'komponenter', 'modul-og-sok', 'malform-tema', 'innstillinger', 'lokaleregler', 'favoritter', 'om', 'kildestatus', 'pwa'] as const;

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
    // Dagens jukselapp (avgjørelse 086): kortet, panelet med merket, utvalget og faktaene i modulene.
    if (/^src\/(app\/(Jukselapp|Forsidepanel)|core\/jukselapp\/|modules\/.+\/(fakta|jukselappfag|jukselapp)\.ts$)/.test(fil)) {
      speker.add('jukselapp');
      grunner.push(`${fil}: dagens jukselapp`);
    }
    // Meldingen om ny versjon (avgjørelse 088): overlegget og punktene.
    if (/^src\/(app\/Oppdateringsvarsel|components\/Overlegg|core\/versjon\/)/.test(fil) || fil === 'content/versjoner.yaml') {
      speker.add('nyversjon');
      grunner.push(`${fil}: meldingen om ny versjon`);
      if (fil === 'content/versjoner.yaml') continue;
    }
    // Velkomsten (fase 10, avgjørelse 094). Selve vinduet, tekstene og stilene lastes bare med velkomsten. Det som
    // står i startpakken (åpningen og fylke- og skolevalget), er også felles kode.
    if (/^src\/(app\/velkomst\/|app\/StedValg|strings\/velkomst\.|styles\/velkomst\.css)/.test(fil)) {
      speker.add('velkomst');
      grunner.push(`${fil}: velkomsten`);
      if (/^src\/(app\/velkomst\/(Velkomst|Bilder|roller)|strings\/velkomst\.|styles\/velkomst\.css)/.test(fil)) continue;
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

/** Uttrykket til `--grep`: hele spesifikasjonene, og overflyt- og teksthøydetestene for rutene. `null` når ingenting skal kjøres. */
export function grepFor(utvalg: Utvalg): string | null {
  const deler = utvalg.speker.map((s) => `${escape(s)}\\.spec\\.ts`);
  // Overflyten og plasseringen av merker og ikoner i teksthøyden (avgjørelse 092) testes for de samme rutene.
  if (utvalg.ruter === 'alle') deler.push('(overflyt|teksthoyde)\\.spec\\.ts');
  else if (utvalg.ruter.length > 0) deler.push(`(overflyt|teksthoyde)\\.spec\\.ts .*(${utvalg.ruter.map(escape).join('|')})`);
  return deler.length > 0 ? `(${deler.join('|')})` : null;
}
