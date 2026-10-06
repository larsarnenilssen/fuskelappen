// Samsvar mellom kildene for løpene i videregående (avgjørelse 052 og 070): Grep («bygger på»), VIGO Kodeverksbase
// (grunnlag for inntak) og utdanning.no (løpene i utdanningsløpet). Appen viser alle løp som minst én kilde har
// (medLopFraKildene), og merker løpene kildene ikke er enige om. Regelen for merking er fast og gjelder alle løp:
// - En kilde har en mening om koblingen fra → til bare når den beskriver løpet ved den ene enden: Grep når
//   programområdet `til` har «bygger på» i Grep, VIGO når `fra` har grunnlag for inntak i VIGO, og utdanning.no når
//   `fra` står med løpet videre på utdanning.no.
// - En kilde med mening som ikke har koblingen, er uenig. Kilder uten mening teller ikke.
// - utdanning.no bruker noen koder Grep ikke har (f.eks. PBPBY4YK for Vg4 påbygging etter yrkeskompetanse). En slik
//   kode regnes som samme programområde som koden i Grep med de samme seks første tegnene.
// - utdanning.no kan bruke den gamle koden for et lærefag som er flyttet til et annet utdanningsprogram (f.eks.
//   TPGPT3 for Grafisk produksjonsteknikkfaget, som nå er IMGPT3). Har den gamle koden ikke løpet i Grep, men koden
//   med de samme fire tegnene for faget og trinnet i et annet program har det, regnes løpet som løpet til den nye.
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

/** Kodene i Grep som har de samme fire tegnene for faget og trinnet, i et annet utdanningsprogram (TPGPT3 → IMGPT3). */
function flyttet(kode: string, grep: Lopskilder['grep']): string[] {
  return Object.keys(grep.programomrader).filter((g) => g !== kode && g.slice(2, 6) === kode.slice(2, 6) && /^.{6}-+$/.test(g) && /^.{6}-+$/.test(kode));
}

/**
 * Programområdet i Grep som en kode i løpet fra → kode på utdanning.no står for: koden selv, den nye koden når
 * utdanning.no bruker en gammel kode for et flyttet lærefag, eller koden i Grep med de samme seks første tegnene når
 * Grep ikke har koden. Undefined når Grep ikke har noe som passer.
 */
export function utdanningIGrep(fra: string, kode: string, grep: Lopskilder['grep']): string | undefined {
  const po = grep.programomrader[kode];
  if (po) {
    if (po.bygger.length === 0 || po.bygger.includes(fra)) return kode;
    return flyttet(kode, grep).find((g) => grep.programomrader[g]?.bygger.includes(fra)) ?? kode;
  }
  return Object.keys(grep.programomrader).find((g) => g.slice(0, 6) === kode.slice(0, 6) && /^.{6}-+$/.test(g));
}

/** Kildene som har koblingen fra → til. */
export function harI(fra: string, til: string, k: Lopskilder): Lopkilde[] {
  const ut: Lopkilde[] = [];
  if (k.grep.programomrader[til]?.bygger.includes(fra)) ut.push('grep');
  if (k.vigo[fra]?.includes(til)) ut.push('vigo');
  if (k.utdanning?.videre[fra]?.some((t) => t === til || utdanningIGrep(fra, t, k.grep) === til || (!k.grep.programomrader[t] && t.slice(0, 6) === til.slice(0, 6)))) ut.push('utdanning');
  return ut;
}

/** Kildene som har en mening om koblingen fra → til, men ikke har den. Tom liste: ingen kilde er uenig. */
export function manglerI(fra: string, til: string, k: Lopskilder): Lopkilde[] {
  const har = harI(fra, til, k);
  const ut: Lopkilde[] = [];
  if ((k.grep.programomrader[til]?.bygger.length ?? 0) > 0 && !har.includes('grep')) ut.push('grep');
  if (k.vigo[fra] && !har.includes('vigo')) ut.push('vigo');
  if (k.utdanning?.videre[fra] && !har.includes('utdanning')) ut.push('utdanning');
  return ut;
}

/** Hvilke kilder som har et løp, og hvilke som er uenige (beskriver løpet uten å ha det). */
export interface Lopmerke {
  har: Lopkilde[];
  mangler: Lopkilde[];
}

/** Skal løpet merkes i appen: en kilde er uenig, eller bare én kilde har løpet (eier 06.10.2026, avgjørelse 070). */
function merkes(fra: string, til: string, k: Lopskilder): Lopmerke | null {
  const har = harI(fra, til, k);
  const mangler = manglerI(fra, til, k);
  return mangler.length > 0 || har.length === 1 ? { har, mangler } : null;
}

/**
 * Løpene på et tilbud som merkes: programområdet det gjelder, med kildene som har koblingen og kildene som mangler
 * den. Et løp merkes når en kilde er uenig, eller når bare én kilde har det. Overgangen med opphentingsfag
 * (Tilbud.opphenting) er med i kontrollen, men merkes ikke i appen, fordi eier har bekreftet ordningen (eier
 * 03.10.2026, avgjørelse 051).
 */
export function uenigheter(t: Pick<Tilbud, 'kode' | 'fra' | 'kryssFra' | 'videre' | 'pabygging' | 'kryssTil'>, k: Lopskilder): Record<string, Lopmerke> {
  const ut: Record<string, Lopmerke> = {};
  for (const b of [...t.fra, ...t.kryssFra]) {
    const m = merkes(b, t.kode, k);
    if (m) ut[b] = m;
  }
  for (const b of [...t.videre, ...t.pabygging, ...t.kryssTil]) {
    const m = merkes(t.kode, b, k);
    if (m) ut[b] = m;
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
      const til = utdanningIGrep(fra, t, k.grep);
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

/**
 * Fagindeksen med alle løp som minst én kilde har (eier 06.10.2026, avgjørelse 070): et løp som står i VIGO eller på
 * utdanning.no, men ikke i Grep, legges til «bygger på». Løp fra VIGO merkes med `byggerFraVigo`, så tilbudet har
 * VIGO som kilde. Løpene merkes i appen etter regelen over når en kilde er uenig. Ren funksjon; Grep endres ikke.
 */
export function medLopFraKildene(indeks: Fagindeks, k: Lopskilder): Fagindeks {
  const nye = new Map<string, { fra: Set<string>; vigo: boolean }>();
  for (const l of alleKoblinger(k)) {
    const po = indeks.programomrader[l.til];
    if (!po || l.har.includes('grep') || po.bygger.includes(l.fra)) continue;
    const n = nye.get(l.til) ?? { fra: new Set<string>(), vigo: false };
    n.fra.add(l.fra);
    n.vigo ||= l.har.includes('vigo');
    nye.set(l.til, n);
  }
  if (nye.size === 0) return indeks;
  const programomrader = { ...indeks.programomrader };
  for (const [til, n] of nye) {
    const po = programomrader[til];
    if (po) programomrader[til] = { ...po, bygger: [...new Set([...po.bygger, ...n.fra])].sort(), ...(n.vigo || po.byggerFraVigo ? { byggerFraVigo: true } : {}) };
  }
  return { ...indeks, programomrader };
}
