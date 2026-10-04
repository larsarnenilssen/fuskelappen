// Oversikten «Eksamen» (fase 6, pakke 3, godkjent i forslaget av eier 04.10.2026): rutenettet med antall eksamener
// per trinn, kortene fra oppmelding til sensur, særskilt tilrettelegging, og utsatt, ny og særskilt eksamen som kort
// side om side. Kortene står i content/vurdering/eksamen.yaml. Vestland vises bare når Vestland er valgt.
// `?del=<id>` åpner et kort og ruller dit, så veiviserne og Tilrettelegging kan lenke rett til det.
import { useEffect, useState } from 'preact/hooks';
import { fylkesnavn } from '../../../app/Stedmerknad.tsx';
import { useTekst, useTilstand } from '../../../app/tilstand.ts';
import { Brodsmuler } from '../../../components/Brodsmuler.tsx';
import { FavorittKnapp } from '../../../components/FavorittKnapp.tsx';
import { Ikon } from '../../../components/Ikon.tsx';
import { Innholdskort } from '../../../components/Innholdskort.tsx';
import { Tabell } from '../../../components/Tabell.tsx';
import { velgSynlige } from '../../../core/innhold/status.ts';
import type { SideProps } from '../../typer.ts';
import { type Forklaringselement, hentInnhold, klageRute, medPrefiks, UNDERSIDER } from '../innhold.ts';
import { Inngang } from './Inngang.tsx';

const GANGEN = ['ek-sentralt-lokalt', 'ek-oppmelding', 'ek-gjennomforing', 'ek-sensur', 'ek-bortvisning'];

export default function Eksamen({ sporring }: SideProps) {
  const { t } = useTekst();
  const { innstillinger } = useTilstand();
  const [innhold, settInnhold] = useState<Forklaringselement[] | null>(null);
  useEffect(() => {
    void hentInnhold().then((i) => settInnhold(i.forklaringer));
  }, []);
  const del = sporring.get('del');
  useEffect(() => {
    if (innhold && del) document.getElementById(del)?.scrollIntoView({ block: 'start' });
  }, [innhold, del]);
  const sted = { fylke: innstillinger.fylke, skole: innstillinger.skole?.id ?? null };
  const alle = innhold ? velgSynlige(medPrefiks(innhold, 'ek-'), sted) : [];
  const finn = (id: string) => alle.find((e) => e.id === id && e.gyldighet.niva === 'nasjonal');
  const kort = (id: string) => {
    const e = finn(id);
    return e ? <Innholdskort key={e.id} element={e} aapen={del === e.id} /> : null;
  };
  const trekk = finn('ek-trekk');
  const utsatt = finn('ek-utsatt-ny-sarskilt');
  const lokale = alle.filter((e) => e.gyldighet.niva !== 'nasjonal');

  return (
    <div class="side">
      <Brodsmuler ledd={[{ tekst: t('vurdering.tittel'), href: '#/vurdering' }]} />
      <div class="tittelrad">
        <h1 tabIndex={-1}>{t('vurdering.eksamen.tittel')}</h1>
        <FavorittKnapp id="vurdering:eksamen" navn={t('vurdering.eksamen.tittel')} />
      </div>
      <p class="ingress">{t('vurdering.eksamen.innledning')}</p>
      {innhold === null ? (
        <p class="dempet">{t('app.lasterInn')}</p>
      ) : (
        <>
          {trekk && (
            <section>
              <h2 class="liten-overskrift">{t('vurdering.eksamen.antall')}</h2>
              {trekk.tabell && <Tabell tabell={trekk.tabell} tittel={trekk.tittel} />}
              <Innholdskort element={trekk} aapen={del === trekk.id} />
            </section>
          )}
          <section>
            <h2 class="liten-overskrift">{t('vurdering.eksamen.gangen')}</h2>
            {GANGEN.map(kort)}
            {lokale.map((k) => (
              <div key={k.id} class="lokalkort">
                {k.gyldighet.niva !== 'nasjonal' && <p class="lokalkort-sted">{t('vurdering.eksamen.iFylket', { fylke: fylkesnavn(k.gyldighet.fylke) ?? k.gyldighet.fylke })}</p>}
                <Innholdskort element={k} aapen={del === k.id} />
              </div>
            ))}
          </section>
          <section>
            <h2 class="liten-overskrift">{t('vurdering.eksamen.tilrettelegging')}</h2>
            {kort('ek-tilrettelegging')}
          </section>
          {utsatt && (
            <section>
              <h2 class="liten-overskrift">{t('vurdering.eksamen.ikkeBestatt')}</h2>
              {utsatt.tabell && <Tabell tabell={utsatt.tabell} tittel={utsatt.tittel} />}
              <Innholdskort element={utsatt} aapen={del === utsatt.id} />
            </section>
          )}
          <section>
            <h2 class="liten-overskrift">{t('vurdering.eksamen.videre')}</h2>
            <ul class="vu-videre">
              <li>
                <Inngang rute={klageRute} ikon="veiviser" tittel={t('vurdering.klage.kort')} tekst={t('vurdering.klage.beskrivelse')} />
              </li>
              <li>
                <Inngang {...UNDERSIDER.frister} tittel={t('vurdering.frister.tittel')} tekst={t('vurdering.frister.beskrivelse')} />
              </li>
              <li>
                <Inngang {...UNDERSIDER.provene} tittel={t('vurdering.provene.kort')} tekst={t('vurdering.provene.beskrivelse')} />
              </li>
            </ul>
            <p class="dempet liten">
              <Ikon navn="info" class="ikon-liten" /> {t('vurdering.eksamen.fagarket')}
            </p>
          </section>
        </>
      )}
    </div>
  );
}
