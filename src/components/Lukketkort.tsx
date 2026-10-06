// Et kort som er lukket fra start, med tittel og én linje, i samme stil som innholdskortene (fase 6, pakke 6). For
// innhold som ikke er et innholdselement, f.eks. en vei for lærlinger og kandidater eller listen «Veiene hit».
import type { ComponentChildren } from 'preact';
import { useId } from 'preact/hooks';
import { useHusketApen } from './husket.ts';
import { Ikon } from './Ikon.tsx';

/** Om kortet er åpent, huskes for siden (husket.ts), med tittelen som nøkkel når kortet ikke har en egen. */
export function Lukketkort({ tittel, smakebit, children, klasse, nokkel }: { tittel: string; smakebit: string; children: ComponentChildren; klasse?: string; nokkel?: string }) {
  const [aapen, settAapen] = useHusketApen(`lukketkort:${nokkel ?? tittel}`);
  const id = useId();
  return (
    <div class={`innholdskort${klasse ? ` ${klasse}` : ''}`}>
      <button type="button" class="innholdskort-knapp" aria-expanded={aapen} aria-controls={id} onClick={() => settAapen(!aapen)}>
        <span class="innholdskort-topp">
          <span class="innholdskort-tittel">{tittel}</span>
          <span class="innholdskort-smakebit">{smakebit}</span>
        </span>
        <Ikon navn={aapen ? 'opp' : 'ned'} class="innholdskort-pil" />
      </button>
      <div id={id} class="innholdskort-innhold" hidden={!aapen}>
        {children}
      </div>
    </div>
  );
}
