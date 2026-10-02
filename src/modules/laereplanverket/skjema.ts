// Overordnet del av læreplanverket som data (pakke 6, avgjørelse 037). Teksten hentes fra udir.no på bokmål og
// nynorsk (scripts/hent-overordnet-del.ts) og lagres i data/udir/overordnet-del.json. Appen laster filen når
// brukeren åpner overordnet del. Teksten er forskriftstekst og gjengis uendret.
import { z } from 'zod';
import type { Blokk, Del, OverordnetDel } from './typer.ts';

const begge = z.object({ nb: z.string().min(1), nn: z.string().min(1) }).strict();

/** Et avsnitt eller en punktliste. */
export const blokkSkjema: z.ZodType<Blokk> = z.union([
  z.object({ type: z.literal('avsnitt'), tekst: z.string().min(1) }).strict(),
  z.object({ type: z.literal('liste'), punkter: z.array(z.string().min(1)).min(1) }).strict(),
]);

const tekster = z.object({ nb: z.array(blokkSkjema), nn: z.array(blokkSkjema) }).strict();

export const delSkjema: z.ZodType<Del> = z.lazy(() =>
  z
    .object({
      id: z.string().min(1),
      nr: z.string().min(1).nullable(),
      tittel: begge,
      url: z.string().url(),
      ingress: tekster,
      tekst: tekster,
      deler: z.array(delSkjema),
    })
    .strict(),
);

export const overordnetDelSkjema: z.ZodType<OverordnetDel> = z
  .object({
    kilde: z.literal('udir-overordnet-del'),
    url: z.string().url(),
    hentet: z.string().min(10),
    deler: z.array(delSkjema).min(3),
  })
  .strict();
export { alleDeler, type Blokk, type Del, type OverordnetDel } from './typer.ts';
