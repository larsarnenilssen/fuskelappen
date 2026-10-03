// Skjema for løpene i videregående fra utdanning.no (HK-dir), i data/utdanning/lop.json (avgjørelse 052). Brukes
// bare til kontroll mot Grep og VIGO og til lenker til utdanning.no. API-et har ingen lisens, så innholdet vises
// ikke i appen. Skolene og yrkene (avgjørelse 053) står nederst.
import { z } from 'zod';

const kode = z.string().min(1);

export const utdanningslopSkjema = z
  .object({
    kilde: z.literal('utdanning-no'),
    hentet: z.string(),
    /** Programområdene utdanning.no har en side for, med tittelen der. */
    noder: z.record(kode, z.string()),
    /** Hvert programområde utdanning.no viser løpet videre for, med programområdene det fører til. */
    videre: z.record(kode, z.array(kode)),
    /** Kryssløp blant dem: programområdene i et annet utdanningsprogram. */
    kryss: z.record(kode, z.array(kode)),
  })
  .strict();

export type Utdanningslop = z.infer<typeof utdanningslopSkjema>;

/**
 * Skolene i videregående og programområdene de tilbyr, fra utdanning.no (`/vgs/skole`), i data/utdanning/skoler.json
 * (avgjørelse 053). Eier har bestemt at dette vises i appen (03.10.2026). Programområdene er kodene i Grep: koder
 * utdanning.no har for lokale varianter (f.eks. STUSP1--T-), er ført til programområdet med de samme seks første
 * tegnene.
 */
export const skoleSkjema = z
  .object({
    /** Skolenummeret i VIGO (fem sifre), eller null for skoler uten nummer. */
    nr: z.string().regex(/^\d{5}$/).nullable(),
    navn: z.string().min(1),
    fylke: z.string().regex(/^\d{2}$/),
    kommune: z.string().regex(/^\d{4}$/).nullable(),
    /** Poststedet, f.eks. Andenes. */
    sted: z.string().nullable(),
    privat: z.boolean(),
    nettside: z.string().url().nullable(),
    plasser: z.number().int().nonnegative().nullable(),
    tilbud: z.array(kode),
  })
  .strict();

export const skolerSkjema = z
  .object({
    kilde: z.literal('utdanning-no'),
    hentet: z.string(),
    skoler: z.array(skoleSkjema),
  })
  .strict();

/**
 * Utdanningsbeskrivelsen og yrkene for et programområde på utdanning.no (`/vgs/programomrade_info`), i
 * data/utdanning/yrker.json (avgjørelse 053). Beskrivelsene og yrkene er åpne data fra utdanning.no (NLOD).
 */
export const yrkeSkjema = z.object({ tittel: z.string().min(1), sti: z.string().regex(/^\/yrker\//) }).strict();

export const utdanningsbeskrivelseSkjema = z
  .object({
    /** Sluttkompetansen, f.eks. Fagbrev, Svennebrev eller Yrkeskompetanse. */
    sluttkompetanse: z.string().nullable(),
    tittel: z.string().min(1),
    /** Stien til utdanningsbeskrivelsen på utdanning.no. */
    sti: z.string().regex(/^\//),
    /** Den korte teksten om sluttkompetansen og yrkestittelen (bokmål), f.eks. «… Yrkestittel er helsefagarbeider.». */
    tekst: z.string().nullable(),
    yrker: z.array(yrkeSkjema),
  })
  .strict();

export const yrkerSkjema = z
  .object({
    kilde: z.literal('utdanning-no'),
    hentet: z.string(),
    lisens: z.literal('NLOD'),
    programomrader: z.record(kode, utdanningsbeskrivelseSkjema),
  })
  .strict();

export type Skole = z.infer<typeof skoleSkjema>;
export type Skoler = z.infer<typeof skolerSkjema>;
export type Utdanningsbeskrivelse = z.infer<typeof utdanningsbeskrivelseSkjema>;
export type Yrker = z.infer<typeof yrkerSkjema>;
