// Det som er nytt i hver versjon av appen, til meldingen om ny versjon (avgjørelse 088). Rene funksjoner.
//
// Punktene skrives i content/versjoner.yaml i versjons-PR-en. Bygget legger punktene for versjonen i package.json i
// versjon.json ved siden av appen. Når en ny versjon er lastet ned, henter den gamle appen filen og viser
// meldingen bare når versjonsnummeret er et annet. Nye data (nyheter, kildestatus, tall) gir ingen melding.
/** Det som er nytt i én versjon, slik det står i content/versjoner.yaml (skjemaet står i skjema.ts). */
export interface Versjonsomtale {
  versjon: string;
  dato: string;
  nytt: { nb: string; nn: string }[];
}

/** Innholdet i versjon.json: versjonen som er publisert, og punktene på begge målformer. */
export interface Versjonsfil {
  versjon: string;
  nytt: { nb: string[]; nn: string[] } | null;
}

/** versjon.json for en versjon. Uten omtale i versjoner.yaml blir punktene null, og meldingen vises uten liste. */
export function lagVersjonsfil(versjoner: readonly Versjonsomtale[], versjon: string): Versjonsfil {
  const omtale = versjoner.find((v) => v.versjon === versjon);
  return { versjon, nytt: omtale ? { nb: omtale.nytt.map((p) => p.nb), nn: omtale.nytt.map((p) => p.nn) } : null };
}

/** Leser versjon.json slik den ble hentet. Gir null når innholdet ikke har riktig form. */
export function lesVersjonsfil(data: unknown): Versjonsfil | null {
  if (typeof data !== 'object' || data === null) return null;
  const { versjon, nytt } = data as Record<string, unknown>;
  if (typeof versjon !== 'string') return null;
  if (nytt === null) return { versjon, nytt: null };
  if (typeof nytt !== 'object' || nytt === undefined) return null;
  const { nb, nn } = nytt as Record<string, unknown>;
  const liste = (x: unknown): x is string[] => Array.isArray(x) && x.every((s) => typeof s === 'string');
  return liste(nb) && liste(nn) ? { versjon, nytt: { nb, nn } } : null;
}

/** Sammenligner to versjonsnumre som 0.43.0: negativ når a er eldre enn b, 0 når de er like. */
export function sammenlignVersjon(a: string, b: string): number {
  const x = a.split('.').map(Number);
  const y = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const d = (x[i] ?? 0) - (y[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}

export type Oppdatering = { type: 'stille' } | { type: 'melding'; versjon: string | null; nytt: Versjonsfil['nytt'] };

/**
 * Hva appen gjør når en ny versjon er lastet ned:
 * - `stille` når versjonsnummeret er det samme, altså bare nye data: den nye versjonen tas i bruk neste gang appen
 *   startes eller kommer tilbake i forgrunnen, uten melding.
 * - `melding` med punktene når versjonsnummeret er høyere.
 * - `melding` uten punkter når versjon.json ikke kunne hentes, eller er eldre enn appen (en mellomlagret fil).
 */
export function vurderOppdatering(fil: Versjonsfil | null, appversjon: string): Oppdatering {
  if (fil && fil.versjon === appversjon) return { type: 'stille' };
  if (fil && sammenlignVersjon(fil.versjon, appversjon) > 0) return { type: 'melding', versjon: fil.versjon, nytt: fil.nytt };
  return { type: 'melding', versjon: null, nytt: null };
}
