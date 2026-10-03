// Lenke til en kilde i kilderegisteret, med punkt der det er oppgitt.
import kilderegister from '../../content/kilder.yaml';
import { type T, useTekst } from '../app/tilstand.ts';
import type { KildeRef, Kilderegister } from '../core/innhold/skjema.ts';
import { useLovlenke } from '../modules/lov/lenker.ts';
import { Ikon } from './Ikon.tsx';

const kilder = new Map((kilderegister as Kilderegister).kilder.map((k) => [k.id, k]));

export function finnKilde(id: string) {
  return kilder.get(id);
}

/** Navn, punkt og adresse for en kilde, slik den vises og kopieres. */
export function kildeTekst(t: T, kilde: KildeRef): { navn: string; punkt: string; url: string | undefined } {
  const k = kilder.get(kilde.id);
  // «punkt 5.2», men «Vedlegg 1» og «Kap. 1 § 12.4» uten «punkt» foran.
  const punkt = kilde.punkt ? `, ${/^\d/.test(kilde.punkt) ? t('komponenter.kilde.punkt', { punkt: kilde.punkt }) : kilde.punkt}` : '';
  return { navn: k?.navn ?? t('komponenter.kilde.ukjent'), punkt, url: kilde.url ?? k?.url };
}

export function Kildelenke({ kilde }: { kilde: KildeRef }) {
  const { t } = useTekst();
  const { navn, punkt, url } = kildeTekst(t, kilde);
  // En paragraf hos Lovdata som også står i Lov og forskrift, får en lenke dit i tillegg (eier 02.10.2026).
  const iAppen = useLovlenke(url);
  if (!url) {
    return (
      <span class="kildelenke">
        {navn}
        {punkt}
      </span>
    );
  }
  const nettsted = new URL(url).hostname.replace(/^www\./, '');
  return (
    <>
      <a class="kildelenke" href={url} target="_blank" rel="noopener noreferrer">
        {navn}
        {punkt}
        <Ikon navn="ekstern" class="ikon-liten" />
        <span class="skjult-visuelt"> {t('felles.eksternLenke', { nettsted })}</span>
      </a>
      {iAppen && (
        <>
          {' · '}
          <a class="kildelenke" href={`#${iAppen}`}>
            {t('komponenter.kilde.iAppen')}
          </a>
        </>
      )}
    </>
  );
}

export function Kildeliste({ kilder: liste, niva = 2 }: { kilder: readonly KildeRef[]; niva?: 2 | 3 }) {
  const { t } = useTekst();
  const Overskrift = niva === 3 ? 'h3' : 'h2';
  return (
    <div class="kildeliste">
      <Overskrift class="liten-overskrift">{t('felles.kilder')}</Overskrift>
      <ul>
        {liste.map((k) => (
          <li key={`${k.id}-${k.punkt ?? ''}`}>
            <Kildelenke kilde={k} />
          </li>
        ))}
      </ul>
    </div>
  );
}
