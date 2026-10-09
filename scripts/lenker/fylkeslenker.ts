// Bekreftelsen av lenkene til fylkenes temasider (content/fylker/lenker.yaml, avgjørelse 106): ren logikk for å lese
// tittelen på siden, vurdere om den handler om temaet, endre filen linje for linje og finne lenkene som ikke er
// bekreftet på lenge. Hentingen står i fylker.ts. Testes i tests/unit/fylkeslenker.test.ts.
import type { Fylkeslenker, Fylketema } from '../../src/core/innhold/skjema.ts';
import { vurderSvar } from './sjekk.ts';

/** Etter så mange dager uten bekreftelse kommer lenken i kontrollsaken, så eier kan sjekke den for hånd. */
export const HANDSJEKK_ETTER_DAGER = 56;
/** Datoen fornyes når den er eldre enn dette, så filen ikke endres for hver lenke hver uke. */
export const FORNY_ETTER_DAGER = 28;

/**
 * Ord som viser at siden handler om temaet, på bokmål og nynorsk, uten æ, ø og å (se brett). Et ord treffer
 * begynnelsen av et ord i tittelen eller overskriften, så «sok» treffer «søknad» og «søke». Listene er romslige med
 * vilje: målet er å oppdage en side som er borte eller er blitt en annen, ikke å vurdere innholdet.
 */
export const TEMAORD: Readonly<Record<Fylketema, readonly string[]>> = {
  forside: ['videregaende', 'vidaregaande', 'skole', 'skule', 'opplaering', 'utdanning', 'elev'],
  inntak: ['inntak', 'sok', 'skoleplass', 'skuleplass', 'opptak'],
  'klage-inntak': ['klage', 'inntak', 'sok', 'skoleplass', 'skuleplass', 'vedtak'],
  sprak: ['sprak', 'minoritet', 'flersprak', 'fleirsprak', 'innvandr', 'flyktning', 'morsmal', 'saerskil', 'kombinasjon', 'innforing', 'nykommar', 'nykommer', 'integrering'],
  tilrettelegging: ['tilrettelegg', 'tilpass', 'ppt', 'pp-tj', 'pp-te', 'pedagogisk', 'spesialunderv', 'spesialpedagog', 'individuell', 'laeringsutfordring', 'elevtjenest', 'elevtenest'],
  eksamen: ['eksamen', 'vitnemal', 'standpunkt', 'karakter', 'prove'],
  'klage-standpunkt': ['klage', 'standpunkt', 'karakter'],
  privatist: ['privatist', 'eksamen'],
  fagprove: ['fagprove', 'fagbrev', 'svenneprove', 'sveineprove', 'svennebrev', 'sveinebrev', 'kompetanseprove', 'laerling', 'laerebedrift', 'provenemnd', 'opplaering i bedrift'],
};

/** Titler som betyr at siden ikke finnes, selv om den svarer 200. */
const IKKE_FUNNET = ['404', 'fant ikke', 'finnes ikke', 'ikke funnet', 'fann ikkje', 'finst ikkje', 'ikkje funne', 'not found', 'feilside', 'siden mangler', 'sida manglar'];

const ENTITETER: Readonly<Record<string, string>> = { amp: '&', nbsp: ' ', quot: '"', apos: "'", lt: '<', gt: '>', aring: 'å', Aring: 'Å', oslash: 'ø', Oslash: 'Ø', aelig: 'æ', AElig: 'Æ', ndash: '–', mdash: '—', raquo: '»', laquo: '«' };

function dekod(tekst: string): string {
  return tekst.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (hele, e: string) => {
    if (e.startsWith('#x') || e.startsWith('#X')) return String.fromCodePoint(Number.parseInt(e.slice(2), 16));
    if (e.startsWith('#')) return String.fromCodePoint(Number(e.slice(1)));
    return ENTITETER[e] ?? hele;
  });
}

const rens = (html: string) => dekod(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();

/** Tittelen, og:title og den første overskriften (h1) på siden, renset for tagger og HTML-entiteter. */
export function lesOverskrifter(html: string): { tittel: string | null; h1: string | null } {
  const tittel = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1];
  const og = /<meta[^>]+property=["']og:title["'][^>]*content=["']([^"']*)["']/i.exec(html)?.[1] ?? /<meta[^>]+content=["']([^"']*)["'][^>]*property=["']og:title["']/i.exec(html)?.[1];
  const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html)?.[1];
  const t = [tittel, og].filter((x): x is string => x !== undefined).map(rens).filter(Boolean);
  return { tittel: t.length > 0 ? [...new Set(t)].join(' | ') : null, h1: h1 === undefined ? null : rens(h1) || null };
}

/** Små bokstaver uten æ, ø og å, så «Søk skuleplass» og «sok skuleplass» er like. */
export function brett(tekst: string): string {
  return tekst.toLowerCase().replace(/æ/g, 'ae').replace(/[øö]/g, 'o').replace(/[åä]/g, 'a').replace(/é/g, 'e');
}

/** Om tittelen eller overskriften viser at siden handler om temaet, og ikke er en side om at siden ikke finnes. */
export function passerTema(tema: Fylketema, tekst: string): boolean {
  const t = brett(tekst);
  if (IKKE_FUNNET.some((o) => t.includes(o))) return false;
  return TEMAORD[tema].some((o) => new RegExp(`(^|[^a-z])${o.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&')}`).test(t));
}

export interface Fylkeslenke {
  fylke: string;
  navn: string;
  tema: Fylketema;
  url: string;
  bekreftet: string | null;
}

/** Alle lenkene i filen, fylke for fylke. */
export function alleLenker(f: Fylkeslenker): Fylkeslenke[] {
  return f.fylker.flatMap((fy) =>
    Object.entries(fy.lenker).flatMap(([tema, l]) => (l ? [{ fylke: fy.fylke, navn: fy.navn, tema: tema as Fylketema, url: l.url, bekreftet: l.bekreftet }] : [])),
  );
}

function dagerFor(idag: string, dager: number): string {
  return new Date(Date.parse(`${idag}T00:00:00Z`) - dager * 86_400_000).toISOString().slice(0, 10);
}

/** Lenkene som skal sjekkes nå: aldri bekreftet, eller bekreftet for mer enn `dager` dager siden. */
export function skalSjekkes(lenker: readonly Fylkeslenke[], idag: string, dager = FORNY_ETTER_DAGER): Fylkeslenke[] {
  const grense = dagerFor(idag, dager);
  return lenker.filter((l) => l.bekreftet === null || l.bekreftet <= grense);
}

/** Lenkene som ikke er bekreftet de siste åtte ukene. De kommer i kontrollsaken, så eier kan sjekke dem for hånd. */
export function ikkeBekreftet(lenker: readonly Fylkeslenke[], idag: string, dager = HANDSJEKK_ETTER_DAGER): Fylkeslenke[] {
  const grense = dagerFor(idag, dager);
  return lenker.filter((l) => l.bekreftet === null || l.bekreftet < grense);
}

/**
 * Endrer én lenke i lenker.yaml uten å røre resten av filen: datoen i `bekreftet` og eventuelt adressen. Gir null hvis
 * fylket eller temaet ikke finnes, eller linjen ikke har den vanlige formen.
 */
export function settFylkeslenke(yaml: string, fylke: string, tema: string, endring: { bekreftet?: string; url?: string }): string | null {
  const linjer = yaml.split('\n');
  const start = linjer.findIndex((l) => l === `  - fylke: "${fylke}"`);
  if (start < 0) return null;
  const slutt = linjer.findIndex((l, i) => i > start && l.startsWith('  - '));
  const monster = new RegExp(`^( {6}${tema.replace(/[-]/g, '\\-')}: \\{ url: ")([^"]+)(", bekreftet: )(null|\\d{4}-\\d{2}-\\d{2})( \\}.*)$`);
  for (let i = start + 1; i < (slutt < 0 ? linjer.length : slutt); i++) {
    const m = monster.exec(linjer[i] as string);
    if (!m) continue;
    linjer[i] = `${m[1]}${endring.url ?? m[2]}${m[3]}${endring.bekreftet ?? m[4]}${m[5]}`;
    return linjer.join('\n');
  }
  return null;
}

/** Resultatet av å hente én lenke. */
export interface Lenkesvar {
  /** HTTP-status, eller null når siden ikke svarte. */
  status: number | null;
  /** Adressen etter videresendinger. */
  til: string | null;
  html: string | null;
  melding: string | null;
}

export type Vurdering = { ok: true; tekst: string } | { ok: false; arsak: string };

/**
 * Vurderer svaret: 200 med en tittel eller overskrift som passer temaet. En videresending fra en dypere side til
 * forsiden regnes som en side som er borte, som i lenkesjekken (vurderSvar).
 */
export function vurderLenke(url: string, tema: Fylketema, svar: Lenkesvar): Vurdering {
  if (svar.status === null) return { ok: false, arsak: `svarer ikke (${svar.melding ?? 'ukjent feil'})` };
  if (svar.status < 200 || svar.status >= 300) return { ok: false, arsak: `svarte ${svar.status}` };
  if (vurderSvar(url, svar.status, svar.til) === 'borte') return { ok: false, arsak: `sendes videre til forsiden (${svar.til ?? ''})` };
  const { tittel, h1 } = lesOverskrifter(svar.html ?? '');
  const tekst = [tittel, h1].filter(Boolean).join(' / ');
  if (!tekst) return { ok: false, arsak: 'siden har ingen tittel' };
  if (!passerTema(tema, tekst)) return { ok: false, arsak: `tittelen passer ikke temaet: «${tekst.slice(0, 160)}»` };
  return { ok: true, tekst };
}
