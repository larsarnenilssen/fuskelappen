// Merknad om hvilket nivå innholdet gjelder for (nasjonalt, fylke, skole).
import fylkerFil from '../../content/fylker.yaml';
import type { Fylker } from '../core/innhold/skjema.ts';
import { Ikon } from '../components/Ikon.tsx';
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
    // Én kort linje, som når et sted er valgt (eier 04.10.2026). Forklaringen står under Innstillinger.
    return (
      <p class="sted-valgt">
        <Ikon navn="info" class="ikon-liten" />
        <span>
          {t('forside.stedKort')} · <a href="#/innstillinger">{t('forside.velgSted')}</a>
        </span>
      </p>
    );
  }
  const sted = innstillinger.skole ? `${innstillinger.skole.navn}, ${fylke}` : fylke;
  // Valgt sted står som en kort linje, ikke som en boks (eier 02.10.2026).
  return (
    <p class="sted-valgt">
      <Ikon navn="skole" class="ikon-liten" />
      <a href="#/innstillinger">{t('forside.stedValgt', { sted })}</a>
    </p>
  );
}
