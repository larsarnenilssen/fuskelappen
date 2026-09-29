// Felles ramme for kalkulatorsidene: tittel med «?» for ingressen og favorittknapp, metode, advarsler og feil.
import type { ComponentChildren } from 'preact';
import { useMemo } from 'preact/hooks';
import { useTekst } from '../../../app/tilstand.ts';
import { FavorittKnapp } from '../../../components/FavorittKnapp.tsx';
import { Hjelp } from '../../../components/Hjelp.tsx';
import type { Tekstnokkel } from '../../../core/i18n/tekst.ts';
import { type AdvarselId, type Arsrammerad, type Hent, lesArsrammer } from '../beregning/index.ts';
import { Metode } from './Metode.tsx';

export type KalkulatorId = 'beskjeftigelse' | 'periode' | 'vikar' | 'planfestet' | 'fordeling' | 'overtid';

export function Kalkulatorside({ id, children }: { id: KalkulatorId; children: ComponentChildren }) {
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
      </div>
      {children}
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
