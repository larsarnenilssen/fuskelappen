// En liste som kan sorteres (avgjørelse 056): dra i håndtaket, med fingeren eller musen, eller bruk pilene. Pilene er
// med for tastatur og skjermleser. Bare håndtaket fanger pekeren (touch-action: none), så resten av listen ruller som
// vanlig. Listen endrer seg mens brukeren drar, og elementet følger fingeren.
import type { ComponentChildren } from 'preact';
import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import { useTekst } from '../app/tilstand.ts';
import { Ikon } from './Ikon.tsx';

export interface Sorterbart {
  id: string;
  navn: string;
  innhold: ComponentChildren;
  /** Knapper til høyre for pilene, f.eks. «Fjern». */
  ekstra?: ComponentChildren;
}

interface Dra {
  id: string;
  /** Avstanden fra toppen av elementet til der brukeren tok tak. */
  grep: number;
  /** Pekerens siste posisjon, i forhold til vinduet. */
  y: number;
}

/** Hvor nær kanten av vinduet pekeren må være før siden ruller av seg selv. */
const RULLEKANT = 56;

export function Sorterbar({ elementer, etikett, onFlytt }: { elementer: readonly Sorterbart[]; etikett: string; onFlytt: (fra: number, til: number) => void }) {
  const { t } = useTekst();
  const liste = useRef<HTMLOListElement>(null);
  const dra = useRef<Dra | null>(null);
  const forskyvning = useRef(0);
  const venterPaaBytte = useRef(false);
  const [draId, settDraId] = useState<string | null>(null);
  const [dy, settDy] = useState(0);

  const element = (id: string) => liste.current?.querySelector<HTMLElement>(`[data-id="${CSS.escape(id)}"]`) ?? null;

  /** Flytter elementet så det følger pekeren, ut fra der det står i listen nå. */
  const folg = () => {
    const d = dra.current;
    const el = d && element(d.id);
    if (!d || !el) return;
    const naturligTopp = el.getBoundingClientRect().top - forskyvning.current;
    forskyvning.current = d.y - d.grep - naturligTopp;
    settDy(forskyvning.current);
  };

  // Etter et bytte står elementet et annet sted i listen. Da regnes forskyvningen ut på nytt før neste tegning.
  useLayoutEffect(() => {
    if (!dra.current) return;
    venterPaaBytte.current = false;
    folg();
  }, [elementer]);

  const start = (e: PointerEvent, id: string) => {
    if (e.button !== 0) return;
    const el = element(id);
    if (!el) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dra.current = { id, grep: e.clientY - el.getBoundingClientRect().top, y: e.clientY };
    forskyvning.current = 0;
    settDraId(id);
    settDy(0);
  };

  const beveg = (e: PointerEvent) => {
    const d = dra.current;
    if (!d) return;
    d.y = e.clientY;
    folg();
    if (e.clientY < RULLEKANT) window.scrollBy(0, -8);
    else if (e.clientY > window.innerHeight - RULLEKANT) window.scrollBy(0, 8);
    if (venterPaaBytte.current) return;
    const i = elementer.findIndex((x) => x.id === d.id);
    const forrige = elementer[i - 1] && element(elementer[i - 1]!.id);
    const neste = elementer[i + 1] && element(elementer[i + 1]!.id);
    const midt = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return r.top + r.height / 2;
    };
    if (forrige && e.clientY < midt(forrige)) {
      venterPaaBytte.current = true;
      onFlytt(i, i - 1);
    } else if (neste && e.clientY > midt(neste)) {
      venterPaaBytte.current = true;
      onFlytt(i, i + 1);
    }
  };

  const slipp = () => {
    dra.current = null;
    venterPaaBytte.current = false;
    forskyvning.current = 0;
    settDraId(null);
    settDy(0);
  };

  return (
    <ol ref={liste} class="sorterbar" aria-label={etikett}>
      {elementer.map((x, i) => (
        <li
          key={x.id}
          data-id={x.id}
          class={draId === x.id ? 'sorterbar-rad drar' : 'sorterbar-rad'}
          style={draId === x.id ? { transform: `translateY(${dy}px)` } : undefined}
        >
          <span class="sorterbar-handtak" aria-hidden="true" onPointerDown={(e) => start(e, x.id)} onPointerMove={beveg} onPointerUp={slipp} onPointerCancel={slipp}>
            <Ikon navn="dra" />
          </span>
          <span class="sorterbar-innhold">{x.innhold}</span>
          <span class="sorterbar-knapper">
            <button type="button" class="ikonknapp" disabled={i === 0} aria-label={t('sorterbar.flyttOpp', { navn: x.navn })} onClick={() => onFlytt(i, i - 1)}>
              <Ikon navn="opp" />
            </button>
            <button type="button" class="ikonknapp" disabled={i === elementer.length - 1} aria-label={t('sorterbar.flyttNed', { navn: x.navn })} onClick={() => onFlytt(i, i + 1)}>
              <Ikon navn="ned" />
            </button>
            {x.ekstra}
          </span>
        </li>
      ))}
    </ol>
  );
}
