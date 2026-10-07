// Manifestet hver modul eksporterer fra src/modules/<modul>/index.ts. Se docs/ARKITEKTUR.md.
import type { ComponentType } from 'preact';
import type { Tekstverdi } from '../core/i18n/tekst.ts';
import type { Flerspraak, Frist } from '../core/innhold/skjema.ts';
import type { Sokeoppforing } from '../core/sok/sok.ts';
import type { Ikonnavn } from '../components/Ikon.tsx';
import type { KategoriId } from './kategorier.ts';

export interface SideProps {
  /** Parametre fra ruten, f.eks. { id: 'arsramme' } for /begreper/:id. */
  parametre: Record<string, string>;
  /** Spørreparametre fra adressen. */
  sporring: URLSearchParams;
}

export interface Modulrute {
  /** Sti uten #, f.eks. "/begreper" eller "/begreper/:id". Må starte med "/<modul-id>". */
  sti: string;
  tittel: Tekstverdi;
  side: () => Promise<{ default: ComponentType<SideProps> }>;
}

/**
 * Hva favoritten er: en funksjon (kalkulator, veiviser), et fag, et begrep, en side (en oversikt, et dokument, et
 * tilbud) eller et element som står inne på en side uten å ha en egen side (en skole, en paragraf, avgjørelse 058).
 */
export type Favoritttype = 'funksjon' | 'fag' | 'begrep' | 'side' | 'element';

export interface Favorittbar {
  /** Globalt unik id, f.eks. "begreper:arsramme". */
  id: string;
  type: Favoritttype;
  tittel: Flerspraak;
  rute: string;
  /** Eget ikon. Uten står ikonet til inngangen eller modulen over (ikonForFavoritt, avgjørelse 056). */
  ikon?: Ikonnavn;
}

/** En inngang til modulen på forsiden. Uten innganger står modulen selv som én boks. */
export interface Inngang {
  id: string;
  tittel: Tekstverdi;
  beskrivelse?: Tekstverdi;
  rute: string;
  ikon: Ikonnavn;
  /** Står i den sammenleggbare boksen under hovedboksene (`flereTittel`), lukket til brukeren åpner den. */
  flere?: boolean;
  /**
   * Tittel og adresse etter fylket brukeren har valgt, f.eks. «Vestland fylkeskommune» og #/fylker/46 (avgjørelse
   * 061). Gir null når inngangen skal stå som den er.
   */
  etterFylke?: (fylke: string | null) => { tittel: string; rute: string } | null;
}

/** En lenke med ikon på en av modulens oversiktssider (`undersider`). */
export interface Underside {
  rute: string;
  ikon: Ikonnavn;
}

export interface Modulmanifest {
  id: string;
  navn: Tekstverdi;
  beskrivelse?: Tekstverdi;
  /** Ekstra søkeord for treffet på selve modulen i søket, f.eks. «frister» for Kalender. */
  stikkord?: string[];
  ikon: Ikonnavn;
  kategori: KategoriId;
  /** Rekkefølge innenfor kategorien. Lavest først. */
  rekkefolge?: number;
  ruter: Modulrute[];
  /** Det modulen bidrar med til samlet søk. */
  sokeoppforinger(): Promise<Sokeoppforing[]>;
  /**
   * Funksjoner, fag, begreper osv. som kan favorittmerkes. Med `ider` trengs bare disse (favorittene brukeren
   * har). Moduler med mange oppføringer, som fagene, kan da la være å laste alt.
   */
  favorittbare(ider?: readonly string[]): Promise<Favorittbar[]>;
  /** Frister modulen eier. Samles i kalenderen (avgjørelse 066). */
  frister(): Promise<Frist[]>;
  /**
   * Boksene modulen har på forsiden under kategorien sin (avgjørelse 030). Uten innganger står modulen som én boks
   * med navn og beskrivelse.
   */
  innganger?: Inngang[];
  /**
   * Lenkene med eget ikon på modulens egne oversiktssider, f.eks. Skoler og Opplæringskontor i Opplæringsløp. En
   * favoritt under en av disse adressene får ikonet herfra, slik som fra inngangene på forsiden (avgjørelse 058).
   * Oversiktssidene henter ikonet herfra, så de to ikke kan bli ulike.
   */
  undersider?: Underside[];
  /** Tittelen på den sammenleggbare boksen med innganger merket `flere`. */
  flereTittel?: Tekstverdi;
  /** Undertittelen i boksen med innganger merket `flere`. Uten den står navnene på inngangene. */
  flereUnder?: Tekstverdi;
  /**
   * false: modulen står ikke som boks under kategorien sin på forsiden, fordi den har en egen plass der: Kalender,
   * Nyheter og Videregående i tall i panelet øverst eller i sidekolonnen (eier 07.10.2026). Siden finnes fortsatt, i
   * søket og som favoritt.
   */
  paaForsiden?: false;
  /** Kilde-id-er fra content/kilder.yaml. */
  kilder: string[];
  /** Moduler fra senere faser er skjult til de er godkjent. */
  status: 'aktiv' | 'skjult';
}
