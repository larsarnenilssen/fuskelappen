// Avtalene i Regelverk (eier 02.10.2026, avgjørelse 039): Hovedtariffavtalen og SFS 2213 med egne ord, fordi
// rettighetene til avtaleteksten ikke er avklart. Kapitlene står i content/lovverk.yaml, og bestemmelsene er
// innholdselementer i content/lov/, som lastes første gang de trengs. En avtale gjøres om til et dokument med samme
// form som lovene, så søket og adressene virker likt (#/lov/hovedtariffavtalen/hta-ansettelse).
import utvalgFil from '../../../content/lovverk.yaml';
import type { Innholdselement } from '../../core/innhold/skjema.ts';
import type { Gyldighet, Lovdokument } from './typer.ts';

type Flerspraak = { nb: string; nn: string };

export interface Avtaleinfo {
  id: string;
  kilde: string;
  korttittel: Flerspraak;
  tittel: Flerspraak;
  gyldighet: Gyldighet;
  kapitler: { overskrift: Flerspraak; elementer: string[] }[];
}

export const avtaler: readonly Avtaleinfo[] = (utvalgFil as { avtaler?: Avtaleinfo[] }).avtaler ?? [];

export const finnAvtale = (id: string): Avtaleinfo | null => avtaler.find((a) => a.id === id) ?? null;

const filer = import.meta.glob<Innholdselement[]>('/content/lov/*.yaml', { import: 'default' });
let lopende: Promise<Map<string, Innholdselement>> | null = null;

/** Bestemmelsene i avtalene, etter id. */
export function lastBestemmelser(): Promise<Map<string, Innholdselement>> {
  lopende ??= Promise.all(Object.values(filer).map((last) => last())).then((lister) => new Map(lister.flat().map((e) => [e.id, e])));
  lopende.catch(() => {
    lopende = null;
  });
  return lopende;
}

const ENTITETER: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", nbsp: ' ' };

/** Teksten i en bestemmelse uten HTML, til søket. */
export function rentekstFraHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (_m, e: string) => ENTITETER[e] ?? ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** En avtale som et dokument på valgt målform: kapitlene som seksjoner og bestemmelsene som paragrafer. */
export function avtaleSomDokument(a: Avtaleinfo, bestemmelser: ReadonlyMap<string, Innholdselement>, malform: 'nb' | 'nn'): Lovdokument {
  return {
    id: a.id,
    kilde: a.kilde,
    type: 'avtale',
    tittel: a.tittel[malform],
    korttittel: a.korttittel[malform],
    malform,
    refid: '',
    sistEndret: null,
    hentet: '',
    gyldighet: a.gyldighet,
    utvalg: null,
    seksjoner: a.kapitler.map((k, i) => ({
      id: `kap${i + 1}`,
      type: 'kapittel' as const,
      nr: null,
      overskrift: k.overskrift[malform],
      merknader: [],
      seksjoner: [],
      paragrafer: k.elementer.flatMap((id) => {
        const e = bestemmelser.get(id);
        return e ? [{ nr: id, visNr: '', tittel: e.tittel[malform], ledd: [{ tekst: [rentekstFraHtml(e.tekst[malform])] }], endringer: [], fotnoter: [] }] : [];
      }),
    })),
  };
}
