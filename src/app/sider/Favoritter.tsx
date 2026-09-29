import { Favorittliste } from '../Favorittliste.tsx';
import { useTekst, useTilstand } from '../tilstand.ts';

export default function Favoritter() {
  const { t } = useTekst();
  const { favoritter } = useTilstand();
  return (
    <div class="side">
      <h1 tabIndex={-1}>{t('favoritter.tittel')}</h1>
      {favoritter.length === 0 ? <p class="dempet">{t('favoritter.tom')}</p> : <Favorittliste />}
    </div>
  );
}
