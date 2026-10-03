// Fagene i et løp på Vg1 eller Vg2, til poengberegningen til Vg2 og Vg3 (eier 03.10.2026: «Navn og type»).
// Rene funksjoner. Fagene og timene står i fag- og timefordelingen (Udir-1, data/udir/fagfordeling-<skoleår>.json),
// som kildesjekken henter hver uke. Typen (standpunkt eller halvår) står i TYPER under, med kilde:
// - standpunkt på trinnet der læreplanen sier at eleven skal ha standpunktkarakter (vurderingsordningen i Grep),
// - ellers halvår, fordi et fag som ikke avsluttes i et skoleår, får halvårsvurdering med karakter ved slutten av
//   skoleåret (opplæringsforskrifta § 9-13). Den teller i poengsummen (§ 4-25).
import type { KildeRef } from '../../../core/innhold/skjema.ts';
import type { Fagfordeling, Fagliste, Fordelingstabell } from '../../fag/tilbud/skjema.ts';
import type { Karaktertype } from './poeng.ts';

export type Fellesfag = 'norsk' | 'matematikk' | 'naturfag' | 'engelsk' | 'fremmedsprak' | 'samfunnskunnskap' | 'geografi' | 'historie' | 'kroppsoving' | 'yff';

type Trinn = 'Vg1' | 'Vg2';
type Retning = 'studieforberedende' | 'yrkesfag';

export interface Utdanningsprogram {
  kode: string;
  retning: Retning;
  /** Tabellen med fag- og timefordelingen i Udir-1. */
  tabell: string;
  /** Yrkesfag: navnet på gruppen i tabell 18 (felles programfag på Vg1) og tabellen med felles programfag på Vg2. */
  programfagVg1?: string;
  programfagVg2?: string;
}

/** Utdanningsprogrammene, med tabellene i Udir-1-2026. Testene sjekker at tabellene og gruppene finnes i dataene. */
export const UTDANNINGSPROGRAM: readonly Utdanningsprogram[] = [
  { kode: 'ST', retning: 'studieforberedende', tabell: '4' },
  { kode: 'ID', retning: 'studieforberedende', tabell: '7' },
  { kode: 'MD', retning: 'studieforberedende', tabell: '9' },
  { kode: 'KD', retning: 'studieforberedende', tabell: '13' },
  { kode: 'ME', retning: 'studieforberedende', tabell: '15' },
  { kode: 'BA', retning: 'yrkesfag', tabell: '17a', programfagVg1: 'Bygg- og anleggsteknikk', programfagVg2: '19a' },
  { kode: 'EL', retning: 'yrkesfag', tabell: '17a', programfagVg1: 'Elektro og datateknologi', programfagVg2: '19b' },
  { kode: 'FD', retning: 'yrkesfag', tabell: '17a', programfagVg1: 'Frisør, blomster, interiør og eksponeringsdesign', programfagVg2: '19c' },
  { kode: 'HS', retning: 'yrkesfag', tabell: '17a', programfagVg1: 'Helse- og oppvekstfag', programfagVg2: '19d' },
  { kode: 'DT', retning: 'yrkesfag', tabell: '17a', programfagVg1: 'Håndverk, design og produktutvikling', programfagVg2: '19e' },
  { kode: 'IM', retning: 'yrkesfag', tabell: '17a', programfagVg1: 'Informasjonsteknologi og medieproduksjon', programfagVg2: '19f' },
  { kode: 'NA', retning: 'yrkesfag', tabell: '17a', programfagVg1: 'Naturbruk', programfagVg2: '19g' },
  { kode: 'RM', retning: 'yrkesfag', tabell: '17a', programfagVg1: 'Restaurant- og matfag', programfagVg2: '19h' },
  { kode: 'SR', retning: 'yrkesfag', tabell: '17a', programfagVg1: 'Salg, service og reiseliv', programfagVg2: '19i' },
  { kode: 'TP', retning: 'yrkesfag', tabell: '17a', programfagVg1: 'Teknologi og industrifag', programfagVg2: '19j' },
];

const grep = (lp: string): KildeRef => ({ id: 'udir-grep', punkt: `Vurderingsordning i ${lp}` });
const HALVAR: KildeRef = { id: 'opplaeringsforskrifta', punkt: '§ 9-13 tredje ledd', url: 'https://lovdata.no/forskrift/2024-06-03-900/§9-13' };

/**
 * Typen karakter i hvert fellesfag per retning og trinn, med kilden. Standpunkt der læreplanen sier det, ellers
 * halvår (faget fortsetter neste år). Fremmedspråk på Vg2 har standpunkt for nivå II («etter vg2/vg3»), men halvår
 * for nivå I+II, som går over tre år. Brukeren kan endre typen på raden.
 */
export const TYPER: Record<Fellesfag, Partial<Record<Retning, Partial<Record<Trinn, { type: Karaktertype; kilde: KildeRef }>>>>> = {
  norsk: {
    studieforberedende: { Vg1: { type: 'halvar', kilde: HALVAR }, Vg2: { type: 'halvar', kilde: HALVAR } },
    yrkesfag: { Vg2: { type: 'standpunkt', kilde: grep('NOR01-08') } },
  },
  matematikk: {
    studieforberedende: { Vg1: { type: 'standpunkt', kilde: grep('MAT08-01 og MAT09-02') }, Vg2: { type: 'standpunkt', kilde: grep('MAT05-04') } },
    yrkesfag: { Vg1: { type: 'standpunkt', kilde: grep('MAT08-01 og MAT09-02') } },
  },
  naturfag: {
    studieforberedende: { Vg1: { type: 'standpunkt', kilde: grep('NAT01-05') } },
    yrkesfag: { Vg1: { type: 'standpunkt', kilde: grep('NAT01-05') } },
  },
  engelsk: {
    studieforberedende: { Vg1: { type: 'standpunkt', kilde: grep('ENG01-06') } },
    yrkesfag: { Vg1: { type: 'standpunkt', kilde: grep('ENG01-06') } },
  },
  fremmedsprak: {
    studieforberedende: { Vg1: { type: 'halvar', kilde: HALVAR }, Vg2: { type: 'standpunkt', kilde: grep('FSP01-04') } },
  },
  samfunnskunnskap: {
    studieforberedende: { Vg1: { type: 'standpunkt', kilde: grep('SAK01-01') }, Vg2: { type: 'standpunkt', kilde: grep('SAK01-01') } },
    yrkesfag: { Vg2: { type: 'standpunkt', kilde: grep('SAK01-01') } },
  },
  geografi: {
    studieforberedende: { Vg1: { type: 'standpunkt', kilde: grep('GEO01-02') }, Vg2: { type: 'standpunkt', kilde: grep('GEO01-02') } },
  },
  historie: {
    studieforberedende: { Vg2: { type: 'halvar', kilde: HALVAR } },
  },
  kroppsoving: {
    studieforberedende: { Vg1: { type: 'halvar', kilde: HALVAR }, Vg2: { type: 'halvar', kilde: HALVAR } },
    yrkesfag: { Vg1: { type: 'halvar', kilde: HALVAR }, Vg2: { type: 'standpunkt', kilde: grep('KRO01-06') } },
  },
  yff: {
    yrkesfag: { Vg1: { type: 'standpunkt', kilde: grep('YFF4101') }, Vg2: { type: 'standpunkt', kilde: grep('YFF4201') } },
  },
};

/** Linjene i tabellene i Udir-1 som er fellesfag. Andre linjer (summer, samisk, tegnspråk, programfag) er ikke med. */
const LINJER: readonly [RegExp, Fellesfag][] = [
  [/^norsk(\/|$)/i, 'norsk'],
  [/^matematikk$/i, 'matematikk'],
  [/^naturfag$/i, 'naturfag'],
  [/^engelsk$/i, 'engelsk'],
  [/^fremmedspråk$/i, 'fremmedsprak'],
  [/^samfunnskunnskap$/i, 'samfunnskunnskap'],
  [/^geografi$/i, 'geografi'],
  [/^historie$/i, 'historie'],
  [/^kroppsøving$/i, 'kroppsoving'],
  [/^yrkesfaglig fordypning$/i, 'yff'],
];

/** En rad i kalkulatoren: et fellesfag (navnet står i strings) eller et programfag med navnet fra Udir-1. */
export interface Lopsrad {
  fag: Fellesfag | null;
  /** Navnet på programfaget slik det står i Udir-1 (kildetekst, på bokmål). */
  programfag: string | null;
  type: Karaktertype;
  kilde: KildeRef | null;
}

function fordeling(f: Fagfordeling, tabell: string, trinn: Trinn): Fordelingstabell | undefined {
  return f.tabeller.find((t): t is Fordelingstabell => t.type === 'fordeling' && t.nr === tabell && t.omfang.toLowerCase() === trinn.toLowerCase());
}

function fagliste(f: Fagfordeling, tabell: string): Fagliste | undefined {
  return f.tabeller.find((t): t is Fagliste => t.type === 'fagliste' && t.nr === tabell);
}

/** Programområdene på Vg2 i et yrkesfaglig utdanningsprogram (gruppene i tabell 19), til valget av løp til Vg3. */
export function programomraderVg2(f: Fagfordeling, kode: string): string[] {
  const p = UTDANNINGSPROGRAM.find((x) => x.kode === kode);
  const liste = p?.programfagVg2 ? fagliste(f, p.programfagVg2) : undefined;
  return [...new Set((liste?.rader ?? []).map((r) => r.gruppe))];
}

/**
 * Radene for et løp: fellesfagene med timer i den ordinære kolonnen på trinnet, med typen fra TYPER, og de felles
 * programfagene på yrkesfag (Vg1: tabell 18, Vg2: tabell 19 for programområdet). Studieforberedende programfag
 * varierer fra elev til elev og legges inn på tomme rader.
 */
export function lopsrader(f: Fagfordeling, kode: string, trinn: Trinn, programomrade: string | null = null): Lopsrad[] {
  const p = UTDANNINGSPROGRAM.find((x) => x.kode === kode);
  if (!p) return [];
  const t = fordeling(f, p.tabell, trinn);
  const rader: Lopsrad[] = [];
  for (const linje of t?.rader ?? []) {
    if (linje.timer[0] === null || linje.timer[0] === undefined) continue;
    const fag = LINJER.find(([m]) => m.test(linje.linje.trim()))?.[1];
    const type = fag ? TYPER[fag][p.retning]?.[trinn] : undefined;
    if (fag && type) rader.push({ fag, programfag: null, type: type.type, kilde: type.kilde });
  }
  if (p.retning === 'yrkesfag') {
    const liste = trinn === 'Vg1' ? fagliste(f, '18') : p.programfagVg2 ? fagliste(f, p.programfagVg2) : undefined;
    const gruppe = trinn === 'Vg1' ? p.programfagVg1 : programomrade;
    const programfag = (liste?.rader ?? []).filter((r) => r.gruppe === gruppe).map((r) => r.fag);
    // Felles programfag i yrkesfag har standpunkt hvert år (vurderingsordningen i Grep, f.eks. HSF1006).
    const forYff = rader.findIndex((r) => r.fag === 'yff');
    const nye = programfag.map((navn): Lopsrad => ({ fag: null, programfag: navn, type: 'standpunkt', kilde: grep('felles programfag') }));
    rader.splice(forYff < 0 ? rader.length : forYff, 0, ...nye);
  }
  return rader;
}
