// Skissen til designløftet (fase 8b, docs/DESIGN.md). Finnes bare i utvikling, i testene og i testversjonen. Filen
// lastes med import() fra main.tsx og ruteliste.ts bak en sjekk av byggemodus, så den er helt borte fra appen. Stilene i designskisse.css gjelder det som står inni `.ny-design`: «Etter» på
// skissesiden, og hele appen når brukeren slår på bryteren på skissesiden (klassen står da på <html>).

const NOKKEL = 'jukselappen-designskisse';

/** Om hele appen vises i ny stil på denne enheten. */
export function lesNyStil(): boolean {
  try {
    return localStorage.getItem(NOKKEL) === '1';
  } catch {
    return false;
  }
}

export function settNyStil(pa: boolean): void {
  try {
    if (pa) localStorage.setItem(NOKKEL, '1');
    else localStorage.removeItem(NOKKEL);
  } catch {
    // Lagringen er ikke tilgjengelig. Valget gjelder til siden lastes på nytt.
  }
  document.documentElement.classList.toggle('ny-design', pa);
}

/** Laster stilene og setter klassen ved oppstart. */
export function startDesignskisse(): void {
  void import('../styles/designskisse.css');
  if (lesNyStil()) document.documentElement.classList.add('ny-design');
}
