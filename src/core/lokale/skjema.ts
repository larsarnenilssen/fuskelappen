// Lokale regler (fase 9, avgjørelse 093): regler brukeren legger inn for fylket eller skolen sin, og regler eier har
// godkjent. Se docs/INNHOLDSMODELL.md. Skjemaene bruker zod/mini, så lagringen ikke drar inn hele zod.
import * as z from 'zod/mini';

/** Temaene, i rekkefølgen i skjemaet. Brukeren velger først hva endringen gjelder (eier 08.10.2026). */
export const TEMA = ['arbeidstid', 'skoleregler', 'fravaer', 'eksamen', 'inntak'] as const;
export type Tema = (typeof TEMA)[number];

/** Temaet verdiene i hvert regelverk står under i skjemaet. En verdi med `lokal: true` må ha et regelverk her (testes). */
export const TEMA_FOR_REGELVERK: Readonly<Record<string, Tema>> = { sfs2213: 'arbeidstid', hta: 'arbeidstid', vurdering: 'fravaer', inntak: 'inntak' };

const dato = z.string().check(z.regex(/^\d{4}-\d{2}-\d{2}$/));
/** Koden for innmeldingen, f.eks. «LR-7K3Q». Tilfeldig, uten tegn som er lette å forveksle. */
export const kodeSkjema = z.string().check(z.regex(/^LR-[A-HJ-NP-Z2-9]{4}$/));
const nokkel = z.string().check(z.regex(/^[a-z0-9]+\.[a-z0-9_]+$/));

/**
 * En regel brukeren har lagt inn selv. Lagres bare på enheten (`egneRegler` i lagringen). Den gjelder når brukeren har
 * valgt fylket (og skolen) den er lagt inn for. Et tall i kalkulatorene gjelder i stedet for den nasjonale verdien
 * (`verdi`), og en regel på en side kommer i tillegg (`regel`).
 */
export const egenRegelSkjema = z.object({
  kode: kodeSkjema,
  tema: z.enum(TEMA),
  type: z.enum(['verdi', 'regel']),
  niva: z.enum(['fylke', 'skole']),
  fylke: z.string().check(z.regex(/^\d{2}$/)),
  /** Skolens nummer i Nasjonalt skoleregister, når regelen gjelder skolen. */
  skole: z.nullable(z.string()),
  /** Navnet på fylket eller skolen, til visningen når brukeren har valgt et annet sted. */
  stedsnavn: z.string(),
  nokkel: z.optional(nokkel),
  verdi: z.optional(z.number()),
  tittel: z.optional(z.string()),
  tekst: z.optional(z.string()),
  lenke: z.optional(z.string()),
  merknad: z.optional(z.string()),
  lagtInn: dato,
  innmeldt: z.optional(dato),
  gjelderFra: z.optional(dato),
  gjelderTil: z.optional(dato),
  /** Koden til en godkjent regel som denne endrer. Brukerens versjon gjelder da for brukeren i stedet for den godkjente. */
  endrer: z.optional(kodeSkjema),
});
export type EgenRegel = z.infer<typeof egenRegelSkjema>;

const flerspraak = z.object({ nb: z.string().check(z.minLength(1)), nn: z.string().check(z.minLength(1)) });

/**
 * En regel eier har godkjent, i `lokale/regler.yaml`. Den publiseres uten ny versjon (avgjørelse 093) i
 * `data/lokale/regler.json` og vises for alle som har valgt fylket eller skolen. Kilden står i regelen, ikke i
 * kilderegisteret, fordi den kan være en lokal avtale som ikke er offentlig (eier 08.10.2026, L4 B).
 */
export const godkjentRegelSkjema = z.object({
  /** Koden fra innmeldingen. Brukerens kopi med samme kode byttes ut med den godkjente. */
  kode: kodeSkjema,
  tema: z.enum(TEMA),
  type: z.enum(['verdi', 'regel']),
  niva: z.enum(['fylke', 'skole']),
  fylke: z.string().check(z.regex(/^\d{2}$/)),
  skole: z.nullable(z.string()),
  stedsnavn: z.string().check(z.minLength(1)),
  nokkel: z.optional(nokkel),
  verdi: z.optional(z.number()),
  tittel: z.optional(flerspraak),
  tekst: z.optional(flerspraak),
  kilde: z.object({
    navn: z.string().check(z.minLength(1)),
    url: z.optional(z.string().check(z.regex(/^https:\/\//))),
    /** Usann for en lokal avtale som ikke er offentlig. Avtalen legges ikke ut (L4 B). */
    offentlig: z.boolean(),
  }),
  gjelder_fra: z.optional(dato),
  gjelder_til: z.optional(dato),
  meldt_inn: dato,
  /** Koden til en godkjent regel denne erstatter (en innmeldt endring). Den gamle tas da ut av filen. */
  endrer: z.optional(kodeSkjema),
  /** Settes bare av eier, eller av Claude etter eiers beskjed med dato. Regler uten kontroll publiseres ikke. */
  kontrollert: z.nullable(z.object({ dato })),
  /** Spørsmål til eier om det som er usikkert. Vises ikke i appen. */
  kontrollsporsmal: z.optional(z.array(z.string())),
});
export type GodkjentRegel = z.infer<typeof godkjentRegelSkjema>;

export const lokalefilSkjema = z.object({ regler: z.array(godkjentRegelSkjema) });

/** Filen appen henter: bare kontrollerte regler, uten kontrollspørsmålene. */
export const publisertSkjema = z.object({
  regler: z.array(z.omit(godkjentRegelSkjema, { kontrollsporsmal: true })),
});
export type PublisertRegel = z.infer<typeof publisertSkjema>['regler'][number];
