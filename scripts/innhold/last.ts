// Leser og validerer YAML-filer fra content/, rules/ og testdata.
// Brukes av Vite-pluginen (bygg og tester) og av skriptene.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { Marked } from 'marked';
import { parse } from 'yaml';
import type { ZodType } from 'zod';
import {
  fylkerSkjema,
  fylkeslenkerSkjema,
  innholdsfil,
  kilderegisterSkjema,
  parallellerSkjema,
  praksisfilSkjema,
  synonymSkjema,
  type Innholdselement,
} from '../../src/core/innhold/skjema.ts';
import { regelsettSkjema } from '../../src/core/regler/skjema.ts';
import { lovutvalgSkjema } from '../../src/modules/lov/skjema.ts';
import { nyhetskilderSkjema } from '../../src/modules/nyheter/kildeskjema.ts';
import { byggBegrepsord, type Begrepsord, lenkBegreper } from '../../src/core/innhold/begrepslenker.ts';

type Filtype = 'kilderegister' | 'paralleller' | 'fylker' | 'fylkeslenker' | 'synonymer' | 'praksis' | 'lovutvalg' | 'nyhetskilder' | 'innhold' | 'regelsett';

const skjemaer: Record<Filtype, ZodType> = {
  kilderegister: kilderegisterSkjema,
  paralleller: parallellerSkjema,
  fylker: fylkerSkjema,
  fylkeslenker: fylkeslenkerSkjema,
  synonymer: synonymSkjema,
  praksis: praksisfilSkjema,
  lovutvalg: lovutvalgSkjema,
  nyhetskilder: nyhetskilderSkjema,
  innhold: innholdsfil,
  regelsett: regelsettSkjema,
};

export function filtype(relSti: string): Filtype | null {
  const sti = relSti.split(sep).join('/');
  if (sti === 'content/kilder.yaml') return 'kilderegister';
  if (sti === 'content/fylker.yaml') return 'fylker';
  if (sti === 'content/fylker/lenker.yaml') return 'fylkeslenker';
  if (sti === 'content/sok/synonymer.yaml') return 'synonymer';
  if (sti === 'content/kontroll/praksis.yaml') return 'praksis';
  if (sti === 'content/lovverk.yaml') return 'lovutvalg';
  if (sti === 'content/privatskole/paralleller.yaml') return 'paralleller';
  if (sti === 'content/nyheter/kilder.yaml') return 'nyhetskilder';
  if (sti.startsWith('content/') || sti.startsWith('tests/fixtures/innhold/')) return 'innhold';
  if (sti.startsWith('rules/') || sti.startsWith('tests/fixtures/regler/')) return 'regelsett';
  return null;
}

export class Innholdsfeil extends Error {}

const markdown = new Marked({ gfm: true, async: false });

function tilHtml(tekst: string): string {
  return (markdown.parse(tekst) as string).trim();
}

function formaterFeil(sti: string, feil: { issues: { path: PropertyKey[]; message: string }[] }): string {
  const linjer = feil.issues.map((i) => `  • ${i.path.map(String).join('.') || '(rot)'}: ${i.message}`);
  return `Ugyldig innhold i ${sti}:\n${linjer.join('\n')}`;
}

/** Fylket et element gjelder for, eller null for nasjonalt innhold. */
function fylkeFor(e: Innholdselement): string | null {
  return e.gyldighet.niva === 'nasjonal' ? null : e.gyldighet.fylke;
}

/** Teksten som HTML, med lenker til begrepsbanken (avgjørelse 050) når begrepene er kjent. */
function medLenker(e: Innholdselement, begrepsord: readonly Begrepsord[] | null) {
  return (tekst: { nb: string; nn: string }) => {
    const html = { nb: tilHtml(tekst.nb), nn: tilHtml(tekst.nn) };
    if (!begrepsord) return html;
    const valg = { egenId: e.type === 'begrep' ? e.id : undefined, fylke: fylkeFor(e) };
    return {
      nb: lenkBegreper(html.nb, begrepsord, { ...valg, malform: 'nb' }),
      nn: lenkBegreper(html.nn, begrepsord, { ...valg, malform: 'nn' }),
    };
  };
}

/** Parser og validerer en fil. Kaster Innholdsfeil med lesbar melding ved feil. */
export function validerTekst(relSti: string, tekst: string, medHtml = true, begrepsord: readonly Begrepsord[] | null = null): unknown {
  const type = filtype(relSti);
  if (type === null) throw new Innholdsfeil(`Ukjent innholdsfil: ${relSti}`);
  let data: unknown;
  try {
    data = parse(tekst);
  } catch (e) {
    throw new Innholdsfeil(`YAML-feil i ${relSti}: ${(e as Error).message}`);
  }
  const resultat = skjemaer[type].safeParse(data);
  if (!resultat.success) throw new Innholdsfeil(formaterFeil(relSti, resultat.error));
  if (type === 'innhold' && medHtml) {
    return (resultat.data as Innholdselement[]).map((e) => {
      const html = medLenker(e, begrepsord);
      return {
        ...e,
        tekst: html(e.tekst),
        ...(e.type === 'steg' && e.forklaring ? { forklaring: html(e.forklaring) } : {}),
        ...(e.privatskole ? { privatskole: { ...e.privatskole, tekst: html(e.privatskole.tekst) } } : {}),
      };
    });
  }
  return resultat.data;
}

const begrepscache = new Map<string, { nokkel: string; ord: Begrepsord[] }>();

/**
 * Lenkeordene til begrepene i content/begreper/, som appen viser i begrepsbanken. Lest på nytt når en fil der er
 * endret, så nye begreper får lenker uten omstart.
 */
export function lesBegrepsord(rot: string): Begrepsord[] {
  const mappe = join(rot, 'content/begreper');
  if (!existsSync(mappe)) return [];
  const filer = readdirSync(mappe).filter((f) => f.endsWith('.yaml')).sort().map((f) => join(mappe, f));
  const nokkel = filer.map((f) => `${f}:${statSync(f).mtimeMs}`).join('|');
  const lagret = begrepscache.get(rot);
  if (lagret?.nokkel === nokkel) return lagret.ord;
  const ord = byggBegrepsord(filer.flatMap((f) => validerTekst(relative(rot, f), readFileSync(f, 'utf8'), false) as Innholdselement[]));
  begrepscache.set(rot, { nokkel, ord });
  return ord;
}

export function lesFil(rot: string, absSti: string, medHtml = true): unknown {
  const rel = relative(rot, absSti);
  const begrepsord = medHtml && filtype(rel) === 'innhold' ? lesBegrepsord(rot) : null;
  return validerTekst(rel, readFileSync(absSti, 'utf8'), medHtml, begrepsord);
}
