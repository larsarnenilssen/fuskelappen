// Segmentert bryter, brukt i kalkulatorene og i Opplæringsløp («Min skole» eller «Alle», avgjørelse 053).
import { useId } from 'preact/hooks';

/**
 * Segmentert bryter: et lite utvalg valg side om side (radioknapper).
 * Kompakt: mindre knapper, og etiketten (om den vises) står på samme linje som valgene.
 */
export function Bryter<V extends string>({
  legend,
  verdi,
  valg,
  onEndring,
  skjultLegend = false,
  kompakt = false,
}: {
  legend: string;
  verdi: V;
  /** `tekstKort` vises på smal skjerm, `tekst` der det er plass (eier 04.10.2026). */
  valg: { verdi: V; tekst: string; tekstKort?: string }[];
  onEndring: (v: V) => void;
  skjultLegend?: boolean;
  kompakt?: boolean;
}) {
  const id = useId();
  const knapper = (
    <div class="bryter-valg">
      {valg.map((v) => (
        <label key={v.verdi} class={verdi === v.verdi ? 'valgt' : undefined}>
          <input type="radio" name={id} checked={verdi === v.verdi} onChange={() => onEndring(v.verdi)} />
          {v.tekstKort ? (
            <span>
              <span class="bryter-kort">{v.tekstKort}</span>
              <span class="bryter-lang">{v.tekst}</span>
            </span>
          ) : (
            <span>{v.tekst}</span>
          )}
        </label>
      ))}
    </div>
  );
  if (kompakt) {
    return (
      <div class="bryter bryter-kompakt" role="radiogroup" aria-labelledby={`${id}-etikett`}>
        <span id={`${id}-etikett`} class={skjultLegend ? 'skjult-visuelt' : 'bryter-etikett'}>
          {legend}
        </span>
        {knapper}
      </div>
    );
  }
  return (
    <fieldset class="bryter">
      <legend class={skjultLegend ? 'skjult-visuelt' : 'bryter-legend'}>{legend}</legend>
      {knapper}
    </fieldset>
  );
}
