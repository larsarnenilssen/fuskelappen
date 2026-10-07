// Laster søkeindeksen første gang søket brukes. Ved publisering er indeksen
// bygget på forhånd (scripts/bygg-sokeindeks.ts). I utvikling bygges den her.
import synonymerFil from '../../content/sok/synonymer.yaml';
import type { Synonymer } from '../core/innhold/skjema.ts';
import type { Sokeresultat } from '../core/sok/sok.ts';

const synonymer = synonymerFil as Synonymer;

type Sokefunksjon = (sporring: string) => Sokeresultat[];

/**
 * Så mange treff hentes. Søkeboksen viser 50 om gangen og teller treffene i hver gruppe av disse, så filtrene kan vise
 * treff som ville stått langt nede (avgjørelse 058).
 */
const GRENSE = 1000;

let lopende: Promise<Sokefunksjon> | null = null;

async function lag(): Promise<Sokefunksjon> {
  const { byggIndeks, lastIndeks, sok } = await import('../core/sok/sok.ts');
  if (import.meta.env.DEV) {
    const { lastAlleTekster } = await import('../core/i18n/tekst.ts');
    await lastAlleTekster();
    const { samleSokeoppforinger } = await import('../modules/register.ts');
    const { kjerneoppforinger } = await import('./kjerneoppforinger.ts');
    const indeks = byggIndeks([...kjerneoppforinger(), ...(await samleSokeoppforinger())], synonymer);
    return (s) => sok(indeks, s, GRENSE);
  }
  const svar = await fetch(`${import.meta.env.BASE_URL}sok/indeks.json`);
  if (!svar.ok) throw new Error(`Søkeindeksen svarte ${svar.status}`);
  const indeks = lastIndeks(await svar.text(), synonymer);
  return (s) => sok(indeks, s, GRENSE);
}

export function hentSok(): Promise<Sokefunksjon> {
  lopende ??= lag().catch((e: unknown) => {
    lopende = null;
    throw e;
  });
  return lopende;
}
