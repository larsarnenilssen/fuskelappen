// Nøkkeltallene for videregående opplæring fra Udirs statistikkbank (fase 7, eier 07.10.2026, avgjørelse 080), hentet
// av scripts/hent-statistikk.ts til data/statistikk/statistikk.json (NLOD).
//
// - Enhetene har samme nøkler som Elevundersøkelsen: «L» er hele landet, «F46» et fylke og «S974557584» en skole.
// - Hver verdi er et tall, «*» når Udir har skjermet tallet, eller null når det ikke finnes.
// - Listene følger periodene i hver del, eldste først.
// - Gjennomføringen i skole regnes om til dagens fylker av appen (summen av tellerne og nevnerne for de gamle fylkene),
//   fordi Udir oppgir kullet på fylkene fra før 2020. Det står i `beregnet`.
import { z } from 'zod';

export const verdiSkjema = z.union([z.number(), z.literal('*'), z.null()]);
export type Verdi = z.infer<typeof verdiSkjema>;

const enhet = z.string().regex(/^(L|F\d{2}|S[0-9A-Z]+)$/);
const rekke = z.array(verdiSkjema);

export const statistikkSkjema = z
  .object({
    kilde: z.string().min(1),
    hentet: z.string().min(1),
    /** Navnene på fylkene («F46» → «Vestland») og skolene («S…» → navn og fylke). */
    enheter: z.record(enhet, z.object({ navn: z.string().min(1), fylke: z.string().regex(/^\d{2}$/).optional() }).strict()),
    /** Søkere per 1. mars: alle, til skole og til læreplass, for landet og fylkene. */
    sokere: z
      .object({
        aar: z.array(z.number().int()).min(2),
        alle: z.record(enhet, rekke),
        skole: z.record(enhet, rekke),
        laereplass: z.record(enhet, rekke),
        /** Søkere per utdanningsprogram (skole og læreplass), de to siste årene. */
        utdanningsprogram: z
          .object({
            aar: z.array(z.number().int()).length(2),
            programmer: z.array(z.object({ id: z.string().min(1), navn: z.string().min(1), yrkesfag: z.boolean() }).strict()).min(5),
            verdier: z.record(enhet, z.record(z.string(), rekke)),
          })
          .strict(),
      })
      .strict(),
    /** Elever og skoler per skoleår (1. oktober), for landet, fylkene og skolene. */
    elever: z
      .object({
        skolear: z.array(z.string().min(1)).min(2),
        elever: z.record(enhet, rekke),
        skoler: z.record(enhet, rekke),
      })
      .strict(),
    /** Andelen søkere til læreplass som har fått lærekontrakt, i prosent. */
    formidling: z
      .object({
        /** Desember hvert år. */
        aar: z.array(z.number().int()).min(2),
        desember: z.record(enhet, rekke),
        /** Gjennom høsten det siste året: august, oktober og desember. */
        hosten: z.object({ aar: z.number().int(), maneder: z.array(z.string().min(1)).min(2), verdier: z.record(enhet, rekke) }).strict(),
      })
      .strict(),
    /** Løpende lærekontrakter (1. oktober). */
    laerekontrakter: z.object({ aar: z.array(z.number().int()).min(2), verdier: z.record(enhet, rekke) }).strict(),
    /** Fravær, median dager, det siste skoleåret: totalt og på vitnemålet. */
    fravaer: z.object({ skolear: z.string().min(1), total: z.record(enhet, verdiSkjema), vitnemal: z.record(enhet, verdiSkjema) }).strict(),
    /** Andelen av elevene som fullførte innen fem eller seks år (to år etter normert tid), per kull som startet på vg1. */
    gjennomforing: z
      .object({
        kull: z.array(z.number().int()).min(2),
        verdier: z.record(enhet, rekke),
        /** Fylkene er regnet om fra fylkene før 2020 av appen. */
        beregnet: z.boolean(),
      })
      .strict(),
    /** Andelen lærlinger med fag- eller svennebrev fem år etter at de startet i lære. */
    fagbrev: z.object({ kull: z.number().int(), verdier: z.record(enhet, verdiSkjema) }).strict(),
    /** Gjennomsnittlig karakter til skriftlig eksamen i fellesfagene, det siste skoleåret. */
    eksamen: z
      .object({
        skolear: z.string().min(1),
        /** Udir kaller tallene foreløpige til de er endelige. */
        forelopig: z.boolean(),
        fag: z.array(z.object({ id: z.string().min(1), navn: z.string().min(1) }).strict()).min(1),
        snitt: z.record(enhet, z.record(z.string(), verdiSkjema)),
        antall: z.record(enhet, z.record(z.string(), verdiSkjema)),
      })
      .strict(),
  })
  .strict();

export type Statistikk = z.infer<typeof statistikkSkjema>;
