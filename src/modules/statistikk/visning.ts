// Visningen av nøkkeltallene fra Udirs statistikkbank (avgjørelse 080): siste verdi, endringen fra året før og
// fylkene rangert. Rene funksjoner, testet i tests/unit/statistikk-visning.test.ts.
import type { Statistikk, Verdi } from '../../core/statistikk/skjema.ts';

/** Nøkkelen til et fylke i dataene: «46» → «F46». Uten fylke: landet («L»). */
export const fylkesnokkel = (fylke: string | null | undefined): string => (fylke ? `F${fylke}` : 'L');

/** Den siste verdien i en rekke, eller null. */
export const sisteVerdi = (rekke: readonly Verdi[] | undefined): Verdi => rekke?.at(-1) ?? null;

/** Den nest siste verdien i en rekke (året før), eller null. */
export const forrigeVerdi = (rekke: readonly Verdi[] | undefined): Verdi => (rekke && rekke.length > 1 ? (rekke.at(-2) ?? null) : null);

/** Endringen i prosent fra året før, med én desimal, når begge er tall og det forrige ikke er 0. */
export function endringProsent(naa: Verdi, foer: Verdi): number | null {
  if (typeof naa !== 'number' || typeof foer !== 'number' || foer === 0) return null;
  return Math.round(((naa - foer) / foer) * 1000) / 10;
}

/** Endringen i prosentpoeng (for andeler), med én desimal. */
export function endringPoeng(naa: Verdi, foer: Verdi): number | null {
  if (typeof naa !== 'number' || typeof foer !== 'number') return null;
  return Math.round((naa - foer) * 10) / 10;
}

export interface Rangert {
  enhet: string;
  navn: string;
  verdi: number;
  plass: number;
}

/**
 * Fylkene rangert på en verdi, høyest først (eller lavest først når `lavestBest`). Fylker uten tall er ikke med. Like
 * verdier får samme plass.
 */
export function ranger(d: Statistikk, verdier: Readonly<Record<string, Verdi>>, lavestBest = false): Rangert[] {
  const liste = Object.entries(verdier)
    .filter(([k, v]) => k.startsWith('F') && typeof v === 'number')
    .map(([enhet, v]) => ({ enhet, navn: d.enheter[enhet]?.navn ?? enhet, verdi: v as number }))
    .sort((a, b) => (lavestBest ? a.verdi - b.verdi : b.verdi - a.verdi) || a.navn.localeCompare(b.navn, 'nb'));
  return liste.map((r) => ({ ...r, plass: liste.findIndex((x) => x.verdi === r.verdi) + 1 }));
}

/** Siste verdi per enhet for en rekke per enhet. */
export const sisteFor = (rekker: Readonly<Record<string, readonly Verdi[]>>): Record<string, Verdi> => Object.fromEntries(Object.entries(rekker).map(([k, v]) => [k, sisteVerdi(v)]));

/** Fylkene i dataene, sortert etter navn. */
export function fylkeneIDataene(d: Statistikk): { nokkel: string; nummer: string; navn: string }[] {
  return Object.entries(d.enheter)
    .filter(([k]) => k.startsWith('F'))
    .map(([nokkel, e]) => ({ nokkel, nummer: nokkel.slice(1), navn: e.navn }))
    .sort((a, b) => a.navn.localeCompare(b.navn, 'nb'));
}

/** Utdanningsprogrammene med søkere i år og i fjor for en enhet, flest søkere i år først innenfor hver gruppe. */
export function programmerFor(d: Statistikk, enhet: string): { id: string; navn: string; yrkesfag: boolean; naa: Verdi; foer: Verdi }[] {
  const v = d.sokere.utdanningsprogram.verdier[enhet] ?? {};
  return d.sokere.utdanningsprogram.programmer
    .map((p) => ({ ...p, naa: sisteVerdi(v[p.id]), foer: forrigeVerdi(v[p.id]) }))
    .sort((a, b) => Number(a.yrkesfag) - Number(b.yrkesfag) || Number(b.naa ?? 0) - Number(a.naa ?? 0));
}
