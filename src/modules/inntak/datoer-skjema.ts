// Skjema for inntaksdatoene i data/inntak/datoer.json (fase 6, pakke 5): svar, svarfrist og andre inntak per fylke og
// inntaksår, hentet hver uke fra fylkenes sider (scripts/hent-inntak.ts). Datoene er fylkets egne og oftest
// omtrentlige, og vises bare når fylket er valgt. Brukes av skriptet før filen skrives, av appen og av testene.
import { z } from 'zod';

const iso = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const fylkenr = z.string().regex(/^\d{2}$/);

export const inntaksfelt = [
  'fortrinnsinntak',
  'svarfrist-fortrinn',
  'forste-inntak',
  'svarfrist-forste',
  'andre-inntak',
  'svarfrist-andre',
  'tredje-inntak',
  'svarfrist-tredje',
  'skolene-overtar',
] as const;

/** Én dato: dagen, perioden eller ukene, og teksten den er lest fra. */
export const inntaksdatoSkjema = z
  .object({
    /** Dagen, eller mandagen i den første uken. Mangler bare når fristen regnes fra noe annet (`relativ`). */
    fra: iso.optional(),
    /** Slutten av perioden, eller fredagen i den siste uken. */
    til: iso.optional(),
    /** Ukene, f.eks. «28–29» eller «32». */
    uke: z.string().regex(/^\d{1,2}(–\d{1,2})?$/).optional(),
    /** Datoen er omtrentlig («ca. 8. juli», «senest 10. juli»). */
    omtrent: z.boolean().optional(),
    /** En frist som regnes fra noe annet, f.eks. «5 dager etter at 1. inntak er klart». */
    relativ: z.string().min(1).optional(),
    /** Et kort utdrag fra siden. */
    tekst: z.string().min(1),
    /** Id-ene til kildene (i `kilder`) datoen er hentet fra. */
    kilder: z.array(z.string().min(1)).min(1),
  })
  .strict()
  .refine((d) => d.fra !== undefined || d.relativ !== undefined, { message: 'En dato må ha fra eller relativ' });

export const inntaksdatoerSkjema = z
  .object({
    hentet: z.string(),
    /** Kildene: navnet og adressen til siden datoene er lest fra, og fylket. */
    kilder: z.record(z.string(), z.object({ navn: z.string().min(1), url: z.url(), fylke: fylkenr }).strict()),
    /** Datoene per fylkesnummer og inntaksår (f.eks. «2026»). */
    fylker: z.record(fylkenr, z.record(z.string().regex(/^\d{4}$/), z.partialRecord(z.enum(inntaksfelt), inntaksdatoSkjema))),
  })
  .strict();

export type Inntaksdato = z.infer<typeof inntaksdatoSkjema>;
export type Inntaksdatoer = z.infer<typeof inntaksdatoerSkjema>;
