// Tilbakemelding på e-post (eier 05.10.2026, avgjørelse 064): «Skriv e-post» åpner e-postprogrammet med emne og en
// kort mal med versjonen og siden brukeren kom fra. Uten e-postprogram kan brukeren kopiere adressen. Adressen vises
// ikke på siden (eier 05.10.2026).
import { useState } from 'preact/hooks';
import { app } from '../config/app.ts';
import { Ikon } from '../components/Ikon.tsx';
import { fylkesnavn } from './Stedmerknad.tsx';
import { epostlenke, forrigeSide } from './tilbakemelding.ts';
import { useTekst, useTilstand } from './tilstand.ts';

/** E-posten med emne og mal, til «Skriv e-post». */
export function useTilbakemeldingslenke(): string {
  const { t } = useTekst();
  const { innstillinger } = useTilstand();
  const versjon = `${__APP_VERSJON__}${__TESTVERSJON__ ? ' (test)' : ''}`;
  const side = forrigeSide();
  const fylke = fylkesnavn(innstillinger.fylke);
  return epostlenke(app.tilbakemelding, t('tilbakemelding.emne', { app: app.navn, versjon }), [
    t('tilbakemelding.mal'),
    '',
    '',
    '',
    '---',
    t('tilbakemelding.versjon', { versjon }),
    ...(side ? [t('tilbakemelding.side', { side })] : []),
    ...(fylke ? [t('tilbakemelding.fylke', { fylke })] : []),
  ]);
}

export function Tilbakemelding({ overskrift: Overskrift = 'h2' }: { overskrift?: 'h2' | 'legend' }) {
  const { t } = useTekst();
  const [kopiert, settKopiert] = useState<'ja' | 'nei' | null>(null);
  const lenke = useTilbakemeldingslenke();
  const kopier = async () => {
    try {
      await navigator.clipboard.writeText(app.tilbakemelding);
      settKopiert('ja');
    } catch {
      settKopiert('nei');
    }
  };
  const innhold = (
    <>
      <p>{t('tilbakemelding.tekst')}</p>
      <div class="knapperad">
        <a class="knapp" href={lenke}>
          <Ikon navn="blyant" />
          {t('tilbakemelding.skriv')}
        </a>
        <button type="button" class="knapp knapp-sekundaer" onClick={() => void kopier()}>
          <Ikon navn="kopier" />
          {t('tilbakemelding.kopier')}
        </button>
      </div>
      <p role="status" class="liten">
        {kopiert === 'ja' ? t('tilbakemelding.kopiert') : kopiert === 'nei' ? t('tilbakemelding.kopierFeil') : ''}
      </p>
    </>
  );
  if (Overskrift === 'legend') {
    return (
      <fieldset class="valggruppe" data-testid="tilbakemelding">
        <legend>{t('tilbakemelding.tittel')}</legend>
        {innhold}
      </fieldset>
    );
  }
  return (
    <section class="lop-del" aria-labelledby="om-tilbakemelding" data-testid="tilbakemelding">
      <h2 id="om-tilbakemelding" class="liten-overskrift">{t('tilbakemelding.tittel')}</h2>
      {innhold}
    </section>
  );
}
