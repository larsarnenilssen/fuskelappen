// Favorittene på forsiden (avgjørelse 056). Favorittsiden er tatt bort: favorittene står øverst på forsiden, eller
// fordelt under kategoriene sine, og sorteres i «Tilpass forsiden».
import { useEffect, useState } from 'preact/hooks';
import { Ikon } from '../components/Ikon.tsx';
import { samleFavorittbare } from '../modules/register.ts';
import type { Favorittbar } from '../modules/typer.ts';
import { useTekst } from './tilstand.ts';

/** Favorittene brukeren har, slått opp i modulene. `null` mens de lastes. */
export function useFavorittbare(ider: readonly string[]): Map<string, Favorittbar> | null {
  const [kjente, settKjente] = useState<Map<string, Favorittbar> | null>(null);
  const nokkel = ider.join('|');
  useEffect(() => {
    let aktiv = true;
    void samleFavorittbare(undefined, [...ider]).then((m) => aktiv && settKjente(m));
    return () => {
      aktiv = false;
    };
  }, [nokkel]);
  return kjente;
}

/** Favorittene som lenker, i brukerens rekkefølge. */
export function Favorittliste({ ider }: { ider: readonly string[] }) {
  const { t, malform } = useTekst();
  const kjente = useFavorittbare(ider);
  if (!kjente) return <p class="dempet">{t('app.lasterInn')}</p>;
  return (
    <ul class="liste favorittliste">
      {ider.map((id) => {
        const f = kjente.get(id);
        return (
          <li key={id} class="favoritt">
            {f ? (
              <a class="listelenke" href={`#${f.rute}`}>
                <Ikon navn="stjerne" fylt />
                <span class="listelenke-tekst">
                  <span class="listelenke-tittel">{f.tittel[malform]}</span>
                </span>
              </a>
            ) : (
              <span class="listelenke utilgjengelig">
                <span class="listelenke-tekst">
                  <span class="listelenke-tittel">{id}</span>
                  <span class="listelenke-under">{t('favoritter.utilgjengelig')}</span>
                </span>
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
