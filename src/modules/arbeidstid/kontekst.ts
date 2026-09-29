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

/**
 * Tilstand for et skjema som huskes i nettleserhistorikken (history.state) for denne siden.
 * Går brukeren til en kilde eller et begrep og tilbake, står det utfylte der fortsatt.
 * Ingenting lagres på enheten eller sendes noe sted.
 */
export function useSkjematilstand<T extends object>(nokkel: string, start: () => T, sjekk?: (lagret: T) => void): [T, (ny: T) => void] {
  const [verdi, settVerdi] = useState<T>(() => {
    try {
      const lagret = (history.state as { skjema?: Record<string, unknown> } | null)?.skjema?.[nokkel];
      if (lagret && typeof lagret === 'object') {
        const v = { ...start(), ...(lagret as Partial<T>) } as T;
        sjekk?.(v);
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
