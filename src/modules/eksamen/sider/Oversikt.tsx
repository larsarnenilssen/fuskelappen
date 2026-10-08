// Oversikten i Eksamen og klage (eier 06.10.2026, avgjørelse 078): de fire kortene som stod under «Eksamen og klage» i
// Vurdering: «Eksamen og prøver» med eksamen og prøvene, «Klage» med veiviseren og «Datoer» med kalenderen. Kortet for
// kalenderen viser den neste datoen.
import { useEffect, useState } from 'preact/hooks';
import { useTekst, useTilstand } from '../../../app/tilstand.ts';
import { Begrepstekst } from '../../../components/Begrepstekst.tsx';
import { Ikon } from '../../../components/Ikon.tsx';
import { Sidetopp } from '../../../components/Sidetopp.tsx';
import { ToKolonner } from '../../../components/ToKolonner.tsx';
import { Veiviserinnganger } from '../../../components/Veiviserinnganger.tsx';
import { velgSynlige } from '../../../core/innhold/status.ts';
import { nesteFrist, tidspunkt } from '../../../core/tidslinje.ts';
import { lastEksamensdatoer } from '../../../data/eksamen.ts';
import { iDag, skolearFor } from '../../../data/skolear.ts';
import { oversiktsid } from '../../favoritter.ts';
import { Inngang } from '../../vurdering/sider/Inngang.tsx';
import { medEksamensdatoer } from '../eksamensdatoer/datoer.ts';
import type { Eksamensdatoer } from '../eksamensdatoer/skjema.ts';
import { type Eksamensinnhold, hentInnhold, UNDERSIDER, veiviserRute } from '../innhold.ts';

export default function Oversikt() {
  const { t, malform } = useTekst();
  const { innstillinger } = useTilstand();
  const [innhold, settInnhold] = useState<Eksamensinnhold | null>(null);
  const [datoer, settDatoer] = useState<Eksamensdatoer | null>(null);
  useEffect(() => {
    void hentInnhold().then(settInnhold);
    lastEksamensdatoer().then(settDatoer, () => settDatoer(null));
  }, []);
  const sted = { fylke: innstillinger.fylke, skole: innstillinger.skole?.id ?? null };
  const idag = iDag();
  const veivisere = innhold ? velgSynlige(innhold.veivisere, sted) : [];
  const frister = innhold ? medEksamensdatoer(velgSynlige(innhold.frister, sted), datoer, Number(skolearFor(idag).slice(0, 4)), innstillinger.fylke) : [];
  // Bare datoer for et bestemt år eller en fast dag er med, ikke «Udir fastsetter datoen».
  const neste = nesteFrist(
    frister.filter((f) => f.aar || f.regel?.type === 'arlig'),
    idag,
  );
  return (
    <div class="side side-bred">
      <Sidetopp tittel={t('eksamen.tittel')} favoritt={oversiktsid('eksamen')} />
      <p class="ingress">
        <Begrepstekst tekst={t('eksamen.innledning')} />
      </p>
      {innhold === null ? (
        <p class="dempet">{t('app.lasterInn')}</p>
      ) : (
        // Eksamen og prøvene til venstre, og veiviseren for klage og kalenderen til høyre, som veiviserne og fristene i de
        // andre modulene (fase 8b, eier 08.10.2026).
        <ToKolonner
          hoved={
            <section class="lop-del" aria-labelledby="ek-del-eksamen">
              <h2 class="liten-overskrift" id="ek-del-eksamen">
                {t('eksamen.delEksamen')}
              </h2>
              <Veiviserinnganger
                veivisere={[]}
                rute={veiviserRute}
                foran={[
                  { id: 'eksamen', kort: <Inngang {...UNDERSIDER.eksamen} tittel={t('eksamen.eksamen.kort')} tekst={t('eksamen.eksamen.beskrivelse')} /> },
                  { id: 'provene', kort: <Inngang {...UNDERSIDER.provene} tittel={t('eksamen.provene.kort')} tekst={t('eksamen.provene.beskrivelse')} /> },
                ]}
              />
            </section>
          }
          side={
            <>
              <section class="lop-del" aria-labelledby="ek-del-klage">
                <h2 class="liten-overskrift" id="ek-del-klage">
                  {t('eksamen.delKlage')}
                </h2>
                <Veiviserinnganger veivisere={veivisere} rute={veiviserRute} />
              </section>
              <section class="lop-del" aria-labelledby="ek-del-datoer">
                <h2 class="liten-overskrift" id="ek-del-datoer">
                  {t('eksamen.delDatoer')}
                </h2>
                {/* Kortet viser den neste datoen, så brukeren ser hva som kommer uten å åpne kalenderen. */}
                <a class="frist-inngang" href={`#${UNDERSIDER.frister.rute}`}>
                  <span class="frist-inngang-tittel">
                    <Ikon navn={UNDERSIDER.frister.ikon} />
                    {t('eksamen.frister.tittel')}
                  </span>
                  {neste ? (
                    <span class="frist-inngang-neste">
                      <span class="frist-inngang-etikett">{t('eksamen.frister.neste')}</span>
                      <span class="frist-inngang-tid">{tidspunkt(neste, malform)}</span>
                      <span>{neste.tittel[malform]}</span>
                    </span>
                  ) : (
                    <span class="frist-inngang-neste">{t('eksamen.frister.beskrivelse')}</span>
                  )}
                  <Ikon navn="hoyre" class="frist-inngang-pil" />
                </a>
              </section>
            </>
          }
        />
      )}
    </div>
  );
}
