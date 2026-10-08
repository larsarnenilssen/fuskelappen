// Dagens jukselapp på forsiden (fase 8): ett faktum fra appen, med lenke til stedet der det står og kilden.
// Jukselappen er en visning i panelet øverst på forsiden (eier 08.10.2026, avgjørelse 081 og 085). Faktaene kommer
// fra `fakta()` i manifestene.
import type { JSX } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { iDag } from '../data/skolear.ts';
import { aktiveModuler } from '../modules/register.ts';
import type { Faktum } from '../modules/typer.ts';
import type * as Kortmodul from './Jukselappkort.tsx';
import { settJukselapp, useTekst, useTilstand } from './tilstand.ts';

/**
 * Dagens faktum og kortet som viser det (avgjørelse 085). Kortet og faktaene lastes når jukselappen vises, og bare
 * modulen som har dagen, laster innholdet sitt. `steg` er antall trykk på knappen for ny jukselapp. Det lagres ikke, så
 * neste dag kommer dagens igjen.
 */
export function useDagensJukselapp(): { sammendrag: string; innhold: JSX.Element } {
  const { t, malform } = useTekst();
  const { innstillinger } = useTilstand();
  const fylke = innstillinger.fylke;
  const skole = innstillinger.skole?.id ?? null;
  const [steg, settSteg] = useState(0);
  const [lastet, settLastet] = useState<{ m: typeof Kortmodul; f: Faktum | null; steg: number } | 'feil' | null>(null);
  useEffect(() => {
    let aktiv = true;
    import('./Jukselappkort.tsx')
      .then(async (m) => {
        const r = await m.hentFaktum(aktiveModuler, { fylke, skole }, iDag(), steg);
        if (aktiv) settLastet({ m, f: r?.faktum ?? null, steg: r?.steg ?? steg });
      })
      .catch(() => aktiv && settLastet('feil'));
    return () => {
      aktiv = false;
    };
  }, [fylke, skole, steg]);
  if (lastet === 'feil') return { sammendrag: t('forside.jukselapp.tom'), innhold: <p class="dempet">{t('forside.jukselapp.tom')}</p> };
  if (!lastet) return { sammendrag: t('app.lasterInn'), innhold: <p class="dempet">{t('app.lasterInn')}</p> };
  const { m, f } = lastet;
  return {
    sammendrag: f ? f.tekst[malform] : t('forside.jukselapp.tom'),
    innhold: <m.Jukselappkort f={f} onNy={() => settSteg(lastet.steg + 1)} />,
  };
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
