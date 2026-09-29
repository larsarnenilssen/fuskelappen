// Resultatkort med «vis utregning». Viser nivå og «ikke kontrollert» der det gjelder.
// Utregningen er kompakt: én linje per trinn med tallene satt inn, formelen med navn i liten skrift,
// og kildene samlet nederst.
import type { ComponentChildren } from 'preact';
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
  /** Formelen med navn, f.eks. «årstimer ÷ årsramme × 100». */
  formel?: string;
  /** Formelen med tallene satt inn, f.eks. «140 ÷ 525 × 100». Vises foran verdien. */
  innsatt?: string;
  /** Hvor verdiene i trinnet kommer fra. Lokale nivåer vises som merke på trinnet. */
  kilder?: { kilde: KildeRef; niva: Niva; rad?: string }[];
}

interface Props {
  tittel: string;
  verdi: string;
  enhet?: string;
  niva?: Niva;
  /** Sann hvis minst én verdi i utregningen ikke er kontrollert av eier. */
  ikkeKontrollert?: boolean;
  /** Kort linje under verdien, f.eks. den siste utregningen: «140 ÷ 525 × 100». */
  sammendrag?: string;
  steg: Utregningssteg[];
  /** Kildene for hele utregningen, vist samlet nederst i utregningen. */
  kilder?: { kilde: KildeRef; niva: Niva; rad?: string }[];
  /** Innhold under hovedverdien, f.eks. en oversikt over delresultater. */
  children?: ComponentChildren;
}

export function Resultatkort({ tittel, verdi, enhet, niva = 'nasjonal', ikkeKontrollert = false, sammendrag, steg, kilder, children }: Props) {
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
      {sammendrag && <p class="resultatkort-sammendrag tall">{sammendrag}</p>}
      <div class="merker">
        <Nivamerke niva={niva} />
        {ikkeKontrollert && <Statusmerke status="utkast" />}
      </div>
      {children}
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
              <span class="utregning-linje">
                {s.innsatt && <span class="tall">{s.innsatt} = </span>}
                <span class="utregning-verdi tall">{s.verdi}</span>
                {[...new Set((s.kilder ?? []).map((k) => k.niva).concat(s.niva ? [s.niva] : []))]
                  .filter((n) => n !== 'nasjonal')
                  .map((n) => (
                    <Nivamerke key={n} niva={n} />
                  ))}
              </span>
              {s.formel && <span class="utregning-formel">{s.formel}</span>}
              {s.kilde && (
                <span class="utregning-kilde">
                  <Kildelenke kilde={s.kilde} />
                </span>
              )}
            </li>
          ))}
        </ol>
        {kilder && kilder.length > 0 && (
          <div class="utregning-kilder">
            <h3 class="liten-overskrift">{t('komponenter.resultat.kilde')}</h3>
            <ul>
              {kilder.map((k) => (
                <li key={`${k.kilde.id}-${k.kilde.punkt ?? ''}-${k.niva}`}>
                  <Kildelenke kilde={k.kilde} />
                  {k.niva !== 'nasjonal' && <Nivamerke niva={k.niva} />}
                  {k.rad && <span class="dempet"> {k.rad}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
