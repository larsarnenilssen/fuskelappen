// Et overlegg midt på skjermen over et uklart slør, som søket (avgjørelse 088). Brukes til meldingen om ny versjon, og
// til velkomsten i fase 10. Resten av appen kan ikke nås med tastatur eller skjermleser mens overlegget er åpent, Esc
// lukker det, og fokus går til selve meldingen, så skjermlesere leser tittelen og ingen knapp får fokusring med en gang.
import type { ComponentChildren } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

export function Overlegg({
  tittelId,
  onLukk,
  klasse,
  children,
}: {
  tittelId: string;
  onLukk: () => void;
  /** Egen klasse på kortet, f.eks. for velkomsten, som har fast høyde og knappene nederst. */
  klasse?: string;
  children: ComponentChildren;
}) {
  const lag = useRef<HTMLDivElement>(null);
  const lukk = useRef(onLukk);
  lukk.current = onLukk;

  useEffect(() => {
    const element = lag.current;
    if (!element) return;
    const forrige = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    // Alt ved siden av overlegget gjøres utilgjengelig. Det som var utilgjengelig fra før, røres ikke.
    const naboer = [...(element.parentElement?.children ?? [])].filter((e): e is HTMLElement => e !== element && e instanceof HTMLElement && !e.inert);
    for (const e of naboer) e.inert = true;
    element.querySelector<HTMLElement>('[role="dialog"]')?.focus({ preventScroll: true });
    const tast = (e: KeyboardEvent) => {
      if (e.key === 'Escape') lukk.current();
    };
    window.addEventListener('keydown', tast);
    return () => {
      window.removeEventListener('keydown', tast);
      for (const e of naboer) e.inert = false;
      forrige?.focus({ preventScroll: true });
    };
  }, []);

  return (
    <div class="overlegg-lag" ref={lag}>
      <div class={klasse ? `overlegg ${klasse}` : 'overlegg'} role="dialog" aria-modal="true" aria-labelledby={tittelId} tabIndex={-1}>
        {children}
      </div>
    </div>
  );
}
