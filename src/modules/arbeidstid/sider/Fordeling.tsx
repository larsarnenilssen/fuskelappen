// Fordeling av arbeidstiden i en tenkt stilling, med diagram og forklaring av hva tiden brukes til.
import { useState } from 'preact/hooks';
import { useTekst } from '../../../app/tilstand.ts';
import { Forklaring } from '../../../components/Forklaring.tsx';
import { Tallfelt } from '../../../components/Tallfelt.tsx';
import type { Tekstnokkel } from '../../../core/i18n/tekst.ts';
import { beregnFordeling, type FordelingsdelId, type Gruppe, type Reduksjon } from '../beregning/index.ts';
import { Fordelingsdiagram, Fordelingstabell } from '../komponenter/Fordelingsdiagram.tsx';
import { Advarsler, Feilmelding, Kalkulatorside, ManglerInndata, prov, useArsrammer, useRegeltall } from '../komponenter/Kalkulatorside.tsx';
import { Innholdstekst, useArbeidstidElement } from '../komponenter/Metode.tsx';
import { Grupper, nyGruppe, tilGruppe } from '../komponenter/Skjema.tsx';
import { Utregningskort } from '../komponenter/Utregning.tsx';
import { useHent } from '../kontekst.ts';
import { Reduksjonsfelt, tilReduksjon } from './Planfestet.tsx';

const deler: FordelingsdelId[] = ['undervisning', 'motetid', 'annen_planfestet', 'funksjonstid', 'selvdisponert'];

function BrukAvDel({ id }: { id: FordelingsdelId }) {
  const { t } = useTekst();
  const element = useArbeidstidElement(`bruk-${id.replace('_', '-')}`);
  return (
    <Forklaring tittel={t(`arbeidstid.fordeling.deler.${id}` as Tekstnokkel)}>
      {element ? <Innholdstekst element={element} /> : <p class="dempet">{element === undefined ? t('app.lasterInn') : t('arbeidstid.metode.ikkeFunnet')}</p>}
    </Forklaring>
  );
}

export default function Fordeling() {
  const { t } = useTekst();
  const hent = useHent();
  const rader = useArsrammer(hent);
  const uker = useRegeltall(hent, 'sfs2213.skolear_uker') ?? 0;
  const [grupper, settGrupper] = useState(() => [nyGruppe()]);
  const [type, settType] = useState<Reduksjon['type']>('prosent');
  const [funksjon, settFunksjon] = useState<number | null>(null);
  const [moter, settMoter] = useState<number | null>(null);

  const inndata = grupper.map((g) => tilGruppe(g, rader, false));
  const komplett = inndata.every((g) => g !== null);
  const reduksjon = tilReduksjon(type, funksjon) ?? { type: 'prosent', prosent: 0 };
  const { resultat, feil } = prov(() => (komplett ? beregnFordeling(hent, { grupper: inndata as Gruppe[], funksjon: reduksjon, moterPerUke: moter ?? 0 }) : null));

  return (
    <Kalkulatorside id="fordeling">
      <p class="merknad">{t('arbeidstid.fordeling.illustrasjon')}</p>
      <Grupper grupper={grupper} rader={rader} periode={false} standardUker={uker} onEndring={settGrupper} />
      <Reduksjonsfelt legend={t('arbeidstid.fordeling.funksjon')} type={type} verdi={funksjon} onType={(ny) => { settType(ny); settFunksjon(null); }} onVerdi={settFunksjon} />
      <Tallfelt etikett={t('arbeidstid.fordeling.moter')} hjelpetekst={t('arbeidstid.fordeling.moterHjelp')} verdi={moter} min={0} maks={37.5} onEndring={settMoter} />
      {feil && <Feilmelding feil={feil} />}
      {resultat ? (
        <>
          <Advarsler advarsler={resultat.advarsler} />
          <Fordelingsdiagram deler={resultat.deler} totalt={resultat.arsverk.verdi} />
          <Utregningskort tittel={t('arbeidstid.resultat.stilling')} resultat={resultat.stilling} trinn={resultat.trinn}>
            <Fordelingstabell deler={resultat.deler} totalt={resultat.arsverk.verdi} />
          </Utregningskort>
        </>
      ) : (
        !feil && <ManglerInndata />
      )}
      <h2>{t('arbeidstid.fordeling.brukAvTiden')}</h2>
      {deler.map((d) => (
        <BrukAvDel key={d} id={d} />
      ))}
    </Kalkulatorside>
  );
}
