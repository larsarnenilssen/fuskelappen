// Liste over favoritter. Rekkefølgen endres med knapper, ikke dra-gester.
import { useEffect, useState } from 'preact/hooks';
import { Ikon } from '../components/Ikon.tsx';
import { samleFavorittbare } from '../modules/register.ts';
import type { Favorittbar } from '../modules/typer.ts';
import { flyttFavoritt, useTekst, useTilstand, vekslFavoritt } from './tilstand.ts';

export function Favorittliste({ kompakt = false }: { kompakt?: boolean }) {
  const { t, malform } = useTekst();
  const { favoritter } = useTilstand();
  const [kjente, settKjente] = useState<Map<string, Favorittbar> | null>(null);

  const ider = favoritter.join('|');
  useEffect(() => {
    let aktiv = true;
    void samleFavorittbare(undefined, ider.split('|')).then((m) => aktiv && settKjente(m));
    return () => {
      aktiv = false;
    };
  }, [ider]);

  if (!kjente) return <p class="dempet">{t('app.lasterInn')}</p>;

  return (
    <ul class="liste favorittliste">
      {favoritter.map((id, i) => {
        const f = kjente.get(id);
        const navn = f ? f.tittel[malform] : id;
        return (
          <li key={id} class="favoritt">
            {f ? (
              <a class="listelenke" href={`#${f.rute}`}>
                <Ikon navn="stjerne" fylt />
                <span class="listelenke-tekst">
                  <span class="listelenke-tittel">{navn}</span>
                </span>
              </a>
            ) : (
              <span class="listelenke utilgjengelig">
                <span class="listelenke-tekst">
                  <span class="listelenke-tittel">{navn}</span>
                  <span class="listelenke-under">{t('favoritter.utilgjengelig')}</span>
                </span>
              </span>
            )}
            {!kompakt && (
              <span class="favoritt-knapper">
                <button
                  type="button"
                  class="ikonknapp"
                  disabled={i === 0}
                  aria-label={t('favoritter.flyttOpp', { navn })}
                  onClick={() => flyttFavoritt(id, -1)}
                >
                  <Ikon navn="opp" />
                </button>
                <button
                  type="button"
                  class="ikonknapp"
                  disabled={i === favoritter.length - 1}
                  aria-label={t('favoritter.flyttNed', { navn })}
                  onClick={() => flyttFavoritt(id, 1)}
                >
                  <Ikon navn="ned" />
                </button>
                <button type="button" class="ikonknapp" aria-label={t('favoritter.fjern', { navn })} onClick={() => vekslFavoritt(id)}>
                  <Ikon navn="lukk" />
                </button>
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
