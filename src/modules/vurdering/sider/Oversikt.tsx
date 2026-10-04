// Oversikten i Vurdering: delene som kort, som i Inntak og Opplæringstilbud (fase 6, mockup godkjent av eier
// 04.10.2026). Fravær, eksamen og klage kommer som egne deler i de neste pakkene.
import { useEffect, useState } from 'preact/hooks';
import { useTekst, useTilstand } from '../../../app/tilstand.ts';
import { Begrepstekst } from '../../../components/Begrepstekst.tsx';
import { Ikon, type Ikonnavn } from '../../../components/Ikon.tsx';
import { Veiviserinnganger } from '../../../components/Veiviserinnganger.tsx';
import { velgSynlige } from '../../../core/innhold/status.ts';
import { hentInnhold, ordenRute, underveisSluttRute, veiviserRute, type Vurderingsinnhold } from '../innhold.ts';

function Inngang({ rute, ikon, tittel, tekst }: { rute: string; ikon: Ikonnavn; tittel: string; tekst: string }) {
  return (
    <a class="frist-inngang" href={`#${rute}`}>
      <span class="frist-inngang-tittel">
        <Ikon navn={ikon} />
        {tittel}
      </span>
      <span class="frist-inngang-neste">{tekst}</span>
      <Ikon navn="hoyre" class="frist-inngang-pil" />
    </a>
  );
}

export default function Oversikt() {
  const { t } = useTekst();
  const { innstillinger } = useTilstand();
  const [innhold, settInnhold] = useState<Vurderingsinnhold | null>(null);
  useEffect(() => {
    void hentInnhold().then(settInnhold);
  }, []);
  const sted = { fylke: innstillinger.fylke, skole: innstillinger.skole?.id ?? null };
  return (
    <div class="side">
      <h1 tabIndex={-1}>{t('vurdering.tittel')}</h1>
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
            veivisere={velgSynlige(innhold.veivisere, sted)}
            rute={veiviserRute}
            foran={[
              {
                id: 'underveis',
                kort: <Inngang rute={underveisSluttRute} ikon="bok" tittel={t('vurdering.underveisSlutt.kort')} tekst={t('vurdering.underveisSlutt.beskrivelse')} />,
              },
            ]}
          />
        )}
      </section>
      <section class="lop-del" aria-labelledby="vu-del-orden">
        <h2 class="liten-overskrift" id="vu-del-orden">
          {t('vurdering.delOrden')}
        </h2>
        <Inngang rute={ordenRute} ikon="person" tittel={t('vurdering.orden.kort')} tekst={t('vurdering.orden.beskrivelse')} />
      </section>
    </div>
  );
}
