// Leser alt innhold og alle regelsett fra repoet (ikke testdata). Brukes av kildejobben og kontrollrapporten.
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import type { Innholdselement } from '../../src/core/innhold/skjema.ts';
import { slaaSammen } from '../../src/core/regler/motor.ts';
import type { Regelsett } from '../../src/core/regler/skjema.ts';
import { lesFil } from './last.ts';

function yamlFiler(mappe: string): string[] {
  return readdirSync(mappe).flatMap((navn) => {
    const sti = join(mappe, navn);
    if (statSync(sti).isDirectory()) return yamlFiler(sti);
    return navn.endsWith('.yaml') ? [sti] : [];
  });
}

const SPESIELLE = new Set(['content/kilder.yaml', 'content/fylker.yaml', 'content/sok/synonymer.yaml', 'content/kontroll/praksis.yaml', 'content/lovverk.yaml']);

/** Alle regelsett under rules/, med delene slått sammen. */
export function lesRegelsett(rot: string): Regelsett[] {
  return slaaSammen(yamlFiler(join(rot, 'rules')).map((f) => lesFil(rot, f) as Regelsett));
}

/** Alle innholdselementer under content/, med filen de står i. Teksten beholdes som markdown. */
export function lesInnhold(rot: string): { fil: string; element: Innholdselement }[] {
  return yamlFiler(join(rot, 'content'))
    .filter((f) => !SPESIELLE.has(relative(rot, f).split('\\').join('/')))
    .flatMap((f) => (lesFil(rot, f, false) as Innholdselement[]).map((element) => ({ fil: relative(rot, f), element })));
}
