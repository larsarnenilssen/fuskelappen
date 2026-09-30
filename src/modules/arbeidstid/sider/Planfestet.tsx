// Planfestet arbeidstid når undervisningen reduseres for funksjoner eller andre oppgaver (SFS 2213 punkt 5.3).
import { useTekst } from '../../../app/tilstand.ts';
import { Tallfelt } from '../../../components/Tallfelt.tsx';
import { beregnPlanfestet, type Reduksjon } from '../beregning/index.ts';
import { Planfestetmaaler, Ukemaaler } from '../komponenter/Grafikk.tsx';
import { Feilmelding, Kalkulatorside, ManglerInndata, prov, useRegeltall } from '../komponenter/Kalkulatorside.tsx';
import { Oversiktsliste } from '../komponenter/Oversikt.tsx';
import { Bryter } from '../komponenter/Skjema.tsx';
import { medEnhet, Utregningskort } from '../komponenter/Utregning.tsx';
import { Varianter } from '../komponenter/Varianter.tsx';
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
  const [s, sett] = useSkjematilstand('planfestet', () => ({ type: 'prosent' as Reduksjon['type'], verdi: 0 as number | null }));
  const reduksjon = tilReduksjon(s.type, s.verdi);
  const { resultat, feil } = prov(() => (reduksjon ? beregnPlanfestet(hent, reduksjon) : null));
  const verdi = (id: string) => resultat?.trinn.find((tr) => tr.id === id)?.resultat.verdi ?? 0;

  const uker = verdi('arbeidsaar_uker');
  const dagerPerUke = useRegeltall(hent, 'sfs2213.arbeidsdager_per_uke') ?? 0;
  const arsverk = useRegeltall(hent, 'sfs2213.arsverk_timer') ?? 0;
  const maksUke = useRegeltall(hent, 'sfs2213.planfestet_maks_uke') ?? 0;
  const maksDag = useRegeltall(hent, 'sfs2213.planfestet_maks_dag') ?? 0;
  // Arbeidstiden i alt per uke: årsverket fordelt på arbeidsåret, også når arbeidsåret utvides.
  const ukerIAlt = uker + (resultat && dagerPerUke > 0 ? resultat.utvidelseDager.verdi / dagerPerUke : 0);
  const tittel = t('arbeidstid.resultat.planfestet');

  return (
    <Kalkulatorside
      id="planfestet"
      resultat={
        <>
          {feil && <Feilmelding feil={feil} />}
          {resultat ? (
            <Utregningskort tittel={tittel} resultat={resultat.planfestet} trinn={resultat.trinn} sammendrag={false}>
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
              {ukerIAlt > 0 && (
                <Ukemaaler planfestet={resultat.perUke.verdi} total={arsverk / ukerIAlt} maksUke={maksUke} maksDag={maksDag} dagerPerUke={dagerPerUke} />
              )}
            </Utregningskort>
          ) : (
            !feil && <ManglerInndata />
          )}
          <Varianter id="planfestet" skjema={s} resultat={resultat ? { tittel, verdi: resultat.planfestet.verdi, enhet: 'timer' } : null} onHent={sett} />
        </>
      }
    >
      <div class="fagkort">
        <Reduksjonsfelt legend={t('arbeidstid.planfestet.reduksjon')} type={s.type} verdi={s.verdi} onEndring={(type, v) => sett({ type, verdi: v })} />
      </div>
    </Kalkulatorside>
  );
}
