// Et kort med en tabell inni, f.eks. utsatt, ny og særskilt eksamen (fase 6, pakke 3). Lukket som de andre kortene til
// brukeren åpner det (eier 04.10.2026). Inni står det som er felles øverst, kortene for hver av dem under, og regelverk
// og kilder i lukkede rader nederst (Kortfot).
import { useId, useState } from 'preact/hooks';
import { usePrivatskole, useTekst } from '../app/tilstand.ts';
import type { Tabell as TabellData } from '../core/innhold/skjema.ts';
import { Ikon } from './Ikon.tsx';
import type { Kortinnhold } from './Innholdskort.tsx';
import { Kortfot } from './Kortfot.tsx';
import { medPrivatskolekilder, Privatskolemerknad } from './Privatskolemerknad.tsx';
import { Tabell } from './Tabell.tsx';
import { forsteSetning } from './Veiviser.tsx';

export function Samleboks({ element, tabell, aapen = false }: { element: Kortinnhold; tabell: TabellData | undefined; aapen?: boolean }) {
  const { malform } = useTekst();
  const privat = usePrivatskole();
  const [erAapen, settAapen] = useState(aapen);
  const id = useId();
  return (
    <div class="innholdskort samleboks" id={element.id}>
      <button type="button" class="innholdskort-knapp" aria-expanded={erAapen} aria-controls={id} onClick={() => settAapen(!erAapen)}>
        <span class="innholdskort-topp">
          <span class="innholdskort-tittel">{element.tittel[malform]}</span>
          {!erAapen && <span class="innholdskort-smakebit">{forsteSetning(element.tekst[malform])}</span>}
        </span>
        <Ikon navn={erAapen ? 'opp' : 'ned'} class="innholdskort-pil" />
      </button>
      <div id={id} class="innholdskort-innhold" hidden={!erAapen}>
        <div class="brodtekst" dangerouslySetInnerHTML={{ __html: element.tekst[malform] }} />
        {tabell && <Tabell tabell={tabell} tittel={element.tittel} />}
        <Privatskolemerknad element={element} />
        <Kortfot paragrafer={element.paragrafer ?? []} kilder={medPrivatskolekilder(element.kilder, element, privat)} />
      </div>
    </div>
  );
}
