// Planfestet arbeidstid når undervisningen reduseres for funksjoner eller andre oppgaver (SFS 2213 punkt 5.3).
import { useState } from 'preact/hooks';
import { useTekst } from '../../../app/tilstand.ts';
import { Tallfelt } from '../../../components/Tallfelt.tsx';
import { beregnPlanfestet, type Reduksjon } from '../beregning/index.ts';
import { Feilmelding, Kalkulatorside, ManglerInndata, prov } from '../komponenter/Kalkulatorside.tsx';
import { Oversiktsliste } from '../komponenter/Oversikt.tsx';
import { Valgknapper } from '../komponenter/Skjema.tsx';
import { medEnhet, Utregningskort } from '../komponenter/Utregning.tsx';
import { useHent } from '../kontekst.ts';

/** Skjemaet for reduksjonen: i prosent eller i årsrammetimer. Brukes også i fordelingen. */
export function Reduksjonsfelt({
  type,
  verdi,
  onType,
  onVerdi,
  legend,
}: {
  type: Reduksjon['type'];
  verdi: number | null;
  onType: (t: Reduksjon['type']) => void;
  onVerdi: (v: number | null) => void;
  legend: string;
}) {
  const { t } = useTekst();
  return (
    <>
      <Valgknapper
        legend={legend}
        navn="reduksjon"
        verdi={type}
        valg={[
          { verdi: 'prosent', tekst: t('arbeidstid.planfestet.iProsent') },
          { verdi: 'arsrammetimer', tekst: t('arbeidstid.planfestet.iArsrammetimer') },
        ]}
        onEndring={onType}
      />
      {type === 'prosent' ? (
        <Tallfelt key="prosent" etikett={t('arbeidstid.planfestet.prosent')} hjelpetekst={t('arbeidstid.planfestet.prosentHjelp')} enhet="%" verdi={verdi} min={0} maks={100} onEndring={onVerdi} />
      ) : (
        <Tallfelt key="timer" etikett={t('arbeidstid.planfestet.arsrammetimer')} hjelpetekst={t('arbeidstid.planfestet.arsrammetimerHjelp')} verdi={verdi} min={0} maks={1000} onEndring={onVerdi} />
      )}
    </>
  );
}

export function tilReduksjon(type: Reduksjon['type'], verdi: number | null): Reduksjon | null {
  if (verdi === null) return null;
  return type === 'prosent' ? { type, prosent: verdi } : { type, timer: verdi };
}

export default function Planfestet() {
  const { t } = useTekst();
  const hent = useHent();
  const [type, settType] = useState<Reduksjon['type']>('prosent');
  const [verdi, settVerdi] = useState<number | null>(null);
  const reduksjon = tilReduksjon(type, verdi);
  const { resultat, feil } = prov(() => (reduksjon ? beregnPlanfestet(hent, reduksjon) : null));

  return (
    <Kalkulatorside id="planfestet">
      <Reduksjonsfelt legend={t('arbeidstid.planfestet.reduksjon')} type={type} verdi={verdi} onType={(ny) => { settType(ny); settVerdi(null); }} onVerdi={settVerdi} />
      {feil && <Feilmelding feil={feil} />}
      {resultat ? (
        <Utregningskort tittel={t('arbeidstid.resultat.planfestet')} resultat={resultat.planfestet} trinn={resultat.trinn}>
          <Oversiktsliste
            rader={[
              { navn: t('arbeidstid.resultat.funksjonsprosent'), verdi: medEnhet(t, resultat.funksjonsprosent.verdi, 'prosent') },
              { navn: t('arbeidstid.resultat.perUke'), verdi: medEnhet(t, resultat.perUke.verdi, 'timer_per_uke') },
              {
                navn: t('arbeidstid.resultat.utvidelse'),
                verdi: resultat.utvidelseDager.verdi > 0 ? medEnhet(t, resultat.utvidelseDager.verdi, 'dager') : t('arbeidstid.resultat.ingenUtvidelse'),
              },
            ]}
          />
        </Utregningskort>
      ) : (
        !feil && <ManglerInndata />
      )}
    </Kalkulatorside>
  );
}
