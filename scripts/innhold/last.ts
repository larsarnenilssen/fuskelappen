// Leser og validerer YAML-filer fra content/, rules/ og testdata.
// Brukes av Vite-pluginen (bygg og tester) og av skriptene.
import { readFileSync } from 'node:fs';
import { relative, sep } from 'node:path';
import { Marked } from 'marked';
import { parse } from 'yaml';
import type { ZodType } from 'zod';
import {
  fylkerSkjema,
  innholdsfil,
  kilderegisterSkjema,
  praksisfilSkjema,
  synonymSkjema,
  type Innholdselement,
} from '../../src/core/innhold/skjema.ts';
import { regelsettSkjema } from '../../src/core/regler/skjema.ts';

type Filtype = 'kilderegister' | 'fylker' | 'synonymer' | 'praksis' | 'innhold' | 'regelsett';

const skjemaer: Record<Filtype, ZodType> = {
  kilderegister: kilderegisterSkjema,
  fylker: fylkerSkjema,
  synonymer: synonymSkjema,
  praksis: praksisfilSkjema,
  innhold: innholdsfil,
  regelsett: regelsettSkjema,
};

export function filtype(relSti: string): Filtype | null {
  const sti = relSti.split(sep).join('/');
  if (sti === 'content/kilder.yaml') return 'kilderegister';
  if (sti === 'content/fylker.yaml') return 'fylker';
  if (sti === 'content/sok/synonymer.yaml') return 'synonymer';
  if (sti === 'content/kontroll/praksis.yaml') return 'praksis';
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

/** Parser og validerer en fil. Kaster Innholdsfeil med lesbar melding ved feil. */
export function validerTekst(relSti: string, tekst: string, medHtml = true): unknown {
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
    return (resultat.data as Innholdselement[]).map((e) => ({
      ...e,
      tekst: { nb: tilHtml(e.tekst.nb), nn: tilHtml(e.tekst.nn) },
    }));
  }
  return resultat.data;
}

export function lesFil(rot: string, absSti: string, medHtml = true): unknown {
  return validerTekst(relative(rot, absSti), readFileSync(absSti, 'utf8'), medHtml);
}
