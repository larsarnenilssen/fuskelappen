// Laster velkomsten (fase 10) når den åpnes, så velkomsten, stilene og animasjonene ikke er med i startpakken
// (avgjørelse 082 og 083). Tar også vare på nettleserens tilbud om å installere appen, som bare kommer når siden
// lastes, så trinnet om installasjon kan bruke det.
import type { ComponentType } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { usePlassering } from '../ruter.ts';
import { apneVelkomst, lukkVelkomst, skalApnesAvSegSelv, useVelkomstApen } from './apne.ts';

/** Tilbudet om å installere appen (Chrome, Edge og Android), eller null. */
export interface Installasjonstilbud extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let tilbud: Installasjonstilbud | null = null;
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    tilbud = e as Installasjonstilbud;
  });
  window.addEventListener('appinstalled', () => {
    tilbud = null;
  });
}

export function installasjonstilbud(): Installasjonstilbud | null {
  return tilbud;
}

type Velkomstmodul = { Velkomst: ComponentType<{ onLukk: () => void }> };

export function VelkomstLaster() {
  const apen = useVelkomstApen();
  const plassering = usePlassering();
  const [modul, settModul] = useState<Velkomstmodul | null>(null);

  useEffect(() => {
    if (skalApnesAvSegSelv(plassering.sti, location.hash, navigator.webdriver)) apneVelkomst();
  }, []);

  useEffect(() => {
    if (!apen || modul) return;
    import('./Velkomst.tsx').then(settModul, () => lukkVelkomst());
  }, [apen]);

  if (!apen || !modul) return null;
  return <modul.Velkomst onLukk={lukkVelkomst} />;
}
