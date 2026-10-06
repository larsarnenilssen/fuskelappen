// Siden «Fag- og svenneprøven og de andre prøvene» (fase 6, pakke 3, eier 04.10.2026): prøvene som sluttvurdering for
// lærlinger og kandidater, med samme oppsett som siden «Eksamen»: blå bokser øverst for prøvene, stien fra krav til
// resultat, det som gjelder hele veien, og ny og utsatt prøve samlet i én boks. Kortene står i
// content/eksamen/proevene.yaml. Veiene fram til prøven står i Opplæringstilbud («Lærlinger og
// kandidater»), og «Veiene hit» lenker dit.
import { useEffect, useState } from 'preact/hooks';
import { useTekst } from '../../../app/tilstand.ts';
import { Brodsmuler } from '../../../components/Brodsmuler.tsx';
import { FavorittKnapp } from '../../../components/FavorittKnapp.tsx';
import { Ikon } from '../../../components/Ikon.tsx';
import { Innholdskort } from '../../../components/Innholdskort.tsx';
import { Samleboks } from '../../../components/Samleboks.tsx';
import { Sti } from '../../../components/Sti.tsx';
import { Tabell } from '../../../components/Tabell.tsx';
import { ToKolonner } from '../../../components/ToKolonner.tsx';
import { type Forklaringselement, hentInnhold, klageRute, UDIR_PROVER, UNDERSIDER } from '../innhold.ts';
import { Inngang } from '../../vurdering/sider/Inngang.tsx';
import { kalenderLenke } from '../../kalender/adresse.ts';
import { VeieneHit } from '../../opplaeringslop/sider/VeieneHit.tsx';

const STI = ['pr-krav', 'pr-oppmelding', 'pr-provenemnda', 'pr-vurdering', 'pr-klage'];
const HELE_VEIEN = ['pr-tilrettelegging', 'pr-bortvisning'];

export default function Provene() {
  const { t, malform } = useTekst();
  const [innhold, settInnhold] = useState<Forklaringselement[] | null>(null);
  useEffect(() => {
    void hentInnhold().then((i) => settInnhold(i.forklaringer));
  }, []);
  const finn = (id: string) => innhold?.find((e) => e.id === id);
  const hva = finn('pr-hva');
  const nyUtsatt = finn('pr-ny-utsatt');
  const steg = STI.flatMap((id) => {
    const e = finn(id);
    return e ? [{ element: e, naar: e.naar ? [e.naar[malform]] : [] }] : [];
  });
  return (
    <div class="side side-bred">
      <Brodsmuler ledd={[{ tekst: t('eksamen.tittel'), href: '#/eksamen' }]} />
      <div class="tittelrad">
        <h1 tabIndex={-1}>{t('eksamen.provene.tittel')}</h1>
        <FavorittKnapp id="eksamen:fag-og-svenneproven" navn={t('eksamen.provene.tittel')} />
      </div>
      <p class="ingress">{t('eksamen.provene.innledning')}</p>
      {innhold === null ? (
        <p class="dempet">{t('app.lasterInn')}</p>
      ) : (
        // På skrivebord (fra 64rem): prøvene og gangen til venstre, og det som gjelder hele veien, prøven som ikke er
        // bestått og «Videre» til høyre (eier 06.10.2026). På mobil står delene i samme rekkefølge som før.
        <ToKolonner
          hoved={
            <>
              {hva && (
                <section>
                  <h2 class="liten-overskrift">{t('eksamen.provene.prover')}</h2>
                  {hva.tabell && <Tabell tabell={hva.tabell} tittel={hva.tittel} />}
                  <Innholdskort element={hva} />
                  {/* «Veiene hit»: lenker tilbake til hver vei i Opplæringstilbud (fase 6, pakke 6, eier 06.10.2026). */}
                  <VeieneHit />
                </section>
              )}
              <section>
                <h2 class="liten-overskrift">{t('eksamen.provene.gangen')}</h2>
                <Sti steg={steg} etikett={t('eksamen.provene.gangen')} />
              </section>
            </>
          }
          side={
            <>
              <section>
                <h2 class="liten-overskrift">{t('eksamen.provene.heleVeien')}</h2>
                {HELE_VEIEN.map((id) => {
                  const e = finn(id);
                  return e ? <Innholdskort key={id} element={e} /> : null;
                })}
              </section>
              {nyUtsatt && (
                <section>
                  <h2 class="liten-overskrift">{t('eksamen.provene.ikkeBestatt')}</h2>
                  <Samleboks element={nyUtsatt} tabell={nyUtsatt.tabell} />
                  <ul class="vu-videre">
                    <li>
                      <Inngang rute="/inntak/mer-opplaering?del=mo-fagprove" ikon="igjen" tittel={t('eksamen.provene.merOpplaering')} tekst={t('eksamen.provene.merOpplaeringTekst')} />
                    </li>
                  </ul>
                </section>
              )}
              <section>
                <h2 class="liten-overskrift">{t('eksamen.provene.videre')}</h2>
                <ul class="vu-videre">
                  <li>
                    <Inngang rute={`${klageRute}?steg=kl-prove&svar=prove`} ikon="veiviser" tittel={t('eksamen.klage.kort')} tekst={t('eksamen.provene.klageTekst')} />
                  </li>
                  <li>
                    <Inngang {...UNDERSIDER.frister} rute={kalenderLenke('eksamen', 'laerlinger')} tittel={t('eksamen.frister.tittel')} tekst={t('eksamen.frister.beskrivelse')} />
                  </li>
                  <li>
                    <Inngang {...UNDERSIDER.eksamen} tittel={t('eksamen.eksamen.kort')} tekst={t('eksamen.eksamen.beskrivelse')} />
                  </li>
                  <li>
                    <Inngang rute="/opplaeringslop/opplaeringskontor" ikon="kontor" tittel={t('eksamen.provene.opplaeringskontor')} tekst={t('eksamen.provene.iOpplaeringstilbud')} />
                  </li>
                </ul>
                <p>
                  <a class="ekstern-lenke" href={UDIR_PROVER} target="_blank" rel="noopener noreferrer">
                    {t('eksamen.provene.udir')}
                    <Ikon navn="ekstern" class="ikon-liten" />
                  </a>
                </p>
              </section>
            </>
          }
        />
      )}
    </div>
  );
}
