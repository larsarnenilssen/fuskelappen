// Merknad om lokale regler for inntak: uten valgt fylke vises bare de nasjonale reglene, med valgt fylke står det om
// appen har lokale regler for fylket.
import { fylkesnavn } from '../../../app/Stedmerknad.tsx';
import { useTekst, useTilstand } from '../../../app/tilstand.ts';
import { Ikon } from '../../../components/Ikon.tsx';
import { harLokalt, type Inntaksinnhold } from '../innhold.ts';

export function Lokalmerknad({ innhold }: { innhold: Inntaksinnhold }) {
  const { t } = useTekst();
  const { innstillinger } = useTilstand();
  const fylke = fylkesnavn(innstillinger.fylke);
  if (fylke && harLokalt(innhold, innstillinger.fylke)) {
    return (
      <p class="sted-valgt">
        <Ikon navn="skole" class="ikon-liten" />
        <a href="#/innstillinger">{t('inntak.lokaleMed', { fylke })}</a>
      </p>
    );
  }
  return (
    <p class="merknad merknad-ikon">
      <Ikon navn="info" class="ikon-liten" />
      <span>
        {fylke ? t('inntak.lokaleMangler', { fylke }) : t('inntak.bareNasjonalt')} {!fylke && <a href="#/innstillinger">{t('inntak.velgFylke')}</a>}
      </span>
    </p>
  );
}
