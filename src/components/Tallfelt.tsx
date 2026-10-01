// Tallfelt som godtar desimalkomma og viser feil på en tilgjengelig måte. Hjelpeteksten står under feltet,
// slik at felt side om side (.feltrad) står på linje.
import type { ComponentChildren } from 'preact';
import { useEffect, useId, useState } from 'preact/hooks';
import { useTekst } from '../app/tilstand.ts';
import { formaterTall } from '../core/i18n/tekst.ts';
import { tolkTall } from '../core/tall.ts';

interface Props {
  etikett: string;
  verdi: number | null;
  onEndring: (verdi: number | null) => void;
  enhet?: string;
  hjelpetekst?: string;
  min?: number;
  maks?: number;
  /** Grå tekst i tomt felt, f.eks. verdien som brukes når feltet står tomt. */
  plassholder?: string;
  /** Skjul etiketten visuelt (den leses fortsatt av skjermlesere). Bare når enheten eller en bryter ved siden av viser hva feltet er. */
  skjultEtikett?: boolean;
  /** Vis tallet med mellomrom som tusenskille, f.eks. «600 000» for kronebeløp. Tallet formateres når brukeren forlater feltet. */
  tusenskille?: boolean;
  class?: string;
  /** Lenke eller knapp til høyre på linjen med etiketten, f.eks. for å bytte til en annen måte å fylle inn på. */
  etikettHoyre?: ComponentChildren;
}

export function Tallfelt({ etikett, verdi, onEndring, enhet, hjelpetekst, min, maks, plassholder, skjultEtikett = false, tusenskille = false, class: klasse, etikettHoyre }: Props) {
  const { t } = useTekst();
  const id = useId();
  // Mellomrom godtas når tallet tolkes, så et formatert tall kan redigeres som det står.
  const vis = (v: number) => (tusenskille ? formaterTall(v, 4) : formaterTall(v, 4).replace(/\s/g, ''));
  const [tekst, settTekst] = useState(verdi === null ? '' : vis(verdi));
  const [feil, settFeil] = useState<string | null>(null);

  // Verdien kan endres utenfra, f.eks. når årstimer fylles inn fra et valgt fag. Da vises den nye verdien,
  // men ikke mens brukeren skriver et tall som betyr det samme (f.eks. «12,»), eller et ugyldig tall.
  useEffect(() => {
    const tolket = tolkTall(tekst, { ...(min !== undefined ? { min } : {}), ...(maks !== undefined ? { maks } : {}) });
    const vist = tolket.ok ? tolket.verdi : null;
    if (vist !== verdi && !(verdi === null && !tolket.ok)) {
      settTekst(verdi === null ? '' : vis(verdi));
      settFeil(null);
    }
  }, [verdi]);

  const vedEndring = (ny: string) => {
    settTekst(ny);
    const tolket = tolkTall(ny, { ...(min !== undefined ? { min } : {}), ...(maks !== undefined ? { maks } : {}) });
    if (tolket.ok) {
      settFeil(null);
      onEndring(tolket.verdi);
      return;
    }
    onEndring(null);
    if (tolket.feil === 'tom') settFeil(null);
    else if (tolket.feil === 'forLite') settFeil(t('komponenter.tallfelt.forLite', { min: formaterTall(min ?? 0) }));
    else if (tolket.feil === 'forStort') settFeil(t('komponenter.tallfelt.forStort', { maks: formaterTall(maks ?? 0) }));
    else settFeil(t('komponenter.tallfelt.ugyldig'));
  };

  const beskrivelser = [hjelpetekst ? `${id}-hjelp` : null, feil ? `${id}-feil` : null].filter(Boolean).join(' ');

  return (
    <div class={`felt${feil ? ' felt-feil' : ''}${klasse ? ` ${klasse}` : ''}`}>
      {etikettHoyre ? (
        <div class="etikettrad med-hjelp">
          <label for={id} class={skjultEtikett ? 'skjult-visuelt' : undefined}>
            {etikett}
          </label>
          {etikettHoyre}
        </div>
      ) : (
        <label for={id} class={skjultEtikett ? 'skjult-visuelt' : undefined}>
          {etikett}
        </label>
      )}
      <div class="tallfelt">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={tekst}
          placeholder={plassholder}
          aria-invalid={feil ? true : undefined}
          aria-describedby={beskrivelser || undefined}
          onInput={(e) => vedEndring(e.currentTarget.value)}
          onBlur={() => {
            // Tusenskille settes inn når brukeren er ferdig med feltet, ikke mens det skrives.
            if (tusenskille && verdi !== null && !feil) settTekst(vis(verdi));
          }}
        />
        {enhet && (
          <span class="tallfelt-enhet" aria-hidden="true">
            {enhet}
          </span>
        )}
      </div>
      {hjelpetekst && (
        <p id={`${id}-hjelp`} class="felt-hjelp">
          {hjelpetekst}
        </p>
      )}
      {feil && (
        <p id={`${id}-feil`} class="felt-feilmelding" role="alert">
          {feil}
        </p>
      )}
    </div>
  );
}
