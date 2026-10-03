import { useEffect, useState } from 'preact/hooks';
import { useTekst, useTilstand } from '../../../app/tilstand.ts';
import { Ikon } from '../../../components/Ikon.tsx';
import { velgSynlige } from '../../../core/innhold/status.ts';
import { hentInnhold, veiviserRute, type Veiviserinnhold } from '../innhold.ts';

/**
 * Figur: individuell tilrettelegging er en del av tilpasset opplæring. Den indre boksen (noen elever) står inne i
 * den ytre (alle elever), fordi også elever med vedtak skal ha tilpasset opplæring. Navnene lenker til begrepene.
 */
function Figur() {
  const { t } = useTekst();
  return (
    <figure class="tl-figur" aria-labelledby="tl-figur-tittel">
      <figcaption id="tl-figur-tittel" class="liten-overskrift">
        {t('tilrettelegging.figur.tittel')}
      </figcaption>
      <div class="tl-lag tl-alle">
        <p class="tl-hvem">{t('tilrettelegging.figur.alle')}</p>
        <a class="tl-navn" href="#/begreper/tilpasset-opplaering">
          {t('tilrettelegging.figur.tilpasset')}
        </a>
        <p class="tl-tekst">{t('tilrettelegging.figur.alleTekst')}</p>
        <div class="tl-lag tl-noen">
          <p class="tl-hvem">{t('tilrettelegging.figur.noen')}</p>
          <a class="tl-navn" href="#/begreper/individuell-tilrettelegging">
            {t('tilrettelegging.figur.individuell')}
          </a>
          <p class="tl-tekst">{t('tilrettelegging.figur.noenTekst')}</p>
          <ul class="tl-retter">
            <li>
              <a href="#/begreper/individuelt-tilrettelagt-opplaering">{t('tilrettelegging.figur.ito')}</a>
            </li>
            <li>
              <a href="#/begreper/personlig-assistanse">{t('tilrettelegging.figur.assistanse')}</a>
            </li>
            <li>
              <a href="#/begreper/fysisk-tilrettelegging">{t('tilrettelegging.figur.fysisk')}</a>
            </li>
          </ul>
        </div>
      </div>
    </figure>
  );
}

export default function Oversikt() {
  const { t, malform } = useTekst();
  const { innstillinger } = useTilstand();
  const [innhold, settInnhold] = useState<Veiviserinnhold | null>(null);
  useEffect(() => {
    void hentInnhold().then(settInnhold);
  }, []);
  const sted = { fylke: innstillinger.fylke, skole: innstillinger.skole?.id ?? null };
  return (
    <div class="side">
      <h1 tabIndex={-1}>{t('tilrettelegging.tittel')}</h1>
      <p class="ingress">{t('tilrettelegging.innledning')}</p>
      <Figur />
      {innhold === null ? (
        <p class="dempet">{t('app.lasterInn')}</p>
      ) : (
        <section>
          <h2 class="liten-overskrift">{t('tilrettelegging.veivisere')}</h2>
          {/* Like høye kort med en liten fasestolpe, som stolpen øverst i veiviseren (eier 03.10.2026). */}
          <ul class="veiviser-innganger">
            {velgSynlige(innhold.veivisere, sted)
              .sort((x, y) => x.rekkefolge - y.rekkefolge)
              .map((v) => (
              <li key={v.id}>
                <a class="veiviser-inngang" href={`#${veiviserRute(v.id)}`} data-veiviserfarge={v.farge}>
                  <span class="veiviser-inngang-topp">
                    <span class="veiviser-inngang-tittel">{v.tittel[malform]}</span>
                    <Ikon navn="hoyre" />
                  </span>
                  {v.faser.length > 0 && (
                    <>
                      <span class="skjult-visuelt">. {t('tilrettelegging.faser', { faser: v.faser.map((f) => f.tittel[malform]).join(', ') })}</span>
                      <span class="veiviser-inngang-faser" aria-hidden="true">
                        {v.faser.map((f) => (
                          <span key={f.id} class="veiviser-inngang-fase">
                            <span class="veiviser-inngang-strek" />
                            <span class="veiviser-inngang-fasenavn">{f.tittel[malform]}</span>
                          </span>
                        ))}
                      </span>
                      {/* På svært smal skjerm er det ikke plass til navnene under stolpen. Da står antallet her. */}
                      <span class="veiviser-inngang-antall" aria-hidden="true">
                        {t('tilrettelegging.antallFaser', { antall: String(v.faser.length) })}
                      </span>
                    </>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
