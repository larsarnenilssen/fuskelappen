// Oversikten i Vurdering: delene som kort, som i Inntak og Opplæringstilbud (fase 6, mockup godkjent av eier
// 04.10.2026). Kalkulatoren for fraværsgrensen står til høyre under veiviseren (eier 08.10.2026). Eksamen og klage er egen modul
// (avgjørelse 078).
import { useEffect, useState } from 'preact/hooks';
import { useTekst, useTilstand } from '../../../app/tilstand.ts';
import { Begrepstekst } from '../../../components/Begrepstekst.tsx';
import { Sidetopp } from '../../../components/Sidetopp.tsx';
import { ToKolonner } from '../../../components/ToKolonner.tsx';
import { oversiktsid } from '../../favoritter.ts';
import { veiviseroverskrift, Veiviserinnganger } from '../../../components/Veiviserinnganger.tsx';
import { velgSynlige } from '../../../core/innhold/status.ts';
import { hentInnhold, UNDERSIDER, veiviserRute, type Vurderingsinnhold } from '../innhold.ts';
import { Inngang } from './Inngang.tsx';
import { Kalkulatorinngang } from '../../../components/Kalkulatorinngang.tsx';
import { Oversiktsdel } from '../../../components/Oversiktsdel.tsx';

export default function Oversikt() {
  const { t } = useTekst();
  const { innstillinger } = useTilstand();
  const [innhold, settInnhold] = useState<Vurderingsinnhold | null>(null);
  useEffect(() => {
    void hentInnhold().then(settInnhold);
  }, []);
  const sted = { fylke: innstillinger.fylke, skole: innstillinger.skole?.id ?? null };
  const veivisere = innhold ? velgSynlige(innhold.veivisere, sted) : [];
  return (
    <div class="side side-bred">
      <Sidetopp tittel={t('vurdering.tittel')} favoritt={oversiktsid('vurdering')} />
      <p class="ingress">
        <Begrepstekst tekst={t('vurdering.innledning')} />
      </p>
      {/* To kolonner på skrivebord (fase 8b, docs/DESIGN.md): sidene i modulen til venstre, veiviseren og kalkulatoren
          til høyre (eier 08.10.2026). */}
      <ToKolonner
        hoved={
          <>
            {/* Delene med én inngang står uten overskrift, som én liste (avgjørelse 100). */}
            <Oversiktsdel tittel={t('vurdering.delFag')} antall={1}>
              <Inngang {...UNDERSIDER.underveisSlutt} tittel={t('vurdering.underveisSlutt.kort')} tekst={t('vurdering.underveisSlutt.beskrivelse')} />
            </Oversiktsdel>
            <Oversiktsdel tittel={t('vurdering.delOrden')} antall={1}>
              <Inngang {...UNDERSIDER.orden} tittel={t('vurdering.orden.kort')} tekst={t('vurdering.orden.beskrivelse')} />
            </Oversiktsdel>
          </>
        }
        side={
          <>
            <Oversiktsdel tittel={t(veiviseroverskrift(veivisere.length))} antall={veivisere.length}>
              {innhold === null ? <p class="dempet">{t('app.lasterInn')}</p> : <Veiviserinnganger veivisere={veivisere} rute={veiviserRute} />}
            </Oversiktsdel>
            <Oversiktsdel tittel={t('felles.kalkulator')} antall={1}>
              <Kalkulatorinngang
                href={`#${UNDERSIDER.fravaer.rute}`}
                ikon={UNDERSIDER.fravaer.ikon}
                tittel={t('vurdering.fravaer.kort')}
                inn={[t('vurdering.fravaer.faget'), t('vurdering.fravaer.okter')]}
                ut={t('vurdering.fravaer.resultat.tittel')}
              />
            </Oversiktsdel>
          </>
        }
      />
    </div>
  );
}
