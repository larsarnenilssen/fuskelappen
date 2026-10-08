import { useEffect, useState } from 'preact/hooks';
import { useTekst, useTilstand } from '../../../app/tilstand.ts';
import { Veiviserinnganger } from '../../../components/Veiviserinnganger.tsx';
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
          {/* To kolonner på skrivebord (fase 8b, docs/DESIGN.md): veiviseren og mer opplæring til venstre, fristene,
              kalkulatoren og tallene til høyre. */}
          <ToKolonner
            hoved={
              <>
                <section class="lop-del">
                  <h2 class="liten-overskrift">{t('inntak.veivisere')}</h2>
                  <Veiviserinnganger veivisere={velgSynlige(innhold.veivisere, sted)} rute={veiviserRute} />
                </section>
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
              </>
            }
            side={
              <>
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
                <section class="lop-del">
                  <h2 class="liten-overskrift">{t('inntak.poeng.kalkulator')}</h2>
                  {/* Samme kort som tidslinjen over, med beskrivelsen i stedet for den neste fristen. */}
                  <a class="frist-inngang" href={`#${UNDERSIDER.poeng.rute}`}>
                    <span class="frist-inngang-tittel">
                      <Ikon navn={UNDERSIDER.poeng.ikon} />
                      {t('inntak.poeng.kort')}
                    </span>
                    <span class="frist-inngang-neste">{t('inntak.poeng.beskrivelse')}</span>
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
