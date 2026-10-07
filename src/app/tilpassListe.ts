// Listene i panelet øverst på forsiden (Kalender og Nyheter, eier 07.10.2026): inntil fire oppføringer i en boks med
// høyst samme høyde. En oppføring som ikke får helt plass, skjules i stedet for å bli kuttet, og boksen blir lavere, så
// det aldri står luft under den siste. På smale skjermer, der titlene går over flere linjer, står det derfor færre.
import { useLayoutEffect, useRef, useState } from 'preact/hooks';

/**
 * `boks` er rammen (med `max-height` i CSS og klassen `maler` mens det måles), `liste` er listen med oppføringene.
 * `hoyde` er høyden boksen fikk, så en annen visning på samme plass (saken alene) kan få den samme.
 */
export function useTilpassetListe(avhengigheter: readonly unknown[]) {
  const boks = useRef<HTMLDivElement>(null);
  const liste = useRef<HTMLUListElement>(null);
  const [hoyde, settHoyde] = useState<number | null>(null);
  useLayoutEffect(() => {
    const ul = liste.current;
    const ramme = boks.current;
    if (!ul || !ramme) return;
    let bredde = -1;
    const tilpass = () => {
      // Bare bredden endrer hvor mange som får plass. Høyden endres av tilpassingen selv.
      if (ramme.clientWidth === bredde) return;
      bredde = ramme.clientWidth;
      const rader = [...ul.children] as HTMLElement[];
      for (const li of rader) li.hidden = false;
      ramme.classList.add('maler');
      for (const li of rader) li.hidden = li.offsetTop + li.offsetHeight > ul.clientHeight + 1;
      ramme.classList.remove('maler');
      settHoyde(ramme.offsetHeight);
    };
    tilpass();
    if (typeof ResizeObserver === 'undefined') return;
    const observator = new ResizeObserver(tilpass);
    observator.observe(ramme);
    return () => observator.disconnect();
  }, avhengigheter);
  return { boks, liste, hoyde };
}
