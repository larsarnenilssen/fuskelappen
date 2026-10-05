// De gamle adressene til Kalender for inntak (#/inntak/frister) og Kalender for eksamen (#/vurdering/eksamen-og-klage)
// sender videre til kalenderen, ferdig filtrert (avgjørelse 066). Lagrede favoritter og lenker virker da fortsatt.
import { useEffect } from 'preact/hooks';
import { lenke, lesHash } from '../../../app/ruter.ts';
import { useTekst } from '../../../app/tilstand.ts';
import type { SideProps } from '../../typer.ts';
import { kalenderRute, lesValg, sporringFor } from '../adresse.ts';

export default function TilKalender({ sporring }: SideProps) {
  const { t } = useTekst();
  useEffect(() => {
    const tema = lesHash(location.hash).sti.startsWith('/inntak') ? 'inntak' : 'eksamen';
    location.replace(lenke(kalenderRute, sporringFor({ ...lesValg(sporring), tema })));
  }, []);
  return (
    <p class="side laster" aria-live="polite">
      {t('app.lasterInn')}
    </p>
  );
}
