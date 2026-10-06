// Sammenligningen i Elevundersøkelsen (avgjørelse 077): seriene brukeren sammenligner (en skole, et fylke eller hele
// landet, for alle, offentlige eller private skoler), verdiene for et trinn og et skoleår, og endringen fra året før.
// Rene funksjoner, testet i tests/unit/elevundersokelsen.test.ts.
import type { Eierform, Elevundersokelsen, Verdi } from './skjema.ts';

export interface Serie {
  /** «L», «F46» eller «S974557584». */
  enhet: string;
  eierform: Eierform;
}

/** Seriene kan sammenlignes tre om gangen, med hver sin farge og form (avgjørelse 077). */
export const MAKS_SERIER = 3;

/** «S974557584», «F46|p» eller «L|a» → serien. Skoler har bare «alle eierformer». */
export function serieFra(tekst: string | null | undefined): Serie | null {
  const m = /^(L|F\d{2}|S[0-9A-Z]+)(?:\|([aop]))?$/.exec(tekst ?? '');
  if (!m?.[1]) return null;
  const enhet = m[1];
  const eierform = (enhet.startsWith('S') ? 'a' : (m[2] ?? 'a')) as Eierform;
  return { enhet, eierform };
}

/** Serien i adressen: «S974557584», «F46», «F46|p», «L|o». Alle eierformer står uten tillegg. */
export const serieTekst = (s: Serie): string => (s.eierform === 'a' ? s.enhet : `${s.enhet}|${s.eierform}`);

export const nokkel = (s: Serie): string => `${s.enhet}|${s.eierform}`;

/** Om dataene har tall for serien. */
export const finnes = (d: Elevundersokelsen, s: Serie): boolean => d.verdier[nokkel(s)] !== undefined;

/**
 * Seriene fra start (eier 06.10.2026): skolen og fylket brukeren har valgt, og hele landet. Med «Privatskole» valgt
 * sammenlignes skolen med privatskolene i landet. Uten valgt skole og fylke: hele landet for alle, offentlige og private
 * skoler.
 */
export function standardSerier(d: Elevundersokelsen, valg: { fylke: string | null; skole: string | null; privatskole: boolean }): Serie[] {
  const ut: Serie[] = [];
  const skole: Serie | null = valg.skole ? { enhet: `S${valg.skole}`, eierform: 'a' } : null;
  if (skole && finnes(d, skole)) ut.push(skole);
  if (valg.fylke && finnes(d, { enhet: `F${valg.fylke}`, eierform: 'a' })) ut.push({ enhet: `F${valg.fylke}`, eierform: 'a' });
  ut.push({ enhet: 'L', eierform: valg.privatskole ? 'p' : 'a' });
  if (ut.length === 1) ut.push({ enhet: 'L', eierform: valg.privatskole ? 'a' : 'o' }, { enhet: 'L', eierform: valg.privatskole ? 'o' : 'p' });
  return ut.slice(0, MAKS_SERIER);
}

/** Verdien for serien, spørsmålet, skoleåret (indeks i `skolear`) og trinnet (0–2). */
export function verdi(d: Elevundersokelsen, s: Serie, kode: string, aar: number, trinn: number): Verdi {
  return d.verdier[nokkel(s)]?.[kode]?.[aar]?.[trinn] ?? null;
}

/** Antallet som har svart (bare indeksene). */
export function antall(d: Elevundersokelsen, s: Serie, kode: string, aar: number, trinn: number): Verdi {
  return d.antall[nokkel(s)]?.[kode]?.[aar]?.[trinn] ?? null;
}

/** Endringen fra året før, når begge er tall. Avrundet til én desimal, som tallene fra Udir. */
export function endring(naa: Verdi, foer: Verdi): number | null {
  if (typeof naa !== 'number' || typeof foer !== 'number') return null;
  return Math.round((naa - foer) * 10) / 10;
}

/** Det første trinnet der serien har tall siste skoleår, ellers Vg1. */
export function standardTrinn(d: Elevundersokelsen, s: Serie | undefined): number {
  if (!s) return 0;
  const siste = d.skolear.length - 1;
  for (let trinn = 0; trinn < 3; trinn++) {
    if (d.sporsmal.some((q) => typeof verdi(d, s, q.kode, siste, trinn) === 'number')) return trinn;
  }
  return 0;
}

/** Det største tallet for mobbing blant seriene og årene, rundet opp til nærmeste 5, minst 10, til aksen. */
export function mobbeskala(d: Elevundersokelsen, serier: readonly Serie[], koder: readonly string[], trinn: number): number {
  let maks = 0;
  for (const s of serier) for (const k of koder) for (let a = 0; a < d.skolear.length; a++) {
    const v = verdi(d, s, k, a, trinn);
    if (typeof v === 'number') maks = Math.max(maks, v);
  }
  return Math.max(10, Math.ceil(maks / 5) * 5);
}

/** Skolene i et fylke med tall, sortert etter navn. */
export function skolerIFylket(d: Elevundersokelsen, fylke: string): { enhet: string; navn: string }[] {
  return Object.entries(d.enheter)
    .filter(([k, e]) => k.startsWith('S') && e.fylke === fylke)
    .map(([enhet, e]) => ({ enhet, navn: e.navn }))
    .sort((a, b) => a.navn.localeCompare(b.navn, 'nb'));
}

/**
 * Om endringen er bedre eller svakere (eier 06.10.2026). For mobbing er lavere bedre, for indeksene høyere. En endring
 * som rundes til 0, er ingen av delene.
 */
export function retning(type: 'mobbing' | 'indeks', forskjell: number | null): 'bedre' | 'svakere' | null {
  if (forskjell === null || forskjell === 0) return null;
  return (type === 'mobbing' ? forskjell < 0 : forskjell > 0) ? 'bedre' : 'svakere';
}

/** Skolen brukeren har valgt, ellers fylket, når dataene har tall for den (kvikke fakta, eier 06.10.2026). */
export function egenSerie(d: Elevundersokelsen, valg: { fylke: string | null; skole: string | null }): Serie | null {
  const skole: Serie | null = valg.skole ? { enhet: `S${valg.skole}`, eierform: 'a' } : null;
  if (skole && finnes(d, skole)) return skole;
  const fylke: Serie | null = valg.fylke ? { enhet: `F${valg.fylke}`, eierform: 'a' } : null;
  return fylke && finnes(d, fylke) ? fylke : null;
}

export interface Fakta {
  kode: string;
  verdi: number;
  /** Verdien for det serien sammenlignes med. */
  mot: number;
  /** Verdien minus det den sammenlignes med, avrundet til én desimal. */
  forskjell: number;
}

/**
 * De tre indeksene der serien ligger mest over og mest under den den sammenlignes med (normalt landet), siste skoleår
 * og for trinnet. Med færre enn seks indekser med tall deles de i to. Skjermede tall og tall som mangler, er ikke med.
 */
export function sterkestOgSvakest(d: Elevundersokelsen, serie: Serie, mot: Serie, koder: readonly string[], trinn: number): { sterkest: Fakta[]; svakest: Fakta[] } {
  const siste = d.skolear.length - 1;
  const alle: Fakta[] = [];
  for (const kode of koder) {
    const v = verdi(d, serie, kode, siste, trinn);
    const m = verdi(d, mot, kode, siste, trinn);
    if (typeof v === 'number' && typeof m === 'number') alle.push({ kode, verdi: v, mot: m, forskjell: Math.round((v - m) * 10) / 10 });
  }
  alle.sort((a, b) => b.forskjell - a.forskjell || b.verdi - a.verdi || a.kode.localeCompare(b.kode));
  const antallHver = Math.min(3, Math.floor(alle.length / 2));
  return { sterkest: alle.slice(0, antallHver), svakest: antallHver === 0 ? [] : alle.slice(-antallHver).reverse() };
}

/**
 * Det beste tallet i en rad i tabellen (eier 06.10.2026): høyest for indeksene og lavest for mobbing. Bare når minst to
 * serier har tall, ellers null. Like tall er like gode, så alle med det beste tallet merkes. Er alle tallene like, er
 * ingen best, og ingen merkes.
 */
export function beste(verdier: readonly Verdi[], type: 'mobbing' | 'indeks'): number | null {
  const tall = verdier.filter((v): v is number => typeof v === 'number');
  if (tall.length < 2 || tall.every((v) => v === tall[0])) return null;
  return type === 'mobbing' ? Math.min(...tall) : Math.max(...tall);
}
