// En del av en side med overskrift som kan lukkes og åpnes (fase 6, pakke 7, eier 06.10.2026): lange sider med mange
// kort blir kortere, og brukeren ser hva som finnes. Overskriften er en knapp med pil opp/ned (disclosure, som de
// sammenlagte kortene, avgjørelse 013). En lukket del viser innholdet som en linje under overskriften, f.eks. titlene
// på kortene. Hva som er åpent, huskes for siden (useHusketApen, avgjørelse 072).
import type { ComponentChildren } from 'preact';
import { useEffect, useId } from 'preact/hooks';
import { Ikon } from './Ikon.tsx';
import { useHusketApen } from './husket.ts';

interface Props {
  /** Nøkkelen delen huskes som åpen med på siden. */
  id: string;
  tittel: string;
  /** Hva delen inneholder, på én linje når den er lukket, f.eks. titlene på kortene. */
  innhold?: string;
  /** Åpen fra start. */
  apen?: boolean;
  /** Åpner delen, f.eks. når en lenke peker på et kort i den (`?del=`). */
  tvingApen?: boolean;
  children: ComponentChildren;
}

export function Seksjon({ id, tittel, innhold, apen: standard = false, tvingApen = false, children }: Props) {
  const [apen, settApen] = useHusketApen(`seksjon:${id}`, standard);
  const innholdId = useId();
  useEffect(() => {
    if (tvingApen) settApen(true);
  }, [tvingApen, settApen]);
  return (
    <section class="seksjon">
      <h2 class="liten-overskrift seksjon-overskrift">
        <button type="button" class="seksjon-knapp" aria-expanded={apen} aria-controls={innholdId} onClick={() => settApen(!apen)}>
          <span class="seksjon-tittel">{tittel}</span>
          {!apen && innhold && <span class="skjult-visuelt">: {innhold}</span>}
          <Ikon navn={apen ? 'opp' : 'ned'} class="seksjon-pil" />
        </button>
      </h2>
      {!apen && innhold && (
        <p class="seksjon-innhold" aria-hidden="true" onClick={() => settApen(true)}>
          {innhold}
        </p>
      )}
      <div id={innholdId} hidden={!apen}>
        {children}
      </div>
    </section>
  );
}
