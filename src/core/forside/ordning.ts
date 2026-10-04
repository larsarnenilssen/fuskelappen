// Rekkefølgen på forsiden (avgjørelse 056): gruppene i brukerens rekkefølge, og flytting i lister. Rene funksjoner,
// så de kan testes uten grensesnittet.

/** Flytter elementet på plass `fra` til plass `til`. Utenfor listen gir listen uendret. */
export function flytt<T>(liste: readonly T[], fra: number, til: number): T[] {
  if (fra === til || fra < 0 || til < 0 || fra >= liste.length || til >= liste.length) return [...liste];
  const ny = [...liste];
  const [element] = ny.splice(fra, 1);
  ny.splice(til, 0, element as T);
  return ny;
}

/**
 * Gruppene i brukerens rekkefølge. Grupper som ikke finnes lenger, tas bort. Nye grupper (f.eks. en ny kategori)
 * settes inn etter gruppen som står foran dem i standardrekkefølgen, eller først.
 */
export function ordneGrupper(standard: readonly string[], lagret: readonly string[]): string[] {
  const kjente = new Set(standard);
  const ordnet = lagret.filter((id, i) => kjente.has(id) && lagret.indexOf(id) === i);
  standard.forEach((id, i) => {
    if (ordnet.includes(id)) return;
    const foran = standard.slice(0, i).reverse().find((f) => ordnet.includes(f));
    ordnet.splice(foran === undefined ? 0 : ordnet.indexOf(foran) + 1, 0, id);
  });
  return ordnet;
}

/** Modulen en favoritt hører til, ut fra id-en («inntak:frister» → «inntak»). */
export const modulForFavoritt = (id: string): string => id.split(':')[0] ?? id;

/**
 * Flytter et element innenfor et utvalg av listen (f.eks. favorittene under én kategori) og gir hele listen tilbake.
 * Utvalgets elementer får de samme plassene i hele listen som før, i den nye rekkefølgen. De andre står der de sto.
 */
export function flyttInnenfor<T>(alle: readonly T[], utvalg: readonly T[], fra: number, til: number): T[] {
  const ny = flytt(utvalg, fra, til);
  const plasser = alle.map((x, i) => (utvalg.includes(x) ? i : -1)).filter((i) => i >= 0);
  const resultat = [...alle];
  plasser.forEach((plass, j) => {
    resultat[plass] = ny[j] as T;
  });
  return resultat;
}
