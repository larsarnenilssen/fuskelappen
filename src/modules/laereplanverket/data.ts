// Dataene til Læreplanverket (pakke 6, avgjørelse 037): overordnet del fra udir.no og grunnleggende ferdigheter og
// tverrfaglige temaer fra Grep. Begge er egne JS-biter som lastes første gang de trengs, og som følger med når
// appen installeres. Rene funksjoner for oppslag og søk står her, så de kan testes.
import type { Laereplanverket } from '../../data/grep.ts';
import { alleDeler, type Blokk, type Del } from './typer.ts';

// Lastingen står i datalaget (avgjørelse 049).
export { lastLaereplanverket } from '../../data/grep.ts';
export { lastOverordnetDel } from '../../data/udir.ts';
export type { Laereplanverket } from '../../data/grep.ts';
export type Element = Laereplanverket['ferdigheter'][number];

/** Adressen til en del i appen: kapittelnummeret når delen har det, ellers id-en fra udir.no. */
export const delRute = (d: Pick<Del, 'nr' | 'id'>) => `/laereplanverket/overordnet-del/${d.nr ?? d.id}`;

/** Favoritt-id-en til en del, den samme som i søket (avgjørelse 058). */
export const delfavoritt = (d: Pick<Del, 'nr' | 'id'>) => `laereplanverket:${d.nr ?? d.id}`;

/** Adressen til delen i overordnet del som omtaler en ferdighet eller et tema (GF1, TT2). */
export const elementRute = (kode: string) => `/laereplanverket/overordnet-del/${kode}`;

const liten = (s: string) => s.toLowerCase().trim();

/**
 * Delen en adresse peker på: kapittelnummer («2.5.1»), id fra udir.no, eller koden til en grunnleggende ferdighet
 * eller et tverrfaglig tema. Ferdighetene står samlet i delen «Grunnleggende ferdigheter», og hvert tema i en del
 * med samme navn. Delene finnes ut fra navnene, ikke fra faste numre, så de følger kildene.
 */
export function finnDel(deler: readonly Del[], nokkel: string, lv: Laereplanverket | null): Del | null {
  const alle = alleDeler(deler);
  const direkte = alle.find((d) => d.nr === nokkel || d.id === nokkel);
  if (direkte) return direkte;
  if (!lv) return null;
  const tema = lv.temaer.find((e) => e.kode === nokkel);
  if (tema) return alle.find((d) => liten(d.tittel.nb) === liten(tema.navn.nb)) ?? null;
  if (lv.ferdigheter.some((e) => e.kode === nokkel)) return alle.find((d) => liten(d.tittel.nb) === 'grunnleggende ferdigheter') ?? null;
  return null;
}

/** Delen og alle delene over den, ytterst først. */
export function sti(deler: readonly Del[], mal: Del): Del[] {
  for (const d of deler) {
    if (d === mal) return [d];
    const under = sti(d.deler, mal);
    if (under.length > 0) return [d, ...under];
  }
  return [];
}

const tekstAv = (b: Blokk) => (b.type === 'liste' ? b.punkter.join(' ') : b.tekst);

export interface Treff {
  del: Del;
  /** Et utdrag rundt det første treffet, eller null når bare tittelen passer. */
  utdrag: { for: string; treff: string; etter: string } | null;
}

/** Delene der alle ordene i søket står i tittelen eller teksten, med et utdrag rundt det første treffet. */
export function sokIDeler(deler: readonly Del[], sok: string, malform: 'nb' | 'nn'): Treff[] {
  const ord = sok.toLowerCase().split(/\s+/).filter(Boolean);
  if (ord.length === 0) return [];
  const ut: Treff[] = [];
  for (const d of alleDeler(deler)) {
    const tekster = [...d.ingress[malform], ...d.tekst[malform]].map(tekstAv);
    const alt = `${d.tittel[malform]} ${tekster.join(' ')}`.toLowerCase();
    if (!ord.every((o) => alt.includes(o))) continue;
    const forste = ord[0] as string;
    const avsnitt = tekster.find((t) => t.toLowerCase().includes(forste));
    let utdrag: Treff['utdrag'] = null;
    if (avsnitt) {
      const i = avsnitt.toLowerCase().indexOf(forste);
      const start = Math.max(0, avsnitt.lastIndexOf(' ', Math.max(0, i - 70)) + 1);
      const slutt = Math.min(avsnitt.length, i + forste.length + 90);
      utdrag = {
        for: `${start > 0 ? '…' : ''}${avsnitt.slice(start, i)}`,
        treff: avsnitt.slice(i, i + forste.length),
        etter: `${avsnitt.slice(i + forste.length, slutt)}${slutt < avsnitt.length ? '…' : ''}`,
      };
    }
    ut.push({ del: d, utdrag });
  }
  return ut;
}
