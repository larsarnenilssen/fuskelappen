// En del av kalkulatorskjemaet, f.eks. «Undervisning». Delene står i kort med kant og overskrift i fargen til delen
// i diagrammet, så det er lett å se hva hvert kort fyller (avgjørelse 033). Summen står i overskriften, og delen
// kan legges sammen som de andre kortene.
import type { ComponentChildren } from 'preact';
import { useId } from 'preact/hooks';
import { Sammenleggknapp, useSammenlagt } from '../../../components/Sammenlegg.tsx';

export type Skjemadeltype = 'stilling' | 'undervisning' | 'funksjoner' | 'tid' | 'lonn' | 'annet';

export function Skjemadel({
  tittel,
  del,
  sum,
  oppsummering,
  hoyre,
  children,
}: {
  tittel: string;
  del: Skjemadeltype;
  /** Kort sum i overskriften, f.eks. «60,48 %». Står også når delen er lagt sammen. */
  sum?: string | null;
  /** Det overskriften viser i stedet for summen når delen er lagt sammen, f.eks. «1 lagt inn, 10 %». */
  oppsummering?: string | null;
  /** Bryter eller knapp til høyre i overskriften, f.eks. «Regn ut lønn». */
  hoyre?: ComponentChildren;
  children?: ComponentChildren;
}) {
  const [lukket, veksle] = useSammenlagt(`del-${del}`);
  const innhold = useId();
  const harInnhold = Boolean(children);
  const vist = lukket && harInnhold && oppsummering ? oppsummering : sum;
  const sumTekst = vist && <span class="skjemadel-sum tall">{vist}</span>;
  return (
    <section class={`skjemadel${lukket && harInnhold ? ' lukket' : ''}`} data-del={del} aria-label={tittel}>
      <div class="skjemadel-topp">
        <h2 class="skjemadel-tittel">
          {harInnhold ? (
            <Sammenleggknapp lukket={lukket} onVeksle={veksle} kontroll={innhold}>
              <span class="skjemadel-navn">{tittel}</span>
              {sumTekst}
            </Sammenleggknapp>
          ) : (
            <span class="skjemadel-rad">
              <span class="skjemadel-navn">{tittel}</span>
              {sumTekst}
            </span>
          )}
        </h2>
        {hoyre && <div class="skjemadel-hoyre">{hoyre}</div>}
      </div>
      {harInnhold && (
        <div id={innhold} class="skjemadel-innhold" hidden={lukket}>
          {children}
        </div>
      )}
    </section>
  );
}
