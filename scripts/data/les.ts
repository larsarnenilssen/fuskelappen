// Felles lesing av dataene i data/ for skriptene og Vite-pluginene, så de leser filene på samme måte som appen
// (src/data/, avgjørelse 049). Fag- og timefordelingen velges for skoleåret på datoen.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { velgFordeling } from '../../src/data/skolear.ts';
import { medGrunnlagFraVigo } from '../../src/modules/fag/tilbud/modell.ts';
import type { Fagindeks } from '../../src/modules/fag/skjema.ts';
import type { Fagfordeling } from '../../src/modules/fag/tilbud/skjema.ts';
import type { Fagrelasjoner } from '../../src/modules/fag/vigo/skjema.ts';

const json = <T>(fil: string): T => JSON.parse(readFileSync(fil, 'utf8')) as T;

export const lesFagindeks = (rot: string): Fagindeks => json<Fagindeks>(join(rot, 'data/grep/fagindeks.json'));

/** Alle fag- og timefordelingene i data/udir, ett per skoleår. */
export function lesFordelinger(rot: string): Fagfordeling[] {
  const mappe = join(rot, 'data/udir');
  if (!existsSync(mappe)) return [];
  return readdirSync(mappe)
    .filter((f) => /^fagfordeling-\d{4}-\d{4}\.json$/.test(f))
    .map((f) => json<Fagfordeling>(join(mappe, f)));
}

/** Fag- og timefordelingen som gjelder på datoen (standard: i dag). */
export function lesFordeling(rot: string, dato = new Date().toISOString().slice(0, 10)): Fagfordeling | null {
  return velgFordeling(lesFordelinger(rot), dato);
}

/** Fagrelasjonene fra VIGO, eller null hvis filen mangler. */
export function lesFagrelasjoner(rot: string): Fagrelasjoner | null {
  const fil = join(rot, 'data/vigo/fagrelasjoner.json');
  return existsSync(fil) ? json<Fagrelasjoner>(fil) : null;
}

/**
 * Fagindeksen til tilbudsstrukturen: Grep, med grunnlaget for inntak fra VIGO der Grep ikke sier hva påbygging
 * bygger på (Vg4 påbygging etter lærefag, medGrunnlagFraVigo).
 */
export function lesTilbudsindeks(rot: string): Fagindeks {
  return medGrunnlagFraVigo(lesFagindeks(rot), lesFagrelasjoner(rot)?.grunnlag ?? {});
}
