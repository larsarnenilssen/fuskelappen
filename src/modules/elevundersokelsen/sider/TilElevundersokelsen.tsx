// Den gamle adressen til Elevundersøkelsen i Skolemiljø sender videre til modulen Elevundersøkelsen (avgjørelse 087),
// med spørreparametrene (`?s=…&trinn=…&vis=…`). Lagrede lenker virker da fortsatt.
import { useEffect } from 'preact/hooks';
import { useTekst } from '../../../app/tilstand.ts';
import type { SideProps } from '../../typer.ts';
import { ELEVUNDERSOKELSEN_RUTE } from '../adresse.ts';

export default function TilElevundersokelsen({ sporring }: SideProps) {
  const { t } = useTekst();
  useEffect(() => {
    const q = sporring.toString();
    location.replace(`#${ELEVUNDERSOKELSEN_RUTE}${q ? `?${q}` : ''}`);
  }, []);
  return (
    <p class="side laster" aria-live="polite">
      {t('app.lasterInn')}
    </p>
  );
}
