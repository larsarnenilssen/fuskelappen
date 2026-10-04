// To sider av samme sak i én boks, rad for rad (fase 6, eier 04.10.2026): en felles underoverskrift over hver rad, og
// de to cellene side om side, så overskriftene og radene står på linje. En tabell, så skjermlesere får sammenhengen.
import type { Flerspraak } from '../core/innhold/skjema.ts';
import { useTekst } from '../app/tilstand.ts';

export interface Sammenligningsrad {
  id: string;
  tittel: Flerspraak;
  venstre: Flerspraak;
  hoyre: Flerspraak;
}

export function Sammenligning({ venstre, hoyre, rader, tittel }: { venstre: string; hoyre: string; rader: readonly Sammenligningsrad[]; tittel: string }) {
  const { malform } = useTekst();
  return (
    <table class="sammenligning">
      <caption class="skjult-visuelt">{tittel}</caption>
      <thead>
        <tr>
          <th scope="col" class="sammenligning-venstre">
            {venstre}
          </th>
          <th scope="col" class="sammenligning-hoyre">
            {hoyre}
          </th>
        </tr>
      </thead>
      {rader.map((r) => (
        <tbody key={r.id}>
          <tr>
            <th scope="colgroup" colSpan={2} class="sammenligning-etikett">
              {r.tittel[malform]}
            </th>
          </tr>
          <tr>
            <td>{r.venstre[malform]}</td>
            <td>{r.hoyre[malform]}</td>
          </tr>
        </tbody>
      ))}
    </table>
  );
}
