// Utvalget av nyheter i appen: kildene fra content/nyheter/kilder.yaml, sakene brukeren kan se (Statsforvalteren bare
// med valgt fylke), filteret på hvem og kilde, og grupperingen per dag. Rene funksjoner, testet i
// tests/unit/nyheter.test.ts.
import kilderFil from '../../../content/nyheter/kilder.yaml';
import type { Flerspraak } from '../../core/innhold/skjema.ts';
import type { Nyhetskilder } from './kildeskjema.ts';
import { NYHETSTYPER, type Nyhet, type Nyheter, type Nyhetstype } from './skjema.ts';

/** Det appen trenger om en kilde. */
export interface Kildevisning {
  id: string;
  navn: Flerspraak;
  /** Kort navn i linjen under tittelen, f.eks. «Udir». */
  kortnavn?: Flerspraak;
  type: Nyhetstype;
  kilde: string;
  merknad?: Flerspraak;
  fylker?: string[];
}

export const NYHETSKILDER: readonly Kildevisning[] = (kilderFil as Nyhetskilder).kilder.map(({ id, navn, kortnavn, type, kilde, merknad, fylker }) => ({
  id,
  navn,
  ...(kortnavn ? { kortnavn } : {}),
  type,
  kilde,
  ...(merknad ? { merknad } : {}),
  ...(fylker ? { fylker } : {}),
}));

const kildeMedId = new Map(NYHETSKILDER.map((k) => [k.id, k]));

export function finnKilde(id: string): Kildevisning | undefined {
  return kildeMedId.get(id);
}

/** Fylket nyhetene vises for: et fylkesnummer, `alle` fylkene, eller null (bare de nasjonale kildene). */
export type Nyhetsfylke = string | 'alle' | null;

/**
 * Kildene brukeren kan se: alle uten fylke, og Statsforvalteren og fylkeskommunen for fylket som er valgt. På
 * nyhetssiden kan brukeren velge et annet fylke, eller alle (eier 07.10.2026). Forsiden følger fylket i innstillingene.
 */
export function synligeKilder(kilder: readonly Kildevisning[], fylke: Nyhetsfylke): Kildevisning[] {
  return kilder.filter((k) => !k.fylker || fylke === 'alle' || (fylke !== null && k.fylker.includes(fylke)));
}

/** Fylket fra adressen (?fylke=46 eller ?fylke=alle). Uten står fylket i innstillingene. */
export function lesNyhetsfylke(sporring: URLSearchParams, gyldige: readonly string[], standard: string | null): Nyhetsfylke {
  const f = sporring.get('fylke');
  if (f === 'alle') return 'alle';
  if (f === 'ingen') return null;
  return f && gyldige.includes(f) ? f : standard;
}

export interface Nyhetsfilter {
  type: Nyhetstype | null;
  kilde: string | null;
}

/** Sakene fra kildene brukeren kan se, med filteret. Sakene står nyeste først i filen. */
export function velgSaker(saker: readonly Nyhet[], kilder: readonly Kildevisning[], filter: Nyhetsfilter = { type: null, kilde: null }): Nyhet[] {
  const synlige = new Map(kilder.map((k) => [k.id, k]));
  return saker.filter((s) => {
    const k = synlige.get(s.kilde);
    if (!k) return false;
    if (filter.type && k.type !== filter.type) return false;
    return !filter.kilde || filter.kilde === s.kilde;
  });
}

/** Typene som har kilder, i fast rekkefølge, til filteret. */
export function typerMedKilder(kilder: readonly Kildevisning[]): Nyhetstype[] {
  return NYHETSTYPER.filter((t) => kilder.some((k) => k.type === t));
}

/** Datoen 30 dager før `idag` (YYYY-MM-DD). Sakene fra før står under «Vis eldre» på nyhetssiden. */
export function forTrettiDager(idag: string): string {
  const d = new Date(`${idag}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 30);
  return d.toISOString().slice(0, 10);
}

/** Sakene per dag, nyeste dag først. */
export function perDag(saker: readonly Nyhet[]): { dato: string; saker: Nyhet[] }[] {
  const dager: { dato: string; saker: Nyhet[] }[] = [];
  for (const s of saker) {
    const siste = dager[dager.length - 1];
    if (siste?.dato === s.dato) siste.saker.push(s);
    else dager.push({ dato: s.dato, saker: [s] });
  }
  return dager;
}

/** Filteret fra adressen (?hvem=myndighet&kilde=udir). Ukjente verdier blir borte. */
export function lesFilter(sporring: URLSearchParams): Nyhetsfilter {
  const hvem = sporring.get('hvem');
  const kilde = sporring.get('kilde');
  return {
    type: NYHETSTYPER.find((t) => t === hvem) ?? null,
    kilde: kilde && kildeMedId.has(kilde) ? kilde : null,
  };
}

export function filterSporring(filter: Nyhetsfilter, fylke?: { valgt: Nyhetsfylke; standard: string | null }): string {
  const p = new URLSearchParams();
  if (fylke && fylke.valgt !== fylke.standard) p.set('fylke', fylke.valgt ?? 'ingen');
  if (filter.type) p.set('hvem', filter.type);
  if (filter.kilde) p.set('kilde', filter.kilde);
  const s = p.toString();
  return s ? `?${s}` : '';
}

/** Inntil så mange saker står i panelet på forsiden. Saker som ikke får plass i høyden, vises ikke (komponenter.tsx). */
const PAA_FORSIDEN = 4;

/** Høyst så mange saker fra samme kilde på forsiden, så én kilde med mange saker samme dag ikke fyller panelet. */
const PER_KILDE = 2;

/**
 * De nyeste sakene for brukeren: fra kildene uten fylke, og Statsforvalteren i fylket som er valgt. Høyst PER_KILDE fra
 * hver kilde.
 */
export function nyesteSaker(d: Nyheter, fylke: string | null, filter?: Nyhetsfilter, antall = PAA_FORSIDEN): Nyhet[] {
  const telt = new Map<string, number>();
  // Med filter på én kilde gjelder ikke grensen per kilde.
  const grense = filter?.kilde ? antall : PER_KILDE;
  return velgSaker(d.saker, synligeKilder(NYHETSKILDER, fylke), filter)
    .filter((s) => {
      const n = telt.get(s.kilde) ?? 0;
      telt.set(s.kilde, n + 1);
      return n < grense;
    })
    .slice(0, antall);
}

/** Filteret på forsiden som én verdi i nedtrekkslisten: «» (alle), «type:myndighet» eller «kilde:udir». */
export function lesForsidefilter(verdi: string | null): Nyhetsfilter {
  const [hva, id] = (verdi ?? '').split(':');
  if (hva === 'type') return { type: NYHETSTYPER.find((t) => t === id) ?? null, kilde: null };
  if (hva === 'kilde' && id && kildeMedId.has(id)) return { type: null, kilde: id };
  return { type: null, kilde: null };
}

export function forsidefilterVerdi(filter: Nyhetsfilter): string {
  if (filter.kilde) return `kilde:${filter.kilde}`;
  return filter.type ? `type:${filter.type}` : '';
}
