// Når velkomsten (fase 10) er åpen. Ligger i startpakken, så forsiden og Innstillinger kan åpne den uten å laste
// selve velkomsten. Velkomsten lastes først når den åpnes (`VelkomstLaster`).
import { useEffect, useState } from 'preact/hooks';
import { utvikling } from 'virtual:testoppsett';
import { tilstand } from '../tilstand.ts';

/** I utvikling, i testene og i testversjonen kan velkomsten vises med `?vis=velkomst` i adressen, som meldingen om ny versjon. */
export const FORHANDSVISNING = 'vis=velkomst';

let apen = false;
const lyttere = new Set<(apen: boolean) => void>();

function sett(verdi: boolean): void {
  if (apen === verdi) return;
  apen = verdi;
  for (const l of lyttere) l(apen);
}

export function apneVelkomst(): void {
  sett(true);
}

/** Lukker velkomsten og husker at den er sett, så den ikke åpnes av seg selv igjen. */
export function lukkVelkomst(): void {
  sett(false);
  if (!tilstand.data.velkomst)
    tilstand.oppdater((d) => ({
      ...d,
      velkomst: new Date().toISOString().slice(0, 10),
    }));
}

export function velkomstApen(): boolean {
  return apen;
}

export function useVelkomstApen(): boolean {
  const [verdi, settVerdi] = useState(apen);
  useEffect(() => {
    settVerdi(apen);
    lyttere.add(settVerdi);
    return () => void lyttere.delete(settVerdi);
  }, []);
  return verdi;
}

/**
 * Velkomsten åpnes av seg selv bare ved første besøk, og bare når det lander på forsiden. En delt lenke til en side går
 * rett dit. Ende-til-ende-testene (navigator.webdriver) starter uten lagrede data og får den bare med `?vis=velkomst`.
 */
export function skalApnesAvSegSelv(sti: string, hash: string, webdriver: boolean): boolean {
  if ((utvikling || __TESTVERSJON__) && hash.includes(FORHANDSVISNING)) return true;
  return tilstand.ny && !tilstand.data.velkomst && sti === '/' && !webdriver;
}
