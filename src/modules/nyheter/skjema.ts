// Nyhetene (fase 7b): tittel, dato, lenke og eventuelt ingress fra kildene i content/nyheter/kilder.yaml, hentet hver
// dag av scripts/hent-nyheter.ts til data/nyheter/nyheter.json. Ingen bilder og ingen hele tekster.
import * as z from 'zod/mini';

/** Hvem som står bak: myndigheter, fagpresse, organisasjoner (interesseparter), forskning og nyhetsmedier. */
export const NYHETSTYPER = ['myndighet', 'fagpresse', 'organisasjon', 'forskning', 'media'] as const;
export type Nyhetstype = (typeof NYHETSTYPER)[number];

export const nyhetSkjema = z.strictObject({
  /** Id-en til kilden i content/nyheter/kilder.yaml. */
  kilde: z.string().check(z.minLength(1)),
  tittel: z.string().check(z.minLength(1)),
  /** Publiseringsdato, YYYY-MM-DD. */
  dato: z.string().check(z.regex(/^\d{4}-\d{2}-\d{2}$/)),
  url: z.string().check(z.regex(/^https:\/\//)),
  /** Ingressen, når kilden har en og vi kan vise den. Uten HTML, høyst om lag 300 tegn. */
  ingress: z.optional(z.string()),
});

/**
 * Status for hver kilde etter siste henting. Feiler kilden, eller gir den null saker, beholdes sakene fra før, og
 * `feilSiden` sier når det startet.
 */
export const nyhetskildeStatus = z.strictObject({
  status: z.enum(['ok', 'feilet', 'tom']),
  feilSiden: z.optional(z.string()),
  melding: z.optional(z.string()),
});

export const nyheterSkjema = z.strictObject({
  skjema: z.literal(1),
  /** Når filen sist ble endret av hentingen (ISO). */
  hentet: z.string(),
  kilder: z.record(z.string(), nyhetskildeStatus),
  /** De nyeste sakene, nyeste først. */
  saker: z.array(nyhetSkjema),
});

export type Nyhet = z.infer<typeof nyhetSkjema>;
export type Nyheter = z.infer<typeof nyheterSkjema>;
export type NyhetskildeStatus = z.infer<typeof nyhetskildeStatus>;
