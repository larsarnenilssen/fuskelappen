// Rollene i velkomsten (fase 10) og favorittene hver rolle får anbefalt. Favorittene er id-er fra modulenes
// `favorittbare` (testes). Rekkefølgen er rekkefølgen i velkomsten.

export const ROLLER = ['laerer', 'kontaktlaerer', 'radgiver', 'avdelingsleder', 'rektor'] as const;
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
  avdelingsleder: [
    'arbeidstid:arbeidsplan',
    'arbeidstid:beskjeftigelse',
    'arbeidstid:vikar',
    'vurdering:grunnlag-for-vurdering',
    'eksamen:klage-pa-karakter',
    'skolemiljo:aktivitetsplikten',
  ],
  rektor: [
    'skolemiljo:kapittel-12',
    'skolemiljo:aktivitetsplikten',
    'arbeidstid:arbeidsplan',
    'eksamen:klage-pa-karakter',
    'elevundersokelsen:oversikt',
    'statistikk:oversikt',
  ],
};

/** Rollen fra lagringen, eller null når den mangler eller ikke finnes lenger. */
export function lesRolle(verdi: string | undefined): Rolle | null {
  return (ROLLER as readonly string[]).includes(verdi ?? '') ? (verdi as Rolle) : null;
}
