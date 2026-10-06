// Skjema for eksamensdatoene i data/eksamen/datoer.json (fase 6, pakke 3, avgjørelse 059). Datoene hentes hver
// uke fra udir.no og fylkenes sider (scripts/hent-eksamen.ts). Brukes av skriptet før filen skrives, av appen og av
// testene.
import { z } from 'zod';

const iso = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const fylkenr = z.string().regex(/^\d{2}$/);

/** En eksamensperiode: «host-2026» (høsteksamen 2026) eller «var-2027» (våreksamen 2027). */
export const periodeId = z.string().regex(/^(host|var)-\d{4}$/);

/** Én dato for en periode: dagen, eller fra og til, med klokkeslett og kildene som har datoen. */
export const eksamensdatoSkjema = z
  .object({
    fra: iso.optional(),
    til: iso.optional(),
    /** Klokkeslettet, f.eks. «09.00». */
    kl: z.string().regex(/^\d{2}\.\d{2}$/).optional(),
    /** Id-ene til kildene (i `kilder`) datoen er hentet fra. */
    kilder: z.array(z.string().min(1)).min(1),
  })
  .strict()
  .refine((d) => d.fra !== undefined || d.til !== undefined, { message: 'En dato må ha fra eller til' });

/** Datoene for hver periode, per felt (f.eks. `trekk`, `sensur`). */
const perioder = z.record(periodeId, z.record(z.string(), eksamensdatoSkjema));

export const eksamensdatoerSkjema = z
  .object({
    hentet: z.string(),
    /** Udirs datoer, og datoene flere fylker er enige om (eier 04.10.2026). */
    nasjonal: perioder,
    /** Fylkenes egne datoer, per fylkesnummer. Bare fylker vi har hentet fra, er med. */
    fylker: z.record(fylkenr, perioder),
    /** Kildene: navnet og adressen til siden datoene er lest fra. */
    kilder: z.record(z.string(), z.object({ navn: z.string().min(1), url: z.url(), fylke: fylkenr.nullable() }).strict()),
  })
  .strict();

export type Eksamensdato = z.infer<typeof eksamensdatoSkjema>;
export type Eksamensdatoer = z.infer<typeof eksamensdatoerSkjema>;
