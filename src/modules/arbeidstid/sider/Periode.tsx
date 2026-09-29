// Periodebeskjeftigelse: undervisning i en del av skoleåret.
import { useState } from 'preact/hooks';
import { useTekst } from '../../../app/tilstand.ts';
import { Tallfelt } from '../../../components/Tallfelt.tsx';
import { formaterTall } from '../../../core/i18n/tekst.ts';
import { beregnPeriodebeskjeftigelse, type Gruppe } from '../beregning/index.ts';
import { Advarsler, Feilmelding, Kalkulatorside, ManglerInndata, prov, useArsrammer, useRegeltall } from '../komponenter/Kalkulatorside.tsx';
import { Grupper, nyGruppe, tilGruppe } from '../komponenter/Skjema.tsx';
import { Utregningskort } from '../komponenter/Utregning.tsx';
import { useHent } from '../kontekst.ts';

export default function Periode() {
  const { t } = useTekst();
  const hent = useHent();
  const rader = useArsrammer(hent);
  const skolear = useRegeltall(hent, 'sfs2213.skolear_dager') ?? 0;
  const [grupper, settGrupper] = useState(() => [nyGruppe()]);
  const [dager, settDager] = useState<number | null>(null);
  const [dagerSkolear, settDagerSkolear] = useState<number | null>(null);

  const inndata = grupper.map((g) => tilGruppe(g, rader, true));
  const komplett = inndata.every((g) => g !== null) && dager !== null && dager > 0;
  const { resultat, feil } = prov(() =>
    komplett ? beregnPeriodebeskjeftigelse(hent, inndata as Gruppe[], { dagerIPerioden: dager, dagerISkolearet: dagerSkolear }) : null,
  );

  return (
    <Kalkulatorside id="periode">
      <Tallfelt etikett={t('arbeidstid.periode.dager')} hjelpetekst={t('arbeidstid.periode.dagerHjelp')} verdi={dager} min={1} maks={400} onEndring={settDager} />
      <Tallfelt
        etikett={t('arbeidstid.periode.skolear')}
        hjelpetekst={t('arbeidstid.periode.skolearHjelp', { dager: formaterTall(skolear) })}
        verdi={dagerSkolear}
        min={1}
        maks={400}
        onEndring={settDagerSkolear}
      />
      <Grupper grupper={grupper} rader={rader} periode standardUker={0} onEndring={settGrupper} />
      {feil && <Feilmelding feil={feil} />}
      {resultat ? (
        <>
          <Advarsler advarsler={resultat.advarsler} />
          <Utregningskort tittel={t('arbeidstid.resultat.periodebeskjeftigelse')} resultat={resultat.sum} trinn={resultat.trinn} />
        </>
      ) : (
        !feil && <ManglerInndata />
      )}
    </Kalkulatorside>
  );
}
