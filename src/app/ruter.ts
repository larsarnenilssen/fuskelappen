// Hash-ruting. Hver navigasjon er en ny oppføring i nettleserhistorikken,
// så operativsystemets egen tilbakenavigasjon virker som vanlig.
import { useEffect, useState } from 'preact/hooks';

export interface Plassering {
  sti: string;
  sporring: URLSearchParams;
}

export function lesHash(hash: string): Plassering {
  const uten = hash.replace(/^#/, '');
  const [stiDel = '', sporringDel = ''] = uten.split('?');
  let sti = stiDel.startsWith('/') ? stiDel : `/${stiDel}`;
  if (sti.length > 1 && sti.endsWith('/')) sti = sti.slice(0, -1);
  return { sti: decodeURI(sti), sporring: new URLSearchParams(sporringDel) };
}

/** Matcher "/begreper/:id" mot "/begreper/arsramme" og gir { id: "arsramme" }. */
export function matchRute(monster: string, sti: string): Record<string, string> | null {
  const m = monster.split('/').filter(Boolean);
  const s = sti.split('/').filter(Boolean);
  if (m.length !== s.length) return null;
  const parametre: Record<string, string> = {};
  for (let i = 0; i < m.length; i++) {
    const del = m[i] as string;
    const verdi = s[i] as string;
    if (del.startsWith(':')) parametre[del.slice(1)] = decodeURIComponent(verdi);
    else if (del !== verdi) return null;
  }
  return parametre;
}

export function lenke(sti: string, sporring?: Record<string, string>): string {
  const q = sporring ? new URLSearchParams(sporring).toString() : '';
  return `#${sti}${q ? `?${q}` : ''}`;
}

export function naviger(sti: string, sporring?: Record<string, string>): void {
  window.location.hash = lenke(sti, sporring);
}

/** Endrer adressen uten ny historikkoppføring (f.eks. søketekst). */
export function erstattAdresse(sti: string, sporring?: Record<string, string>): void {
  history.replaceState(history.state, '', lenke(sti, sporring));
}

// Scrollposisjon per historikkoppføring, slik at tilbake gjenoppretter posisjonen.
const scrollPosisjoner = new Map<string, number>();
let teller = 0;
/** Hvor mange steg inn i appen gjeldende oppføring er. 0 = første side som ble åpnet. */
let dybde = 0;

interface Historietilstand {
  appId: string;
  dybde: number;
}

function gjeldende(): Historietilstand | null {
  const s = history.state as Partial<Historietilstand> | null;
  return s && typeof s.appId === 'string' && typeof s.dybde === 'number' ? (s as Historietilstand) : null;
}

function nyId(): string {
  teller += 1;
  return `s${Date.now().toString(36)}${teller}`;
}

/** Kan vi gå tilbake innenfor appen? */
export function kanGaaTilbake(): boolean {
  return dybde > 0;
}

export function gaaTilbake(): void {
  if (kanGaaTilbake()) history.back();
  else naviger('/');
}

export function startRuting(): void {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const naa = gjeldende();
  if (naa) dybde = naa.dybde;
  else history.replaceState({ appId: nyId(), dybde: 0 }, '');
  // Posisjonen lagres med en gang, ikke i neste bilde (requestAnimationFrame): ruller brukeren og trykker på en lenke
  // rett etter, kunne ellers posisjonen bli lagret på den nye siden, og tilbake ga feil sted (avgjørelse 097).
  window.addEventListener(
    'scroll',
    () => {
      const id = gjeldende();
      if (id) scrollPosisjoner.set(id.appId, window.scrollY);
    },
    { passive: true },
  );
}

// Søket fra toppfeltet (eier 05.10.2026): legges over siden brukeren står på, som en egen oppføring i historikken på
// samme adresse. Siden står synlig bak. Tilbake (også sveip tilbake i nettleseren), «Lukk» og et trykk utenfor søket
// lukker det.
// Følges en lenke i søket, kommer brukeren tilbake til søket med tilbake.
const toppsokLyttere = new Set<() => void>();
const varsleToppsok = () => {
  for (const l of toppsokLyttere) l();
};

/** Søket i toppfeltet, eller null når det er lukket. */
export function toppsok(): string | null {
  const s = history.state as { sok?: unknown } | null;
  return typeof s?.sok === 'string' ? s.sok : null;
}

export function apneToppsok(): void {
  if (toppsok() !== null) return;
  dybde += 1;
  const id = nyId();
  // Siden står synlig bak søket. Kommer brukeren tilbake til søket fra et treff, står siden bak der den var.
  scrollPosisjoner.set(id, window.scrollY);
  history.pushState({ appId: id, dybde, sok: '' }, '');
  varsleToppsok();
}

export function lukkToppsok(): void {
  if (toppsok() !== null) history.back();
}

/** Lagrer søket i historikken, så tilbake fra et treff viser søket slik det var. */
export function settToppsok(sok: string): void {
  if (toppsok() !== null) history.replaceState({ ...(history.state as object), sok }, '');
}

export function useToppsok(): string | null {
  const [sok, settSok] = useState(toppsok);
  useEffect(() => {
    const oppdater = () => {
      const naa = gjeldende();
      if (naa) dybde = naa.dybde;
      settSok(toppsok());
    };
    toppsokLyttere.add(oppdater);
    window.addEventListener('popstate', oppdater);
    window.addEventListener('hashchange', oppdater);
    return () => {
      toppsokLyttere.delete(oppdater);
      window.removeEventListener('popstate', oppdater);
      window.removeEventListener('hashchange', oppdater);
    };
  }, []);
  return sok;
}

let oensketScroll: number | null = null;
/** Neste navigasjon skal ikke rulle til toppen, fordi siden ruller selv (f.eks. til neste steg i en veiviser). */
let beholdRulling = false;

/** Kalles før en lenke følges når siden selv skal styre rullingen etter navigasjonen. */
export function beholdRullingVedNesteNavigasjon(): void {
  beholdRulling = true;
  // Fører lenken ikke til en ny adresse, skal ikke neste navigasjon påvirkes.
  setTimeout(() => {
    beholdRulling = false;
  }, 1000);
}

/** Stopper forsøkene på å gjenopprette posisjonen, når en ny navigasjon kommer. */
let stoppGjenoppretting: (() => void) | null = null;

/**
 * Kalles når en ny side er tegnet: ny side starter øverst, tilbake gjenoppretter posisjonen. Mange sider laster
 * innholdet etter at de er tegnet, og kort som var åpne, åpnes igjen (husket.ts). Er siden for kort til posisjonen med
 * en gang, prøver vi igjen mens den vokser, til den står der den var, brukeren ruller selv, eller det har gått tre
 * sekunder (eier 06.10.2026).
 */
export function utforScroll(): void {
  if (oensketScroll === null) return;
  const y = oensketScroll;
  oensketScroll = null;
  stoppGjenoppretting?.();
  window.scrollTo(0, y);
  if (y === 0 || typeof ResizeObserver === 'undefined') return;
  const brukeren = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;
  const stopp = () => {
    observator.disconnect();
    clearTimeout(tidsfrist);
    for (const h of brukeren) window.removeEventListener(h, stopp);
    if (stoppGjenoppretting === stopp) stoppGjenoppretting = null;
  };
  const observator = new ResizeObserver(() => {
    if (Math.abs(window.scrollY - y) < 2) return stopp();
    window.scrollTo(0, y);
  });
  const tidsfrist = setTimeout(stopp, 3000);
  observator.observe(document.body);
  for (const h of brukeren) window.addEventListener(h, stopp, { passive: true });
  stoppGjenoppretting = stopp;
}

export type Navigasjonstype = 'forste' | 'ny' | 'historikk';

export function usePlassering(): Plassering & { type: Navigasjonstype } {
  const [plassering, settPlassering] = useState(() => ({ ...lesHash(location.hash), type: 'forste' as Navigasjonstype }));
  useEffect(() => {
    const vedEndring = () => {
      let type: Navigasjonstype = 'historikk';
      const naa = gjeldende();
      if (naa) {
        dybde = naa.dybde;
      } else {
        // Ny oppføring laget av en lenke eller naviger(): gi den id og start øverst.
        dybde += 1;
        history.replaceState({ appId: nyId(), dybde }, '');
        type = 'ny';
      }
      const id = gjeldende();
      oensketScroll = type === 'ny' && beholdRulling ? null : type === 'ny' || !id ? 0 : (scrollPosisjoner.get(id.appId) ?? 0);
      beholdRulling = false;
      settPlassering({ ...lesHash(location.hash), type });
    };
    window.addEventListener('hashchange', vedEndring);
    return () => window.removeEventListener('hashchange', vedEndring);
  }, []);
  return plassering;
}
