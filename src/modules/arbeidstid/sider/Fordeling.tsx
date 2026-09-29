// Fordeling av arbeidstiden i en tenkt stilling, med diagram og forklaring av hva tiden brukes til.
import { useTekst } from '../../../app/tilstand.ts';
import { Forklaring } from '../../../components/Forklaring.tsx';
import { Tallfelt } from '../../../components/Tallfelt.tsx';
import type { Tekstnokkel } from '../../../core/i18n/tekst.ts';
import { beregnFordeling, type FordelingsdelId, type Gruppe, type Reduksjon } from '../beregning/index.ts';
import { Fordelingsdiagram, Fordelingstabell } from '../komponenter/Fordelingsdiagram.tsx';
import { Advarsler, Feilmelding, Kalkulatorside, ManglerInndata, prov, useArsrammer, useRegeltall } from '../komponenter/Kalkulatorside.tsx';
import { Innholdstekst, useArbeidstidElement } from '../komponenter/Metode.tsx';
import { Grupper, nyGruppe, reserverIder, tilGruppe, useFagindeks } from '../komponenter/Skjema.tsx';
import { tallTekst, Utregningskort } from '../komponenter/Utregning.tsx';
import { useHent, useSkjematilstand } from '../kontekst.ts';
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
  const indeks = useFagindeks(hent, rader);
  const uker = useRegeltall(hent, 'sfs2213.skolear_uker') ?? 0;
  const [s, sett] = useSkjematilstand(
    'fordeling',
    () => ({ grupper: [nyGruppe()], type: 'prosent' as Reduksjon['type'], funksjon: null as number | null, moter: null as number | null }),
    (lagret) => reserverIder(lagret.grupper),
  );

  const inndata = s.grupper.map((g) => tilGruppe(g, rader, false));
  const utfylte = inndata.filter((g): g is Gruppe => g !== null);
  const reduksjon = tilReduksjon(s.type, s.funksjon) ?? { type: 'prosent', prosent: 0 };
  const { resultat, feil } = prov(() => (utfylte.length > 0 ? beregnFordeling(hent, { grupper: utfylte, funksjon: reduksjon, moterPerUke: s.moter ?? 0 }) : null));

  return (
    <Kalkulatorside id="fordeling">
      <p class="merknad merknad-liten">{t('arbeidstid.fordeling.illustrasjon')}</p>
      <Grupper grupper={s.grupper} rader={rader} indeks={indeks} periode={false} standardUker={uker} onEndring={(g) => sett({ ...s, grupper: g })} />
      <div class="fagkort">
        <Reduksjonsfelt legend={t('arbeidstid.fordeling.funksjon')} type={s.type} verdi={s.funksjon} onEndring={(type, funksjon) => sett({ ...s, type, funksjon })} />
        <Tallfelt etikett={t('arbeidstid.fordeling.moter')} hjelpetekst={t('arbeidstid.fordeling.moterHjelp')} verdi={s.moter} min={0} maks={37.5} onEndring={(moter) => sett({ ...s, moter })} />
      </div>
      {feil && <Feilmelding feil={feil} />}
      {resultat ? (
        <>
          <Advarsler advarsler={resultat.advarsler} />
          <Fordelingsdiagram deler={resultat.deler} totalt={resultat.arsverk.verdi} />
          <Fordelingstabell deler={resultat.deler} totalt={resultat.arsverk.verdi} uker={resultat.arbeidsaarUker.verdi} />
          <p class="liten dempet">{t('arbeidstid.fordeling.perUkeForklaring', { uker: tallTekst(resultat.arbeidsaarUker.verdi, 1) })}</p>
          <Utregningskort tittel={t('arbeidstid.resultat.stilling')} resultat={resultat.stilling} trinn={resultat.trinn} sammendrag={false} />
        </>
      ) : (
        !feil && <ManglerInndata />
      )}
      <h2 class="liten-overskrift">{t('arbeidstid.fordeling.brukAvTiden')}</h2>
      {deler.map((d) => (
        <BrukAvDel key={d} id={d} />
      ))}
    </Kalkulatorside>
  );
}
