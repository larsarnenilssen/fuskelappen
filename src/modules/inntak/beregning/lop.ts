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
  /** Navnet i Grep. Tabellene i Udir-1 finnes med navnet i tittelen, ikke med tabellnummeret (avgjørelse 049). */
  navn: string;
}

/** Utdanningsprogrammene. Testene sjekker navnene mot Grep og at tabellene finnes i Udir-1. */
export const UTDANNINGSPROGRAM: readonly Utdanningsprogram[] = [
  { kode: 'ST', retning: 'studieforberedende', navn: 'Studiespesialisering' },
  { kode: 'ID', retning: 'studieforberedende', navn: 'Idrettsfag' },
  { kode: 'MD', retning: 'studieforberedende', navn: 'Musikk, dans og drama' },
  { kode: 'KD', retning: 'studieforberedende', navn: 'Kunst, design og arkitektur' },
  { kode: 'ME', retning: 'studieforberedende', navn: 'Medier og kommunikasjon' },
  { kode: 'BA', retning: 'yrkesfag', navn: 'Bygg- og anleggsteknikk' },
  { kode: 'EL', retning: 'yrkesfag', navn: 'Elektro og datateknologi' },
  { kode: 'FD', retning: 'yrkesfag', navn: 'Frisør, blomster, interiør og eksponeringsdesign' },
  { kode: 'HS', retning: 'yrkesfag', navn: 'Helse- og oppvekstfag' },
  { kode: 'DT', retning: 'yrkesfag', navn: 'Håndverk, design og produktutvikling' },
  { kode: 'IM', retning: 'yrkesfag', navn: 'Informasjonsteknologi og medieproduksjon' },
  { kode: 'NA', retning: 'yrkesfag', navn: 'Naturbruk' },
  { kode: 'RM', retning: 'yrkesfag', navn: 'Restaurant- og matfag' },
  { kode: 'SR', retning: 'yrkesfag', navn: 'Salg, service og reiseliv' },
  { kode: 'TP', retning: 'yrkesfag', navn: 'Teknologi- og industrifag' },
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

/** Små bokstaver uten bindestrek foran «og», så «Teknologi- og industrifag» og «Teknologi og industrifag» er like. */
const norm = (s: string) => s.toLowerCase().replace(/-(?=\s)/g, '').replace(/\s+/g, ' ').trim();

/** Fag- og timefordelingen for programmet på trinnet, funnet med tittelen på tabellen i Udir-1. */
function fordeling(f: Fagfordeling, p: Utdanningsprogram, trinn: Trinn): Fordelingstabell | undefined {
  const tittel = p.retning === 'studieforberedende' ? `utdanningsprogram for ${norm(p.navn)}` : 'på vg1 og vg2 i yrkesfaglige utdanningsprogram';
  return f.tabeller.find((t): t is Fordelingstabell => t.type === 'fordeling' && norm(t.tittel).includes(tittel) && norm(t.omfang) === norm(trinn));
}

/** Felles programfag i yrkesfaglige program: på Vg1 én tabell for alle, på Vg2 én tabell per program. */
function programfag(f: Fagfordeling, p: Utdanningsprogram, trinn: Trinn): Fagliste | undefined {
  const tittel = trinn === 'Vg1' ? 'felles programfag på vg1 i yrkesfaglige utdanningsprogram' : `felles programfag på vg2 ${norm(p.navn)}`;
  return f.tabeller.find((t): t is Fagliste => t.type === 'fagliste' && norm(t.tittel).endsWith(tittel));
}

/** Programområdene på Vg2 i et yrkesfaglig utdanningsprogram (gruppene i tabellen over felles programfag), til valget av løp til Vg3. */
export function programomraderVg2(f: Fagfordeling, kode: string): string[] {
  const p = UTDANNINGSPROGRAM.find((x) => x.kode === kode);
  const liste = p?.retning === 'yrkesfag' ? programfag(f, p, 'Vg2') : undefined;
  return [...new Set((liste?.rader ?? []).map((r) => r.gruppe))];
}

/**
 * Radene for et løp: fellesfagene med timer i den ordinære kolonnen på trinnet, med typen fra TYPER, og de felles
 * programfagene på yrkesfag (Vg1: gruppen for programmet, Vg2: gruppen for programområdet). Studieforberedende programfag
 * varierer fra elev til elev og legges inn på tomme rader.
 */
export function lopsrader(f: Fagfordeling, kode: string, trinn: Trinn, programomrade: string | null = null): Lopsrad[] {
  const p = UTDANNINGSPROGRAM.find((x) => x.kode === kode);
  if (!p) return [];
  const t = fordeling(f, p, trinn);
  const rader: Lopsrad[] = [];
  for (const linje of t?.rader ?? []) {
    if (linje.timer[0] === null || linje.timer[0] === undefined) continue;
    const fag = LINJER.find(([m]) => m.test(linje.linje.trim()))?.[1];
    const type = fag ? TYPER[fag][p.retning]?.[trinn] : undefined;
    if (fag && type) rader.push({ fag, programfag: null, type: type.type, kilde: type.kilde });
  }
  if (p.retning === 'yrkesfag') {
    const gruppe = trinn === 'Vg1' ? norm(p.navn) : programomrade === null ? null : norm(programomrade);
    const navn = (programfag(f, p, trinn)?.rader ?? []).filter((r) => norm(r.gruppe) === gruppe).map((r) => r.fag);
    // Felles programfag i yrkesfag har standpunkt hvert år (vurderingsordningen i Grep, f.eks. HSF1006).
    const forYff = rader.findIndex((r) => r.fag === 'yff');
    const nye = navn.map((n): Lopsrad => ({ fag: null, programfag: n, type: 'standpunkt', kilde: grep('felles programfag') }));
    rader.splice(forYff < 0 ? rader.length : forYff, 0, ...nye);
  }
  return rader;
}
