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
}

export interface Hurtigfunksjon {
  id: string;
  tittel: Tekstverdi;
  beskrivelse?: Tekstverdi;
  rute: string;
  ikon: Ikonnavn;
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
  /** Funksjoner, fag, begreper osv. som kan favorittmerkes. */
  favorittbare(): Promise<Favorittbar[]>;
  /** Frister modulen eier. Samles i årshjulet i fase 8. */
  frister(): Promise<Frist[]>;
  /** Hurtigkalkulatorer som vises på forsiden. */
  hurtigfunksjoner?: Hurtigfunksjon[];
  /** Kilde-id-er fra content/kilder.yaml. */
  kilder: string[];
  /** Moduler fra senere faser er skjult til de er godkjent. */
  status: 'aktiv' | 'skjult';
}
