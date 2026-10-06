// Et trygt og godt skolemiljø (fase 7, eier 06.10.2026): opplæringslova kapittel 12 som egen side i Skolemiljø.
// Øverst står kapittelet på én side: fem deler med paragrafene, som lenker til delen lenger ned. Under står kortene
// med egne ord (content/skolemiljo/kapittel-12.yaml) i de samme fem delene. Aktivitetsplikten har de fem delpliktene
// som en rad, og statsforvalteren veien dit som en sti. Kortene om informasjon og fysiske inngrep (kapittel 10 og 13)
// og lenkene til veiviseren, skolereglene og Elevundersøkelsen står til høyre på skrivebord (avgjørelse 074).
// `?del=<id>` åpner et kort og ruller dit, som på siden om eksamen.
import { useEffect, useState } from 'preact/hooks';
import { useTekst } from '../../../app/tilstand.ts';
import { Brodsmuler } from '../../../components/Brodsmuler.tsx';
import { Ikon } from '../../../components/Ikon.tsx';
import { Innholdskort } from '../../../components/Innholdskort.tsx';
import { Kildeboks } from '../../../components/Kildeboks.tsx';
import { Sidetopp } from '../../../components/Sidetopp.tsx';
import { ToKolonner } from '../../../components/ToKolonner.tsx';
import type { Tekstnokkel } from '../../../core/i18n/tekst.ts';
import { paragrafRute } from '../../lov/data.ts';
import type { SideProps } from '../../typer.ts';
import { Inngang } from '../../vurdering/sider/Inngang.tsx';
import { type Forklaringselement, hentInnhold, kapittel12Rute, medPrefiks, UNDERSIDER, veiviserRute } from '../innhold.ts';

/** De fem delene av kapittelet, med kortene i hver del. Den første id-en er kortet oversikten lenker til. */
const DELER = [
  { id: 'retten', kort: ['k12-hvem', 'k12-retten'] },
  { id: 'plikter', kort: ['k12-nulltoleranse', 'k12-forebygging', 'k12-aktivitetsplikt', 'k12-skjerpet'] },
  { id: 'statsforvalteren', kort: ['k12-statsforvalteren'] },
  { id: 'fysisk', kort: ['k12-fysisk'] },
  { id: 'ansvar', kort: ['k12-ansvar'] },
] as const;
const VED_SIDEN = ['k12-informasjon', 'k12-fysiske-inngrep'];
const DELPLIKTER = ['folgeMed', 'gripeInn', 'meldeFra', 'undersoke', 'tiltak'] as const;
const GANG = ['rektor', 'uke', 'melde', 'vedtak', 'klage'] as const;

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
        <>
          {/* Kapittelet på én side: fem deler i rekkefølge, hver med paragrafene og en lenke til delen. */}
          <nav class="k12-oversikt" aria-labelledby="k12-oversikt-tittel">
            <h2 class="liten-overskrift" id="k12-oversikt-tittel">
              {t('skolemiljo.kapittel12.oversikt')}
            </h2>
            <ol class="k12-deler">
              {DELER.map((d, i) => (
                <li key={d.id}>
                  <a class="k12-del" href={`#${kapittel12Rute}?del=k12-del-${d.id}`} data-del={d.id}>
                    <span class="k12-del-nr" aria-hidden="true">
                      {i + 1}
                    </span>
                    <span class="k12-del-tittel">{delTittel(d.id)}</span>
                    <span class="k12-del-paragrafer">{t(`skolemiljo.kapittel12.deler.${d.id}.paragrafer` as Tekstnokkel)}</span>
                    <span class="k12-del-tekst">{t(`skolemiljo.kapittel12.deler.${d.id}.tekst` as Tekstnokkel)}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <ToKolonner
            hoved={
              <>
                {DELER.map((d, i) => (
                  <section key={d.id} class="k12-seksjon" id={`k12-del-${d.id}`} aria-labelledby={`k12-h-${d.id}`}>
                    <h2 class="liten-overskrift k12-seksjon-tittel" id={`k12-h-${d.id}`}>
                      <span class="k12-del-nr" aria-hidden="true">
                        {i + 1}
                      </span>
                      {delTittel(d.id)}
                      <span class="k12-seksjon-paragrafer">{t(`skolemiljo.kapittel12.deler.${d.id}.paragrafer` as Tekstnokkel)}</span>
                    </h2>
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
                  </section>
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
                      <Inngang {...UNDERSIDER.elevundersokelsen} tittel={t('skolemiljo.kapittel12.elevundersokelsen')} tekst={t('skolemiljo.kapittel12.elevundersokelsenTekst')} />
                    </li>
                  </ul>
                </section>
                <Kildeboks kilder={innhold.flatMap((e) => e.kilder)} nokkel="kapittel-12" />
              </>
            }
          />
        </>
      )}
    </div>
  );
}
