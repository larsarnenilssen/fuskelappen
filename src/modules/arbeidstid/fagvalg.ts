// Fagvalg med fagkode i kalkulatorene (fase 2, avgjørelse 023): hvordan et fag valgt fra Grep blir et valg av
// årsramme i skjemaet, og hvordan årsrammen ble funnet. Rene funksjoner.
import type { Koblingsresultat } from './beregning/index.ts';

/**
 * Et fag valgt med fagkode fra Grep (fase 2). Koblingen gir raden i vedlegg 1 (nr) og metoden. Er koblingen
 * flertydig, står kandidatene her til brukeren har valgt program og trinn. Velger brukeren en annen rad eller
 * skriver årsrammen selv, er årsrammen overstyrt (metoden blir «manuell»), og det merkes.
 */
export interface Grepfag {
  kode: string;
  navn: { nb: string; nn: string };
  /** Årstimetallet i Grep (omfang-totalt), eller null. */
  timer: number | null;
  /** Raden koblingen ga, eller null når faget ikke er koblet eller program og trinn ikke er valgt. */
  nr: number | null;
  metode: 'eksplisitt' | 'regel' | null;
  kandidater: { nr: number; program: string; trinn: string; t60: number; t45: number; metode: 'eksplisitt' | 'regel' }[];
  /** Sann mens brukeren velger årsramme selv (søk i vedlegg 1 eller egen årsramme). */
  overstyr?: boolean;
}

/** Ett valg av årsramme: en rad i vedlegg 1 (nr), «manuell», eller ikke valgt (''). */
export interface Arsrammeplass {
  valg: string;
  t60: number | null;
  stjerne: boolean;
  /** Fagkodene i Grep når brukeren søkte fram ett bestemt fag i raden (f.eks. HEA2005). */
  fagkoder?: string[] | null;
  /** Faget når det er valgt med fagkode (fase 2). */
  fag?: Grepfag | null;
}

/** Hvordan årsrammen for et fag valgt med fagkode ble funnet: fra koblingen, eller valgt av brukeren. */
export function koblingsmetode(plass: Arsrammeplass): 'eksplisitt' | 'regel' | 'manuell' | null {
  const fag = plass.fag;
  if (!fag || !plass.valg) return null;
  return fag.nr !== null && fag.metode !== null && plass.valg === String(fag.nr) ? fag.metode : 'manuell';
}

/** Gjør koblingen for en fagkode om til et valg i skjemaet. */
export function fagvalgFraKobling(kode: string, navn: { nb: string; nn: string }, timer: number | null, r: Koblingsresultat): Arsrammeplass {
  const kandidater = r.kandidater.map((k) => ({ nr: k.rad.nr, program: k.program, trinn: k.trinn, t60: k.rad.t60, t45: k.rad.t45, metode: k.metode }));
  if (r.status === 'koblet') {
    const fag: Grepfag = { kode, navn, timer, nr: r.kandidat.rad.nr, metode: r.kandidat.metode, kandidater };
    return { valg: String(r.kandidat.rad.nr), t60: null, stjerne: false, fagkoder: [kode], fag };
  }
  return { valg: '', t60: null, stjerne: false, fagkoder: [kode], fag: { kode, navn, timer, nr: null, metode: null, kandidater } };
}
