// Tallfelt som godtar desimalkomma og viser feil på en tilgjengelig måte.
import { useId, useState } from 'preact/hooks';
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
}

export function Tallfelt({ etikett, verdi, onEndring, enhet, hjelpetekst, min, maks }: Props) {
  const { t } = useTekst();
  const id = useId();
  const [tekst, settTekst] = useState(verdi === null ? '' : formaterTall(verdi, 4).replace(/\s/g, ''));
  const [feil, settFeil] = useState<string | null>(null);

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
    <div class={`felt${feil ? ' felt-feil' : ''}`}>
      <label for={id}>{etikett}</label>
      {hjelpetekst && (
        <p id={`${id}-hjelp`} class="felt-hjelp">
          {hjelpetekst}
        </p>
      )}
      <div class="tallfelt">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={tekst}
          aria-invalid={feil ? true : undefined}
          aria-describedby={beskrivelser || undefined}
          onInput={(e) => vedEndring(e.currentTarget.value)}
        />
        {enhet && (
          <span class="tallfelt-enhet" aria-hidden="true">
            {enhet}
          </span>
        )}
      </div>
      {feil && (
        <p id={`${id}-feil`} class="felt-feilmelding" role="alert">
          {feil}
        </p>
      )}
    </div>
  );
}
