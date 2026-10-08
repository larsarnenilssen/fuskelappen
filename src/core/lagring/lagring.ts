// Lokal lagring med skjemaversjon, migrering og feilhåndtering.
// All brukerdata ligger på enheten. Ingenting sendes noe sted.
import * as z from 'zod/mini';

/** Testversjonen har egen nøkkel, så testing ikke endrer innstillingene og favorittene i appen (avgjørelse 045). */
export const LAGRINGSNOKKEL = __TESTVERSJON__ ? 'jukselappen-test' : 'jukselappen';
/**
 * Nøklene fra før appen het Jukselappen: Fuskelappen (0.17.0–0.33.0, avgjørelse 058) og Protokollen (før 0.17.0,
 * avgjørelse 034). Finnes det ingenting under den nye nøkkelen, leses den første av disse som har data. Neste
 * lagring skjer under den nye nøkkelen.
 */
export const GAMLE_LAGRINGSNOKLER: readonly string[] = __TESTVERSJON__ ? ['fuskelappen-test'] : ['fuskelappen', 'protokollen'];
/** Appnavnene eksportfiler kan ha: det nye og de gamle. */
const EKSPORTNAVN: readonly string[] = ['jukselappen', 'fuskelappen', 'protokollen'];
export const SKJEMAVERSJON = 3;

const skoleSkjema = z.strictObject({ id: z.nullable(z.string()), navn: z.string().check(z.minLength(1)) });

export const innstillingerSkjema = z.strictObject({
  malform: z.enum(['nb', 'nn']),
  tema: z.enum(['system', 'lys', 'mork']),
  fylke: z.nullable(z.string().check(z.regex(/^\d{2}$/))),
  skole: z.nullable(skoleSkjema),
  /**
   * Vis reglene for privatskoler der de er ulike (privatskolelova og forskriften, avgjørelse 075). Settes når brukeren
   * velger en privat skole, og kan slås av og på. Mangler i data lagret før 0.40.0, og betyr da nei.
   */
  privatskole: z.optional(z.boolean()),
});

/**
 * Forsiden slik brukeren har tilpasset den (avgjørelse 056): rekkefølgen på gruppene (favorittene og kategoriene),
 * gruppene som er lukket, og om forsiden bare viser favorittene under hver kategori. Tom rekkefølge er standard.
 * `apnet` er grupper som er lukket fra start på mobil, men som brukeren har åpnet, og `skjult` grupper brukeren har
 * slått av (gruppen «Neste datoer», avgjørelse 066, og visningene i panelet øverst, avgjørelse 081). Begge kan mangle i
 * data lagret før 0.37.0.
 */
export const forsideSkjema = z.strictObject({
  rekkefolge: z.array(z.string()),
  lukket: z.array(z.string()),
  bareFavoritter: z.boolean(),
  apnet: z.optional(z.array(z.string())),
  skjult: z.optional(z.array(z.string())),
  /** Visningen brukeren har valgt i panelet øverst: kalenderen, nyhetene eller tallene (avgjørelse 081). */
  visning: z.optional(z.string()),
  /** Dagens jukselapp på forsiden (fase 8). Av fra start, så den mangler til brukeren slår den på. */
  jukselapp: z.optional(z.boolean()),
  /**
   * Datoen dagens jukselapp sist ble vist først i panelet. Første besøk en ny dag står panelet på jukselappen (eier
   * 08.10.2026, alternativ C i avgjørelse 085).
   */
  jukselappVist: z.optional(z.string()),
});

export const lagretSkjema = z.strictObject({
  skjemaversjon: z.literal(SKJEMAVERSJON),
  innstillinger: innstillingerSkjema,
  favoritter: z.array(z.string().check(z.minLength(1))),
  scenarier: z.record(z.string(), z.unknown()),
  /** Kildevarsel brukeren har skjult til neste kildesjekk («kjort|status»), eller null. */
  skjultKildevarsel: z.nullable(z.string()),
  forside: forsideSkjema,
});

export type Innstillinger = z.infer<typeof innstillingerSkjema>;
export type Skolevalg = z.infer<typeof skoleSkjema>;
export type Lagret = z.infer<typeof lagretSkjema>;
export type Forsideoppsett = z.infer<typeof forsideSkjema>;

export const standardForside = (): Forsideoppsett => ({ rekkefolge: [], lukket: [], bareFavoritter: false });

export function standard(malform: 'nb' | 'nn' = 'nb'): Lagret {
  return {
    skjemaversjon: SKJEMAVERSJON,
    innstillinger: { malform, tema: 'system', fylke: null, skole: null },
    favoritter: [],
    scenarier: {},
    skjultKildevarsel: null,
    forside: standardForside(),
  };
}

/**
 * Migreringer fra eldre skjemaversjoner. Nøkkelen er versjonen det migreres FRA.
 * Legg til en funksjon her når SKJEMAVERSJON økes.
 */
export const migreringer: Record<number, (gammel: Record<string, unknown>) => Record<string, unknown>> = {
  // 1 → 2: mulighet for å skjule kildevarsel (0.1.1).
  1: (d) => ({ ...d, skjemaversjon: 2, skjultKildevarsel: null }),
  // 2 → 3: forsiden kan tilpasses, og bunnmenyen er tatt bort (avgjørelse 056).
  2: (d) => ({ ...d, skjemaversjon: 3, forside: standardForside() }),
};

/**
 * Favoritter med ny id etter at en side er flyttet, f.eks. eksamen fra Vurdering til Eksamen og klage (avgjørelse 078).
 * Byttes hver gang lagringen leses, uavhengig av skjemaversjonen, så de blir med uten ny versjon.
 */
export const FLYTTEDE_FAVORITTER: Readonly<Record<string, string>> = {
  'vurdering:eksamen': 'eksamen:eksamen',
  'vurdering:fag-og-svenneproven': 'eksamen:fag-og-svenneproven',
  'vurdering:klage-pa-karakter': 'eksamen:klage-pa-karakter',
  'vurdering:frister': 'eksamen:frister',
};

const flyttFavoritter = (liste: readonly string[]): string[] => [...new Set(liste.map((id) => FLYTTEDE_FAVORITTER[id] ?? id))];

export function migrer(raa: unknown): Lagret | null {
  if (typeof raa !== 'object' || raa === null) return null;
  let data = raa as Record<string, unknown>;
  let versjon = typeof data.skjemaversjon === 'number' ? data.skjemaversjon : 0;
  if (versjon > SKJEMAVERSJON) return null;
  while (versjon < SKJEMAVERSJON) {
    const steg = migreringer[versjon];
    if (!steg) return null;
    data = steg(data);
    versjon += 1;
  }
  const resultat = lagretSkjema.safeParse(data);
  return resultat.success ? { ...resultat.data, favoritter: flyttFavoritter(resultat.data.favoritter) } : null;
}

export interface Lager {
  getItem(nokkel: string): string | null;
  setItem(nokkel: string, verdi: string): void;
  removeItem(nokkel: string): void;
}

export type Lesestatus = 'ok' | 'ny' | 'ugyldig' | 'utilgjengelig';

export function lesLagret(lager: Lager | null, malform: 'nb' | 'nn' = 'nb'): { data: Lagret; status: Lesestatus } {
  if (!lager) return { data: standard(malform), status: 'utilgjengelig' };
  let tekst: string | null;
  try {
    tekst = lager.getItem(LAGRINGSNOKKEL);
    for (const gammel of GAMLE_LAGRINGSNOKLER) tekst ??= lager.getItem(gammel);
  } catch {
    return { data: standard(malform), status: 'utilgjengelig' };
  }
  if (tekst === null) return { data: standard(malform), status: 'ny' };
  try {
    const data = migrer(JSON.parse(tekst));
    return data ? { data, status: 'ok' } : { data: standard(malform), status: 'ugyldig' };
  } catch {
    return { data: standard(malform), status: 'ugyldig' };
  }
}

/** Returnerer false hvis lagring ikke er mulig (privat modus, fullt lager). */
export function skrivLagret(lager: Lager | null, data: Lagret): boolean {
  if (!lager) return false;
  try {
    lager.setItem(LAGRINGSNOKKEL, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

/**
 * Små valg i visningen som huskes på enheten, under egne nøkler, så hovedlagringen og skjemaversjonen ikke endres
 * (f.eks. «Min skole» eller «Alle» i Opplæringsløp, avgjørelse 053). Slettes med resten ved «Slett alt».
 */
export const VALGNOKLER = {
  lopvisning: `${LAGRINGSNOKKEL}-lopvisning`,
  /** Øktlengden sist valgt i en kalkulator, som JSON: { minutter, fritt } (eier 04.10.2026). */
  oktlengde: `${LAGRINGSNOKKEL}-oktlengde`,
  /** Filteret på nyhetene på forsiden, f.eks. «type:myndighet» eller «kilde:udir» (fase 7b). */
  nyhetsfilter: `${LAGRINGSNOKKEL}-nyhetsfilter`,
} as const;
export type Valg = keyof typeof VALGNOKLER;

export function lesValg(lager: Lager | null, valg: Valg): string | null {
  try {
    let verdi = lager?.getItem(VALGNOKLER[valg]) ?? null;
    // Valg lagret før appen het Jukselappen (avgjørelse 058).
    for (const gammel of GAMLE_LAGRINGSNOKLER) verdi ??= lager?.getItem(`${gammel}-${valg}`) ?? null;
    return verdi;
  } catch {
    return null;
  }
}

export function skrivValg(lager: Lager | null, valg: Valg, verdi: string): void {
  try {
    lager?.setItem(VALGNOKLER[valg], verdi);
  } catch {
    // Valget gjelder da bare til siden lastes på nytt.
  }
}

export function slettLagret(lager: Lager | null): void {
  try {
    // De gamle nøklene slettes også, ellers ville data derfra bli lest igjen (avgjørelse 058).
    for (const nokkel of [LAGRINGSNOKKEL, ...GAMLE_LAGRINGSNOKLER]) {
      lager?.removeItem(nokkel);
      for (const valg of Object.keys(VALGNOKLER)) lager?.removeItem(`${nokkel}-${valg}`);
    }
  } catch {
    // Ingenting å gjøre; data i minnet nullstilles av kalleren.
  }
}

export interface Eksportfil {
  app: 'jukselappen';
  eksportert: string;
  appversjon: string;
  data: Lagret;
}

export function lagEksport(data: Lagret, appversjon: string, naa: Date): string {
  const fil: Eksportfil = { app: 'jukselappen', eksportert: naa.toISOString(), appversjon, data };
  return JSON.stringify(fil, null, 2);
}

/** Leser en eksportfil. Returnerer null hvis filen ikke er gyldig. */
export function lesEksport(tekst: string): Lagret | null {
  try {
    const fil = JSON.parse(tekst) as { app?: unknown; data?: unknown } | null;
    // Filer eksportert før appen het Jukselappen, har app: 'fuskelappen' eller 'protokollen'.
    if (!fil || typeof fil.app !== 'string' || !EKSPORTNAVN.includes(fil.app)) return null;
    return migrer(fil.data);
  } catch {
    return null;
  }
}

export function eksportfilnavn(naa: Date): string {
  return `jukselappen-${naa.toISOString().slice(0, 10)}.json`;
}

/** Nytt fylke nullstiller skolen hvis skolen ikke hører til fylket. */
export function velgFylke(inn: Innstillinger, fylke: string | null, skolensFylke: (id: string) => string | null): Innstillinger {
  if (fylke === null) return { ...inn, fylke: null, skole: null };
  const skole = inn.skole;
  const beholdSkole = skole !== null && skole.id !== null && skolensFylke(skole.id) === fylke;
  return { ...inn, fylke, skole: beholdSkole ? skole : null };
}
