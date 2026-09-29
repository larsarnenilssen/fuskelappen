// Beregner status og gyldighet for innhold. Rene funksjoner.
import type { Innholdselement, Kontrollert, Niva } from './skjema.ts';

export type Innholdsstatus = 'utkast' | 'kontrollert' | 'kilde_endret' | 'bor_kontrolleres';

export interface KildeEndring {
  status: 'ok' | 'endret' | 'feilet';
  /** Når endringen først ble oppdaget (ISO-tid), eller null. */
  endret_siden: string | null;
}

const MAANEDER_FOR_NY_KONTROLL = 12;

function leggTilMaaneder(dato: string, maaneder: number): string {
  const [aar, maaned, dag] = dato.split('-').map(Number) as [number, number, number];
  const d = new Date(Date.UTC(aar, maaned - 1 + maaneder, dag));
  return d.toISOString().slice(0, 10);
}

/**
 * utkast: ikke kontrollert. kilde_endret: en kilde er endret etter kontroll.
 * bor_kontrolleres: kontrollert for mer enn 12 måneder siden. Ellers kontrollert.
 */
export function beregnStatus(
  element: { kontrollert: Kontrollert; kilder: readonly { id: string }[] },
  kildestatus: Readonly<Record<string, KildeEndring | undefined>>,
  idag: string,
): Innholdsstatus {
  const kontroll = element.kontrollert;
  if (kontroll === null) return 'utkast';
  const endret = element.kilder.some((k) => {
    const s = kildestatus[k.id];
    return s?.status === 'endret' && s.endret_siden !== null && s.endret_siden.slice(0, 10) >= kontroll.dato;
  });
  if (endret) return 'kilde_endret';
  if (leggTilMaaneder(kontroll.dato, MAANEDER_FOR_NY_KONTROLL) < idag) return 'bor_kontrolleres';
  return 'kontrollert';
}

export interface Sted {
  fylke: string | null;
  skole: string | null;
}

/** Er elementet synlig for brukerens valgte fylke og skole? */
export function erSynlig(element: Pick<Innholdselement, 'gyldighet'>, sted: Sted): boolean {
  const g = element.gyldighet;
  if (g.niva === 'nasjonal') return true;
  if (g.niva === 'fylke') return sted.fylke === g.fylke;
  return sted.fylke === g.fylke && sted.skole === g.skole;
}

const rang: Record<Niva, number> = { skole: 0, fylke: 1, nasjonal: 2 };

/**
 * Velger hvilke elementer som vises. For samme id erstatter et mer lokalt element
 * et mer generelt når forholdet er «erstatter». Elementer som «supplerer», vises i tillegg.
 */
export function velgSynlige<T extends Pick<Innholdselement, 'id' | 'gyldighet'>>(elementer: readonly T[], sted: Sted): T[] {
  const synlige = elementer.filter((e) => erSynlig(e, sted));
  const supplerer = (e: T) => e.gyldighet.niva !== 'nasjonal' && e.gyldighet.forhold === 'supplerer';
  const beste = new Map<string, T>();
  for (const e of synlige) {
    if (supplerer(e)) continue;
    const naa = beste.get(e.id);
    if (!naa || rang[e.gyldighet.niva] < rang[naa.gyldighet.niva]) beste.set(e.id, e);
  }
  return synlige.filter((e) => supplerer(e) || beste.get(e.id) === e);
}

/** Grupperer elementer etter nivå, for visning av regler som supplerer hverandre. */
export function grupperEtterNiva<T extends Pick<Innholdselement, 'gyldighet'>>(elementer: readonly T[]): Record<Niva, T[]> {
  const grupper: Record<Niva, T[]> = { nasjonal: [], fylke: [], skole: [] };
  for (const e of elementer) grupper[e.gyldighet.niva].push(e);
  return grupper;
}
