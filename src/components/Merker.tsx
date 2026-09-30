// Små merker: hvilket nivå en verdi kommer fra, og innholdsstatus.
import { useTekst } from '../app/tilstand.ts';
import { formaterDato } from '../core/i18n/tekst.ts';
import type { Innholdsstatus } from '../core/innhold/status.ts';
import type { Kontrollert, Niva } from '../core/innhold/skjema.ts';

export function Nivamerke({ niva, vis = 'lokal' }: { niva: Niva; vis?: 'lokal' | 'alltid' }) {
  const { t } = useTekst();
  if (niva === 'nasjonal' && vis === 'lokal') return null;
  const navn = t(`komponenter.niva.${niva}`);
  return (
    <span class={`merke merke-niva merke-${niva}`} data-niva={niva}>
      {niva === 'nasjonal' ? navn : t('komponenter.niva.lokalVerdi', { niva: navn.toLowerCase() })}
    </span>
  );
}

/**
 * Innhold som ikke er kontrollert, får ikke merke. Brukserklæringen under «Om appen» dekker det (avgjørelse 016).
 * Merket vises når eier har kontrollert innholdet, og når en kilde er endret eller kontrollen er gammel.
 */
export function Statusmerke({ status, kontrollert }: { status: Innholdsstatus; kontrollert?: Kontrollert }) {
  const { t, malform } = useTekst();
  if (status === 'utkast') return null;
  const tekst =
    status === 'kontrollert'
      ? t('komponenter.status.kontrollert', { dato: kontrollert ? formaterDato(kontrollert.dato, malform) : '' })
      : t(`komponenter.status.${status}`);
  return (
    <span class={`merke merke-status merke-${status}`} data-status={status}>
      {tekst}
    </span>
  );
}
