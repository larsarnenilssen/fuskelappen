// Stegene i en prosess som en loddrett sti med nummer, f.eks. fra oppmelding til karakter på eksamen, eller fra krav til
// resultat på fag- og svenneprøven (fase 6, pakke 3). Hvert steg er et kort som kan åpnes. Over kortet står når steget
// skjer: datoene fra eksamensdatoene når de finnes, ellers `naar` fra innholdet.
import { Innholdskort, type Kortinnhold } from './Innholdskort.tsx';
import { Ikon } from './Ikon.tsx';

export interface Stisteg {
  element: Kortinnhold;
  /** Når steget skjer, f.eks. «Høst: 12. november 2026 kl. 09.00». Tom: steget står uten merke. */
  naar: readonly string[];
  aapen?: boolean;
}

export function Sti({ steg, etikett }: { steg: readonly Stisteg[]; etikett: string }) {
  return (
    <ol class="vu-sti vu-sti-tall" aria-label={etikett}>
      {steg.map((s, i) => (
        <li key={s.element.id}>
          <span class="vu-sti-nr" aria-hidden="true">
            {i + 1}
          </span>
          {s.naar.length > 0 && (
            <p class="vu-sti-naar">
              {s.naar.map((n) => (
                <span key={n} class="vu-sti-tid">
                  <Ikon navn="klokke" class="ikon-liten" />
                  {n}
                </span>
              ))}
            </p>
          )}
          <Innholdskort element={s.element} aapen={s.aapen ?? false} />
        </li>
      ))}
    </ol>
  );
}
