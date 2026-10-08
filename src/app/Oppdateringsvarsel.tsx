// Meldingen om ny versjon (avgjørelse 088): et overlegg med det som er nytt, når service workeren har lastet ned en ny
// versjon av appen. Appen ser etter ny versjon når den starter, når brukeren går tilbake til den, og hver time mens den
// er åpen. En installert app som ligger i bakgrunnen, starter ikke på nytt, og ville ellers ikke sett nye versjoner
// (eier 02.10.2026).
//
// Meldingen kommer bare når versjonsnummeret er nytt (eier 08.10.2026). Er bare dataene nye (f.eks. kildestatusen eller
// tallene), tas den nye versjonen i bruk uten melding når appen startes eller kommer tilbake i forgrunnen, ikke mens
// brukeren holder på.
import { useEffect, useRef, useState } from 'preact/hooks';
import { registerSW } from 'virtual:pwa-register';
import { utvikling } from 'virtual:testoppsett';
import { Overlegg } from '../components/Overlegg.tsx';
import { lesVersjonsfil, vurderOppdatering, type Oppdatering, type Versjonsfil } from '../core/versjon/versjoner.ts';
import { useTekst } from './tilstand.ts';

const SJEKK_HVER = 60 * 60 * 1000;
/** En ny versjon som er funnet så kort tid etter at appen startet, tas i bruk med en gang når bare dataene er nye. */
const OPPSTART = 5000;
/** I utvikling, i testene og i testversjonen kan meldingen vises med `?vis=nyversjon` i adressen. */
const FORHANDSVISNING = 'vis=nyversjon';

async function hentVersjonsfil(): Promise<Versjonsfil | null> {
  try {
    const svar = await fetch(`${import.meta.env.BASE_URL}versjon.json`, { cache: 'no-store' });
    return svar.ok ? lesVersjonsfil(await svar.json()) : null;
  } catch {
    return null;
  }
}

export function Oppdateringsvarsel() {
  const { t, malform } = useTekst();
  const [melding, settMelding] = useState<Extract<Oppdatering, { type: 'melding' }> | null>(null);
  const [apen, settApen] = useState(false);
  const oppdater = useRef<((reload?: boolean) => Promise<void>) | null>(null);

  useEffect(() => {
    const start = Date.now();
    if ((utvikling || __TESTVERSJON__) && location.hash.includes(FORHANDSVISNING)) {
      void hentVersjonsfil().then((fil) => {
        settMelding({ type: 'melding', versjon: fil?.versjon ?? __APP_VERSJON__, nytt: fil?.nytt ?? null });
        settApen(true);
      });
    }
    if (!('serviceWorker' in navigator)) return;
    let registrering: ServiceWorkerRegistration | undefined;
    // Det som venter: ingenting, en ny versjon med melding, eller nye data som tas i bruk stille.
    let venter: Oppdatering | null = null;
    const synlig = () => {
      if (document.visibilityState !== 'visible') return;
      if (venter?.type === 'stille') void oppdater.current?.(true);
      else if (venter?.type === 'melding') settApen(true);
      else if (registrering && navigator.onLine) registrering.update().catch(() => undefined);
    };
    oppdater.current = registerSW({
      immediate: true,
      onNeedRefresh: () => {
        void hentVersjonsfil().then((fil) => {
          const vurdering = vurderOppdatering(fil, __APP_VERSJON__);
          venter = vurdering;
          if (vurdering.type === 'melding') {
            settMelding(vurdering);
            settApen(true);
          } else if (Date.now() - start < OPPSTART) {
            void oppdater.current?.(true);
          }
        });
      },
      onRegisteredSW: (_url, r) => {
        registrering = r;
      },
    });
    document.addEventListener('visibilitychange', synlig);
    const tidtaker = window.setInterval(() => {
      if (!venter && registrering && navigator.onLine) registrering.update().catch(() => undefined);
    }, SJEKK_HVER);
    return () => {
      document.removeEventListener('visibilitychange', synlig);
      window.clearInterval(tidtaker);
    };
  }, []);

  if (!melding || !apen) return null;
  const punkter = melding.nytt?.[malform] ?? [];
  return (
    <Overlegg tittelId="ny-versjon-tittel" onLukk={() => settApen(false)}>
      <p class="overlegg-merke">{t('oppdatering.merke')}</p>
      <h2 id="ny-versjon-tittel">{melding.versjon && punkter.length > 0 ? t('oppdatering.tittel', { versjon: melding.versjon }) : t('oppdatering.klar')}</h2>
      {punkter.length > 0 && (
        <ul class="overlegg-liste">
          {punkter.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}
      <div class="overlegg-knapper">
        <button type="button" class="knapp" onClick={() => void oppdater.current?.(true)}>
          {t('oppdatering.oppdaterNa')}
        </button>
        <button type="button" class="knapp knapp-sekundaer" onClick={() => settApen(false)}>
          {t('oppdatering.lukk')}
        </button>
      </div>
      <p class="overlegg-liten">{t('oppdatering.liten')}</p>
    </Overlegg>
  );
}
