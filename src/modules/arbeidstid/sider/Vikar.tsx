// Vikartimer: økt beskjeftigelse for ansatte i stilling, eller lønn for timevikarer.
import { useTekst } from '../../../app/tilstand.ts';
import { Tallfelt } from '../../../components/Tallfelt.tsx';
import { type Arsrammevalg, beregnTimevikar, beregnVikarFast } from '../beregning/index.ts';
import { Advarsler, Feilmelding, Kalkulatorside, ManglerInndata, prov, useArsrammer } from '../komponenter/Kalkulatorside.tsx';
import { Lonnsskjema, nyLonnstilstand, tilLonnsgrunnlag } from '../komponenter/Lonnsskjema.tsx';
import { Oversiktsliste } from '../komponenter/Oversikt.tsx';
import { Bryter, Fagfelt, Minuttvelger, tilArsrammevalg, tomArsrammeplass, useFagindeks, Vippe } from '../komponenter/Skjema.tsx';
import { medEnhet, Utregningskort } from '../komponenter/Utregning.tsx';
import { useHent, useSkjematilstand } from '../kontekst.ts';

export default function Vikar() {
  const { t } = useTekst();
  const hent = useHent();
  const rader = useArsrammer(hent);
  const indeks = useFagindeks(hent, rader);
  const [s, sett] = useSkjematilstand('vikar', () => ({
    type: 'fast' as 'fast' | 'timevikar',
    plasser: [tomArsrammeplass()],
    faaElever: false,
    okter: null as number | null,
    minutter: 45 as number | null,
    minutterFritt: false,
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

  return (
    <Kalkulatorside id="vikar">
      <Bryter
        legend={t('arbeidstid.vikar.type')}
        verdi={s.type}
        valg={[
          { verdi: 'fast', tekst: t('arbeidstid.vikar.fast') },
          { verdi: 'timevikar', tekst: t('arbeidstid.vikar.timevikar') },
        ]}
        onEndring={(type) => sett({ ...s, type })}
      />
      <div class="fagkort">
        <Fagfelt
          plasser={s.plasser}
          faaElever={s.faaElever}
          indeks={indeks}
          rader={rader}
          onPlasser={(plasser) => sett({ ...s, plasser })}
          onFaaElever={(faaElever) => sett({ ...s, faaElever })}
        />
        <Tallfelt etikett={t('arbeidstid.vikar.okter')} verdi={s.okter} min={0} maks={2000} onEndring={(okter) => sett({ ...s, okter })} />
        <Minuttvelger minutter={s.minutter} fritt={s.minutterFritt} onEndring={(minutter, minutterFritt) => sett({ ...s, minutter, minutterFritt })} />
      </div>

      {s.type === 'timevikar' && (
        <div class="fagkort">
          <Lonnsskjema hent={hent} lonn={s.lonn} onEndring={(lonn) => sett({ ...s, lonn })} />
          <Vippe tekst={t('arbeidstid.vikar.over60')} pa={s.over60} onEndring={(over60) => sett({ ...s, over60 })} />
        </div>
      )}

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
    </Kalkulatorside>
  );
}
