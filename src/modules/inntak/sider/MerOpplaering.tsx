// Mer opplæring (fase 6, pakke 7): retten til mer opplæring i fag som ikke er bestått (opplæringsforskrifta § 5-2) og
// etter fag- eller svenneprøven, med fristen, vedtaket, vurderingen, voksne og elever med individuelt tilrettelagt
// opplæring. Kortene står i content/inntak/mer-opplaering.yaml, med prefiks etter delen på siden. Samme byggeklosser
// som sidene i Vurdering: sammenligningen, stien og boksen med tabell.
// Overskriftene kan lukkes (Seksjon, eier 06.10.2026), så siden ikke blir lang: «Hvem har rett?» og gangen er åpne,
// resten viser titlene på kortene til brukeren åpner dem.
// `?del=<id>` åpner delen og kortet og ruller dit, så Tilrettelegging, Vurdering og veiviseren kan lenke rett til det.
import { useEffect, useState } from 'preact/hooks';
import { useTekst } from '../../../app/tilstand.ts';
import { Brodsmuler } from '../../../components/Brodsmuler.tsx';
import { Innholdskort } from '../../../components/Innholdskort.tsx';
import { Samleboks } from '../../../components/Samleboks.tsx';
import { Sammenligning } from '../../../components/Sammenligning.tsx';
import { Seksjon } from '../../../components/Seksjon.tsx';
import { Sidetopp } from '../../../components/Sidetopp.tsx';
import { Sti } from '../../../components/Sti.tsx';
import { ToKolonner } from '../../../components/ToKolonner.tsx';
import { kalenderLenke } from '../../kalender/adresse.ts';
import type { SideProps } from '../../typer.ts';
import { Inngang } from '../../vurdering/sider/Inngang.tsx';
import { type Forklaringselement, hentInnhold, medPrefiks, veiviserRute } from '../innhold.ts';

/** Delene av siden med vanlige kort, i rekkefølgen de står. Retten og fag- eller svenneprøven står i venstre kolonne. */
const DELER = [
  { prefiks: 'mo-retten-', overskrift: 'inntak.merOpplaering.retten', kolonne: 'hoved' },
  { prefiks: 'mo-fagprove', overskrift: 'inntak.merOpplaering.fagprove', kolonne: 'hoved' },
  { prefiks: 'mo-vurdering-', overskrift: 'inntak.merOpplaering.vurdering', kolonne: 'side' },
  { prefiks: 'mo-voksne-', overskrift: 'inntak.merOpplaering.voksne', kolonne: 'side' },
  { prefiks: 'mo-iop-', overskrift: 'inntak.merOpplaering.iop', kolonne: 'side' },
] as const;

export default function MerOpplaering({ sporring }: SideProps) {
  const { t, malform } = useTekst();
  const [innhold, settInnhold] = useState<Forklaringselement[] | null>(null);
  useEffect(() => {
    void hentInnhold().then((i) => settInnhold(i.forklaringer));
  }, []);
  const del = sporring.get('del');
  useEffect(() => {
    if (innhold && del) document.getElementById(del)?.scrollIntoView({ block: 'start' });
  }, [innhold, del]);
  const alle = innhold ?? [];
  const rader = medPrefiks(alle, 'mo-rad-');
  const stisteg = medPrefiks(alle, 'mo-sti-');
  const steg = stisteg.map((e) => ({ element: e, naar: e.naar ? [e.naar[malform]] : [], aapen: del === e.id }));
  /** Titlene på kortene, til linjen under en lukket overskrift. */
  const titler = (kort: readonly Forklaringselement[]) => kort.map((e) => e.tittel[malform]).join(' · ');
  const harDel = (kort: readonly Forklaringselement[]) => del !== null && kort.some((e) => e.id === del);

  const kortdel = (kolonne: 'hoved' | 'side') =>
    DELER.filter((d) => d.kolonne === kolonne).map(({ prefiks, overskrift }) => {
      const kort = medPrefiks(alle, prefiks);
      if (kort.length === 0) return null;
      return (
        <Seksjon key={prefiks} id={prefiks} tittel={t(overskrift)} innhold={titler(kort)} tvingApen={harDel(kort)}>
          {kort.map((e) =>
            e.tabell ? <Samleboks key={e.id} element={e} tabell={e.tabell} aapen={del === e.id} /> : <Innholdskort key={e.id} element={e} aapen={del === e.id} />,
          )}
        </Seksjon>
      );
    });

  return (
    <div class="side side-bred">
      <Brodsmuler ledd={[{ tekst: t('inntak.tittel'), href: '#/inntak' }]} />
      <Sidetopp tittel={t('inntak.merOpplaering.tittel')} favoritt="inntak:mer-opplaering" />
      <p class="ingress">{t('inntak.merOpplaering.innledning')}</p>
      {innhold === null ? (
        <p class="dempet">{t('app.lasterInn')}</p>
      ) : (
        // På skrivebord: retten og gangen til venstre, de egne reglene og «Videre» til høyre (fra 64rem).
        <ToKolonner
          hoved={
            <>
              <Seksjon id="mo-rad" tittel={t('inntak.merOpplaering.hvem')} innhold={titler(rader)} apen tvingApen={harDel(rader)}>
                {/* Regelverket og kildene til radene står nederst i boksen med tabellen (avgjørelse 071). */}
                <Sammenligning
                  tittel={t('inntak.merOpplaering.hvem')}
                  venstre={t('inntak.merOpplaering.venstre')}
                  hoyre={t('inntak.merOpplaering.hoyre')}
                  rader={rader.flatMap((r) => (r.sammenligning ? [{ id: r.id, tittel: r.tittel, venstre: r.sammenligning.venstre, hoyre: r.sammenligning.hoyre }] : []))}
                  kilder={rader.flatMap((r) => r.kilder)}
                  nokkel="mo-rad"
                />
              </Seksjon>
              {kortdel('hoved')[0]}
              <Seksjon id="mo-sti" tittel={t('inntak.merOpplaering.gangen')} innhold={titler(stisteg)} apen tvingApen={harDel(stisteg)}>
                <Sti steg={steg} etikett={t('inntak.merOpplaering.gangen')} />
              </Seksjon>
              {kortdel('hoved').slice(1)}
            </>
          }
          side={
            <>
              {kortdel('side')}
              <section>
                <h2 class="liten-overskrift">{t('inntak.merOpplaering.videre')}</h2>
                <ul class="vu-videre">
                  <li>
                    <Inngang rute={kalenderLenke('inntak')} ikon="kalender" tittel={t('inntak.merOpplaering.fristen')} tekst={t('inntak.merOpplaering.fristenTekst')} />
                  </li>
                  <li>
                    <Inngang rute={veiviserRute('rett-inntak-soknad')} ikon="veiviser" tittel={t('inntak.merOpplaering.veiviser')} tekst={t('inntak.merOpplaering.veiviserTekst')} />
                  </li>
                  <li>
                    <Inngang rute="/vurdering/eksamen?del=ek-utsatt-ny-sarskilt" ikon="vurdering" tittel={t('inntak.merOpplaering.eksamen')} tekst={t('inntak.merOpplaering.eksamenTekst')} />
                  </li>
                  <li>
                    <Inngang rute="/opplaeringslop/laerlinger-og-kandidater?fane=bytte&fra=prove-ikke-bestatt" ikon="vei" tittel={t('inntak.merOpplaering.laerlinger')} tekst={t('inntak.merOpplaering.laerlingerTekst')} />
                  </li>
                </ul>
              </section>
            </>
          }
        />
      )}
    </div>
  );
}
