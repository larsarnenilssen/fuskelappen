// Leser datoene for svar, svarfrist og andre inntak fra fylkenes sider (fase 6, pakke 5). Rene funksjoner, testet i
// tests/unit/inntaksdatoer.test.ts. Sidene og mønstrene står i scripts/inntak/kilder.ts.
//
// - Datoene er fylkets egne og oftest omtrentlige («ca. 8. juli», «uke 28/29», «senest 10. juli»). De lagres per
//   fylke og inntaksår, med `grunnlag: praksis` i innholdet som viser dem. Regelen fra eksamensdatoene, der to fylker
//   må ha samme dato, brukes ikke (eier 05.10.2026).
// - Datoene leses med lesDatoer fra scripts/eksamen/les.ts. Uker («uke 28/29», «veke 28–29», «Uke 32») gir mandagen i
//   den første uken og fredagen i den siste.
// - Året: står det i datoen, brukes det. Ellers brukes året i mønsteret (gruppen `aar`), og ellers året kilden finner
//   på siden (`aar` i kilden: et årstall, eller en ukedag med dato, som «Mandag 2. februar»). Uten år lagres ingenting,
//   og det står i rapporten. Året gjettes aldri ut fra datoen hentingen ble gjort.
// - «ca.», «cirka», «omtrent» og «senest» rett foran datoen gir `omtrent`, og ordet lagres i `forbehold` («ca» eller
//   «senest»), så det kan vises ved datoen (eier 05.10.2026). En svarfrist som regnes fra svaret («5 dager etter at 1.
//   inntak er klart»), lagres i `relativ`, med eller uten dato.
// - «begynnelsen av juli» blir de to første ukene (1.–14.), «midten av juli» uken med den 15. (mandag–fredag) og
//   «slutten av juli» de to siste ukene, med `forbehold` «begynnelsen», «midten» eller «slutten» (eier 05.10.2026).
import type { inntaksfelt } from '../../src/modules/inntak/datoer-skjema.ts';
import { type Datotreff, lesDatoer } from '../eksamen/les.ts';

export type Inntaksfelt = (typeof inntaksfelt)[number];

export interface Inntaksregel {
  felt: Inntaksfelt;
  /**
   * Mønsteret som finner datoen. Gruppen `dato` (eller gruppe 1, når mønsteret ikke har navngitte grupper) er teksten med datoen eller uken. Gruppen `aar` er
   * inntaksåret, og gruppen `relativ` er en frist som regnes fra noe annet («5 dager etter at 1. inntak er klart»).
   */
  moenster: RegExp;
  /** Datoen er omtrentlig selv om teksten ikke sier «ca.». */
  omtrent?: boolean;
  /** Står ikke alltid på siden, så det er ikke en feil å ikke finne den. */
  valgfri?: boolean;
  /** Legges etter fristen i gruppen `relativ` («2 uker» blir «2 uker etter inntaket»). */
  relativTillegg?: string;
  /** Teksten tar med linjen etter datoen, når datoen står alene på linjen («Uke 28/29 i juli»). */
  nesteLinje?: boolean;
}

export interface Inntakskilde {
  id: string;
  navn: string;
  url: string;
  fylke: string;
  /** Selektoren for innholdet på siden. */
  selektor: string;
  /**
   * Mønstre som finner inntaksåret på siden, i rekkefølge: gruppen `aar` (et årstall), eller gruppene `ukedag` og
   * `dato` («Mandag 2. februar»), som gir året der datoen er den ukedagen.
   */
  aar: RegExp[];
  regler: Inntaksregel[];
}

/** Ordet som gjør datoen omtrentlig, eller delen av måneden. */
export type Forbehold = 'ca' | 'senest' | 'begynnelsen' | 'midten' | 'slutten';

export interface Inntaksdato {
  fra?: string;
  til?: string;
  uke?: string;
  omtrent?: boolean;
  forbehold?: Forbehold;
  relativ?: string;
  tekst: string;
  kilder: string[];
}

export interface Inntakskandidat {
  kilde: string;
  fylke: string;
  aar: string;
  felt: Inntaksfelt;
  verdi: Omit<Inntaksdato, 'kilder'>;
}

const UKEDAGER = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'];
const NN_UKEDAGER: Record<string, string> = { måndag: 'mandag', tysdag: 'tirsdag', laurdag: 'lørdag', sundag: 'søndag' };

const iso = (d: Date) => d.toISOString().slice(0, 10);

/** Mandagen i ISO-uken `uke` i `aar` (ÅÅÅÅ-MM-DD). Uke 1 er uken med 4. januar. */
export function mandagIUke(aar: number, uke: number): string {
  const fjerde = new Date(Date.UTC(aar, 0, 4));
  const ukedag = fjerde.getUTCDay() || 7;
  return iso(new Date(Date.UTC(aar, 0, 4 - (ukedag - 1) + (uke - 1) * 7)));
}

/** Fredagen i ISO-uken `uke` i `aar`. */
export function fredagIUke(aar: number, uke: number): string {
  const mandag = new Date(`${mandagIUke(aar, uke)}T00:00:00Z`);
  return iso(new Date(mandag.getTime() + 4 * 86_400_000));
}

const UKE = /\b(?:uke|veke)\s*(\d{1,2})(?:\s*(?:\/|–|-|og)\s*(\d{1,2}))?/i;

/** Ukene i en tekst: «uke 28/29», «veke 28–29» og «Uke 32». Null når teksten ikke har en uke. */
export function lesUker(tekst: string): { fra: number; til: number } | null {
  const m = UKE.exec(tekst);
  if (!m) return null;
  const fra = Number(m[1]);
  const til = m[2] ? Number(m[2]) : fra;
  if (fra < 1 || fra > 53 || til < fra || til > 53) return null;
  return { fra, til };
}

/**
 * Året der datoen er den ukedagen («Mandag 2. februar» gir 2026), blant årene rundt `rundt`. Null når ingen eller
 * flere år passer.
 */
export function aarFraUkedag(ukedag: string, dato: Datotreff, rundt: number): number | null {
  const navn = ukedag.toLowerCase();
  const dag = UKEDAGER.indexOf(NN_UKEDAGER[navn] ?? navn);
  if (dag < 0) return null;
  const treff = [rundt - 1, rundt, rundt + 1].filter((a) => new Date(Date.UTC(a, dato.maned - 1, dato.dag)).getUTCDay() === dag);
  return treff.length === 1 ? (treff[0] as number) : null;
}

/** Inntaksåret kilden finner på siden, eller null. `hentet` (ÅÅÅÅ-MM-DD) avgrenser årene en ukedag kan gi. */
export function finnAar(kilde: Pick<Inntakskilde, 'aar'>, tekst: string, hentet: string): number | null {
  for (const m of kilde.aar) {
    const t = m.exec(tekst);
    if (!t) continue;
    if (t.groups?.['aar']) return Number(t.groups['aar']);
    const ukedag = t.groups?.['ukedag'];
    const dato = t.groups?.['dato'] ? lesDatoer(t.groups['dato'])[0] : undefined;
    if (ukedag && dato) {
      const aar = aarFraUkedag(ukedag, dato, Number(hentet.slice(0, 4)));
      if (aar !== null) return aar;
    }
  }
  return null;
}

const OMTRENT = /\b(ca\.?|cirka|omtrent|senest|seinast)\s*$/i;

/** «senest» og «seinast» gir «senest», de andre ordene «ca». */
const forbeholdFor = (ord: string): Forbehold => (/^se/i.test(ord) ? 'senest' : 'ca');

const MANEDSNAVN = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'];
const MANEDSDEL = new RegExp(`\\b(begynnelsen|starten|midten|slutten|enden)\\s+av\\s+(${MANEDSNAVN.join('|')})`, 'i');

/** «begynnelsen av juli», «i midten av juli», «slutten av juli»: delen og måneden (1–12), eller null. */
export function lesManedsdel(tekst: string): { del: 'begynnelsen' | 'midten' | 'slutten'; maned: number } | null {
  const m = MANEDSDEL.exec(tekst);
  if (!m?.[1] || !m[2]) return null;
  const ord = m[1].toLowerCase();
  const del = ord === 'starten' ? 'begynnelsen' : ord === 'enden' ? 'slutten' : (ord as 'begynnelsen' | 'midten' | 'slutten');
  return { del, maned: MANEDSNAVN.indexOf(m[2].toLowerCase()) + 1 };
}

/**
 * Perioden for en del av måneden: de to første ukene (1.–14.), uken med den 15. (mandag–fredag) eller de to siste
 * ukene (de 14 siste dagene).
 */
export function periodeForManedsdel(aar: number, maned: number, del: 'begynnelsen' | 'midten' | 'slutten'): { fra: string; til: string } {
  const dag = (d: number) => `${aar}-${String(maned).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  if (del === 'begynnelsen') return { fra: dag(1), til: dag(14) };
  const sisteDag = new Date(Date.UTC(aar, maned, 0)).getUTCDate();
  if (del === 'slutten') return { fra: dag(sisteDag - 13), til: dag(sisteDag) };
  const ukedag = new Date(Date.UTC(aar, maned - 1, 15)).getUTCDay() || 7;
  const mandag = new Date(Date.UTC(aar, maned - 1, 15 - (ukedag - 1)));
  const fredag = new Date(mandag.getTime() + 4 * 86_400_000);
  return { fra: iso(mandag), til: iso(fredag) };
}

const kort = (t: string) => (t.length > 200 ? `${t.slice(0, 199)}…` : t);

/** Setningen i linjen som har posisjonen `pos` (i linjen). En setning slutter med punktum og ny setning med stor bokstav. */
function setningVed(linje: string, pos: number): string {
  let start = 0;
  for (const m of linje.matchAll(/\.\s+(?=[A-ZÆØÅ])/g)) {
    const neste = m.index + m[0].length;
    if (neste > pos) return linje.slice(start, m.index + 1).trim();
    start = neste;
  }
  return linje.slice(start).trim();
}

/**
 * Utdraget fra siden: setningen der datoen står. Med `neste` står datoen alene på linjen («Uke 28/29 i juli»), og
 * den første setningen på linjen etter tas med.
 */
export function utdrag(tekst: string, pos: number, neste = false): string {
  const start = tekst.lastIndexOf('\n', pos - 1) + 1;
  const slutt = tekst.indexOf('\n', pos);
  const linje = tekst.slice(start, slutt < 0 ? undefined : slutt);
  if (!neste || slutt < 0) return kort(setningVed(linje, pos - start));
  const etter = tekst.indexOf('\n', slutt + 1);
  const nesteLinje = tekst.slice(slutt + 1, etter < 0 ? undefined : etter);
  return kort(`${linje.trim()} ${setningVed(nesteLinje, 0)}`);
}

const medIndekser = (r: RegExp) => (r.flags.includes('d') ? r : new RegExp(r.source, `${r.flags}d`));

/**
 * Datoene en kilde gir, etter reglene. Regler som ikke finner noe, står i `mangler`, så en side som er endret, blir
 * oppdaget. Finner verken regelen eller kilden året, står det også i `mangler`.
 */
export function lesInntakskilde(kilde: Inntakskilde, tekst: string, hentet: string): { kandidater: Inntakskandidat[]; mangler: string[] } {
  const kandidater: Inntakskandidat[] = [];
  const mangler: string[] = [];
  const sideaar = finnAar(kilde, tekst, hentet);
  for (const r of kilde.regler) {
    const m = medIndekser(r.moenster).exec(tekst);
    // Datoen står i gruppen `dato`, eller i gruppe 1 når mønsteret ikke har navngitte grupper.
    const gruppe = m?.groups ? 'dato' : 1;
    const datotekst = m ? ((gruppe === 'dato' ? m.groups?.['dato'] : m[1]) ?? '') : '';
    const relativ = m?.groups?.['relativ']?.replace(/\s+/g, ' ').trim();
    const uker = datotekst ? lesUker(datotekst) : null;
    const datoer = datotekst && !uker ? lesDatoer(datotekst) : [];
    const manedsdel = datotekst && !uker && datoer.length === 0 ? lesManedsdel(datotekst) : null;
    if (!m || (!uker && datoer.length === 0 && !manedsdel && !relativ)) {
      if (!r.valgfri) mangler.push(r.felt);
      continue;
    }
    const forste = datoer[0];
    const aar = forste?.aar ?? (m.groups?.['aar'] ? Number(m.groups['aar']) : sideaar);
    if (aar === null) {
      mangler.push(`${r.felt} (fant ikke inntaksåret på siden)`);
      continue;
    }
    // Posisjonen til datoen (eller hele treffet), for teksten og for «ca.» rett foran datoen.
    const indekser = (m as RegExpExecArray & { indices?: Array<[number, number] | undefined> & { groups?: Record<string, [number, number] | undefined> } }).indices;
    const datopos = datotekst ? (gruppe === 'dato' ? indekser?.groups?.['dato'] : indekser?.[gruppe])?.[0] : undefined;
    const pos = datopos ?? indekser?.groups?.['relativ']?.[0] ?? m.index;
    const verdi: Inntakskandidat['verdi'] = { tekst: utdrag(tekst, pos, r.nesteLinje) };
    const somIso = (d: Datotreff) => `${d.aar ?? aar}-${String(d.maned).padStart(2, '0')}-${String(d.dag).padStart(2, '0')}`;
    if (manedsdel) {
      Object.assign(verdi, periodeForManedsdel(aar, manedsdel.maned, manedsdel.del), { omtrent: true, forbehold: manedsdel.del });
    } else if (uker) {
      verdi.fra = mandagIUke(aar, uker.fra);
      verdi.til = fredagIUke(aar, uker.til);
      verdi.uke = uker.fra === uker.til ? String(uker.fra) : `${uker.fra}–${uker.til}`;
    } else if (forste) {
      verdi.fra = somIso(forste);
      const siste = datoer[1];
      if (siste) verdi.til = somIso(siste);
    }
    const ord = OMTRENT.exec(tekst.slice(Math.max(0, pos - 12), pos))?.[1];
    if (verdi.fra && !manedsdel && (r.omtrent || ord)) {
      verdi.omtrent = true;
      verdi.forbehold = ord ? forbeholdFor(ord) : 'ca';
    }
    if (relativ) verdi.relativ = r.relativTillegg ? `${relativ} ${r.relativTillegg}` : relativ;
    kandidater.push({ kilde: kilde.id, fylke: kilde.fylke, aar: String(aar), felt: r.felt, verdi });
  }
  return { kandidater, mangler };
}

export type Inntaksfylker = Record<string, Record<string, Partial<Record<Inntaksfelt, Inntaksdato>>>>;

const nokkel = (v: Inntakskandidat['verdi']) => `${v.fra ?? ''}|${v.til ?? ''}|${v.relativ ?? ''}`;
const beskriv = (v: Inntakskandidat['verdi']) => [v.fra && v.til ? `${v.fra}–${v.til}` : v.fra, v.relativ].filter(Boolean).join(', ');

/**
 * Datoene per fylke, inntaksår og felt. Den første kilden som har datoen, gir teksten. Kilder med samme dato legges
 * til i `kilder`. Er to sider i samme fylke uenige, står det i `uenige`, og datoen fra den første blir stående.
 */
export function samleInntak(kandidater: readonly Inntakskandidat[]): { fylker: Inntaksfylker; uenige: string[] } {
  const fylker: Inntaksfylker = {};
  const uenige: string[] = [];
  for (const k of kandidater) {
    const aar = ((fylker[k.fylke] ??= {})[k.aar] ??= {});
    const forrige = aar[k.felt];
    if (!forrige) {
      aar[k.felt] = { ...k.verdi, kilder: [k.kilde] };
    } else if (nokkel(forrige) === nokkel(k.verdi)) {
      if (!forrige.kilder.includes(k.kilde)) forrige.kilder.push(k.kilde);
    } else {
      uenige.push(`Fylke ${k.fylke}, ${k.aar}, ${k.felt}: ${beskriv(forrige)} (${forrige.kilder.join(', ')}) mot ${beskriv(k.verdi)} (${k.kilde})`);
    }
  }
  return { fylker, uenige };
}

/** Endringene fra forrige fil, én linje per dato. */
export function sammenlignInntak(forrige: Inntaksfylker | null, ny: Inntaksfylker): string[] {
  if (!forrige) return [];
  const flat = (f: Inntaksfylker) => {
    const ut = new Map<string, string>();
    for (const [fylke, aarene] of Object.entries(f))
      for (const [aar, felter] of Object.entries(aarene)) for (const [felt, v] of Object.entries(felter)) if (v) ut.set(`fylke ${fylke} ${aar} ${felt}`, `${beskriv(v)}${v.omtrent ? ' (omtrent)' : ''}`);
    return ut;
  };
  const a = flat(forrige);
  const b = flat(ny);
  const ut: string[] = [];
  for (const [k, v] of b) if (a.get(k) !== v) ut.push(a.has(k) ? `${k}: ${a.get(k)} → ${v}` : `${k}: ny (${v})`);
  for (const [k, v] of a) if (!b.has(k)) ut.push(`${k}: borte (${v})`);
  return ut;
}
