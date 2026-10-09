// Lokal lagring med skjemaversjon, migrering og feilhåndtering.
// All brukerdata ligger på enheten. Ingenting sendes noe sted.
import * as z from 'zod/mini';
import { egenRegelSkjema, type EgenRegel } from '../lokale/skjema.ts';

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
  /**
   * Rollen brukeren valgte i velkomsten (fase 10), f.eks. `laerer` eller `radgiver`. Gir anbefalte favoritter. Lagres
   * som tekst og leses med `lesRolle()`, så en rolle som er tatt bort, ikke gjør lagringen ugyldig.
   */
  rolle: z.optional(z.string()),
});

/**
 * Forsiden slik brukeren har tilpasset den (avgjørelse 056): rekkefølgen på gruppene (favorittene og kategoriene),
 * gruppene som er lukket, og om forsiden bare viser favorittene under hver kategori. Tom rekkefølge er standard.
 * `apnet` er grupper som er lukket fra start på mobil, men som brukeren har åpnet, og `skjult` grupper brukeren har
 * slått av (gruppen «Neste datoer», avgjørelse 066, visningene i Aktuelt, avgjørelse 081, og `aktuelt` når Aktuelt er
 * skjult helt, avgjørelse 102). `sidekolonne` i `skjult` er fra bryteren som ble tatt bort i avgjørelse 102, og gir
 * Aktuelt lukket på skrivebord. Begge kan mangle i data lagret før 0.37.0.
 */
export const forsideSkjema = z.strictObject({
  rekkefolge: z.array(z.string()),
  lukket: z.array(z.string()),
  bareFavoritter: z.boolean(),
  apnet: z.optional(z.array(z.string())),
  skjult: z.optional(z.array(z.string())),
  /** Visningen brukeren har valgt i Aktuelt: kalenderen, nyhetene, tallene eller jukselappen (avgjørelse 081 og 102). */
  visning: z.optional(z.string()),
  /** Dagens jukselapp på forsiden (fase 8). Av fra start, så den mangler til brukeren slår den på. */
  jukselapp: z.optional(z.boolean()),
  /** Brukt i 0.43.0: datoen dagens jukselapp sist ble vist først. Leses ikke lenger, men kan finnes i lagrede data. */
  jukselappVist: z.optional(z.string()),
  /**
   * Brukt til og med 1.1.0 (avgjørelse 086, variant B): datoen brukeren gikk fra dagens jukselapp med «Tilbake
   * til …». Leses ikke lenger etter avgjørelse 102, men kan finnes i lagrede data.
   */
  jukselappForlatt: z.optional(z.string()),
});

export const lagretSkjema = z.strictObject({
  skjemaversjon: z.literal(SKJEMAVERSJON),
  innstillinger: innstillingerSkjema,
  favoritter: z.array(z.string().check(z.minLength(1))),
  scenarier: z.record(z.string(), z.unknown()),
  /** Kildevarsel brukeren har skjult til neste kildesjekk («kjort|status»), eller null. */
  skjultKildevarsel: z.nullable(z.string()),
  forside: forsideSkjema,
  /**
   * Brukerens egne lokale regler (fase 9, avgjørelse 093). Valgfritt, så eldre data kan leses uten migrering. Hver
   * regel leses for seg med `egneRegler()`, så én ugyldig regel ikke gjør resten av lagringen ugyldig.
   */
  egneRegler: z.optional(z.array(z.unknown())),
  /** Datoen velkomsten ble lukket første gang (fase 10). Mangler til da, og i data fra før velkomsten kom. */
  velkomst: z.optional(z.string()),
});

export type Innstillinger = z.infer<typeof innstillingerSkjema>;
export type Skolevalg = z.infer<typeof skoleSkjema>;
export type Lagret = z.infer<typeof lagretSkjema>;
export type Forsideoppsett = z.infer<typeof forsideSkjema>;

/** Brukerens egne regler som passer skjemaet. Ugyldige regler hoppes over. */
export function egneRegler(data: Pick<Lagret, 'egneRegler'>): EgenRegel[] {
  return (data.egneRegler ?? []).flatMap((r) => {
    const lest = egenRegelSkjema.safeParse(r);
    return lest.success ? [lest.data] : [];
  });
}

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
  // Elevundersøkelsen ble egen modul (avgjørelse 087).
  'skolemiljo:elevundersokelsen': 'elevundersokelsen:oversikt',
};

const flyttFavoritter = (liste: readonly string[]): string[] => [...new Set(liste.map((id) => FLYTTEDE_FAVORITTER[id] ?? id))];

/** Om lesingen måtte rette noe: et felt som var ugyldig eller manglet, og fikk reserveverdien. */
interface Lesing {
  avvik: boolean;
}

const erObjekt = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * Leser ett felt mot skjemaet for feltet (avgjørelse 097). I en liste hoppes ugyldige elementer over, og et objekt leses
 * felt for felt. Et ugyldig felt får reserveverdien, eller tas bort hvis det er valgfritt.
 */
function lesFelt(skjema: z.ZodMiniType, verdi: unknown, reserve: unknown, lesing: Lesing): { verdi: unknown } | null {
  if (verdi !== undefined) {
    if (skjema instanceof z.ZodMiniObject && erObjekt(verdi) && erObjekt(reserve)) return { verdi: lesObjekt(skjema, verdi, reserve, lesing) };
    const lest = skjema.safeParse(verdi);
    if (lest.success) return { verdi: lest.data };
    if (skjema instanceof z.ZodMiniArray && Array.isArray(verdi)) {
      const element = skjema.def.element as z.ZodMiniType;
      lesing.avvik = true;
      return {
        verdi: verdi.flatMap((e) => {
          const l = element.safeParse(e);
          return l.success ? [l.data] : [];
        }),
      };
    }
    lesing.avvik = true;
  }
  // Mangler feltet eller er det ugyldig: et valgfritt felt utelates, et påkrevd får reserveverdien.
  if (skjema.safeParse(undefined).success) return null;
  if (verdi === undefined) lesing.avvik = true;
  return { verdi: reserve };
}

/**
 * Leser et objekt felt for felt (avgjørelse 097). Et ugyldig felt gjør ikke resten ugyldig, og felt skjemaet ikke kjenner
 * (fra en nyere versjon, eller som en eldre versjon brukte), beholdes uendret, så de blir med ved neste lagring.
 */
function lesObjekt<S extends z.ZodMiniObject>(skjema: S, raa: Record<string, unknown>, reserve: Record<string, unknown>, lesing: Lesing): z.infer<S> {
  const shape = skjema.shape as Record<string, z.ZodMiniType>;
  const ut: Record<string, unknown> = {};
  for (const [nokkel, verdi] of Object.entries(raa)) if (!(nokkel in shape)) ut[nokkel] = verdi;
  for (const [nokkel, feltskjema] of Object.entries(shape)) {
    const lest = lesFelt(feltskjema, raa[nokkel], reserve[nokkel], lesing);
    if (lest) ut[nokkel] = lest.verdi;
  }
  // Hvert kjent felt er lest mot sitt eget skjema, og ukjente felt er tillatt i lagrede data.
  return ut as z.infer<S>;
}

/**
 * Leser lagrede data: migrerer fra eldre skjemaversjoner og leser så felt for felt. Null bare når dataene ikke kan leses
 * i det hele tatt: ikke et objekt, en ukjent eldre versjon eller en nyere versjon (avgjørelse 097).
 */
function lesData(raa: unknown, malform: 'nb' | 'nn' = 'nb'): { data: Lagret; avvik: boolean } | null {
  if (!erObjekt(raa)) return null;
  let data = raa;
  let versjon = typeof data.skjemaversjon === 'number' ? data.skjemaversjon : 0;
  // En nyere versjon kan ha endret feltene på en måte denne versjonen ikke kjenner. Råteksten tas da vare på (lesLagret).
  if (versjon > SKJEMAVERSJON) return null;
  while (versjon < SKJEMAVERSJON) {
    const steg = migreringer[versjon];
    if (!steg) return null;
    data = steg(data);
    versjon += 1;
  }
  const lesing: Lesing = { avvik: false };
  const lest = lesObjekt(lagretSkjema, data, standard(malform), lesing);
  return { data: { ...lest, favoritter: flyttFavoritter(lest.favoritter) }, avvik: lesing.avvik };
}

export function migrer(raa: unknown, malform: 'nb' | 'nn' = 'nb'): Lagret | null {
  return lesData(raa, malform)?.data ?? null;
}

export interface Lager {
  getItem(nokkel: string): string | null;
  setItem(nokkel: string, verdi: string): void;
  removeItem(nokkel: string): void;
}

/** `reparert`: dataene ble lest, men ett eller flere felt var ugyldige og fikk reserveverdien (avgjørelse 097). */
export type Lesestatus = 'ok' | 'ny' | 'reparert' | 'ugyldig' | 'utilgjengelig';

/**
 * Nøkkelen der råteksten tas vare på før data som ikke kunne leses helt, blir overskrevet ved neste lagring (avgjørelse
 * 097). Den siste kopien gjelder. Kan gjenopprettes i Innstillinger (avgjørelse 104). Slettes med resten ved «Slett alt».
 */
export const SIKKERHETSKOPINOKKEL = `${LAGRINGSNOKKEL}-sikkerhetskopi`;

function taSikkerhetskopi(lager: Lager, tekst: string): void {
  try {
    lager.setItem(SIKKERHETSKOPINOKKEL, tekst);
  } catch {
    // Fullt lager: da kan heller ikke de nye dataene lagres, så ingenting blir overskrevet.
  }
}

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
  let lest: ReturnType<typeof lesData> = null;
  try {
    lest = lesData(JSON.parse(tekst), malform);
  } catch {
    // Ikke gyldig JSON: behandles som ugyldige data under.
  }
  if (lest && !lest.avvik) return { data: lest.data, status: 'ok' };
  taSikkerhetskopi(lager, tekst);
  return lest ? { data: lest.data, status: 'reparert' } : { data: standard(malform), status: 'ugyldig' };
}

/**
 * Leser sikkerhetskopien (avgjørelse 104). Null når det ikke finnes noen, eller når den ikke kan leses av denne
 * versjonen: ødelagt JSON, en ukjent eldre eller en nyere skjemaversjon. Kopien leses felt for felt som lagrede data.
 */
export function lesSikkerhetskopi(lager: Lager | null, malform: 'nb' | 'nn' = 'nb'): Lagret | null {
  try {
    const tekst = lager?.getItem(SIKKERHETSKOPINOKKEL) ?? null;
    return tekst === null ? null : (lesData(JSON.parse(tekst), malform)?.data ?? null);
  } catch {
    return null;
  }
}

/** JSON med nøklene sortert, så to like dataobjekter gir samme tekst uansett rekkefølgen på feltene. */
function sortertJson(verdi: unknown): string {
  return JSON.stringify(verdi, (_nokkel, v: unknown) =>
    erObjekt(v) ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) : v,
  );
}

/** Om to sett lagrede data har det samme innholdet. */
export function sammeData(a: Lagret, b: Lagret): boolean {
  return sortertJson(a) === sortertJson(b);
}

/**
 * Gjenoppretter sikkerhetskopien (avgjørelse 104): kopien blir de lagrede dataene, og `gjeldende` (det som var lagret)
 * blir den nye sikkerhetskopien, så gjenopprettingen kan angres ved å gjøre det samme én gang til. Returnerer dataene
 * fra kopien, eller null hvis det ikke finnes noen gyldig kopi eller den ikke kunne skrives. Da er ingenting endret.
 */
export function gjenopprettSikkerhetskopi(lager: Lager | null, gjeldende: Lagret, malform: 'nb' | 'nn' = 'nb'): Lagret | null {
  const kopi = lesSikkerhetskopi(lager, malform);
  if (!lager || !kopi) return null;
  if (!skrivLagret(lager, kopi)) return null;
  try {
    lager.setItem(SIKKERHETSKOPINOKKEL, JSON.stringify(gjeldende));
    return kopi;
  } catch {
    // Kopien av det gjeldende kunne ikke lagres: det gjeldende skrives tilbake, så ingenting går tapt.
    skrivLagret(lager, gjeldende);
    return null;
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
    lager?.removeItem(SIKKERHETSKOPINOKKEL);
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
