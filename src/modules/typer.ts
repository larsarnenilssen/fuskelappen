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

export type Favoritttype = 'funksjon' | 'fag' | 'begrep';

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
}

export interface Modulmanifest {
  id: string;
  navn: Tekstverdi;
  beskrivelse?: Tekstverdi;
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
  /** Frister modulen eier. Samles i årshjulet i fase 8. */
  frister(): Promise<Frist[]>;
  /**
   * Boksene modulen har på forsiden under kategorien sin (avgjørelse 030). Uten innganger står modulen som én boks
   * med navn og beskrivelse.
   */
  innganger?: Inngang[];
  /** Tittelen på den sammenleggbare boksen med innganger merket `flere`. */
  flereTittel?: Tekstverdi;
  /** Undertittelen i boksen med innganger merket `flere`. Uten den står navnene på inngangene. */
  flereUnder?: Tekstverdi;
  /** Kilde-id-er fra content/kilder.yaml. */
  kilder: string[];
  /** Moduler fra senere faser er skjult til de er godkjent. */
  status: 'aktiv' | 'skjult';
}
