// Fagene til dagens jukselapp (avgjørelse 085): navnet, årstimene og årsrammen i SFS 2213 vedlegg 1 for fagene som
// kobles til én årsramme. Lages når appen bygges (virtual:jukselappfag), så forsiden ikke må laste hele fagindeksen.
// Ren funksjon, så den kan testes.
import type { Oppslag } from '../../core/regler/motor.ts';
import type { Regelsett } from '../../core/regler/skjema.ts';
import { lesArsrammer } from '../arbeidstid/beregning/arsrammer.ts';
import { finnKobling, lesKoblinger } from '../arbeidstid/beregning/kobling.ts';
import type { Fagindeks } from './skjema.ts';

/** Fagkoden, navnet på bokmål og nynorsk, årstimene, og årsrammen i 60- og 45-minutters enheter. */
export type Jukselappfag = [kode: string, nb: string, nn: string, timer: number, t60: number, t45: number];

/** Regelsettet for SFS 2213 som gjelder på datoen, ellers det nyeste. */
function sfs2213(regelsett: readonly Regelsett[], dato: string): Regelsett | null {
  const sfs = regelsett.filter((r) => r.regelverk === 'sfs2213').sort((a, b) => a.gyldig_fra.localeCompare(b.gyldig_fra));
  return sfs.find((r) => r.gyldig_fra <= dato && (!r.gyldig_til || dato <= r.gyldig_til)) ?? sfs.at(-1) ?? null;
}

export function byggJukselappfag(indeks: Pick<Fagindeks, 'fag' | 'programomrader'>, regelsett: readonly Regelsett[], dato: string): Jukselappfag[] {
  const r = sfs2213(regelsett, dato);
  if (!r) return [];
  const hent = (nokkel: string) => ({ verdi: r.verdier[nokkel.replace(/^sfs2213\./, '')]?.verdi }) as Oppslag;
  const tabeller = lesKoblinger(hent);
  const rader = lesArsrammer(hent('sfs2213.arsrammer'));
  const ut: Jukselappfag[] = [];
  for (const [kode, fag] of Object.entries(indeks.fag).sort(([a], [b]) => a.localeCompare(b))) {
    if (typeof fag.timer !== 'number' || fag.timer <= 0) continue;
    const k = finnKobling(kode, indeks, tabeller, rader);
    if (k.status !== 'koblet') continue;
    ut.push([kode, fag.navn.nb, fag.navn.nn, fag.timer, k.kandidat.rad.t60, k.kandidat.rad.t45]);
  }
  return ut;
}
