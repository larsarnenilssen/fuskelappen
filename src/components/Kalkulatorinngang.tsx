// Kalkulatorene på oversikten i en modul: kort som veiviserne, med ikonet foran tittelen og kalkulatorstolpen under
// (`Inngangsbilde`, eier 08.10.2026).
import { Ikon, type Ikonnavn } from './Ikon.tsx';
import { Inngangsbilde } from './Inngangsbilde.tsx';

export function Kalkulatorinngang({ href, ikon, tittel, inn, ut }: { href: string; ikon: Ikonnavn; tittel: string; inn: readonly string[]; ut: string }) {
  return (
    <a class="veiviser-inngang kalkulator-inngang" href={href}>
      <span class="veiviser-inngang-topp">
        <Ikon navn={ikon} class="kalkulator-inngang-ikon" />
        <span class="veiviser-inngang-tittel">{tittel}</span>
        <Ikon navn="hoyre" />
      </span>
      <Inngangsbilde bilde={{ type: 'kalkulator', inn, ut }} />
    </a>
  );
}
