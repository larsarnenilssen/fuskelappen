// Overtid ved beskjeftigelse over 100 % (fast overtid), betalt med 1,5 × timelønn for undervisning.
import { lesHash } from '../../../app/ruter.ts';
import { useTekst } from '../../../app/tilstand.ts';
import { Hjelp } from '../../../components/Hjelp.tsx';
import { Sammenleggbartkort } from '../../../components/Sammenlegg.tsx';
import { Tallfelt } from '../../../components/Tallfelt.tsx';
import { type Arsrammevalg, beregnOvertid } from '../beregning/index.ts';
import { Belopsstolpe, Stillingsmaaler } from '../komponenter/Grafikk.tsx';
import { Advarsler, Feilmelding, Kalkulatorside, ManglerInndata, prov, useArsrammer, useRegeltall } from '../komponenter/Kalkulatorside.tsx';
import { Lonnsskjema, nyLonnstilstand, tilLonnsgrunnlag } from '../komponenter/Lonnsskjema.tsx';
import { Oversiktsliste } from '../komponenter/Oversikt.tsx';
import { Fagfelt, tilArsrammevalg, tomArsrammeplass, useFagindeks, Vippe } from '../komponenter/Skjema.tsx';
import { medEnhet, tallTekst, Utregningskort } from '../komponenter/Utregning.tsx';
import { Varianter } from '../komponenter/Varianter.tsx';
import { useHent, useSkjematilstand } from '../kontekst.ts';

function tallFraAdresse(navn: string): number | null {
  const verdi = Number(lesHash(location.hash).sporring.get(navn) ?? '');
  return Number.isFinite(verdi) && verdi > 0 ? verdi : null;
}

export default function Overtid() {
  const { t } = useTekst();
  const hent = useHent();
  const rader = useArsrammer(hent);
  const indeks = useFagindeks(hent, rader);
  const konstant = useRegeltall(hent, 'hta.timelonn_konstant') ?? 0;
  const [s, sett] = useSkjematilstand('overtid', () => ({
    // Stillingsplanen kan lenke hit med beskjeftigelsen utfylt (#/arbeidstid/overtid?beskjeftigelse=103.13).
    beskjeftigelse: tallFraAdresse('beskjeftigelse'),
    plasser: [tomArsrammeplass()],
    faaElever: false,
    lonn: nyLonnstilstand(),
    over60: false,
  }));

  const valg = s.plasser.map((p) => tilArsrammevalg(p, rader));
  const grunnlag = tilLonnsgrunnlag(s.lonn);
  const { resultat, feil } = prov(() =>
    valg.every((v) => v !== null) && grunnlag && s.beskjeftigelse !== null
      ? beregnOvertid(hent, { beskjeftigelse: s.beskjeftigelse, arsrammer: valg as Arsrammevalg[], elever: s.faaElever, lonn: grunnlag, over60: s.over60 })
      : null,
  );

  const tittel = t('arbeidstid.resultat.overtidsbetaling');

  return (
    <Kalkulatorside
      id="overtid"
      resultat={
        <>
          {feil && <Feilmelding feil={feil} />}
          {resultat ? (
            <>
              <Advarsler advarsler={resultat.advarsler} />
              {resultat.overtidstimer.verdi === 0 && <p class="merknad">{t('arbeidstid.overtid.ingenOvertid')}</p>}
              <Utregningskort tittel={t('arbeidstid.resultat.overtidsbetaling')} resultat={resultat.betaling} trinn={resultat.trinn} sammendrag={false}>
                <Stillingsmaaler deler={[{ navn: t('arbeidstid.resultat.beskjeftigelse'), prosent: s.beskjeftigelse ?? 0 }]} />
                <Belopsstolpe
                  deler={[
                    { navn: t('arbeidstid.resultat.overtidsbetaling'), verdi: resultat.betaling.verdi },
                    { navn: t('arbeidstid.resultat.feriepengerTillegg'), verdi: resultat.feriepenger.verdi },
                  ]}
                />
                <Oversiktsliste
                  rader={[
                    { navn: t('arbeidstid.resultat.undervisningstimer'), verdi: medEnhet(t, resultat.overtidstimer.verdi, 'timer') },
                    { navn: t('arbeidstid.resultat.kalkulertTid'), verdi: medEnhet(t, resultat.kalkulertTid.verdi, 'timer') },
                    { navn: t('arbeidstid.resultat.timelonn'), verdi: medEnhet(t, resultat.timelonn.verdi, 'kroner_per_time') },
                    { navn: t('arbeidstid.resultat.feriepengerTillegg'), verdi: medEnhet(t, resultat.feriepenger.verdi, 'kroner') },
                  ]}
                />
                <div class="med-hjelp liten">
                  <span class="dempet">{t('arbeidstid.overtid.forklaringTema')}</span>
                  <Hjelp tema={t('arbeidstid.overtid.forklaringTema')}>
                    <p class="felt-hjelp">{t('arbeidstid.overtid.forklaring', { konstant: tallTekst(konstant), perProsent: tallTekst(konstant / 100) })}</p>
                  </Hjelp>
                </div>
              </Utregningskort>
            </>
          ) : (
            !feil && <ManglerInndata />
          )}
          <Varianter id="overtid" skjema={s} resultat={resultat ? { tittel, verdi: resultat.betaling.verdi, enhet: 'kroner' } : null} onHent={sett} />
        </>
      }
    >
      <Tallfelt
        etikett={t('arbeidstid.overtid.beskjeftigelse')}
        hjelpetekst={t('arbeidstid.overtid.beskjeftigelseHjelp')}
        enhet="%"
        verdi={s.beskjeftigelse}
        min={0}
        maks={300}
        onEndring={(beskjeftigelse) => sett({ ...s, beskjeftigelse })}
      />
      <Sammenleggbartkort nokkel="fag" tittel={t('arbeidstid.overtid.fag')}>
        <Fagfelt
          plasser={s.plasser}
          faaElever={s.faaElever}
          indeks={indeks}
          rader={rader}
          onPlasser={(plasser) => sett({ ...s, plasser })}
          onFaaElever={(faaElever) => sett({ ...s, faaElever })}
        />
      </Sammenleggbartkort>
      <Sammenleggbartkort nokkel="lonn" tittel={t('arbeidstid.felles.kortLonn')}>
        <Lonnsskjema hent={hent} lonn={s.lonn} onEndring={(lonn) => sett({ ...s, lonn })} />
        <Vippe tekst={t('arbeidstid.overtid.over60')} pa={s.over60} onEndring={(over60) => sett({ ...s, over60 })} />
      </Sammenleggbartkort>
    </Kalkulatorside>
  );
}
