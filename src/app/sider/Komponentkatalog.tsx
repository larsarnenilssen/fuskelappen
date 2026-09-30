// Komponentkatalog. Finnes bare i utvikling og testing (se ruteliste.ts).
import { useState } from 'preact/hooks';
import { Forklaring } from '../../components/Forklaring.tsx';
import { Nivamerke, Statusmerke } from '../../components/Merker.tsx';
import { Resultatkort } from '../../components/Resultatkort.tsx';
import { Tallfelt } from '../../components/Tallfelt.tsx';
import { formaterTall } from '../../core/i18n/tekst.ts';
import { useTekst } from '../tilstand.ts';

export default function Komponentkatalog() {
  const { t } = useTekst();
  const [timer, settTimer] = useState<number | null>(4);
  return (
    <div class="side">
      <h1 tabIndex={-1}>{t('utvikling.tittel')}</h1>
      <p>{t('utvikling.innledning')}</p>

      <Forklaring tittel={t('utvikling.forklaringTittel')}>
        <p>{t('utvikling.forklaringTekst')}</p>
        <svg viewBox="0 0 200 20" role="img" aria-label={t('utvikling.forklaringTittel')} class="diagram">
          <rect x="0" y="0" width="120" height="20" class="diagram-del-1" />
          <rect x="120" y="0" width="80" height="20" class="diagram-del-2" />
        </svg>
      </Forklaring>

      <Tallfelt
        etikett={t('utvikling.tallfeltEtikett')}
        enhet={t('utvikling.tallfeltEnhet')}
        verdi={timer}
        min={0}
        maks={40}
        onEndring={settTimer}
      />

      <Resultatkort
        tittel={t('utvikling.resultatTittel')}
        verdi={timer === null ? '–' : formaterTall(timer * 2.5, 1)}
        enhet="%"
        niva="fylke"
        steg={[
          { tekst: t('utvikling.resultatSteg1'), verdi: timer === null ? '–' : formaterTall(timer * 0.025, 3), niva: 'fylke' },
          { tekst: t('utvikling.resultatSteg2'), verdi: timer === null ? '–' : formaterTall(timer * 2.5, 1) },
        ]}
      />

      <div class="merker">
        <Nivamerke niva="nasjonal" vis="alltid" />
        <Nivamerke niva="fylke" />
        <Nivamerke niva="skole" />
        <Statusmerke status="kontrollert" kontrollert={{ dato: '2026-09-01' }} />
        <Statusmerke status="kilde_endret" />
        <Statusmerke status="bor_kontrolleres" />
      </div>
    </div>
  );
}
