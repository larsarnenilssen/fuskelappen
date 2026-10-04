// Et kort som står åpent med tabellen inni, f.eks. utsatt, ny og særskilt eksamen (fase 6, pakke 3): det som er felles
// står øverst, kortene for hver av dem under, og regelverk og kilder i lukkede rader nederst (Kortfot).
import { useTekst } from '../app/tilstand.ts';
import type { Tabell as TabellData } from '../core/innhold/skjema.ts';
import type { Kortinnhold } from './Innholdskort.tsx';
import { Kortfot } from './Kortfot.tsx';
import { Tabell } from './Tabell.tsx';

export function Samleboks({ element, tabell }: { element: Kortinnhold; tabell: TabellData | undefined }) {
  const { malform } = useTekst();
  return (
    <div class="samleboks" id={element.id}>
      <h3 class="samleboks-tittel">{element.tittel[malform]}</h3>
      <div class="brodtekst" dangerouslySetInnerHTML={{ __html: element.tekst[malform] }} />
      {tabell && <Tabell tabell={tabell} tittel={element.tittel} />}
      <Kortfot paragrafer={element.paragrafer ?? []} kilder={element.kilder} />
    </div>
  );
}
