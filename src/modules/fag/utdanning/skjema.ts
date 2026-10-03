// Skjema for løpene i videregående fra utdanning.no (HK-dir), i data/utdanning/lop.json (avgjørelse 052). Brukes
// bare til kontroll mot Grep og VIGO og til lenker til utdanning.no. API-et har ingen lisens, så innholdet vises
// ikke i appen.
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
