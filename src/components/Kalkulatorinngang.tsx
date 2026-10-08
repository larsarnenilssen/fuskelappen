// Kalkulatorene på oversikten i en modul: kort som veiviserne, med ikonet foran tittelen og en stolpe under tittelen
// (eier 08.10.2026). Stolpen viser delene brukeren fyller inn, i grått, og det kalkulatoren regner ut, i merkefargen.
// Navnene er overskriftene i skjemaet og på resultatkortet. Forsiden har ikke stolpen (eier 08.10.2026).
import { useTekst } from '../app/tilstand.ts';
import { Ikon, type Ikonnavn } from './Ikon.tsx';

export function Kalkulatorinngang({ href, ikon, tittel, inn, ut }: { href: string; ikon: Ikonnavn; tittel: string; inn: readonly string[]; ut: string }) {
  const { t } = useTekst();
  return (
    <a class="veiviser-inngang kalkulator-inngang" href={href}>
      <span class="veiviser-inngang-topp">
        <Ikon navn={ikon} class="kalkulator-inngang-ikon" />
        <span class="veiviser-inngang-tittel">{tittel}</span>
        <Ikon navn="hoyre" />
      </span>
      <span class="skjult-visuelt">. {t('komponenter.kalkulator.innOgUt', { inn: inn.join(', '), ut })}</span>
      <span class="inngangsbilde" aria-hidden="true">
        {inn.map((navn) => (
          <span key={navn} class="inngangsbilde-ledd">
            <span class="inngangsbilde-strek" />
            <span class="inngangsbilde-navn">{navn}</span>
          </span>
        ))}
        <span class="inngangsbilde-ledd inngangsbilde-ut">
          <span class="inngangsbilde-strek" />
          <span class="inngangsbilde-navn">{ut}</span>
        </span>
      </span>
    </a>
  );
}
