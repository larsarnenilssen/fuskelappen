// Rollene i velkomsten (fase 10) og favorittene hver rolle får anbefalt. Favorittene er id-er fra modulenes
// `favorittbare` (testes). Rekkefølgen er rekkefølgen i velkomsten.

export const ROLLER = ['laerer', 'kontaktlaerer', 'radgiver', 'skoleleder'] as const;
export type Rolle = (typeof ROLLER)[number];

export const ANBEFALTE: Readonly<Record<Rolle, readonly string[]>> = {
  laerer: [
    'vurdering:underveis-og-slutt',
    'vurdering:grunnlag-for-vurdering',
    'vurdering:fravaer',
    'tilrettelegging:tilpasset-og-individuell',
    'eksamen:eksamen',
    'arbeidstid:arbeidsplan',
  ],
  kontaktlaerer: [
    'vurdering:fravaer',
    'vurdering:orden-og-oppforsel',
    'skolemiljo:aktivitetsplikten',
    'tilrettelegging:tilpasset-og-individuell',
    'vurdering:grunnlag-for-vurdering',
    'kalender:oversikt',
  ],
  radgiver: [
    'inntak:rett-inntak-soknad',
    'inntak:poeng',
    'inntak:frister',
    'opplaeringslop:lop',
    'opplaeringslop:laerlinger-og-kandidater',
    'tilrettelegging:sprak-og-kort-botid',
  ],
  // Rektor og avdelingsleder er én rolle (eier 08.10.2026): arbeidstiden til de ansatte, plikten til å handle når en
  // elev ikke har det trygt og godt, klagene og tallene for skolen.
  skoleleder: [
    'arbeidstid:arbeidsplan',
    'arbeidstid:beskjeftigelse',
    'skolemiljo:aktivitetsplikten',
    'eksamen:klage-pa-karakter',
    'elevundersokelsen:oversikt',
    'statistikk:oversikt',
  ],
};

/** Rollen fra lagringen, eller null når den mangler eller ikke finnes lenger. */
export function lesRolle(verdi: string | undefined): Rolle | null {
  return (ROLLER as readonly string[]).includes(verdi ?? '') ? (verdi as Rolle) : null;
}
