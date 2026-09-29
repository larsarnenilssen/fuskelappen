import { erFavoritt, useTekst, useTilstand, vekslFavoritt } from '../app/tilstand.ts';
import { Ikon } from './Ikon.tsx';

export function FavorittKnapp({ id, navn }: { id: string; navn: string }) {
  const { t } = useTekst();
  useTilstand();
  const valgt = erFavoritt(id);
  return (
    <button
      type="button"
      class={`ikonknapp favorittknapp${valgt ? ' valgt' : ''}`}
      aria-pressed={valgt}
      aria-label={`${t('favoritter.leggTil')}: ${navn}`}
      onClick={() => vekslFavoritt(id)}
    >
      <Ikon navn="stjerne" fylt={valgt} />
    </button>
  );
}
