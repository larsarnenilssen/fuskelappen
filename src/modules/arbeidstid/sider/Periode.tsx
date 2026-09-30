// Periodebeskjeftigelse: undervisning i en del av skoleåret.
import { useTekst } from '../../../app/tilstand.ts';
import { Tallfelt } from '../../../components/Tallfelt.tsx';
import { formaterTall } from '../../../core/i18n/tekst.ts';
import { beregnPeriodebeskjeftigelse, type Gruppe } from '../beregning/index.ts';
import { Periodelinje, Stillingsmaaler } from '../komponenter/Grafikk.tsx';
import { Advarsler, Feilmelding, Kalkulatorside, ManglerInndata, prov, useArsrammer, useArstimer, useRegeltall } from '../komponenter/Kalkulatorside.tsx';
import { Grupper, nyGruppe, reserverIder, tilGruppe, useFagindeks } from '../komponenter/Skjema.tsx';
import { Oversiktsliste } from '../komponenter/Oversikt.tsx';
import { medEnhet, Utregningskort } from '../komponenter/Utregning.tsx';
import { Varianter } from '../komponenter/Varianter.tsx';
import { useHent, useSkjematilstand } from '../kontekst.ts';

export default function Periode() {
  const { t } = useTekst();
  const hent = useHent();
  const rader = useArsrammer(hent);
  const indeks = useFagindeks(hent, rader);
  const arstimer = useArstimer(hent);
  const skolear = useRegeltall(hent, 'sfs2213.skolear_dager') ?? 0;
  const [skjema, settSkjema] = useSkjematilstand(
    'periode',
    () => ({ grupper: [nyGruppe()], dager: null as number | null, dagerSkolear: null as number | null }),
    (s) => reserverIder(s.grupper),
  );
  const { grupper, dager, dagerSkolear } = skjema;

  const inndata = grupper.map((g) => tilGruppe(g, rader, true));
  const utfylte = inndata.filter((g): g is Gruppe => g !== null);
  const komplett = utfylte.length > 0 && dager !== null && dager > 0;
  const { resultat, feil } = prov(() =>
    komplett ? beregnPeriodebeskjeftigelse(hent, utfylte, { dagerIPerioden: dager, dagerISkolearet: dagerSkolear }) : null,
  );
  let j = 0;
  const delresultater = inndata.map((g) => (g === null ? null : (resultat?.grupper[j++]?.beskjeftigelse.verdi ?? null)));

  // Beskjeftigelsen i perioden regnet om til hele skoleåret: periodebeskjeftigelse × periodenøkkel.
  const nokkel = resultat?.trinn.find((tr) => tr.id === 'periodenokkel')?.resultat.verdi ?? null;
  const tittel = t('arbeidstid.resultat.periodebeskjeftigelse');

  return (
    <Kalkulatorside
      id="periode"
      resultat={
        <>
          {feil && <Feilmelding feil={feil} />}
          {resultat ? (
            <>
              <Advarsler advarsler={resultat.advarsler} />
              <Utregningskort tittel={tittel} resultat={resultat.sum} trinn={resultat.trinn}>
                <Stillingsmaaler deler={resultat.grupper.map((g, i) => ({ navn: t('arbeidstid.felles.gruppe', { nr: i + 1 }), prosent: g.beskjeftigelse.verdi }))} />
                {nokkel !== null && (
                  <Oversiktsliste
                    rader={[
                      {
                        navn: t('arbeidstid.periode.heleAret'),
                        verdi: medEnhet(t, resultat.sum.verdi * nokkel, 'prosent'),
                      },
                    ]}
                  />
                )}
              </Utregningskort>
            </>
          ) : (
            !feil && <ManglerInndata />
          )}
          <Varianter
            id="periode"
            skjema={skjema}
            resultat={resultat ? { tittel, verdi: resultat.sum.verdi, enhet: 'prosent' } : null}
            onHent={(v) => {
              reserverIder(v.grupper);
              settSkjema(v);
            }}
          />
        </>
      }
    >
      <div class="feltrad">
        <Tallfelt
          etikett={t('arbeidstid.periode.dager')}
          hjelpetekst={t('arbeidstid.periode.dagerHjelp')}
          verdi={dager}
          min={1}
          maks={400}
          onEndring={(v) => settSkjema({ ...skjema, dager: v })}
        />
        <Tallfelt
          etikett={t('arbeidstid.periode.skolear')}
          hjelpetekst={t('arbeidstid.periode.skolearHjelp', { dager: formaterTall(skolear) })}
          plassholder={formaterTall(skolear)}
          verdi={dagerSkolear}
          min={1}
          maks={400}
          onEndring={(v) => settSkjema({ ...skjema, dagerSkolear: v })}
        />
      </div>
      {dager !== null && dager > 0 && <Periodelinje dager={dager} skolear={dagerSkolear ?? skolear} />}
      <Grupper arstimer={arstimer} grupper={grupper} rader={rader} indeks={indeks} periode standardUker={0} delresultater={delresultater} onEndring={(g) => settSkjema({ ...skjema, grupper: g })} />
    </Kalkulatorside>
  );
}
