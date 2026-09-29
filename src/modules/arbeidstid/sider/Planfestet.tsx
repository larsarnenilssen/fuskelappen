// Planfestet arbeidstid når undervisningen reduseres for funksjoner eller andre oppgaver (SFS 2213 punkt 5.3).
import { useTekst } from '../../../app/tilstand.ts';
import { Tallfelt } from '../../../components/Tallfelt.tsx';
import { beregnPlanfestet, type Reduksjon } from '../beregning/index.ts';
import { Planfestetmaaler } from '../komponenter/Grafikk.tsx';
import { Feilmelding, Kalkulatorside, ManglerInndata, prov } from '../komponenter/Kalkulatorside.tsx';
import { Oversiktsliste } from '../komponenter/Oversikt.tsx';
import { Bryter } from '../komponenter/Skjema.tsx';
import { medEnhet, Utregningskort } from '../komponenter/Utregning.tsx';
import { useHent, useSkjematilstand } from '../kontekst.ts';

/** Reduksjonen i undervisning: i prosent eller i årsrammetimer. Brukes også i fordelingen. */
export function Reduksjonsfelt({
  type,
  verdi,
  onEndring,
  legend,
}: {
  type: Reduksjon['type'];
  verdi: number | null;
  onEndring: (type: Reduksjon['type'], verdi: number | null) => void;
  legend: string;
}) {
  const { t } = useTekst();
  return (
    <>
      <Bryter
        legend={legend}
        verdi={type}
        valg={[
          { verdi: 'prosent', tekst: t('arbeidstid.planfestet.iProsent') },
          { verdi: 'arsrammetimer', tekst: t('arbeidstid.planfestet.iArsrammetimer') },
        ]}
        onEndring={(ny) => onEndring(ny, null)}
      />
      {type === 'prosent' ? (
        <Tallfelt key="prosent" etikett={t('arbeidstid.planfestet.prosent')} enhet="%" verdi={verdi} min={0} maks={100} onEndring={(v) => onEndring(type, v)} />
      ) : (
        <Tallfelt
          key="timer"
          etikett={t('arbeidstid.planfestet.arsrammetimer')}
          hjelpetekst={t('arbeidstid.planfestet.arsrammetimerHjelp')}
          verdi={verdi}
          min={0}
          maks={1000}
          onEndring={(v) => onEndring(type, v)}
        />
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
  const [s, sett] = useSkjematilstand('planfestet', () => ({ type: 'prosent' as Reduksjon['type'], verdi: null as number | null }));
  const reduksjon = tilReduksjon(s.type, s.verdi);
  const { resultat, feil } = prov(() => (reduksjon ? beregnPlanfestet(hent, reduksjon) : null));
  const verdi = (id: string) => resultat?.trinn.find((tr) => tr.id === id)?.resultat.verdi ?? 0;

  return (
    <Kalkulatorside id="planfestet">
      <div class="fagkort">
        <Reduksjonsfelt legend={t('arbeidstid.planfestet.reduksjon')} type={s.type} verdi={s.verdi} onEndring={(type, v) => sett({ type, verdi: v })} />
      </div>
      {feil && <Feilmelding feil={feil} />}
      {resultat ? (
        <Utregningskort tittel={t('arbeidstid.resultat.planfestet')} resultat={resultat.planfestet} trinn={resultat.trinn} sammendrag={false}>
          <Planfestetmaaler grunn={resultat.planfestet.verdi - verdi('planfestet_okning')} okning={verdi('planfestet_okning')} maks={verdi('planfestet_maks')} />
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
