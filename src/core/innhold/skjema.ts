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

export const elementtype = z.enum(['begrep', 'regel', 'forklaring', 'steg', 'frist', 'kildeomtale', 'veiviser']);
export const malgruppe = z.enum(['skoleleder', 'laerer']);

const felles = {
  id: idSkjema,
  tittel: flerspraak,
  tekst: flerspraak,
  kildetekst: kildetekstSkjema.optional(),
  gyldighet: gyldighetSkjema.default({ niva: 'nasjonal' }),
  kilder: z.array(kildeRef).min(1, 'Minst én kilde er påkrevd'),
  kontrollert: kontrollertSkjema,
  /**
   * Spørsmål til eier om det som er usikkert i teksten, f.eks. om en formulering kan misforstås eller om en
   * praksis stemmer. Vises bare i kontrolloversikten og kontrollsakene, ikke i appen (avgjørelse 019).
   */
  kontrollsporsmal: z.array(z.string().trim().min(1)).optional(),
  stikkord: z.array(z.string()).default([]),
  relatert: z.array(z.string()).default([]),
  /**
   * Kodeliste fra VIGO Kodeverksbase som vises og kan søkes i under teksten (avgjørelse 026). Kodene kommer også
   * med i det samlede søket.
   */
  kodeliste: z.enum(['fagmerknader', 'vitnemalsmerknader']).optional(),
};

export const vanligElement = z
  .object({ ...felles, type: elementtype.exclude(['frist', 'steg', 'veiviser']) })
  .strict();

/** Paragraf i Regelverk: «dokument/nummer», f.eks. «opplaeringslova/11-1» eller «forvaltningsloven/11a». */
export const paragrafRef = z.string().regex(/^[a-z0-9-]+\/[0-9a-z-]+$/, 'Paragraf skrives «dokument/nummer», f.eks. «opplaeringslova/11-1»');

/**
 * Et steg i en veiviser (avgjørelse 041). `tekst` er hva som skal skje. Steget går videre til `neste`, eller
 * stiller et spørsmål der hvert svar har sitt neste steg. Et steg uten `neste` og `sporsmal` er et utfall.
 */
export const stegElement = z
  .object({
    ...felles,
    type: z.literal('steg'),
    veiviser: idSkjema,
    /** Fasen i prosessen steget hører til (id fra veiviseren). Vises i fasestolpen. */
    fase: idSkjema.optional(),
    ansvar: flerspraak.optional(),
    dokumentasjon: flerspraak.optional(),
    frist: flerspraak.optional(),
    /** Fristen i to–tre ord, f.eks. «3 uker», til merket i kartet over hele prosessen. */
    fristKort: flerspraak.optional(),
    /** Utdyping som er skjult til brukeren åpner den. Markdown. */
    forklaring: flerspraak.optional(),
    /** Paragrafer i Regelverk som steget bygger på. Vises som lenker til paragrafen i appen. */
    paragrafer: z.array(paragrafRef).default([]),
    neste: idSkjema.optional(),
    sporsmal: z
      .object({
        tekst: flerspraak,
        svar: z
          .array(z.object({ id: idSkjema, tekst: flerspraak, neste: idSkjema }).strict())
          .min(2, 'Et spørsmål må ha minst to svar'),
      })
      .strict()
      .optional(),
  })
  .strict()
  .refine((s) => s.neste === undefined || s.sporsmal === undefined, { message: 'Et steg har enten neste eller sporsmal' })
  .refine((s) => !s.sporsmal || new Set(s.sporsmal.svar.map((v) => v.id)).size === s.sporsmal.svar.length, {
    message: 'Svarene i et spørsmål må ha unike id-er',
  });

/** En veiviser (avgjørelse 041): tittel, ingress (`tekst`), første steg og fasene stegene grupperes i. */
export const veiviserElement = z
  .object({
    ...felles,
    type: z.literal('veiviser'),
    start: idSkjema,
    faser: z.array(z.object({ id: idSkjema, tittel: flerspraak }).strict()).default([]),
  })
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

export const innholdselement = z.union([fristElement, stegElement, veiviserElement, vanligElement]);

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
    sjekkmetode: z.enum(['side', 'kf-infoserie', 'fil', 'lovdata', 'lovtekst', 'grep', 'udir-fagfordeling', 'vigo-kodeverk', 'nsr', 'ingen']),
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

/**
 * Praksis og tolkninger som ikke står i kildene, men som appen bygger på (content/kontroll/praksis.yaml).
 * Eier bekrefter dem i kontrollrundene. bekreftet settes bare av eier (avgjørelse 019).
 */
export const praksisfilSkjema = z
  .object({
    praksis: z
      .array(
        z
          .object({
            id: idSkjema,
            tittel: z.string().min(1),
            sporsmal: z.string().min(1),
            appen: z.string().min(1),
            grunnlag: z.string().min(1),
            /** Regelverdier («regelsett/nøkkel») og innhold (id) som bygger på praksisen. */
            berorer: z.array(z.string().min(1)).min(1),
            bekreftet: kontrollertSkjema,
          })
          .strict(),
      )
      .min(1),
  })
  .strict()
  .refine((f) => new Set(f.praksis.map((p) => p.id)).size === f.praksis.length, { message: 'id må være unik' });

export type Flerspraak = z.infer<typeof flerspraak>;
export type KildeRef = z.infer<typeof kildeRef>;
export type Gyldighet = z.infer<typeof gyldighetSkjema>;
export type Niva = z.infer<typeof nivaSkjema>;
export type Forhold = z.infer<typeof forholdSkjema>;
export type Kontrollert = z.infer<typeof kontrollertSkjema>;
export type Innholdselement = z.infer<typeof innholdselement>;
export type Stegelement = z.infer<typeof stegElement>;
export type Veiviserelement = z.infer<typeof veiviserElement>;
export type Frist = z.infer<typeof fristElement>;
export type Kilde = z.infer<typeof kildeSkjema>;
export type Kilderegister = z.infer<typeof kilderegisterSkjema>;
export type Fylker = z.infer<typeof fylkerSkjema>;
export type Synonymer = z.infer<typeof synonymSkjema>;
export type Praksisfil = z.infer<typeof praksisfilSkjema>;
export type Praksis = Praksisfil['praksis'][number];
