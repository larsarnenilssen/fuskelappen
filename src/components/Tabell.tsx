// En tabell fra innholdet (`tabell` på et kort, fase 6, pakke 3), som står åpen over kortet så den gir oversikt med
// ett blikk. `rutenett` viser radene mot kolonnene, med et stort tall og en kort tekst i hver rute, f.eks. antall
// eksamener per trinn og utdanningsprogram. `kort` viser hver rad som et kort med kolonnene som etiketter, så lange
// tekster kan leses også på mobil.
import { useTekst } from '../app/tilstand.ts';
import type { Flerspraak, Tabell as TabellData } from '../core/innhold/skjema.ts';

export function Tabell({ tabell, tittel }: { tabell: TabellData; tittel: Flerspraak }) {
  const { malform } = useTekst();
  if (tabell.form === 'kort') {
    return (
      <ul class="tabell-kort" aria-label={tittel[malform]}>
        {tabell.rader.map((r) => (
          <li key={r.tittel.nb} class="tabell-kort-rad">
            <h3 class="tabell-kort-tittel">{r.tittel[malform]}</h3>
            <dl>
              {r.celler.map((c, i) => (
                <div key={i}>
                  <dt>{tabell.kolonner[i]?.[malform]}</dt>
                  <dd>{c.tekst[malform]}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <table class="tabell-rutenett">
      <caption class="skjult-visuelt">{tittel[malform]}</caption>
      <thead>
        <tr>
          <td />
          {tabell.kolonner.map((k) => (
            <th key={k.nb} scope="col">
              {k[malform]}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {tabell.rader.map((r) => (
          <tr key={r.tittel.nb}>
            <th scope="row">{r.tittel[malform]}</th>
            {r.celler.map((c, i) => (
              <td key={i} colSpan={r.celler.length === 1 ? tabell.kolonner.length : undefined}>
                {c.tall && <span class="tabell-tall">{c.tall}</span>}
                <span class="tabell-tekst">{c.tekst[malform]}</span>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
