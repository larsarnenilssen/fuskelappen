// Skoleåret og valget av fag- og timefordeling (Udir-1) etter dato. Brukes av appen, av Vite-pluginene og av
// skriptene, så hele appen bruker samme rundskriv. Rene funksjoner.

/** Dagens dato, ÅÅÅÅ-MM-DD, i lokal tid. */
export function iDag(): string {
  const d = new Date();
  const to = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${to(d.getMonth() + 1)}-${to(d.getDate())}`;
}

/** Skoleåret for en dato (ÅÅÅÅ-MM-DD): skoleåret begynner 1. august. 2026-10-01 → 2026-2027. */
export function skolearFor(dato: string): string {
  const aar = Number(dato.slice(0, 4));
  const start = Number(dato.slice(5, 7)) >= 8 ? aar : aar - 1;
  return `${start}-${start + 1}`;
}

/**
 * Fag- og timefordelingen som gjelder på datoen: skoleåret datoen ligger i, ellers det siste skoleåret før.
 * Finnes bare senere skoleår, brukes det første av dem.
 */
export function velgFordeling<T extends { skolear: string }>(fordelinger: readonly T[], dato: string): T | null {
  const naa = skolearFor(dato);
  const sortert = [...fordelinger].sort((a, b) => a.skolear.localeCompare(b.skolear));
  return sortert.filter((f) => f.skolear <= naa).at(-1) ?? sortert[0] ?? null;
}

/** Filen for skoleåret som gjelder på datoen, blant filnavn som «…/fagfordeling-2026-2027.json». */
export function fordelingsfil(filer: readonly string[], dato: string): string | null {
  const medAar = filer.flatMap((fil) => {
    const m = /fagfordeling-(\d{4}-\d{4})\.json$/.exec(fil);
    return m?.[1] ? [{ fil, skolear: m[1] }] : [];
  });
  return velgFordeling(medAar, dato)?.fil ?? null;
}
