// Kildestatusen som lenke til siden om kildene (avgjørelse 056). Den sto i toppfeltet, men står nå under
// Innstillinger, så toppfeltet bare har det brukeren trenger hele tiden. Den er en rad i listen nederst i Innstillinger,
// mellom «Velkomst» og «Om appen», med statusen under tittelen (eier 09.10.2026).
import { Ikon, type Ikonnavn } from '../components/Ikon.tsx';
import { visningsstatus, type Visningsstatus } from '../core/kildestatus/kildestatus.ts';
import { useKildestatus } from './kildestatus.ts';
import { useTekst, useTilstand } from './tilstand.ts';

/** Raden «Kildesjekken» med ikonet og statusen. Mens statusen lastes, står raden uten status. */
export function KildestatusIndikator() {
  const { t } = useTekst();
  const status = useKildestatus();
  const { skjultKildevarsel } = useTilstand();
  const samlet: Visningsstatus | null =
    status.tilstand === 'ok' ? visningsstatus(status.data, new Date(), skjultKildevarsel) : status.tilstand === 'feil' ? 'ukjent' : null;
  const ikon: Record<Visningsstatus, Ikonnavn> = {
    ok: 'ok',
    feilet: 'advarsel',
    utdatert: 'klokke',
    ukjent: 'info',
    skjult: 'ok',
  };
  const tekst = samlet ? t(`kildestatus.status.${samlet}`) : t('app.lasterInn');
  return (
    <a
      class={`listelenke indikator${samlet ? ` indikator-${samlet}` : ''}`}
      href="#/om/kilder"
      data-status={samlet ?? undefined}
      aria-label={samlet ? t('kildestatus.sjekkenNavn', { status: tekst }) : undefined}
    >
      <Ikon navn={samlet ? ikon[samlet] : 'info'} />
      <span class="listelenke-tekst">
        <span class="listelenke-tittel">{t('kildestatus.sjekken')}</span>
        <span class="listelenke-under">{tekst.charAt(0).toUpperCase() + tekst.slice(1)}</span>
      </span>
      <Ikon navn="hoyre" class="ikon-liten" />
    </a>
  );
}
