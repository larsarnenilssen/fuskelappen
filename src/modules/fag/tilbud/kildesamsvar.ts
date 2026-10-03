// Samsvar mellom kildene for løpene i videregående (avgjørelse 052): Grep («bygger på»), VIGO Kodeverksbase
// (grunnlag for inntak) og utdanning.no (løpene i utdanningsløpet). Appen viser løpene fra Grep, med VIGO for
// påbygging der Grep ikke sier noe (medGrunnlagFraVigo). Regelen for merking er fast og gjelder alle løp:
// - En kilde har en mening om koblingen fra → til bare når den beskriver løpet ved den ene enden: Grep når
//   programområdet `til` har «bygger på» i Grep, VIGO når `fra` har grunnlag for inntak i VIGO, og utdanning.no når
//   `fra` står med løpet videre på utdanning.no.
// - En kilde med mening som ikke har koblingen, er uenig. Kilder uten mening teller ikke.
// - utdanning.no bruker noen koder Grep ikke har (f.eks. PBPBY4YK for Vg4 påbygging etter yrkeskompetanse). En slik
//   kode regnes som samme programområde som koden i Grep med de samme seks første tegnene.
// Rene funksjoner.
import type { Fagindeks } from '../skjema.ts';
import type { Utdanningslop } from '../utdanning/skjema.ts';
import type { Tilbud } from './modell.ts';

export type Lopkilde = 'grep' | 'vigo' | 'utdanning';

export interface Lopskilder {
  /** Fagindeksen fra Grep, slik den er hentet (uten grunnlaget fra VIGO). */
  grep: Pick<Fagindeks, 'programomrader'>;
  /** Grunnlaget for inntak i VIGO: fra → til. */
  vigo: Readonly<Record<string, readonly string[]>>;
  /** Løpene fra utdanning.no, eller null før første henting. */
  utdanning: Pick<Utdanningslop, 'videre'> | null;
}

/** Kildene som har en mening om koblingen fra → til, men ikke har den. Tom liste: ingen kilde er uenig. */
export function manglerI(fra: string, til: string, k: Lopskilder): Lopkilde[] {
  const ut: Lopkilde[] = [];
  const bygger = k.grep.programomrader[til]?.bygger ?? [];
  if (bygger.length > 0 && !bygger.includes(fra)) ut.push('grep');
  const vigo = k.vigo[fra];
  if (vigo && !vigo.includes(til)) ut.push('vigo');
  const uno = k.utdanning?.videre[fra];
  if (uno && !uno.some((t) => t === til || (t.slice(0, 6) === til.slice(0, 6) && !k.grep.programomrader[t]))) ut.push('utdanning');
  return ut;
}

/**
 * Løpene på et tilbud der kildene er uenige: programområdet det gjelder, med kildene som mangler koblingen.
 * Overgangen med opphentingsfag (Tilbud.opphenting) er med i kontrollen, men merkes ikke i appen, fordi eier har
 * bekreftet ordningen (eier 03.10.2026, avgjørelse 051).
 */
export function uenigheter(t: Pick<Tilbud, 'kode' | 'fra' | 'kryssFra' | 'videre' | 'pabygging' | 'kryssTil'>, k: Lopskilder): Record<string, Lopkilde[]> {
  const ut: Record<string, Lopkilde[]> = {};
  for (const b of [...t.fra, ...t.kryssFra]) {
    const m = manglerI(b, t.kode, k);
    if (m.length > 0) ut[b] = m;
  }
  for (const b of [...t.videre, ...t.pabygging, ...t.kryssTil]) {
    const m = manglerI(t.kode, b, k);
    if (m.length > 0) ut[b] = m;
  }
  return ut;
}

/** Alle koblinger mellom programområder i Grep som minst én kilde har, med kildene som har dem og som mangler dem. */
export function alleKoblinger(k: Lopskilder): { fra: string; til: string; har: Lopkilde[]; mangler: Lopkilde[] }[] {
  const finnes = (kode: string) => k.grep.programomrader[kode] !== undefined;
  const par = new Map<string, Set<Lopkilde>>();
  const legg = (fra: string, til: string, kilde: Lopkilde) => {
    if (!finnes(fra) || !finnes(til) || fra === til) return;
    const n = `${fra}>${til}`;
    par.set(n, (par.get(n) ?? new Set()).add(kilde));
  };
  for (const [til, p] of Object.entries(k.grep.programomrader)) for (const fra of p.bygger) legg(fra, til, 'grep');
  for (const [fra, tiler] of Object.entries(k.vigo)) for (const til of tiler) legg(fra, til, 'vigo');
  for (const [fra, tiler] of Object.entries(k.utdanning?.videre ?? {})) {
    for (const t of tiler) {
      // En kode Grep ikke har, regnes som programområdet i Grep med de samme seks første tegnene (f.eks. PBPBY4YK).
      const til = finnes(t) ? t : Object.keys(k.grep.programomrader).find((g) => g.slice(0, 6) === t.slice(0, 6) && /^.{6}-+$/.test(g));
      if (til) legg(fra, til, 'utdanning');
    }
  }
  return [...par]
    .map(([n, har]) => {
      const [fra = '', til = ''] = n.split('>');
      return { fra, til, har: [...har].sort(), mangler: manglerI(fra, til, k) };
    })
    .sort((a, b) => a.fra.localeCompare(b.fra) || a.til.localeCompare(b.til));
}
