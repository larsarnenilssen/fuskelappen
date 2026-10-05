// Typene for Lov og forskrift (fase 3, avgjørelse 039), uten zod, så modulmanifestet og sidene kan bruke dem uten å
// ta med skjemabiblioteket i startpakken. Skjemaet står i skjema.ts. Teksten hentes fra Lovdatas gratis datasett
// (NLOD 2.0) av scripts/hent-lovdata.ts og vises uendret, på målformen den er fastsatt på.

/**
 * En bit tekst: ren tekst, en lenke (`l` er adressen hos Lovdata, f.eks. «lov/2023-06-09-30/§11-1») eller en
 * fotnotehenvisning (`f`). Peker lenken på en paragraf som står i appen, har den også `a` («opplaeringslova/11-1»),
 * og appen lenker dit i stedet for til Lovdata. Hentingen setter `a`.
 */
export type Segment = string | { t: string; l: string; a?: string } | { f: string };

/** Et ledd i en paragraf, med en liste og tekst etter listen når leddet har det. */
export interface Ledd {
  tekst: Segment[];
  liste?: Punkt[];
  /** Tekst etter listen i samme ledd («leddfortsettelse»). */
  etter?: Segment[][];
  /** En tabell i teksten (f.eks. skoleruta), med overskriftsraden for seg. Hver celle er en tekst. */
  tabell?: { hode: Segment[][] | null; rader: Segment[][][] };
}

/** Et punkt i en liste, f.eks. «a.», med ett eller flere ledd. */
export interface Punkt {
  merke: string;
  ledd: Ledd[];
}

export interface Paragraf {
  /** Nummeret slik det står i adressen hos Lovdata, f.eks. «11-1» eller «18a». */
  nr: string;
  /** Nummeret slik det står i teksten, f.eks. «§ 11-1» eller «§ 18 a». */
  visNr: string;
  tittel: string;
  ledd: Ledd[];
  /** Merknader om endringer («Endra ved lov …»). */
  endringer: Segment[][];
  fotnoter: { nr: string; tekst: Segment[] }[];
}

export interface Seksjon {
  /** Navnet hos Lovdata, f.eks. «kap11», «del3» eller «kapI». */
  id: string;
  type: 'del' | 'kapittel' | 'avsnitt';
  /** Kapittelnummeret («11», «IV»), eller null for deler og avsnitt. */
  nr: string | null;
  /** Overskriften slik den står i teksten, f.eks. «Kapittel 11 Tilpassa opplæring og individuell tilrettelegging». */
  overskrift: string;
  /** Tekst under overskriften, f.eks. heimelen for et kapittel i en forskrift eller en merknad om endringer. */
  merknader: Segment[][];
  seksjoner: Seksjon[];
  paragrafer: Paragraf[];
}

/** Hvem et dokument gjelder for. Skolenes egne regler gjelder én eller flere skoler (id i skoleregisteret). */
export type Gyldighet = { niva: 'nasjonal' } | { niva: 'fylke'; fylke: string } | { niva: 'skole'; fylke: string; skoler: string[] };

/** Typene lokale forskrifter appen henter for alle fylker (avgjørelse 061). */
export type Lokaltype = 'skoleregler' | 'skoleregler-voksne' | 'skoleregler-skole' | 'inntak' | 'skolerute';

/** Et dokument (lov eller forskrift) slik det vises i appen: utvalget av kapitler fra Lovdata. */
export interface Lovdokument {
  /** Adressen i appen, f.eks. «opplaeringslova» (#/lov/opplaeringslova). */
  id: string;
  /** Kilden i kilderegisteret. */
  kilde: string;
  /** «avtale» er en avtale med egne ord (avtaler.ts), som vises og søkes i som dokumentene fra Lovdata. */
  type: 'lov' | 'forskrift' | 'avtale';
  tittel: string;
  korttittel: string;
  /** Målformen dokumentet er fastsatt på. Teksten vises uoversatt. */
  malform: 'nb' | 'nn';
  /** Dokumentet hos Lovdata, f.eks. «lov/2023-06-09-30». */
  refid: string;
  /** Datoen siste endring tok til å gjelde, eller null. */
  sistEndret: string | null;
  /** Datoen dokumentet tok til å gjelde, og for en skolerute når den slutter å gjelde (avgjørelse 061). */
  iKraft?: string | null;
  iKraftTil?: string | null;
  /** Typen lokal forskrift, for de lokale forskriftene som hentes for alle fylker. */
  lokaltype?: Lokaltype;
  /** Datoen teksten sist ble endret i appen (hentingen setter den bare når teksten er ny). */
  hentet: string;
  gyldighet: Gyldighet;
  /** Kapitlene som er tatt med, eller null når hele dokumentet er med. */
  utvalg: string[] | null;
  seksjoner: Seksjon[];
}

/** Kort om hvert dokument, til oversikten og søket, uten teksten. */
export interface Lovoversikt {
  dokumenter: {
    id: string;
    kilde: string;
    type: Lovdokument['type'];
    tittel: string;
    korttittel: string;
    malform: Lovdokument['malform'];
    refid: string;
    gyldighet: Gyldighet;
    utvalg: string[] | null;
    sistEndret?: string | null;
    iKraft?: string | null;
    iKraftTil?: string | null;
    lokaltype?: Lokaltype;
    antallKapitler: number;
    antallParagrafer: number;
    /** Numrene på paragrafene, så lenker til Lovdata andre steder i appen kan få en lenke til paragrafen i appen. */
    paragrafer: string[];
  }[];
}

/** Alle paragrafene i rekkefølge, med kapitlene og delene de står i. */
export function alleParagrafer(seksjoner: readonly Seksjon[], over: readonly Seksjon[] = []): { paragraf: Paragraf; seksjoner: Seksjon[] }[] {
  return seksjoner.flatMap((s) => [...s.paragrafer.map((p) => ({ paragraf: p, seksjoner: [...over, s] })), ...alleParagrafer(s.seksjoner, [...over, s])]);
}

/** Alle seksjonene i rekkefølge, med seksjonene inni etter hverandre. */
export function alleSeksjoner(seksjoner: readonly Seksjon[]): Seksjon[] {
  return seksjoner.flatMap((s) => [s, ...alleSeksjoner(s.seksjoner)]);
}

/** Teksten i en liste med segmenter, uten lenker og fotnoter. */
export const rentekst = (segmenter: readonly Segment[]) => segmenter.map((s) => (typeof s === 'string' ? s : 't' in s ? s.t : '')).join('');

/** Hele teksten i en paragraf som ren tekst, til søket og sitatsjekken. */
export function paragraftekst(p: Paragraf): string {
  const ledd = (l: Paragraf['ledd'][number]): string =>
    [
      rentekst(l.tekst),
      ...(l.liste ?? []).flatMap((x) => [x.merke, ...x.ledd.map(ledd)]),
      ...(l.etter ?? []).map(rentekst),
      ...(l.tabell ? [...(l.tabell.hode ? [l.tabell.hode] : []), ...l.tabell.rader].map((r) => r.map(rentekst).join(' ')) : []),
    ].join(' ');
  return p.ledd.map(ledd).join(' ');
}

/** Hele teksten i et dokument som ren tekst, paragraf for paragraf. Kildesjekken ser etter sitatene her. */
export function dokumenttekst(dok: Lovdokument): string {
  return alleParagrafer(dok.seksjoner)
    .map(({ paragraf }) => paragraftekst(paragraf))
    .join('\n');
}
