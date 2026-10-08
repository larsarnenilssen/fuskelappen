// Dagens jukselapp på forsiden (fase 8): ett faktum fra appen, med lenke til stedet der det står og kilden.
// Jukselappen er en visning i panelet øverst på forsiden (eier 08.10.2026, avgjørelse 081).
// SKISSE til eier: faktaene står i jukselappSkisse.ts til `fakta()` i manifestene er bygget. Skissen finnes bare i
// testversjonen og i utvikling.
import type { JSX } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { iDag } from '../data/skolear.ts';
import type * as Kortmodul from './Jukselappkort.tsx';
import { settJukselapp, useTekst, useTilstand } from './tilstand.ts';

/** Skissen vises bare i testversjonen og i utvikling, til eier har godkjent designet. */
export const JUKSELAPP_SKISSE = __TESTVERSJON__ || import.meta.env.MODE !== 'production';

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
  return { sammendrag: f ? `${f.tittel[malform]}: ${f.tekst[malform]}` : t('forside.jukselapp.tom'), innhold: <m.Jukselappkort f={f} onNy={() => settEkstra(ekstra + 1)} /> };
}

/**
 * Bryteren som slår dagens jukselapp av og på. Den samme står under Innstillinger og under «Tilpass» på forsiden (eier
 * 08.10.2026). Slått på vises jukselappen i panelet øverst på forsiden.
 */
export function Jukselappbryter({ id }: { id: string }) {
  const { t } = useTekst();
  const { forside } = useTilstand();
  return (
    <>
      <div class="vippe">
        <input id={id} type="checkbox" role="switch" checked={!!forside.jukselapp} aria-describedby={`${id}-hjelp`} onChange={() => settJukselapp(!forside.jukselapp)} />
        <label for={id}>{t('forside.jukselapp.innstilling')}</label>
      </div>
      <p id={`${id}-hjelp`} class="dempet liten">
        {t('forside.jukselapp.innstillingHjelp')}
      </p>
    </>
  );
}
