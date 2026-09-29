// Lite «?» som viser en kort forklaring når brukeren trykker på det. Skjult til det åpnes.
// Knappen står der den settes inn; teksten legges i en egen blokk som tar hele bredden.
// Foreldreelementet bør ha klassen «med-hjelp», så knapp og tekst plasseres riktig.
import type { ComponentChildren } from 'preact';
import { useId, useState } from 'preact/hooks';
import { useTekst } from '../app/tilstand.ts';
import { Ikon } from './Ikon.tsx';

export function Hjelp({ tema, children }: { tema: string; children: ComponentChildren }) {
  const { t } = useTekst();
  const [aapen, settAapen] = useState(false);
  const id = useId();
  return (
    <>
      <button
        type="button"
        class="hjelpknapp"
        aria-expanded={aapen}
        aria-controls={id}
        aria-label={t('komponenter.hjelp.vis', { tema })}
        onClick={() => settAapen(!aapen)}
      >
        <Ikon navn="sporsmal" class="ikon-liten" />
      </button>
      <div id={id} class="hjelp-tekst" hidden={!aapen}>
        {children}
      </div>
    </>
  );
}
