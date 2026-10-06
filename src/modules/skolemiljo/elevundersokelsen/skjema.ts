// Resultatene fra Elevundersøkelsen i videregående (fase 7, avgjørelse 077), hentet fra Udirs statistikkbank
// (NLOD) av scripts/hent-elevundersokelsen.ts til data/elevundersokelsen/resultater.json.
//
// - `verdier` har en nøkkel per enhet og eierform: «L|a» er hele landet for alle eierformer, «F46|p» de private
//   skolene i Vestland og «S974557584|a» en skole. Eierform: a = alle, o = offentlige, p = private.
// - Hver verdi er en liste per skoleår (som `skolear`) med en verdi per trinn (Vg1, Vg2, Vg3): et tall, «*» når Udir
//   har skjermet tallet, eller null når det ikke finnes (ingen elever eller ikke deltatt). Appen regner ikke ut egne
//   tall av dem.
// - Indeksene har skala 1–5. Mobbing er andelen elever i prosent.
import { z } from 'zod';

export const verdiSkjema = z.union([z.number(), z.literal('*'), z.null()]);
const perTrinn = z.array(verdiSkjema).length(3);
const perAar = z.array(perTrinn);

export const sporsmalstyper = ['mobbing', 'indeks'] as const;

export const elevundersokelsenSkjema = z
  .object({
    kilde: z.string().min(1),
    hentet: z.string().min(1),
    /** Skoleårene, eldste først, f.eks. «2024-25». */
    skolear: z.array(z.string().regex(/^\d{4}-\d{2}$/)).min(1),
    /** Indeksene og spørsmålene, i rekkefølgen de vises. */
    sporsmal: z.array(z.object({ kode: z.string().min(1), navn: z.string().min(1), type: z.enum(sporsmalstyper) }).strict()).min(1),
    /** Enhetene: «L» hele landet, «F<fylkesnummer>» og «S<organisasjonsnummer>». */
    enheter: z.record(z.string().regex(/^(L|F\d{2}|S[0-9A-Z]+)$/), z.object({ navn: z.string().min(1), fylke: z.string().regex(/^\d{2}$/).optional() }).strict()),
    /** «<enhet>|<eierform>» → spørsmålskode → skoleår → trinn. */
    verdier: z.record(z.string().regex(/^(L|F\d{2}|S[0-9A-Z]+)\|[aop]$/), z.record(z.string(), perAar)),
    /** Antallet elever som har svart på indeksen, i samme form som verdiene (ikke for mobbing). */
    antall: z.record(z.string(), z.record(z.string(), perAar)),
  })
  .strict();

export type Elevundersokelsen = z.infer<typeof elevundersokelsenSkjema>;
export type Verdi = z.infer<typeof verdiSkjema>;
export type Eierform = 'a' | 'o' | 'p';
