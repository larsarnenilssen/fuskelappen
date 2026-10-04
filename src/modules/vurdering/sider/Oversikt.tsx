// Oversikten i Vurdering: delene som kort, som i Inntak og Opplæringstilbud (fase 6, mockup godkjent av eier
// 04.10.2026). Fravær har ett kort, kalkulatoren for fraværsgrensen (pakke 2). Eksamen og klage (pakke 3) har
// eksamen, veiviseren for klage, tidslinjen med neste dato og prøvene i samme rutenett.
import { useEffect, useState } from 'preact/hooks';
import { useTekst, useTilstand } from '../../../app/tilstand.ts';
import { Begrepstekst } from '../../../components/Begrepstekst.tsx';
import { Sidetopp } from '../../../components/Sidetopp.tsx';
import { oversiktsid } from '../../favoritter.ts';
import { Veiviserinnganger } from '../../../components/Veiviserinnganger.tsx';
import { velgSynlige } from '../../../core/innhold/status.ts';
import { Ikon } from '../../../components/Ikon.tsx';
import { nesteFrist, tidspunkt } from '../../../core/tidslinje.ts';
import { lastEksamensdatoer } from '../../../data/eksamen.ts';
import { iDag, skolearFor } from '../../../data/skolear.ts';
import { medEksamensdatoer } from '../eksamen/datoer.ts';
import type { Eksamensdatoer } from '../eksamen/skjema.ts';
import { hentInnhold, UNDERSIDER, veiviserRute, type Vurderingsinnhold } from '../innhold.ts';
import { Inngang } from './Inngang.tsx';

/** Veiviseren for klage står under «Eksamen og klage», de andre under «Vurdering i fag». */
const KLAGE = 'klage-pa-karakter';

export default function Oversikt() {
  const { t, malform } = useTekst();
  const { innstillinger } = useTilstand();
  const [innhold, settInnhold] = useState<Vurderingsinnhold | null>(null);
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
  const neste = nesteFrist(frister.filter((f) => f.aar || f.regel?.type === 'arlig'), idag);
  return (
    <div class="side">
      <Sidetopp tittel={t('vurdering.tittel')} favoritt={oversiktsid('vurdering')} />
      <p class="ingress">
        <Begrepstekst tekst={t('vurdering.innledning')} />
      </p>
      <section class="lop-del" aria-labelledby="vu-del-fag">
        <h2 class="liten-overskrift" id="vu-del-fag">
          {t('vurdering.delFag')}
        </h2>
        {innhold === null ? (
          <p class="dempet">{t('app.lasterInn')}</p>
        ) : (
          // Kortet for underveis- og sluttvurdering står i samme rutenett som veiviseren, så de får lik bredde.
          <Veiviserinnganger
            veivisere={veivisere.filter((v) => v.id !== KLAGE)}
            rute={veiviserRute}
            foran={[
              {
                id: 'underveis',
                kort: <Inngang {...UNDERSIDER.underveisSlutt} tittel={t('vurdering.underveisSlutt.kort')} tekst={t('vurdering.underveisSlutt.beskrivelse')} />,
              },
            ]}
          />
        )}
      </section>
      <section class="lop-del" aria-labelledby="vu-del-fravaer">
        <h2 class="liten-overskrift" id="vu-del-fravaer">
          {t('vurdering.delFravaer')}
        </h2>
        <Inngang {...UNDERSIDER.fravaer} tittel={t('vurdering.fravaer.kort')} tekst={t('vurdering.fravaer.beskrivelse')} />
      </section>
      <section class="lop-del" aria-labelledby="vu-del-eksamen">
        <h2 class="liten-overskrift" id="vu-del-eksamen">
          {t('vurdering.delEksamen')}
        </h2>
        {innhold !== null && (
          <Veiviserinnganger
            veivisere={veivisere.filter((v) => v.id === KLAGE)}
            rute={veiviserRute}
            foran={[
              { id: 'eksamen', kort: <Inngang {...UNDERSIDER.eksamen} tittel={t('vurdering.eksamen.kort')} tekst={t('vurdering.eksamen.beskrivelse')} /> },
            ]}
          />
        )}
        {innhold !== null && (
          <ul class="veiviser-innganger">
            <li>
              {/* Kortet viser den neste datoen, så brukeren ser hva som kommer uten å åpne tidslinjen. */}
              <a class="frist-inngang" href={`#${UNDERSIDER.frister.rute}`}>
                <span class="frist-inngang-tittel">
                  <Ikon navn={UNDERSIDER.frister.ikon} />
                  {t('vurdering.frister.tittel')}
                </span>
                {neste ? (
                  <span class="frist-inngang-neste">
                    <span class="frist-inngang-etikett">{t('vurdering.frister.neste')}</span>
                    <span class="frist-inngang-tid">{tidspunkt(neste, malform)}</span>
                    <span>{neste.tittel[malform]}</span>
                  </span>
                ) : (
                  <span class="frist-inngang-neste">{t('vurdering.frister.beskrivelse')}</span>
                )}
                <Ikon navn="hoyre" class="frist-inngang-pil" />
              </a>
            </li>
            <li>
              <Inngang {...UNDERSIDER.provene} tittel={t('vurdering.provene.kort')} tekst={t('vurdering.provene.beskrivelse')} />
            </li>
          </ul>
        )}
      </section>
      <section class="lop-del" aria-labelledby="vu-del-orden">
        <h2 class="liten-overskrift" id="vu-del-orden">
          {t('vurdering.delOrden')}
        </h2>
        <Inngang {...UNDERSIDER.orden} tittel={t('vurdering.orden.kort')} tekst={t('vurdering.orden.beskrivelse')} />
      </section>
    </div>
  );
}
