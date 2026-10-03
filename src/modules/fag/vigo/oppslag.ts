// Oppslag i dataene fra VIGO Kodeverksbase: hvilken kode som erstatter en utgått fagkode, hvilke utgåtte koder et
// fag erstatter, hvilke fag som brukes sammen, og søk i merknadene. Rene funksjoner (avgjørelse 026).
import type { Fagrelasjoner, Merknad } from './skjema.ts';

/**
 * Kodene som gjelder i dag for en utgått fagkode: følger erstatningene til koder som finnes (f.eks. i fagindeksen),
 * eller til siste koder i kjeden. Gir en tom liste når koden ikke er erstattet.
 */
export function gjeldendeKoder(kode: string, rel: Fagrelasjoner, finnes: (k: string) => boolean): string[] {
  const ut = new Set<string>();
  const sett = new Set<string>([kode]);
  const ko = [...(rel.erstatninger[kode]?.ny ?? [])];
  while (ko.length > 0) {
    const k = ko.shift() as string;
    if (sett.has(k)) continue;
    sett.add(k);
    const videre = rel.erstatninger[k]?.ny ?? [];
    if (finnes(k) || videre.length === 0) ut.add(k);
    else ko.push(...videre);
  }
  return [...ut].sort();
}

/** Utgåtte fagkoder som en kode erstatter direkte, nyeste sluttdato først. */
export function erstatterKoder(kode: string, rel: Fagrelasjoner): { kode: string; navn: string; utgatt: string | null }[] {
  return Object.entries(rel.erstatninger)
    .filter(([, e]) => e.ny.includes(kode))
    .map(([k, e]) => ({ kode: k, navn: e.navn, utgatt: e.utgatt }))
    .sort((a, b) => (b.utgatt ?? '').localeCompare(a.utgatt ?? '') || a.kode.localeCompare(b.kode));
}

/** Fagkoder som brukes sammen med koden, i begge retninger. */
export function brukesSammenMed(kode: string, rel: Fagrelasjoner): string[] {
  const ut = new Set(rel.brukesSammen[kode] ?? []);
  for (const [k, liste] of Object.entries(rel.brukesSammen)) if (liste.includes(kode)) ut.add(k);
  ut.delete(kode);
  return [...ut].sort();
}

/** Den nyeste læreplanen som erstatter en læreplan, eller null. */
export function nyLaereplan(lp: string, rel: Fagrelasjoner): string | null {
  const sett = new Set<string>([lp]);
  let naa = lp;
  while (rel.laereplaner[naa] && !sett.has(rel.laereplaner[naa] as string)) {
    naa = rel.laereplaner[naa] as string;
    sett.add(naa);
  }
  return naa === lp ? null : naa;
}

const normaliser = (s: string) => s.toLocaleLowerCase('nb').replace(/\s+/g, ' ').trim();

/** Søk i merknader på kode og tekst (bokmål og nynorsk). Tomt søk gir alle. */
export function sokMerknader(liste: readonly Merknad[], sok: string): Merknad[] {
  const ord = normaliser(sok).split(' ').filter(Boolean);
  if (ord.length === 0) return [...liste];
  return liste.filter((m) => {
    const tekst = normaliser(`${m.nr ?? ''} ${m.nr === undefined ? '' : String(m.nr).padStart(2, '0')} ${m.kode} ${m.nb} ${m.nn}`);
    return ord.every((o) => tekst.includes(o));
  });
}
