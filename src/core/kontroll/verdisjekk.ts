// Verdisjekken: ser etter sitatet til hver regelverdi i kildeteksten. Står sitatet der, samsvarer verdien
// med kilden. Står det ikke der, lages et forslag hvis teksten rundt tallet finnes med et annet tall.
// Automatisk samsvar er ikke det samme som eiers kontroll (docs/avgjorelser/017).
import * as z from 'zod/mini';
import type { Regelsett } from '../regler/skjema.ts';
import { finnTall, likeTall, lesTall, normaliserTekst, TALL } from './tekst.ts';

export const verdistatusPost = z.strictObject({
  status: z.enum(['samsvarer', 'avvik', 'ikke_sjekket']),
  kilde: z.string(),
  sjekket: z.string(),
  /** Når verdien fikk denne statusen (ISO-tid). */
  siden: z.string(),
  /** Tallet som nå står i kilden på samme sted, når det kan finnes. */
  forslag: z.nullable(z.number()),
  melding: z.nullable(z.string()),
  /** For tabeller: én linje per rad som ikke stemmer med kilden. */
  detaljer: z.optional(z.array(z.string())),
});

export const verdistatusFil = z.strictObject({
  skjema: z.literal(1),
  kjort: z.string(),
  verdier: z.record(z.string(), verdistatusPost),
});

export type VerdistatusPost = z.infer<typeof verdistatusPost>;
export type Verdistatusfil = z.infer<typeof verdistatusFil>;

export function lesVerdistatus(data: unknown): Verdistatusfil | null {
  const r = verdistatusFil.safeParse(data);
  return r.success ? r.data : null;
}

/** Nøkkelen for en regelverdi i verdistatus, f.eks. «sfs2213-2026-2027/arsverk_timer». */
export function verdinokkel(regelsettId: string, nokkel: string): string {
  return `${regelsettId}/${nokkel}`;
}

/**
 * Tall skrevet med ord, som lov- og forskriftstekst ofte gjør («med to desimalar, multiplisert med ti», «med
 * talverdien null»). «En», «ein» og «ett» er ikke med, fordi de oftere er ubestemt artikkel enn tall.
 */
const TALLORD: Readonly<Record<string, number>> = { null: 0, to: 2, tre: 3, fire: 4, fem: 5, seks: 6, sju: 7, åtte: 8, ni: 9, ti: 10 };

/**
 * Første tall i sitatet som er lik verdien, eller null hvis sitatet ikke inneholder verdien. Tall med sifre
 * prøves først, deretter tall skrevet med ord.
 */
export function verdiISitat(sitat: string, verdi: number): { tekst: string; start: number; slutt: number } | null {
  const tekst = normaliserTekst(sitat);
  const medSifre = finnTall(tekst).find((t) => likeTall(t.verdi, verdi));
  if (medSifre) return medSifre;
  for (const [ord, tall] of Object.entries(TALLORD)) {
    if (!likeTall(tall, verdi)) continue;
    const m = new RegExp(`(?<!\\p{L})${ord}(?!\\p{L})`, 'iu').exec(tekst);
    if (m) return { tekst: m[0], start: m.index, slutt: m.index + m[0].length };
  }
  return null;
}

function escape(tekst: string): string {
  return tekst.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s+');
}

/**
 * Mønster for sitatet der alle tall kan være et hvilket som helst tall. Brukes til å finne tallene som nå står
 * på samme sted i kilden når sitatet ikke finnes ordrett, f.eks. fordi ett av tallene er endret.
 * Gruppe nr. i + 1 er tall nr. i i sitatet.
 */
export function sitatmonster(sitat: string): RegExp {
  const s = normaliserTekst(sitat);
  let monster = '';
  let forrige = 0;
  for (const t of finnTall(s)) {
    monster += `${escape(s.slice(forrige, t.start))}(${TALL})`;
    forrige = t.slutt;
  }
  return new RegExp(monster + escape(s.slice(forrige)));
}

export interface Sitatresultat {
  status: 'samsvarer' | 'avvik';
  /** Tallet som nå står der verdien sto, når det er et annet tall. */
  forslag: number | null;
  melding: string | null;
}

/** Sjekker ett sitat mot kildeteksten (begge normaliseres). */
export function sjekkSitat(sitat: string, verdi: number, kildetekst: string): Sitatresultat {
  const tekst = normaliserTekst(kildetekst);
  const s = normaliserTekst(sitat);
  if (tekst.includes(s)) return { status: 'samsvarer', forslag: null, melding: null };
  const plass = finnTall(s).findIndex((t) => likeTall(t.verdi, verdi));
  const treff = plass < 0 ? null : sitatmonster(s).exec(tekst);
  const funnet = treff?.[plass + 1];
  if (funnet === undefined) return { status: 'avvik', forslag: null, melding: 'Sitatet står ikke lenger i kilden.' };
  const nytt = lesTall(funnet);
  if (likeTall(nytt, verdi)) {
    return { status: 'samsvarer', forslag: null, melding: 'Tallet står i kilden, men andre tall i sitatet er endret.' };
  }
  return { status: 'avvik', forslag: nytt, melding: `Kilden har nå ${funnet} der verdien sto.` };
}

export interface Sjekkbar {
  nokkel: string;
  regelsett: string;
  kilde: string;
  verdi: number;
  sitat: string;
}

/** Regelverdiene som har sitat og et tall som verdi. */
export function sjekkbareVerdier(alle: readonly Regelsett[]): Sjekkbar[] {
  return alle.flatMap((r) =>
    Object.entries(r.verdier).flatMap(([nokkel, v]) =>
      v.sitat !== undefined && typeof v.verdi === 'number'
        ? [{ nokkel: verdinokkel(r.id, nokkel), regelsett: r.id, kilde: v.kilde.id, verdi: v.verdi, sitat: v.sitat }]
        : [],
    ),
  );
}

/**
 * Sjekker alle verdier med sitat. tekster har den normaliserte teksten per kilde, eller en melding når
 * kilden ikke kunne leses. «siden» beholdes så lenge statusen er den samme som forrige gang.
 */
export function sjekkVerdier(
  verdier: readonly Sjekkbar[],
  tekster: Readonly<Record<string, { tekst: string } | { feil: string } | undefined>>,
  forrige: Verdistatusfil | null,
  naa: string,
): Verdistatusfil {
  const ut: Record<string, VerdistatusPost> = {};
  for (const v of verdier) {
    const kilde = tekster[v.kilde];
    let post: Omit<VerdistatusPost, 'siden' | 'sjekket'>;
    if (kilde === undefined) {
      post = { status: 'ikke_sjekket', kilde: v.kilde, forslag: null, melding: 'Kilden sjekkes ikke automatisk ennå.' };
    } else if ('feil' in kilde) {
      post = { status: 'ikke_sjekket', kilde: v.kilde, forslag: null, melding: `Kilden kunne ikke leses: ${kilde.feil}` };
    } else {
      const r = sjekkSitat(v.sitat, v.verdi, kilde.tekst);
      post = { status: r.status, kilde: v.kilde, forslag: r.forslag, melding: r.melding };
    }
    const f = forrige?.verdier[v.nokkel];
    const samme = f !== undefined && f.status === post.status && f.forslag === post.forslag;
    ut[v.nokkel] = { ...post, sjekket: naa, siden: samme ? f.siden : naa };
  }
  return { skjema: 1, kjort: naa, verdier: ut };
}

/**
 * Legger resultatet av en tabellsjekk inn i verdistatus, med samme regel for «siden» som for enkeltverdier.
 * Kunne ikke kilden leses, blir tabellen «ikke sjekket».
 */
export function medTabellstatus(
  fil: Verdistatusfil,
  nokkel: string,
  kilde: string,
  resultat: { status: 'samsvarer' | 'avvik'; melding: string | null; detaljer: string[] } | { feil: string },
  forrige: Verdistatusfil | null,
): Verdistatusfil {
  const post: Omit<VerdistatusPost, 'siden' | 'sjekket'> =
    'feil' in resultat
      ? { status: 'ikke_sjekket', kilde, forslag: null, melding: `Tabellen kunne ikke sjekkes: ${resultat.feil}` }
      : { status: resultat.status, kilde, forslag: null, melding: resultat.melding, ...(resultat.detaljer.length > 0 ? { detaljer: resultat.detaljer } : {}) };
  const f = forrige?.verdier[nokkel];
  const siden = f !== undefined && f.status === post.status && f.melding === post.melding ? f.siden : fil.kjort;
  return { ...fil, verdier: { ...fil.verdier, [nokkel]: { ...post, sjekket: fil.kjort, siden } } };
}
