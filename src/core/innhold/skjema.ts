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
   * Bare for begreper: ordene som lenker til begrepet i brødteksten (avgjørelse 050), når tittelen ikke er ordet som
   * står i teksten. Grunnform; vanlige bøyningsendelser kommer med. Tom liste: begrepet lenkes ikke automatisk.
   */
  lenkeord: z.object({ nb: z.array(z.string().trim().min(1)), nn: z.array(z.string().trim().min(1)) }).strict().optional(),
  /**
   * Kodeliste fra VIGO Kodeverksbase som vises og kan søkes i under teksten (avgjørelse 026). Kodene kommer også
   * med i det samlede søket.
   */
  kodeliste: z.enum(['fagmerknader', 'vitnemalsmerknader', 'sokerstatuser']).optional(),
  /**
   * Kort merknad med egne ord i en gul boks under teksten, f.eks. at verdiene i appen bygger på appens egen tolkning
   * (eier 04.10.2026). Vises på begrepssiden.
   */
  merknad: flerspraak.optional(),
};

/** Paragraf i Regelverk: «dokument/nummer», f.eks. «opplaeringslova/11-1» eller «forvaltningsloven/11a». */
export const paragrafRef = z.string().regex(/^[a-z0-9-]+\/[0-9a-z-]+$/, 'Paragraf skrives «dokument/nummer», f.eks. «opplaeringslova/11-1»');

/**
 * Koder med forklaring, i grupper som kan lukkes, f.eks. karakterer og vurderingsuttrykk (fase 6, eier 04.10.2026).
 * Kodene vises under teksten med søk, og hver kode er med i det samlede søket. Teksten er egne ord med kilde.
 */
export const kodegruppe = z
  .object({
    id: idSkjema,
    tittel: flerspraak,
    koder: z
      .array(z.object({ kode: z.string().trim().min(1), navn: flerspraak, tekst: flerspraak }).strict())
      .min(1),
  })
  .strict();

export const vanligElement = z
  .object({
    ...felles,
    type: elementtype.exclude(['frist', 'steg', 'veiviser']),
    /** Paragrafer i Regelverk, som i stegene i veiviserne. Vises som lenker til paragrafen i appen. */
    paragrafer: z.array(paragrafRef).optional(),
    /**
     * To sider av samme sak i en rad, f.eks. underveis- og sluttvurdering (fase 6). Tittelen er underoverskriften i
     * raden, og `tekst` er en setning som sier det samme for søket og skjermlesere.
     */
    sammenligning: z.object({ venstre: flerspraak, hoyre: flerspraak }).strict().optional(),
    kodegrupper: z.array(kodegruppe).optional(),
  })
  .strict();

/** Læreplankode i Grep, f.eks. «NOR09-05». */
export const laereplanKode = z.string().regex(/^[A-Z]{3}\d{2}-\d{2}$/, 'Læreplankoden skrives som i Grep, f.eks. «NOR09-05»');

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
    /**
     * Læreplaner fra Grep som steget viser i en egen boks med fagkodene, og om læreplanen er kompetansegivende
     * (eier 03.10.2026). `merknad` er en kort setning med egne ord om hva læreplanen brukes til. Uten
     * `kompetansegivende` får læreplanen ingen av merkene (eier 03.10.2026 for GNS02-01). `malgruppe: voksne` gir en
     * egen gruppe «For voksne» nederst i boksen (eier 03.10.2026).
     */
    laereplaner: z
      .array(
        z
          .object({
            kode: laereplanKode,
            kompetansegivende: z.boolean().optional(),
            malgruppe: z.enum(['elever', 'voksne']).default('elever'),
            merknad: flerspraak,
          })
          .strict(),
      )
      .default([]),
    neste: idSkjema.optional(),
    sporsmal: z
      .object({
        tekst: flerspraak,
        /**
         * Svarene. `gruppe` gir en overskrift over svar som hører sammen, f.eks. «Fortrinnsrett» (eier 03.10.2026).
         * Svar etter hverandre med samme gruppe står under samme overskrift.
         */
        svar: z
          .array(z.object({ id: idSkjema, tekst: flerspraak, neste: idSkjema, gruppe: flerspraak.optional() }).strict())
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

/** Fargene en veiviser kan ha (avgjørelse 042). Hver farge er definert for lyst og mørkt tema i tema.css. */
export const veiviserfarge = z.enum(['blaa', 'lilla', 'turkis', 'rav']);

/** En veiviser (avgjørelse 041): tittel, ingress (`tekst`), første steg og fasene stegene grupperes i. */
export const veiviserElement = z
  .object({
    ...felles,
    type: z.literal('veiviser'),
    start: idSkjema,
    /** Fargen til veiviseren på oversikten og i hele veiviseren (avgjørelse 042). Blå er standard. */
    farge: veiviserfarge.default('blaa'),
    /** Plassen på oversikten. Lavest står først. */
    rekkefolge: z.number().int().default(100),
    faser: z.array(z.object({ id: idSkjema, tittel: flerspraak }).strict()).default([]),
  })
  .strict();

/**
 * En frist (fase 5, avgjørelse 046). `regel` er enten en fast dato hvert år (`arlig`), eller en måned når fristen ikke
 * har en fast dato, f.eks. svar på søknaden i juli (`maned`), eller hele året (`lopende`), f.eks. søknad fra voksne. `naar` er tidspunktet med ord når det ikke er en dato
 * («Etter sensur», «Minst fire uker før fristen»). `grupper` er hvem fristen gjelder, med id-er modulen bestemmer
 * (f.eks. `ungdom`, `voksne`, `fortrinn` i Inntak), og brukes til filter.
 */
export const fristElement = z
  .object({
    ...felles,
    type: z.literal('frist'),
    dato: isoDato.optional(),
    regel: z
      .discriminatedUnion('type', [
        z.object({ type: z.literal('arlig'), dag: z.number().int().min(1).max(31), maned: z.number().int().min(1).max(12) }).strict(),
        z.object({ type: z.literal('maned'), maned: z.number().int().min(1).max(12) }).strict(),
        z.object({ type: z.literal('lopende') }).strict(),
      ])
      .optional(),
    naar: flerspraak.optional(),
    modul: z.string().min(1),
    malgruppe: z.array(malgruppe).min(1),
    grupper: z.array(idSkjema).default([]),
    /** Paragrafer i Regelverk, som i stegene i veiviserne. */
    paragrafer: z.array(paragrafRef).default([]),
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
    /** Kort navn til utregningene i kalkulatorene, f.eks. «Opplæringsforskrifta». Uten kortnavn brukes navnet. */
    kortnavn: z.string().min(1).optional(),
    utgiver: z.string().min(1),
    url: z.url(),
    type: z.enum(['side', 'lovdata-datasett', 'grep', 'data']),
    niva: nivaSkjema,
    fylke: z.string().regex(/^\d{2}$/).optional(),
    lisens: z.string().min(1),
    sjekkmetode: z.enum(['side', 'kf-infoserie', 'fil', 'lovdata', 'lovtekst', 'grep', 'udir-fagfordeling', 'vigo-kodeverk', 'utdanning-no', 'ndla', 'nor', 'nsr', 'ingen']),
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
export type Kodegruppe = z.infer<typeof kodegruppe>;
export type Vanligelement = z.infer<typeof vanligElement>;
export type Veiviserelement = z.infer<typeof veiviserElement>;
export type Frist = z.infer<typeof fristElement>;
export type Kilde = z.infer<typeof kildeSkjema>;
export type Kilderegister = z.infer<typeof kilderegisterSkjema>;
export type Fylker = z.infer<typeof fylkerSkjema>;
export type Synonymer = z.infer<typeof synonymSkjema>;
export type Praksisfil = z.infer<typeof praksisfilSkjema>;
export type Praksis = Praksisfil['praksis'][number];
