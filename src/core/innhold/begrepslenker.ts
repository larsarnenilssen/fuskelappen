// Lenker til begrepsbanken i brødteksten (avgjørelse 050). Rene funksjoner. Brukes når teksten i content/ gjøres om
// fra markdown til HTML (scripts/innhold/last.ts), og for innledninger og hjelpetekster i appen (Begrepstekst), så
// alle tekster får lenker, også til begreper som legges inn senere.
// - Første gang et begrep står i en tekst, blir ordet en lenke til begrepet. Senere forekomster lenkes ikke.
// - Ikke i overskrifter eller uthevede ledetekster («**Klage:**»), ikke inne i andre lenker, og ikke til begrepet
//   teksten selv handler om. Ordene for det begrepet lenkes heller ikke delvis («arbeidstid» i «planfestet arbeidstid»).
// - Et begrep for ett fylke lenkes bare fra tekst som gjelder samme fylke.
// - Ordene er tittelen på begrepet, eller `lenkeord` når tittelen ikke er ordet som står i teksten. Vanlige
//   bøyningsendelser er med for ord på minst fem bokstaver (privatist → privatisten, privatister, og
//   utdanningsprogram → utdanningsprogrammet).
import type { Innholdselement } from './skjema.ts';

type Malform = 'nb' | 'nn';

export interface Begrepsord {
  id: string;
  /** Fylket begrepet gjelder for, eller null for nasjonale begreper. */
  fylke: string | null;
  /** Lenkeordene i grunnform. */
  ord: Record<Malform, string[]>;
}

/** Endelser på substantiv og adjektiv i bokmål og nynorsk, lengst først. */
const ENDELSER = ['enes', 'anes', 'ene', 'ane', 'ens', 'ets', 'ers', 'ars', 'en', 'et', 'er', 'ar', 'ne', 'e', 'a', 'n', 't', 'r', 's'];
/** Ord på -m dobler m-en i bøyning: program → programmet, programmer, programma. */
const ENDELSER_M = ['mene', 'mane', 'met', 'mer', 'mar', 'ma'];
const MIN_FOR_ENDELSE = 5;

function escape(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const monstre = new Map<string, RegExp>();

/** Mønsteret for ett lenkeord: hele ord, uavhengig av store og små bokstaver, med bøyning for lange ord. */
export function monsterFor(ord: string): RegExp {
  const lagret = monstre.get(ord);
  if (lagret) return lagret;
  const deler = ord.trim().toLowerCase().split(/\s+/).map(escape);
  const siste = ord.trim().split(/\s+/).at(-1) ?? '';
  const endelser = siste.toLowerCase().endsWith('m') ? [...ENDELSER_M, ...ENDELSER] : ENDELSER;
  const endelse = siste.length >= MIN_FOR_ENDELSE ? `(?:${endelser.join('|')})?` : '';
  const m = new RegExp(`(?<![\\p{L}\\p{N}])${deler.join('\\s+')}${endelse}(?![\\p{L}\\p{N}])`, 'iu');
  monstre.set(ord, m);
  return m;
}

/** Tittelen kan brukes som lenkeord når den er ett ord eller en enkel frase, ikke «X og Y» eller «X (Y)». */
export function enkelTittel(tittel: string): boolean {
  return !/[(),*]|\bog\b/.test(tittel);
}

/** Lenkeordene til alle begrepene, til bruk i lenkBegreper. */
export function byggBegrepsord(elementer: readonly Innholdselement[]): Begrepsord[] {
  return elementer
    .filter((e) => e.type === 'begrep')
    .map((e) => {
      const ord = (m: Malform): string[] => e.lenkeord?.[m] ?? (enkelTittel(e.tittel[m]) ? [e.tittel[m]] : []);
      return {
        id: e.id,
        fylke: e.gyldighet.niva === 'nasjonal' ? null : e.gyldighet.fylke,
        ord: { nb: ord('nb'), nn: ord('nn') },
      };
    });
}

export interface Valg {
  malform: Malform;
  /** Begrepet teksten handler om, som ikke skal lenke til seg selv. */
  egenId?: string;
  /** Fylket teksten gjelder for, eller null for nasjonal tekst. */
  fylke: string | null;
}

const BEGREPSLENKE = /^<a\s[^>]*href="#\/begreper\/([a-z0-9-]+)"/i;
/** Elementer der ord ikke skal lenkes. */
const UTEN_LENKER = new Set(['a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'b', 'code', 'pre', 'button']);

/**
 * Legger inn lenker til begrepene i HTML-en fra markdown. Lenker som allerede går til begrepsbanken, får samme
 * klasse og teller som første forekomst.
 */
export function lenkBegreper(html: string, alle: readonly Begrepsord[], valg: Valg): string {
  const aktuelle = alle.filter((b) => b.fylke === null || b.fylke === valg.fylke || b.id === valg.egenId);
  const lenket = new Set<string>();
  const deler = html.split(/(<[^>]+>)/);
  // Lenker som finnes fra før, teller først, så et begrep ikke lenkes både før og i den gamle lenken.
  for (const d of deler) {
    const m = BEGREPSLENKE.exec(d);
    if (m?.[1]) lenket.add(m[1]);
  }
  const stabel: string[] = [];
  return deler
    .map((del) => {
      if (del.startsWith('<')) {
        const m = /^<(\/?)([a-z0-9]+)/i.exec(del);
        const navn = m?.[2]?.toLowerCase();
        if (navn && UTEN_LENKER.has(navn)) {
          if (m?.[1]) stabel.pop();
          else stabel.push(navn);
        }
        return BEGREPSLENKE.test(del) && !/class=/.test(del) ? del.replace(/^<a\s/i, '<a class="begrepslenke" ') : del;
      }
      if (stabel.length > 0 || del.trim() === '') return del;
      return lenkTekst(del, aktuelle, lenket, valg);
    })
    .join('');
}

/**
 * Lenker første forekomst av hvert begrep i en tekstbit, i rekkefølgen de står. Lengste treff vinner. Treff på
 * begrepet teksten handler om, blir stående uten lenke.
 */
function lenkTekst(tekst: string, aktuelle: readonly Begrepsord[], lenket: Set<string>, { malform, egenId }: Valg): string {
  let ut = '';
  let rest = tekst;
  for (;;) {
    let best: { id: string; start: number; slutt: number } | null = null;
    for (const b of aktuelle) {
      if (lenket.has(b.id)) continue;
      for (const o of b.ord[malform]) {
        const treff = monsterFor(o).exec(rest);
        if (!treff) continue;
        const start = treff.index;
        const slutt = start + treff[0].length;
        if (!best || start < best.start || (start === best.start && slutt > best.slutt)) best = { id: b.id, start, slutt };
      }
    }
    if (!best) return ut + rest;
    const ord = rest.slice(best.start, best.slutt);
    if (best.id === egenId) {
      ut += rest.slice(0, best.slutt);
    } else {
      lenket.add(best.id);
      ut += `${rest.slice(0, best.start)}<a class="begrepslenke" href="#/begreper/${best.id}">${ord}</a>`;
    }
    rest = rest.slice(best.slutt);
  }
}
