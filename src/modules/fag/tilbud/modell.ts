// Tilbudsstrukturen: utdanningsprogram → vg1 → vg2-retninger → vg3 og lærefag, med fagsammensetning og timer
// for hvert tilbud (programområde). Bygges fra Grep (programområder, «bygger på», fagkoder) og fag- og
// timefordelingen i rundskrivet Udir-1. Ren logikk, uten avhengighet til grensesnittet (avgjørelse 024).
//
// Ingenting her er skrevet inn for hånd per program eller fag: når Grep eller rundskrivet endres, endres
// tilbudene. Det eneste faste er hvordan linjene i rundskrivet tolkes (LINJETYPER og FELLESFAG nedenfor).
import type { Fag, Fagindeks, Programomrade, Trinn } from '../skjema.ts';
import type { Fagfordeling, Fordelingstabell } from './skjema.ts';

export type Programgruppe = 'studieforberedende' | 'yrkesfaglig' | 'pabygging';

export const STUDIEFORBEREDENDE = ['ST', 'ID', 'MD', 'KD', 'ME'] as const;

export function programgruppe(program: string): Programgruppe {
  if (program === 'PB') return 'pabygging';
  return (STUDIEFORBEREDENDE as readonly string[]).includes(program) ? 'studieforberedende' : 'yrkesfaglig';
}

export type Linjetype = 'fellesfag' | 'felles_programfag' | 'fordypning' | 'valgfritt' | 'yff' | 'opphenting' | 'sum' | 'totalt';

/** Hva en linje i tabellen er. Rekkefølgen betyr noe: den første som passer, gjelder. */
const LINJETYPER: [RegExp, Linjetype][] = [
  [/^totalt/i, 'totalt'],
  [/^sum\b/i, 'sum'],
  [/opphenting/i, 'opphenting'],
  [/yrkesfaglig fordypning/i, 'yff'],
  [/felles programfag/i, 'felles_programfag'],
  [/programfag fra eget programområde \(fordypning\)/i, 'fordypning'],
  [/programfag fra eget programområde eller/i, 'valgfritt'],
  [/programfag fra/i, 'valgfritt'],
];

export function linjetype(linje: string): Linjetype {
  return LINJETYPER.find(([r]) => r.test(linje))?.[1] ?? 'fellesfag';
}

/**
 * Hvilke fagkoder i Grep som hører til en fellesfaglinje i rundskrivet. Brukes bare til å sortere fagene i
 * tilbudet, ikke til årsrammen (den kobles eksplisitt, avgjørelse 023).
 */
const FELLESFAG: [RegExp, RegExp][] = [
  [/^norsk tegnspråk/i, /^NOR/],
  [/^norsk/i, /^NOR/],
  [/^matematikk/i, /^MAT/],
  [/^naturfag/i, /^NAT/],
  [/^engelsk/i, /^ENG/],
  [/^fremmedspråk/i, /^FSP/],
  [/^samfunnskunnskap/i, /^SAK/],
  [/^geografi/i, /^GEO/],
  [/^historie/i, /^HIS/],
  [/^kroppsøving/i, /^KRO/],
  [/^religion/i, /^(REL|KRI)/],
  [/^(førstespråk|andrespråk)/i, /^(SFS|SAS|KEF|NOR)/],
];

/**
 * Fag for særskilte grupper elever, som erstatter et ordinært fag: samisk plan, tegnspråk, kort botid,
 * grunnleggende norsk, styrket opplæring, morsmål, katolske skoler. De vises som alternativer, ikke som tilbudet.
 */
const ALTERNATIV = /tegnspråk|samisk|kvensk|finsk som andrespråk|kort botid|grunnleggende norsk|minoritet|styrket|morsmål|katolske|for døve/i;

export type Rolle = 'ordinar' | 'alternativ' | 'vurdering';

export interface Tilbudskode {
  kode: string;
  rolle: Rolle;
  timer: number | null;
}

export type Tilbudsdel =
  | {
      type: 'fag';
      linje: string;
      kategori: 'fellesfag' | 'felles_programfag';
      /** Timer etter rundskrivet. */
      timer: number;
      /** Ordinære fagkoder. Er det flere, velger eleven én (f.eks. 1P eller 1T, eller et fremmedspråk). */
      koder: string[];
      /** Fagkoder for vurdering (muntlig, eksamen) som hører til samme opplæring. */
      vurdering: string[];
      /** Fag for særskilte grupper som kan erstatte faget. */
      alternativer: string[];
      /**
       * Felles programfag der en del av timene fylles fra en liste: valg mellom fag i samme læreplan (f.eks. dekk
       * eller maskin), eller fag som går over flere trinn i Grep (f.eks. aktivitetslære 1–3).
       */
      utvalg: Utvalg | null;
      /**
       * Programområdet fagkodene er hentet fra, når Grep ikke knytter fellesfaget til dette programområdet.
       * Programområder merket «påbygg» i Grep (studieforberedende vg3 i naturbruk) får fellesfagene fra påbygging.
       * Ordinære programområder uten fellesfag i Grep (dronefag) får dem fra et annet programområde i programmet.
       */
      lantFra: string | null;
      /** Avvik mellom rundskrivet og Grep, f.eks. ulike timer. */
      avvik: string[];
    }
  | {
      type: 'plass';
      linje: string;
      kategori: 'fordypning' | 'valgfritt' | 'yff' | 'opphenting';
      timer: number;
      /** Antall fag à 140 timer, når plassen fylles med programfag. */
      antall: number | null;
      /** Fagkodene som kan legges inn (for YFF: kodene med ulike timetall). */
      kandidater: string[];
      /** Fagkoden som passer timetallet (YFF). */
      anbefalt: string | null;
    };

export interface Utvalg {
  grunn: 'valg' | 'flere_trinn';
  timer: number;
  /** Antall fag å velge, når alle fagene har samme timetall. */
  antall: number | null;
  koder: string[];
  /**
   * Fag over flere trinn som bygger på hverandre i VIGO, i rekkefølgen de tas (f.eks. Teater og bevegelse 1 → 2).
   * Fagene tas i denne rekkefølgen (eier 01.10.2026). Fag som ikke står i en rekke, har ingen rekkefølge i VIGO.
   */
  rekker: string[][];
}

/** Fag som bygger på andre fag (fra VIGO), fagkode → kodene den bygger på. */
export type FagBygger = Readonly<Record<string, readonly string[]>>;

/**
 * Rekkene blant kodene: hvert fag kommer etter fagene det bygger på. Bare rekker med minst to fag er med.
 * Bygger et fag på flere av kodene, følges den første i sortert rekkefølge.
 */
export function rekker(koder: readonly string[], bygger: FagBygger): string[][] {
  const sett = new Set(koder);
  const forrige = new Map<string, string>();
  for (const k of koder) {
    const f = [...(bygger[k] ?? [])].filter((b) => sett.has(b) && b !== k).sort()[0];
    if (f) forrige.set(k, f);
  }
  const neste = new Map<string, string[]>();
  for (const [k, f] of forrige) neste.set(f, [...(neste.get(f) ?? []), k].sort());
  const ut: string[][] = [];
  const brukt = new Set<string>();
  for (const start of [...sett].filter((k) => !forrige.has(k) && neste.has(k)).sort()) {
    const rekke = [start];
    brukt.add(start);
    let naa = start;
    for (;;) {
      const n = (neste.get(naa) ?? []).find((x) => !brukt.has(x));
      if (!n) break;
      rekke.push(n);
      brukt.add(n);
      naa = n;
    }
    ut.push(rekke);
  }
  return ut;
}

export interface Tilpasning {
  /** Kolonnen i rundskrivet, f.eks. «Samisk», «Elever med tegnspråk», «Med stud.spes vg1». */
  navn: string;
  /** Linjene der timene er annerledes enn i den ordinære kolonnen, med fagkodene når linjen er en plass (opphenting). */
  linjer: { linje: string; ordinar: number | null; timer: number | null; koder: string[] }[];
  total: number | null;
}

export interface Tilbud {
  kode: string;
  programomrade: Programomrade;
  gruppe: Programgruppe;
  /** Særskilte skoler (Steiner, Montessori, tysk skole) har egne programområder i Grep. */
  variant: boolean;
  /** Tabellen i rundskrivet, eller null (f.eks. opplæring i bedrift). */
  tabell: { nr: string; omfang: string } | null;
  deler: Tilbudsdel[];
  /** Summen av timene i delene, og totalt omfang i rundskrivet. */
  sum: number;
  totalt: number | null;
  tilpasninger: Tilpasning[];
  /**
   * Fellesfag i Grep for programområdet som ikke står i den ordinære kolonnen: fag for særskilte grupper
   * (samisk, kvensk, grunnleggende norsk, tegnspråk, styrket opplæring) og fag i tilpasningene (f.eks.
   * fremmedspråk I+II for elever uten fremmedspråk fra grunnskolen).
   */
  alternativer: string[];
  /** Andre fag i Grep for programområdet som ikke passer noen linje i rundskrivet. */
  andreFag: string[];
  /** Programområdene tilbudet bygger på, i samme program (forrige trinn) og fra andre program (kryssløp). */
  fra: string[];
  kryssFra: string[];
  /** «Bygger på» mangler i Grep og er funnet ut fra programmet (se byggerPaa). */
  fraAvledet: boolean;
  /** Videre løp: neste trinn i samme program, påbygging og kryssløp til andre program. */
  videre: string[];
  pabygging: string[];
  kryssTil: string[];
  avvik: string[];
}

const trinnFraOmfang = (omfang: string): Trinn | null => {
  const m = /vg\s*([123])/i.exec(omfang);
  return m ? (`Vg${m[1]}` as Trinn) : null;
};

/** Er programområdet en variant for særskilte skoler (kode som STUSP1RS--, STREA2MO--, STUSP1TY--)? */
export const erVariant = (kode: string) => /^[A-Z]{5}\d[A-Z]{2}/.test(kode);

/**
 * Hva et programområde bygger på. Mangler «bygger på» i Grep for et lærefag (vg3 i bedrift), og har programmet
 * bare ett ordinært vg2 i skole, bygger lærefaget på det. Eksempel: de fire lærefagene i salg, service og reiseliv
 * bygger på vg2 salg, service og reiseliv, slik Udir viser strukturen på udir.no/kl06/SR (eier 01.10.2026).
 */
export function byggerPaa(kode: string, indeks: Fagindeks): { koder: string[]; avledet: boolean } {
  const po = indeks.programomrader[kode];
  if (!po) return { koder: [], avledet: false };
  if (po.bygger.length > 0 || po.sted !== 'bedrift' || po.trinn !== 'Vg3' || erVariant(kode)) return { koder: po.bygger, avledet: false };
  const vg2 = Object.entries(indeks.programomrader)
    .filter(([k, p]) => p.program === po.program && p.trinn === 'Vg2' && p.sted === 'skole' && !erVariant(k) && p.merkelapper.length === 0)
    .map(([k]) => k);
  return vg2.length === 1 ? { koder: vg2, avledet: true } : { koder: [], avledet: false };
}

/** Er programområdet for voksne (merkelapp i Grep)? Rundskrivets tabeller gjelder ikke (eier 01.10.2026). */
export const erVoksenopplaering = (po: Programomrade) => po.merkelapper.includes('for_voksenopplaering');

/** Fordelingstabellen i rundskrivet for et programområde (program og trinn), eller null. */
export function finnTabell(f: Fagfordeling, kode: string, po: Programomrade, programnavn: string): Fordelingstabell | null {
  const tittel = (t: Fordelingstabell) => t.tittel.toLowerCase();
  // Fag for studiekompetanse (PBPBY4) er vg4 påbygging, for dem som har fag- eller yrkeskompetanse eller går mot
  // grunnkompetanse etter opplæringskontrakt (eier 01.10.2026). Grep oppgir trinnet som vg3.
  if (kode.startsWith('PBPBY4')) return f.tabeller.find((t): t is Fordelingstabell => t.type === 'fordeling' && /^vg4/i.test(t.omfang) && /vg4 påbygging/.test(tittel(t))) ?? null;
  const tabeller = f.tabeller.filter((t): t is Fordelingstabell => t.type === 'fordeling' && trinnFraOmfang(t.omfang) === po.trinn);
  if (po.program === 'PB') return kode.startsWith('PBPBY3') ? (tabeller.find((t) => /påbygging til generell studiekompetanse for yrkesfaglige/.test(tittel(t))) ?? null) : null;
  if (programgruppe(po.program) === 'studieforberedende') return tabeller.find((t) => tittel(t).includes(`for ${programnavn.toLowerCase()}`)) ?? null;
  if (po.sted === 'bedrift' || erVoksenopplaering(po)) return null;
  if (po.trinn === 'Vg3' && /^studieforberedende/i.test(po.navn.nb)) return tabeller.find((t) => /studieforberedende vg3/.test(tittel(t)) && tittel(t).includes(programnavn.toLowerCase())) ?? null;
  if (po.trinn === 'Vg3') return tabeller.find((t) => /yrkesfaglige utdanningsprogram.*vg3 i skole/.test(tittel(t))) ?? null;
  return tabeller.find((t) => /yrkesfaglige utdanningsprogram/.test(tittel(t)) && /vg1 og vg2/.test(tittel(t))) ?? null;
}

const harPo = (fag: Fag, kode: string) => fag.po.includes(kode);
const erOpphenting = (fag: Fag) => /opphenting/i.test(fag.navn.nb);

function fellesfagdel(linje: string, timer: number, kode: string, indeks: Fagindeks, reserve: readonly string[] = []): Tilbudsdel | null {
  const prefiks = FELLESFAG.find(([r]) => r.test(linje))?.[1];
  if (!prefiks) return null;
  const finn = (po: string) => Object.entries(indeks.fag).filter(([k, f]) => f.type === 'fellesfag' && prefiks.test(k) && harPo(f, po));
  // Har ikke programområdet egne koder for faget, brukes kodene fra reserveprogramområdet (påbygging).
  const ordinareFor = (po: string) => finn(po).filter(([, f]) => f.timer === timer && !ALTERNATIV.test(f.navn.nb));
  const lantFra = ordinareFor(kode).length === 0 ? (reserve.find((r) => ordinareFor(r).length > 0) ?? null) : null;
  if (lantFra) {
    const d = fellesfagdel(linje, timer, lantFra, indeks);
    return d?.type === 'fag' ? { ...d, lantFra } : d;
  }
  const alle = finn(kode);
  // Samisk og tegnspråk er vanlige valg som fremmedspråk, ikke alternativer.
  const erAlternativ = (f: Fag) => !/^fremmedspråk/i.test(linje) && ALTERNATIV.test(f.navn.nb);
  const alternativer = alle.filter(([, f]) => erAlternativ(f)).map(([k]) => k);
  const ordinare = alle.filter(([, f]) => !erAlternativ(f));
  const medTimer = ordinare.filter(([, f]) => f.timer !== null);
  const riktige = medTimer.filter(([, f]) => f.timer === timer);
  const avvik: string[] = [];
  let koder = riktige.map(([k]) => k);
  if (koder.length === 0 && medTimer.length > 0) {
    koder = medTimer.map(([k]) => k);
    avvik.push(`${linje}: rundskrivet har ${timer} timer, Grep har ${[...new Set(medTimer.map(([, f]) => f.timer))].join(', ')} (${koder.slice(0, 3).join(', ')}).`);
  }
  if (koder.length === 0) avvik.push(`${linje}: fant ingen fagkode i Grep for programområdet.`);
  // Vurderingskoder: ordinære koder uten timer, med samme læreplan som en av kodene.
  const lp = new Set(koder.map((k) => indeks.fag[k]?.lp));
  const vurdering = ordinare.filter(([, f]) => f.timer === null && lp.has(f.lp)).map(([k]) => k);
  return { type: 'fag', linje, kategori: 'fellesfag', timer, koder: koder.sort(), vurdering: vurdering.sort(), alternativer: alternativer.sort(), utvalg: null, lantFra: null, avvik };
}

const timerFor = (koder: readonly string[], indeks: Fagindeks) => koder.reduce((s, k) => s + (indeks.fag[k]?.timer ?? 0), 0);

/**
 * Felles programfag på et programområde. Grep knytter av og til flere fag til programområdet enn eleven har på
 * trinnet. Da brukes summen i rundskrivet til å finne fagene, i denne rekkefølgen:
 * 1. Læreplanene: står fagene i flere læreplaner, og passer nøyaktig én kombinasjon av læreplaner med summen,
 *    brukes den (f.eks. landbruk: læreplanen for opplæring i skole, ikke den for bedrift).
 * 2. Valg: mangler det timer, og har programområdet valgfrie programfag i samme læreplan med samme timetall,
 *    velger eleven blant dem (f.eks. maritime fag: dekk eller maskin).
 * 3. Flere trinn: fag som i Grep går over flere trinn (f.eks. aktivitetslære 1–3 på idrettsfag), fyller resten
 *    av timene. Hvilke av dem som hører til trinnet, står ikke i Grep. Rekkefølgen kommer fra VIGO når den finnes.
 * Stemmer summen fortsatt ikke, meldes avvik.
 */
function programfagdel(linje: string, timer: number, kode: string, indeks: Fagindeks, fagBygger: FagBygger): Tilbudsdel {
  // Opphenting (f.eks. YFO2002) er felles programfag i Grep, men en egen linje i rundskrivet.
  const alle = Object.entries(indeks.fag).filter(([, f]) => f.type === 'felles_programfag' && harPo(f, kode) && !erOpphenting(f));
  let medTimer = alle.filter(([, f]) => f.timer !== null).map(([k]) => k);
  if (medTimer.length === 0) return { type: 'fag', linje, kategori: 'felles_programfag', timer, koder: [], vurdering: alle.map(([k]) => k).sort(), alternativer: [], utvalg: null, lantFra: null, avvik: [`${linje}: fant ingen felles programfag i Grep.`] };
  // 1. Læreplanene
  const planer = [...new Set(medTimer.map((k) => indeks.fag[k]?.lp ?? ''))].sort();
  if (planer.length > 1 && planer.length <= 8 && timerFor(medTimer, indeks) !== timer) {
    const treff: string[][] = [];
    for (let m = 1; m < 1 << planer.length; m++) {
      const valgt = planer.filter((_, i) => m & (1 << i));
      if (timerFor(medTimer.filter((k) => valgt.includes(indeks.fag[k]?.lp ?? '')), indeks) === timer) treff.push(valgt);
    }
    if (treff.length === 1) medTimer = medTimer.filter((k) => (treff[0] as string[]).includes(indeks.fag[k]?.lp ?? ''));
  }
  const lp = new Set(medTimer.map((k) => indeks.fag[k]?.lp));
  // Vurderingskoder (muntlig, tverrfaglig eksamen), unntatt dem som hører til en læreplan som er valgt bort.
  const bortvalgt = new Set(planer.filter((p) => !lp.has(p)));
  const vurdering = alle.filter(([, f]) => f.timer === null && !bortvalgt.has(f.lp ?? '')).map(([k]) => k);
  let koder = medTimer;
  let utvalg: Utvalg | null = null;
  const rest = () => timer - timerFor(koder, indeks);
  // 2. Valg blant valgfrie programfag i samme læreplan
  if (rest() > 0) {
    const valg = Object.entries(indeks.fag).filter(([, f]) => f.type === 'valgfritt_programfag' && harPo(f, kode) && f.timer !== null && lp.has(f.lp));
    const t = valg[0]?.[1].timer ?? 0;
    if (valg.length > 1 && valg.every(([, f]) => f.timer === t) && rest() % t === 0) utvalg = { grunn: 'valg', timer: rest(), antall: rest() / t, koder: valg.map(([k]) => k).sort(), rekker: [] };
  }
  // 3. Fag over flere trinn
  if (!utvalg && rest() !== 0) {
    const flere = koder.filter((k) => (indeks.fag[k]?.trinn.length ?? 0) > 1);
    const faste = koder.filter((k) => !flere.includes(k));
    if (flere.length > 0 && timerFor(faste, indeks) < timer && timerFor(flere, indeks) >= timer - timerFor(faste, indeks)) {
      koder = faste;
      utvalg = { grunn: 'flere_trinn', timer: rest(), antall: null, koder: flere.sort(), rekker: rekker(flere, fagBygger) };
    }
  }
  const sum = timerFor(koder, indeks) + (utvalg?.timer ?? 0);
  const avvik = sum !== timer ? [`${linje}: rundskrivet har ${timer} timer, fagene i Grep har til sammen ${sum}.`] : [];
  return { type: 'fag', linje, kategori: 'felles_programfag', timer, koder: koder.sort(), vurdering: vurdering.sort(), alternativer: [], utvalg, lantFra: null, avvik };
}

function plassdel(linje: string, kategori: 'fordypning' | 'valgfritt' | 'yff' | 'opphenting', timer: number, kode: string, po: Programomrade, indeks: Fagindeks): Tilbudsdel {
  const fag = Object.entries(indeks.fag);
  let kandidater: string[];
  let anbefalt: string | null = null;
  if (kategori === 'yff') {
    kandidater = fag.filter(([, f]) => f.type === 'yrkesfaglig_fordypning' && harPo(f, kode)).map(([k]) => k);
    anbefalt = kandidater.find((k) => indeks.fag[k]?.timer === timer) ?? null;
  } else if (kategori === 'opphenting') {
    kandidater = fag.filter(([, f]) => harPo(f, kode) && erOpphenting(f)).map(([k]) => k);
  } else if (kategori === 'fordypning') {
    kandidater = fag.filter(([, f]) => f.type === 'valgfritt_programfag' && f.timer !== null && harPo(f, kode)).map(([k]) => k);
  } else {
    // Programfag fra studieforberedende utdanningsprogram: valgfrie programfag på trinnet i alle studieforberedende program.
    kandidater = fag
      .filter(([, f]) => f.type === 'valgfritt_programfag' && f.timer !== null && f.po.some((p) => indeks.programomrader[p]?.trinn === po.trinn && programgruppe(indeks.programomrader[p]?.program ?? '') === 'studieforberedende'))
      .map(([k]) => k);
  }
  const antall = kategori === 'fordypning' || kategori === 'valgfritt' ? Math.round(timer / 140) : null;
  return { type: 'plass', linje, kategori, timer, antall: antall && antall > 0 ? antall : null, kandidater: kandidater.sort(), anbefalt };
}

/** Bygger tilbudet for ett programområde. */
export function byggTilbud(kode: string, indeks: Fagindeks, fordeling: Fagfordeling | null, fagBygger: FagBygger = {}): Tilbud {
  const po = indeks.programomrader[kode];
  if (!po) throw new Error(`Ukjent programområde ${kode}`);
  const programnavn = indeks.utdanningsprogram[po.program]?.nb ?? po.program;
  const tabell = fordeling ? finnTabell(fordeling, kode, po, programnavn) : null;
  const deler: Tilbudsdel[] = [];
  const tilpasninger: Tilpasning[] = [];
  let totalt: number | null = null;
  const avvik: string[] = [];
  // Varianter for særskilte skoler har ofte ingen fellesfag i Grep. Da holder det med én merknad.
  const harFellesfag = Object.values(indeks.fag).some((f) => f.type === 'fellesfag' && harPo(f, kode));
  // Programområder merket «påbygg» i Grep utenfor påbygging (studieforberedende vg3 i naturbruk) tar fellesfagene
  // fra påbygging på samme trinn. Ordinære programområder uten fellesfag i Grep (dronefag) tar kodene fra de andre
  // programområdene i programmet på samme trinn; fellesfagene er de samme for alle (eier 01.10.2026).
  const andre = Object.entries(indeks.programomrader).filter(([k, p]) => k !== kode && p.trinn === po.trinn && p.sted === 'skole');
  const reserve =
    po.merkelapper.includes('paabygg') && po.program !== 'PB'
      ? andre
          .filter(([, p]) => p.program === 'PB' && p.merkelapper.includes('paabygg'))
          .map(([k]) => k)
          .sort()
      : !harFellesfag && !erVariant(kode) && po.merkelapper.length === 0 && po.program !== 'PB'
        ? andre
            .filter(([k, p]) => p.program === po.program && !erVariant(k) && p.merkelapper.length === 0)
            .map(([k]) => k)
            .sort()
        : [];
  if (tabell) {
    if (!harFellesfag) avvik.push(reserve.length > 0 ? 'Grep kobler ingen fellesfag til programområdet. Kodene er hentet fra et annet programområde.' : 'Grep kobler ingen fellesfag til programområdet.');
    const ord = tabell.kolonner.findIndex((k) => /^ordinær/i.test(k.navn));
    const i = ord < 0 ? 0 : ord;
    for (const r of tabell.rader) {
      const t = r.timer[i] ?? null;
      const type = linjetype(r.linje);
      if (type === 'totalt') totalt = t;
      if (t === null || t === 0 || type === 'sum' || type === 'totalt') continue;
      if (type === 'fellesfag') {
        const d = fellesfagdel(r.linje, t, kode, indeks, reserve);
        if (d?.type === 'fag' && !harFellesfag && !d.lantFra) d.avvik = [];
        if (d) deler.push(d);
        else avvik.push(`Linjen «${r.linje}» i rundskrivet er ikke kjent.`);
      } else if (type === 'felles_programfag') deler.push(programfagdel(r.linje, t, kode, indeks, fagBygger));
      else deler.push(plassdel(r.linje, type, t, kode, po, indeks));
    }
    tabell.kolonner.forEach((k, j) => {
      if (j === i) return;
      const linjer = tabell.rader
        .filter((r) => !['sum', 'totalt'].includes(linjetype(r.linje)) && (r.timer[j] ?? null) !== (r.timer[i] ?? null))
        .map((r) => ({
          linje: r.linje,
          ordinar: r.timer[i] ?? null,
          timer: r.timer[j] ?? null,
          koder: linjetype(r.linje) === 'opphenting' ? Object.entries(indeks.fag).filter(([, f]) => harPo(f, kode) && erOpphenting(f)).map(([k]) => k).sort() : [],
        }));
      const tot = tabell.rader.find((r) => linjetype(r.linje) === 'totalt')?.timer[j] ?? null;
      tilpasninger.push({ navn: k.navn, linjer, total: tot });
    });
  } else if (po.sted === 'bedrift') {
    const koder = Object.entries(indeks.fag)
      .filter(([, f]) => harPo(f, kode))
      .map(([k]) => k)
      .sort();
    if (koder.length > 0) deler.push({ type: 'fag', linje: 'Opplæring i bedrift', kategori: 'felles_programfag', timer: 0, koder, vurdering: [], alternativer: [], utvalg: null, lantFra: null, avvik: [] });
  }
  const sum = deler.reduce((s, d) => s + d.timer, 0);
  if (tabell && totalt !== null && sum !== totalt) avvik.push(`Summen av delene er ${sum} timer, rundskrivet sier ${totalt}.`);
  for (const d of deler) if (d.type === 'fag') avvik.push(...d.avvik);
  const brukt = new Set([
    ...deler.flatMap((d) => (d.type === 'fag' ? [...d.koder, ...d.vurdering, ...d.alternativer, ...(d.utvalg?.koder ?? [])] : [...d.kandidater])),
    ...tilpasninger.flatMap((t) => t.linjer.flatMap((l) => l.koder)),
  ]);
  const rest = Object.entries(indeks.fag).filter(([k, f]) => harPo(f, kode) && !brukt.has(k) && f.type !== 'valgfritt_programfag');
  const alternativer = rest.filter(([, f]) => f.type === 'fellesfag').map(([k]) => k).sort();
  const andreFag = rest.filter(([, f]) => f.type !== 'fellesfag').map(([k]) => k).sort();
  const alle = Object.entries(indeks.programomrader);
  const bygger = byggerPaa(kode, indeks);
  const fra = bygger.koder.filter((b) => indeks.programomrader[b]?.program === po.program);
  const kryssFra = bygger.koder.filter((b) => indeks.programomrader[b]?.program !== po.program);
  const barn = alle.filter(([k]) => byggerPaa(k, indeks).koder.includes(kode)).map(([k]) => k);
  return {
    kode,
    programomrade: po,
    gruppe: programgruppe(po.program),
    variant: erVariant(kode),
    tabell: tabell ? { nr: tabell.nr, omfang: tabell.omfang } : null,
    deler,
    sum,
    totalt,
    tilpasninger,
    alternativer,
    andreFag,
    fra,
    kryssFra,
    fraAvledet: bygger.avledet,
    videre: barn.filter((b) => indeks.programomrader[b]?.program === po.program).sort(),
    pabygging: barn.filter((b) => indeks.programomrader[b]?.program === 'PB').sort(),
    kryssTil: barn.filter((b) => !['PB', po.program].includes(indeks.programomrader[b]?.program ?? '')).sort(),
    avvik,
  };
}

export interface Programstruktur {
  program: string;
  navn: { nb: string; nn: string };
  gruppe: Programgruppe;
  /**
   * Inngangen til programmet: vg1, eller laveste trinn når programmet ikke har vg1 (påbygging). Hovedløp først,
   * varianter for særskilte skoler sist.
   */
  inngang: string[];
  /** Programområder i programmet som ikke kan nås fra vg1 i samme program (mangler «bygger på» i Grep). */
  utenfor: string[];
}

/** Programmene med inngang (vg1). Resten av løpet følger «videre» i hvert tilbud. */
export function byggStruktur(indeks: Fagindeks): Programstruktur[] {
  const po = Object.entries(indeks.programomrader);
  return Object.entries(indeks.utdanningsprogram)
    .map(([program, navn]) => {
      const egne = po.filter(([, p]) => p.program === program);
      const laveste = ['Vg1', 'Vg2', 'Vg3', 'Bedrift'].find((t) => egne.some(([, p]) => p.trinn === t));
      const inngang = egne
        .filter(([, p]) => p.trinn === laveste)
        .map(([k]) => k)
        .sort((a, b) => Number(erVariant(a)) - Number(erVariant(b)) || a.localeCompare(b));
      // Alt som kan nås fra inngangen i programmet, ved å følge «bygger på».
      const naadd = new Set(inngang);
      let endret = true;
      while (endret) {
        endret = false;
        for (const [k] of egne) {
          if (!naadd.has(k) && byggerPaa(k, indeks).koder.some((b) => naadd.has(b))) {
            naadd.add(k);
            endret = true;
          }
        }
      }
      const utenfor = egne
        .filter(([k]) => !naadd.has(k))
        .map(([k]) => k)
        .sort();
      return { program, navn, gruppe: programgruppe(program), inngang, utenfor };
    })
    .sort((a, b) => ['studieforberedende', 'yrkesfaglig', 'pabygging'].indexOf(a.gruppe) - ['studieforberedende', 'yrkesfaglig', 'pabygging'].indexOf(b.gruppe) || a.navn.nb.localeCompare(b.navn.nb, 'nb'));
}

/**
 * Rollen til hver fagkode i tilbudene: ordinært fag (i minst ett tilbud), alternativ (erstatter et fag for
 * særskilte grupper) eller vurderingskode. Fag som ikke står i noe tilbud, får ingen rolle her.
 */
export function fagroller(tilbud: readonly Tilbud[]): Map<string, Rolle> {
  const ut = new Map<string, Rolle>();
  const sett = (k: string, r: Rolle) => {
    const n = ut.get(k);
    if (n === 'ordinar' || (n === 'alternativ' && r === 'vurdering')) return;
    ut.set(k, r);
  };
  for (const t of tilbud) {
    for (const d of t.deler) {
      if (d.type === 'fag') {
        d.koder.forEach((k) => sett(k, 'ordinar'));
        d.utvalg?.koder.forEach((k) => sett(k, 'ordinar'));
        d.vurdering.forEach((k) => sett(k, 'vurdering'));
        d.alternativer.forEach((k) => sett(k, 'alternativ'));
      } else d.kandidater.forEach((k) => sett(k, 'ordinar'));
    }
    t.alternativer.forEach((k) => sett(k, 'alternativ'));
    t.tilpasninger.forEach((p) => p.linjer.forEach((l) => l.koder.forEach((k) => sett(k, 'alternativ'))));
  }
  return ut;
}

/**
 * Rollene til alle fagkodene, ut fra tilbudene i skole. Regnes ut når appen bygges (virtual:fagroller), fordi
 * det tar om lag ett sekund å bygge alle tilbudene.
 */
export function beregnFagroller(indeks: Fagindeks, fordeling: Fagfordeling | null): Map<string, Rolle> {
  const tilbud = Object.entries(indeks.programomrader)
    .filter(([, p]) => p.sted !== 'bedrift')
    .map(([kode]) => byggTilbud(kode, indeks, fordeling));
  return fagroller(tilbud);
}

/** Skoleåret for en dato (ÅÅÅÅ-MM-DD): skoleåret begynner 1. august. 2026-10-01 → 2026-2027. */
export function skolearFor(dato: string): string {
  const aar = Number(dato.slice(0, 4));
  const start = Number(dato.slice(5, 7)) >= 8 ? aar : aar - 1;
  return `${start}-${start + 1}`;
}

/**
 * Fag- og timefordelingen som gjelder på datoen: skoleåret datoen ligger i, ellers det siste skoleåret før.
 * Finnes bare senere skoleår, brukes det første av dem.
 */
export function velgFordeling<T extends { skolear: string }>(fordelinger: readonly T[], dato: string): T | null {
  const naa = skolearFor(dato);
  const sortert = [...fordelinger].sort((a, b) => a.skolear.localeCompare(b.skolear));
  return sortert.filter((f) => f.skolear <= naa).at(-1) ?? sortert[0] ?? null;
}
