// Samlet søk. Samme funksjoner brukes når indeksen bygges ved publisering og i nettleseren.
import MiniSearch, { type Options, type Query, type SearchResult } from 'minisearch';
import type { Flerspraak, Synonymer } from '../innhold/skjema.ts';

/**
 * Hva treffet er, vist under tittelen i søkeresultatene. Typen skal være det treffet kalles ellers i appen: en veiviser,
 * en kalkulator, en tidslinje eller en side, ikke noe generelt (eier 04.10.2026).
 */
/**
 * Hva en oppføring gjelder når det ikke er videregående i fylkeskommunen: privatskoler eller grunnskolen. Treffene
 * står da lenger ned i søket, privatskolene bare når «Privatskole» ikke er valgt (avgjørelse 100).
 */
export type Sokeomrade = 'privatskole' | 'grunnskole';

export type Sokeoppforingstype = 'modul' | 'veiviser' | 'kalkulator' | 'tidslinje' | 'side' | 'begrep' | 'fagmerknad' | 'vitnemalsmerknad' | 'sokerstatus' | 'kode' | 'regel' | 'fag' | 'tilbud' | 'laereplanverk' | 'lov' | 'skole' | 'kontor';

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
  /** Fylket oppføringen bare gjelder for (fylkesinnhold uten nasjonal versjon). Vises bare med det fylket valgt. */
  fylke?: string;
  /**
   * Fylkene oppføringen hører til, når den hører til et sted: en skole, et opplæringskontor (fylkene det er godkjent
   * i), en lokal forskrift eller en fylkesside. Med valgt fylke vises de bare for det fylket, til brukeren slår av
   * knappen med fylket i søket (eier 05.10.2026).
   */
  sted?: readonly string[];
  /** Privatskoler eller grunnskolen (avgjørelse 100). */
  omrade?: readonly Sokeomrade[];
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
  fylke: string;
  sted: string;
  omrade: string;
}

export interface Sokeresultat {
  id: string;
  type: Sokeoppforingstype;
  tittel: Flerspraak;
  rute: string;
  modul: string;
  score: number;
  /** Fylket treffet bare gjelder for, eller null. */
  fylke: string | null;
  /** Fylkene treffet hører til, eller null når det ikke hører til et sted. */
  sted?: string[] | null;
  /** Privatskoler eller grunnskolen, eller null (avgjørelse 100). */
  omrade?: Sokeomrade[] | null;
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
    fylke: o.fylke ?? '',
    sted: (o.sted ?? []).join(','),
    omrade: (o.omrade ?? []).join(','),
  };
}

const TEGN = /[\s\-–—.,;:!?()«»"'/§]+/u;

function valg(synonymer: Synonymer): Options<Dokument> {
  const normaliser = lagNormaliserer(synonymer);
  return {
    fields: ['tittel', 'stikkord', 'tekst'],
    storeFields: ['type', 'tittelNb', 'tittelNn', 'rute', 'modul', 'vekt', 'fylke', 'sted', 'omrade'],
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

/** Hverdagsordene i søket for hver indeks (avgjørelse 100), så `sok` kan bruke dem uten å få synonymene på nytt. */
const hverdagsordFor = new WeakMap<MiniSearch<Dokument>, { normaliser: (term: string) => string; gir: ReadonlyMap<string, readonly string[]> }>();

function husk(indeks: MiniSearch<Dokument>, synonymer: Synonymer): MiniSearch<Dokument> {
  const normaliser = lagNormaliserer(synonymer);
  const gir = new Map<string, string[]>();
  for (const h of synonymer.hverdagsord ?? []) {
    for (const ord of h.ord) {
      const n = normaliser(ord);
      gir.set(n, [...(gir.get(n) ?? []), ...h.gir]);
    }
  }
  hverdagsordFor.set(indeks, { normaliser, gir });
  return indeks;
}

export function byggIndeks(oppforinger: readonly Sokeoppforing[], synonymer: Synonymer): MiniSearch<Dokument> {
  const indeks = new MiniSearch<Dokument>(valg(synonymer));
  const unike = new Map(oppforinger.map((o) => [o.id, o]));
  indeks.addAll([...unike.values()].map(tilDokument));
  return husk(indeks, synonymer);
}

export function serialiser(indeks: MiniSearch<Dokument>): string {
  return JSON.stringify(indeks);
}

export function lastIndeks(json: string, synonymer: Synonymer): MiniSearch<Dokument> {
  return husk(MiniSearch.loadJSON<Dokument>(json, valg(synonymer)), synonymer);
}

/**
 * Spørringen til MiniSearch. Et hverdagsord i søket («leseplikt») finner også ordene appen bruker («undervisningstid»,
 * «årsramme»): ordet byttes med «ordet ELLER det det gir», og et uttrykk på flere ord må ha alle ordene. Uten
 * hverdagsord er spørringen teksten som før (avgjørelse 100).
 */
function sporringFor(indeks: MiniSearch<Dokument>, s: string, combineWith: 'AND' | 'OR'): Query {
  const h = hverdagsordFor.get(indeks);
  const ord = s.split(TEGN).filter(Boolean);
  if (!h || !ord.some((o) => h.gir.has(h.normaliser(o)))) return s;
  return {
    combineWith,
    queries: ord.map((o): Query => {
      const gir = h.gir.get(h.normaliser(o));
      return gir ? { combineWith: 'OR', queries: [o, ...gir.map((g): Query => ({ combineWith: 'AND', queries: [g] }))] } : o;
    }),
  };
}

export function sok(indeks: MiniSearch<Dokument>, sporring: string, grense = 50): Sokeresultat[] {
  const s = sporring.trim();
  if (s.length < 2) return [];
  let treff: SearchResult[] = indeks.search(sporringFor(indeks, s, 'AND'));
  if (treff.length === 0) treff = indeks.search(sporringFor(indeks, s, 'OR'), { combineWith: 'OR' });
  return treff.slice(0, grense).map((t) => ({
    id: t.id as string,
    type: t.type as Sokeoppforingstype,
    tittel: { nb: t.tittelNb as string, nn: t.tittelNn as string },
    rute: t.rute as string,
    modul: t.modul as string,
    score: t.score,
    fylke: typeof t.fylke === 'string' && t.fylke !== '' ? t.fylke : null,
    sted: typeof t.sted === 'string' && t.sted !== '' ? t.sted.split(',') : null,
    omrade: typeof t.omrade === 'string' && t.omrade !== '' ? (t.omrade.split(',') as Sokeomrade[]) : null,
  }));
}
