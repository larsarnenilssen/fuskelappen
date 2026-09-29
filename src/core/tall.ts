// Tolking av tall slik brukere skriver dem: desimalkomma, mellomrom som tusenskille.

export type Talltolkning = { ok: true; verdi: number } | { ok: false; feil: 'tom' | 'ugyldig' | 'forLite' | 'forStort' };

export function tolkTall(tekst: string, grenser: { min?: number; maks?: number } = {}): Talltolkning {
  const renset = tekst
    .trim()
    .replace(/[\s\u00a0\u202f]/g, '')
    .replace(/\u2212/g, '-');
  if (renset === '') return { ok: false, feil: 'tom' };
  // Tillat både komma og punktum som desimaltegn, men bare ett av dem.
  if (!/^-?\d*([.,]\d*)?$/.test(renset) || renset === '-' || /^-?[.,]$/.test(renset)) return { ok: false, feil: 'ugyldig' };
  const verdi = Number(renset.replace(',', '.'));
  if (!Number.isFinite(verdi)) return { ok: false, feil: 'ugyldig' };
  if (grenser.min !== undefined && verdi < grenser.min) return { ok: false, feil: 'forLite' };
  if (grenser.maks !== undefined && verdi > grenser.maks) return { ok: false, feil: 'forStort' };
  return { ok: true, verdi };
}
