// Regelsettene i rules/ lastes ved bygg. All lesing av regelverdier går gjennom hentVerdi().
// I utvikling og testing kommer testregelsettene i tests/fixtures/regler i tillegg (lokale testverdier).
import { ekstraRegelsett } from 'virtual:testoppsett';
import { finnSupplerende, finnVerdi, slaaSammen, type Oppslag, type Regelkontekst } from './motor.ts';
import type { Regelsett } from './skjema.ts';

const filer = import.meta.glob<Regelsett>('/rules/**/*.yaml', { eager: true, import: 'default' });

// Regelsett kan være delt på flere filer (feltet «del»). De slås sammen her.
export const regelsett: readonly Regelsett[] = slaaSammen([...Object.values(filer), ...(Object.values(ekstraRegelsett) as Regelsett[])]);

export function hentVerdi(nokkel: string, kontekst: Regelkontekst): Oppslag {
  return finnVerdi(regelsett, nokkel, kontekst);
}

export function hentSupplerende(nokkel: string, kontekst: Regelkontekst) {
  return finnSupplerende(regelsett, nokkel, kontekst);
}

export type { Oppslag, Regelkontekst };
