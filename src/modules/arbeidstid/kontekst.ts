// Regelkontekst for kalkulatorene: dagens dato og brukerens fylke og skole.
import { useMemo } from 'preact/hooks';
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
