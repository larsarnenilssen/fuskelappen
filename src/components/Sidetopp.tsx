// Overskriften på en side, med stjerneknappen når siden kan favorittmerkes (avgjørelse 058). Alle sider som kan
// favorittmerkes, har stjernen på samme sted: til høyre for overskriften.
import type { ComponentChildren } from 'preact';
import { FavorittKnapp } from './FavorittKnapp.tsx';

interface Props {
  tittel: string;
  /** Id-en til favoritten. Uten står overskriften alene. */
  favoritt?: string;
  /** Navnet på favoritten i knappens etikett, når det er et annet enn overskriften. */
  favorittnavn?: string;
  /** Målformen overskriften er skrevet på, når den ikke følger appen (f.eks. en lov på nynorsk). */
  lang?: string;
  /** Flere knapper til høyre for stjernen. */
  children?: ComponentChildren;
}

export function Sidetopp({ tittel, favoritt, favorittnavn, lang, children }: Props) {
  const h1 = (
    <h1 tabIndex={-1} lang={lang}>
      {tittel}
    </h1>
  );
  if (!favoritt && !children) return h1;
  return (
    <div class="tittelrad">
      {h1}
      {favoritt && <FavorittKnapp id={favoritt} navn={favorittnavn ?? tittel} />}
      {children}
    </div>
  );
}
