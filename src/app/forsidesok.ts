// Om søkefeltet på forsiden er synlig (avgjørelse 056). Når brukeren har rullet forbi det, viser toppfeltet en
// søkeknapp som fører tilbake til feltet. Forsiden melder fra, toppfeltet lytter.
import { useEffect, useState } from 'preact/hooks';

let synlig = true;
const lyttere = new Set<(s: boolean) => void>();

export function settForsidesokSynlig(ny: boolean): void {
  if (ny === synlig) return;
  synlig = ny;
  for (const l of lyttere) l(ny);
}

export function useForsidesokSynlig(): boolean {
  const [s, settS] = useState(synlig);
  useEffect(() => {
    settS(synlig);
    lyttere.add(settS);
    return () => {
      lyttere.delete(settS);
    };
  }, []);
  return s;
}

/** Ruller til toppen av forsiden og setter markøren i søkefeltet. */
export function gaaTilForsidesok(): void {
  const felt = document.querySelector<HTMLInputElement>('.forside-topp input[type="search"]');
  const rolig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: rolig ? 'auto' : 'smooth' });
  felt?.focus({ preventScroll: true });
}
