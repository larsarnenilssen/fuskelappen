// Oversikten «Eksamen» (fase 6, pakke 3, godkjent av eier 04.10.2026). Samme oppsett som siden om prøvene: blå bokser
// øverst (antall eksamener per trinn), stien fra oppmelding til karakter med datoene fra eksamensdatoene, det som
// gjelder hele veien, og utsatt, ny og særskilt eksamen samlet i én boks. Kortene står i
// content/eksamen/eksamen.yaml. Vestland vises bare når Vestland er valgt.
// `?del=<id>` åpner et kort og ruller dit, så veiviserne og Tilrettelegging kan lenke rett til det.
import { useEffect, useState } from 'preact/hooks';
import { fylkesnavn } from '../../../app/Stedmerknad.tsx';
import { useTekst, useTilstand } from '../../../app/tilstand.ts';
import { Brodsmuler } from '../../../components/Brodsmuler.tsx';
import { FavorittKnapp } from '../../../components/FavorittKnapp.tsx';
import { Ikon } from '../../../components/Ikon.tsx';
import { Innholdskort } from '../../../components/Innholdskort.tsx';
import { Samleboks } from '../../../components/Samleboks.tsx';
import { Sti } from '../../../components/Sti.tsx';
import { Tabell } from '../../../components/Tabell.tsx';
import { ToKolonner } from '../../../components/ToKolonner.tsx';
import { velgSynlige } from '../../../core/innhold/status.ts';
import { lastEksamensdatoer } from '../../../data/eksamen.ts';
import { iDag, skolearFor } from '../../../data/skolear.ts';
import type { SideProps } from '../../typer.ts';
import { stidatoer } from '../eksamensdatoer/datoer.ts';
import type { Eksamensdatoer } from '../eksamensdatoer/skjema.ts';
import { type Forklaringselement, hentInnhold, klageRute, medPrefiks, UNDERSIDER } from '../innhold.ts';
import { Inngang } from '../../vurdering/sider/Inngang.tsx';

/** Stegene fra oppmelding til karakter, med feltet i eksamensdatoene som gir datoene til steget. */
const STI: readonly { id: string; felt?: string }[] = [
  { id: 'ek-oppmelding', felt: 'skoler-oppmelding' },
  { id: 'ek-trekket', felt: 'trekk' },
  { id: 'ek-forberedelse' },
  { id: 'ek-gjennomforing', felt: 'eksamen' },
  { id: 'ek-sensur', felt: 'sensur' },
  { id: 'ek-klage' },
];
const HELE_VEIEN = ['ek-sentralt-lokalt', 'ek-tilrettelegging', 'ek-bortvisning'];

export default function Eksamen({ sporring }: SideProps) {
  const { t, malform } = useTekst();
  const { innstillinger } = useTilstand();
  const [innhold, settInnhold] = useState<Forklaringselement[] | null>(null);
  const [datoer, settDatoer] = useState<Eksamensdatoer | null>(null);
  useEffect(() => {
    void hentInnhold().then((i) => settInnhold(i.forklaringer));
    lastEksamensdatoer().then(settDatoer, () => settDatoer(null));
  }, []);
  const del = sporring.get('del');
  useEffect(() => {
    if (innhold && del) document.getElementById(del)?.scrollIntoView({ block: 'start' });
  }, [innhold, del]);
  const sted = { fylke: innstillinger.fylke, skole: innstillinger.skole?.id ?? null };
  const alle = innhold ? velgSynlige(medPrefiks(innhold, 'ek-'), sted) : [];
  const finn = (id: string) => alle.find((e) => e.id === id && e.gyldighet.niva === 'nasjonal');
  const skolear = Number(skolearFor(iDag()).slice(0, 4));
  const trekk = finn('ek-trekk');
  const utsatt = finn('ek-utsatt-ny-sarskilt');
  const lokale = alle.filter((e) => e.gyldighet.niva !== 'nasjonal');
  const etiketter = { host: t('eksamen.eksamen.host'), var: t('eksamen.eksamen.var') };
  const steg = STI.flatMap(({ id, felt }) => {
    const e = finn(id);
    if (!e) return [];
    const fraData = felt ? stidatoer(datoer, felt, skolear, malform, etiketter) : [];
    return [{ element: e, naar: fraData.length > 0 ? fraData : e.naar ? [e.naar[malform]] : [], aapen: del === id }];
  });

  return (
    <div class="side side-bred">
      <Brodsmuler ledd={[{ tekst: t('eksamen.tittel'), href: '#/eksamen' }]} />
      <div class="tittelrad">
        <h1 tabIndex={-1}>{t('eksamen.eksamen.tittel')}</h1>
        <FavorittKnapp id="eksamen:eksamen" navn={t('eksamen.eksamen.tittel')} />
      </div>
      <p class="ingress">{t('eksamen.eksamen.innledning')}</p>
      {innhold === null ? (
        <p class="dempet">{t('app.lasterInn')}</p>
      ) : (
        // På skrivebord (fra 64rem): antallet og gangen til venstre, og det som gjelder hele veien, eksamen som ikke er
        // bestått og «Videre» til høyre (eier 06.10.2026). På mobil står delene i samme rekkefølge som før.
        <ToKolonner
          hoved={
            <>
              {trekk && (
                <section>
                  <h2 class="liten-overskrift">{t('eksamen.eksamen.antall')}</h2>
                  {trekk.tabell && <Tabell tabell={trekk.tabell} tittel={trekk.tittel} />}
                  <Innholdskort element={trekk} aapen={del === trekk.id} />
                </section>
              )}
              <section>
                <h2 class="liten-overskrift">{t('eksamen.eksamen.gangen')}</h2>
                <Sti steg={steg} etikett={t('eksamen.eksamen.gangen')} />
              </section>
            </>
          }
          side={
            <>
              <section>
                <h2 class="liten-overskrift">{t('eksamen.eksamen.heleVeien')}</h2>
                {HELE_VEIEN.map((id) => {
                  const e = finn(id);
                  return e ? <Innholdskort key={id} element={e} aapen={del === id} /> : null;
                })}
                {lokale.map((k) => (
                  <div key={k.id} class="lokalkort">
                    {k.gyldighet.niva !== 'nasjonal' && <p class="lokalkort-sted">{t('eksamen.eksamen.iFylket', { fylke: fylkesnavn(k.gyldighet.fylke) ?? k.gyldighet.fylke })}</p>}
                    <Innholdskort element={k} aapen={del === k.id} />
                  </div>
                ))}
              </section>
              {utsatt && (
                <section>
                  <h2 class="liten-overskrift">{t('eksamen.eksamen.ikkeBestatt')}</h2>
                  <Samleboks element={utsatt} tabell={utsatt.tabell} aapen={del === utsatt.id} />
                  <ul class="vu-videre">
                    <li>
                      <Inngang rute="/inntak/mer-opplaering" ikon="igjen" tittel={t('eksamen.eksamen.merOpplaering')} tekst={t('eksamen.eksamen.merOpplaeringTekst')} />
                    </li>
                  </ul>
                </section>
              )}
              <section>
                <h2 class="liten-overskrift">{t('eksamen.eksamen.videre')}</h2>
                <ul class="vu-videre">
                  <li>
                    <Inngang rute={klageRute} ikon="veiviser" tittel={t('eksamen.klage.kort')} tekst={t('eksamen.klage.beskrivelse')} />
                  </li>
                  <li>
                    <Inngang {...UNDERSIDER.frister} tittel={t('eksamen.frister.tittel')} tekst={t('eksamen.frister.beskrivelse')} />
                  </li>
                  <li>
                    <Inngang {...UNDERSIDER.provene} tittel={t('eksamen.provene.kort')} tekst={t('eksamen.provene.beskrivelse')} />
                  </li>
                </ul>
                <p class="dempet liten">
                  <Ikon navn="info" class="ikon-liten" /> {t('eksamen.eksamen.fagarket')}
                </p>
              </section>
            </>
          }
        />
      )}
    </div>
  );
}
