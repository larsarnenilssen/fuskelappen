// Skjema for fag- og timefordelingen fra rundskrivet Udir-1 (data/udir/fagfordeling-<skoleår>.json).
// Hentes med npm run hent:udir (avgjørelse 024). Appen bruker bare typene.
import { z } from 'zod';

export const fordelingstabellSkjema = z
  .object({
    nr: z.string().regex(/^\d+[a-z]?$/),
    tittel: z.string().min(1),
    type: z.literal('fordeling'),
    /** Hva tabellen gjelder, slik rundskrivet skriver det: «Vg1», «Totalt over 3 år» … */
    omfang: z.string(),
    kolonner: z.array(z.object({ nr: z.number().int(), navn: z.string().min(1) }).strict()).min(1),
    rader: z.array(z.object({ linje: z.string().min(1), timer: z.array(z.number().nonnegative().nullable()) }).strict()).min(3),
  })
  .strict();

export const faglisteSkjema = z
  .object({
    nr: z.string().regex(/^\d+[a-z]?$/),
    tittel: z.string().min(1),
    type: z.literal('fagliste'),
    rader: z
      .array(
        z
          .object({
            /** Programområde, utdanningsprogram eller fagområde. */
            gruppe: z.string(),
            /** «Felles programfag», «Valgfrie programfag» eller null. */
            del: z.string().nullable(),
            fag: z.string().min(1),
            timer: z.number().nonnegative().nullable(),
          })
          .strict(),
      )
      .min(1),
  })
  .strict();

export const fagfordelingSkjema = z
  .object({
    kilde: z.literal('udir-fag-og-timefordeling'),
    /** Rundskrivet, f.eks. «Udir-1-2026». */
    rundskriv: z.string().regex(/^Udir-1-\d{4}$/),
    /** Skoleåret rundskrivet gjelder, f.eks. «2026-2027». */
    skolear: z.string().regex(/^\d{4}-\d{4}$/),
    hentet: z.string(),
    lisens: z.string(),
    /** Sidene tabellene er hentet fra. */
    sider: z.array(z.string().url()),
    tabeller: z.array(z.discriminatedUnion('type', [fordelingstabellSkjema, faglisteSkjema])),
    /** Summer som ikke stemmer i rundskrivets egne tabeller. Vises i rapporten. */
    merknader: z.array(z.string()),
  })
  .strict();

export type Fordelingstabell = z.infer<typeof fordelingstabellSkjema>;
export type Fagliste = z.infer<typeof faglisteSkjema>;
export type Fagfordeling = z.infer<typeof fagfordelingSkjema>;
