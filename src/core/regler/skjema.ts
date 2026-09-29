// Skjema for regelsett under rules/. Se docs/INNHOLDSMODELL.md.
import { z } from 'zod';
import { gyldighetSkjema, idSkjema, isoDato, kontrollertSkjema } from '../innhold/skjema.ts';

export const regelverdiSkjema = z
  .object({
    verdi: z.union([z.number(), z.string(), z.boolean(), z.array(z.union([z.number(), z.string()]))]),
    enhet: z.string().optional(),
    kilde: z.object({ id: z.string().min(1), punkt: z.string().optional() }).strict(),
    kontrollert: kontrollertSkjema,
    merknad: z.string().optional(),
  })
  .strict();

export const regelsettSkjema = z
  .object({
    id: idSkjema,
    regelverk: idSkjema,
    gyldig_fra: isoDato,
    gyldig_til: isoDato,
    kilde: z.string().min(1),
    gyldighet: gyldighetSkjema.default({ niva: 'nasjonal' }),
    verdier: z.record(z.string().regex(/^[a-z0-9_]+$/), regelverdiSkjema),
  })
  .strict()
  .refine((r) => r.gyldig_fra <= r.gyldig_til, { message: 'gyldig_fra må være før gyldig_til' });

export type Regelverdi = z.infer<typeof regelverdiSkjema>;
export type Regelsett = z.infer<typeof regelsettSkjema>;
