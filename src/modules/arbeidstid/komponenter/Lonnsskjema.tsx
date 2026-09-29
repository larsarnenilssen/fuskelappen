// Lønnsgrunnlag: garantilønn fra hovedtariffavtalen (stillingsgruppe og ansiennitet) eller egen årslønn.
import { useId } from 'preact/hooks';
import { useTekst } from '../../../app/tilstand.ts';
import { Tallfelt } from '../../../components/Tallfelt.tsx';
import { type Hent, lesGarantilonn, type Lonnsgrunnlag } from '../beregning/index.ts';
import { prov } from './Kalkulatorside.tsx';
import { Valgknapper } from './Skjema.tsx';

export interface Lonnstilstand {
  type: 'garantilonn' | 'manuell';
  gruppe: string;
  ansiennitet: number;
  arslonn: number | null;
}

export function nyLonnstilstand(): Lonnstilstand {
  return { type: 'garantilonn', gruppe: 'lektor', ansiennitet: 0, arslonn: null };
}

export function tilLonnsgrunnlag(l: Lonnstilstand): Lonnsgrunnlag | null {
  if (l.type === 'manuell') return l.arslonn !== null && l.arslonn > 0 ? { type: 'manuell', arslonn: l.arslonn } : null;
  return { type: 'garantilonn', stillingsgruppe: l.gruppe, ansiennitet: l.ansiennitet };
}

export function Lonnsskjema({ hent, lonn, onEndring }: { hent: Hent; lonn: Lonnstilstand; onEndring: (l: Lonnstilstand) => void }) {
  const { t } = useTekst();
  const idGruppe = useId();
  const idAns = useId();
  const tabell = prov(() => lesGarantilonn(hent)).resultat ?? [];
  const trinn = Object.keys(tabell[0]?.lonn ?? {}).map(Number);
  const sett = (endring: Partial<Lonnstilstand>) => onEndring({ ...lonn, ...endring });
  return (
    <>
      <Valgknapper
        legend={t('arbeidstid.vikar.lonn')}
        navn="lonn"
        verdi={lonn.type}
        valg={[
          { verdi: 'garantilonn', tekst: t('arbeidstid.vikar.lonnGarantilonn') },
          { verdi: 'manuell', tekst: t('arbeidstid.vikar.lonnManuell') },
        ]}
        onEndring={(type) => sett({ type })}
      />
      {lonn.type === 'garantilonn' ? (
        <>
          <div class="felt">
            <label for={idGruppe}>{t('arbeidstid.vikar.stillingsgruppe')}</label>
            <select id={idGruppe} value={lonn.gruppe} onChange={(e) => sett({ gruppe: e.currentTarget.value })}>
              {tabell.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.navn}
                </option>
              ))}
            </select>
          </div>
          <div class="felt">
            <label for={idAns}>{t('arbeidstid.vikar.ansiennitet')}</label>
            <select id={idAns} value={String(lonn.ansiennitet)} onChange={(e) => sett({ ansiennitet: Number(e.currentTarget.value) })}>
              {trinn.map((ar) => (
                <option key={ar} value={String(ar)}>
                  {t('arbeidstid.vikar.ansiennitetAr', { ar })}
                </option>
              ))}
            </select>
          </div>
        </>
      ) : (
        <Tallfelt etikett={t('arbeidstid.vikar.arslonn')} hjelpetekst={t('arbeidstid.vikar.arslonnHjelp')} verdi={lonn.arslonn} min={1} maks={5000000} onEndring={(arslonn) => sett({ arslonn })} />
      )}
    </>
  );
}
