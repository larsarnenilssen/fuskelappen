// Fordeling av arbeidstiden i en tenkt stilling, med diagram og forklaring av hva tiden brukes til.
import { useTekst } from '../../../app/tilstand.ts';
import { Forklaring } from '../../../components/Forklaring.tsx';
import { Tallfelt } from '../../../components/Tallfelt.tsx';
import type { Tekstnokkel } from '../../../core/i18n/tekst.ts';
import { beregnFordeling, type FordelingsdelId, funksjonsprosent, type Gruppe, type Reduksjon, type Undervisningsgrunnlag } from '../beregning/index.ts';
import { Fordelingsdiagram, Fordelingstabell } from '../komponenter/Fordelingsdiagram.tsx';
import { Advarsler, Feilmelding, Kalkulatorside, ManglerInndata, prov, useArsrammer, useArstimer, useRegeltall } from '../komponenter/Kalkulatorside.tsx';
import { Innholdstekst, useArbeidstidElement } from '../komponenter/Metode.tsx';
import { Bryter, Grupper, Nivavelger, nyGruppe, reserverIder, tilGruppe, useFagindeks } from '../komponenter/Skjema.tsx';
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
  const arstimer = useArstimer(hent);
  const uker = useRegeltall(hent, 'sfs2213.skolear_uker') ?? 0;
  const [s, sett] = useSkjematilstand(
    'fordeling',
    () => ({
      grunnlag: 'fag' as 'fag' | 'stilling',
      grupper: [nyGruppe()],
      stilling: 100 as number | null,
      t60: null as number | null,
      t45: null as number | null,
      type: 'prosent' as Reduksjon['type'],
      funksjon: 0 as number | null,
      moter: null as number | null,
    }),
    (lagret) => reserverIder(lagret.grupper),
  );

  const inndata = s.grupper.map((g) => tilGruppe(g, rader, false));
  const utfylte = inndata.filter((g): g is Gruppe => g !== null);
  const reduksjon = tilReduksjon(s.type, s.funksjon) ?? { type: 'prosent', prosent: 0 };
  // Funksjonen i prosent av full stilling, for å se om det er undervisning igjen i stillingen.
  const funksjon = prov(() => funksjonsprosent(hent, reduksjon).prosent.verdi).resultat ?? 0;
  const arsramme = s.t60 !== null && s.t45 !== null ? ({ type: 'niva', t60: s.t60, t45: s.t45 } as const) : null;
  // En stilling med bare funksjoner (uten fag, eller med stillingsprosent lik funksjonene) kan også regnes ut.
  const grunnlag: Undervisningsgrunnlag | null =
    s.grunnlag === 'fag'
      ? utfylte.length > 0 || funksjon > 0
        ? { type: 'fag', grupper: utfylte }
        : null
      : s.stilling !== null && s.stilling > 0 && (arsramme !== null || s.stilling <= funksjon)
        ? { type: 'stilling', prosent: s.stilling, arsramme }
        : null;
  const { resultat, feil } = prov(() => (grunnlag ? beregnFordeling(hent, { undervisning: grunnlag, funksjon: reduksjon, moterPerUke: s.moter ?? 0 }) : null));

  return (
    <Kalkulatorside id="fordeling">
      <p class="merknad merknad-liten">{t('arbeidstid.fordeling.illustrasjon')}</p>
      <Bryter
        legend={t('arbeidstid.fordeling.grunnlag')}
        verdi={s.grunnlag}
        valg={[
          { verdi: 'fag', tekst: t('arbeidstid.fordeling.grunnlagFag') },
          { verdi: 'stilling', tekst: t('arbeidstid.fordeling.grunnlagStilling') },
        ]}
        onEndring={(grunnlag) => sett({ ...s, grunnlag })}
      />
      {s.grunnlag === 'fag' ? (
        <Grupper arstimer={arstimer} key="fag" grupper={s.grupper} rader={rader} indeks={indeks} periode={false} standardUker={uker} onEndring={(g) => sett({ ...s, grupper: g })} />
      ) : (
        <div class="fagkort" key="stilling">
          <Tallfelt
            etikett={t('arbeidstid.fordeling.stilling')}
            hjelpetekst={t('arbeidstid.fordeling.stillingHjelp')}
            enhet="%"
            verdi={s.stilling}
            min={0}
            maks={200}
            onEndring={(stilling) => sett({ ...s, stilling })}
          />
          <Nivavelger etikett={t('arbeidstid.fordeling.arsramme')} t60={s.t60} indeks={indeks} onEndring={(t60, t45) => sett({ ...s, t60, t45 })} />
        </div>
      )}
      <div class="fagkort" key="funksjon">
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
          <Utregningskort tittel={t('arbeidstid.resultat.stilling')} resultat={resultat.stilling} trinn={resultat.trinn} sammendrag={false} fast={false} />
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
