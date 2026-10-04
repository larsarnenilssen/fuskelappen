// Favorittene på forsiden (avgjørelse 056). Favorittsiden er tatt bort: favorittene står øverst på forsiden, eller
// fordelt under kategoriene sine, og sorteres der de står.
import { useEffect, useState } from 'preact/hooks';
import { Ikon } from '../components/Ikon.tsx';
import { ikonForFavoritt, samleFavorittbare } from '../modules/register.ts';
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

/**
 * Favorittene som lenker, i brukerens rekkefølge, med ikonet til funksjonen eller modulen (avgjørelse 056). Med
 * `merket` (forsiden viser alt innhold) har ikonet en liten stjerne nede til venstre, så favorittene skiller seg fra
 * boksene i kategoriene. Med bare favoritter på forsiden står ikonet uten stjerne.
 */
export function Favorittliste({ ider, merket = false }: { ider: readonly string[]; merket?: boolean }) {
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
                <span class="favorittikon">
                  <Ikon navn={ikonForFavoritt(id, f) ?? 'stjerne'} />
                  {merket && <Ikon navn="stjerne" fylt class="favorittmerke" />}
                </span>
                <span class="listelenke-tekst">
                  <span class="listelenke-tittel">{f.tittel[malform]}</span>
                </span>
                <Ikon navn="hoyre" class="ikon-liten" />
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
