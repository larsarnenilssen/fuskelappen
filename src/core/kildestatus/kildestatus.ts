// Kildestatus: lest fra data/status/kildestatus.json, som kildejobben skriver hver uke.
import * as z from 'zod/mini';

export const UTDATERT_ETTER_DAGER = 14;

export const kildestatusPost = z.strictObject({
  status: z.enum(['ok', 'endret', 'feilet']),
  sjekket: z.string(),
  fingeravtrykk: z.nullable(z.string()),
  endret_siden: z.nullable(z.string()),
  melding: z.nullable(z.string()),
});

export const kildestatusFil = z.strictObject({
  skjema: z.literal(1),
  kjort: z.string(),
  kilder: z.record(z.string(), kildestatusPost),
});

export type KildestatusPost = z.infer<typeof kildestatusPost>;
export type Kildestatusfil = z.infer<typeof kildestatusFil>;
export type SamletStatus = 'ok' | 'endret' | 'feilet' | 'utdatert' | 'ukjent';
export type Visningsstatus = SamletStatus | 'skjult';

export function lesKildestatus(data: unknown): Kildestatusfil | null {
  const r = kildestatusFil.safeParse(data);
  return r.success ? r.data : null;
}

export function erUtdatert(kjort: string, naa: Date): boolean {
  const tid = Date.parse(kjort);
  if (Number.isNaN(tid)) return true;
  return naa.getTime() - tid > UTDATERT_ETTER_DAGER * 24 * 60 * 60 * 1000;
}

/**
 * Samlet status for indikatoren. «utdatert» når siste kjøring er eldre enn
 * 14 dager – det fanger også en jobb som har stoppet.
 */
export function samletStatus(fil: Kildestatusfil | null, naa: Date): SamletStatus {
  if (!fil) return 'ukjent';
  if (erUtdatert(fil.kjort, naa)) return 'utdatert';
  const statuser = Object.values(fil.kilder).map((k) => k.status);
  if (statuser.includes('feilet')) return 'feilet';
  if (statuser.includes('endret')) return 'endret';
  return 'ok';
}

/** Nøkkel for et varsel som kan skjules. Nytt varsel (ny kjøring eller ny status) vises igjen. */
export function varselnokkel(fil: Kildestatusfil | null, samlet: SamletStatus): string | null {
  if (!fil || samlet === 'ok' || samlet === 'ukjent') return null;
  return `${fil.kjort}|${samlet}`;
}

/** Status for indikatoren, der et varsel brukeren har skjult vises som «skjult». */
export function visningsstatus(fil: Kildestatusfil | null, naa: Date, skjult: string | null): Visningsstatus {
  const samlet = samletStatus(fil, naa);
  const nokkel = varselnokkel(fil, samlet);
  return nokkel !== null && nokkel === skjult ? 'skjult' : samlet;
}

export interface Kildesjekkplan {
  /** 0 = søndag, 1 = mandag … (UTC) */
  ukedag: number;
  time: number;
  minutt: number;
}

/** Neste planlagte kjøring av kildesjekken etter tidspunktet naa. */
export function nesteKildesjekk(naa: Date, plan: Kildesjekkplan): Date {
  const kandidat = new Date(Date.UTC(naa.getUTCFullYear(), naa.getUTCMonth(), naa.getUTCDate(), plan.time, plan.minutt));
  const dager = (plan.ukedag - kandidat.getUTCDay() + 7) % 7;
  kandidat.setUTCDate(kandidat.getUTCDate() + dager);
  if (kandidat.getTime() <= naa.getTime()) kandidat.setUTCDate(kandidat.getUTCDate() + 7);
  return kandidat;
}
