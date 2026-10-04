// Kategoriene på forsiden. Navnene ligger i src/strings.
import type { Tekstnokkel } from '../core/i18n/tekst.ts';

export const kategorier = [
  { id: 'arbeidstid', navn: 'kategorier.arbeidstid' },
  { id: 'fag', navn: 'kategorier.fag' },
  // Inntak og opplæringstilbud står for seg, så Læreplanverket bare har læreplanverket (eier 04.10.2026).
  { id: 'inntak', navn: 'kategorier.inntak' },
  { id: 'elev', navn: 'kategorier.elev' },
  { id: 'skolemiljo', navn: 'kategorier.skolemiljo' },
  { id: 'felles', navn: 'kategorier.felles' },
] as const satisfies readonly { id: string; navn: Tekstnokkel }[];

export type KategoriId = (typeof kategorier)[number]['id'];

/** Så mange moduler vises per kategori på forsiden før kategorien får egen side. */
export const MAKS_PER_KATEGORI_PAA_FORSIDEN = 6;
