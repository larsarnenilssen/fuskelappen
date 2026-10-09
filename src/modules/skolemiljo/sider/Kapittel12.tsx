// Et trygt og godt skolemiljø (fase 7, eier 06.10.2026): opplæringslova kapittel 12 som egen side i Skolemiljø.
// Kapittelet står i fem nummererte deler som er lukket fra start (eier 06.10.2026), så hele kapittelet får plass på
// skjermen: hver del viser tittelen, paragrafene og én setning, og åpnes med et trykk. Inni står kortene med egne ord
// (content/skolemiljo/kapittel-12.yaml). Aktivitetsplikten har de fem delpliktene som en rad, og statsforvalteren
// veien dit som en sti. Kortene om informasjon, meldepliktene og fysiske inngrep (kapittel 10, 13 og 24)
// og lenkene til veiviseren, skolereglene og Elevundersøkelsen står til høyre på skrivebord (avgjørelse 074).
// `?del=<id>` åpner delen eller kortet og ruller dit, som på siden om eksamen. Delene husker om de er åpne (avgjørelse 072).
import type { ComponentChildren } from 'preact';
import { useEffect, useId, useState } from 'preact/hooks';
import { useTekst } from '../../../app/tilstand.ts';
import { Brodsmuler } from '../../../components/Brodsmuler.tsx';
import { useHusketApen } from '../../../components/husket.ts';
import { Ikon } from '../../../components/Ikon.tsx';
import { Innholdskort } from '../../../components/Innholdskort.tsx';
import { Kildeboks } from '../../../components/Kildeboks.tsx';
import { Sidetopp } from '../../../components/Sidetopp.tsx';
import { ToKolonner } from '../../../components/ToKolonner.tsx';
import type { Tekstnokkel } from '../../../core/i18n/tekst.ts';
import { ELEVUNDERSOKELSEN_RUTE } from '../../elevundersokelsen/adresse.ts';
import { paragrafRute } from '../../lov/data.ts';
import type { SideProps } from '../../typer.ts';
import { Inngang } from '../../vurdering/sider/Inngang.tsx';
import { type Forklaringselement, hentInnhold, medPrefiks, UNDERSIDER, veiviserRute } from '../innhold.ts';
// Stilene lastes med siden, ikke i startpakken.
import '../../../styles/skolemiljo.css';

/** De fem delene av kapittelet, med kortene i hver del. Den første id-en er kortet oversikten lenker til. */
const DELER = [
  { id: 'retten', kort: ['k12-hvem', 'k12-retten'] },
  { id: 'plikter', kort: ['k12-nulltoleranse', 'k12-forebygging', 'k12-aktivitetsplikt', 'k12-skjerpet'] },
  { id: 'statsforvalteren', kort: ['k12-statsforvalteren'] },
  { id: 'fysisk', kort: ['k12-fysisk'] },
  { id: 'ansvar', kort: ['k12-ansvar'] },
] as const;
const VED_SIDEN = ['k12-informasjon', 'k12-meldeplikter', 'k12-fysiske-inngrep'];
const DELPLIKTER = ['folgeMed', 'gripeInn', 'meldeFra', 'undersoke', 'tiltak'] as const;
const GANG = ['rektor', 'uke', 'melde', 'vedtak', 'klage'] as const;

/** En del av kapittelet: knappen viser nummer, tittel, paragrafer og én setning, og innholdet står under når den er åpen. */
function Kapitteldel({ id, nr, tittel, paragrafer, tekst, tvingApen, children }: { id: string; nr: number; tittel: string; paragrafer: string; tekst: string; tvingApen: boolean; children: ComponentChildren }) {
  const [apen, settApen] = useHusketApen(`k12-del:${id}`, false);
  const innholdId = useId();
  useEffect(() => {
    if (tvingApen) settApen(true);
  }, [tvingApen, settApen]);
  return (
    <section class={`k12-seksjon${apen ? ' k12-seksjon-apen' : ''}`} id={`k12-del-${id}`}>
      <h2 class="k12-seksjon-overskrift">
        <button type="button" class="k12-del-knapp" aria-expanded={apen} aria-controls={innholdId} onClick={() => settApen(!apen)}>
          <span class="k12-del-nr" aria-hidden="true">
            {nr}
          </span>
          <span class="k12-del-tittel">{tittel}</span>
          <span class="k12-del-paragrafer">{paragrafer}</span>
          <span class="k12-del-tekst">{tekst}</span>
          <Ikon navn={apen ? 'opp' : 'ned'} class="ikon-liten k12-del-pil" />
        </button>
      </h2>
      <div id={innholdId} class="k12-del-innhold" hidden={!apen}>
        {children}
      </div>
    </section>
  );
}

export default function Kapittel12({ sporring }: SideProps) {
  const { t } = useTekst();
  const [innhold, settInnhold] = useState<Forklaringselement[] | null>(null);
  useEffect(() => {
    void hentInnhold().then((i) => settInnhold(medPrefiks(i.forklaringer, 'k12-')));
  }, []);
  const del = sporring.get('del');
  useEffect(() => {
    if (innhold && del) document.getElementById(del)?.scrollIntoView({ block: 'start' });
  }, [innhold, del]);
  const finn = (id: string) => innhold?.find((e) => e.id === id);
  const kort = (id: string) => {
    const e = finn(id);
    return e ? <Innholdskort key={id} element={e} aapen={del === id} /> : null;
  };
  const delTittel = (id: string) => t(`skolemiljo.kapittel12.deler.${id}.tittel` as Tekstnokkel);

  return (
    <div class="side side-bred">
      <Brodsmuler ledd={[{ tekst: t('skolemiljo.tittel'), href: '#/skolemiljo' }]} />
      <Sidetopp tittel={t('skolemiljo.kapittel12.tittel')} favoritt="skolemiljo:kapittel-12" />
      <p class="ingress">{t('skolemiljo.kapittel12.innledning')}</p>
      {innhold === null ? (
        <p class="dempet">{t('app.lasterInn')}</p>
      ) : (
        <ToKolonner
          hoved={
            <>
              {DELER.map((d, i) => (
                <Kapitteldel
                  key={d.id}
                  id={d.id}
                  nr={i + 1}
                  tittel={delTittel(d.id)}
                  paragrafer={t(`skolemiljo.kapittel12.deler.${d.id}.paragrafer` as Tekstnokkel)}
                  tekst={t(`skolemiljo.kapittel12.deler.${d.id}.tekst` as Tekstnokkel)}
                  tvingApen={!!del && (del === `k12-del-${d.id}` || (d.kort as readonly string[]).includes(del))}
                >
                  {d.id === 'plikter' ? (
                    <>
                      {kort('k12-nulltoleranse')}
                      {kort('k12-forebygging')}
                      {/* De fem delpliktene i aktivitetsplikten som en rad, og dokumentasjonen under hele raden. */}
                      <figure class="k12-figur">
                        <figcaption class="k12-figur-tittel">{t('skolemiljo.kapittel12.delplikter')}</figcaption>
                        <ol class="k12-rekke">
                          {DELPLIKTER.map((p) => (
                            <li key={p}>{t(`skolemiljo.kapittel12.delplikt.${p}` as Tekstnokkel)}</li>
                          ))}
                        </ol>
                        <p class="k12-dokumentere">{t('skolemiljo.kapittel12.dokumentere')}</p>
                      </figure>
                      {kort('k12-aktivitetsplikt')}
                      {kort('k12-skjerpet')}
                    </>
                  ) : d.id === 'statsforvalteren' ? (
                    <>
                      <figure class="k12-figur">
                        <figcaption class="k12-figur-tittel">{t('skolemiljo.kapittel12.gangen')}</figcaption>
                        <ol class="k12-rekke k12-rekke-gang">
                          {GANG.map((g) => (
                            <li key={g}>{t(`skolemiljo.kapittel12.gang.${g}` as Tekstnokkel)}</li>
                          ))}
                        </ol>
                      </figure>
                      {d.kort.map(kort)}
                    </>
                  ) : (
                    d.kort.map(kort)
                  )}
                </Kapitteldel>
              ))}
              <p>
                <a href={`#${paragrafRute('opplaeringslova', '12-1')}`}>
                  <Ikon navn="paragraf" class="ikon-liten" /> {t('skolemiljo.kapittel12.lesKapittelet')}
                </a>
              </p>
            </>
          }
          side={
            <>
              <section>
                <h2 class="liten-overskrift">{t('skolemiljo.kapittel12.hengerSammen')}</h2>
                {VED_SIDEN.map(kort)}
                <ul class="vu-videre">
                  <li>
                    <Inngang rute={veiviserRute('aktivitetsplikten')} ikon="veiviser" tittel={t('skolemiljo.kapittel12.veiviser')} tekst={t('skolemiljo.kapittel12.veiviserTekst')} />
                  </li>
                  <li>
                    <Inngang {...UNDERSIDER.skoleregler} tittel={t('skolemiljo.kapittel12.skoleregler')} tekst={t('skolemiljo.kapittel12.skolereglerTekst')} />
                  </li>
                  <li>
                    <Inngang rute={ELEVUNDERSOKELSEN_RUTE} ikon="vurdering" tittel={t('skolemiljo.kapittel12.elevundersokelsen')} tekst={t('skolemiljo.kapittel12.elevundersokelsenTekst')} />
                  </li>
                </ul>
              </section>
              <Kildeboks kilder={innhold.flatMap((e) => e.kilder)} nokkel="kapittel-12" />
            </>
          }
        />
      )}
    </div>
  );
}
