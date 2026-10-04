// Vikartimer: økt beskjeftigelse for ansatte i stilling, eller lønn for timevikarer.
import { lesOktlengde } from '../../../app/kalkulatorvalg.ts';
import { useTekst } from '../../../app/tilstand.ts';
import { Tallfelt } from '../../../components/Tallfelt.tsx';
import { type Arsrammevalg, beregnTimevikar, beregnVikarFast } from '../beregning/index.ts';
import { Advarsler, Feilmelding, Kalkulatorside, ManglerInndata, prov, useArsrammer } from '../komponenter/Kalkulatorside.tsx';
import { Skjemadel } from '../komponenter/Skjemadel.tsx';
import { Lonnsskjema, nyLonnstilstand, tilLonnsgrunnlag } from '../komponenter/Lonnsskjema.tsx';
import { Oversiktsliste } from '../komponenter/Oversikt.tsx';
import { Bryter, Fagfelt, Minuttvelger, tilArsrammevalg, tomArsrammeplass, useFagindeks, Vippe } from '../komponenter/Skjema.tsx';
import { medEnhet, tallTekst, Utregningskort } from '../komponenter/Utregning.tsx';
import { Varianter } from '../komponenter/Varianter.tsx';
import { Belopsstolpe } from '../komponenter/Grafikk.tsx';
import { useHent, useSkjematilstand } from '../kontekst.ts';

export default function Vikar() {
  const { t } = useTekst();
  const hent = useHent();
  const rader = useArsrammer(hent);
  const indeks = useFagindeks(hent, rader);
  const [s, sett, endre] = useSkjematilstand('vikar', () => ({
    type: 'fast' as 'fast' | 'timevikar',
    plasser: [tomArsrammeplass()],
    faaElever: false,
    okter: null as number | null,
    // Øktlengden er den brukeren sist valgte i en kalkulator (eier 04.10.2026).
    minutter: (lesOktlengde()?.minutter ?? 45) as number | null,
    minutterFritt: lesOktlengde()?.fritt ?? false,
    lonn: nyLonnstilstand(),
    over60: false,
  }));

  const valg = s.plasser.map((p) => tilArsrammevalg(p, rader));
  const grunnlag = tilLonnsgrunnlag(s.lonn);
  const felles =
    valg.every((v) => v !== null) && s.okter !== null && s.minutter !== null
      ? { arsrammer: valg as Arsrammevalg[], elever: s.faaElever, okter: s.okter, minutter: s.minutter }
      : null;
  const fast = prov(() => (s.type === 'fast' && felles ? beregnVikarFast(hent, felles) : null));
  const time = prov(() => (s.type === 'timevikar' && felles && grunnlag ? beregnTimevikar(hent, { ...felles, lonn: grunnlag, over60: s.over60 }) : null));
  const feil = fast.feil ?? time.feil;

  const hoved = fast.resultat
    ? { tittel: t('arbeidstid.resultat.endring'), verdi: fast.resultat.endring.verdi, enhet: 'prosent' as const }
    : time.resultat
      ? { tittel: t('arbeidstid.resultat.utbetaltLonn'), verdi: time.resultat.lonn.verdi, enhet: 'kroner' as const }
      : null;

  return (
    <Kalkulatorside
      id="vikar"
      resultat={
        <>
          {feil && <Feilmelding feil={feil} />}
          {fast.resultat && (
            <>
              <Advarsler advarsler={fast.resultat.advarsler} />
              <Utregningskort tittel={t('arbeidstid.resultat.endring')} resultat={fast.resultat.endring} trinn={fast.resultat.trinn} />
            </>
          )}
          {time.resultat && (
            <>
              <Advarsler advarsler={time.resultat.advarsler} />
              <Utregningskort tittel={t('arbeidstid.resultat.utbetaltLonn')} resultat={time.resultat.lonn} trinn={time.resultat.trinn} sammendrag={false}>
                <Belopsstolpe
                  deler={[
                    { navn: t('arbeidstid.resultat.lonn'), verdi: time.resultat.lonn.verdi },
                    { navn: t('arbeidstid.resultat.feriepengerTillegg'), verdi: time.resultat.feriepenger.verdi },
                  ]}
                />
                <Oversiktsliste
                  rader={[
                    { navn: t('arbeidstid.resultat.undervisningstimer'), verdi: medEnhet(t, time.resultat.vikartimer.verdi, 'timer') },
                    { navn: t('arbeidstid.resultat.kalkulertTid'), verdi: medEnhet(t, time.resultat.kalkulertTid.verdi, 'timer') },
                    { navn: t('arbeidstid.resultat.timelonn'), verdi: medEnhet(t, time.resultat.timelonn.verdi, 'kroner_per_time') },
                    { navn: t('arbeidstid.resultat.feriepengerTillegg'), verdi: medEnhet(t, time.resultat.feriepenger.verdi, 'kroner') },
                  ]}
                />
              </Utregningskort>
            </>
          )}
          {!fast.resultat && !time.resultat && !feil && <ManglerInndata />}
          <Varianter id="vikar" skjema={s} resultat={hoved} onHent={sett} />
        </>
      }
    >
      {/* Skjemaet i deler som i Arbeidsplan (avgjørelse 033). */}
      <Skjemadel del="stilling" tittel={t('arbeidstid.skjema.vikariat')}>
        <Bryter
          legend={t('arbeidstid.vikar.type')}
          verdi={s.type}
          valg={[
            { verdi: 'fast', tekst: t('arbeidstid.vikar.fast') },
            { verdi: 'timevikar', tekst: t('arbeidstid.vikar.timevikar') },
          ]}
          onEndring={(type) => endre({ type })}
        />
      </Skjemadel>
      <Skjemadel
        del="undervisning"
        tittel={t('arbeidstid.vikar.kortTimer')}
        sum={s.okter !== null && s.minutter !== null ? t('arbeidstid.vikar.oppsummering', { okter: tallTekst(s.okter), minutter: tallTekst(s.minutter) }) : null}
      >
        <Fagfelt
          plasser={s.plasser}
          faaElever={s.faaElever}
          indeks={indeks}
          rader={rader}
          onPlasser={(oppdater) => sett((gammel) => ({ ...gammel, plasser: oppdater(gammel.plasser) }))}
          onFaaElever={(faaElever) => endre({ faaElever })}
        />
        <Tallfelt etikett={t('arbeidstid.vikar.okter')} verdi={s.okter} min={0} maks={2000} onEndring={(okter) => endre({ okter })} />
        <Minuttvelger minutter={s.minutter} fritt={s.minutterFritt} onEndring={(minutter, minutterFritt) => endre({ minutter, minutterFritt })} />
      </Skjemadel>

      {s.type === 'timevikar' && (
        <Skjemadel del="lonn" tittel={t('arbeidstid.skjema.lonn')}>
          <Lonnsskjema hent={hent} lonn={s.lonn} onEndring={(lonn) => endre({ lonn })} />
          <Vippe tekst={t('arbeidstid.vikar.over60')} pa={s.over60} onEndring={(over60) => endre({ over60 })} />
        </Skjemadel>
      )}

    </Kalkulatorside>
  );
}
