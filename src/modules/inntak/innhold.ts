// Laster veiviseren, stegene, fristene og reglene for poengberegningen fra content/inntak/ ved behov.
import type { Frist, Innholdselement, Stegelement, Veiviserelement } from '../../core/innhold/skjema.ts';
import { velgFordeling } from '../fag/tilbud/modell.ts';
import type { Fagfordeling } from '../fag/tilbud/skjema.ts';
import { iDag } from '../arbeidstid/kontekst.ts';

const filer = import.meta.glob<Innholdselement[]>('/content/inntak/*.yaml', { import: 'default' });

export interface Inntaksinnhold {
  veivisere: Veiviserelement[];
  steg: Stegelement[];
  frister: Frist[];
  /** Reglene for poengberegningen («Slik regnes poengene»). */
  regler: Innholdselement[];
}

let lopende: Promise<Inntaksinnhold> | null = null;

export function hentInnhold(): Promise<Inntaksinnhold> {
  lopende ??= Promise.all(Object.values(filer).map((last) => last())).then((lister) => {
    const alle = lister.flat();
    return {
      veivisere: alle.filter((e): e is Veiviserelement => e.type === 'veiviser'),
      steg: alle.filter((e): e is Stegelement => e.type === 'steg'),
      frister: alle.filter((e): e is Frist => e.type === 'frist'),
      regler: alle.filter((e) => e.type === 'regel'),
    };
  });
  lopende.catch(() => {
    lopende = null;
  });
  return lopende;
}

// Fag- og timefordelingen fra Udir-1 (data/udir), til fagene i poengberegningen til Vg2 og Vg3. Den som gjelder
// for dagens skoleår, velges som i resten av appen (velgFordeling), så et nytt rundskriv tas i bruk fra 1. august.
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

export const veiviserRute = (id: string) => `/inntak/${id}`;
export const fristerRute = '/inntak/frister';
export const poengRute = '/inntak/poeng';

/** Har appen lokalt innhold om inntak for fylket? */
export function harLokalt(innhold: Inntaksinnhold, fylke: string | null): boolean {
  return fylke !== null && [...innhold.veivisere, ...innhold.steg, ...innhold.frister, ...innhold.regler].some((e) => e.gyldighet.niva !== 'nasjonal' && e.gyldighet.fylke === fylke);
}
