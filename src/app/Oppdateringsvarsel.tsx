// Viser «Ny versjon er klar» når service workeren har lastet ned en ny versjon.
import { useEffect, useRef, useState } from 'preact/hooks';
import { registerSW } from 'virtual:pwa-register';
import { useTekst } from './tilstand.ts';

export function Oppdateringsvarsel() {
  const { t } = useTekst();
  const [nyVersjon, settNyVersjon] = useState(false);
  const oppdater = useRef<((reload?: boolean) => Promise<void>) | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    oppdater.current = registerSW({
      immediate: true,
      onNeedRefresh: () => settNyVersjon(true),
    });
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
