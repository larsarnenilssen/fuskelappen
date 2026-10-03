// Skjema for fagdataene fra Grep (data/grep/fagindeks.json og data/grep/laereplaner/<kode>.json).
// Brukes av scripts/hent-grep.ts før filene skrives, og av testene. Appen bruker bare typene.
// Se docs/avgjorelser/022-fag-og-laereplaner-fra-grep.md.
import { z } from 'zod';

const navn = z.object({ nb: z.string().min(1), nn: z.string().min(1) }).strict();

/** Trinn slik vedlegg 1 til SFS 2213 skriver dem, og «Bedrift» for opplæring i bedrift. */
export const trinnSkjema = z.enum(['Vg1', 'Vg2', 'Vg3', 'Bedrift']);

export const fagtypeSkjema = z.enum(['fellesfag', 'felles_programfag', 'valgfritt_programfag', 'yrkesfaglig_fordypning', 'individuell_opplaeringsplan', 'annet']);

/** Vurderingsordningen for elever eller privatister: koder fra Grep (f.eks. trekkordning_2, eksamensform_2). */
export const vurderingSkjema = z
  .object({
    standpunkt: z.boolean(),
    trekk: z.string().nullable(),
    eksamensordning: z.string().nullable(),
    eksamensform: z.string().nullable(),
    uttrykk: z.string().nullable(),
  })
  .strict();

export const fagSkjema = z
  .object({
    navn,
    type: fagtypeSkjema,
    /** Trinn fra opplæringsfaget i Grep. */
    trinn: z.array(trinnSkjema),
    /** Programområdene faget brukes i (kode på ti tegn, f.eks. HSHEA2----). */
    po: z.array(z.string().min(1)),
    /** Årstimer (60 minutter) for elevene, feltet omfang-totalt i Grep. */
    timer: z.number().positive().nullable(),
    /** Læreplanen (LK20), f.eks. HEA02-04, eller null når faget ikke har en gjeldende LK20-plan. */
    lp: z.string().nullable(),
    /** Kompetansemålsettene i læreplanen som gjelder faget. */
    km: z.array(z.string()),
    elev: vurderingSkjema.nullable(),
    privatist: vurderingSkjema.nullable(),
  })
  .strict();

export const programomradeSkjema = z
  .object({
    navn,
    /** Utdanningsprogrammet: de to første bokstavene i koden (BA, ST, PB for påbygging …). */
    program: z.string().regex(/^[A-Z0-9]{2}$/),
    trinn: trinnSkjema,
    sted: z.enum(['skole', 'bedrift', 'ukjent']),
    /** Programområdene dette bygger på (forrige trinn, og kryssløp fra andre utdanningsprogram). */
    bygger: z.array(z.string()),
    /** Årstimer for elevene på trinnet (feltet aarstimer i Grep), eller null. */
    timer: z.number().positive().nullable(),
    /** Merkelapper i Grep, f.eks. «paabygg» (påbygg til generell studiekompetanse) på studieforberedende vg3 i naturbruk. */
    merkelapper: z.array(z.string()),
    /** «Bygger på» kommer fra grunnlaget for inntak i VIGO, ikke fra Grep (medGrunnlagFraVigo). Står ikke i dataene. */
    byggerFraVigo: z.boolean().optional(),
  })
  .strict();

export const fagindeksSkjema = z
  .object({
    kilde: z.literal('udir-grep'),
    hentet: z.string(),
    lisens: z.literal('NLOD 2.0'),
    utdanningsprogram: z.record(z.string(), navn),
    programomrader: z.record(z.string(), programomradeSkjema),
    /** Titlene Grep bruker for kodene i vurderingsordningen (bokmål). Brukes når appen ikke kjenner en kode. */
    koder: z.record(z.string(), z.string()),
    fag: z.record(z.string().regex(/^[A-Z]{3}[A-Z0-9]{2}\d{2}$/), fagSkjema),
  })
  .strict();

/** Språkkoder i Grep: nob (bokmål), nno (nynorsk), sme (nordsamisk) m.fl. */
export const spraakSkjema = z.string().regex(/^[a-z]{3}$/);

/** Tekst som avsnitt. Linjeskift i et avsnitt er \n. */
const avsnitt = z.array(z.string());

export const kompetansemalsettSkjema = z
  .object({
    kode: z.string().min(1),
    tittel: z.string().min(1),
    /** Opplæringsfagene settet gjelder (f.eks. HEA2Z04). */
    fag: z.array(z.string()),
    trinn: z.array(trinnSkjema),
    ingress: z.string().nullable(),
    maal: z.array(z.object({ kode: z.string().min(1), tekst: z.string().min(1) }).strict()),
    underveis: avsnitt,
    standpunkt: avsnitt,
  })
  .strict();

export const laereplanSkjema = z
  .object({
    kode: z.string().min(1),
    tittel: z.string().min(1),
    /** Målformen planen er fastsatt i. Tekstene er gjengitt i denne målformen, uoversatt. */
    spraak: spraakSkjema,
    fastsatt: z.string().nullable(),
    gyldigFra: z.string().nullable(),
    kompetansemaalsett: z.array(kompetansemalsettSkjema),
    vurderingsordning: z.array(z.object({ overskrift: z.string(), tekst: avsnitt }).strict()),
    /** Grunnleggende ferdigheter i faget (GF1–GF5 i Grep), med teksten fra læreplanen. */
    ferdigheter: z.array(z.object({ kode: z.string().min(1), tekst: avsnitt }).strict()),
    /** Tverrfaglige temaer i faget (TT1–TT3 i Grep), med teksten fra læreplanen. */
    temaer: z.array(z.object({ kode: z.string().min(1), tekst: avsnitt }).strict()),
  })
  .strict();

export type Trinn = z.infer<typeof trinnSkjema>;
export type Fagtype = z.infer<typeof fagtypeSkjema>;
export type Vurdering = z.infer<typeof vurderingSkjema>;
export type Fag = z.infer<typeof fagSkjema>;
export type Programomrade = z.infer<typeof programomradeSkjema>;
export type Fagindeks = z.infer<typeof fagindeksSkjema>;
export type Kompetansemalsett = z.infer<typeof kompetansemalsettSkjema>;
export type Laereplan = z.infer<typeof laereplanSkjema>;
