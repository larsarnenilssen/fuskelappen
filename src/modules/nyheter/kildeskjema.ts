// Skjema for nyhetskildene i content/nyheter/kilder.yaml (fase 7b). Brukes av innlastingen av innhold, hentingen og
// testene. Appen bruker bare typen, så zod ikke kommer med i appen.
import { z } from 'zod';
import { flerspraak } from '../../core/innhold/skjema.ts';
import { NYHETSTYPER } from './skjema.ts';

const ordliste = z.array(z.string().trim().min(1));

export const nyhetskildeSkjema = z.strictObject({
  id: z.string().regex(/^[a-z0-9-]+$/),
  navn: flerspraak,
  /** Kort navn i linjen under tittelen, f.eks. «Udir». */
  kortnavn: flerspraak.optional(),
  type: z.enum(NYHETSTYPER),
  /** Id-en i kilderegisteret (content/kilder.yaml), med lisensen. */
  kilde: z.string().min(1),
  /** Merknad ved kilden, f.eks. «Fagpresse, utgitt av Utdanningsforbundet». */
  merknad: flerspraak.optional(),
  format: z.enum(['rss', 'udir', 'utdanningsforbundet']),
  url: z.url().startsWith('https://'),
  filter: z.enum(['vgs', 'alle']),
  ingress: z.boolean(),
  /** Fylkene kilden gjelder for. Sakene vises bare når et av dem er valgt (Statsforvalteren). */
  fylker: z.array(z.string().regex(/^\d{2}$/)).optional(),
  utelat: ordliste.optional(),
});

export const nyhetskilderSkjema = z.strictObject({
  filter: z.strictObject({ sterke: ordliste, generelle: ordliste, utelukker: ordliste, aldri: ordliste }),
  kilder: z.array(nyhetskildeSkjema).min(1),
});

export type Nyhetskilde = z.infer<typeof nyhetskildeSkjema>;
export type Nyhetskilder = z.infer<typeof nyhetskilderSkjema>;
