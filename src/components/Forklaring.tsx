// Forklaring som er skjult til brukeren åpner den. Kan inneholde tekst og SVG.
import type { ComponentChildren } from 'preact';
import { useId, useState } from 'preact/hooks';
import { useTekst } from '../app/tilstand.ts';
import { Ikon } from './Ikon.tsx';

interface Props {
  tittel: string;
  children: ComponentChildren;
  /** Åpen fra start. Standard er lukket. */
  aapen?: boolean;
}

export function Forklaring({ tittel, children, aapen = false }: Props) {
  const { t } = useTekst();
  const [erAapen, settAapen] = useState(aapen);
  const id = useId();
  return (
    <div class="forklaring">
      <button
        type="button"
        class="forklaring-knapp"
        aria-expanded={erAapen}
        aria-controls={id}
        onClick={() => settAapen(!erAapen)}
      >
        <Ikon navn="info" />
        <span>{tittel}</span>
        <span class="skjult-visuelt">{erAapen ? t('komponenter.forklaring.skjul') : t('komponenter.forklaring.vis')}</span>
        <Ikon navn={erAapen ? 'opp' : 'ned'} class="forklaring-pil" />
      </button>
      <div id={id} class="forklaring-innhold" hidden={!erAapen}>
        {children}
      </div>
    </div>
  );
}
