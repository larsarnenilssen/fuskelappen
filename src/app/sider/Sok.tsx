import type { SideProps } from '../../modules/typer.ts';
import { erstattAdresse } from '../ruter.ts';
import { Sokeboks } from '../Sokeboks.tsx';
import { useTekst } from '../tilstand.ts';

export default function Sok({ sporring }: SideProps) {
  const { t } = useTekst();
  return (
    <div class="side">
      <h1 tabIndex={-1}>{t('sok.tittel')}</h1>
      <p class="dempet">{t('sok.skrivForASoke')}</p>
      <Sokeboks
        etikett={t('sok.etikett')}
        plassholder={t('sok.plassholder')}
        startverdi={sporring.get('q') ?? ''}
        autofokus={!sporring.get('q')}
        onEndring={(q) => erstattAdresse('/sok', q ? { q } : undefined)}
      />
    </div>
  );
}
