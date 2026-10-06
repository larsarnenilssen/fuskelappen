// Forklaring som er skjult til brukeren åpner den. Kan inneholde tekst og SVG.
import type { ComponentChildren } from 'preact';
import { useId } from 'preact/hooks';
import { useTekst } from '../app/tilstand.ts';
import { useHusketApen } from './husket.ts';
import { Ikon, type Ikonnavn } from './Ikon.tsx';

interface Props {
  tittel: string;
  children: ComponentChildren;
  /** Åpen fra start. Standard er lukket. */
  aapen?: boolean;
  /** Ikonet foran tittelen. Standard er «info». */
  ikon?: Ikonnavn;
}

export function Forklaring({ tittel, children, aapen = false, ikon = 'info' }: Props) {
  const { t } = useTekst();
  // Om forklaringen er åpen, huskes for siden (husket.ts), med tittelen som nøkkel.
  const [erAapen, settAapen] = useHusketApen(`forklaring:${tittel}`, aapen);
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
        <Ikon navn={ikon} />
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
