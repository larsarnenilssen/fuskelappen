// Felles mønster for lasting av data i appen: lastes første gang de trengs, deles av alle som spør, og kan prøves
// på nytt etter en feil (f.eks. uten nett før appen er installert). Se src/data/README.md.

/** En laster som husker svaret, men glemmer en feil så neste kall prøver igjen. */
export function enGang<T>(last: () => Promise<T>): () => Promise<T> {
  let lopende: Promise<T> | null = null;
  return () => {
    lopende ??= last();
    lopende.catch(() => {
      lopende = null;
    });
    return lopende;
  };
}
