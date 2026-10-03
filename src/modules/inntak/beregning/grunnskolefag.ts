// Fagene med standpunktkarakter på vitnemålet fra grunnskolen, i rekkefølgen kalkulatoren viser dem (eier
// 03.10.2026: ferdig liste). Fagene er fra fag- og timefordelingen for grunnskolen (Udir-1-2026, vedlegg 1,
// punkt 2.2). Kildesjekken følger siden (udir-fag-og-timefordeling-grunnskole) og lager en kontrollsak når den endres. Antall standpunktkarakterer per fag står i vurderingsordningen i læreplanene for 10. trinn (Grep):
// tre i norsk (NOR01-08: muntlig, skriftlig hovedmål og skriftlig sidemål) og én i hvert av de andre fagene.
// Utdanningsvalg har «deltatt» og teller ikke. Valgfag står for seg (§ 4-19 første ledd bokstav b).
import type { KildeRef } from '../../../core/innhold/skjema.ts';

export const GRUNNSKOLEFAG = [
  'norskHovedmal',
  'norskSidemal',
  'norskMuntlig',
  'matematikk',
  'naturfag',
  'engelsk',
  'samfunnsfag',
  'krle',
  'kunstOgHandverk',
  'musikk',
  'matOgHelse',
  'kroppsoving',
  'fremmedsprak',
] as const;

export type Grunnskolefag = (typeof GRUNNSKOLEFAG)[number];

export const GRUNNSKOLEFAG_KILDER: readonly KildeRef[] = [
  { id: 'udir-fag-og-timefordeling-grunnskole', punkt: 'Tabell over fag- og timefordelingen' },
  { id: 'udir-grep', punkt: 'Vurderingsordning for 10. trinn i læreplanene, f.eks. NOR01-08' },
];
