// Kodelisten under et begrep: fagmerknader (FAM) eller vitnemålsmerknader (VMM) fra VIGO Kodeverksbase, med søk
// på kode og tekst. Søket står i adressen (?q=FAM01), så treff fra det samlede søket åpner listen med koden
// (avgjørelse 026). Tekstene er VIGOs egne, på bokmål eller nynorsk etter appens målform.
import { useEffect, useId, useState } from 'preact/hooks';
import { erstattAdresse } from '../../app/ruter.ts';
import { type T, useTekst } from '../../app/tilstand.ts';
import { Forklaring } from '../../components/Forklaring.tsx';
import { Ikon } from '../../components/Ikon.tsx';
import { formaterDato, formaterTall, type Malform } from '../../core/i18n/tekst.ts';
import { sokMerknader } from '../fag/vigo/oppslag.ts';
import type { Merknad, Merknader, Merknadsliste } from '../fag/vigo/skjema.ts';
import { lastMerknader } from './merknader.ts';

function bruk(t: T, m: Merknad): string {
  return [
    m.grunnskole ? t('begreper.kodeliste.grunnskole') : null,
    m.videregaende ? t('begreper.kodeliste.videregaende') : null,
    m.fagopplaering ? t('begreper.kodeliste.fagopplaering') : null,
    m.vitnemal ? t('begreper.kodeliste.vitnemal') : null,
    m.kompetansebevis ? t('begreper.kodeliste.kompetansebevis') : null,
    m.kreverVedlegg ? t('begreper.kodeliste.vedlegg') : null,
  ]
    .filter(Boolean)
    .join(' · ');
}

function Koder({ liste, t, malform }: { liste: readonly Merknad[]; t: T; malform: Malform }) {
  return (
    <ul class="kodeliste">
      {liste.map((m) => (
        <li key={m.kode} id={`kode-${m.kode}`}>
          <span class="kodeliste-kode">{m.kode}</span>
          <span class="kodeliste-tekst" lang={malform}>
            {m[malform]}
          </span>
          {bruk(t, m) && <span class="kodeliste-bruk">{bruk(t, m)}</span>}
        </li>
      ))}
    </ul>
  );
}

export function Kodeliste({ liste, sti, sporring }: { liste: Merknadsliste; sti: string; sporring: URLSearchParams }) {
  const { t, malform } = useTekst();
  const id = useId();
  const [data, settData] = useState<Merknader | 'feil' | null>(null);
  const [sok, settSok] = useState(sporring.get('q') ?? '');

  useEffect(() => {
    lastMerknader().then(settData, () => settData('feil'));
  }, []);

  if (data === 'feil') return <p role="alert">{t('begreper.kodeliste.lasterFeil')}</p>;
  if (data === null) return <p class="dempet">{t('app.lasterInn')}</p>;
  const alle = data[liste];
  const gjeldende = sokMerknader(
    alle.filter((m) => m.utgatt === null),
    sok,
  );
  const utgatte = sokMerknader(
    alle.filter((m) => m.utgatt !== null),
    sok,
  );
  const sett = (ny: string) => {
    settSok(ny);
    erstattAdresse(sti, ny.trim() ? { q: ny } : undefined);
  };
  return (
    <section class="kodelisteseksjon" aria-labelledby={`${id}-tittel`}>
      <h2 id={`${id}-tittel`}>{t(`begreper.kodeliste.tittel.${liste}`)}</h2>
      <div class="felt">
        <label for={id}>{t('begreper.kodeliste.sok')}</label>
        <div class="sokefelt">
          <Ikon navn="sok" class="sokefelt-ikon" />
          <input id={id} type="search" autoComplete="off" enterKeyHint="search" value={sok} onInput={(e) => sett(e.currentTarget.value)} />
        </div>
      </div>
      <p role="status" class="dempet liten">
        {gjeldende.length === 0 ? t('begreper.kodeliste.ingenTreff') : t('begreper.kodeliste.antall', { antall: formaterTall(gjeldende.length) })}
      </p>
      {gjeldende.length > 0 && <Koder liste={gjeldende} t={t} malform={malform} />}
      {utgatte.length > 0 && (
        <Forklaring tittel={t('begreper.kodeliste.utgatte', { antall: formaterTall(utgatte.length) })}>
          <Koder liste={utgatte} t={t} malform={malform} />
        </Forklaring>
      )}
      <p class="dempet liten">{t('begreper.kodeliste.fraVigo', { dato: formaterDato(data.hentet, malform) })}</p>
    </section>
  );
}
