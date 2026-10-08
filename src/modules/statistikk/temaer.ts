// Temasidene i Videregående i tall (eier 08.10.2026, avgjørelse 090): tallene fra Udir og SSB samlet etter tema. Egen
// fil uten komponenter, så manifestet kan lage favorittene uten å laste sidene.
import type { Ikonnavn } from '../../components/Ikon.tsx';
import { STATISTIKK_RUTE } from './adresse.ts';

export const TEMAER = [
  { id: 'ungdom', ikon: 'person' },
  { id: 'skolen', ikon: 'skole' },
  { id: 'fullforing', ikon: 'vei' },
] as const satisfies readonly { id: string; ikon: Ikonnavn }[];

export type Temaid = (typeof TEMAER)[number]['id'];

export const temarute = (tema: Temaid): string => `${STATISTIKK_RUTE}/${tema}`;
export const temaLenke = (tema: Temaid, fylke: string | null | undefined): string => `#${temarute(tema)}${fylke ? `?fylke=${fylke}` : ''}`;
export const temaFavoritt = (tema: Temaid): string => `statistikk:${tema}`;
export const erTema = (id: string | undefined): id is Temaid => TEMAER.some((t) => t.id === id);
