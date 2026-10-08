// Tallene fra SSBs statistikkbank til Videregående i tall (eier 08.10.2026, avgjørelse 090), hentet hver uke av
// scripts/hent-ssb.ts til data/statistikk/ssb.json (CC BY 4.0).
//
// - Enhetene er de samme som i tallene fra Udir: «L» er hele landet og «F46» et fylke. SSB har ikke tall per skole.
// - Hver verdi er et tall eller null. Listene følger årene i `aar`, eldste først.
// - Tallene fra SSB gjelder fylket der folk bor, unntatt lærerne (fylket de arbeider i) og pengene (fylkeskommunen).
import { z } from 'zod';

const enhet = z.string().regex(/^(L|F\d{2})$/);
const tall = z.number().nullable();
const rekke = z.array(tall);
const aar = z.array(z.number().int()).min(1);

export const ssbSkjema = z
  .object({
    kilde: z.literal('ssb-statistikkbanken'),
    hentet: z.string().min(1),
    /** Når SSB sist oppdaterte hver tabell («07459» → ISO-tid). */
    tabeller: z.record(z.string().regex(/^\d{5}$/), z.string().nullable()),
    /** 16–18-åringer per 1. januar: registrert til og med `framskrevetFra`, deretter SSBs framskriving (hovedalternativet). */
    ungdomskull: z.object({ aar: aar.min(10), framskrevetFra: z.number().int(), verdier: z.record(enhet, rekke) }).strict(),
    /** Andelen 15–29-åringer som verken er i arbeid, utdanning eller opplæring (NEET), etter bosted. */
    utenfor: z
      .object({
        aar,
        /** SSB oppgir det siste året som foreløpig. */
        forelopig: z.boolean(),
        prosent: z.record(enhet, rekke),
        /** Det siste året: antall personer, andelen per aldersgruppe og for innvandrere og alle andre. */
        antall: z.record(enhet, tall),
        alder: z.record(enhet, z.object({ '15-19': tall, '20-24': tall, '25-29': tall }).strict()),
        innvandrere: z.record(enhet, tall),
        ovrige: z.record(enhet, tall),
      })
      .strict(),
    /** Gjennomsnittlige grunnskolepoeng våren hvert år. Jenter og gutter det siste året. */
    grunnskolepoeng: z.object({ aar, poeng: z.record(enhet, rekke), jenter: z.record(enhet, tall), gutter: z.record(enhet, tall) }).strict(),
    /** KOSTRA: netto driftsutgifter til utdanning i skole per elev (kr) og elever per lærerårsverk. */
    kostnad: z.object({ aar, perElev: z.record(enhet, rekke), elevPerLaerer: z.record(enhet, rekke) }).strict(),
    /** Lærerne i videregående skole (november): antall og andelen 60 år og eldre per år, og alder, kjønn og utdanning det siste året. */
    laerere: z
      .object({
        aar,
        antall: z.record(enhet, rekke),
        andel60: z.record(enhet, rekke),
        alder: z.record(enhet, z.object({ under30: tall, fra30til49: tall, fra50til59: tall, fra60: tall }).strict()),
        kvinner: z.record(enhet, tall),
        pedagogisk: z.record(enhet, tall),
      })
      .strict(),
    /** Andelen 16–18-åringer som er elev, lærling eller lærekandidat. Etter innvandringsbakgrunn det siste året. */
    deltakelse: z
      .object({
        aar,
        alle: z.record(enhet, rekke),
        innvandringsbakgrunn: z.record(enhet, tall),
        ovrige: z.record(enhet, tall),
        /** Bare for landet: innvandrere og norskfødte med innvandrerforeldre. */
        landet: z.object({ innvandrere: tall, norskfodte: tall }).strict(),
      })
      .strict(),
  })
  .strict();

export type Ssb = z.infer<typeof ssbSkjema>;
