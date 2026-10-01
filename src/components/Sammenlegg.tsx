// Kort som kan legges sammen og åpnes igjen med et trykk på overskriften (med pil opp/ned).
// Et sammenlagt kort viser bare overskriften og en kort oppsummering, så skjemaet og resultatene tar mindre plass.
// Hvilke kort som er lagt sammen, huskes i nettleserhistorikken for siden (som det utfylte), ikke på enheten.
import type { ComponentChildren } from 'preact';
import { useCallback, useId, useState } from 'preact/hooks';
import { Ikon } from './Ikon.tsx';

function lesLukket(): Record<string, boolean> {
  try {
    const lukket = (history.state as { lukket?: unknown } | null)?.lukket;
    return lukket && typeof lukket === 'object' ? (lukket as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

/**
 * Om kortet med denne nøkkelen er lagt sammen, og en funksjon som veksler. Kortene er åpne til brukeren lukker dem,
 * med mindre `standardLukket` er satt.
 */
export function useSammenlagt(nokkel: string, standardLukket = false): [boolean, () => void] {
  const [lukket, settLukket] = useState(() => {
    const lagret = lesLukket()[nokkel];
    return typeof lagret === 'boolean' ? lagret : standardLukket;
  });
  const veksle = useCallback(() => {
    settLukket((naa) => {
      const ny = !naa;
      try {
        const tilstand = (history.state as Record<string, unknown> | null) ?? {};
        history.replaceState({ ...tilstand, lukket: { ...lesLukket(), [nokkel]: ny } }, '');
      } catch {
        // Historikken kan ikke oppdateres. Kortet virker likevel.
      }
      return ny;
    });
  }, [nokkel]);
  return [lukket, veksle];
}

/**
 * Overskriften på et kort som kan legges sammen: hele overskriften er en knapp med pil opp/ned.
 * Oppsummeringen (f.eks. faget) er med i knappens navn for skjermlesere. Synlig står den i kortet (Oppsummering).
 */
export function Sammenleggknapp({
  lukket,
  onVeksle,
  kontroll,
  oppsummering,
  children,
}: {
  lukket: boolean;
  onVeksle: () => void;
  /** Id-en til innholdet som vises og skjules. */
  kontroll: string;
  oppsummering?: ComponentChildren;
  children: ComponentChildren;
}) {
  return (
    <button type="button" class="kortknapp" aria-expanded={!lukket} aria-controls={kontroll} onClick={onVeksle}>
      <span class="kortknapp-tekst">{children}</span>
      {lukket && oppsummering && <span class="skjult-visuelt">: {oppsummering}</span>}
      <Ikon navn={lukket ? 'ned' : 'opp'} class="ikon-liten kortknapp-pil" />
    </button>
  );
}

/**
 * Oppsummeringen i et sammenlagt kort, på egen linje under overskriften. Et trykk åpner kortet. Skjermlesere får
 * oppsummeringen i knappen i overskriften, så linjen er skjult for dem.
 */
export function Oppsummering({ lukket, onVeksle, children }: { lukket: boolean; onVeksle: () => void; children?: ComponentChildren }) {
  if (!lukket || !children) return null;
  return (
    <p class="kort-oppsummering" aria-hidden="true" onClick={onVeksle}>
      {children}
    </p>
  );
}

/** Et skjemakort (fieldset) med overskrift som kan legges sammen. */
export function Sammenleggbartkort({
  nokkel,
  tittel,
  oppsummering,
  children,
}: {
  nokkel: string;
  tittel: ComponentChildren;
  oppsummering?: ComponentChildren;
  children: ComponentChildren;
}) {
  const [lukket, veksle] = useSammenlagt(nokkel);
  const innhold = useId();
  return (
    <fieldset class={`fagkort${lukket ? ' lukket' : ''}`}>
      <legend class="fagkort-tittel">
        <Sammenleggknapp lukket={lukket} onVeksle={veksle} kontroll={innhold} oppsummering={oppsummering}>
          {tittel}
        </Sammenleggknapp>
      </legend>
      <Oppsummering lukket={lukket} onVeksle={veksle}>
        {oppsummering}
      </Oppsummering>
      <div id={innhold} hidden={lukket}>
        {children}
      </div>
    </fieldset>
  );
}
