import { useEffect, useState } from 'preact/hooks';
import { Sidetopp } from '../../../components/Sidetopp.tsx';
import { ToKolonner } from '../../../components/ToKolonner.tsx';
import { oversiktsid } from '../../favoritter.ts';
import { useTekst, useTilstand } from '../../../app/tilstand.ts';
import { Veiviserinnganger } from '../../../components/Veiviserinnganger.tsx';
import { velgSynlige } from '../../../core/innhold/status.ts';
import { hentInnhold, veiviserRute, type Veiviserinnhold } from '../innhold.ts';
import { Begrepstekst } from '../../../components/Begrepstekst.tsx';

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
  const { t } = useTekst();
  const { innstillinger } = useTilstand();
  const [innhold, settInnhold] = useState<Veiviserinnhold | null>(null);
  useEffect(() => {
    void hentInnhold().then(settInnhold);
  }, []);
  const sted = { fylke: innstillinger.fylke, skole: innstillinger.skole?.id ?? null };
  return (
    <div class="side side-bred">
      <Sidetopp tittel={t('tilrettelegging.tittel')} favoritt={oversiktsid('tilrettelegging')} />
      <p class="ingress">
        <Begrepstekst tekst={t('tilrettelegging.innledning')} />
      </p>
      {/* To kolonner på skrivebord (fase 8b, docs/DESIGN.md): figuren til venstre, veiviserne til høyre. */}
      <ToKolonner
        hoved={<Figur />}
        side={
          <section class="lop-del">
            <h2 class="liten-overskrift">{t('tilrettelegging.veivisere')}</h2>
            {/* Like høye kort med en liten fasestolpe, som stolpen øverst i veiviseren (eier 03.10.2026). */}
            {innhold === null ? (
              <p class="dempet">{t('app.lasterInn')}</p>
            ) : (
              <Veiviserinnganger veivisere={velgSynlige(innhold.veivisere, sted)} rute={veiviserRute} />
            )}
          </section>
        }
      />
    </div>
  );
}
