// Dagens jukselapp på forsiden (fase 8): ett faktum fra appen, med lenke til stedet der det står og kilden.
// SKISSE til eier: faktaene står i jukselappSkisse.ts til `fakta()` i manifestene er bygget. Skissen finnes bare i
// testversjonen og i utvikling.
import type { JSX } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { Ikon } from '../components/Ikon.tsx';
import { iDag } from '../data/skolear.ts';
import type * as Kortmodul from './Jukselappkort.tsx';
import { lukkJukselappTips, settJukselapp, useTekst, useTilstand } from './tilstand.ts';

/** Skissen vises bare i testversjonen og i utvikling, til eier har godkjent designet. */
export const JUKSELAPP_SKISSE = __TESTVERSJON__ || import.meta.env.MODE !== 'production';

/** Gruppen med dagens jukselapp i rekkefølgen på forsiden. */
export const JUKSELAPP = 'jukselapp';

/**
 * Dagens faktum og kortet som viser det. Kortet og faktaene lastes når jukselappen vises, så de ikke er med i
 * startpakken. `ekstra` er antall trykk på knappen for ny jukselapp, som ikke lagres: i morgen kommer dagens igjen.
 */
export function useDagensJukselapp(): { sammendrag: string; innhold: JSX.Element } {
  const { t, malform } = useTekst();
  const { innstillinger } = useTilstand();
  const [m, settM] = useState<typeof Kortmodul | null>(null);
  const [ekstra, settEkstra] = useState(0);
  useEffect(() => {
    let aktiv = true;
    void import('./Jukselappkort.tsx').then((x) => aktiv && settM(x));
    return () => {
      aktiv = false;
    };
  }, []);
  if (!m) return { sammendrag: t('app.lasterInn'), innhold: <p class="dempet">{t('app.lasterInn')}</p> };
  const f = m.velgFaktum(m.synligeFakta(m.SKISSEFAKTA, innstillinger.fylke, innstillinger.skole?.id ?? null), iDag(), ekstra);
  return { sammendrag: f?.tekst[malform] ?? t('forside.jukselapp.tom'), innhold: <m.Jukselappkort f={f} onNy={() => settEkstra(ekstra + 1)} /> };
}

/** Knappen i overskriften som slår jukselappen av. */
export function Jukselappverktoy() {
  const { t } = useTekst();
  return (
    <button type="button" class="ikonknapp gruppe-endre" aria-label={t('forside.jukselapp.slaAv')} title={t('forside.jukselapp.slaAv')} onClick={() => settJukselapp(false)}>
      <Ikon navn="lukk" class="ikon-liten" />
    </button>
  );
}

/**
 * Teksten som slår på dagens jukselapp når den er av (eier 04.10.2026). Den kan lukkes for godt. Etter at brukeren
 * har slått jukselappen av, sier den hvor den slås på igjen.
 */
export function Jukselapptips() {
  const { t } = useTekst();
  const { forside } = useTilstand();
  if (forside.jukselapp || forside.jukselappTipsLukket) return null;
  const avslatt = forside.jukselapp === false;
  return (
    <div class="jukselapp-tips">
      <span class="jukselapp-tips-merke" aria-hidden="true">
        <Ikon navn="dokument" class="ikon-liten" />
      </span>
      <p>
        {avslatt ? t('forside.jukselapp.tipsAv') : t('forside.jukselapp.tips')}
      </p>
      <button type="button" class="knapp knapp-sekundaer knapp-liten" onClick={() => settJukselapp(true)}>
        {t('forside.jukselapp.slaPa')}
      </button>
      <button type="button" class="ikonknapp" aria-label={t('forside.jukselapp.lukkTips')} title={t('forside.jukselapp.lukkTips')} onClick={lukkJukselappTips}>
        <Ikon navn="lukk" class="ikon-liten" />
      </button>
    </div>
  );
}
