// Skjema for dataene fra VIGO Kodeverksbase (kodeverk.vigo.no) i data/vigo/. Brukes av scripts/hent-vigo.ts før
// filene skrives, og av testene. Appen bruker bare typene (avgjørelse 026).
import { z } from 'zod';

const kode = z.string().min(1);

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
