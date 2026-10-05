// Gruppene treffene i søket kan filtreres på (avgjørelse 058). Hver type hører til én gruppe. Rene funksjoner, så de
// kan testes uten grensesnittet, og fila laster ikke MiniSearch.
import type { Sokeoppforingstype } from './sok.ts';

export const SOKEGRUPPER = ['sider', 'regelverk', 'fag', 'begreper', 'tilbud'] as const;
export type Sokegruppe = (typeof SOKEGRUPPER)[number];

/** Gruppen hver type hører til. En ny type må få en gruppe her (typesjekken krever det). */
export const GRUPPE_FOR_TYPE: Record<Sokeoppforingstype, Sokegruppe> = {
  modul: 'sider',
  side: 'sider',
  veiviser: 'sider',
  kalkulator: 'sider',
  tidslinje: 'sider',
  lov: 'regelverk',
  regel: 'regelverk',
  fag: 'fag',
  laereplanverk: 'fag',
  begrep: 'begreper',
  kode: 'begreper',
  fagmerknad: 'begreper',
  vitnemalsmerknad: 'begreper',
  sokerstatus: 'begreper',
  tilbud: 'tilbud',
  skole: 'tilbud',
  kontor: 'tilbud',
};

/** Antall treff i hver gruppe, i fast rekkefølge, bare gruppene som har treff. */
export function tellGrupper(treff: readonly { type: Sokeoppforingstype }[]): { gruppe: Sokegruppe; antall: number }[] {
  const antall = new Map<Sokegruppe, number>();
  for (const t of treff) {
    const g = GRUPPE_FOR_TYPE[t.type];
    antall.set(g, (antall.get(g) ?? 0) + 1);
  }
  return SOKEGRUPPER.filter((g) => antall.has(g)).map((g) => ({ gruppe: g, antall: antall.get(g) ?? 0 }));
}

/** Treffene i gruppen, eller alle når filteret er `alle`. */
export function filtrerTreff<T extends { type: Sokeoppforingstype }>(treff: readonly T[], filter: Sokegruppe | 'alle'): T[] {
  return filter === 'alle' ? [...treff] : treff.filter((t) => GRUPPE_FOR_TYPE[t.type] === filter);
}
