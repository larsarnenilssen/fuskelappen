// Det lille bildet på en inngang som er et verktøy eller tall (eier 08.10.2026, docs/DESIGN.md «Kort»). På oversiktene
// i modulene står det under tittelen med navnene under stolpen. På forsiden står det kompakt, uten navn, på
// tittellinjen til høyre for tittelen, så boksen ikke blir høyere (`kompakt`).
// - Kalkulator: en stolpe med delene brukeren fyller inn, i grått, og det som regnes ut, i merkefargen. Navnene er
//   overskriftene i skjemaet og på resultatkortet.
// - Tall: små stolper i grått med én i seriefargen, som figurene i Videregående i tall: ett sted blant de andre.
// Veiviserne har sin egen fasestolpe (`Veiviserinnganger`).
import { useTekst } from '../app/tilstand.ts';

export type Bilde = { type: 'kalkulator'; inn: readonly string[]; ut: string } | { type: 'tall' };

/** Antall stolper i bildet for tall. Høydene står i base.css (`.inngangsbilde-tall`). */
const STOLPER = 9;

export function Inngangsbilde({ bilde, kompakt = false }: { bilde: Bilde; kompakt?: boolean }) {
  const { t } = useTekst();
  if (bilde.type === 'tall') {
    return (
      <span class={`inngangsbilde inngangsbilde-tall${kompakt ? ' inngangsbilde-kompakt' : ''}`} aria-hidden="true">
        {Array.from({ length: STOLPER }, (_, i) => (
          <span key={i} class="inngangsbilde-stolpe" />
        ))}
      </span>
    );
  }
  return (
    <>
      <span class="skjult-visuelt">. {t('komponenter.kalkulator.innOgUt', { inn: bilde.inn.join(', '), ut: bilde.ut })}</span>
      <span class={`inngangsbilde inngangsbilde-kalkulator${kompakt ? ' inngangsbilde-kompakt' : ''}`} aria-hidden="true">
        {bilde.inn.map((navn) => (
          <span key={navn} class="inngangsbilde-ledd">
            <span class="inngangsbilde-strek" />
            {!kompakt && <span class="inngangsbilde-navn">{navn}</span>}
          </span>
        ))}
        <span class="inngangsbilde-ledd inngangsbilde-ut">
          <span class="inngangsbilde-strek" />
          {!kompakt && <span class="inngangsbilde-navn">{bilde.ut}</span>}
        </span>
      </span>
    </>
  );
}
