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

/** Overskriften i kolonnen: det korte ordet på smal skjerm, det fulle der det er plass (eier 04.10.2026). */
function Kolonnenavn({ kort, lang }: { kort: string; lang: string | undefined }) {
  if (!lang) return <>{kort}</>;
  return (
    <>
      <span class="sammenligning-kort">{kort}</span>
      <span class="sammenligning-lang">{lang}</span>
    </>
  );
}

export function Sammenligning({
  venstre,
  hoyre,
  venstreLang,
  hoyreLang,
  rader,
  tittel,
}: {
  venstre: string;
  hoyre: string;
  venstreLang?: string;
  hoyreLang?: string;
  rader: readonly Sammenligningsrad[];
  tittel: string;
}) {
  const { malform } = useTekst();
  return (
    <table class="sammenligning">
      <caption class="skjult-visuelt">{tittel}</caption>
      <thead>
        <tr>
          <th scope="col" class="sammenligning-venstre">
            <Kolonnenavn kort={venstre} lang={venstreLang} />
          </th>
          <th scope="col" class="sammenligning-hoyre">
            <Kolonnenavn kort={hoyre} lang={hoyreLang} />
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
