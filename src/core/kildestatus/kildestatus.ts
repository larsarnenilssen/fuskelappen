// Kildestatus: lest fra data/status/kildestatus.json, som kildejobben skriver hver uke.
import * as z from 'zod/mini';

export const UTDATERT_ETTER_DAGER = 14;
/** Så lenge vises en kilde som «endret» i appen etter at innholdet ble endret (eier 08.10.2026, avgjørelse 089). */
export const ENDRET_NYLIG_DAGER = 30;

/**
 * Statusen for én kilde (avgjørelse 089):
 * - `status`: «feilet» når kilden har feilet to sjekker på rad, «endret» når innholdet er endret siden grunnlaget
 *   (eier har ikke gått gjennom det ennå), ellers «ok». «endret» vises ikke i appen, bare i kontrollsaken.
 * - `endret_siden`: når innholdet sist ble endret. Appen viser «Endret …» i 30 dager.
 * Grunnlaget og antall feil på rad står i data/status/kildegrunnlag.json, som appen ikke leser. Formatet her er det
 * samme som før, så versjonen som er publisert, kan lese en fersk statusfil.
 */
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
/**
 * Samlet status i appen (avgjørelse 089): om kildene svarer, og om sjekken er fersk. Om eier har godkjent eller gått
 * gjennom kildene, vises ikke i appen.
 */
export type SamletStatus = 'ok' | 'feilet' | 'utdatert' | 'ukjent';
/** Statusen for én kilde i appen: virker, endret de siste 30 dagene, eller svarer ikke. */
export type Kildevisning = 'virker' | 'endretNylig' | 'svarerIkke';
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

/** Om innholdet i kilden ble endret de siste 30 dagene. */
export function erEndretNylig(post: KildestatusPost, naa: Date): boolean {
  const tid = post.endret_siden === null ? Number.NaN : Date.parse(post.endret_siden);
  return !Number.isNaN(tid) && naa.getTime() - tid <= ENDRET_NYLIG_DAGER * 24 * 60 * 60 * 1000;
}

/** Statusen for én kilde i appen. «feilet» betyr at kilden har feilet to sjekker på rad (avgjørelse 089). */
export function kildevisning(post: KildestatusPost, naa: Date): Kildevisning {
  if (post.status === 'feilet') return 'svarerIkke';
  return erEndretNylig(post, naa) ? 'endretNylig' : 'virker';
}

/** Antall kilder som virker, er endret nylig og ikke svarer. */
export function tellKilder(fil: Kildestatusfil, naa: Date): Record<Kildevisning, number> {
  const antall: Record<Kildevisning, number> = { virker: 0, endretNylig: 0, svarerIkke: 0 };
  for (const post of Object.values(fil.kilder)) antall[kildevisning(post, naa)] += 1;
  return antall;
}

/**
 * Samlet status for indikatoren. «utdatert» når siste kjøring er eldre enn
 * 14 dager – det fanger også en jobb som har stoppet. En kilde som er endret, er ikke et varsel i appen.
 */
export function samletStatus(fil: Kildestatusfil | null, naa: Date): SamletStatus {
  if (!fil) return 'ukjent';
  if (erUtdatert(fil.kjort, naa)) return 'utdatert';
  return Object.values(fil.kilder).some((k) => k.status === 'feilet') ? 'feilet' : 'ok';
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
