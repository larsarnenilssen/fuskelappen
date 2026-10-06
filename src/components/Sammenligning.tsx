// To sider av samme sak i én boks, rad for rad (fase 6, eier 04.10.2026): en felles underoverskrift over hver rad, og
// de to cellene side om side, så overskriftene og radene står på linje. En tabell, så skjermlesere får sammenhengen.
// Med kilder står tabellen i en hvit boks med regelverket og kildene som lukkede rader nederst, som i kortene
// (Kortfot, avgjørelse 071, eier 06.10.2026).
import type { Flerspraak, KildeRef } from '../core/innhold/skjema.ts';
import { useTekst } from '../app/tilstand.ts';
import { Kortfot } from './Kortfot.tsx';
import { unikeKilder } from './kilderader.ts';

export interface Sammenligningsrad {
  id: string;
  tittel: Flerspraak;
  venstre: Flerspraak;
  hoyre: Flerspraak;
}

interface Props {
  venstre: string;
  hoyre: string;
  rader: readonly Sammenligningsrad[];
  tittel: string;
  /** Kildene til radene. Hver kilde står én gang. */
  kilder?: readonly KildeRef[];
  /** Nøkkelen radene nederst huskes som åpne med. */
  nokkel?: string;
}

export function Sammenligning({ kilder, nokkel, ...tabell }: Props) {
  if (!kilder?.length) return <Tabell {...tabell} />;
  return (
    <div class="tosidig-boks">
      <Tabell {...tabell} />
      <div class="tosidig-fot">
        <Kortfot kilder={unikeKilder(kilder)} {...(nokkel ? { nokkel } : {})} />
      </div>
    </div>
  );
}

function Tabell({ venstre, hoyre, rader, tittel }: Omit<Props, 'kilder' | 'nokkel'>) {
  const { malform } = useTekst();
  return (
    <table class="tosidig">
      <caption class="skjult-visuelt">{tittel}</caption>
      <thead>
        <tr>
          <th scope="col" class="tosidig-venstre">
            {venstre}
          </th>
          <th scope="col" class="tosidig-hoyre">
            {hoyre}
          </th>
        </tr>
      </thead>
      {rader.map((r) => (
        <tbody key={r.id}>
          <tr>
            <th scope="colgroup" colSpan={2} class="tosidig-etikett">
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
