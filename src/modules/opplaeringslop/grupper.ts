// Rene funksjoner for Opplæringsløp: hvordan et fag inngår i et tilbud (til fagarket), og fag gruppert etter
// programområdene de hører til i Grep (til lange lister med fag å velge blant). Alt følger kildene (eier 02.10.2026).
import type { Fagindeks } from '../fag/skjema.ts';
import { erVariant, type Tilbudsdel } from '../fag/tilbud/modell.ts';
import type { Tilbudsdata } from './data.ts';

export interface Fagrolle {
  /** Kategorien i tilbudet, eller vurdering og alternativ for særskilte grupper. */
  kategori: Tilbudsdel['kategori'] | 'vurdering' | 'alternativ';
  /** Årstimene til faget, eller null når de ikke er kjent (eller for vurdering). */
  timer: number | null;
  /** Faget er ett av flere eleven velger mellom (f.eks. 1P eller 1T). */
  valg: boolean;
}

/** Hvordan et fag inngår i et tilbud, eller null når faget ikke står i tilbudet. Fag eleven tar, går foran vurdering. */
export function fagITilbud(tb: Tilbudsdata, kode: string, indeks: Pick<Fagindeks, 'fag'>): Fagrolle | null {
  const timer = indeks.fag[kode]?.timer ?? null;
  for (const d of tb.deler) {
    if (d.type === 'fag') {
      if (d.koder.includes(kode)) return { kategori: d.kategori, timer: d.kategori === 'fellesfag' ? d.timer : timer, valg: d.kategori === 'fellesfag' && d.koder.length > 1 };
      if (d.utvalg?.koder.includes(kode)) return { kategori: d.kategori, timer, valg: true };
    } else if (d.kandidater.includes(kode)) {
      return { kategori: d.kategori, timer: d.kategori === 'yff' ? d.timer : timer, valg: d.kategori !== 'yff' || d.anbefalt !== kode };
    }
  }
  const fagdeler = tb.deler.filter((d): d is Extract<Tilbudsdel, { type: 'fag' }> => d.type === 'fag');
  if (fagdeler.some((d) => d.vurdering.includes(kode))) return { kategori: 'vurdering', timer: null, valg: false };
  if (fagdeler.some((d) => d.alternativer.includes(kode))) return { kategori: 'alternativ', timer, valg: false };
  return null;
}

/**
 * Fagene gruppert etter programområdene på samme trinn som de hører til i Grep, f.eks. «Realfag» og «Idrettsfag»
 * når et programfag til valg kan tas fra hele utdanningsprogrammet. Et fag i flere programområder står i hvert av
 * dem. Fag uten programområde på trinnet står i gruppen `andre`, sist. Gir null når alle fagene hører til samme
 * programområde, så listen ikke får et unødvendig nivå.
 */
export function programomradegrupper(
  koder: readonly string[],
  indeks: Pick<Fagindeks, 'fag' | 'programomrader'>,
  trinn: string,
  malform: 'nb' | 'nn',
  andre: string,
): [string, string[]][] | null {
  const grupper = new Map<string, string[]>();
  for (const k of koder) {
    const navn = new Set<string>();
    for (const p of indeks.fag[k]?.po ?? []) {
      const po = indeks.programomrader[p];
      // «Realfag vg2» → «Realfag»: trinnet er det samme for alle.
      if (po && po.trinn === trinn && po.sted === 'skole' && !erVariant(p)) navn.add(po.navn[malform].replace(/\s+vg\d$/i, ''));
    }
    for (const n of navn.size > 0 ? navn : [andre]) grupper.set(n, [...(grupper.get(n) ?? []), k]);
  }
  if (grupper.size <= 1) return null;
  return [...grupper].sort(([a], [b]) => (a === andre ? 1 : b === andre ? -1 : a.localeCompare(b, 'nb')));
}
