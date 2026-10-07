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
  /** lovdata: endringene i regelverket fra data/lovdata/kommende.json, uten egen henting. */
  format: z.enum(['rss', 'udir', 'utdanningsforbundet', 'lovdata']),
  url: z.url().startsWith('https://'),
  filter: z.enum(['vgs', 'alle']),
  ingress: z.boolean(),
  /** Fylkene kilden gjelder for. Sakene vises bare når et av dem er valgt (Statsforvalteren). */
  fylker: z.array(z.string().regex(/^\d{2}$/)).optional(),
  utelat: ordliste.optional(),
  /** Ord som utelukker en sak fra akkurat denne kilden, i tillegg til `utelukker` i filteret (f.eks. «barn» hos forskning.no). */
  utelukker: ordliste.optional(),
});

/** En kilde som bare prøvehentes (npm run nyheter:prove), og ikke vises i appen. */
export const provekildeSkjema = z.strictObject({
  id: z.string().regex(/^[a-z0-9-]+$/),
  navn: z.string().min(1),
  url: z.url().startsWith('https://'),
  /** Bare sterke ord i tittelen (nyhetsmedier). */
  streng: z.boolean().optional(),
  /** Alle sakene, uten filter (organisasjoner). */
  alle: z.boolean().optional(),
});

export const nyhetskilderSkjema = z.strictObject({
  filter: z.strictObject({ sterke: ordliste, generelle: ordliste, utelukker: ordliste, aldri: ordliste }),
  kilder: z.array(nyhetskildeSkjema).min(1),
  prove: z.array(provekildeSkjema).default([]),
  oppdag: z.array(z.url()).default([]),
});

export type Nyhetskilde = z.infer<typeof nyhetskildeSkjema>;
export type Nyhetskilder = z.infer<typeof nyhetskilderSkjema>;
export type Provekilde = z.infer<typeof provekildeSkjema>;
