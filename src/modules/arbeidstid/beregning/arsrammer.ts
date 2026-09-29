// Årsrammer fra vedlegg 1 til SFS 2213 og valg av årsramme for en gruppe.
import { Regelfeil, somTabell } from '../../../core/regler/motor.ts';
import type { Oppslag } from '../../../core/regler/motor.ts';
import type { Tabellrad } from '../../../core/regler/skjema.ts';
import type { Hent, Operand, Trinn } from './typer.ts';
import { inndata, regel, trinn } from './verdier.ts';

export interface Arsrammerad {
  nr: number;
  t60: number;
  t45: number;
  kategori: string;
  fag: string | null;
  program: string;
  trinn: string;
  stjerne: boolean;
}

function erRad(r: Tabellrad): boolean {
  return (
    typeof r.nr === 'number' &&
    typeof r.t60 === 'number' &&
    typeof r.t45 === 'number' &&
    typeof r.kategori === 'string' &&
    (typeof r.fag === 'string' || r.fag === null) &&
    typeof r.program === 'string' &&
    typeof r.trinn === 'string' &&
    typeof r.stjerne === 'boolean'
  );
}

/** Leser tabellen «sfs2213.arsrammer» og sjekker at hver rad har riktig form. */
export function lesArsrammer(oppslag: Oppslag): Arsrammerad[] {
  const rader = somTabell(oppslag, 'sfs2213.arsrammer');
  const feil = rader.find((r) => !erRad(r));
  if (feil) throw new Regelfeil(`Ugyldig rad i sfs2213.arsrammer: ${JSON.stringify(feil)}`);
  return rader as unknown as Arsrammerad[];
}

/** Årstimetallet for elevene i faget på en rad i vedlegg 1, med fagkodene i Grep tallet kommer fra. */
export interface Arstimerad {
  arstimer: number;
  fagkoder: string[];
}

/**
 * Leser tabellen «sfs2213.arstimer» (radnummer i vedlegg 1 → årstimer). Brukes til å fylle inn årstimer
 * når brukeren velger et fag. Rader uten kjent årstimetall er ikke med.
 */
export function lesArstimer(hent: Hent): Map<number, Arstimerad> {
  const ut = new Map<number, Arstimerad>();
  for (const r of somTabell(hent('sfs2213.arstimer'), 'sfs2213.arstimer')) {
    const koder = Array.isArray(r.fagkoder) ? r.fagkoder.map(String) : [];
    if (typeof r.nr !== 'number' || typeof r.arstimer !== 'number') throw new Regelfeil(`Ugyldig rad i sfs2213.arstimer: ${JSON.stringify(r)}`);
    ut.set(r.nr, { arstimer: r.arstimer, fagkoder: koder });
  }
  return ut;
}

/** Kort beskrivelse av raden, slik vedlegget angir den: «Engelsk – Stud.spes Vg1». */
export function radNavn(r: Arsrammerad): string {
  return `${r.fag ?? r.kategori} – ${r.program} ${r.trinn}`;
}

export function finnRad(
  rader: readonly Arsrammerad[],
  sok: { fag: string | null; program: string; trinn: string },
): Arsrammerad | undefined {
  return rader.find((r) => r.fag === sok.fag && r.program === sok.program && r.trinn === sok.trinn);
}

/**
 * Årsramme valgt fra vedlegg 1 (en rad, eller et nivå som 525/700 uten bestemt fag)
 * eller skrevet inn av brukeren (60-minutters enheter).
 */
export type Arsrammevalg =
  | { type: 'rad'; rad: Arsrammerad }
  | { type: 'niva'; t60: number; t45: number }
  | { type: 'manuell'; t60: number; stjerne: boolean };

function somOperand(valg: Arsrammevalg, tabell: Oppslag | undefined): Operand {
  if (valg.type === 'manuell') return inndata('arsramme', valg.t60, 'arsrammetimer');
  if (valg.type === 'niva') {
    return { navn: 'arsramme', verdi: valg.t60, enhet: 'arsrammetimer', opprinnelse: 'tabell', rad: `${valg.t60}/${valg.t45}`, ...(tabell ? { oppslag: tabell } : {}) };
  }
  return {
    navn: 'arsramme',
    verdi: valg.rad.t60,
    enhet: 'arsrammetimer',
    opprinnelse: 'tabell',
    rad: radNavn(valg.rad),
    ...(tabell ? { oppslag: tabell } : {}),
  };
}

function erStjerne(valg: Arsrammevalg): boolean {
  if (valg.type === 'niva') return false;
  return valg.type === 'rad' ? valg.rad.stjerne : valg.stjerne;
}

/**
 * Finner årsrammen for en gruppe:
 * - Har timen elever fra ulike program eller nivåer, brukes laveste årsramme (vedlegg 1).
 * - Fag merket * får årsrammen økt når det faktiske antallet elever i klassen er 1–15 (vedlegg 1).
 */
/**
 * Faktisk antall elever i klassen, eller svaret på «15 eller færre elever?» (true/false).
 * Trengs bare for fag merket * i vedlegg 1.
 */
export type Elevtall = number | boolean | null;

export function velgArsramme(
  hent: Hent,
  valg: readonly Arsrammevalg[],
  elever: Elevtall,
  gruppe?: number,
): { arsramme: Operand; trinn: Trinn[]; manglerElevtall: boolean } {
  if (valg.length === 0) throw new Regelfeil('Gruppen mangler årsramme');
  const tabell = valg.some((v) => v.type !== 'manuell') ? hent('sfs2213.arsrammer') : undefined;
  const operander = valg.map((v) => somOperand(v, tabell));
  const g = gruppe !== undefined ? { gruppe } : {};
  const utTrinn: Trinn[] = [];

  let indeks = 0;
  let arsramme = operander[0] as Operand;
  if (operander.length > 1) {
    operander.forEach((o, i) => {
      if (o.verdi < (operander[indeks] as Operand).verdi) indeks = i;
    });
    const laveste = operander[indeks] as Operand;
    const liste: Operand = { ...laveste, navn: 'arsrammer', liste: operander.map((o) => o.verdi) };
    const t = trinn('laveste_arsramme', { arsrammer: liste }, 'arsramme', 'arsrammetimer', laveste.verdi, g);
    utTrinn.push({ ...t, resultat: { ...laveste, navn: 'arsramme' } });
    arsramme = laveste;
  }

  const valgt = valg[indeks] as Arsrammevalg;
  let manglerElevtall = false;
  if (erStjerne(valgt)) {
    if (elever === null) {
      manglerElevtall = true;
    } else {
      const faa = typeof elever === 'boolean' ? elever : elever >= 1 && elever <= regel(hent, 'sfs2213.stjerne_maks_elever', 'elever', 'elever').verdi;
      if (faa) {
        const tillegg = regel(hent, 'sfs2213.stjernetillegg', 'stjernetillegg', 'arsrammetimer');
        const t = trinn('stjernetillegg', { arsramme, stjernetillegg: tillegg }, 'arsramme_justert', 'arsrammetimer', arsramme.verdi + tillegg.verdi, g);
        utTrinn.push(t);
        arsramme = t.resultat;
      }
    }
  }
  return { arsramme, trinn: utTrinn, manglerElevtall };
}
