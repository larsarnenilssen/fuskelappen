// Delene forsiden er bygd av (avgjørelse 056 og 066): gruppene som åpnes og lukkes, og bredden sidekolonnen brukes fra.
// Brukes av forsiden og av panelet øverst (Forsidepanel.tsx).
import type { ComponentChildren } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { Ikon } from '../components/Ikon.tsx';
import { vekslGruppe } from './tilstand.ts';

/**
 * Fra denne bredden (rem) står «Neste datoer» og favorittene i en sidekolonne like bred som hovedkolonnen: halv skjerm
 * på en 15" laptop med 1440 px eller mer (eier 05.10.2026). Smalere står alt i én kolonne, som på mobil.
 */
export const SIDEKOLONNE_FRA = 44;

/** Hvor lenge åpning og lukking tar. Samme som --varighet-lang i tokens.css. */
const ANIMASJON_MS = 220;

/**
 * En gruppe med overskrift som åpner og lukker den, med en myk animasjon (ikke ved redusert bevegelse). Lukket viser
 * overskriften hva som er inni (`sammendrag`). `verktoy` (blyanten for favorittene) står i overskriften ved siden av
 * pilen, som egen knapp oppå raden, så resten av raden fortsatt åpner og lukker gruppen (eier 04.10.2026).
 */
export function Gruppe({
  id,
  tittel,
  sammendrag,
  kategori,
  lukket,
  verktoy,
  onVeksle,
  children,
}: {
  id: string;
  tittel: string;
  sammendrag: string;
  kategori?: string;
  lukket: boolean;
  verktoy?: ComponentChildren;
  /** Uten: gruppen åpnes og lukkes med vekslGruppe. */
  onVeksle?: () => void;
  children: ComponentChildren;
}) {
  const innhold = `forside-gruppe-${id}`;
  // Innholdet er i DOM-en (vis) til lukkingen er ferdig animert, og utvidet når det skal ha full høyde.
  const [vis, settVis] = useState(!lukket);
  const [utvidet, settUtvidet] = useState(!lukket);
  const [animerer, settAnimerer] = useState(false);
  const forste = useRef(true);
  useEffect(() => {
    if (forste.current) {
      forste.current = false;
      return;
    }
    const rolig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    settAnimerer(!rolig);
    let ramme = 0;
    if (lukket) settUtvidet(false);
    else {
      settVis(true);
      ramme = requestAnimationFrame(() => requestAnimationFrame(() => settUtvidet(true)));
    }
    const ferdig = setTimeout(() => {
      if (lukket) settVis(false);
      settAnimerer(false);
    }, rolig ? 0 : ANIMASJON_MS);
    return () => {
      cancelAnimationFrame(ramme);
      clearTimeout(ferdig);
    };
  }, [lukket]);
  return (
    <section class="kategori forsidegruppe" data-gruppe={id} data-kategori={kategori} aria-labelledby={`${innhold}-tittel`}>
      <h2 id={`${innhold}-tittel`} class={verktoy && !lukket ? 'med-verktoy' : undefined}>
        <button type="button" class="gruppeknapp" aria-expanded={!lukket} aria-controls={innhold} onClick={onVeksle ?? (() => vekslGruppe(id))}>
          <span class="gruppeknapp-tekst">
            <span>{tittel}</span>
            {lukket && <span class="gruppe-sammendrag">{sammendrag}</span>}
          </span>
          <Ikon navn={lukket ? 'ned' : 'opp'} class="ikon-liten" />
        </button>
        {!lukket && verktoy}
      </h2>
      <div id={innhold} class={`gruppe-innhold${utvidet ? ' utvidet' : ''}${animerer ? ' animerer' : ''}`} hidden={!vis}>
        <div class="gruppe-innhold-indre">{children}</div>
      </div>
    </section>
  );
}

/** Sant når skjermen er minst så bred, og oppdateres når bredden endres. */
export function useMinstBredde(rem: number): boolean {
  const sporring = `(min-width: ${rem}rem)`;
  const [treff, settTreff] = useState(() => typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia(sporring).matches);
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia(sporring);
    const lytt = () => settTreff(mq.matches);
    mq.addEventListener('change', lytt);
    return () => mq.removeEventListener('change', lytt);
  }, [sporring]);
  return treff;
}

