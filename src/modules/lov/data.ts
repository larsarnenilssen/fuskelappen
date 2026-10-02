// Dataene til Lov og forskrift (fase 3, avgjørelse 039): én JS-bit per dokument, som lastes første gang den trengs
// og følger med når appen installeres, og en liten oversikt. Nye dokumenter i data/lovdata/ kommer med av seg selv.
// Rene funksjoner for oppslag og søk står her, så de kan testes.
import synonymerFil from '../../../content/sok/synonymer.yaml';
import type { Synonymer } from '../../core/innhold/skjema.ts';
import { lagOrdformer } from '../../core/sok/ordformer.ts';
import { alleParagrafer, type Lovdokument, type Lovoversikt, type Paragraf, rentekst, type Seksjon } from './typer.ts';

const filer = import.meta.glob<Lovdokument>('../../../data/lovdata/*.json', { import: 'default' });

let oversikt: Promise<Lovoversikt> | null = null;
const dokumenter = new Map<string, Promise<Lovdokument>>();

export function lastOversikt(): Promise<Lovoversikt> {
  oversikt ??= import('../../../data/lovdata/oversikt.json').then((m) => m.default as unknown as Lovoversikt);
  oversikt.catch(() => {
    oversikt = null;
  });
  return oversikt;
}

/** Et dokument, eller null når det ikke finnes. */
export function lastDokument(id: string): Promise<Lovdokument | null> {
  const last = filer[`../../../data/lovdata/${id}.json`];
  if (!last || id === 'oversikt') return Promise.resolve(null);
  let p = dokumenter.get(id);
  if (!p) {
    p = last();
    dokumenter.set(id, p);
    p.catch(() => dokumenter.delete(id));
  }
  return p;
}

/** Adressen til et dokument eller en paragraf i appen. */
export const dokumentRute = (id: string) => `/lov/${id}`;
export const paragrafRute = (id: string, nr: string) => `/lov/${id}/${encodeURIComponent(nr)}`;

/** Adressen hos Lovdata til et dokument eller en paragraf. */
export const lovdataUrl = (refid: string, nr?: string) => `https://lovdata.no/${refid}${nr ? `/§${nr}` : ''}`;

/** Paragrafen en adresse peker på: «11-1», «§11-1» eller «§ 11-1». */
export function finnParagraf(dok: Lovdokument, nokkel: string): { paragraf: Paragraf; seksjoner: Seksjon[] } | null {
  const nr = nokkel.replace(/^§\s*/, '').replace(/\s+/g, '').toLowerCase();
  return alleParagrafer(dok.seksjoner).find(({ paragraf }) => paragraf.nr.toLowerCase() === nr) ?? null;
}

/** Hele teksten i en paragraf som ren tekst, til søket. */
export function paragraftekst(p: Paragraf): string {
  const ledd = (l: Paragraf['ledd'][number]): string =>
    [rentekst(l.tekst), ...(l.liste ?? []).flatMap((x) => [x.merke, ...x.ledd.map(ledd)]), ...(l.etter ?? []).map(rentekst)].join(' ');
  return p.ledd.map(ledd).join(' ');
}

export interface Treff {
  dokument: Lovdokument;
  paragraf: Paragraf;
  seksjoner: Seksjon[];
  /** Et utdrag rundt det første treffet i teksten, eller null når bare nummeret eller tittelen passer. */
  utdrag: { for: string; treff: string; etter: string } | null;
}

const soketekster = new WeakMap<Paragraf, string>();

/** Formene et ord i søket letes etter med, så bokmål finner nynorsk og omvendt (src/core/sok/ordformer.ts). */
const standardformer = lagOrdformer(synonymerFil as Synonymer);

/** Første sted en av formene står i teksten, og hvor langt treffet går (til slutten av ordet). */
function forsteTreff(tekst: string, former: readonly string[]): { start: number; slutt: number } | null {
  let beste: { start: number; slutt: number } | null = null;
  for (const f of former) {
    const i = tekst.indexOf(f);
    if (i < 0 || (beste && i >= beste.start)) continue;
    let slutt = i + f.length;
    while (slutt < tekst.length && /[\p{L}\p{N}]/u.test(tekst[slutt] as string)) slutt++;
    beste = { start: i, slutt };
  }
  return beste;
}

/**
 * Paragrafene der alle ordene i søket står i nummeret, tittelen eller teksten, med et utdrag rundt det første treffet.
 * Hvert ord letes etter i flere former, så et søk på bokmål finner nynorsk tekst og omvendt. «§ 11-1» og «11-1» finner
 * paragrafen med det nummeret først.
 */
export function sokIDokumenter(dokumenter: readonly Lovdokument[], sok: string, ordformer: (ord: string) => string[] = standardformer): Treff[] {
  const ord = sok.toLowerCase().replace(/§/g, ' ').split(/\s+/).filter(Boolean);
  if (ord.length === 0) return [];
  const former = ord.map(ordformer);
  const nummer = /^§?\s*(\d+[a-z]?(?:-\d+\s?[a-z]?)?)$/i.exec(sok.trim())?.[1]?.replace(/\s+/g, '').toLowerCase() ?? null;
  const eksakte: Treff[] = [];
  const andre: Treff[] = [];
  for (const dokument of dokumenter) {
    for (const { paragraf, seksjoner } of alleParagrafer(dokument.seksjoner)) {
      let tekst = soketekster.get(paragraf);
      if (tekst === undefined) {
        tekst = paragraftekst(paragraf);
        soketekster.set(paragraf, tekst);
      }
      const hode = `${paragraf.visNr} ${paragraf.tittel}`.toLowerCase();
      const liten = tekst.toLowerCase();
      if (!former.every((f) => f.some((x) => hode.includes(x) || liten.includes(x)))) continue;
      const forste = former[0] as string[];
      const treff = forste.some((x) => hode.includes(x)) ? null : forsteTreff(liten, forste);
      let utdrag: Treff['utdrag'] = null;
      if (treff) {
        const start = Math.max(0, tekst.lastIndexOf(' ', Math.max(0, treff.start - 70)) + 1);
        const slutt = Math.min(tekst.length, treff.slutt + 90);
        utdrag = {
          for: `${start > 0 ? '…' : ''}${tekst.slice(start, treff.start)}`,
          treff: tekst.slice(treff.start, treff.slutt),
          etter: `${tekst.slice(treff.slutt, slutt)}${slutt < tekst.length ? '…' : ''}`,
        };
      }
      (nummer !== null && paragraf.nr.toLowerCase() === nummer ? eksakte : andre).push({ dokument, paragraf, seksjoner, utdrag });
    }
  }
  return [...eksakte, ...andre];
}

const ROMERSK: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100 };

/** Kapittelnummeret som tall («11» → 11, «IV» → 4), eller null for numre som «9A». */
function kapitteltall(nr: string): number | null {
  if (/^\d+$/.test(nr)) return Number(nr);
  if (!/^[IVXLC]+$/.test(nr)) return null;
  let sum = 0;
  for (let i = 0; i < nr.length; i++) {
    const v = ROMERSK[nr[i] as string] as number;
    const neste = ROMERSK[nr[i + 1] as string] ?? 0;
    sum += v < neste ? -v : v;
  }
  return sum;
}

/**
 * Kapitlene i utvalget som kort tekst: «1, 5–21, 23–25 og 27–30» eller «II–VI». Tankestreken holdes sammen med tallene
 * (ordskjøt), så et intervall ikke deles over to linjer.
 */
export function utvalgstekst(utvalg: readonly string[], og: string): string {
  const deler: string[] = [];
  let i = 0;
  while (i < utvalg.length) {
    let j = i;
    while (j + 1 < utvalg.length) {
      const a = kapitteltall(utvalg[j] as string);
      const b = kapitteltall(utvalg[j + 1] as string);
      if (a === null || b !== a + 1 || /^\d+$/.test(utvalg[j] as string) !== /^\d+$/.test(utvalg[j + 1] as string)) break;
      j++;
    }
    if (j > i + 1) deler.push(`${utvalg[i]}\u2060–\u2060${utvalg[j]}`);
    else for (let k = i; k <= j; k++) deler.push(utvalg[k] as string);
    i = j + 1;
  }
  return deler.length > 1 ? `${deler.slice(0, -1).join(', ')} ${og} ${deler[deler.length - 1]}` : (deler[0] ?? '');
}
