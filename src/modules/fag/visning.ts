// Tekster for koder i fagdataene (fagtype, trinn, vurderingsordning). Kjente koder har egne tekster i
// src/strings/moduler/fag.*.ts. Ukjente koder (nye i Grep) vises med tittelen fra Grep.
import type { T } from '../../app/tilstand.ts';
import type { Malform, Tekstnokkel } from '../../core/i18n/tekst.ts';
import type { Fagindeks, Fagtype, Trinn } from './skjema.ts';

export function fagtypeTekst(t: T, type: Fagtype): string {
  return t(`fag.fagtype.${type}`);
}

export function trinnTekst(t: T, trinn: Trinn): string {
  return t(`fag.trinn.${trinn}`);
}

/**
 * Trinnet slik det vises for et programområde. Fag for studiekompetanse (PBPBY4) er Vg4 påbygging, men Grep oppgir
 * Vg3 (eier 01.10.2026, se finnTabell i tilbud/modell.ts).
 */
export function visningstrinnTekst(t: T, kode: string, trinn: Trinn): string {
  return kode.startsWith('PBPBY4') ? t('fag.trinn.Vg4') : trinnTekst(t, trinn);
}

export function programTekst(indeks: Fagindeks, program: string, malform: Malform): string {
  return indeks.utdanningsprogram[program]?.[malform] ?? program;
}

/** Tekst for en kode i vurderingsordningen, f.eks. trekkordning_2 → «Trekkfag til eksamen». */
export function koTekst(t: T, indeks: Fagindeks, gruppe: 'vurdering' | 'eksamensform' | 'eksamensordning' | 'uttrykk', kode: string): string {
  const nokkel = `fag.${gruppe}.${kode}` as Tekstnokkel;
  const tekst = t(nokkel);
  return tekst === nokkel ? (indeks.koder[kode] ?? kode) : tekst;
}
