// Kobling fra fagkode i Grep til årsramme i vedlegg 1 til SFS 2213 (fase 2, avgjørelse 023).
// Rene funksjoner. Tabellene står i rules/sfs2213/kobling-fagkode.yaml, fagdataene i data/grep/fagindeks.json.
//
// Rekkefølgen er:
// 1. Eksplisitt: fagkoden står i kobling_fellesfag eller kobling_programfag for utdanningsprogrammet og trinnet.
// 2. Regel: et programfag med årstimer, der prefikset, utdanningsprogrammet og trinnet passer en regel.
//    Regler brukes aldri for fellesfag. Har faget en eksplisitt kobling for et program og trinn, gjelder den.
// 3. Manuell: brukeren velger rad eller årsramme selv (kalkulatoren merker det).
import { Regelfeil, somTabell } from '../../../core/regler/motor.ts';
import type { Tabellrad } from '../../../core/regler/skjema.ts';
import type { Fag, Fagindeks } from '../../fag/skjema.ts';
import type { Arsrammerad } from './arsrammer.ts';
import type { Hent } from './typer.ts';

export type Koblingsmetode = 'eksplisitt' | 'regel' | 'manuell';

export interface Eksplisittkobling {
  nr: number;
  program: string;
  trinn: string;
  fagkoder: string[];
  /** Begrunnelse når koblingen avviker fra Grep, f.eks. et trinn faget ikke har i Grep (eiers valg). */
  merknad?: string;
}

export interface Koblingsregel {
  id: string;
  prefikser: string[];
  program: string;
  trinn: string;
  fagtype: string;
  nr: number;
  unntak: string[];
}

export interface Programnavn {
  vedlegg: string;
  navn: string;
  grep: string[];
}

export interface Koblingstabeller {
  programnavn: Programnavn[];
  eksplisitte: (Eksplisittkobling & { tabell: 'kobling_fellesfag' | 'kobling_programfag' })[];
  regler: (Koblingsregel & { tabell: 'kobling_regler' | 'kobling_yff' })[];
}

const tekster = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);

function ugyldig(nokkel: string, rad: Tabellrad): never {
  throw new Regelfeil(`Ugyldig rad i ${nokkel}: ${JSON.stringify(rad)}`);
}

/** Leser koblingstabellene fra regelsettet og sjekker formen på radene. */
export function lesKoblinger(hent: Hent): Koblingstabeller {
  const tabell = (nokkel: string) => somTabell(hent(`sfs2213.${nokkel}`), `sfs2213.${nokkel}`);
  const eksplisitte = (['kobling_fellesfag', 'kobling_programfag'] as const).flatMap((t) =>
    tabell(t).map((r) => {
      if (typeof r.nr !== 'number' || typeof r.program !== 'string' || typeof r.trinn !== 'string' || !Array.isArray(r.fagkoder)) ugyldig(t, r);
      return { tabell: t, nr: r.nr, program: r.program, trinn: r.trinn, fagkoder: tekster(r.fagkoder), ...(typeof r.merknad === 'string' ? { merknad: r.merknad } : {}) };
    }),
  );
  const regler = (['kobling_regler', 'kobling_yff'] as const).flatMap((t) =>
    tabell(t).map((r) => {
      if (typeof r.id !== 'string' || typeof r.nr !== 'number' || typeof r.program !== 'string' || typeof r.trinn !== 'string' || typeof r.fagtype !== 'string') ugyldig(t, r);
      if (r.fagtype === 'fellesfag') throw new Regelfeil(`Regelen ${r.id} gjelder fellesfag. Fellesfag kobles bare eksplisitt.`);
      return { tabell: t, id: r.id, prefikser: tekster(r.prefikser), program: r.program, trinn: r.trinn, fagtype: r.fagtype, nr: r.nr, unntak: tekster(r.unntak) };
    }),
  );
  const programnavn = tabell('programnavn').map((r) => {
    if (typeof r.vedlegg !== 'string' || typeof r.navn !== 'string') ugyldig('programnavn', r);
    return { vedlegg: r.vedlegg, navn: r.navn, grep: tekster(r.grep) };
  });
  return { programnavn, eksplisitte, regler };
}

/** Et utdanningsprogram og et trinn der faget undervises på skole, ut fra programområdene i Grep. */
export interface Programtrinn {
  program: string;
  trinn: string;
}

export function grepPar(fag: Fag, programomrader: Fagindeks['programomrader']): Programtrinn[] {
  const par = new Map<string, Programtrinn>();
  for (const p of fag.po) {
    const po = programomrader[p];
    if (!po || po.sted === 'bedrift' || po.trinn === 'Bedrift') continue;
    par.set(`${po.program}|${po.trinn}`, { program: po.program, trinn: po.trinn });
  }
  return [...par.values()].sort((a, b) => a.program.localeCompare(b.program) || a.trinn.localeCompare(b.trinn));
}

export interface Koblingskandidat extends Programtrinn {
  rad: Arsrammerad;
  metode: 'eksplisitt' | 'regel';
  /** Regelen (id) eller tabellen koblingen kommer fra. */
  fra: string;
}

/** Alle rader i vedlegg 1 fagkoden kan kobles til, med utdanningsprogram, trinn og metode. */
export function koblingskandidater(kode: string, fag: Fag | undefined, par: readonly Programtrinn[], tabeller: Koblingstabeller, rader: readonly Arsrammerad[]): Koblingskandidat[] {
  const radFor = new Map(rader.map((r) => [r.nr, r]));
  const ut: Koblingskandidat[] = [];
  const eksplisitt = new Set<string>();
  for (const e of tabeller.eksplisitte) {
    const rad = radFor.get(e.nr);
    if (!rad || !e.fagkoder.includes(kode)) continue;
    eksplisitt.add(`${e.program}|${e.trinn}`);
    ut.push({ program: e.program, trinn: e.trinn, rad, metode: 'eksplisitt', fra: e.tabell });
  }
  // Regler: bare programfag med årstimer, aldri fellesfag.
  if (fag && fag.type !== 'fellesfag' && fag.timer !== null) {
    for (const r of tabeller.regler) {
      const rad = radFor.get(r.nr);
      if (!rad || r.fagtype !== fag.type || r.unntak.includes(kode) || !r.prefikser.includes(kode.slice(0, 3))) continue;
      if (!par.some((p) => p.program === r.program && p.trinn === r.trinn) || eksplisitt.has(`${r.program}|${r.trinn}`)) continue;
      ut.push({ program: r.program, trinn: r.trinn, rad, metode: 'regel', fra: r.id });
    }
  }
  return ut.sort((a, b) => a.program.localeCompare(b.program) || a.trinn.localeCompare(b.trinn) || a.rad.nr - b.rad.nr);
}

export type Ukobletgrunn = 'ukjent_fagkode' | 'fagtype' | 'bedrift' | 'uten_arstimer' | 'fellesfag_ikke_koblet' | 'ikke_i_vedlegg';

export type Koblingsresultat =
  | { status: 'koblet'; kandidat: Koblingskandidat; kandidater: Koblingskandidat[] }
  | { status: 'flertydig'; kandidater: Koblingskandidat[] }
  | { status: 'ukoblet'; grunn: Ukobletgrunn; kandidater: [] };

/** Samme årsramme og samme stjernemerking: da spiller det ingen rolle hvilken av radene som brukes. */
function likArsramme(a: Arsrammerad, b: Arsrammerad): boolean {
  return a.t60 === b.t60 && a.t45 === b.t45 && a.stjerne === b.stjerne;
}

/** Hvorfor en fagkode ikke er koblet. Brukes i rapporten over ukoblede fag. */
export function ukobletGrunn(fag: Fag | undefined, par: readonly Programtrinn[]): Ukobletgrunn {
  if (!fag) return 'ukjent_fagkode';
  if (fag.type === 'individuell_opplaeringsplan' || fag.type === 'annet') return 'fagtype';
  if (par.length === 0) return 'bedrift';
  if (fag.type === 'fellesfag') return 'fellesfag_ikke_koblet';
  if (fag.timer === null) return 'uten_arstimer';
  return 'ikke_i_vedlegg';
}

/**
 * Årsrammen for en fagkode. Med program og/eller trinn velges bare rader for dem. Gir radene ulik årsramme,
 * er svaret «flertydig», og kalkulatoren spør om utdanningsprogram og trinn.
 */
export function finnKobling(
  kode: string,
  indeks: Pick<Fagindeks, 'fag' | 'programomrader'>,
  tabeller: Koblingstabeller,
  rader: readonly Arsrammerad[],
  valg: { program?: string | null; trinn?: string | null } = {},
): Koblingsresultat {
  const fag = indeks.fag[kode];
  const par = fag ? grepPar(fag, indeks.programomrader) : [];
  const alle = koblingskandidater(kode, fag, par, tabeller, rader);
  if (alle.length === 0) return { status: 'ukoblet', grunn: ukobletGrunn(fag, par), kandidater: [] };
  const kandidater = alle.filter((k) => (!valg.program || k.program === valg.program) && (!valg.trinn || k.trinn === valg.trinn));
  const forste = kandidater[0];
  if (!forste) return { status: 'flertydig', kandidater: alle };
  if (kandidater.every((k) => likArsramme(k.rad, forste.rad))) return { status: 'koblet', kandidat: forste, kandidater };
  return { status: 'flertydig', kandidater };
}
