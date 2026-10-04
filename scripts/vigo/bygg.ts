// Bygger dataene i data/vigo/ fra radene i VIGO Kodeverksbase, kontrollerer dem og finner endringene siden forrige
// henting. Rene funksjoner, testes i tests/unit/vigo.test.ts (avgjørelse 026).
import type { Fagindeks } from '../../src/modules/fag/skjema.ts';
import type { Fagrelasjoner, Fagvurdering, Merknad, Merknader, Skolenummer, Vigoavvik } from '../../src/modules/fag/vigo/skjema.ts';

/** En rad fra API-et. Bare feltene som brukes, er beskrevet. */
export type Vigorad = Record<string, unknown>;

const tekst = (v: unknown): string | null => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null);
const objekt = (v: unknown): Vigorad | null => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Vigorad) : null);
const dato = (v: unknown): string | null => tekst(v)?.slice(0, 10) ?? null;
/** VIGOs egne koder for opplæringsfag har Z som fjerde eller femte tegn (f.eks. NOR1Z13). De finnes ikke i Grep. */
export const erOpplaeringsfagkode = (kode: string) => /^.{3}Z|^.{4}Z/.test(kode);
const jaNei = (v: unknown): boolean | null => (v === 'J' || v === true ? true : v === 'N' || v === false ? false : null);

/**
 * Erstatninger, nye læreplaner, fag som brukes sammen og fag som bygger på andre fag, fra fire koblinger i kodebasen,
 * og hva et programområde gir grunnlag for å søke videre på. Grunnlaget tas bare med for programområdene i
 * fagindeksen fra Grep (`programomrader`) og bare nasjonalt (fylke 99).
 */
export function byggFagrelasjoner(
  rader: { erstatter: readonly Vigorad[]; erstattesAv: readonly Vigorad[]; brukesSammen: readonly Vigorad[]; paabygning: readonly Vigorad[]; grunnlag: readonly Vigorad[] },
  hentet: string,
  programomrader: ReadonlySet<string>,
): { data: Fagrelasjoner; merknader: string[] } {
  const merknader: string[] = [];
  const erstatninger: Fagrelasjoner['erstatninger'] = {};
  // «element_erstatter_element»: code1 erstatter code2. Bare fag (course1 og course2), og ikke VIGOs egne koder.
  for (const r of rader.erstatter) {
    const ny = tekst(r.code1);
    const gammel = tekst(r.code2);
    const fag = objekt(r.course2);
    if (!ny || !gammel || !objekt(r.course1) || !fag || erOpplaeringsfagkode(ny) || erOpplaeringsfagkode(gammel)) continue;
    const forrige = erstatninger[gammel];
    if (forrige) {
      if (!forrige.ny.includes(ny)) forrige.ny = [...forrige.ny, ny].sort();
      continue;
    }
    const utgatt = dato(fag.validTo) ?? (fag.expired === 'Ja' ? 'ukjent' : null);
    erstatninger[gammel] = { ny: [ny], navn: tekst(fag.officialName) ?? tekst(fag.courseName) ?? gammel, utgatt };
  }
  const laereplaner: Fagrelasjoner['laereplaner'] = {};
  for (const r of rader.erstattesAv) {
    const gammel = tekst(r.code1);
    const ny = tekst(r.code2);
    if (gammel && ny && gammel !== ny) laereplaner[gammel] = ny;
  }
  const brukesSammen: Record<string, Set<string>> = {};
  const navn: Fagrelasjoner['navn'] = {};
  for (const r of rader.brukesSammen) {
    const a = tekst(r.code1);
    const b = tekst(r.code2);
    if (!a || !b || a === b || erOpplaeringsfagkode(a) || erOpplaeringsfagkode(b)) continue;
    (brukesSammen[a] ??= new Set()).add(b);
    const na = tekst(objekt(r.grepCourse1)?.name);
    const nb = tekst(objekt(r.grepCourse2)?.name);
    if (na) navn[a] = na;
    if (nb) navn[b] = nb;
  }
  // «fag_paabygning»: code1 bygger på code2.
  const byggerPaa: Record<string, Set<string>> = {};
  for (const r of rader.paabygning) {
    const a = tekst(r.code1);
    const b = tekst(r.code2);
    if (!a || !b || a === b || erOpplaeringsfagkode(a) || erOpplaeringsfagkode(b)) continue;
    (byggerPaa[a] ??= new Set()).add(b);
  }
  // «entry-requirements»: programAreaCode gir grunnlag for providesCompetenceCode.
  const grunnlag: Record<string, Set<string>> = {};
  for (const r of rader.grunnlag) {
    const fra = tekst(r.programAreaCode);
    const til = tekst(r.providesCompetenceCode);
    if (!fra || !til || fra === til || r.countyNr !== 99 || !programomrader.has(fra) || !programomrader.has(til)) continue;
    (grunnlag[fra] ??= new Set()).add(til);
  }
  const sortert = <V>(o: Record<string, V>) => Object.fromEntries(Object.entries(o).sort(([x], [y]) => x.localeCompare(y)));
  return {
    data: {
      kilde: 'vigo-kodeverk',
      hentet,
      erstatninger: sortert(erstatninger),
      laereplaner: sortert(laereplaner),
      brukesSammen: sortert(Object.fromEntries(Object.entries(brukesSammen).map(([k, v]) => [k, [...v].sort()]))),
      byggerPaa: sortert(Object.fromEntries(Object.entries(byggerPaa).map(([k, v]) => [k, [...v].sort()]))),
      navn: sortert(navn),
      grunnlag: sortert(Object.fromEntries(Object.entries(grunnlag).map(([k, v]) => [k, [...v].sort()]))),
      // Fylles av byggVurdering, som trenger fagindeksen fra Grep.
      vurdering: {},
      avvik: {},
    },
    merknader,
  };
}

/** Trekkordningen i Grep og teksten VIGO bruker for den samme ordningen (feltene examCourseType…). */
export const TREKK_I_VIGO: Readonly<Record<string, string>> = {
  trekkordning_1: 'Ingen eksamen',
  trekkordning_2: 'Trekkfag',
  trekkordning_3: 'Obligatorisk',
  trekkordning_saerskilt_eksamen: 'Bare særskilt eksamen',
};

const sentralLokal = (v: unknown): 'sentral' | 'lokal' | null => (v === 'Sentral' ? 'sentral' : v === 'Lokal' ? 'lokal' : null);

/**
 * Vurderingen i fagene i fagindeksen fra Grep (fase 6): sentralt eller lokalt gitt eksamen og sensur fra «courses»,
 * og fagmerknadene fra «fam-connected-to-course» (code1 er FAM-koden, code2 fagkoden). Samtidig kontrolleres
 * årstimetallet og trekkordningen fra Grep mot VIGO. Bare avvikene lagres, med VIGOs verdi, så samme opplysning ikke
 * står to steder. `linjer` beskriver avvikene til kontrollsaken.
 */
export function byggVurdering(
  rader: { fag: readonly Vigorad[]; fam: readonly Vigorad[] },
  indeks: Pick<Fagindeks, 'fag'>,
): { vurdering: Fagrelasjoner['vurdering']; avvik: Fagrelasjoner['avvik']; linjer: string[]; antall: number } {
  const vurdering: Record<string, Fagvurdering> = {};
  const avvik: Record<string, Vigoavvik> = {};
  const linjer: string[] = [];
  const famer: Record<string, Set<string>> = {};
  for (const r of rader.fam) {
    const fam = tekst(r.code1);
    const kode = tekst(r.code2);
    if (!fam || !kode || !/^FAM\d+$/.test(fam) || !indeks.fag[kode]) continue;
    (famer[kode] ??= new Set()).add(fam);
  }
  let antall = 0;
  for (const r of rader.fag) {
    const kode = tekst(r.courseCode);
    const fag = kode ? indeks.fag[kode] : undefined;
    if (!kode || !fag) continue;
    antall++;
    const v: Fagvurdering = {};
    const eksamen = sentralLokal(r.task);
    const sensur = sentralLokal(r.censorship);
    if (eksamen) v.eksamen = eksamen;
    if (sensur && sensur !== eksamen) v.sensur = sensur;
    const fam = famer[kode];
    if (fam) v.fam = [...fam].sort((a, b) => a.localeCompare(b, 'nb', { numeric: true }));
    if (Object.keys(v).length > 0) vurdering[kode] = v;

    // Kontrollen: årstimetallet og trekkordningen for elev og privatist.
    const a: Vigoavvik = {};
    const timer = typeof r.yearHours === 'number' && r.yearHours > 0 ? r.yearHours : null;
    if (fag.timer !== null && timer !== fag.timer) {
      a.timer = timer;
      linjer.push(`${kode} ${fag.navn.nb}: årstimetallet er ${fag.timer} i Grep og ${timer ?? 'tomt'} i VIGO.`);
    }
    for (const [hvem, felt, navn] of [
      ['elev', 'examCourseTypePupil', 'elever'],
      ['privatist', 'examCourseTypePrivateCandidate', 'privatister'],
    ] as const) {
      const trekk = fag[hvem]?.trekk;
      const iGrep = trekk ? TREKK_I_VIGO[trekk] : undefined;
      if (!iGrep) continue;
      const iVigo = tekst(r[felt]);
      if (iVigo !== iGrep) {
        a[hvem] = iVigo;
        linjer.push(`${kode} ${fag.navn.nb}: trekkordningen for ${navn} er «${iGrep}» i Grep og «${iVigo ?? 'tom'}» i VIGO.`);
      }
    }
    if (Object.keys(a).length > 0) avvik[kode] = a;
  }
  const iVigo = new Set(rader.fag.map((r) => tekst(r.courseCode)));
  for (const kode of Object.keys(indeks.fag)) if (!iVigo.has(kode)) linjer.push(`${kode}: finnes i Grep, men ikke i VIGO.`);
  const sortert = <V>(o: Record<string, V>) => Object.fromEntries(Object.entries(o).sort(([x], [y]) => x.localeCompare(y)));
  return { vurdering: sortert(vurdering), avvik: sortert(avvik), linjer: linjer.sort(), antall };
}

/** En fagmerknad (FAM) eller vitnemålsmerknad (VMM) fra kodebasen. */
export function lesMerknad(r: Vigorad): Merknad | null {
  const kode = tekst(r.code);
  const nb = tekst(r.norwegianName) ?? tekst(r.text);
  if (!kode || !nb) return null;
  return {
    kode,
    nb,
    nn: tekst(r.nynorskName) ?? nb,
    se: tekst(r.samiName),
    en: tekst(r.englishName),
    grunnskole: r.primarySchool === true,
    videregaende: r.highSchool === true,
    fagopplaering: r.vocationalSchool === true,
    kreverVedlegg: r.requireAttachment === 'J',
    vitnemal: jaNei(r.vitnemal),
    kompetansebevis: jaNei(r.kompBevis),
    utgatt: dato(r.validTo) ?? (r.expired === 'Ja' ? 'ukjent' : null),
  };
}

/**
 * En status på et søkerønske fra kodebasen («wish-statuses»). Typen er S (elevplass), L (læreplass) eller SL (begge).
 * Teksten finnes bare på bokmål.
 */
export function lesSokerstatus(r: Vigorad): Merknad | null {
  const kode = tekst(r.code);
  const nb = tekst(r.text);
  const nr = typeof r.number === 'number' ? r.number : null;
  if (!kode || !nb || nr === null) return null;
  const type = tekst(r.type) ?? '';
  return {
    kode,
    nb,
    nn: nb,
    se: null,
    en: null,
    grunnskole: false,
    videregaende: type.includes('S'),
    fagopplaering: type.includes('L'),
    kreverVedlegg: false,
    vitnemal: null,
    kompetansebevis: null,
    utgatt: dato(r.validTo),
    nr,
  };
}

const kodeorden = (a: Merknad, b: Merknad) => a.kode.localeCompare(b.kode, 'nb', { numeric: true });

export function byggMerknader(rader: { fag: readonly Vigorad[]; vitnemal: readonly Vigorad[]; sokerstatuser: readonly Vigorad[] }, hentet: string): Merknader {
  const les = (liste: readonly Vigorad[]) => liste.map(lesMerknad).filter((m): m is Merknad => m !== null).sort(kodeorden);
  const statuser = rader.sokerstatuser
    .map(lesSokerstatus)
    .filter((m): m is Merknad => m !== null)
    .sort((a, b) => (a.nr ?? 0) - (b.nr ?? 0));
  return { kilde: 'vigo-kodeverk', hentet, fagmerknader: les(rader.fag), vitnemalsmerknader: les(rader.vitnemal), sokerstatuser: statuser };
}

/** Feil som gjør at de nye dataene ikke tas inn (forrige fil blir stående). */
export function validerVigo(rel: Fagrelasjoner, m: Merknader): string[] {
  const feil: string[] = [];
  const antall = (o: object) => Object.keys(o).length;
  if (antall(rel.erstatninger) < 1000) feil.push(`Fant bare ${antall(rel.erstatninger)} erstattede fagkoder.`);
  if (antall(rel.brukesSammen) < 200) feil.push(`Fant bare ${antall(rel.brukesSammen)} koder i «brukes sammen».`);
  if (antall(rel.byggerPaa) < 30) feil.push(`Fant bare ${antall(rel.byggerPaa)} fag som bygger på andre fag.`);
  if (m.fagmerknader.length < 30 || m.fagmerknader.some((x) => !/^FAM\d+$/.test(x.kode))) feil.push(`Fagmerknadene ser ikke ut som ventet (${m.fagmerknader.length}).`);
  if (m.vitnemalsmerknader.length < 20 || m.vitnemalsmerknader.some((x) => !/^VMM\d+$/.test(x.kode))) feil.push(`Vitnemålsmerknadene ser ikke ut som ventet (${m.vitnemalsmerknader.length}).`);
  if (m.sokerstatuser.length < 40 || m.sokerstatuser.some((x) => !/^[A-ZÆØÅ][A-ZÆØÅ0-9]+$/.test(x.kode))) feil.push(`Statusene på søkerønsker ser ikke ut som ventet (${m.sokerstatuser.length}).`);
  const grunnlag = Object.values(rel.grunnlag).flat().length;
  if (grunnlag < 300) feil.push(`Fant bare ${grunnlag} koblinger i grunnlaget for inntak.`);
  const eksamen = Object.values(rel.vurdering).filter((v) => v.eksamen).length;
  if (eksamen < 1000) feil.push(`Fant bare ${eksamen} fag med sentralt eller lokalt gitt eksamen.`);
  if (!Object.values(rel.vurdering).some((v) => v.fam)) feil.push('Fant ingen fagmerknader knyttet til fagene.');
  // Mange avvik betyr oftere at VIGO har endret feltene enn at Grep har feil.
  if (Object.keys(rel.avvik).length > 200) feil.push(`${Object.keys(rel.avvik).length} fag har avvik mellom Grep og VIGO.`);
  return feil;
}

/** Endringene mellom to hentinger, én linje per endring, til kildesjekken og kontrollsaken. */
export function sammenlignVigo(gammel: { rel: Fagrelasjoner; m: Merknader } | null, ny: { rel: Fagrelasjoner; m: Merknader }): string[] {
  if (!gammel) return [];
  const ut: string[] = [];
  for (const [k, e] of Object.entries(ny.rel.erstatninger)) {
    const g = gammel.rel.erstatninger[k];
    if (!g) ut.push(`Ny erstatning: ${k} ${e.navn} → ${e.ny.join(', ')}`);
    else if (g.ny.join() !== e.ny.join()) ut.push(`Endret erstatning: ${k} → ${e.ny.join(', ')} (var ${g.ny.join(', ')})`);
  }
  for (const k of Object.keys(gammel.rel.erstatninger)) if (!ny.rel.erstatninger[k]) ut.push(`Erstatning fjernet: ${k}`);
  for (const [k, v] of Object.entries(ny.rel.laereplaner)) if (gammel.rel.laereplaner[k] !== v) ut.push(`Ny læreplan: ${k} → ${v}`);
  const par = (r: Fagrelasjoner) => new Set(Object.entries(r.brukesSammen).flatMap(([a, l]) => l.map((b) => `${a} + ${b}`)));
  const gp = par(gammel.rel);
  const np = par(ny.rel);
  const nyePar = [...np].filter((p) => !gp.has(p));
  const fjernedePar = [...gp].filter((p) => !np.has(p));
  if (nyePar.length > 0) ut.push(`Brukes sammen, nye koblinger (${nyePar.length}): ${nyePar.slice(0, 10).join(', ')}${nyePar.length > 10 ? ' …' : ''}`);
  if (fjernedePar.length > 0) ut.push(`Brukes sammen, fjernede koblinger (${fjernedePar.length}): ${fjernedePar.slice(0, 10).join(', ')}${fjernedePar.length > 10 ? ' …' : ''}`);
  const bp = (r: Fagrelasjoner) => new Set(Object.entries(r.byggerPaa ?? {}).flatMap(([a, l]) => l.map((b) => `${a} på ${b}`)));
  const gb = bp(gammel.rel);
  const nb = bp(ny.rel);
  const nyeBp = [...nb].filter((p) => !gb.has(p));
  const fjernedeBp = [...gb].filter((p) => !nb.has(p));
  if (nyeBp.length > 0) ut.push(`Bygger på, nye koblinger (${nyeBp.length}): ${nyeBp.slice(0, 10).join(', ')}${nyeBp.length > 10 ? ' …' : ''}`);
  if (fjernedeBp.length > 0) ut.push(`Bygger på, fjernede koblinger (${fjernedeBp.length}): ${fjernedeBp.slice(0, 10).join(', ')}${fjernedeBp.length > 10 ? ' …' : ''}`);
  const gl = (r: Fagrelasjoner) => new Set(Object.entries(r.grunnlag ?? {}).flatMap(([a, l]) => l.map((b) => `${a} → ${b}`)));
  const gg = gl(gammel.rel);
  const ng = gl(ny.rel);
  const nyeG = [...ng].filter((p) => !gg.has(p));
  const fjernedeG = [...gg].filter((p) => !ng.has(p));
  if (nyeG.length > 0) ut.push(`Grunnlag for inntak, nye koblinger (${nyeG.length}): ${nyeG.slice(0, 10).join(', ')}${nyeG.length > 10 ? ' …' : ''}`);
  if (fjernedeG.length > 0) ut.push(`Grunnlag for inntak, fjernede koblinger (${fjernedeG.length}): ${fjernedeG.slice(0, 10).join(', ')}${fjernedeG.length > 10 ? ' …' : ''}`);
  const gv = gammel.rel.vurdering ?? {};
  const vtekst = (v: Fagvurdering | undefined) => (v ? [v.eksamen ? `${v.eksamen} eksamen` : '', v.sensur ? `${v.sensur} sensur` : '', v.fam?.join(' ') ?? ''].filter(Boolean).join(', ') : 'ingen');
  const vurderingsendringer = [...new Set([...Object.keys(gv), ...Object.keys(ny.rel.vurdering)])]
    .filter((k) => vtekst(gv[k]) !== vtekst(ny.rel.vurdering[k]))
    .map((k) => `${k}: ${vtekst(ny.rel.vurdering[k])} (var ${vtekst(gv[k])})`);
  if (vurderingsendringer.length > 0) ut.push(`Vurdering i fag, endret (${vurderingsendringer.length}): ${vurderingsendringer.slice(0, 10).join('; ')}${vurderingsendringer.length > 10 ? ' …' : ''}`);
  for (const [liste, navn] of [
    ['fagmerknader', 'fagmerknad'],
    ['vitnemalsmerknader', 'vitnemålsmerknad'],
    ['sokerstatuser', 'status på søkerønske'],
  ] as const) {
    const g = new Map((gammel.m[liste] ?? []).map((x) => [x.kode, x]));
    for (const x of ny.m[liste]) {
      const f = g.get(x.kode);
      if (!f) ut.push(`Ny ${navn} ${x.kode}: ${x.nb}`);
      else if (f.nb !== x.nb || f.nn !== x.nn) ut.push(`Endret ${navn} ${x.kode}: ${x.nb}`);
      else if (!f.utgatt && x.utgatt) ut.push(`Utgått ${navn} ${x.kode}: ${x.nb}`);
    }
    const n = new Set(ny.m[liste].map((x) => x.kode));
    for (const k of g.keys()) if (!n.has(k)) ut.push(`Fjernet ${navn} ${k}`);
  }
  return ut;
}

/**
 * Skolenummer (fem sifre) → organisasjonsnummer for skolene i VIGO som har begge og ikke er avsluttet. Bare numrene
 * leses; radene har også navn og kontaktinformasjon til skoleledere, som ikke skal lagres (avgjørelse 053).
 */
export function byggSkolenummer(rader: readonly Vigorad[], hentet: string, idag = hentet.slice(0, 10)): Skolenummer {
  const orgnr: Record<string, string> = {};
  for (const r of rader) {
    const nr = typeof r.number === 'number' || typeof r.number === 'string' ? String(r.number).padStart(5, '0') : '';
    const org = typeof r.orgNr === 'string' ? r.orgNr.trim() : '';
    const slutt = typeof r.validTo === 'string' ? r.validTo.slice(0, 10) : null;
    if (!/^\d{5}$/.test(nr) || !/^\d{9}$/.test(org) || (slutt && slutt < idag)) continue;
    orgnr[nr] = org;
  }
  return { kilde: 'vigo-kodeverk', hentet, orgnr: Object.fromEntries(Object.entries(orgnr).sort(([a], [b]) => a.localeCompare(b))) };
}
