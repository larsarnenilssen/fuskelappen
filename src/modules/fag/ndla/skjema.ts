// Skjema for koblingen fra fagkode til faget på NDLA, i data/ndla/fag.json (avgjørelse 053). Brukes av
// scripts/hent-ndla.ts før filen skrives, og av testene. Appen bruker bare typene.
import { z } from 'zod';

export const ndlafagSkjema = z
  .object({
    navn: z.object({ nb: z.string().min(1), nn: z.string().min(1) }).strict(),
    /** Stien på ndla.no, f.eks. /f/samfunnskunnskap/052a2450e5cf. */
    sti: z.string().regex(/^\/f\/[^\s]+$/),
  })
  .strict();

export const ndlaSkjema = z
  .object({
    kilde: z.literal('ndla'),
    hentet: z.string(),
    lisens: z.literal('CC BY 4.0'),
    /** Fagkode i Grep → fagene på NDLA som oppgir koden. */
    fag: z.record(z.string().regex(/^[A-Z]{3}[A-Z0-9]{2}\d{2}$/), z.array(ndlafagSkjema).min(1)),
  })
  .strict();

export type Ndlafag = z.infer<typeof ndlafagSkjema>;
export type Ndla = z.infer<typeof ndlaSkjema>;
