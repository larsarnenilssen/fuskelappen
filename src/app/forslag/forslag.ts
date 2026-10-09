// Forslag til ny presentasjon av kalenderen, nyhetene, tallene og dagens jukselapp på forsiden (09.10.2026). Eier skal
// prøve variantene i testversjonen før noe velges. Forslaget vises bare med `?forslag=1`, `2` eller `3` i adressen, og
// bare i utvikling, i testene og i testversjonen, som `?vis=velkomst`. I den publiserte appen er `FORSLAG_MULIG` usann
// ved bygging, så forslaget og stilene ikke kommer med. `?forslag=0` går tilbake til dagens forside.
//
// Valget huskes for økten (sessionStorage), så det står når brukeren går til en side og tilbake til forsiden.
import { useEffect, useState } from 'preact/hooks';
import type * as Forsideforslag from './Forsideforslag.tsx';

export type Forslag = 0 | 1 | 2 | 3;

// Skrevet ut her, ikke med `utvikling` fra virtual:testoppsett, så verdien er kjent ved bygging og forslaget faller bort.
export const FORSLAG_MULIG: boolean = import.meta.env.MODE !== 'production' || __TESTVERSJON__;

/** Laster komponentene i forslaget. `null` i den publiserte appen, så delen ikke bygges med. */
const lastForslag = import.meta.env.MODE !== 'production' || __TESTVERSJON__ ? () => import('./Forsideforslag.tsx') : null;

const NOKKEL = 'jukselappen-forsideforslag';

const somForslag = (n: number): Forslag => (n === 1 || n === 2 || n === 3 ? n : 0);

/** Forslaget i adressen, eller det som ble valgt tidligere i økten. 0 er dagens forside. */
export function lesForslag(hash: string): Forslag {
  if (!FORSLAG_MULIG) return 0;
  const treff = /[?&]forslag=(\d)/.exec(hash);
  try {
    if (treff) {
      const valgt = somForslag(Number(treff[1]));
      if (valgt) sessionStorage.setItem(NOKKEL, String(valgt));
      else sessionStorage.removeItem(NOKKEL);
      return valgt;
    }
    return somForslag(Number(sessionStorage.getItem(NOKKEL)));
  } catch {
    return treff ? somForslag(Number(treff[1])) : 0;
  }
}

/** Forslaget som gjelder nå. Alltid 0 i den publiserte appen. */
export function useForslag(): Forslag {
  const [forslag, settForslag] = useState<Forslag>(() => (FORSLAG_MULIG && typeof location !== 'undefined' ? lesForslag(location.hash) : 0));
  useEffect(() => {
    if (!FORSLAG_MULIG) return;
    const lytt = () => settForslag(lesForslag(location.hash));
    window.addEventListener('hashchange', lytt);
    return () => window.removeEventListener('hashchange', lytt);
  }, []);
  return forslag;
}

/** Komponentene i forslaget, lastet når et forslag er valgt. */
export type Forslagsmodul = typeof Forsideforslag;

export function useForslagsmodul(forslag: Forslag): Forslagsmodul | null {
  const [modul, settModul] = useState<Forslagsmodul | null>(null);
  useEffect(() => {
    if (!lastForslag || !forslag || modul) return;
    let aktiv = true;
    void lastForslag().then((m) => aktiv && settModul(m));
    return () => {
      aktiv = false;
    };
  }, [forslag]);
  return FORSLAG_MULIG && forslag ? modul : null;
}
