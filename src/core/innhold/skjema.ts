// Skjema for innhold under content/ og for kilderegisteret.
// Beskrevet i docs/INNHOLDSMODELL.md. Valideres ved bygg og i innholdstestene.
import { z } from 'zod';

export const isoDato = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Dato må skrives ÅÅÅÅ-MM-DD');

export const idSkjema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'id kan bare ha små bokstaver a–z, tall og bindestrek');

export const flerspraak = z.object({
  nb: z.string().trim().min(1, 'Bokmål mangler'),
  nn: z.string().trim().min(1, 'Nynorsk mangler'),
});

export const kildeRef = z
  .object({
    id: z.string().min(1),
    punkt: z.string().optional(),
    url: z.url().optional(),
  })
  .strict();

export const kontrollertSkjema = z.object({ dato: isoDato }).strict().nullable();

export const nivaSkjema = z.enum(['nasjonal', 'fylke', 'skole']);
export const forholdSkjema = z.enum(['erstatter', 'supplerer']);

export const gyldighetSkjema = z.discriminatedUnion('niva', [
  z.object({ niva: z.literal('nasjonal') }).strict(),
  z
    .object({
      niva: z.literal('fylke'),
      fylke: z.string().regex(/^\d{2}$/, 'Fylke oppgis med fylkesnummer, f.eks. "46"'),
      forhold: forholdSkjema,
    })
    .strict(),
  z
    .object({
      niva: z.literal('skole'),
      fylke: z.string().regex(/^\d{2}$/),
      skole: z.string().min(1),
      forhold: forholdSkjema,
    })
    .strict(),
]);

export const kildetekstSkjema = z
  .object({
    spraak: z.enum(['nb', 'nn', 'se', 'en']),
    tekst: z.string().min(1),
  })
  .strict();

export const elementtype = z.enum(['begrep', 'regel', 'forklaring', 'steg', 'frist', 'kildeomtale']);
export const malgruppe = z.enum(['skoleleder', 'laerer']);

const felles = {
  id: idSkjema,
  tittel: flerspraak,
  tekst: flerspraak,
  kildetekst: kildetekstSkjema.optional(),
  gyldighet: gyldighetSkjema.default({ niva: 'nasjonal' }),
  kilder: z.array(kildeRef).min(1, 'Minst én kilde er påkrevd'),
  kontrollert: kontrollertSkjema,
  stikkord: z.array(z.string()).default([]),
  relatert: z.array(z.string()).default([]),
};

export const vanligElement = z
  .object({ ...felles, type: elementtype.exclude(['frist']) })
  .strict();

export const fristElement = z
  .object({
    ...felles,
    type: z.literal('frist'),
    dato: isoDato.optional(),
    regel: z
      .object({ type: z.literal('arlig'), dag: z.number().int().min(1).max(31), maned: z.number().int().min(1).max(12) })
      .strict()
      .optional(),
    modul: z.string().min(1),
    malgruppe: z.array(malgruppe).min(1),
  })
  .strict()
  .refine((f) => (f.dato === undefined) !== (f.regel === undefined), {
    message: 'En frist må ha enten dato eller regel',
  });

export const innholdselement = z.union([fristElement, vanligElement]);

// En innholdsfil kan inneholde ett element eller en liste.
export const innholdsfil = z.union([innholdselement, z.array(innholdselement)]).transform((v) => (Array.isArray(v) ? v : [v]));

export const sha256 = z.string().regex(/^sha256:[0-9a-f]{64}$/);

export const kildeSkjema = z
  .object({
    id: idSkjema,
    navn: z.string().min(1),
    utgiver: z.string().min(1),
    url: z.url(),
    type: z.enum(['side', 'lovdata-datasett', 'grep', 'data']),
    niva: nivaSkjema,
    fylke: z.string().regex(/^\d{2}$/).optional(),
    lisens: z.string().min(1),
    sjekkmetode: z.enum(['side', 'kf-infoserie', 'fil', 'lovdata', 'grep', 'nsr', 'ingen']),
    aktiv: z.boolean(),
    uttrekk: z
      .object({
        selektor: z.string().min(1),
        // Beholder bare treff som inneholder denne teksten (f.eks. «SFS 2213»).
        inneholder: z.string().min(1).optional(),
        fjern: z.array(z.string()).default([]),
      })
      .strict()
      .optional(),
    godkjent_fingeravtrykk: sha256.nullable(),
    faser: z.array(z.number().int().min(0).max(9)).default([]),
    merknad: z.string().optional(),
  })
  .strict()
  .refine((k) => k.sjekkmetode !== 'side' || k.uttrekk !== undefined, {
    message: 'Kilder med sjekkmetode "side" må ha uttrekk.selektor',
  })
  .refine((k) => k.niva === 'nasjonal' || k.fylke !== undefined, {
    message: 'Kilder på fylkes- eller skolenivå må ha fylke',
  });

export const kilderegisterSkjema = z
  .object({ kilder: z.array(kildeSkjema).min(1) })
  .strict()
  .refine((r) => new Set(r.kilder.map((k) => k.id)).size === r.kilder.length, {
    message: 'Kilde-id-er må være unike',
  });

export const fylkerSkjema = z
  .object({
    kilder: z.array(kildeRef).min(1),
    fylker: z.array(z.object({ nummer: z.string().regex(/^\d{2}$/), navn: z.string().min(1) }).strict()).min(1),
  })
  .strict();

export const synonymSkjema = z
  .object({
    grupper: z.array(
      z
        .object({
          kanonisk: z.string().min(1),
          varianter: z.array(z.string().min(1)).min(1),
        })
        .strict(),
    ),
  })
  .strict();

export type Flerspraak = z.infer<typeof flerspraak>;
export type KildeRef = z.infer<typeof kildeRef>;
export type Gyldighet = z.infer<typeof gyldighetSkjema>;
export type Niva = z.infer<typeof nivaSkjema>;
export type Forhold = z.infer<typeof forholdSkjema>;
export type Kontrollert = z.infer<typeof kontrollertSkjema>;
export type Innholdselement = z.infer<typeof innholdselement>;
export type Frist = z.infer<typeof fristElement>;
export type Kilde = z.infer<typeof kildeSkjema>;
export type Kilderegister = z.infer<typeof kilderegisterSkjema>;
export type Fylker = z.infer<typeof fylkerSkjema>;
export type Synonymer = z.infer<typeof synonymSkjema>;
