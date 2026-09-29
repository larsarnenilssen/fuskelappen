// Vikartimer: økt beskjeftigelse for ansatte i stilling, eller lønn for timevikarer.
import { useState } from 'preact/hooks';
import { useTekst } from '../../../app/tilstand.ts';
import { Tallfelt } from '../../../components/Tallfelt.tsx';
import { type Arsrammevalg, beregnTimevikar, beregnVikarFast } from '../beregning/index.ts';
import { Advarsler, Feilmelding, Kalkulatorside, ManglerInndata, prov, useArsrammer } from '../komponenter/Kalkulatorside.tsx';
import { Oversiktsliste } from '../komponenter/Oversikt.tsx';
import { Lonnsskjema, nyLonnstilstand, tilLonnsgrunnlag } from '../komponenter/Lonnsskjema.tsx';
import { Arsrammevelger, tilArsrammevalg, tomArsrammeplass, Valgknapper } from '../komponenter/Skjema.tsx';
import { medEnhet, Utregningskort } from '../komponenter/Utregning.tsx';
import { useHent } from '../kontekst.ts';

export default function Vikar() {
  const { t } = useTekst();
  const hent = useHent();
  const rader = useArsrammer(hent);
  const [type, settType] = useState<'fast' | 'timevikar'>('fast');
  const [plass, settPlass] = useState(tomArsrammeplass);
  const [elever, settElever] = useState<number | null>(null);
  const [okter, settOkter] = useState<number | null>(null);
  const [minutter, settMinutter] = useState<number | null>(45);
  const [lonn, settLonn] = useState(nyLonnstilstand);
  const [over60, settOver60] = useState(false);

  const valg = tilArsrammevalg(plass, rader);
  const stjerne = valg !== null && (valg.type === 'rad' ? valg.rad.stjerne : valg.stjerne);
  const grunnlag = tilLonnsgrunnlag(lonn);
  const felles = valg && okter !== null && minutter !== null ? { arsrammer: [valg] as Arsrammevalg[], elever, okter, minutter } : null;

  const fast = prov(() => (type === 'fast' && felles ? beregnVikarFast(hent, felles) : null));
  const time = prov(() => (type === 'timevikar' && felles && grunnlag ? beregnTimevikar(hent, { ...felles, lonn: grunnlag, over60 }) : null));
  const feil = fast.feil ?? time.feil;

  return (
    <Kalkulatorside id="vikar">
      <Valgknapper
        legend={t('arbeidstid.vikar.type')}
        navn="vikartype"
        verdi={type}
        valg={[
          { verdi: 'fast', tekst: t('arbeidstid.vikar.fast') },
          { verdi: 'timevikar', tekst: t('arbeidstid.vikar.timevikar') },
        ]}
        onEndring={settType}
      />
      <Arsrammevelger etikett={t('arbeidstid.felles.arsramme')} plass={plass} rader={rader} onEndring={settPlass} />
      {stjerne && <Tallfelt etikett={t('arbeidstid.felles.elever')} hjelpetekst={t('arbeidstid.felles.eleverHjelp')} verdi={elever} min={0} maks={100} onEndring={settElever} />}
      <Tallfelt etikett={t('arbeidstid.vikar.okter')} verdi={okter} min={0} maks={2000} onEndring={settOkter} />
      <Tallfelt etikett={t('arbeidstid.felles.minutter')} verdi={minutter} min={1} maks={600} onEndring={settMinutter} />

      {type === 'timevikar' && (
        <>
          <Lonnsskjema hent={hent} lonn={lonn} onEndring={settLonn} />
          <label class="valg">
            <input type="checkbox" checked={over60} onChange={(e) => settOver60(e.currentTarget.checked)} />
            <span>{t('arbeidstid.vikar.over60')}</span>
          </label>
        </>
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
          <Utregningskort tittel={t('arbeidstid.resultat.samletLonn')} resultat={time.resultat.samlet} trinn={time.resultat.trinn}>
            <Oversiktsliste
              rader={[
                { navn: t('arbeidstid.resultat.kalkulertTid'), verdi: medEnhet(t, time.resultat.kalkulertTid.verdi, 'timer') },
                { navn: t('arbeidstid.resultat.timelonn'), verdi: medEnhet(t, time.resultat.timelonn.verdi, 'kroner_per_time') },
                { navn: t('arbeidstid.resultat.lonn'), verdi: medEnhet(t, time.resultat.lonn.verdi, 'kroner') },
                { navn: t('arbeidstid.resultat.feriepenger'), verdi: medEnhet(t, time.resultat.feriepenger.verdi, 'kroner') },
              ]}
            />
          </Utregningskort>
        </>
      )}
      {!fast.resultat && !time.resultat && !feil && <ManglerInndata />}
    </Kalkulatorside>
  );
}
