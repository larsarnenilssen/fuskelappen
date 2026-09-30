// Beskjeftigelse for ett eller flere fag (fagkombinasjoner og blandede grupper).
import { useTekst } from '../../../app/tilstand.ts';
import { Ikon } from '../../../components/Ikon.tsx';
import { beregnBeskjeftigelse, type Gruppe } from '../beregning/index.ts';
import { Stillingsmaaler } from '../komponenter/Grafikk.tsx';
import { Advarsler, Feilmelding, Kalkulatorside, ManglerInndata, prov, useArsrammer, useArstimer, useRegeltall } from '../komponenter/Kalkulatorside.tsx';
import { Grupper, nyGruppe, reserverIder, tilGruppe, useFagindeks } from '../komponenter/Skjema.tsx';
import { Utregningskort } from '../komponenter/Utregning.tsx';
import { Varianter } from '../komponenter/Varianter.tsx';
import { overforSkjema, useHent, useSkjematilstand } from '../kontekst.ts';

export default function Beskjeftigelse() {
  const { t } = useTekst();
  const hent = useHent();
  const rader = useArsrammer(hent);
  const indeks = useFagindeks(hent, rader);
  const arstimer = useArstimer(hent);
  const uker = useRegeltall(hent, 'sfs2213.skolear_uker') ?? 0;
  const [skjema, settSkjema] = useSkjematilstand('beskjeftigelse', () => ({ grupper: [nyGruppe()] }), (s) => reserverIder(s.grupper));
  const { grupper } = skjema;

  const inndata = grupper.map((g) => tilGruppe(g, rader, false));
  const utfylte = inndata.filter((g): g is Gruppe => g !== null);
  const { resultat, feil } = prov(() => (utfylte.length > 0 ? beregnBeskjeftigelse(hent, utfylte) : null));
  let j = 0;
  const delresultater = inndata.map((g) => (g === null ? null : (resultat?.grupper[j++]?.beskjeftigelse.verdi ?? null)));

  const tittel = utfylte.length > 1 ? t('arbeidstid.resultat.sumBeskjeftigelse') : t('arbeidstid.resultat.beskjeftigelse');

  return (
    <Kalkulatorside
      id="beskjeftigelse"
      resultat={
        <>
          {feil && <Feilmelding feil={feil} />}
          {resultat ? (
            <>
              <Advarsler advarsler={resultat.advarsler} />
              <Utregningskort tittel={tittel} resultat={resultat.sum} trinn={resultat.trinn}>
                <Stillingsmaaler deler={resultat.grupper.map((g, i) => ({ navn: t('arbeidstid.felles.gruppe', { nr: i + 1 }), prosent: g.beskjeftigelse.verdi }))} />
              </Utregningskort>
              <a class="lenke-pil" href="#/arbeidstid/arbeidsplan" onClick={() => overforSkjema('arbeidsplan', { grupper })}>
                {t('arbeidstid.felles.fortsettArbeidsplan')}
                <Ikon navn="hoyre" class="ikon-liten" />
              </a>
            </>
          ) : (
            !feil && <ManglerInndata />
          )}
          <Varianter
            id="beskjeftigelse"
            skjema={skjema}
            resultat={resultat ? { tittel, verdi: resultat.sum.verdi, enhet: 'prosent' } : null}
            onHent={(v) => {
              reserverIder(v.grupper);
              settSkjema(v);
            }}
          />
        </>
      }
    >
      <Grupper
        arstimer={arstimer}
        grupper={grupper}
        rader={rader}
        indeks={indeks}
        periode={false}
        standardUker={uker}
        delresultater={delresultater}
        onEndring={(g) => settSkjema({ grupper: g })}
      />
    </Kalkulatorside>
  );
}
