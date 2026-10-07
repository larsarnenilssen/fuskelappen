// Lesing av tabellene fra Udirs statistikkbank (rapport-API-et bak statistikkbanken på udir.no, avgjørelse 080).
// Rene funksjoner, testet i tests/unit/statistikk.test.ts.
//
// - CSV-en er UTF-16, tabulatordelt, med en linje «sep=» først. Tallene har mellomrom som tusenskille og desimalkomma.
//   Skjermede tall er «*», og tomme celler eller «-» er tall som mangler.
// - Kolonnene foran tallene sier hvilken enhet raden gjelder: landet, et fylke eller en skole (organisasjonsnummer).
//   Navnene varierer litt fra tabell til tabell (Fylkekode, Avgiver_Fylkekode, EnhetNivaa, FylkeNivaa …).
// - Tallkolonnene heter f.eks. «2026.Skole.Alle kjønn.….Antall søkere»: én del per filterverdi, skilt med punktum.
import type { Verdi } from '../../src/core/statistikk/skjema.ts';

export interface Tabell {
  kolonner: string[];
  rader: string[][];
}

/** CSV fra statistikkbanken som tabell. Linjen «sep=» og tomme linjer hoppes over. */
export function lesCsv(tekst: string): Tabell {
  const linjer = tekst
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((l) => l.trim() !== '' && !l.startsWith('sep='));
  const [hode, ...resten] = linjer;
  if (!hode) throw new Error('Tom tabell fra statistikkbanken.');
  return { kolonner: hode.split('\t').map((k) => k.trim()), rader: resten.map((l) => l.split('\t').map((c) => c.trim())) };
}

/** «193 809» → 193809, «81,8» → 81.8, «*» → «*», tomt eller «-» → null. */
export function tall(celle: string | undefined): Verdi {
  const s = (celle ?? '').replace(/\s/g, '');
  if (s === '*') return '*';
  if (s === '' || s === '-' || s === '.') return null;
  const n = Number(s.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

/** Indeksen til tallkolonnen som har alle delene (f.eks. «2026», «Skole» og «Antall søkere»), eller -1. */
export function kolonne(t: Tabell, ...deler: string[]): number {
  return t.kolonner.findIndex((k) => {
    const d = k.split('.').map((x) => x.trim());
    return d.length > 1 && deler.every((x) => d.includes(x));
  });
}

/**
 * Fylkene før 2020 (kodene i Udirs tabeller for kullene som startet før 2020) og dagens fylke de er en del av. Oslo,
 * Rogaland, Møre og Romsdal, Nordland og Trøndelag har samme kode.
 */
export const GAMLE_FYLKER: Readonly<Record<string, string>> = {
  '01': '31',
  '02': '32',
  '03': '03',
  '04': '34',
  '05': '34',
  '06': '33',
  '07': '39',
  '08': '40',
  '09': '42',
  '10': '42',
  '11': '11',
  '12': '46',
  '14': '46',
  '15': '15',
  '18': '18',
  '19': '55',
  '20': '56',
  '50': '50',
};

/** Hvilken kolonne som har nivået, fylkeskoden, organisasjonsnummeret og navnet i tabellen. */
function nokkelkolonner(t: Tabell) {
  const finn = (...navn: string[]) => t.kolonner.findIndex((k) => navn.includes(k));
  return {
    fylke: finn('Fylkekode', 'Avgiver_Fylkekode'),
    orgnr: finn('Organisasjonsnummer'),
    navn: finn('EnhetNavn'),
    fylkenavn: finn('Fylke', 'Fylkenavn', 'Avgiver_Fylkenavn'),
  };
}

export interface Enhetsrad {
  /** «L», «F46» eller «S974557584». */
  enhet: string;
  fylke: string | null;
  navn: string;
  celler: string[];
}

/**
 * Radene med enheten de gjelder. En rad med organisasjonsnummer er en skole, ellers et fylke eller landet. Rader for
 * ukjent fylke og summer for flere skoler («Alle skoler» er fylket) hoppes over.
 */
export function enhetsrader(t: Tabell): Enhetsrad[] {
  const k = nokkelkolonner(t);
  if (k.fylke < 0) throw new Error(`Tabellen fra statistikkbanken mangler fylkeskoden: ${t.kolonner.slice(0, 8).join(', ')}`);
  const ut: Enhetsrad[] = [];
  for (const r of t.rader) {
    const fylke = r[k.fylke] ?? '';
    const orgnr = k.orgnr >= 0 ? (r[k.orgnr] ?? '') : '';
    if (/^\d{9}$/.test(orgnr)) {
      ut.push({ enhet: `S${orgnr}`, fylke: /^\d{2}$/.test(fylke) ? fylke : null, navn: (r[k.navn] ?? orgnr).trim(), celler: r });
    } else if (fylke === 'I' || fylke === '00') {
      ut.push({ enhet: 'L', fylke: null, navn: 'Hele landet', celler: r });
    } else if (/^\d{2}$/.test(fylke)) {
      // Fylkesnavnet kan ha samisk eller kvensk navn etter en strek, f.eks. «Nordland - Nordlánnda».
      const navn = (r[k.fylkenavn] ?? fylke).split(' - ')[0]?.trim() ?? fylke;
      ut.push({ enhet: `F${fylke}`, fylke, navn, celler: r });
    }
  }
  return ut;
}

/** Tallene i kolonnene, per enhet: enhet → verdi per kolonne. Mangler en kolonne, er verdien null. */
export function verdierPerEnhet(rader: readonly Enhetsrad[], kolonner: readonly number[]): Record<string, Verdi[]> {
  const ut: Record<string, Verdi[]> = {};
  for (const r of rader) ut[r.enhet] = kolonner.map((i) => (i >= 0 ? tall(r.celler[i]) : null));
  return ut;
}

/**
 * Andelen for dagens fylker regnet ut fra tellerne og nevnerne for fylkene før 2020 (GAMLE_FYLKER), i prosent med én
 * desimal. Er et tall skjermet eller mangler, blir andelen null for fylket.
 */
export function regnOmTilNyeFylker(gamle: Readonly<Record<string, { teller: Verdi; nevner: Verdi }>>): Record<string, Verdi> {
  const sum: Record<string, { teller: number; nevner: number; ufullstendig: boolean }> = {};
  for (const [kode, { teller, nevner }] of Object.entries(gamle)) {
    const ny = GAMLE_FYLKER[kode];
    if (!ny) continue;
    const s = (sum[ny] ??= { teller: 0, nevner: 0, ufullstendig: false });
    if (typeof teller === 'number' && typeof nevner === 'number') {
      s.teller += teller;
      s.nevner += nevner;
    } else s.ufullstendig = true;
  }
  const ut: Record<string, Verdi> = {};
  for (const [ny, s] of Object.entries(sum)) ut[`F${ny}`] = s.ufullstendig || s.nevner === 0 ? null : Math.round((s.teller / s.nevner) * 1000) / 10;
  return ut;
}
