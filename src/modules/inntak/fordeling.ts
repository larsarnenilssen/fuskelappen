// Fag- og timefordelingen fra Udir-1 (data/udir), til fagene i poengberegningen til Vg2 og Vg3. Den som gjelder
// for dagens skoleår, velges som i resten av appen (velgFordeling), så et nytt rundskriv tas i bruk fra 1. august.
// Egen fil, så Inntak ikke laster noe av dette før poengberegningen åpnes (startpakken).
import { iDag } from '../arbeidstid/kontekst.ts';
import { velgFordeling } from '../fag/tilbud/modell.ts';
import type { Fagfordeling } from '../fag/tilbud/skjema.ts';

const fordelinger = import.meta.glob<Fagfordeling>('/data/udir/fagfordeling-*.json', { import: 'default' });
let fagfordeling: Promise<Fagfordeling> | null = null;

/** Fil for skoleåret som gjelder på datoen, blant filnavnene «…/fagfordeling-2026-2027.json». */
export function fordelingsfil(filer: readonly string[], dato: string): string | null {
  const medAar = filer.flatMap((fil) => {
    const m = /fagfordeling-(\d{4}-\d{4})\.json$/.exec(fil);
    return m?.[1] ? [{ fil, skolear: m[1] }] : [];
  });
  return velgFordeling(medAar, dato)?.fil ?? null;
}

export function hentFagfordeling(): Promise<Fagfordeling> {
  const fil = fordelingsfil(Object.keys(fordelinger), iDag());
  const last = fil ? fordelinger[fil] : undefined;
  if (!last) return Promise.reject(new Error('Fant ikke fag- og timefordelingen.'));
  fagfordeling ??= last();
  fagfordeling.catch(() => {
    fagfordeling = null;
  });
  return fagfordeling;
}
