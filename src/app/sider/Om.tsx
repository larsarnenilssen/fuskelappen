import { app } from '../../config/app.ts';
import { Forklaring } from '../../components/Forklaring.tsx';
import { Ikon } from '../../components/Ikon.tsx';
import { TekniskInfo } from '../TekniskInfo.tsx';
import { Tilbakemelding } from '../Tilbakemelding.tsx';
import { useTekst } from '../tilstand.ts';

export default function Om() {
  const { t, malform } = useTekst();
  return (
    <div class="side">
      <h1 tabIndex={-1}>{t('om.tittel')}</h1>
      <p class="ingress">{app.beskrivelse[malform]}</p>
      <p>{t('om.innledning', { app: app.navn })}</p>
      <p class="dempet" data-testid="versjon">
        {t('om.versjon', { versjon: __APP_VERSJON__ })}
      </p>

      <section class="kort kort-med-topp" aria-labelledby="om-erklaering" data-testid="brukserklaering">
        <h2 id="om-erklaering">{t('om.erklaering.tittel')}</h2>
        <p>{t('om.erklaering.privat', { app: app.navn })}</p>
        <p>{t('om.erklaering.garanti')}</p>
        <p>{t('om.erklaering.ki')}</p>
        <p>{t('om.erklaering.grunnlag')}</p>
        <p>{t('om.erklaering.innspill')}</p>
      </section>

      <Tilbakemelding />

      <section class="lop-del" aria-labelledby="om-kilder">
        <h2 id="om-kilder" class="liten-overskrift">{t('om.kilder.tittel')}</h2>
        <ul class="liste">
          <li>
            <a class="listelenke" href="#/om/kilder">
              <span class="listelenke-tekst">
                <span class="listelenke-tittel">{t('om.kilder.lenke')}</span>
              </span>
              <Ikon navn="hoyre" class="ikon-liten" />
            </a>
          </li>
        </ul>
      </section>

      <section class="lop-del" aria-labelledby="om-personvern">
        <h2 id="om-personvern" class="liten-overskrift">{t('om.personvern.tittel')}</h2>
        <p>{t('om.personvern.tekst')}</p>
      </section>

      <section class="lop-del" aria-labelledby="om-kreditering">
        <h2 id="om-kreditering" class="liten-overskrift">{t('om.kreditering.tittel')}</h2>
        <p>{t('om.kreditering.tekst')}</p>
        <p>
          <a href="https://data.norge.no/nlod/no/2.0" target="_blank" rel="noopener noreferrer">
            {t('om.kreditering.nlod')}
          </a>
        </p>
        <p>{t('om.kreditering.elevundersokelsen')}</p>
        <p>{t('om.kreditering.utdanning')}</p>
        <p>
          {t('om.kreditering.ndla')}{' '}
          <a href="https://creativecommons.org/licenses/by/4.0/deed.no" target="_blank" rel="noopener noreferrer">
            {t('om.kreditering.ccby')}
          </a>
        </p>
        <p>
          {t('om.kreditering.ssb')}{' '}
          <a href="https://creativecommons.org/licenses/by/4.0/deed.no" target="_blank" rel="noopener noreferrer">
            {t('om.kreditering.ccby')}
          </a>
        </p>
      </section>

      <Forklaring tittel={t('om.teknisk.tittel')}>
        <TekniskInfo />
      </Forklaring>

      <p class="dempet liten">
        {t('om.kildekode')}{' '}
        <a href={app.repo} target="_blank" rel="noopener noreferrer">
          {t('om.kildekodeLenke')}
        </a>
      </p>
    </div>
  );
}
