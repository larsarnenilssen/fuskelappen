// Sjekkmetodene: side (hovedinnhold på en nettside) og nsr (skoleregisteret).
import { parse } from 'node-html-parser';
import type { Kilde } from '../../src/core/innhold/skjema.ts';
import { lagFingeravtrykk, normaliserTekst } from './logikk.ts';

export const USER_AGENT = 'Protokollen-kildesjekk/0.1 (+https://github.com/larsarnenilssen/protokollen)';

async function hent(url: string): Promise<Response> {
  const svar = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,application/json;q=0.9' },
    signal: AbortSignal.timeout(60_000),
  });
  if (!svar.ok) throw new Error(`${url} svarte ${svar.status} ${svar.statusText}`);
  return svar;
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

export async function sjekkSide(kilde: Kilde): Promise<{ fingeravtrykk: string; tekst: string }> {
  if (!kilde.uttrekk) throw new Error('Mangler uttrekk i kilderegisteret');
  const html = await (await hent(kilde.url)).text();
  const tekst = trekkUt(html, kilde.uttrekk);
  return { fingeravtrykk: lagFingeravtrykk(tekst), tekst };
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
