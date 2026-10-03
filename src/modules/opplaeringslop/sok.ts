// Søk etter tilbud (programområder) på navn eller kode, brukt i Opplæringsløp og i skoleoppslaget. Ren funksjon.
import type { Fagindeks } from '../fag/skjema.ts';
import { erVariant } from '../fag/tilbud/modell.ts';
import { kortKode } from './data.ts';

/** Tilbudene som passer søket: navn eller kode. Tilbud i skole først, så lærefag, og varianter for særskilte skoler sist. */
export function sokTilbud(indeks: Fagindeks, sok: string, malform: 'nb' | 'nn'): string[] {
  const ord = sok.toLowerCase().split(/\s+/).filter(Boolean);
  const rang = (k: string) => (erVariant(k) ? 2 : indeks.programomrader[k]?.sted === 'bedrift' ? 1 : 0);
  return Object.entries(indeks.programomrader)
    .filter(([k, po]) => {
      const tekst = `${po.navn[malform]} ${po.navn.nb} ${kortKode(k)} ${po.trinn}`.toLowerCase();
      return ord.every((o) => tekst.includes(o));
    })
    .map(([k]) => k)
    .sort((a, b) => rang(a) - rang(b) || (indeks.programomrader[a]?.trinn ?? '').localeCompare(indeks.programomrader[b]?.trinn ?? '') || a.localeCompare(b));
}
