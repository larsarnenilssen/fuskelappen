// Dagens jukselapp (fase 8, avgjørelse 086): teksten i et faktum og hvilket faktum dagen får. Rene funksjoner.
//
// Faktumet velges ut fra datoen, så det er det samme hele dagen og likt for alle med samme fylke og skole, uten at noe
// lagres. Dagene går på rundgang mellom modulene, så to dager etter hverandre gir fakta fra ulike deler av appen, og
// bare modulen som har dagen, må laste innholdet sitt. Innenfor en modul går rundene gjennom alle faktaene før noe
// gjentas.
import type { Flerspraak, Gyldighet, Innholdselement } from '../innhold/skjema.ts';
import { latBegge, type Tekstverdi } from '../i18n/tekst.ts';
import { tidspunkt } from '../tidslinje.ts';
import type { Faktum } from '../../modules/typer.ts';

/** Høyst så mange tegn i teksten. Den første setningen tas alltid med, så sant den ikke er lengre enn `LENGSTE`. */
export const MAKS_TEGN = 240;
/** En første setning som er lengre enn dette, gir ikke noe faktum. */
export const LENGSTE = 320;

const ENTITETER: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", nbsp: ' ' };

/** Markdown eller HTML gjort om til ren tekst: lenker og uthevinger blir teksten sin. */
export function rensMarkdown(tekst: string): string {
  return tekst
    .replace(/<[^>]+>/g, '')
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (_m, e: string) => ENTITETER[e] ?? ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1$2')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Setningene i et avsnitt. En setning slutter med punktum, spørsmålstegn eller utropstegn fulgt av stor bokstav eller
 * anførselstegn, så «1. mars» og «f.eks. en» ikke deler setningen.
 */
export function setninger(avsnitt: string): string[] {
  return avsnitt.split(/(?<=[.!?»])\s+(?=[A-ZÆØÅ«§])/).filter(Boolean);
}

/**
 * Første avsnitt i en tekst, som ren tekst. Innholdet er HTML i appen (innholdPlugin) og markdown i filene. Tomt når
 * teksten begynner med en liste, en tabell eller en overskrift.
 */
export function forsteAvsnitt(tekst: string): string {
  const t = tekst.trim();
  if (t.startsWith('<')) {
    if (!/^<p[\s>]/.test(t)) return '';
    return rensMarkdown(t.slice(0, t.indexOf('</p>') >= 0 ? t.indexOf('</p>') : undefined));
  }
  const avsnitt = t.split(/\n\s*\n/)[0] ?? '';
  if (/^\s*([-*]|\d+\.|#)\s/.test(avsnitt)) return '';
  // Linjer som er en liste inne i avsnittet, tas ikke med.
  return rensMarkdown(avsnitt.split('\n').filter((l) => !/^\s*([-*]|\d+\.)\s/.test(l)).join(' '));
}

/**
 * Teksten i et faktum: de første setningene i første avsnitt, høyst `maks` tegn. Antallet setninger regnes på bokmål og
 * brukes på begge målformene, så de sier det samme. Gir null når teksten ikke egner seg: den begynner med en liste,
 * slutter med kolon, eller den første setningen er for lang.
 */
export function faktatekst(tekst: Flerspraak, maks = MAKS_TEGN): Flerspraak | null {
  const nb = setninger(forsteAvsnitt(tekst.nb));
  const nn = setninger(forsteAvsnitt(tekst.nn));
  const forste = nb[0];
  if (!forste || !nn[0] || forste.length > LENGSTE) return null;
  let antall = 1;
  while (antall < nb.length && nb.slice(0, antall + 1).join(' ').length <= maks) antall += 1;
  const ut = { nb: nb.slice(0, antall).join(' '), nn: nn.slice(0, antall).join(' ') };
  if (/[:;,]$/.test(ut.nb) || /[:;,]$/.test(ut.nn) || !/[.!?»)]$/.test(ut.nb)) return null;
  return ut;
}

/** Elementtypene som gir fakta. Veiviserne selv og kildeomtalene er ikke med. */
const MED: ReadonlySet<Innholdselement['type']> = new Set(['begrep', 'regel', 'forklaring', 'frist', 'vei', 'steg']);

/**
 * Fakta fra innholdselementer: tittelen, de første setningene og kildene. `rute` gir adressen til siden elementet står
 * på, eller null når elementet ikke skal med. Frister med fast dato er med i kalenderen og tas ikke med.
 */
export function faktaFraElementer(
  elementer: readonly Innholdselement[],
  { modul, under, rute, lenke }: { modul: string; under: Tekstverdi; rute: (e: Innholdselement) => string | null; lenke: (e: Innholdselement) => Flerspraak },
): Faktum[] {
  const fakta: Faktum[] = [];
  for (const e of elementer) {
    if (!MED.has(e.type) || (e.type === 'frist' && 'dato' in e && e.dato)) continue;
    const r = rute(e);
    const tekst = r ? faktatekst(e.tekst) : null;
    if (!r || !tekst) continue;
    // Fristene får tidspunktet med: «1. mars», «Ti dager». Frister med dato fra dataene har det i kalenderen.
    const naar = e.type === 'frist' && tidspunkt(e, 'nb') ? latBegge((m) => tidspunkt(e, m)) : null;
    const paragrafer = 'paragrafer' in e && Array.isArray(e.paragrafer) && e.paragrafer.length > 0 ? (e.paragrafer as string[]) : undefined;
    fakta.push({
      id: `${modul}:${e.id}${e.gyldighet.niva === 'nasjonal' ? '' : `:${e.gyldighet.fylke}`}`,
      tittel: { nb: rensMarkdown(e.tittel.nb), nn: rensMarkdown(e.tittel.nn) },
      tekst,
      under,
      lenke: lenke(e),
      rute: r,
      kilder: e.kilder,
      ...(naar ? { naar } : {}),
      ...(paragrafer ? { paragrafer } : {}),
      ...(e.gyldighet.niva === 'nasjonal' ? {} : { gyldighet: e.gyldighet }),
    });
  }
  return fakta;
}

export interface Sted {
  fylke: string | null;
  skole: string | null;
}

/** Om faktumet vises for brukeren: nasjonalt, eller for fylket eller skolen brukeren har valgt. */
export function erSynlig(g: Gyldighet | undefined, sted: Sted): boolean {
  if (!g || g.niva === 'nasjonal') return true;
  if (g.niva === 'fylke') return g.fylke === sted.fylke;
  return g.fylke === sted.fylke && g.skole === sted.skole;
}

/** Dagen som tall, så samme dato gir samme faktum. */
export function dagnummer(dato: string): number {
  return Math.floor(Date.parse(`${dato}T12:00:00Z`) / 86_400_000);
}

const mod = (a: number, n: number) => ((a % n) + n) % n;

/** Et primtall som ikke går opp i `n`, så hoppet går gjennom alle før noe gjentas. */
function hopp(n: number): number {
  return [7, 11, 13, 17, 19, 23, 29, 31].find((p) => n % p !== 0) ?? 1;
}

/** Plassen i en liste med `n` fakta i runde nummer `runde`. Etter `n` runder har alle vært med én gang. */
export function plassIRunde(runde: number, n: number): number {
  return mod(runde * hopp(n), n);
}

/** Modulen og runden for et steg: steg 0 er dagen, og knappen for ny jukselapp går ett steg videre. */
export function modulOgRunde(dato: string, steg: number, antallModuler: number): { modul: number; runde: number } {
  const t = dagnummer(dato) + steg;
  return { modul: mod(t, antallModuler), runde: Math.floor(t / antallModuler) };
}

/**
 * Faktumet for et steg. Moduler uten fakta for brukeren hoppes over. Gir steget som ble brukt, så knappen for ny
 * jukselapp fortsetter derfra, og null når ingen moduler har fakta.
 */
export async function hentFaktum(
  moduler: readonly { id: string; fakta(): Promise<Faktum[]> }[],
  sted: Sted,
  dato: string,
  steg: number,
): Promise<{ faktum: Faktum; steg: number } | null> {
  const n = moduler.length;
  for (let s = steg; s < steg + n; s++) {
    const { modul, runde } = modulOgRunde(dato, s, n);
    const m = moduler[modul];
    if (!m) continue;
    let alle: Faktum[];
    try {
      alle = await m.fakta();
    } catch {
      continue;
    }
    const fakta = alle.filter((f) => erSynlig(f.gyldighet, sted));
    const faktum = fakta[plassIRunde(runde, fakta.length)];
    if (faktum) return { faktum, steg: s };
  }
  return null;
}
