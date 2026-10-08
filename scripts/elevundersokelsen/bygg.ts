// Bygger resultatene fra Elevundersøkelsen (avgjørelse 077) av radene fra Udirs statistikkbank. Rene funksjoner,
// testet i tests/unit/elevundersokelsen.test.ts.
import type { Elevundersokelsen, Eierform, Verdi } from '../../src/modules/elevundersokelsen/skjema.ts';

/** En rad fra API-et, med feltene som brukes. Tallene kommer som tekst med desimalkomma og mellomrom som tusenskille. */
export interface Rad {
  Spoersmaalkode: string;
  Indikator?: string | null;
  Spoersmaalnavn?: string | null;
  Skoleaarnavn: string;
  EnhetNivaa: number;
  Fylkekode?: string | null;
  Organisasjonsnummer: string;
  EnhetNavn: string;
  Fylke?: string | null;
  TrinnKode: string;
  EierformNavn: string;
  Score?: string | null;
  AndelMobbet?: string | null;
  AntallBesvart?: string | null;
}

/** «4,2» → 4.2, «62 093» → 62093, «*» → «*», tomt → null. */
export function tall(tekst: string | null | undefined): Verdi {
  if (tekst === null || tekst === undefined || tekst.trim() === '') return null;
  if (tekst.trim() === '*') return '*';
  // \s tar også med hardt mellomrom (U+00A0 og U+202F), som Udir bruker som tusenskille.
  const n = Number(tekst.replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

const EIERFORM: Record<string, Eierform> = { 'Alle eierformer': 'a', 'Offentlig skole': 'o', 'Privat eiet': 'p' };

/** Nøkkelen til enheten, eller null for enheter appen ikke viser (fylker som ikke finnes lenger, utlandet). */
export function enhetsnokkel(r: Rad, fylker: ReadonlySet<string>): string | null {
  if (r.EnhetNivaa === 1) return r.Organisasjonsnummer === 'I' ? 'L' : null;
  if (r.EnhetNivaa === 2) return fylker.has(r.Organisasjonsnummer) ? `F${r.Organisasjonsnummer}` : null;
  if (r.EnhetNivaa === 3) return r.Fylkekode && fylker.has(r.Fylkekode) && /^[0-9A-Z]+$/.test(r.Organisasjonsnummer) ? `S${r.Organisasjonsnummer}` : null;
  return null;
}

export interface Sporsmal {
  kode: string;
  navn: string;
  type: 'mobbing' | 'indeks';
}

/**
 * Resultatene fra radene. Skolene tas med for alle eierformer, landet og fylkene også for offentlige og private
 * skoler. `sporsmal` gir rekkefølgen og typen. Rader for skoleår, trinn eller spørsmål som ikke er med, hoppes over.
 */
export function byggResultater(rader: readonly Rad[], opt: { skolear: readonly string[]; sporsmal: readonly Sporsmal[]; fylker: ReadonlySet<string>; kilde: string; hentet: string }): Elevundersokelsen {
  const typer = new Map(opt.sporsmal.map((s) => [s.kode, s.type]));
  const enheter: Elevundersokelsen['enheter'] = {};
  const verdier: Elevundersokelsen['verdier'] = {};
  const antall: Elevundersokelsen['antall'] = {};
  const tom = () => opt.skolear.map(() => [null, null, null] as Verdi[]);
  for (const r of rader) {
    const type = typer.get(r.Spoersmaalkode);
    const aar = opt.skolear.indexOf(r.Skoleaarnavn);
    const trinn = Number(r.TrinnKode) - 1;
    const eierform = EIERFORM[r.EierformNavn];
    const enhet = enhetsnokkel(r, opt.fylker);
    if (!type || aar < 0 || trinn < 0 || trinn > 2 || !eierform || !enhet) continue;
    // En skole er offentlig eller privat. Tallene for skolen står under «alle eierformer».
    if (enhet.startsWith('S') && eierform !== 'a') continue;
    if (!enheter[enhet]) {
      const navn = enhet === 'L' ? 'Hele landet' : enhet.startsWith('F') ? (r.Fylke ?? r.EnhetNavn) : r.EnhetNavn;
      enheter[enhet] = { navn: navn.trim().replace(/\s+/g, ' '), ...(enhet.startsWith('S') && r.Fylkekode ? { fylke: r.Fylkekode } : {}) };
    }
    const nokkel = `${enhet}|${eierform}`;
    const v = (verdier[nokkel] ??= {});
    (v[r.Spoersmaalkode] ??= tom())[aar]![trinn] = tall(type === 'mobbing' ? r.AndelMobbet : r.Score);
    if (type === 'indeks') ((antall[nokkel] ??= {})[r.Spoersmaalkode] ??= tom())[aar]![trinn] = tall(r.AntallBesvart);
  }
  const sortert = <T>(o: Record<string, T>) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
  return { kilde: opt.kilde, hentet: opt.hentet, skolear: [...opt.skolear], sporsmal: opt.sporsmal.map((s) => ({ ...s })), enheter: sortert(enheter), verdier: sortert(verdier), antall: sortert(antall) };
}

/** Sjekker at resultatene ser ut som ventet før de erstatter forrige henting. */
export function validerResultater(d: Elevundersokelsen): string[] {
  const feil: string[] = [];
  const skoler = Object.keys(d.enheter).filter((k) => k.startsWith('S')).length;
  const fylker = Object.keys(d.enheter).filter((k) => k.startsWith('F')).length;
  if (!d.enheter.L) feil.push('Mangler tallene for hele landet.');
  if (fylker < 10) feil.push(`Bare ${fylker} fylker.`);
  if (skoler < 200) feil.push(`Bare ${skoler} skoler.`);
  for (const s of d.sporsmal) {
    // Noen indekser finnes bare for ett trinn (Utdanning og yrkesveiledning gjelder Vg1).
    const land = d.verdier['L|a']?.[s.kode]?.at(-1);
    if (!land || !land.some((v) => typeof v === 'number')) feil.push(`Mangler tall for hele landet for ${s.navn} siste skoleår.`);
    else if (s.type === 'indeks' && land.some((v) => typeof v === 'number' && (v < 1 || v > 5))) feil.push(`${s.navn} er utenfor skalaen 1–5.`);
    else if (s.type === 'mobbing' && land.some((v) => typeof v === 'number' && (v < 0 || v > 100))) feil.push(`${s.navn} er ikke en andel i prosent.`);
  }
  return feil;
}

/** Endringene mellom to hentinger til kontrollsaken: nye skoleår, spørsmål og antall skoler. */
export function sammenlignResultater(forrige: Elevundersokelsen | null, ny: Elevundersokelsen): string[] {
  if (!forrige) return [];
  const ut: string[] = [];
  for (const a of ny.skolear) if (!forrige.skolear.includes(a)) ut.push(`Nytt skoleår: ${a}`);
  for (const s of ny.sporsmal) if (!forrige.sporsmal.some((f) => f.kode === s.kode)) ut.push(`Nytt spørsmål eller ny indeks: ${s.navn}`);
  for (const s of forrige.sporsmal) if (!ny.sporsmal.some((f) => f.kode === s.kode)) ut.push(`Spørsmål eller indeks er borte: ${s.navn}`);
  const skoler = (d: Elevundersokelsen) => Object.keys(d.enheter).filter((k) => k.startsWith('S')).length;
  if (skoler(forrige) !== skoler(ny)) ut.push(`Skoler med tall: ${skoler(forrige)} → ${skoler(ny)}`);
  return ut;
}
