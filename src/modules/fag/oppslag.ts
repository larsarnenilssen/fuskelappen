// Søk og filter i fagindeksen fra Grep. Rene funksjoner uten avhengighet til grensesnittet.
import { type Fagklasse, SKJULTE } from './klasser.ts';
import type { Fag, Fagindeks, Fagtype, Trinn } from './skjema.ts';

export interface Fagfilter {
  /** Fritekst: fagnavn (bokmål eller nynorsk) eller fagkode. */
  tekst: string;
  /** Utdanningsprogram, f.eks. HS. */
  program: string;
  trinn: '' | Trinn;
  type: '' | Fagtype;
  /** «standpunkt» eller en trekkordning (trekkordning_2 …) for elever. */
  vurdering: string;
  /** Eksamensform for elever, f.eks. eksamensform_2 (skriftlig). */
  eksamensform: string;
  /** Årstimetall som tekst, f.eks. «140». */
  timer: string;
  /** Fagklasser som vises i tillegg til de vanlige fagene, kommaseparert, f.eks. «variant,bedrift» (avgjørelse 031). */
  vis: string;
}

export const tomtFilter: Fagfilter = { tekst: '', program: '', trinn: '', type: '', vurdering: '', eksamensform: '', timer: '', vis: '' };

/** Feltene i filteret i den rekkefølgen de står i adressen (#/fag?q=…&program=…). */
export const filterfelt = { tekst: 'q', program: 'program', trinn: 'trinn', type: 'type', vurdering: 'vurdering', eksamensform: 'eksamen', timer: 'timer', vis: 'vis' } as const satisfies Record<keyof Fagfilter, string>;

export function filterFraAdresse(sporring: URLSearchParams): Fagfilter {
  const f = { ...tomtFilter };
  for (const [felt, navn] of Object.entries(filterfelt) as [keyof Fagfilter, string][]) (f as Record<keyof Fagfilter, string>)[felt] = sporring.get(navn) ?? '';
  return f;
}

export function filterTilAdresse(f: Fagfilter): Record<string, string> {
  const ut: Record<string, string> = {};
  for (const [felt, navn] of Object.entries(filterfelt) as [keyof Fagfilter, string][]) if (f[felt]) ut[navn] = f[felt];
  return ut;
}

/** Små bokstaver uten tegnsetting: «Norsk, vg1» → «norsk vg1». */
export function normaliser(tekst: string): string {
  return tekst.toLowerCase().normalize('NFC').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

/** Utdanningsprogrammene faget brukes i, ut fra programområdene. */
export function programmerFor(indeks: Fagindeks, fag: Fag): string[] {
  return [...new Set(fag.po.map((p) => indeks.programomrader[p]?.program).filter((p): p is string => p !== undefined))].sort();
}

/** Merkene for vurderingsordningen for elever: «standpunkt» og trekkordningen. */
export function vurderingsmerker(fag: Fag): string[] {
  const v = fag.elev;
  if (!v) return [];
  return [...(v.standpunkt ? ['standpunkt'] : []), ...(v.trekk ? [v.trekk] : [])];
}

/** Poeng for hvor godt fritekstsøket passer faget. 0 betyr at det ikke passer. */
export function tekstpoeng(kode: string, fag: Fag, tekst: string): number {
  const sok = normaliser(tekst);
  if (sok === '') return 1;
  const k = kode.toLowerCase();
  if (sok === k) return 100;
  const ordene = sok.split(' ');
  if (ordene.length === 1 && k.startsWith(sok) && /\d/.test(sok)) return 80;
  const navn = [normaliser(fag.navn.nb), normaliser(fag.navn.nn)];
  const navneord = navn.flatMap((n) => n.split(' '));
  if (!ordene.every((o) => navneord.some((n) => n.startsWith(o)) || k.startsWith(o))) return 0;
  // Hele søket i starten av navnet, deretter hele ord, deretter begynnelsen av ord.
  if (navn.some((n) => n.startsWith(sok))) return 60;
  const heleOrd = ordene.filter((o) => navneord.includes(o)).length;
  return 20 + heleOrd * 5 - Math.min(navn[0]?.length ?? 0, 100) / 100;
}

export interface Fagtreff {
  kode: string;
  fag: Fag;
}

/** Klassene brukeren har slått på i filteret. */
export function visteKlasser(f: Fagfilter): Set<Fagklasse> {
  const vis = new Set(f.vis.split(',').filter(Boolean));
  return new Set(['vanlig', ...SKJULTE.filter((k) => vis.has(k))]);
}

export interface Fagsok {
  treff: Fagtreff[];
  /** Fag som passer filteret, men som er skjult fordi klassen ikke er slått på. */
  skjult: Record<Exclude<Fagklasse, 'vanlig'>, number>;
}

/**
 * Fagene som passer filteret, med de vanlige fagene og klassene brukeren har slått på. Et søk på en hel fagkode
 * viser alltid faget (avgjørelse 031). Uten klasser vises alle fagene.
 */
export function sokFag(indeks: Fagindeks, f: Fagfilter, klasser?: ReadonlyMap<string, Fagklasse>): Fagsok {
  const skjult = { variant: 0, bedrift: 0, andre: 0 };
  const alle = filtrerFag(indeks, f);
  if (!klasser) return { treff: alle, skjult };
  const vis = visteKlasser(f);
  const sok = normaliser(f.tekst);
  const treff = alle.filter(({ kode }) => {
    const k = klasser.get(kode) ?? 'andre';
    if (vis.has(k) || sok === kode.toLowerCase()) return true;
    if (k !== 'vanlig') skjult[k]++;
    return false;
  });
  return { treff, skjult };
}

/** Fagene som passer filteret, sortert etter hvor godt de passer søket og så etter fagkode. */
export function filtrerFag(indeks: Fagindeks, f: Fagfilter): Fagtreff[] {
  const treff: (Fagtreff & { poeng: number })[] = [];
  for (const [kode, fag] of Object.entries(indeks.fag)) {
    if (f.trinn && !fag.trinn.includes(f.trinn)) continue;
    if (f.type && fag.type !== f.type) continue;
    if (f.timer && String(fag.timer ?? '') !== f.timer) continue;
    if (f.eksamensform && fag.elev?.eksamensform !== f.eksamensform) continue;
    if (f.vurdering && !vurderingsmerker(fag).includes(f.vurdering)) continue;
    if (f.program && !programmerFor(indeks, fag).includes(f.program)) continue;
    const poeng = tekstpoeng(kode, fag, f.tekst);
    if (poeng > 0) treff.push({ kode, fag, poeng });
  }
  return treff.sort((a, b) => b.poeng - a.poeng || a.kode.localeCompare(b.kode)).map(({ kode, fag }) => ({ kode, fag }));
}

export interface Filtervalg {
  program: string[];
  trinn: Trinn[];
  type: Fagtype[];
  vurdering: string[];
  eksamensform: string[];
  timer: number[];
}

/** Verdiene som finnes i fagindeksen, til nedtrekkslistene i filteret. */
export function filtervalg(indeks: Fagindeks): Filtervalg {
  const fag = Object.values(indeks.fag);
  const unik = <T>(l: T[]) => [...new Set(l)];
  const typer: Fagtype[] = ['fellesfag', 'felles_programfag', 'valgfritt_programfag', 'yrkesfaglig_fordypning', 'individuell_opplaeringsplan', 'annet'];
  const trinn: Trinn[] = ['Vg1', 'Vg2', 'Vg3', 'Bedrift'];
  return {
    program: Object.keys(indeks.utdanningsprogram).sort(),
    trinn: trinn.filter((t) => fag.some((f) => f.trinn.includes(t))),
    type: typer.filter((t) => fag.some((f) => f.type === t)),
    vurdering: unik(fag.flatMap(vurderingsmerker)).sort((a, b) => (a === 'standpunkt' ? -1 : b === 'standpunkt' ? 1 : a.localeCompare(b))),
    eksamensform: unik(fag.flatMap((f) => (f.elev?.eksamensform ? [f.elev.eksamensform] : []))).sort((a, b) => a.localeCompare(b, 'nb', { numeric: true })),
    timer: unik(fag.flatMap((f) => (f.timer !== null ? [f.timer] : []))).sort((a, b) => a - b),
  };
}

/** Adressen til læreplanen på udir.no. */
export function udirLenke(laereplan: string, kompetansemaalsett?: string): string {
  const lp = laereplan.toLowerCase();
  return kompetansemaalsett ? `https://www.udir.no/lk20/${lp}/kompetansemaal-og-vurdering/${kompetansemaalsett.toLowerCase()}` : `https://www.udir.no/lk20/${lp}`;
}

/** Språkkoden i Grep som språkattributt i HTML (nob → nb, nno → nn, sme → se). */
export function htmlSpraak(grep: string): string {
  return ({ nob: 'nb', nno: 'nn', sme: 'se', sma: 'sma', smj: 'smj', eng: 'en' } as Record<string, string>)[grep] ?? grep;
}
