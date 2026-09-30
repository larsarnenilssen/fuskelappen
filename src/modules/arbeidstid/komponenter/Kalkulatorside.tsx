// Felles ramme for kalkulatorsidene: tittel med «?» for ingressen og favorittknapp, metode, advarsler og feil.
import type { ComponentChildren } from 'preact';
import { useMemo } from 'preact/hooks';
import { useTekst } from '../../../app/tilstand.ts';
import { FavorittKnapp } from '../../../components/FavorittKnapp.tsx';
import { Hjelp } from '../../../components/Hjelp.tsx';
import { Ikon } from '../../../components/Ikon.tsx';
import type { Tekstnokkel } from '../../../core/i18n/tekst.ts';
import { type AdvarselId, type Arsrammerad, type Arstimerad, type Hent, lesArsrammer, lesArstimer } from '../beregning/index.ts';
import { Metode } from './Metode.tsx';
import { aapneINyttVindu } from '../kontekst.ts';

export type KalkulatorId = 'arbeidsplan' | 'beskjeftigelse' | 'periode' | 'vikar' | 'overtid';

/**
 * Kalkulatorsiden: skjemaet (children) og resultatet. På bred skjerm står resultatet i en egen kolonne til høyre,
 * så det er synlig mens skjemaet fylles ut. På mobil kommer resultatet under skjemaet. Det som står i «etter»
 * (f.eks. forklaringer av delene i diagrammet), kommer under både skjema og resultat.
 */
export function Kalkulatorside({
  id,
  children,
  resultat,
  etter,
}: {
  id: KalkulatorId;
  children: ComponentChildren;
  resultat?: ComponentChildren;
  etter?: ComponentChildren;
}) {
  const { t } = useTekst();
  const tittel = t(`arbeidstid.kalkulatorer.${id}.tittel` as Tekstnokkel);
  return (
    <div class="side kalkulator" data-kalkulator={id}>
      <div class="tittelrad med-hjelp">
        <h1 tabIndex={-1}>{tittel}</h1>
        <Hjelp tema={tittel}>
          <p class="ingress-liten">{t(`arbeidstid.kalkulatorer.${id}.beskrivelse` as Tekstnokkel)}</p>
        </Hjelp>
        <FavorittKnapp id={`arbeidstid:${id}`} navn={tittel} />
        <button type="button" class="ikonknapp skriv-ut" aria-label={t('arbeidstid.felles.skrivUt', { navn: tittel })} title={t('arbeidstid.felles.skrivUtKort')} onClick={() => window.print()}>
          <Ikon navn="skriv" />
        </button>
        <button
          type="button"
          class="ikonknapp nytt-vindu"
          aria-label={t('arbeidstid.felles.nyttVindu', { navn: tittel })}
          title={t('arbeidstid.felles.nyttVinduKort')}
          onClick={aapneINyttVindu}
        >
          <Ikon navn="ekstern" />
        </button>
      </div>
      <div class="kalkulator-flate">
        <div class="kalkulator-skjema">{children}</div>
        {resultat && <div class="kalkulator-resultat">{resultat}</div>}
      </div>
      {etter && <div class="kalkulator-etter">{etter}</div>}
      <Metode id={`metode-${id}`} />
    </div>
  );
}

export function Advarsler({ advarsler }: { advarsler: readonly AdvarselId[] }) {
  const { t } = useTekst();
  if (advarsler.length === 0) return null;
  return (
    <>
      {advarsler.map((a) => (
        <p key={a} class="merknad merknad-advarsel" role="status">
          {t(`arbeidstid.advarsler.${a}`)}
        </p>
      ))}
    </>
  );
}

export function Feilmelding({ feil }: { feil: string }) {
  const { t } = useTekst();
  return (
    <p class="merknad merknad-advarsel" role="alert">
      {t('arbeidstid.feil.regel', { melding: feil })}
    </p>
  );
}

export function ManglerInndata() {
  const { t } = useTekst();
  return <p class="dempet">{t('arbeidstid.felles.manglerInndata')}</p>;
}

/** Årsrammene i vedlegg 1 for gjeldende periode, eller tom liste hvis regelverket mangler. */
export function useArsrammer(hent: Hent): Arsrammerad[] {
  return useMemo(() => {
    try {
      return lesArsrammer(hent('sfs2213.arsrammer'));
    } catch {
      return [];
    }
  }, [hent]);
}

/** Kjente årstimer per rad i vedlegg 1 (fra Grep), eller tom tabell hvis de mangler for perioden. */
export function useArstimer(hent: Hent): ReadonlyMap<number, Arstimerad> {
  return useMemo(() => {
    try {
      return lesArstimer(hent);
    } catch {
      return new Map<number, Arstimerad>();
    }
  }, [hent]);
}

/** Tallverdi fra regelverket for hjelpetekster, eller reserveverdi hvis den mangler. */
export function useRegeltall(hent: Hent, nokkel: string): number | null {
  return useMemo(() => {
    try {
      const v = hent(nokkel).verdi;
      return typeof v === 'number' ? v : null;
    } catch {
      return null;
    }
  }, [hent, nokkel]);
}

/** Kjører en beregning og fanger regelfeil, slik at siden kan vise en forståelig melding. */
export function prov<R>(beregning: () => R | null): { resultat: R | null; feil: string | null } {
  try {
    return { resultat: beregning(), feil: null };
  } catch (e) {
    return { resultat: null, feil: e instanceof Error ? e.message : String(e) };
  }
}
