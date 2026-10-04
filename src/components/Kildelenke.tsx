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

/** «§ 4-19 første ledd» → «4-19», når punktet begynner med en paragraf. */
const PARAGRAF = /^§\s?([0-9]+[a-z]?(?:-[0-9]+[a-z]?)?)/i;

/**
 * Navn, punkt og adresse for en kilde, slik den vises og kopieres. Med `kort` brukes kortnavnet fra kilderegisteret.
 * Peker punktet på en paragraf i en lov eller forskrift hos Lovdata, går adressen til paragrafen.
 */
export function kildeTekst(t: T, kilde: KildeRef, kort = false): { navn: string; punkt: string; url: string | undefined } {
  const k = kilder.get(kilde.id);
  // «punkt 5.2», men «Vedlegg 1» og «Kap. 1 § 12.4» uten «punkt» foran. Slutter navnet med punktet, f.eks. et felt i
  // registreringshåndboken, gjentas det ikke.
  const navn = (kort ? k?.kortnavn : undefined) ?? k?.navn ?? t('komponenter.kilde.ukjent');
  const gjentatt = kilde.punkt !== undefined && navn.endsWith(`, ${kilde.punkt}`);
  const punkt = kilde.punkt && !gjentatt ? `${kort ? ' ' : ', '}${/^\d/.test(kilde.punkt) ? t('komponenter.kilde.punkt', { punkt: kilde.punkt }) : kilde.punkt}` : '';
  const paragraf = kilde.punkt ? PARAGRAF.exec(kilde.punkt)?.[1] : undefined;
  const url = kilde.url ?? (paragraf && k?.url.startsWith('https://lovdata.no/') ? `${k.url}/§${paragraf}` : k?.url);
  return { navn, punkt, url };
}

/**
 * Lenke til kilden. `kort` gir en kompakt lenke til utregningene: kortnavnet og punktet, og bare én lenke, til
 * paragrafen i appen når den finnes der, ellers til kilden.
 */
export function Kildelenke({ kilde, kort = false }: { kilde: KildeRef; kort?: boolean }) {
  const { t } = useTekst();
  const { navn, punkt, url } = kildeTekst(t, kilde, kort);
  // En paragraf hos Lovdata som også står i Lov og forskrift, får en lenke dit i tillegg (eier 02.10.2026).
  const iAppen = useLovlenke(url);
  if (kort && iAppen) {
    return (
      <a class="kildelenke kildelenke-kort" href={`#${iAppen}`} title={kildeTekst(t, kilde).navn}>
        {navn}
        {punkt}
      </a>
    );
  }
  if (!url) {
    return (
      <span class={`kildelenke${kort ? ' kildelenke-kort' : ''}`}>
        {navn}
        {punkt}
      </span>
    );
  }
  const nettsted = new URL(url).hostname.replace(/^www\./, '');
  return (
    <>
      <a class={`kildelenke${kort ? ' kildelenke-kort' : ''}`} href={url} target="_blank" rel="noopener noreferrer" title={kort ? kildeTekst(t, kilde).navn : undefined}>
        {navn}
        {punkt}
        <Ikon navn="ekstern" class="ikon-liten" />
        <span class="skjult-visuelt"> {t('felles.eksternLenke', { nettsted })}</span>
      </a>
      {iAppen && !kort && (
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

export function Kildeliste({
  kilder: liste,
  niva = 2,
  utenOverskrift = false,
}: {
  kilder: readonly KildeRef[];
  niva?: 2 | 3;
  /** Uten overskrift, f.eks. når listen står i en lukket boks som allerede heter «Kilder». */
  utenOverskrift?: boolean;
}) {
  const { t } = useTekst();
  const Overskrift = niva === 3 ? 'h3' : 'h2';
  return (
    <div class="kildeliste">
      {!utenOverskrift && <Overskrift class="liten-overskrift">{t('felles.kilder')}</Overskrift>}
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
