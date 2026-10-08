// Kildestatusen som lenke til siden om kildene (avgjørelse 056). Den sto i toppfeltet, men står nå under
// Innstillinger, så toppfeltet bare har det brukeren trenger hele tiden.
import { Ikon, type Ikonnavn } from '../components/Ikon.tsx';
import { visningsstatus, type Visningsstatus } from '../core/kildestatus/kildestatus.ts';
import { useKildestatus } from './kildestatus.ts';
import { useTekst, useTilstand } from './tilstand.ts';

/** Kildestatusen med ikon og tekst. Ingenting mens statusen lastes. */
export function KildestatusIndikator() {
  const { t } = useTekst();
  const status = useKildestatus();
  const { skjultKildevarsel } = useTilstand();
  const samlet: Visningsstatus | null =
    status.tilstand === 'ok' ? visningsstatus(status.data, new Date(), skjultKildevarsel) : status.tilstand === 'feil' ? 'ukjent' : null;
  if (samlet === null) return null;
  const ikon: Record<Visningsstatus, Ikonnavn> = {
    ok: 'ok',
    feilet: 'advarsel',
    utdatert: 'klokke',
    ukjent: 'info',
    skjult: 'ok',
  };
  const etikett = t('kildestatus.indikator', { status: t(`kildestatus.status.${samlet}`) });
  return (
    <a class={`indikator indikator-${samlet}`} href="#/om/kilder" data-status={samlet}>
      <Ikon navn={ikon[samlet]} />
      <span>{etikett}</span>
    </a>
  );
}
