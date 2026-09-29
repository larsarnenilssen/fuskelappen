// Lokal lagring med skjemaversjon, migrering og feilhåndtering.
// All brukerdata ligger på enheten. Ingenting sendes noe sted.
import * as z from 'zod/mini';

export const LAGRINGSNOKKEL = 'protokollen';
export const SKJEMAVERSJON = 1;

const skoleSkjema = z.strictObject({ id: z.nullable(z.string()), navn: z.string().check(z.minLength(1)) });

export const innstillingerSkjema = z.strictObject({
  malform: z.enum(['nb', 'nn']),
  tema: z.enum(['system', 'lys', 'mork']),
  fylke: z.nullable(z.string().check(z.regex(/^\d{2}$/))),
  skole: z.nullable(skoleSkjema),
});

export const lagretSkjema = z.strictObject({
  skjemaversjon: z.literal(SKJEMAVERSJON),
  innstillinger: innstillingerSkjema,
  favoritter: z.array(z.string().check(z.minLength(1))),
  scenarier: z.record(z.string(), z.unknown()),
});

export type Innstillinger = z.infer<typeof innstillingerSkjema>;
export type Skolevalg = z.infer<typeof skoleSkjema>;
export type Lagret = z.infer<typeof lagretSkjema>;

export function standard(malform: 'nb' | 'nn' = 'nb'): Lagret {
  return {
    skjemaversjon: SKJEMAVERSJON,
    innstillinger: { malform, tema: 'system', fylke: null, skole: null },
    favoritter: [],
    scenarier: {},
  };
}

/**
 * Migreringer fra eldre skjemaversjoner. Nøkkelen er versjonen det migreres FRA.
 * Legg til en funksjon her når SKJEMAVERSJON økes.
 */
export const migreringer: Record<number, (gammel: Record<string, unknown>) => Record<string, unknown>> = {};

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
  return resultat.success ? resultat.data : null;
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

export function slettLagret(lager: Lager | null): void {
  try {
    lager?.removeItem(LAGRINGSNOKKEL);
  } catch {
    // Ingenting å gjøre; data i minnet nullstilles av kalleren.
  }
}

export interface Eksportfil {
  app: 'protokollen';
  eksportert: string;
  appversjon: string;
  data: Lagret;
}

export function lagEksport(data: Lagret, appversjon: string, naa: Date): string {
  const fil: Eksportfil = { app: 'protokollen', eksportert: naa.toISOString(), appversjon, data };
  return JSON.stringify(fil, null, 2);
}

/** Leser en eksportfil. Returnerer null hvis filen ikke er gyldig. */
export function lesEksport(tekst: string): Lagret | null {
  try {
    const fil = JSON.parse(tekst) as Partial<Eksportfil> | null;
    if (!fil || fil.app !== 'protokollen') return null;
    return migrer(fil.data);
  } catch {
    return null;
  }
}

export function eksportfilnavn(naa: Date): string {
  return `protokollen-${naa.toISOString().slice(0, 10)}.json`;
}

/** Nytt fylke nullstiller skolen hvis skolen ikke hører til fylket. */
export function velgFylke(inn: Innstillinger, fylke: string | null, skolensFylke: (id: string) => string | null): Innstillinger {
  if (fylke === null) return { ...inn, fylke: null, skole: null };
  const skole = inn.skole;
  const beholdSkole = skole !== null && skole.id !== null && skolensFylke(skole.id) === fylke;
  return { ...inn, fylke, skole: beholdSkole ? skole : null };
}
