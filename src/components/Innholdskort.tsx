// Et innholdselement som et kort som kan åpnes (fase 6): tittelen og den første setningen er synlige, og teksten står
// inne i kortet, med paragrafene og kildene som lukkede rader nederst (Kortfot). Brukes på sidene i Vurdering.
import { useId } from 'preact/hooks';
import { usePrivatskole, useTekst } from '../app/tilstand.ts';
import type { Flerspraak, KildeRef } from '../core/innhold/skjema.ts';
import { Ikon } from './Ikon.tsx';
import { useHusketApen } from './husket.ts';
import { Kortfot } from './Kortfot.tsx';
import { medPrivatskolekilder, type Privatskoleinnhold, Privatskolemerknad } from './Privatskolemerknad.tsx';
import { forsteSetning } from './Veiviser.tsx';

export interface Kortinnhold extends Privatskoleinnhold {
  id: string;
  tittel: Flerspraak;
  /** HTML fra innholdet. */
  tekst: Flerspraak;
  paragrafer?: readonly string[] | undefined;
  kilder: readonly KildeRef[];
}

export function Innholdskort({ element, aapen = false }: { element: Kortinnhold; aapen?: boolean }) {
  const { malform } = useTekst();
  const privat = usePrivatskole();
  // Om kortet er åpent, huskes for siden, så det er åpent igjen når brukeren går tilbake fra en kilde (husket.ts).
  const [erAapen, settAapen] = useHusketApen(`innholdskort:${element.id}`, aapen);
  const id = useId();
  const paragrafer = element.paragrafer ?? [];
  return (
    <div class="innholdskort" id={element.id}>
      <button type="button" class="innholdskort-knapp" aria-expanded={erAapen} aria-controls={id} onClick={() => settAapen(!erAapen)}>
        <span class="innholdskort-topp">
          <span class="innholdskort-tittel">{element.tittel[malform]}</span>
          {!erAapen && <span class="innholdskort-smakebit">{forsteSetning(element.tekst[malform])}</span>}
        </span>
        <Ikon navn={erAapen ? 'opp' : 'ned'} class="innholdskort-pil" />
      </button>
      <div id={id} class="innholdskort-innhold" hidden={!erAapen}>
        <div class="brodtekst" dangerouslySetInnerHTML={{ __html: element.tekst[malform] }} />
        <Privatskolemerknad element={element} />
        <Kortfot paragrafer={paragrafer} kilder={medPrivatskolekilder(element.kilder, element, privat)} nokkel={element.id} />
      </div>
    </div>
  );
}
