// Overtid ved beskjeftigelse over 100 % (fast overtid), betalt med 1,5 × timelønn for undervisning.
import { useState } from 'preact/hooks';
import { useTekst } from '../../../app/tilstand.ts';
import { Tallfelt } from '../../../components/Tallfelt.tsx';
import { beregnOvertid } from '../beregning/index.ts';
import { Advarsler, Feilmelding, Kalkulatorside, ManglerInndata, prov, useArsrammer } from '../komponenter/Kalkulatorside.tsx';
import { Oversiktsliste } from '../komponenter/Oversikt.tsx';
import { Lonnsskjema, nyLonnstilstand, tilLonnsgrunnlag } from '../komponenter/Lonnsskjema.tsx';
import { Arsrammevelger, tilArsrammevalg, tomArsrammeplass } from '../komponenter/Skjema.tsx';
import { medEnhet, Utregningskort } from '../komponenter/Utregning.tsx';
import { useHent } from '../kontekst.ts';

export default function Overtid() {
  const { t } = useTekst();
  const hent = useHent();
  const rader = useArsrammer(hent);
  const [beskjeftigelse, settBeskjeftigelse] = useState<number | null>(null);
  const [plass, settPlass] = useState(tomArsrammeplass);
  const [elever, settElever] = useState<number | null>(null);
  const [lonn, settLonn] = useState(nyLonnstilstand);

  const valg = tilArsrammevalg(plass, rader);
  const stjerne = valg !== null && (valg.type === 'rad' ? valg.rad.stjerne : valg.stjerne);
  const grunnlag = tilLonnsgrunnlag(lonn);
  const { resultat, feil } = prov(() =>
    valg && grunnlag && beskjeftigelse !== null ? beregnOvertid(hent, { beskjeftigelse, arsrammer: [valg], elever, lonn: grunnlag }) : null,
  );

  return (
    <Kalkulatorside id="overtid">
      <Tallfelt etikett={t('arbeidstid.overtid.beskjeftigelse')} hjelpetekst={t('arbeidstid.overtid.beskjeftigelseHjelp')} enhet="%" verdi={beskjeftigelse} min={0} maks={300} onEndring={settBeskjeftigelse} />
      <Arsrammevelger etikett={t('arbeidstid.overtid.fag')} plass={plass} rader={rader} onEndring={settPlass} />
      {stjerne && <Tallfelt etikett={t('arbeidstid.felles.elever')} hjelpetekst={t('arbeidstid.felles.eleverHjelp')} verdi={elever} min={0} maks={100} onEndring={settElever} />}
      <Lonnsskjema hent={hent} lonn={lonn} onEndring={settLonn} />
      {feil && <Feilmelding feil={feil} />}
      {resultat ? (
        <>
          <Advarsler advarsler={resultat.advarsler} />
          {resultat.overtidstimer.verdi === 0 && <p class="merknad">{t('arbeidstid.overtid.ingenOvertid')}</p>}
          <Utregningskort tittel={t('arbeidstid.resultat.overtidsbetaling')} resultat={resultat.betaling} trinn={resultat.trinn}>
            <Oversiktsliste rader={[{ navn: t('arbeidstid.resultat.overtidstimer'), verdi: medEnhet(t, resultat.overtidstimer.verdi, 'arsrammetimer') }]} />
          </Utregningskort>
        </>
      ) : (
        !feil && <ManglerInndata />
      )}
    </Kalkulatorside>
  );
}
