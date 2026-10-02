// Samlet søk. Samme funksjoner brukes når indeksen bygges ved publisering og i nettleseren.
import MiniSearch, { type Options, type SearchResult } from 'minisearch';
import type { Flerspraak, Synonymer } from '../innhold/skjema.ts';

export type Sokeoppforingstype = 'modul' | 'funksjon' | 'begrep' | 'regel' | 'fag' | 'tilbud' | 'laereplanverk' | 'lov' | 'side';

export interface Sokeoppforing {
  id: string;
  type: Sokeoppforingstype;
  tittel: Flerspraak;
  tekst?: Flerspraak;
  stikkord?: string[];
  /** Hash-rute uten #, f.eks. "/begreper/arsramme". */
  rute: string;
  modul: string;
  /** Ganges med treffpoengene. Under 1 gir oppføringen lavere plass, f.eks. fag utenom de vanlige (avgjørelse 031). */
  vekt?: number;
}

interface Dokument {
  id: string;
  type: Sokeoppforingstype;
  tittel: string;
  tekst: string;
  stikkord: string;
  tittelNb: string;
  tittelNn: string;
  rute: string;
  modul: string;
  vekt: number;
}

export interface Sokeresultat {
  id: string;
  type: Sokeoppforingstype;
  tittel: Flerspraak;
  rute: string;
  modul: string;
  score: number;
}

/**
 * Lager en funksjon som gjør nynorske og bokmålske former like, slik at
 * «skule» og «skole» blir samme term. Varianter byttes ut også inne i
 * sammensatte ord («grunnskule» → «grunnskole»). Lengste variant først.
 */
export function lagNormaliserer(synonymer: Synonymer): (term: string) => string {
  const par = synonymer.grupper
    .flatMap((g) => g.varianter.map((v) => [v.toLowerCase(), g.kanonisk.toLowerCase()] as const))
    .sort((a, b) => b[0].length - a[0].length);
  return (term: string) => {
    let t = term.toLowerCase();
    for (const [variant, kanonisk] of par) {
      if (t.includes(variant)) t = t.split(variant).join(kanonisk);
    }
    return t;
  };
}

function rensHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tilDokument(o: Sokeoppforing): Dokument {
  return {
    id: o.id,
    type: o.type,
    tittel: `${o.tittel.nb} ${o.tittel.nn}`,
    tekst: o.tekst ? rensHtml(`${o.tekst.nb} ${o.tekst.nn}`) : '',
    stikkord: (o.stikkord ?? []).join(' '),
    tittelNb: o.tittel.nb,
    tittelNn: o.tittel.nn,
    rute: o.rute,
    modul: o.modul,
    vekt: o.vekt ?? 1,
  };
}

const TEGN = /[\s\-–—.,;:!?()«»"'/§]+/u;

function valg(synonymer: Synonymer): Options<Dokument> {
  const normaliser = lagNormaliserer(synonymer);
  return {
    fields: ['tittel', 'stikkord', 'tekst'],
    storeFields: ['type', 'tittelNb', 'tittelNn', 'rute', 'modul', 'vekt'],
    tokenize: (tekst) => tekst.split(TEGN).filter(Boolean),
    processTerm: (term) => {
      const t = normaliser(term);
      return t.length > 0 ? t : null;
    },
    searchOptions: {
      boost: { tittel: 3, stikkord: 2, tekst: 1 },
      boostDocument: (_id, _term, felt) => (typeof felt?.vekt === 'number' ? felt.vekt : 1),
      prefix: true,
      fuzzy: (term) => (term.length > 4 ? 0.2 : term.length > 3 ? 1 : 0),
      combineWith: 'AND',
    },
  };
}

export function byggIndeks(oppforinger: readonly Sokeoppforing[], synonymer: Synonymer): MiniSearch<Dokument> {
  const indeks = new MiniSearch<Dokument>(valg(synonymer));
  const unike = new Map(oppforinger.map((o) => [o.id, o]));
  indeks.addAll([...unike.values()].map(tilDokument));
  return indeks;
}

export function serialiser(indeks: MiniSearch<Dokument>): string {
  return JSON.stringify(indeks);
}

export function lastIndeks(json: string, synonymer: Synonymer): MiniSearch<Dokument> {
  return MiniSearch.loadJSON<Dokument>(json, valg(synonymer));
}

export function sok(indeks: MiniSearch<Dokument>, sporring: string, grense = 50): Sokeresultat[] {
  const s = sporring.trim();
  if (s.length < 2) return [];
  let treff: SearchResult[] = indeks.search(s);
  if (treff.length === 0) treff = indeks.search(s, { combineWith: 'OR' });
  return treff.slice(0, grense).map((t) => ({
    id: t.id as string,
    type: t.type as Sokeoppforingstype,
    tittel: { nb: t.tittelNb as string, nn: t.tittelNn as string },
    rute: t.rute as string,
    modul: t.modul as string,
    score: t.score,
  }));
}
