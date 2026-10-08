import { useEffect, useState } from 'preact/hooks';
import { LokaleRegler } from '../../../app/lokaleregler/LokaleRegler.tsx';
import { useTekst, useTilstand } from '../../../app/tilstand.ts';
import { veiviseroverskrift, Veiviserinnganger } from '../../../components/Veiviserinnganger.tsx';
import { Kalkulatorinngang } from '../../../components/Kalkulatorinngang.tsx';
import { Ikon } from '../../../components/Ikon.tsx';
import { Sidetopp } from '../../../components/Sidetopp.tsx';
import { ToKolonner } from '../../../components/ToKolonner.tsx';
import { oversiktsid } from '../../favoritter.ts';
import { velgSynlige } from '../../../core/innhold/status.ts';
import { iDag } from '../../../data/skolear.ts';
import { hentInnhold, UNDERSIDER, veiviserRute, type Inntaksinnhold } from '../innhold.ts';
import { nesteFrist, tidspunkt } from '../tidslinje.ts';
import { Lokalmerknad } from './Lokalmerknad.tsx';
import { Begrepstekst } from '../../../components/Begrepstekst.tsx';
import { InntakBoks } from '../../statistikk/ssb.tsx';

export default function Oversikt() {
  const { t, malform } = useTekst();
  const { innstillinger } = useTilstand();
  const [innhold, settInnhold] = useState<Inntaksinnhold | null>(null);
  useEffect(() => {
    void hentInnhold().then(settInnhold);
  }, []);
  const sted = { fylke: innstillinger.fylke, skole: innstillinger.skole?.id ?? null };
  const veivisere = innhold ? velgSynlige(innhold.veivisere, sted) : [];
  const neste = innhold ? nesteFrist(velgSynlige(innhold.frister, sted), iDag()) : null;
  return (
    <div class="side side-bred">
      <Sidetopp tittel={t('inntak.tittel')} favoritt={oversiktsid('inntak')} />
      <p class="ingress">
        <Begrepstekst tekst={t('inntak.innledning')} />
      </p>
      {innhold === null ? (
        <p class="dempet">{t('app.lasterInn')}</p>
      ) : (
        <>
          <Lokalmerknad innhold={innhold} />
          {/* To kolonner på skrivebord (fase 8b, docs/DESIGN.md): mer opplæring til venstre, og veiviseren, kalkulatoren,
              fristene og tallene til høyre (eier 08.10.2026). */}
          <ToKolonner
            hoved={
              <>
                <section class="lop-del">
                  <h2 class="liten-overskrift">{t('inntak.merOpplaering.tittel')}</h2>
                  <a class="frist-inngang" href={`#${UNDERSIDER.merOpplaering.rute}`}>
                    <span class="frist-inngang-tittel">
                      <Ikon navn={UNDERSIDER.merOpplaering.ikon} />
                      {t('inntak.merOpplaering.kort')}
                    </span>
                    <span class="frist-inngang-neste">{t('inntak.merOpplaering.beskrivelse')}</span>
                    <Ikon navn="hoyre" class="frist-inngang-pil" />
                  </a>
                </section>
                {/* Lokale regler om inntak for fylket og skolen (fase 9, avgjørelse 093). */}
                <LokaleRegler tema="inntak" />
              </>
            }
            side={
              <>
                <section class="lop-del">
                  <h2 class="liten-overskrift">{t(veiviseroverskrift(veivisere.length))}</h2>
                  <Veiviserinnganger veivisere={veivisere} rute={veiviserRute} />
                </section>
                <section class="lop-del">
                  <h2 class="liten-overskrift">{t('felles.kalkulator')}</h2>
                  <Kalkulatorinngang
                    href={`#${UNDERSIDER.poeng.rute}`}
                    ikon={UNDERSIDER.poeng.ikon}
                    tittel={t('inntak.poeng.kort')}
                    inn={[t('inntak.poeng.deler.standpunkt'), t('inntak.poeng.deler.eksamen'), t('inntak.poeng.deler.valgfag')]}
                    ut={t('inntak.poeng.resultat.tittel')}
                  />
                </section>
                <section class="lop-del">
                  <h2 class="liten-overskrift">{t('inntak.frister.kort')}</h2>
                  {/* Kortet viser den neste fristen, så brukeren ser hva som kommer uten å åpne tidslinjen. */}
                  <a class="frist-inngang" href={`#${UNDERSIDER.frister.rute}`}>
                    <span class="frist-inngang-tittel">
                      <Ikon navn={UNDERSIDER.frister.ikon} />
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
                {/* Søkerne fra Udir og ungdomskullene fra SSB, nederst etter sidens eget innhold (avgjørelse 090 og 091). */}
                <InntakBoks fylke={innstillinger.fylke} />
              </>
            }
          />
        </>
      )}
    </div>
  );
}
