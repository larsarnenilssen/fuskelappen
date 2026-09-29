// Beskjeftigelse for én eller flere grupper (fagkombinasjoner og blandede grupper).
import { useState } from 'preact/hooks';
import { useTekst } from '../../../app/tilstand.ts';
import { beregnBeskjeftigelse, type Gruppe } from '../beregning/index.ts';
import { Advarsler, Feilmelding, Kalkulatorside, ManglerInndata, prov, useArsrammer, useRegeltall } from '../komponenter/Kalkulatorside.tsx';
import { Grupper, nyGruppe, tilGruppe } from '../komponenter/Skjema.tsx';
import { Utregningskort } from '../komponenter/Utregning.tsx';
import { useHent } from '../kontekst.ts';

export default function Beskjeftigelse() {
  const { t } = useTekst();
  const hent = useHent();
  const rader = useArsrammer(hent);
  const uker = useRegeltall(hent, 'sfs2213.skolear_uker') ?? 0;
  const [grupper, settGrupper] = useState(() => [nyGruppe()]);

  const inndata = grupper.map((g) => tilGruppe(g, rader, false));
  const komplett = inndata.every((g) => g !== null);
  const { resultat, feil } = prov(() => (komplett ? beregnBeskjeftigelse(hent, inndata as Gruppe[]) : null));

  return (
    <Kalkulatorside id="beskjeftigelse">
      <Grupper grupper={grupper} rader={rader} periode={false} standardUker={uker} onEndring={settGrupper} />
      {feil && <Feilmelding feil={feil} />}
      {resultat ? (
        <>
          <Advarsler advarsler={resultat.advarsler} />
          <Utregningskort
            tittel={grupper.length > 1 ? t('arbeidstid.resultat.sumBeskjeftigelse') : t('arbeidstid.resultat.beskjeftigelse')}
            resultat={resultat.sum}
            trinn={resultat.trinn}
          />
        </>
      ) : (
        !feil && <ManglerInndata />
      )}
    </Kalkulatorside>
  );
}
