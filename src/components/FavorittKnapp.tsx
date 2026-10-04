import { erFavoritt, useTekst, useTilstand, vekslFavoritt } from '../app/tilstand.ts';
import { Ikon } from './Ikon.tsx';

/**
 * Stjerneknappen. Ved overskriften på en side er den stor. `liten` er den diskré varianten for elementer som står inne
 * på en side uten egen side, f.eks. en skole eller en paragraf (avgjørelse 058): mindre ikon og dempet farge til den
 * er valgt.
 */
export function FavorittKnapp({ id, navn, liten = false }: { id: string; navn: string; liten?: boolean }) {
  const { t } = useTekst();
  useTilstand();
  const valgt = erFavoritt(id);
  return (
    <button
      type="button"
      class={`ikonknapp favorittknapp${liten ? ' favorittknapp-liten' : ''}${valgt ? ' valgt' : ''}`}
      aria-pressed={valgt}
      aria-label={`${t('favoritter.leggTil')}: ${navn}`}
      data-favoritt={id}
      onClick={(e) => {
        // Knappen kan stå i et kort som åpnes med et trykk; stjernen skal ikke også åpne eller lukke kortet.
        e.stopPropagation();
        vekslFavoritt(id);
      }}
    >
      <Ikon navn="stjerne" fylt={valgt} class={liten ? 'ikon-liten' : undefined} />
    </button>
  );
}
