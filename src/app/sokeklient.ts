// Laster søkeindeksen første gang søket brukes. Ved publisering er indeksen
// bygget på forhånd (scripts/bygg-sokeindeks.ts). I utvikling bygges den her.
import synonymerFil from '../../content/sok/synonymer.yaml';
import type { Synonymer } from '../core/innhold/skjema.ts';
import type { Sokeresultat } from '../core/sok/sok.ts';

const synonymer = synonymerFil as Synonymer;

type Sokefunksjon = (sporring: string) => Sokeresultat[];

let lopende: Promise<Sokefunksjon> | null = null;

async function lag(): Promise<Sokefunksjon> {
  const { byggIndeks, lastIndeks, sok } = await import('../core/sok/sok.ts');
  if (import.meta.env.DEV) {
    const { samleSokeoppforinger } = await import('../modules/register.ts');
    const { kjerneoppforinger } = await import('./kjerneoppforinger.ts');
    const indeks = byggIndeks([...kjerneoppforinger(), ...(await samleSokeoppforinger())], synonymer);
    return (s) => sok(indeks, s);
  }
  const svar = await fetch(`${import.meta.env.BASE_URL}sok/indeks.json`);
  if (!svar.ok) throw new Error(`Søkeindeksen svarte ${svar.status}`);
  const indeks = lastIndeks(await svar.text(), synonymer);
  return (s) => sok(indeks, s);
}

export function hentSok(): Promise<Sokefunksjon> {
  lopende ??= lag().catch((e: unknown) => {
    lopende = null;
    throw e;
  });
  return lopende;
}
