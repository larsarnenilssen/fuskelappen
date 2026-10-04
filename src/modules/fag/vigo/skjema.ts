// Skjema for dataene fra VIGO Kodeverksbase (kodeverk.vigo.no) i data/vigo/. Brukes av scripts/hent-vigo.ts før
// filene skrives, og av testene. Appen bruker bare typene (avgjørelse 026).
import { z } from 'zod';

const kode = z.string().min(1);

const sentralLokal = z.enum(['sentral', 'lokal']);

/** Vurderingen i et fag fra VIGO, se `vurdering` under. */
export const fagvurderingSkjema = z
  .object({
    /** Hvem som lager eksamensoppgaven (feltet «task»): sentralt gitt (Udir) eller lokalt gitt eksamen. */
    eksamen: sentralLokal.optional(),
    /** Sensuren (feltet «censorship»), bare når den er en annen enn eksamen, f.eks. sentralt gitt med lokal sensur. */
    sensur: sentralLokal.optional(),
    /** Fagmerknadene som hører til faget, f.eks. FAM58. */
    fam: z.array(z.string().regex(/^FAM\d+$/)).min(1).optional(),
  })
  .strict();

/** VIGOs verdi der VIGO og Grep er uenige. Trekkordningen er VIGOs tekst, f.eks. «Trekkfag». Null: VIGO har ingen verdi. */
export const avvikSkjema = z
  .object({
    timer: z.number().nullable().optional(),
    elev: z.string().nullable().optional(),
    privatist: z.string().nullable().optional(),
  })
  .strict();

export const fagrelasjonerSkjema = z
  .object({
    kilde: z.literal('vigo-kodeverk'),
    hentet: z.string(),
    /**
     * Utgåtte fagkoder og kodene som erstatter dem (koblingen «element_erstatter_element»). En kode kan være delt
     * opp i flere nye, og en ny kode kan selv være utgått og erstattet. Navnet og sluttdatoen gjelder den utgåtte
     * koden. VIGOs egne koder for opplæringsfag (med Z, f.eks. NOR1Z13) er ikke med.
     */
    erstatninger: z.record(kode, z.object({ ny: z.array(kode).min(1), navn: z.string(), utgatt: z.string().nullable() }).strict()),
    /** Læreplaner (LK20) som er erstattet av en ny versjon (koblingen «erstattes_av»), f.eks. MAT01-05 → MAT01-06. */
    laereplaner: z.record(kode, kode),
    /**
     * Fag som brukes sammen (koblingen «fag_benyttessammenmed»), f.eks. tverrfaglig eksamen og fagene den gjelder.
     * Nøkkelen er koden VIGO oppgir først, oftest eksamens- eller vurderingskoden.
     */
    brukesSammen: z.record(kode, z.array(kode)),
    /**
     * Fag som bygger på andre fag (koblingen «fag_paabygning»), f.eks. Teater og bevegelse 2 på Teater og bevegelse 1.
     * Fagene tas i denne rekkefølgen (eier 01.10.2026).
     */
    byggerPaa: z.record(kode, z.array(kode)),
    /** Navn på kodene i «brukes sammen», til koder som ikke finnes i fagindeksen fra Grep. */
    navn: z.record(kode, z.string()),
    /**
     * Programområdene et programområde gir grunnlag for å søke videre på (tabellen «entry-requirements», nasjonalt),
     * f.eks. et lærefag → Vg4 påbygging. Bare programområder som finnes i fagindeksen fra Grep.
     */
    grunnlag: z.record(kode, z.array(kode)),
    /**
     * Vurderingen i fagene i fagindeksen fra Grep (tabellen «courses» og koblingen «fam-connected-to-course», fase 6):
     * om eksamen er sentralt eller lokalt gitt (hvem som lager oppgaven), sensuren når den er en annen, og
     * fagmerknadene (FAM-koder) som hører til faget. Fag uten noen av delene er ikke med.
     */
    vurdering: z.record(kode, fagvurderingSkjema),
    /**
     * Fag der VIGO og Grep er uenige om årstimetallet eller trekkordningen for elev eller privatist, med VIGOs verdi.
     * Grep er hovedkilden; VIGO kontrollerer den. Uten avvik er listen tom.
     */
    avvik: z.record(kode, avvikSkjema),
  })
  .strict();

export const merknadSkjema = z
  .object({
    kode,
    nb: z.string().min(1),
    nn: z.string().min(1),
    se: z.string().nullable(),
    en: z.string().nullable(),
    /** Hvor merknaden brukes: grunnskole, videregående (skole) og fagopplæring. */
    grunnskole: z.boolean(),
    videregaende: z.boolean(),
    fagopplaering: z.boolean(),
    kreverVedlegg: z.boolean(),
    /** FAM-koder: om merknaden kan stå på vitnemål og på kompetansebevis. Null for vitnemålsmerknader. */
    vitnemal: z.boolean().nullable(),
    kompetansebevis: z.boolean().nullable(),
    /** Sluttdato (ÅÅÅÅ-MM-DD) eller «ukjent» for utgåtte koder, ellers null. */
    utgatt: z.string().nullable(),
    /** Nummeret VIGO gir koden (status på søkerønsker), i rekkefølgen gjennom inntaket. */
    nr: z.number().int().optional(),
  })
  .strict();

export const merknaderSkjema = z
  .object({
    kilde: z.literal('vigo-kodeverk'),
    hentet: z.string(),
    /** Fagmerknader (FAM-koder) på vitnemål og kompetansebevis. */
    fagmerknader: z.array(merknadSkjema),
    /** Vitnemålsmerknader (VMM-koder). */
    vitnemalsmerknader: z.array(merknadSkjema),
    /**
     * Status på søkerønsker i inntaket (tabellen «wish-statuses»), etter nummeret. `videregaende` er elevplass og
     * `fagopplaering` læreplass. VIGO har bare tekst på bokmål.
     */
    sokerstatuser: z.array(merknadSkjema),
  })
  .strict();

export type Fagrelasjoner = z.infer<typeof fagrelasjonerSkjema>;
export type Fagvurdering = z.infer<typeof fagvurderingSkjema>;
export type Vigoavvik = z.infer<typeof avvikSkjema>;
export type Merknad = z.infer<typeof merknadSkjema>;
export type Merknader = z.infer<typeof merknaderSkjema>;
export type Merknadsliste = 'fagmerknader' | 'vitnemalsmerknader' | 'sokerstatuser';

/**
 * Skolenummeret i VIGO og organisasjonsnummeret i skoleregisteret (NSR) for skolene, i data/vigo/skolenummer.json
 * (avgjørelse 053). Kobler skolene på utdanning.no (skolenummer) til skolen brukeren har valgt (organisasjonsnummer).
 * Bare de to numrene lagres; VIGO har også navn og kontaktinformasjon til skoleledere, som ikke tas med.
 */
export const skolenummerSkjema = z
  .object({
    kilde: z.literal('vigo-kodeverk'),
    hentet: z.string(),
    orgnr: z.record(z.string().regex(/^\d{5}$/), z.string().regex(/^\d{9}$/)),
  })
  .strict();

export type Skolenummer = z.infer<typeof skolenummerSkjema>;
