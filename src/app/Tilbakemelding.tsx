// Tilbakemelding på e-post (eier 05.10.2026, avgjørelse 064): «Skriv e-post» åpner e-postprogrammet med emne og en
// kort mal med versjonen og siden brukeren kom fra. Uten e-postprogram kan brukeren vise og kopiere adressen.
import { useState } from 'preact/hooks';
import { app } from '../config/app.ts';
import { Ikon } from '../components/Ikon.tsx';
import { fylkesnavn } from './Stedmerknad.tsx';
import { epostlenke, forrigeSide } from './tilbakemelding.ts';
import { useTekst, useTilstand } from './tilstand.ts';

export function Tilbakemelding({ overskrift: Overskrift = 'h2' }: { overskrift?: 'h2' | 'legend' }) {
  const { t } = useTekst();
  const { innstillinger } = useTilstand();
  const [vis, settVis] = useState(false);
  const [kopiert, settKopiert] = useState<'ja' | 'nei' | null>(null);
  const versjon = `${__APP_VERSJON__}${__TESTVERSJON__ ? ' (test)' : ''}`;
  const side = forrigeSide();
  const fylke = fylkesnavn(innstillinger.fylke);
  const lenke = epostlenke(app.tilbakemelding, t('tilbakemelding.emne', { app: app.navn, versjon }), [
    t('tilbakemelding.mal'),
    '',
    '',
    '',
    '---',
    t('tilbakemelding.versjon', { versjon }),
    ...(side ? [t('tilbakemelding.side', { side })] : []),
    ...(fylke ? [t('tilbakemelding.fylke', { fylke })] : []),
  ]);
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
        {!vis && (
          <button type="button" class="knapp knapp-sekundaer" onClick={() => settVis(true)}>
            {t('tilbakemelding.visAdressen')}
          </button>
        )}
      </div>
      {vis && (
        <p class="tilbakemelding-adresse">
          <span class="tilbakemelding-epost">{app.tilbakemelding}</span>
          <button type="button" class="knapp knapp-sekundaer knapp-liten" onClick={() => void kopier()}>
            <Ikon navn="kopier" />
            {t('tilbakemelding.kopier')}
          </button>
        </p>
      )}
      <p role="status" class="liten">
        {kopiert === 'ja' ? t('tilbakemelding.kopiert') : kopiert === 'nei' ? t('tilbakemelding.kopierSelv') : ''}
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
    <section aria-labelledby="om-tilbakemelding" data-testid="tilbakemelding">
      <h2 id="om-tilbakemelding">{t('tilbakemelding.tittel')}</h2>
      {innhold}
    </section>
  );
}
