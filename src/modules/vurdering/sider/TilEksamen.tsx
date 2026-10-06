// De gamle adressene til eksamen, prøvene og klage på karakter i Vurdering sender videre til modulen Eksamen og klage
// (avgjørelse 078), med spørreparametrene (`?del=…`, `?steg=…&svar=…`). Lagrede lenker virker da fortsatt.
import { useEffect } from 'preact/hooks';
import { lesHash } from '../../../app/ruter.ts';
import { useTekst } from '../../../app/tilstand.ts';
import type { SideProps } from '../../typer.ts';
import { FLYTTET_TIL_EKSAMEN } from '../innhold.ts';

export default function TilEksamen({ sporring }: SideProps) {
  const { t } = useTekst();
  useEffect(() => {
    const ny = FLYTTET_TIL_EKSAMEN[lesHash(location.hash).sti] ?? '/eksamen';
    const q = sporring.toString();
    location.replace(`#${ny}${q ? `?${q}` : ''}`);
  }, []);
  return (
    <p class="side laster" aria-live="polite">
      {t('app.lasterInn')}
    </p>
  );
}
