// Regelsettene i rules/ lastes ved bygg. All lesing av regelverdier går gjennom hentVerdi().
import { finnSupplerende, finnVerdi, type Oppslag, type Regelkontekst } from './motor.ts';
import type { Regelsett } from './skjema.ts';

const filer = import.meta.glob<Regelsett>('/rules/**/*.yaml', { eager: true, import: 'default' });

export const regelsett: readonly Regelsett[] = Object.values(filer);

export function hentVerdi(nokkel: string, kontekst: Regelkontekst): Oppslag {
  return finnVerdi(regelsett, nokkel, kontekst);
}

export function hentSupplerende(nokkel: string, kontekst: Regelkontekst) {
  return finnSupplerende(regelsett, nokkel, kontekst);
}

export type { Oppslag, Regelkontekst };
