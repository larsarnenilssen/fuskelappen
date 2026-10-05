// Boksen «Hos fylkeskommunen» i veiviserstegene der fylket bestemmer selv (avgjørelse 061, eier 05.10.2026): hva
// fylket bestemmer, med egne ord, og lenke til fylkets egen side om temaet. Lukket på mobil og åpen på stor skjerm.
// Uten fylke valgt kan brukeren velge fylke i en nedtrekksmeny, uten at innstillingen endres.
import { useId, useState } from 'preact/hooks';
import { fylker } from '../app/Stedmerknad.tsx';
import { useTekst, useTilstand } from '../app/tilstand.ts';
import type { Flerspraak, Fylketema } from '../core/innhold/skjema.ts';
import { fylkeFor, fylkeRute, lenkeFor, nettsted } from '../modules/fylker/innhold.ts';
import { Ikon } from './Ikon.tsx';

function Fylkeslenke({ fylke, tema }: { fylke: string; tema: Fylketema }) {
  const { t } = useTekst();
  const l = lenkeFor(fylke, tema);
  if (!l) return null;
  return (
    <p class="hos-fylket-lenke">
      <a class="ekstern-lenke" href={l.url} target="_blank" rel="noopener noreferrer">
        {t(`fylker.temaer.${l.egen ? tema : 'forside'}`)}
        <Ikon navn="ekstern" class="ikon-liten" />
      </a>
      <span class="hos-fylket-nettsted">{nettsted(l.url)}</span>
    </p>
  );
}

export function HosFylket({ tema, tekst }: { tema: Fylketema; tekst: Flerspraak }) {
  const { t, malform } = useTekst();
  const { innstillinger } = useTilstand();
  const valgt = fylkeFor(innstillinger.fylke);
  const [annet, settAnnet] = useState('');
  const velgerId = useId();
  // Åpen fra start på stor skjerm, lukket på mobil (eier 05.10.2026).
  const [aapen] = useState(() => typeof matchMedia === 'function' && matchMedia('(min-width: 48rem)').matches);
  return (
    <details class="hos-fylket" open={aapen}>
      <summary class="hos-fylket-topp">
        <span class="hos-fylket-tittel">
          <Ikon navn="kontor" class="ikon-liten" />
          {valgt ? valgt.navn : t('fylker.boks.utenFylke')}
        </span>
        <Ikon navn="ned" class="forklaring-pil" />
      </summary>
      <div class="hos-fylket-innhold">
        <p>{tekst[malform]}</p>
        {valgt ? (
          <>
            <Fylkeslenke fylke={valgt.fylke} tema={tema} />
            <p class="hos-fylket-fot">
              <a href={`#${fylkeRute(valgt.fylke)}`}>{t('fylker.boks.altOm', { fylke: valgt.navn.replace(/ (fylkeskommune|kommune)$/, '') })}</a> ·{' '}
              <a href="#/innstillinger">{t('fylker.boks.byttFylke')}</a>
            </p>
          </>
        ) : (
          <>
            <label for={velgerId}>{t('fylker.boks.visHos')}</label>
            <select id={velgerId} value={annet} onChange={(e) => settAnnet((e.target as HTMLSelectElement).value)}>
              <option value="">{t('fylker.boks.velg')}</option>
              {fylker
                .filter((f) => fylkeFor(f.nummer))
                .map((f) => (
                  <option key={f.nummer} value={f.nummer}>
                    {f.navn}
                  </option>
                ))}
            </select>
            {annet && <Fylkeslenke fylke={annet} tema={tema} />}
            <p class="hos-fylket-fot">
              <a href="#/innstillinger">{t('fylker.boks.velgIInnstillinger')}</a>
            </p>
          </>
        )}
      </div>
    </details>
  );
}
