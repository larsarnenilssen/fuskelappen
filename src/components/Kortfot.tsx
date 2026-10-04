// Paragrafene i regelverket og kildene som lukkede rader nederst i et kort, med strek mellom (eier 03.10.2026). Eier
// 04.10.2026: slik i alle kort og bokser i appen, ikke bare i veiviserne. Utenfor kort, f.eks. nederst på en side eller
// i begrepene, står kildene som før.
import type { ComponentChildren } from 'preact';
import { useTekst } from '../app/tilstand.ts';
import type { KildeRef } from '../core/innhold/skjema.ts';
import { Ikon } from './Ikon.tsx';
import { Kildeliste } from './Kildelenke.tsx';
import { Paragraflenker } from './Paragraflenker.tsx';

interface Props {
  paragrafer?: readonly string[] | undefined;
  kilder: readonly KildeRef[];
  /** Rader mellom regelverket og kildene, f.eks. «Mer om dette steget» i veiviserne. */
  children?: ComponentChildren;
}

/** Radene uten ramme, til kort som har sin egen bunn (veiviserne og fristene). */
export function KortfotRader({ paragrafer = [], kilder, children }: Props) {
  const { t } = useTekst();
  return (
    <>
      {paragrafer.length > 0 && (
        <details class="veiviser-kilder veiviser-regelverk">
          <summary class="forklaring-knapp">
            <Ikon navn="paragraf" />
            <span>{t('komponenter.veiviser.regelverkAntall', { antall: String(paragrafer.length) })}</span>
            <Ikon navn="ned" class="forklaring-pil" />
          </summary>
          <Paragraflenker paragrafer={paragrafer} overskrift={t('komponenter.veiviser.regelverk')} utenOverskrift />
        </details>
      )}
      {children}
      {kilder.length > 0 && (
        <details class="veiviser-kilder">
          <summary class="forklaring-knapp">
            <Ikon navn="bok" />
            <span>{t('komponenter.veiviser.kilder', { antall: String(kilder.length) })}</span>
            <Ikon navn="ned" class="forklaring-pil" />
          </summary>
          <Kildeliste kilder={kilder} niva={3} utenOverskrift />
        </details>
      )}
    </>
  );
}

/** Radene festet nederst i kortet, fra kant til kant. */
export function Kortfot(props: Props) {
  if (!props.paragrafer?.length && props.kilder.length === 0 && !props.children) return null;
  return (
    <div class="kortfot">
      <KortfotRader {...props} />
    </div>
  );
}
