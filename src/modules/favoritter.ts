// Felles hjelp for favorittene i modulene (avgjørelse 058).
import { begge } from '../core/i18n/tekst.ts';
import type { Favorittbar, Modulmanifest } from './typer.ts';

/** Id-en til favoritten for modulens oversiktsside, f.eks. «lov:oversikt». */
export const oversiktsid = (modul: string): string => `${modul}:oversikt`;

/**
 * Favoritten for modulens oversiktsside (den første ruten), med modulens navn og ikon. Med bare favoritter på
 * forsiden er dette måten å få en hel modul med på.
 */
export function oversiktsfavoritt(modul: Pick<Modulmanifest, 'id' | 'navn' | 'ruter' | 'ikon'>): Favorittbar {
  return { id: oversiktsid(modul.id), type: 'side', tittel: begge(modul.navn), rute: modul.ruter[0]?.sti ?? `/${modul.id}`, ikon: modul.ikon };
}

/** Bare favorittene det er spurt etter, eller alle når `ider` mangler. */
export function bareSpurte(alle: Favorittbar[], ider?: readonly string[]): Favorittbar[] {
  return ider ? alle.filter((f) => ider.includes(f.id)) : alle;
}
