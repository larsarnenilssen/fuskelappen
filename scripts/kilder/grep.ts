// Endringer i Grep-dataene (data/grep/) mellom to hentinger: nye og fjernede programområder og fagkoder,
// nye fagnavn, endrede årstimetall og vurderingsordninger, og nye, fjernede og endrede læreplaner.
// Ren logikk, testes i tests/unit/kontrollsak.test.ts (avgjørelse 018 og 022).

export type Programomrader = Record<string, Record<string, [string, string][]>>;
export type Fagkoder = Record<string, [string, string][]>;
export type Arstimer = Record<string, number | null>;

/** Det som sammenlignes for hvert fag i fagindeksen (data/grep/fagindeks.json). */
export interface Fagspor {
  navn: string;
  timer: number | null;
  /** Vurderingsordningen for elever som kort tekst, f.eks. «standpunkt, trekkordning_2, eksamensform_2». */
  vurdering: string;
  /** Trinn, f.eks. «Vg2» eller «Vg2, Vg3». Mangler i data fra før tilbudsstrukturen. */
  trinn?: string;
}

/** Det som sammenlignes for hvert programområde (tilbudsstrukturen). */
export interface Programomradespor {
  navn: string;
  trinn: string;
  sted: string;
  /** Programområdene det bygger på, kommaseparert. */
  bygger: string;
  timer: number | null;
}

export interface Grepdata {
  programomrader: Programomrader;
  fagkoder: Fagkoder;
  arstimer: Arstimer;
  /** Alle fagkoder i videregående (fase 2). Mangler i data fra før fase 2. */
  fag?: Record<string, Fagspor>;
  /** Fingeravtrykk per læreplan (data/grep/laereplaner/). */
  laereplaner?: Record<string, string>;
  /** Programområdene i tilbudsstrukturen (fagindeksen). */
  tilbud?: Record<string, Programomradespor>;
}

export interface Grependringer {
  programomrader: { nye: string[]; fjernet: string[] };
  fagkoder: { nye: string[]; fjernet: string[]; nyttNavn: string[] };
  arstimer: { endret: string[]; nye: string[]; fjernet: string[] };
  fag?: { nye: string[]; fjernet: string[]; endret: string[] };
  laereplaner?: { nye: string[]; fjernet: string[]; endret: string[] };
  tilbud?: { nye: string[]; fjernet: string[]; endret: string[] };
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
  const ut: Grependringer = {
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
  if (ny.fag) {
    // Fagkoder og årstimetall som allerede står i delene over, tas ikke med to ganger.
    const kjent = new Set([...nf.keys(), ...gf.keys()]);
    const kjenteTimer = new Set([...na.keys(), ...ga.keys()]);
    const gammelFag = gammel.fag ?? {};
    const nye = Object.entries(ny.fag).filter(([k]) => !(k in gammelFag));
    ut.fag = {
      nye: gammel.fag ? nye.filter(([k]) => !kjent.has(k)).map(([k, f]) => `${k} ${f.navn}`) : [],
      fjernet: Object.entries(gammelFag)
        .filter(([k]) => !(k in (ny.fag ?? {})) && !kjent.has(k))
        .map(([k, f]) => `${k} ${f.navn}`),
      endret: Object.entries(ny.fag).flatMap(([k, f]) => {
        const g = gammelFag[k];
        if (!g) return [];
        const linjer: string[] = [];
        if (g.timer !== f.timer && !kjenteTimer.has(k)) linjer.push(`${k} ${f.navn}: årstimer ${timer(g.timer)} → ${timer(f.timer)}`);
        if (g.vurdering !== f.vurdering) linjer.push(`${k} ${f.navn}: vurderingsordning ${g.vurdering} → ${f.vurdering}`);
        if (g.trinn !== undefined && f.trinn !== undefined && g.trinn !== f.trinn) linjer.push(`${k} ${f.navn}: trinn ${g.trinn || 'ingen'} → ${f.trinn || 'ingen'}`);
        if (g.navn !== f.navn && !kjent.has(k)) linjer.push(`${k}: ${g.navn} → ${f.navn}`);
        return linjer;
      }),
    };
  }
  if (ny.tilbud) {
    const g = gammel.tilbud ?? {};
    const n = ny.tilbud;
    const vis = (k: string, p: Programomradespor) => `${k.replace(/-+$/, '')} ${p.navn} (${p.trinn})`;
    ut.tilbud = {
      nye: gammel.tilbud ? Object.entries(n).filter(([k]) => !(k in g)).map(([k, p]) => vis(k, p)) : [],
      fjernet: Object.entries(g)
        .filter(([k]) => !(k in n))
        .map(([k, p]) => vis(k, p)),
      endret: Object.entries(n).flatMap(([k, p]) => {
        const f = g[k];
        if (!f) return [];
        const felt: string[] = [];
        if (f.navn !== p.navn) felt.push(`navn ${f.navn} → ${p.navn}`);
        if (f.trinn !== p.trinn) felt.push(`trinn ${f.trinn} → ${p.trinn}`);
        if (f.sted !== p.sted) felt.push(`opplæringssted ${f.sted} → ${p.sted}`);
        if (f.bygger !== p.bygger) felt.push(`bygger på ${f.bygger || 'ingen'} → ${p.bygger || 'ingen'}`);
        if (f.timer !== p.timer) felt.push(`timer ${timer(f.timer)} → ${timer(p.timer)}`);
        return felt.length > 0 ? [`${vis(k, p)}: ${felt.join('; ')}`] : [];
      }),
    };
  }
  if (ny.laereplaner) {
    const g = gammel.laereplaner ?? {};
    const n = ny.laereplaner;
    ut.laereplaner = {
      nye: gammel.laereplaner ? Object.keys(n).filter((k) => !(k in g)) : [],
      fjernet: Object.keys(g).filter((k) => !(k in n)),
      endret: Object.keys(n).filter((k) => k in g && g[k] !== n[k]),
    };
  }
  return ut;
}

export function antallEndringer(e: Grependringer): number {
  const deler: Record<string, string[]>[] = [e.programomrader, e.fagkoder, e.arstimer, e.fag ?? {}, e.laereplaner ?? {}, e.tilbud ?? {}];
  return deler.reduce((s, del) => s + Object.values(del).reduce((t, l) => t + l.length, 0), 0);
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
    [e.fag?.nye.length ?? 0, 'nytt fag', 'nye fag'],
    [e.fag?.fjernet.length ?? 0, 'fag fjernet', 'fag fjernet'],
    [e.fag?.endret.length ?? 0, 'endring i et fag', 'endringer i fag'],
    [e.laereplaner?.nye.length ?? 0, 'ny læreplan', 'nye læreplaner'],
    [e.laereplaner?.fjernet.length ?? 0, 'læreplan fjernet', 'læreplaner fjernet'],
    [e.laereplaner?.endret.length ?? 0, 'endret læreplan', 'endrede læreplaner'],
    [e.tilbud?.nye.length ?? 0, 'nytt programområde i tilbudsstrukturen', 'nye programområder i tilbudsstrukturen'],
    [e.tilbud?.fjernet.length ?? 0, 'programområde lagt ned', 'programområder lagt ned'],
    [e.tilbud?.endret.length ?? 0, 'endret programområde', 'endrede programområder'],
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
    ...(e.fag?.nye ?? []).map((l) => `Nytt fag: ${l}`),
    ...(e.fag?.fjernet ?? []).map((l) => `Fag fjernet: ${l}`),
    ...(e.fag?.endret ?? []).map((l) => `Endret fag: ${l}`),
    ...(e.laereplaner?.nye ?? []).map((l) => `Ny læreplan: ${l}`),
    ...(e.laereplaner?.fjernet ?? []).map((l) => `Læreplan fjernet: ${l}`),
    ...(e.laereplaner?.endret ?? []).map((l) => `Endret læreplan: ${l} (https://www.udir.no/lk20/${l.toLowerCase()})`),
    ...(e.tilbud?.nye ?? []).map((l) => `Nytt programområde: ${l}`),
    ...(e.tilbud?.fjernet ?? []).map((l) => `Programområde lagt ned: ${l}`),
    ...(e.tilbud?.endret ?? []).map((l) => `Endret programområde: ${l}`),
  ];
  return linjer.length > maks ? [...linjer.slice(0, maks), `… og ${linjer.length - maks} til.`] : linjer;
}
