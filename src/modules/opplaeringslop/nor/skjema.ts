// Skjema for opplæringskontorene fra Nasjonalt organisasjonsregister for fag- og yrkesopplæring (NOR, Udir), i
// data/udir/opplaeringskontor.json (avgjørelse 053). Brukes av scripts/hent-nor.ts før filen skrives, og av testene.
import { z } from 'zod';

const fylkenr = z.string().regex(/^\d{2}$/);

export const opplaeringskontorSkjema = z
  .object({
    orgnr: z.string().regex(/^\d{9}$/),
    navn: z.string().min(1),
    /** Fylket og kommunen kontoret holder til i. */
    fylke: fylkenr,
    kommune: z.string().min(1),
    /** Nettsiden slik NOR oppgir den, med https:// foran. */
    nettside: z.string().url().nullable(),
    laerlinger: z.number().int().nonnegative().nullable(),
    /** Fylkene der kontoret er godkjent (relasjonen «Godkjent i fylker struktur» i NOR). */
    godkjentI: z.array(fylkenr).min(1),
  })
  .strict();

export const opplaeringskontorerSkjema = z
  .object({
    kilde: z.literal('udir-nor'),
    hentet: z.string(),
    lisens: z.literal('NLOD'),
    kontor: z.array(opplaeringskontorSkjema),
  })
  .strict();

export type Opplaeringskontor = z.infer<typeof opplaeringskontorSkjema>;
export type Opplaeringskontorer = z.infer<typeof opplaeringskontorerSkjema>;
