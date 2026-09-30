// Regelkontekst for kalkulatorene: dagens dato og brukerens fylke og skole.
import { useCallback, useMemo, useState } from 'preact/hooks';
import { useTilstand } from '../../app/tilstand.ts';
import { hentVerdi, type Regelkontekst } from '../../core/regler/index.ts';
import type { Hent } from './beregning/index.ts';

export function iDag(): string {
  const d = new Date();
  const to = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${to(d.getMonth() + 1)}-${to(d.getDate())}`;
}

export function useRegelkontekst(): Regelkontekst {
  const { innstillinger } = useTilstand();
  const fylke = innstillinger.fylke;
  const skole = innstillinger.skole?.id ?? null;
  return useMemo(() => ({ dato: iDag(), fylke, skole }), [fylke, skole]);
}

/** Leser regelverdier med brukerens kontekst. Lokale verdier (fylke, skole) går foran nasjonale. */
export function useHent(): Hent {
  const kontekst = useRegelkontekst();
  return useMemo(() => (nokkel: string) => hentVerdi(nokkel, kontekst), [kontekst]);
}

/** Navnet på vinduer som er åpnet med «Åpne i nytt vindu». Hvert vindu får et eget navn, så de ikke erstatter hverandre. */
const VINDU = 'protokollen-vindu-';

/**
 * Åpner siden i et eget vindu, så flere kalkulatorer kan være åpne samtidig på skrivebordet.
 * Det utfylte følger med: det nye vinduet leser skjemaet fra vinduet som åpnet det (samme opphav) når det starter.
 */
export function aapneINyttVindu(): void {
  window.open(location.href, `${VINDU}${Date.now()}`, 'popup,width=560,height=900');
}

/** Skjemaet i vinduet som åpnet dette, når vinduet er åpnet med aapneINyttVindu. */
function skjemaFraOpphav(nokkel: string): unknown {
  try {
    if (!window.name.startsWith(VINDU) || !window.opener) return undefined;
    const opphav = (window.opener as Window).history.state as { skjema?: Record<string, unknown> } | null;
    const lagret = opphav?.skjema?.[nokkel];
    // Kopier som JSON, så skjemaet ikke deler objekter med det andre vinduet.
    return lagret === undefined ? undefined : (JSON.parse(JSON.stringify(lagret)) as unknown);
  } catch {
    return undefined;
  }
}

/**
 * Tilstand for et skjema som huskes i nettleserhistorikken (history.state) for denne siden.
 * Går brukeren til en kilde eller et begrep og tilbake, står det utfylte der fortsatt.
 * Ingenting lagres på enheten eller sendes noe sted.
 */
export function useSkjematilstand<T extends object>(nokkel: string, start: () => T, sjekk?: (lagret: T) => void): [T, (ny: T) => void] {
  const [verdi, settVerdi] = useState<T>(() => {
    try {
      const egen = (history.state as { skjema?: Record<string, unknown> } | null)?.skjema?.[nokkel];
      const lagret = egen ?? skjemaFraOpphav(nokkel);
      if (lagret && typeof lagret === 'object') {
        const v = { ...start(), ...(lagret as Partial<T>) } as T;
        sjekk?.(v);
        if (egen === undefined) {
          const tilstand = (history.state as Record<string, unknown> | null) ?? {};
          history.replaceState({ ...tilstand, skjema: { ...((tilstand.skjema as Record<string, unknown> | undefined) ?? {}), [nokkel]: v } }, '');
        }
        return v;
      }
    } catch {
      // Ugyldig eller manglende historikk: start på nytt.
    }
    return start();
  });
  const sett = useCallback(
    (ny: T) => {
      settVerdi(ny);
      try {
        const tilstand = (history.state as Record<string, unknown> | null) ?? {};
        const skjema = { ...((tilstand.skjema as Record<string, unknown> | undefined) ?? {}), [nokkel]: ny };
        history.replaceState({ ...tilstand, skjema }, '');
      } catch {
        // Historikken kan ikke oppdateres (f.eks. for stor tilstand). Skjemaet virker likevel.
      }
    },
    [nokkel],
  );
  return [verdi, sett];
}
