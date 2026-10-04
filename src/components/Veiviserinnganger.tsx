// Veiviserne på oversikten i en modul: like høye kort med en liten fasestolpe, som stolpen øverst i veiviseren, og
// med fargen til hver veiviser (eier 03.10.2026, avgjørelse 042). Brukes av Tilrettelegging, Inntak og Vurdering.
// Andre kort kan stå først i samme rutenett (`foran`), så kortene får like bredde også på stor skjerm.
import type { ComponentChildren } from 'preact';
import { useTekst } from '../app/tilstand.ts';
import type { Veiviserelement } from '../core/innhold/skjema.ts';
import { Ikon } from './Ikon.tsx';

export function Veiviserinnganger({
  veivisere,
  rute,
  foran = [],
}: {
  veivisere: readonly Veiviserelement[];
  rute: (id: string) => string;
  foran?: readonly { id: string; kort: ComponentChildren }[];
}) {
  const { t, malform } = useTekst();
  return (
    <ul class="veiviser-innganger">
      {foran.map((f) => (
        <li key={f.id}>{f.kort}</li>
      ))}
      {[...veivisere]
        .sort((x, y) => x.rekkefolge - y.rekkefolge)
        .map((v) => (
          <li key={v.id}>
            <a class="veiviser-inngang" href={`#${rute(v.id)}`} data-veiviserfarge={v.farge}>
              <span class="veiviser-inngang-topp">
                <span class="veiviser-inngang-tittel">{v.tittel[malform]}</span>
                <Ikon navn="hoyre" />
              </span>
              {v.faser.length > 0 && (
                <>
                  <span class="skjult-visuelt">. {t('komponenter.veiviser.faseliste', { faser: v.faser.map((f) => f.tittel[malform]).join(', ') })}</span>
                  <span class="veiviser-inngang-faser" aria-hidden="true">
                    {v.faser.map((f) => (
                      <span key={f.id} class="veiviser-inngang-fase">
                        <span class="veiviser-inngang-strek" />
                        <span class="veiviser-inngang-fasenavn">{f.tittel[malform]}</span>
                      </span>
                    ))}
                  </span>
                  {/* På svært smal skjerm er det ikke plass til navnene under stolpen. Da står antallet her. */}
                  <span class="veiviser-inngang-antall" aria-hidden="true">
                    {t('komponenter.veiviser.antallFaser', { antall: String(v.faser.length) })}
                  </span>
                </>
              )}
            </a>
          </li>
        ))}
    </ul>
  );
}
