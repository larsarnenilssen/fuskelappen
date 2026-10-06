// Det som er ulikt for privatskoler, i en egen boks i kortet eller steget (avgjørelse 075). Vises bare når brukeren har
// valgt «Privatskole» i innstillingene. Kildene står sammen med kortets kilder nederst (Kortfot).
import { usePrivatskole, useTekst } from '../app/tilstand.ts';
import type { Flerspraak, KildeRef } from '../core/innhold/skjema.ts';
import { Ikon } from './Ikon.tsx';

export interface Privatskoleinnhold {
  privatskole?: { tekst: Flerspraak; kilder: readonly KildeRef[] } | undefined;
}

export function Privatskolemerknad({ element }: { element: Privatskoleinnhold }) {
  const { t, malform } = useTekst();
  const privat = usePrivatskole();
  if (!privat || !element.privatskole) return null;
  return (
    <aside class="privatskolemerknad">
      <p class="privatskolemerknad-topp">
        <Ikon navn="skole" class="ikon-liten" />
        {t('komponenter.privatskole.tittel')}
      </p>
      <div class="brodtekst" dangerouslySetInnerHTML={{ __html: element.privatskole.tekst[malform] }} />
    </aside>
  );
}

/** Kildene i kortet, med kildene til merknaden for privatskoler når den vises. */
export function medPrivatskolekilder(kilder: readonly KildeRef[], element: Privatskoleinnhold, privat: boolean): readonly KildeRef[] {
  return privat && element.privatskole ? [...kilder, ...element.privatskole.kilder] : kilder;
}
