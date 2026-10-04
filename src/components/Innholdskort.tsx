// Et innholdselement som et kort som kan åpnes (fase 6): tittelen og den første setningen er synlige, og teksten,
// paragrafene i Regelverk og kildene står inne i kortet. Brukes på sidene i Vurdering.
import { useId, useState } from 'preact/hooks';
import { useTekst } from '../app/tilstand.ts';
import type { Flerspraak, KildeRef } from '../core/innhold/skjema.ts';
import { Ikon } from './Ikon.tsx';
import { Kildeliste } from './Kildelenke.tsx';
import { Paragraflenker } from './Paragraflenker.tsx';
import { forsteSetning } from './Veiviser.tsx';

export interface Kortinnhold {
  id: string;
  tittel: Flerspraak;
  /** HTML fra innholdet. */
  tekst: Flerspraak;
  paragrafer?: readonly string[] | undefined;
  kilder: readonly KildeRef[];
}

export function Innholdskort({ element, aapen = false }: { element: Kortinnhold; aapen?: boolean }) {
  const { t, malform } = useTekst();
  const [erAapen, settAapen] = useState(aapen);
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
        {paragrafer.length > 0 && <Paragraflenker paragrafer={paragrafer} overskrift={t('vurdering.iRegelverket', { antall: String(paragrafer.length) })} />}
        <Kildeliste kilder={element.kilder} niva={3} />
      </div>
    </div>
  );
}
