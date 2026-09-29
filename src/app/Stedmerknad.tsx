// Merknad om hvilket nivå innholdet gjelder for (nasjonalt, fylke, skole).
import fylkerFil from '../../content/fylker.yaml';
import type { Fylker } from '../core/innhold/skjema.ts';
import { useTekst, useTilstand } from './tilstand.ts';

export const fylker = (fylkerFil as Fylker).fylker;

export function fylkesnavn(nummer: string | null): string | null {
  return fylker.find((f) => f.nummer === nummer)?.navn ?? null;
}

export function Stedmerknad() {
  const { t } = useTekst();
  const { innstillinger } = useTilstand();
  const fylke = fylkesnavn(innstillinger.fylke);
  if (!fylke) {
    return (
      <p class="merknad">
        {t('forside.stedMerknad')} <a href="#/innstillinger">{t('forside.velgSted')}</a>
      </p>
    );
  }
  const sted = innstillinger.skole ? `${innstillinger.skole.navn}, ${fylke}` : fylke;
  return <p class="merknad merknad-stille">{t('forside.stedValgt', { sted })}</p>;
}
