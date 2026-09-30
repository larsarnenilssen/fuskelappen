// Skjema for regelsett under rules/. Se docs/INNHOLDSMODELL.md.
import { z } from 'zod';
import { gyldighetSkjema, idSkjema, isoDato, kontrollertSkjema } from '../innhold/skjema.ts';

const enkelVerdi = z.union([z.number(), z.string(), z.boolean()]);

/** En celle i en tabellverdi, f.eks. én rad i vedlegg 1 til SFS 2213. */
const tabellcelle = z.union([enkelVerdi, z.null(), z.array(z.union([z.number(), z.string()]))]);

export const tabellradSkjema = z.record(z.string().regex(/^[a-z0-9_]+$/), tabellcelle);

export const regelverdiSkjema = z
  .object({
    verdi: z.union([enkelVerdi, z.array(z.union([z.number(), z.string()])), z.array(tabellradSkjema)]),
    enhet: z.string().optional(),
    kilde: z.object({ id: z.string().min(1), punkt: z.string().optional() }).strict(),
    kontrollert: kontrollertSkjema,
    merknad: z.string().optional(),
    /**
     * Hva verdien bygger på når den ikke står i kilden. avledet: regnet ut fra andre verdier.
     * praksis: praksis eier har beskrevet. Uten grunnlag står verdien i kilden. Se docs/avgjorelser/017.
     */
    grunnlag: z.enum(['avledet', 'praksis']).optional(),
    /**
     * Kort, ordrett utdrag fra kilden der verdien står, med tallet slik kilden skriver det. Kildesjekken
     * ser hver uke etter utdraget i kilden (verdisjekken). Høyst 200 tegn: et sitat, ikke en kopi.
     */
    sitat: z.string().trim().min(1).max(200).optional(),
  })
  .strict();

export const regelsettSkjema = z
  .object({
    id: idSkjema,
    regelverk: idSkjema,
    /**
     * Et regelsett kan deles på flere filer med samme id, f.eks. årsrammene i egen fil.
     * Delene slås sammen ved lasting (slaaSammen i motor.ts). Uten del er filen hele regelsettet.
     */
    del: idSkjema.optional(),
    gyldig_fra: isoDato,
    gyldig_til: isoDato,
    kilde: z.string().min(1),
    gyldighet: gyldighetSkjema.default({ niva: 'nasjonal' }),
    verdier: z.record(z.string().regex(/^[a-z0-9_]+$/), regelverdiSkjema),
  })
  .strict()
  .refine((r) => r.gyldig_fra <= r.gyldig_til, { message: 'gyldig_fra må være før gyldig_til' });

export type Tabellrad = z.infer<typeof tabellradSkjema>;
export type Regelverdi = z.infer<typeof regelverdiSkjema>;
export type Regelsett = z.infer<typeof regelsettSkjema>;
