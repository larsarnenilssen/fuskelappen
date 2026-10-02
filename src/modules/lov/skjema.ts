// Lov og forskrift som data (fase 3, avgjørelse 039): skjema for utvalget i content/lovverk.yaml og for tekstene i
// data/lovdata/. Brukes av hentingen og testene. Appen bruker bare typene (typer.ts), så zod ikke kommer i startpakken.
import { z } from 'zod';
import type { Gyldighet, Ledd, Lovdokument, Lovoversikt, Paragraf, Punkt, Seksjon, Segment } from './typer.ts';

const id = z.string().regex(/^[a-z0-9-]+$/);

/** Et kapittelnummer («11», «IV») eller et spenn av kapitler med arabiske tall («5-21»). */
const kapittel = z.string().regex(/^(\d+[A-Z]?(-\d+)?|[IVXLC]+)$/);

const gyldighet: z.ZodType<Gyldighet> = z.union([
  z.object({ niva: z.literal('nasjonal') }).strict(),
  z.object({ niva: z.literal('fylke'), fylke: z.string().regex(/^\d{2}$/) }).strict(),
]);

/**
 * Utvalget: dokumentene appen viser, i rekkefølgen på oversikten. En ny lov eller forskrift legges til med en ny
 * oppføring her og en kilde i kilderegisteret. Det trengs ingen kodeendring.
 */
export const lovutvalgSkjema = z
  .object({
    dokumenter: z
      .array(
        z
          .object({
            /** Adressen i appen: #/lov/<id>. */
            id,
            /** Kilden i content/kilder.yaml (sjekkmetode lovtekst, adressen hos Lovdata). */
            kilde: id,
            /** Kort navn i appen, når dokumentet ikke har korttittel hos Lovdata. */
            korttittel: z.string().min(1).optional(),
            /** Kapitlene som tas med. Mangler den, tas hele dokumentet med. */
            kapitler: z.array(kapittel).min(1).optional(),
            gyldighet: gyldighet.default({ niva: 'nasjonal' }),
            /** Hvorfor dokumentet og utvalget er med (til dokumentasjonen, vises ikke i appen). */
            merknad: z.string().optional(),
          })
          .strict(),
      )
      .min(1),
  })
  .strict()
  .refine((u) => new Set(u.dokumenter.map((d) => d.id)).size === u.dokumenter.length, { message: 'Dokument-id-er må være unike' });

export type Lovutvalg = z.infer<typeof lovutvalgSkjema>;

/** Kapitlene i utvalget, med spennene skrevet ut: ['1', '5-7'] gir ['1', '5', '6', '7']. */
export function kapittelliste(kapitler: readonly string[]): string[] {
  return kapitler.flatMap((k) => {
    const m = /^(\d+)-(\d+)$/.exec(k);
    if (!m) return [k];
    const [fra, til] = [Number(m[1]), Number(m[2])];
    if (til < fra) throw new Error(`Ugyldig spenn av kapitler: ${k}`);
    return Array.from({ length: til - fra + 1 }, (_, i) => String(fra + i));
  });
}

const segment: z.ZodType<Segment> = z.union([
  z.string(),
  z.object({ t: z.string().min(1), l: z.string().min(1) }).strict(),
  z.object({ f: z.string().min(1) }).strict(),
]);
const tekst = z.array(segment);

const ledd: z.ZodType<Ledd> = z.lazy(() =>
  z
    .object({
      tekst,
      liste: z.array(punkt).min(1).optional(),
      etter: z.array(tekst).min(1).optional(),
    })
    .strict(),
);
const punkt: z.ZodType<Punkt> = z.lazy(() => z.object({ merke: z.string(), ledd: z.array(ledd) }).strict());

const paragraf: z.ZodType<Paragraf> = z
  .object({
    nr: z.string().min(1),
    visNr: z.string().min(1),
    tittel: z.string(),
    ledd: z.array(ledd),
    endringer: z.array(tekst),
    fotnoter: z.array(z.object({ nr: z.string().min(1), tekst }).strict()),
  })
  .strict();

const seksjon: z.ZodType<Seksjon> = z.lazy(() =>
  z
    .object({
      id: z.string().min(1),
      type: z.enum(['del', 'kapittel', 'avsnitt']),
      nr: z.string().min(1).nullable(),
      overskrift: z.string().min(1),
      merknader: z.array(tekst),
      seksjoner: z.array(seksjon),
      paragrafer: z.array(paragraf),
    })
    .strict(),
);

export const lovdokumentSkjema: z.ZodType<Lovdokument> = z
  .object({
    id,
    kilde: id,
    type: z.enum(['lov', 'forskrift']),
    tittel: z.string().min(1),
    korttittel: z.string().min(1),
    malform: z.enum(['nb', 'nn']),
    refid: z.string().regex(/^(lov|forskrift)\/\d{4}-\d{2}-\d{2}(-\d+)?$/),
    sistEndret: z.string().nullable(),
    hentet: z.string().min(10),
    gyldighet,
    utvalg: z.array(z.string()).nullable(),
    seksjoner: z.array(seksjon).min(1),
  })
  .strict();

export const lovoversiktSkjema: z.ZodType<Lovoversikt> = z
  .object({
    dokumenter: z.array(
      z
        .object({
          id,
          type: z.enum(['lov', 'forskrift']),
          tittel: z.string().min(1),
          korttittel: z.string().min(1),
          malform: z.enum(['nb', 'nn']),
          refid: z.string().min(1),
          gyldighet,
          utvalg: z.array(z.string()).nullable(),
          antallKapitler: z.number().int().min(0),
          antallParagrafer: z.number().int().min(1),
        })
        .strict(),
    ),
  })
  .strict();

export * from './typer.ts';
