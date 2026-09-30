// Hvilke deler av en kilde som er endret. Teksten deles i biter (omtrent setninger), og hver bit får et kort
// fingeravtrykk. Fingeravtrykkene fra sist kilden var godkjent lagres i data/status/kildetekst.json (bare
// fingeravtrykk, ikke tekst, fordi flere kilder har opphavsrett). Ved endring sammenlignes bitene, og de nye
// bitene vises med punktet de står under. Ren logikk, testes i tests/unit/avsnitt.test.ts (avgjørelse 018).
import { createHash } from 'node:crypto';
import * as z from 'zod/mini';

export const kildetekstFil = z.strictObject({
  skjema: z.literal(1),
  kilder: z.record(
    z.string(),
    z.strictObject({
      /** Fingeravtrykket til kilden da bitene ble lagret (det godkjente). */
      fingeravtrykk: z.string(),
      lagret: z.string(),
      biter: z.array(z.string()),
    }),
  ),
});

export type Kildetekstfil = z.infer<typeof kildetekstFil>;

export function lesKildetekst(data: unknown): Kildetekstfil | null {
  const r = kildetekstFil.safeParse(data);
  return r.success ? r.data : null;
}

export interface Bit {
  tekst: string;
  start: number;
  hash: string;
}

/** Kort fingeravtrykk for én bit. 12 heksadesimale tegn er nok til å skille bitene i én kilde. */
export function bitHash(tekst: string): string {
  return createHash('sha256').update(tekst, 'utf8').digest('hex').slice(0, 12);
}

/** Forkortelser som ikke avslutter en setning. */
const FORKORTELSE = /(?:^|[\s(])(?:kr|pr|nr|jf|ca|dvs|hhv|pga|evt|inkl|ang|bl\.a|m\.m|m\.v|m\.fl|f\.eks|t\.o\.m|o\.l)\.$/i;

/**
 * Deler normalisert tekst i biter etter punktum, spørsmålstegn og utropstegn som følges av mellomrom og stor
 * bokstav, tall, «§» eller parentes. Etter forkortelser som «kr.» og «jf.» deles ikke teksten.
 */
export function delIBiter(tekst: string): Bit[] {
  const biter: Bit[] = [];
  const skille = /(?<=[.!?])\s+(?=[A-ZÆØÅ0-9§«(])/g;
  let start = 0;
  for (const m of tekst.matchAll(skille)) {
    if (FORKORTELSE.test(tekst.slice(Math.max(start, m.index - 8), m.index))) continue;
    const del = tekst.slice(start, m.index);
    if (del.trim()) biter.push({ tekst: del, start, hash: bitHash(del) });
    start = m.index + m[0].length;
  }
  const rest = tekst.slice(start);
  if (rest.trim()) biter.push({ tekst: rest, start, hash: bitHash(rest) });
  return biter;
}

export interface Tekstendring {
  /** Punktet i kilden der endringen står, f.eks. «5.1» eller «§ 10-4», eller null hvis det ikke finnes. */
  punkt: string | null;
  /** De nye bitene, slik de står i kilden nå. Tom når tekst bare er fjernet. */
  ny: string[];
  /** Antall biter som er fjernet eller erstattet. */
  fjernet: number;
}

/**
 * Lengste felles delsekvens av fingeravtrykkene. Gir hvilke biter i den nye teksten som er uendret.
 * Kildene har noen tusen biter, så en enkel tabell holder.
 */
function felles(gamle: readonly string[], nye: readonly string[]): { i: number; j: number }[] {
  const n = gamle.length;
  const m = nye.length;
  const lengde = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    const rad = lengde[i] as Uint32Array;
    const neste = lengde[i + 1] as Uint32Array;
    for (let j = m - 1; j >= 0; j--) {
      rad[j] = gamle[i] === nye[j] ? (neste[j + 1] as number) + 1 : Math.max(neste[j] as number, rad[j + 1] as number);
    }
  }
  const par: { i: number; j: number }[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (gamle[i] === nye[j]) {
      par.push({ i, j });
      i++;
      j++;
    } else if ((lengde[i + 1] as Uint32Array)[j] as number >= ((lengde[i] as Uint32Array)[j + 1] as number)) {
      i++;
    } else {
      j++;
    }
  }
  return par;
}

/** Et punkt i en avtale eller lov: «5.1.», «7.3», «12.4», «§ 10-4», «§ 6» eller «a)». */
const PUNKT = /(?:^|\s)(§\s?\d+[a-z]?(?:-\d+[a-z]?)?|\d{1,2}(?:\.\d{1,2}){0,3})\.?\s(?=[A-ZÆØÅ])/g;

/** Nærmeste punkt foran en posisjon i teksten, også et punkt som begynner akkurat der. */
export function naermestePunkt(tekst: string, posisjon: number): string | null {
  let funnet: string | null = null;
  for (const m of tekst.slice(0, posisjon + 40).matchAll(PUNKT)) {
    if (m.index > posisjon) break;
    funnet = (m[1] as string).replace(/\s/g, ' ');
  }
  return funnet;
}

/** Sammenligner de godkjente bitene med teksten nå. Tom liste når ingenting er endret. */
export function finnEndringer(gamle: readonly string[], tekst: string): Tekstendring[] {
  const nye = delIBiter(tekst);
  const par = felles(
    gamle,
    nye.map((b) => b.hash),
  );
  const endringer: Tekstendring[] = [];
  let i = 0;
  let j = 0;
  for (const p of [...par, { i: gamle.length, j: nye.length }]) {
    const fjernet = p.i - i;
    const nyeBiter = nye.slice(j, p.j);
    if (fjernet > 0 || nyeBiter.length > 0) {
      const posisjon = nyeBiter[0]?.start ?? nye[p.j]?.start ?? tekst.length;
      endringer.push({ punkt: naermestePunkt(tekst, posisjon), ny: nyeBiter.map((b) => b.tekst), fjernet });
    }
    i = p.i + 1;
    j = p.j + 1;
  }
  return endringer;
}
