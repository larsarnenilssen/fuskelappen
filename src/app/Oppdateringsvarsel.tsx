// Viser «Ny versjon er klar» når service workeren har lastet ned en ny versjon.
// Appen ser etter ny versjon når den starter, når brukeren går tilbake til den, og hver time mens den er åpen.
// En installert app som ligger i bakgrunnen, starter ikke på nytt, og ville ellers ikke sett nye versjoner (eier 02.10.2026).
import { useEffect, useRef, useState } from 'preact/hooks';
import { registerSW } from 'virtual:pwa-register';
import { useTekst } from './tilstand.ts';

const SJEKK_HVER = 60 * 60 * 1000;

export function Oppdateringsvarsel() {
  const { t } = useTekst();
  const [nyVersjon, settNyVersjon] = useState(false);
  const oppdater = useRef<((reload?: boolean) => Promise<void>) | null>(null);
  // En ny versjon venter. Har brukeren lukket varselet, vises det igjen neste gang appen er tilbake i forgrunnen.
  const venter = useRef(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    let registrering: ServiceWorkerRegistration | undefined;
    const sjekk = () => {
      if (venter.current) settNyVersjon(true);
      else if (registrering && navigator.onLine) registrering.update().catch(() => undefined);
    };
    const synlig = () => {
      if (document.visibilityState === 'visible') sjekk();
    };
    oppdater.current = registerSW({
      immediate: true,
      onNeedRefresh: () => {
        venter.current = true;
        settNyVersjon(true);
      },
      onRegisteredSW: (_url, r) => {
        registrering = r;
      },
    });
    document.addEventListener('visibilitychange', synlig);
    const tidtaker = window.setInterval(sjekk, SJEKK_HVER);
    return () => {
      document.removeEventListener('visibilitychange', synlig);
      window.clearInterval(tidtaker);
    };
  }, []);

  if (!nyVersjon) return null;
  return (
    <div class="varsel" role="status">
      <p>{t('oppdatering.klar')}</p>
      <div class="varsel-knapper">
        <button type="button" class="knapp" onClick={() => void oppdater.current?.(true)}>
          {t('oppdatering.oppdater')}
        </button>
        <button type="button" class="knapp knapp-sekundaer" onClick={() => settNyVersjon(false)}>
          {t('oppdatering.lukk')}
        </button>
      </div>
    </div>
  );
}
