// Resultatkort med «vis utregning». Viser nivå og «ikke kontrollert» der det gjelder.
import { useId, useState } from 'preact/hooks';
import { useTekst } from '../app/tilstand.ts';
import type { KildeRef, Niva } from '../core/innhold/skjema.ts';
import { Ikon } from './Ikon.tsx';
import { Kildelenke } from './Kildelenke.tsx';
import { Nivamerke, Statusmerke } from './Merker.tsx';

export interface Utregningssteg {
  tekst: string;
  verdi: string;
  kilde?: KildeRef;
  niva?: Niva;
}

interface Props {
  tittel: string;
  verdi: string;
  enhet?: string;
  niva?: Niva;
  /** Sann hvis minst én verdi i utregningen ikke er kontrollert av eier. */
  ikkeKontrollert?: boolean;
  steg: Utregningssteg[];
}

export function Resultatkort({ tittel, verdi, enhet, niva = 'nasjonal', ikkeKontrollert = false, steg }: Props) {
  const { t } = useTekst();
  const [vis, settVis] = useState(false);
  const id = useId();
  return (
    <section class="resultatkort" aria-label={tittel}>
      <h2 class="resultatkort-tittel">{tittel}</h2>
      <p class="resultatkort-verdi" aria-live="polite">
        <span class="tall">{verdi}</span>
        {enhet && <span class="resultatkort-enhet"> {enhet}</span>}
      </p>
      <div class="merker">
        <Nivamerke niva={niva} />
        {ikkeKontrollert && <Statusmerke status="utkast" />}
      </div>
      <button type="button" class="lenkeknapp" aria-expanded={vis} aria-controls={id} onClick={() => settVis(!vis)}>
        <Ikon navn={vis ? 'opp' : 'ned'} class="ikon-liten" />
        {vis ? t('komponenter.resultat.skjulUtregning') : t('komponenter.resultat.visUtregning')}
      </button>
      <div id={id} hidden={!vis}>
        <h3 class="skjult-visuelt">{t('komponenter.resultat.utregning')}</h3>
        <ol class="utregning">
          {steg.map((s, i) => (
            <li key={i}>
              <span class="utregning-tekst">{s.tekst}</span>
              <span class="utregning-verdi tall">{s.verdi}</span>
              {(s.kilde || (s.niva && s.niva !== 'nasjonal')) && (
                <span class="utregning-kilde">
                  {s.niva && <Nivamerke niva={s.niva} />}
                  {s.kilde && <Kildelenke kilde={s.kilde} />}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
