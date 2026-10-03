// Dataene til fagsøket i kalkulatorene (fase 1): programområdene og fagkodene med navn, og årstimetallet per
// fagkode. Lages fra fagindeksen fra Grep (data/grep/fagindeks.json) når appen bygges (virtual:fagsok), så fagene
// bare står ett sted. Før sto de i tre egne filer i data/grep (avgjørelse 049). Ren logikk.
import type { Fagindeks } from '../fag/skjema.ts';

/** Programområdene per utdanningsprogram og trinn: { BA: { '1': [['BAT', 'Bygg- og anleggsteknikk']] } }. */
export type Fagsokprogramomrader = Record<string, Record<string, [string, string][]>>;
/** Fagkodene per prefiks (de tre første bokstavene): { HEA: [['HEA2005', 'Helsefremmende arbeid'], …] }. */
export type Fagsokfagkoder = Record<string, [string, string][]>;

export interface Fagsokdata {
  programomrader: Fagsokprogramomrader;
  fagkoder: Fagsokfagkoder;
  /** Årstimetallet i Grep for fagkodene i fagsøket og i årstimetabellen, eller null når Grep ikke har det. */
  arstimer: Record<string, number | null>;
}

export interface Fagsokgrunnlag {
  /** Fagkodene i årstimetabellen (rules/sfs2213/arstimer-*.yaml). */
  arstimeKoder: readonly string[];
  /** Fellesfagprefiksene i søketabellen (rules/sfs2213/fagsok-*.yaml) som bare ett fag bruker. */
  fellesfagprefikser: readonly string[];
}

const sorterPar = (a: [string, string], b: [string, string]) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1], 'nb');

export function byggFagsokdata(indeks: Fagindeks, grunnlag: Fagsokgrunnlag): Fagsokdata {
  const programomrader: Fagsokprogramomrader = {};
  for (const [kode, p] of Object.entries(indeks.programomrader)) {
    const m = /^([A-Z]{2})([A-Z]{3})(\d)/.exec(kode);
    if (!m) continue;
    const [, program, prefiks, trinn] = m as unknown as [string, string, string, string];
    const liste = ((programomrader[program] ??= {})[trinn] ??= []);
    if (!liste.some(([k, n]) => k === prefiks && n === p.navn.nb)) liste.push([prefiks, p.navn.nb]);
  }
  for (const p of Object.values(programomrader)) for (const l of Object.values(p)) l.sort(sorterPar);

  // Fagkodene med prefiks som et programområde eller et fellesfag i søketabellen.
  const prefikser = new Set([...Object.values(programomrader).flatMap((p) => Object.values(p).flatMap((l) => l.map(([k]) => k))), ...grunnlag.fellesfagprefikser]);
  const fagkoder: Fagsokfagkoder = {};
  for (const [kode, f] of Object.entries(indeks.fag)) {
    if (!/^[A-Z]{3}[123]\d{3}$/.test(kode) || !prefikser.has(kode.slice(0, 3))) continue;
    (fagkoder[kode.slice(0, 3)] ??= []).push([kode, f.navn.nb]);
  }
  for (const l of Object.values(fagkoder)) l.sort((a, b) => a[0].localeCompare(b[0]));

  const koder = [...new Set([...grunnlag.arstimeKoder, ...Object.values(fagkoder).flatMap((l) => l.map(([k]) => k))])].sort();
  const arstimer = Object.fromEntries(koder.map((k) => [k, indeks.fag[k]?.timer ?? null]));
  const sortert = <T>(o: Record<string, T>) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
  return { programomrader: sortert(programomrader), fagkoder: sortert(fagkoder), arstimer };
}

/** Fagkodene i årstimetabellen og fellesfagprefiksene i søketabellen, fra regelsettene for SFS 2213. */
export function fagsokgrunnlag(regelsett: readonly { regelverk: string; verdier: Record<string, { verdi: unknown }> }[]): Fagsokgrunnlag {
  const sfs = regelsett.filter((r) => r.regelverk === 'sfs2213');
  const rader = sfs.flatMap((r) => (r.verdier.arstimer?.verdi ?? []) as { fagkoder?: string[] }[]);
  const arstimeKoder = [...new Set(rader.flatMap((rad) => rad.fagkoder ?? []))].sort();
  const antall = new Map<string, number>();
  for (const r of sfs) for (const rad of (r.verdier.fagnavn?.verdi ?? []) as { prefikser?: string[] }[]) for (const p of rad.prefikser ?? []) antall.set(p, (antall.get(p) ?? 0) + 1);
  return { arstimeKoder, fellesfagprefikser: [...antall].filter(([, n]) => n === 1).map(([p]) => p) };
}
