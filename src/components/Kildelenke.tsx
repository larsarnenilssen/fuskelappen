// Lenke til en kilde i kilderegisteret, med punkt der det er oppgitt.
import kilderegister from '../../content/kilder.yaml';
import { useTekst } from '../app/tilstand.ts';
import type { KildeRef, Kilderegister } from '../core/innhold/skjema.ts';
import { Ikon } from './Ikon.tsx';

const kilder = new Map((kilderegister as Kilderegister).kilder.map((k) => [k.id, k]));

export function finnKilde(id: string) {
  return kilder.get(id);
}

export function Kildelenke({ kilde }: { kilde: KildeRef }) {
  const { t } = useTekst();
  const k = kilder.get(kilde.id);
  const url = kilde.url ?? k?.url;
  const navn = k?.navn ?? t('komponenter.kilde.ukjent');
  const punkt = kilde.punkt ? `, ${t('komponenter.kilde.punkt', { punkt: kilde.punkt })}` : '';
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
    <a class="kildelenke" href={url} target="_blank" rel="noopener noreferrer">
      {navn}
      {punkt}
      <Ikon navn="ekstern" class="ikon-liten" />
      <span class="skjult-visuelt"> {t('felles.eksternLenke', { nettsted })}</span>
    </a>
  );
}

export function Kildeliste({ kilder: liste }: { kilder: readonly KildeRef[] }) {
  const { t } = useTekst();
  return (
    <div class="kildeliste">
      <h2 class="liten-overskrift">{t('felles.kilder')}</h2>
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
