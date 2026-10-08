// Skjemaet for content/versjoner.yaml (avgjørelse 088). Brukes når innholdet leses i skriptene og testene, ikke i
// appen, så startpakken ikke får skjemabiblioteket med.
import { z } from 'zod';

/** Høyst så mange tegn i ett punkt, så meldingen holder seg kort. */
export const MAKS_TEGN = 160;
/** Høyst så mange punkter per versjon. */
export const MAKS_PUNKTER = 4;

const punkt = z.string().min(1).max(MAKS_TEGN);

export const versjonSkjema = z.strictObject({
  versjon: z.string().regex(/^\d+\.\d+\.\d+$/),
  dato: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  nytt: z.array(z.strictObject({ nb: punkt, nn: punkt })).min(1).max(MAKS_PUNKTER),
});

export const versjonerSkjema = z.strictObject({ versjoner: z.array(versjonSkjema).min(1) });
