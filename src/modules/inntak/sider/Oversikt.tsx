import { useEffect, useState } from 'preact/hooks';
import { useTekst, useTilstand } from '../../../app/tilstand.ts';
import { Veiviserinnganger } from '../../../components/Veiviserinnganger.tsx';
import { Ikon } from '../../../components/Ikon.tsx';
import { velgSynlige } from '../../../core/innhold/status.ts';
import { iDag } from '../../arbeidstid/kontekst.ts';
import { fristerRute, hentInnhold, poengRute, veiviserRute, type Inntaksinnhold } from '../innhold.ts';
import { nesteFrist, tidspunkt } from '../tidslinje.ts';
import { Lokalmerknad } from './Lokalmerknad.tsx';

export default function Oversikt() {
  const { t, malform } = useTekst();
  const { innstillinger } = useTilstand();
  const [innhold, settInnhold] = useState<Inntaksinnhold | null>(null);
  useEffect(() => {
    void hentInnhold().then(settInnhold);
  }, []);
  const sted = { fylke: innstillinger.fylke, skole: innstillinger.skole?.id ?? null };
  const neste = innhold ? nesteFrist(velgSynlige(innhold.frister, sted), iDag()) : null;
  return (
    <div class="side">
      <h1 tabIndex={-1}>{t('inntak.tittel')}</h1>
      <p class="ingress">{t('inntak.innledning')}</p>
      {innhold === null ? (
        <p class="dempet">{t('app.lasterInn')}</p>
      ) : (
        <>
          <Lokalmerknad innhold={innhold} />
          <section>
            <h2 class="liten-overskrift">{t('inntak.veivisere')}</h2>
            <Veiviserinnganger veivisere={velgSynlige(innhold.veivisere, sted)} rute={veiviserRute} />
          </section>
          <section>
            <h2 class="liten-overskrift">{t('inntak.frister.kort')}</h2>
            {/* Kortet viser den neste fristen, så brukeren ser hva som kommer uten å åpne tidslinjen. */}
            <a class="frist-inngang" href={`#${fristerRute}`}>
              <span class="frist-inngang-tittel">
                <Ikon navn="klokke" />
                {t('inntak.frister.alle')}
              </span>
              {neste && (
                <span class="frist-inngang-neste">
                  <span class="frist-inngang-etikett">{t('inntak.frister.neste')}</span>
                  <span class="frist-inngang-tid">{tidspunkt(neste, malform)}</span>
                  <span>{neste.tittel[malform]}</span>
                </span>
              )}
              <Ikon navn="hoyre" class="frist-inngang-pil" />
            </a>
          </section>
          <section>
            <h2 class="liten-overskrift">{t('inntak.poeng.kalkulator')}</h2>
            {/* Samme kort som tidslinjen over, med beskrivelsen i stedet for den neste fristen. */}
            <a class="frist-inngang" href={`#${poengRute}`}>
              <span class="frist-inngang-tittel">
                <Ikon navn="kalkulator" />
                {t('inntak.poeng.kort')}
              </span>
              <span class="frist-inngang-neste">{t('inntak.poeng.beskrivelse')}</span>
              <Ikon navn="hoyre" class="frist-inngang-pil" />
            </a>
          </section>
        </>
      )}
    </div>
  );
}
