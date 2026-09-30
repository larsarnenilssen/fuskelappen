// Endringer i Grep-dataene (data/grep/) mellom to hentinger: nye og fjernede programområder og fagkoder,
// nye fagnavn og endrede årstimetall. Ren logikk, testes i tests/unit/grep.test.ts (avgjørelse 018).

export type Programomrader = Record<string, Record<string, [string, string][]>>;
export type Fagkoder = Record<string, [string, string][]>;
export type Arstimer = Record<string, number | null>;

export interface Grepdata {
  programomrader: Programomrader;
  fagkoder: Fagkoder;
  arstimer: Arstimer;
}

export interface Grependringer {
  programomrader: { nye: string[]; fjernet: string[] };
  fagkoder: { nye: string[]; fjernet: string[]; nyttNavn: string[] };
  arstimer: { endret: string[]; nye: string[]; fjernet: string[] };
}

function programliste(p: Programomrader): Map<string, string> {
  const ut = new Map<string, string>();
  for (const [program, trinn] of Object.entries(p)) {
    for (const [t, liste] of Object.entries(trinn)) for (const [prefiks, navn] of liste) ut.set(`${program}${prefiks}${t}`, navn);
  }
  return ut;
}

function fagliste(f: Fagkoder): Map<string, string> {
  return new Map(Object.values(f).flat());
}

function timer(n: number | null): string {
  return n === null ? 'ingen' : String(n);
}

export function sammenlignGrep(gammel: Grepdata, ny: Grepdata): Grependringer {
  const gp = programliste(gammel.programomrader);
  const np = programliste(ny.programomrader);
  const gf = fagliste(gammel.fagkoder);
  const nf = fagliste(ny.fagkoder);
  const ga = new Map(Object.entries(gammel.arstimer));
  const na = new Map(Object.entries(ny.arstimer));
  return {
    programomrader: {
      nye: [...np].filter(([k]) => !gp.has(k)).map(([k, n]) => `${k} ${n}`),
      fjernet: [...gp].filter(([k]) => !np.has(k)).map(([k, n]) => `${k} ${n}`),
    },
    fagkoder: {
      nye: [...nf].filter(([k]) => !gf.has(k)).map(([k, n]) => `${k} ${n}`),
      fjernet: [...gf].filter(([k]) => !nf.has(k)).map(([k, n]) => `${k} ${n}`),
      nyttNavn: [...nf].filter(([k, n]) => gf.has(k) && gf.get(k) !== n).map(([k, n]) => `${k}: ${gf.get(k) ?? ''} → ${n}`),
    },
    arstimer: {
      endret: [...na].filter(([k, n]) => ga.has(k) && ga.get(k) !== n).map(([k, n]) => `${k}: ${timer(ga.get(k) ?? null)} → ${timer(n)}`),
      nye: [...na].filter(([k]) => !ga.has(k)).map(([k, n]) => `${k}: ${timer(n)}`),
      fjernet: [...ga].filter(([k]) => !na.has(k)).map(([k, n]) => `${k}: ${timer(n)}`),
    },
  };
}

export function antallEndringer(e: Grependringer): number {
  return [e.programomrader, e.fagkoder, e.arstimer].reduce((s, del) => s + Object.values(del).reduce((t, l: string[]) => t + l.length, 0), 0);
}

/** Kort sammendrag, f.eks. «3 nye fagkoder, 1 endret årstimetall». */
export function grepsammendrag(e: Grependringer): string {
  const deler: [number, string, string][] = [
    [e.programomrader.nye.length, 'nytt programområde', 'nye programområder'],
    [e.programomrader.fjernet.length, 'programområde fjernet', 'programområder fjernet'],
    [e.fagkoder.nye.length, 'ny fagkode', 'nye fagkoder'],
    [e.fagkoder.fjernet.length, 'fagkode fjernet', 'fagkoder fjernet'],
    [e.fagkoder.nyttNavn.length, 'fag med nytt navn', 'fag med nytt navn'],
    [e.arstimer.endret.length, 'endret årstimetall', 'endrede årstimetall'],
    [e.arstimer.nye.length, 'nytt årstimetall', 'nye årstimetall'],
    [e.arstimer.fjernet.length, 'årstimetall fjernet', 'årstimetall fjernet'],
  ];
  const tekst = deler.filter(([n]) => n > 0).map(([n, en, flere]) => `${n} ${n === 1 ? en : flere}`);
  return tekst.length === 0 ? 'Ingen endringer.' : `${tekst.join(', ')}.`;
}

/** Alle endringene som linjer, til rapporten. */
export function grepdetaljer(e: Grependringer, maks = 60): string[] {
  const linjer = [
    ...e.programomrader.nye.map((l) => `Nytt programområde: ${l}`),
    ...e.programomrader.fjernet.map((l) => `Programområde fjernet: ${l}`),
    ...e.fagkoder.nye.map((l) => `Ny fagkode: ${l}`),
    ...e.fagkoder.fjernet.map((l) => `Fagkode fjernet: ${l}`),
    ...e.fagkoder.nyttNavn.map((l) => `Nytt navn: ${l}`),
    ...e.arstimer.endret.map((l) => `Endret årstimetall: ${l}`),
    ...e.arstimer.nye.map((l) => `Nytt årstimetall: ${l}`),
    ...e.arstimer.fjernet.map((l) => `Årstimetall fjernet: ${l}`),
  ];
  return linjer.length > maks ? [...linjer.slice(0, maks), `… og ${linjer.length - maks} til.`] : linjer;
}
