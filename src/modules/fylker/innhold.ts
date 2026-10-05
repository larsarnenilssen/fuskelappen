// Lenkene til fylkeskommunenes egne sider (content/fylker/lenker.yaml, avgjørelse 061). Appen kopierer ikke fylkenes
// tekster, men lenker til siden i fylket brukeren har valgt (eier 05.10.2026).
import lenkerFil from '../../../content/fylker/lenker.yaml';
import type { Fylkeslenker, Fylketema } from '../../core/innhold/skjema.ts';

export const fylkeslenker = lenkerFil as Fylkeslenker;

export type Fylkeoppforing = Fylkeslenker['fylker'][number];

export const fylkeRute = (fylke: string) => `/fylker/${fylke}`;

/** Med dette i adressen står «Hos fylkeskommunen» åpen på fylkessiden, f.eks. når brukeren kommer fra kalenderen. */
export const APNE_HOS_FYLKET = 'apne=fylket';

/** Adressen til en side i appen, med «Hos fylkeskommunen» åpen når det er en fylkesside (eier 05.10.2026). */
export const medFylketApent = (rute: string) => (/^\/fylker\/\d{2}$/.test(rute) ? `${rute}?${APNE_HOS_FYLKET}` : rute);

export function fylkeFor(fylke: string | null): Fylkeoppforing | null {
  return fylkeslenker.fylker.find((f) => f.fylke === fylke) ?? null;
}

/** Lenken til temaet hos fylket. Har ikke fylket egen side om temaet, gis siden for videregående (forside). */
export function lenkeFor(fylke: string | null, tema: Fylketema): { url: string; bekreftet: string | null; egen: boolean } | null {
  const f = fylkeFor(fylke);
  if (!f) return null;
  const egen = f.lenker[tema];
  if (egen) return { ...egen, egen: true };
  return f.lenker.forside ? { ...f.lenker.forside, egen: false } : null;
}

/** Nettstedet en lenke går til, uten «www.»: «vestlandfylke.no». */
export const nettsted = (url: string) => new URL(url).hostname.replace(/^www\./, '');
