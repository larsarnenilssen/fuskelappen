// Sjekkmetodene: side (hovedinnhold på en nettside) og nsr (skoleregisteret).
import { createHash } from 'node:crypto';
import { parse } from 'node-html-parser';
import type { Kilde } from '../../src/core/innhold/skjema.ts';
import { lagFingeravtrykk, normaliserTekst } from './logikk.ts';
import { pdfTekst } from './pdf.ts';

export const USER_AGENT = 'Jukselappen-kildesjekk/0.1 (+https://github.com/larsarnenilssen/jukselappen)';

/** Feil i nettverket, før serveren har svart. Meldingen tar med årsaken, som fetch ellers skjuler bak «fetch failed». */
export class Nettverksfeil extends Error {}

async function hent(url: string): Promise<Response> {
  let svar: Response;
  try {
    svar = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,application/json;q=0.9' },
      signal: AbortSignal.timeout(60_000),
    });
  } catch (e) {
    throw new Nettverksfeil(feilmelding(e), { cause: e });
  }
  if (!svar.ok) throw new Error(`${url} svarte ${svar.status} ${svar.statusText}`);
  return svar;
}

/** «fetch failed (ECONNRESET: read ECONNRESET)»: meldingen med årsakene under. */
export function feilmelding(e: unknown): string {
  const deler: string[] = [];
  for (let f: unknown = e; f instanceof Error && deler.length < 4; f = f.cause) {
    const kode = (f as { code?: unknown }).code;
    deler.push(typeof kode === 'string' && !f.message.includes(kode) ? `${kode}: ${f.message}` : f.message);
  }
  if (deler.length === 0) return String(e);
  return deler.length === 1 ? (deler[0] as string) : `${deler[0]} (${deler.slice(1).join('; ')})`;
}

/** Trekker ut og normaliserer den delen av siden som skal sammenlignes. */
export function trekkUt(html: string, uttrekk: NonNullable<Kilde['uttrekk']>): string {
  const rot = parse(html);
  for (const fjern of ['script', 'style', 'noscript', 'template', ...uttrekk.fjern]) {
    for (const el of rot.querySelectorAll(fjern)) el.remove();
  }
  let treff = rot.querySelectorAll(uttrekk.selektor);
  if (uttrekk.inneholder) treff = treff.filter((el) => el.text.includes(uttrekk.inneholder as string));
  if (treff.length === 0) {
    throw new Error(`Fant ikke innholdet (selektor «${uttrekk.selektor}»${uttrekk.inneholder ? `, tekst «${uttrekk.inneholder}»` : ''}). Siden kan ha fått ny struktur.`);
  }
  return normaliserTekst(treff.map((el) => el.structuredText).join('\n'));
}

export async function sjekkSide(kilde: Kilde): Promise<{ fingeravtrykk: string; tekst: string; nettleser: boolean }> {
  if (!kilde.uttrekk) throw new Error('Mangler uttrekk i kilderegisteret');
  const { html, nettleser } = await hentSide(kilde.url);
  const tekst = trekkUt(html, kilde.uttrekk);
  return { fingeravtrykk: lagFingeravtrykk(tekst), tekst, nettleser };
}

/** Siden med fetch, og med Chromium hvis fetch ikke kommer fram (nettleser.ts). Begge feilene står i meldingen. */
async function hentSide(url: string): Promise<{ html: string; nettleser: boolean }> {
  try {
    return { html: await (await hent(url)).text(), nettleser: false };
  } catch (e) {
    if (!(e instanceof Nettverksfeil)) throw e;
    console.log(`${url}: ${e.message}. Prøver med nettleser.`);
    const { hentMedNettleser } = await import('./nettleser.ts');
    try {
      return { html: await hentMedNettleser(url), nettleser: true };
    } catch (f) {
      throw new Error(`${e.message}. Med nettleser: ${feilmelding(f).split('\n')[0]}`, { cause: f });
    }
  }
}

// ---------- Nasjonalt skoleregister ----------

export interface Skole {
  id: string;
  navn: string;
  fylke: string;
  kommune: string;
}

interface NsrEnhet {
  Organisasjonsnummer: string;
  Navn: string;
  Fylkesnummer: string;
  Kommunenummer: string;
  ErAktiv: boolean;
  ErSkole: boolean;
  ErVideregaaendeSkole: boolean;
}

interface NsrSide {
  AntallSider: number;
  EnhetListe: NsrEnhet[];
}

export const NSR_URL = 'https://data-nsr.udir.no/v4/enheter';
export const MINSTE_ANTALL_SKOLER = 300;

export function filtrerSkoler(enheter: readonly NsrEnhet[], fylker: ReadonlySet<string>): Skole[] {
  return enheter
    .filter((e) => e.ErAktiv && e.ErSkole && e.ErVideregaaendeSkole && fylker.has(e.Fylkesnummer))
    .map((e) => ({ id: e.Organisasjonsnummer, navn: e.Navn.trim(), fylke: e.Fylkesnummer, kommune: e.Kommunenummer }))
    .sort((a, b) => a.fylke.localeCompare(b.fylke) || a.navn.localeCompare(b.navn, 'nb') || a.id.localeCompare(b.id));
}

export async function hentSkoler(fylker: ReadonlySet<string>): Promise<Skole[]> {
  const enheter: NsrEnhet[] = [];
  let sider = 1;
  for (let side = 1; side <= sider && side <= 50; side++) {
    const data = (await (await hent(`${NSR_URL}?sidenummer=${side}&antallPerSide=5000`)).json()) as NsrSide;
    if (!Array.isArray(data.EnhetListe)) throw new Error('Uventet svar fra skoleregisteret');
    sider = data.AntallSider;
    enheter.push(...data.EnhetListe);
  }
  const skoler = filtrerSkoler(enheter, fylker);
  if (skoler.length < MINSTE_ANTALL_SKOLER) {
    throw new Error(`Fikk bare ${skoler.length} videregående skoler fra skoleregisteret. Beholder forrige liste.`);
  }
  return skoler;
}

export function skoleendringer(forrige: readonly Skole[], nye: readonly Skole[]): { nye: Skole[]; fjernet: Skole[]; endret: Skole[] } {
  const gamle = new Map(forrige.map((s) => [s.id, s]));
  const naa = new Map(nye.map((s) => [s.id, s]));
  return {
    nye: nye.filter((s) => !gamle.has(s.id)),
    fjernet: forrige.filter((s) => !naa.has(s.id)),
    endret: nye.filter((s) => {
      const g = gamle.get(s.id);
      return g !== undefined && (g.navn !== s.navn || g.fylke !== s.fylke || g.kommune !== s.kommune);
    }),
  };
}

// ---------- Hele filer (f.eks. PDF) ----------

/**
 * Fingeravtrykk av hele filen, byte for byte. Er filen en PDF, følger teksten med til verdisjekken.
 * Kan ikke teksten leses, sjekkes fortsatt fingeravtrykket.
 */
export async function sjekkFil(kilde: Kilde): Promise<{ fingeravtrykk: string; bytes: number; tekst: string | null; tekstfeil: string | null }> {
  const data = Buffer.from(await (await hent(kilde.url)).arrayBuffer());
  const fingeravtrykk = `sha256:${createHash('sha256').update(data).digest('hex')}`;
  if (data.subarray(0, 5).toString('latin1') !== '%PDF-') return { fingeravtrykk, bytes: data.length, tekst: null, tekstfeil: 'Filen er ikke en PDF.' };
  try {
    return { fingeravtrykk, bytes: data.length, tekst: await pdfTekst(new Uint8Array(data)), tekstfeil: null };
  } catch (e) {
    return { fingeravtrykk, bytes: data.length, tekst: null, tekstfeil: e instanceof Error ? e.message : String(e) };
  }
}

// ---------- Lovdata ----------

/** Lovdatas gratis datasett med gjeldende lover (NLOD 2.0). */
export const LOVDATA_LOVER = 'https://api.lovdata.no/v1/publicData/get/gjeldende-lover.tar.bz2';

/** Filnavnet til en lov i datasettet, f.eks. https://lovdata.no/lov/2005-06-17-62 → nl-20050617-062. */
export function lovdataFilnavn(url: string): string {
  const m = /\/lov\/(\d{4})-(\d{2})-(\d{2})-(\d+)/.exec(url);
  if (!m) throw new Error(`Kjenner ikke igjen lovadressen ${url}. Forventet formen https://lovdata.no/lov/ÅÅÅÅ-MM-DD-nr.`);
  const [, aar, mnd, dag, nr] = m as unknown as [string, string, string, string, string];
  return `nl-${aar}${mnd}${dag}-${nr.padStart(3, '0')}`;
}

/** Kort beskrivelse av strukturen i et dokument, til feilmeldingen når uttrekket ikke finner det det skal. */
export function strukturhint(html: string, antall = 15): string {
  const rot = parse(html);
  const verdier = new Set<string>();
  for (const el of rot.querySelectorAll('[id], [data-name]')) {
    const v = el.getAttribute('data-name') ?? el.getAttribute('id');
    if (v) verdier.add(`${el.tagName.toLowerCase()}[${el.getAttribute('data-name') ? 'data-name' : 'id'}="${v}"]`);
    if (verdier.size >= antall) break;
  }
  return verdier.size ? `Eksempler fra filen: ${[...verdier].join(', ')}` : 'Filen har ingen elementer med id eller data-name.';
}
