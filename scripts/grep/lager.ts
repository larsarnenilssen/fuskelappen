// Lageret for Grep-hentingen (avgjørelse 060): detaljene for hvert element (programområde, opplæringsfag, fagkode,
// læreplan og kompetansemålsett) lagres med datoen Grep oppgir i listene («sist-endret»). Neste henting tar bare
// elementene som er nye eller endret, og de som er eldre enn sin maksimale alder. Da holder hentingen seg under
// grensen Grep har for antall forespørsler (om lag 1,7 i sekundet, oktober 2026), som gjorde en full henting for
// lang for kildesjekken.
//
// Lageret er én gzip-fil. I kildesjekken ligger den på grenen «grep-lager», som skrives over hver gang.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { gunzipSync, gzipSync } from 'node:zlib';
import type { Grepelement } from './bygg.ts';

export interface Lagerpost {
  /** «sist-endret» fra listen da elementet ble hentet, eller null når listen ikke hadde elementet. */
  sistEndret: string | null;
  /** Dato for hentingen (ÅÅÅÅ-MM-DD). */
  hentet: string;
  data: Grepelement;
}

/** Nøkkelen er `<type>/<kode>`, f.eks. `fagkoder/NOR1267`. */
export type Lager = Record<string, Lagerpost>;

const DAG = 86_400_000;

/**
 * Hvor mange dager en post kan brukes uten at den hentes på nytt, selv om «sist-endret» er uendret. Detaljene viser
 * også til andre elementer (navn og status), og de kan endres uten at datoen endres. Alderen spres mellom 180 og 359
 * dager etter koden, så ikke alt hentes på nytt samme uke.
 */
export function maksAlder(nokkel: string): number {
  return 180 + (createHash('sha1').update(nokkel).digest().readUInt32BE(0) % 180);
}

/** Om elementet må hentes fra Grep, eller om posten i lageret kan brukes. Ren funksjon. */
export function maaHentes(post: Lagerpost | undefined, nokkel: string, sistEndret: string | null, idag: string): boolean {
  if (!post) return true;
  if (sistEndret !== null && post.sistEndret !== sistEndret) return true;
  return (Date.parse(idag) - Date.parse(post.hentet)) / DAG >= maksAlder(nokkel);
}

/** Bare postene som ble brukt i en fullført henting, så elementer som ikke lenger er i bruk, forsvinner. */
export function beskjaer(lager: Lager, brukt: ReadonlySet<string>): Lager {
  return Object.fromEntries(Object.entries(lager).filter(([k]) => brukt.has(k)));
}

/** «sist-endret» per kode fra en liste fra Grep. */
export function sistEndretFra(liste: readonly Grepelement[]): Map<string, string> {
  return new Map(liste.flatMap((e) => (typeof e['sist-endret'] === 'string' ? [[e.kode, e['sist-endret']] as const] : [])));
}

export function lesLager(fil: string): Lager {
  if (!existsSync(fil)) return {};
  try {
    return JSON.parse(gunzipSync(readFileSync(fil)).toString('utf8')) as Lager;
  } catch (e) {
    console.log(`Grep-lageret kunne ikke leses (${e instanceof Error ? e.message : String(e)}). Henter alt på nytt.`);
    return {};
  }
}

/** Skriver til en midlertidig fil først, så et avbrudd ikke etterlater en halv fil. */
export function skrivLager(fil: string, lager: Lager): void {
  mkdirSync(dirname(fil), { recursive: true });
  const ny = `${fil}.ny`;
  writeFileSync(ny, gzipSync(JSON.stringify(lager)));
  renameSync(ny, fil);
}
