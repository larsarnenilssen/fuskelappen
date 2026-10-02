// En rubrikk som kan legges sammen, med antall eller timer i overskriften (Opplæringsløp og Læreplanverket,
// avgjørelse 036 og 037).
import type { ComponentChildren } from 'preact';
import { useId } from 'preact/hooks';
import { Ikon } from './Ikon.tsx';
import { useSammenlagt } from './Sammenlegg.tsx';

/**
 * En rubrikk som kan legges sammen, med antall eller timer i overskriften. Hvilke rubrikker som er lagt sammen,
 * huskes i historikken for siden (som de andre kortene). `farge` gir kanten fargen til en fagtype.
 */
export function Rubrikk({
  nokkel,
  tittel,
  hoyre,
  lukket: standard = false,
  farge,
  children,
}: {
  nokkel: string;
  tittel: string;
  hoyre?: string | null;
  lukket?: boolean;
  farge?: string;
  children: ComponentChildren;
}) {
  const [lukket, veksle] = useSammenlagt(nokkel, standard);
  const id = useId();
  return (
    <section class="rubrikk" data-fagtype={farge} data-rubrikk={nokkel}>
      <h2 class="rubrikk-tittel">
        <button type="button" class="kortknapp" aria-expanded={!lukket} aria-controls={id} onClick={veksle}>
          <span class="kortknapp-tekst">
            <span>{tittel}</span>
            {/* Mellomrommet skiller tittelen og tallet for skjermlesere. Det vises ikke i flex. */}
            {hoyre && ' '}
            {hoyre && <span class="rubrikk-hoyre tall">{hoyre}</span>}
          </span>
          <Ikon navn={lukket ? 'ned' : 'opp'} class="ikon-liten kortknapp-pil" />
        </button>
      </h2>
      <div id={id} class="rubrikk-innhold" hidden={lukket}>
        {children}
      </div>
    </section>
  );
}

