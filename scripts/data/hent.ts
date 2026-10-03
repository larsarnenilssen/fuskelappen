// Felles hjelpere for hentingen fra kildene til data/ (avgjørelse 049 og 053): JSON fra et API med nye forsøk, og
// skriving av en datafil bare når innholdet er endret, så tidspunktet for hentingen alene ikke gir en ny versjon.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { USER_AGENT } from '../kilder/metoder.ts';

/** JSON fra en adresse, med inntil tre forsøk. */
export async function hentJson(url: string, init: RequestInit = {}): Promise<unknown> {
  let feil: unknown;
  for (let forsok = 1; forsok <= 3; forsok++) {
    try {
      const r = await fetch(url, { ...init, headers: { Accept: 'application/json', 'User-Agent': USER_AGENT, ...init.headers }, signal: AbortSignal.timeout(60_000) });
      if (!r.ok) throw new Error(`${url} svarte ${r.status}`);
      return (await r.json()) as unknown;
    } catch (e) {
      feil = e;
      await new Promise((v) => setTimeout(v, 2000 * forsok));
    }
  }
  throw feil;
}

/** Kjører `oppgave` for alle elementene, `samtidige` om gangen, og gir svarene i samme rekkefølge. */
export async function iRunder<T, R>(liste: readonly T[], samtidige: number, oppgave: (x: T) => Promise<R>): Promise<R[]> {
  const ut: R[] = [];
  for (let i = 0; i < liste.length; i += samtidige) ut.push(...(await Promise.all(liste.slice(i, i + samtidige).map(oppgave))));
  return ut;
}

/** Kompakt JSON med én linje per oppføring, så filen er liten og endringer er lette å lese i git. */
export function vigoJson(d: object): string {
  const deler = Object.entries(d).map(([k, v]) => {
    if (v && typeof v === 'object') {
      const linjer = Array.isArray(v) ? v.map((x) => JSON.stringify(x)) : Object.entries(v as object).map(([n, x]) => `${JSON.stringify(n)}:${JSON.stringify(x)}`);
      return `${JSON.stringify(k)}: ${Array.isArray(v) ? '[' : '{'}\n${linjer.join(',\n')}\n${Array.isArray(v) ? ']' : '}'}`;
    }
    return `${JSON.stringify(k)}: ${JSON.stringify(v)}`;
  });
  return `{\n${deler.join(',\n')}\n}\n`;
}
/** Forrige versjon av en datafil, eller null. */
export function lesForrige<T>(fil: string): T | null {
  return existsSync(fil) ? (JSON.parse(readFileSync(fil, 'utf8')) as T) : null;
}

/** Skriver filen (kompakt, én linje per oppføring) når innholdet uten tidspunktet er endret. Gir true når den ble skrevet. */
export function skrivHvisEndret<T extends { hentet: string }>(fil: string, forrige: T | null, ny: T): boolean {
  const utenTid = (d: T) => vigoJson({ ...d, hentet: '' });
  if (forrige && utenTid(forrige) === utenTid(ny)) return false;
  mkdirSync(dirname(fil), { recursive: true });
  writeFileSync(fil, vigoJson(ny));
  return true;
}

/** Skriver endringene til kildesjekken (.generert/<navn>-endringer.json). */
export function skrivEndringer(rot: string, navn: string, innhold: object): void {
  mkdirSync(join(rot, '.generert'), { recursive: true });
  writeFileSync(join(rot, '.generert', `${navn}-endringer.json`), `${JSON.stringify(innhold, null, 2)}\n`);
}
