// Poengberegning ved inntak til videregående opplæring (fase 5, pakke 3, avgjørelse 047).
// Vg1 etter opplæringsforskrifta § 4-19, Vg2 og Vg3 etter § 4-25, med Udirs merknader til paragrafene.
// Rene funksjoner uten avhengighet til grensesnittet. Tallene leses fra rules/inntak/ via hent().
// Resultatet har trinnene i utregningen, så appen kan vise hvilke karakterer som teller og hvorfor.
import type { KildeRef } from '../../../core/innhold/skjema.ts';
import { type Oppslag, somTall } from '../../../core/regler/motor.ts';

/** Leser en regelverdi, f.eks. «inntak.poeng_faktor». I appen er dette hentVerdi() med brukerens kontekst. */
export type Hent = (nokkel: string) => Oppslag;

export type Karakter = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Vurderingen i et fag. IV: ikke vurderingsgrunnlag. IM: ikke møtt til eksamen. fritak: fritak fra opplæring
 * eller fra vurdering med karakter. deltatt: «deltatt» eller «bestått», eller fag uten vurderingsuttrykk.
 */
export type Vurdering = Karakter | 'IV' | 'IM' | 'fritak' | 'deltatt';

export type Karaktertype = 'standpunkt' | 'eksamen' | 'halvar';

export const VURDERINGER: readonly Vurdering[] = [6, 5, 4, 3, 2, 1, 'IV', 'IM', 'fritak', 'deltatt'];

/** Én karakter på vitnemålet eller kompetansebeviset. Tom (null) betyr at faget ikke er fylt ut. */
export interface Karakterrad {
  type: Karaktertype;
  vurdering: Vurdering | null;
  /**
   * En annen karakter i samme fag, f.eks. fra privatisteksamen eller fra et annet utdanningsprogram (omvalg).
   * Den beste av de to teller (§ 4-25 første ledd bokstav e og f).
   */
  annen?: Vurdering | null;
  /** Faget, når det har betydning for utregningen: halvårsvurdering i samme fag over flere trinn. */
  fag?: string;
  trinn?: 'Vg1' | 'Vg2';
  /** Halvårsvurdering fra Vg1 som erstattes av en ny vurdering i samme fag på Vg2 (inntak til Vg3). */
  erstattet?: boolean;
}

/** Hvorfor en karakter ikke er med i gjennomsnittet. */
export type Utelatt = 'fritak' | 'deltatt' | 'halvar_erstattet' | 'valgfag_erstattet';

export interface Poengsteg {
  id: 'karakterer' | 'null' | 'utelatt' | 'valgfag' | 'beste' | 'snitt' | 'avrunding' | 'poeng' | 'tillegg' | 'samlet';
  /** Tallene i trinnet, f.eks. { sum: 62, antall: 14 }. Teksten står i src/strings. */
  verdier: Record<string, number>;
  /** Hvorfor karakterer er utelatt, med antall. Bare for «utelatt». */
  utelatt?: Partial<Record<Utelatt, number>>;
  kilder: KildeRef[];
}

export interface Poengresultat {
  /** Karakterene som teller, i rekkefølge. Valgfagsnittet er én av dem. */
  teller: number[];
  sum: number;
  antall: number;
  snitt: number;
  snittAvrundet: number;
  poeng: number;
  tillegg: number;
  samlet: number;
  /** Søkeren skal behandles individuelt (§ 4-20 eller § 4-26) i stedet for å konkurrere på poeng. */
  individuell: boolean;
  steg: Poengsteg[];
}

const forskrift = (punkt: string): KildeRef => ({ id: 'opplaeringsforskrifta', punkt });
const MERKNADER: KildeRef = { id: 'udir-merknader-ofo', punkt: '§ 4-19 og § 4-25' };

/** Avrunder etter vanlige regler (5 og over rundes opp). Litt slakk tar bort feil fra flyttall, f.eks. 412,4999…. */
export function avrund(tall: number, desimaler: number): number {
  const f = 10 ** desimaler;
  return Math.round(tall * f + 1e-9) / f;
}

/** Tallverdien en vurdering teller med, eller null når faget ikke regnes med. */
export function tallverdi(v: Vurdering | null | undefined, hent: Hent): number | null {
  if (v === null || v === undefined || v === 'fritak' || v === 'deltatt') return null;
  if (v === 'IV' || v === 'IM') return somTall(hent('inntak.iv_im_verdi'));
  return v;
}

/** Den beste av to vurderinger i samme fag. En karakter går foran IV, IM og vurderinger som ikke teller. */
export function beste(a: Vurdering | null, b: Vurdering | null | undefined, hent: Hent): Vurdering | null {
  if (b === null || b === undefined) return a;
  const ta = tallverdi(a, hent);
  const tb = tallverdi(b, hent);
  if (tb === null) return a ?? b;
  if (ta === null) return b;
  return tb > ta ? b : a;
}

interface Telling {
  teller: number[];
  nuller: number;
  utelatt: Partial<Record<Utelatt, number>>;
  /** Fag der den andre karakteren (privatist eller omvalg) ble brukt. */
  bedre: number;
}

function tell(rader: readonly Karakterrad[], hent: Hent): Telling {
  const t: Telling = { teller: [], nuller: 0, utelatt: {}, bedre: 0 };
  for (const r of rader) {
    const v = beste(r.vurdering, r.annen, hent);
    if (v !== r.vurdering) t.bedre++;
    const verdi = tallverdi(v, hent);
    if (verdi === null) {
      if (v === 'fritak' || v === 'deltatt') t.utelatt[v] = (t.utelatt[v] ?? 0) + 1;
      continue;
    }
    if (v === 'IV' || v === 'IM') t.nuller++;
    t.teller.push(verdi);
  }
  return t;
}

/** Gjennomsnitt, avrunding og poeng: det som er likt for Vg1, Vg2 og Vg3. */
function regnUt(hent: Hent, teller: number[], ekstraSum = 0, ekstraAntall = 0) {
  const desimaler = hent('inntak.snitt_desimaler');
  const faktor = hent('inntak.poeng_faktor');
  const sum = teller.reduce((a, b) => a + b, 0) + ekstraSum;
  const antall = teller.length + ekstraAntall;
  const snitt = antall > 0 ? sum / antall : 0;
  const snittAvrundet = avrund(snitt, somTall(desimaler));
  // Poengene regnes fra hundredeler, så 4,43 × 10 blir 44,3 og ikke 44,300000000000004.
  const poeng = avrund((Math.round(snittAvrundet * 100) * somTall(faktor)) / 100, 2);
  return { sum, antall, snitt, snittAvrundet, poeng, desimaler, faktor };
}

export interface Vg1Input {
  /** Standpunktkarakterene i fagene på vitnemålet (ikke valgfag). */
  standpunkt: readonly (Vurdering | null)[];
  eksamen: readonly (Vurdering | null)[];
  /** Standpunkt i hvert valgfag. Samme valgfag over flere år: bare karakteren fra høyeste trinn. */
  valgfag: readonly (Vurdering | null)[];
  /** Søkeren har tatt fag fra videregående i stedet for valgfag på alle trinn. Da teller ikke valgfag. */
  valgfagErstattet?: boolean;
  /** Tilleggspoeng (Vestland § 2-7 og § 2-8), eller null. */
  tillegg?: Oppslag | null;
}

/** Poengsum til Vg1 (§ 4-19). */
export function beregnVg1(hent: Hent, input: Vg1Input): Poengresultat {
  const rader: Karakterrad[] = [
    ...input.standpunkt.map((vurdering) => ({ type: 'standpunkt' as const, vurdering })),
    ...input.eksamen.map((vurdering) => ({ type: 'eksamen' as const, vurdering })),
  ];
  const t = tell(rader, hent);
  const steg: Poengsteg[] = [];

  // Valgfag: gjennomsnittet med to desimaler teller som én karakter (§ 4-19 første ledd bokstav b).
  const valgfag = input.valgfagErstattet ? [] : input.valgfag.map((v) => tallverdi(v, hent)).filter((v): v is number => v !== null);
  const valgfagDesimaler = hent('inntak.valgfag_desimaler');
  const valgfagsnitt = valgfag.length > 0 ? avrund(valgfag.reduce((a, b) => a + b, 0) / valgfag.length, somTall(valgfagDesimaler)) : null;
  const utfylteValgfag = input.valgfag.filter((v) => v !== null).length;
  if (input.valgfagErstattet && utfylteValgfag > 0) t.utelatt.valgfag_erstattet = utfylteValgfag;

  // Individuell behandling: mangler karakter i mer enn halvparten av fagene på vitnemålet (§ 4-20 bokstav a).
  // Fritak og IV regnes sammen (Udirs merknader).
  const fag = [...input.standpunkt, ...(input.valgfagErstattet ? [] : input.valgfag)].filter((v) => v !== null);
  const utenKarakter = fag.filter((v) => v === 'IV' || v === 'fritak').length;
  const individuell = fag.length > 0 && utenKarakter * 2 > fag.length;

  const r = regnUt(hent, t.teller, valgfagsnitt ?? 0, valgfagsnitt === null ? 0 : 1);
  steg.push({ id: 'karakterer', verdier: { antall: t.teller.length, sum: t.teller.reduce((a, b) => a + b, 0) }, kilder: [forskrift('§ 4-19 første ledd bokstav a')] });
  if (t.nuller > 0) steg.push({ id: 'null', verdier: { antall: t.nuller }, kilder: [forskrift('§ 4-19 første ledd bokstav e')] });
  if (Object.keys(t.utelatt).length > 0) {
    steg.push({ id: 'utelatt', verdier: {}, utelatt: t.utelatt, kilder: [forskrift('§ 4-19 første ledd bokstav c og d'), MERKNADER] });
  }
  if (valgfagsnitt !== null) {
    steg.push({ id: 'valgfag', verdier: { antall: valgfag.length, sum: valgfag.reduce((a, b) => a + b, 0), snitt: valgfagsnitt }, kilder: [valgfagDesimaler.kilde] });
  }
  return avslutt(r, t.teller, valgfagsnitt, input.tillegg ?? null, individuell, steg, forskrift('§ 4-19 første ledd bokstav a'));
}

export interface Vg2Vg3Input {
  /** Trinnet søkeren søker til. Til Vg3 teller karakterene fra Vg1 og Vg2. */
  trinn: 'Vg2' | 'Vg3';
  rader: readonly Karakterrad[];
}

/**
 * I et fag som fortsetter, gjelder den siste vurderingen: en halvårsvurdering fra Vg1 teller ikke når samme fag har
 * en ny vurdering på Vg2, halvår eller standpunkt. Standpunkt står (eier 03.10.2026, Udirs merknader til § 4-25,
 * f.eks. norsk og kroppsøving). Rader uten fag regnes som ulike fag, med mindre raden er merket «erstattet».
 */
function sisteHalvar(rader: readonly Karakterrad[]): { rader: Karakterrad[]; erstattet: number } {
  const vg2 = new Set(rader.filter((r) => (r.type === 'halvar' || r.type === 'standpunkt') && r.trinn === 'Vg2' && r.fag).map((r) => r.fag));
  const beholdt = rader.filter((r) => !(r.type === 'halvar' && r.trinn === 'Vg1' && (r.erstattet || (r.fag && vg2.has(r.fag)))));
  return { rader: beholdt, erstattet: rader.length - beholdt.length };
}

/** Poengsum til Vg2 eller Vg3 (§ 4-25). */
export function beregnVg2Vg3(hent: Hent, input: Vg2Vg3Input): Poengresultat {
  const { rader, erstattet } = input.trinn === 'Vg3' ? sisteHalvar(input.rader) : { rader: [...input.rader], erstattet: 0 };
  const t = tell(rader, hent);
  if (erstattet > 0) t.utelatt.halvar_erstattet = erstattet;
  const steg: Poengsteg[] = [];
  const r = regnUt(hent, t.teller);
  // Individuell behandling når søkeren ikke har noen tallkarakterer (§ 4-26 første ledd bokstav a).
  const utfylt = rader.filter((x) => x.vurdering !== null);
  const individuell = utfylt.length > 0 && t.teller.length === t.nuller;
  steg.push({ id: 'karakterer', verdier: { antall: t.teller.length, sum: r.sum }, kilder: [forskrift('§ 4-25 første ledd bokstav a')] });
  if (t.nuller > 0) steg.push({ id: 'null', verdier: { antall: t.nuller }, kilder: [forskrift('§ 4-25 første ledd bokstav d')] });
  if (t.bedre > 0) steg.push({ id: 'beste', verdier: { antall: t.bedre }, kilder: [forskrift('§ 4-25 første ledd bokstav e og f'), MERKNADER] });
  if (Object.keys(t.utelatt).length > 0) {
    steg.push({ id: 'utelatt', verdier: {}, utelatt: t.utelatt, kilder: [forskrift('§ 4-25 første ledd bokstav b og c'), MERKNADER] });
  }
  return avslutt(r, t.teller, null, null, individuell, steg, forskrift('§ 4-25 første ledd bokstav a'));
}

function avslutt(
  r: ReturnType<typeof regnUt>,
  teller: number[],
  valgfagsnitt: number | null,
  tillegg: Oppslag | null,
  individuell: boolean,
  steg: Poengsteg[],
  /** Bokstaven i forskriften om gjennomsnitt, to desimaler og ganger ti for trinnet (§ 4-19 eller § 4-25). */
  regel: KildeRef,
): Poengresultat {
  steg.push({ id: 'snitt', verdier: { sum: r.sum, antall: r.antall, snitt: r.snitt }, kilder: [] });
  // Verdiene står i rules/inntak med begge paragrafene som kilde. Trinnet viser paragrafen for trinnet søkeren søker til.
  steg.push({ id: 'avrunding', verdier: { snitt: r.snitt, desimaler: somTall(r.desimaler), avrundet: r.snittAvrundet }, kilder: [regel, MERKNADER] });
  steg.push({ id: 'poeng', verdier: { avrundet: r.snittAvrundet, faktor: somTall(r.faktor), poeng: r.poeng }, kilder: [regel] });
  const t = tillegg ? somTall(tillegg) : 0;
  const samlet = avrund(r.poeng + t, 2);
  if (tillegg) {
    steg.push({ id: 'tillegg', verdier: { tillegg: t }, kilder: [tillegg.kilde] });
    steg.push({ id: 'samlet', verdier: { poeng: r.poeng, tillegg: t, samlet }, kilder: [] });
  }
  return {
    teller: valgfagsnitt === null ? teller : [...teller, valgfagsnitt],
    sum: r.sum,
    antall: r.antall,
    snitt: r.snitt,
    snittAvrundet: r.snittAvrundet,
    poeng: r.poeng,
    tillegg: t,
    samlet,
    individuell,
    steg,
  };
}
