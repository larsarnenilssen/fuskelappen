// Data fra utdanning.no (HK-dir), hentet hver uke av npm run hent:utdanning (avgjørelse 052 og 053):
// - skolene og tilbudene deres (virtual:skoler), koblet til skoleregisteret med skolenummeret i VIGO når appen bygges,
// - utdanningsbeskrivelsene og yrkene for programområdene (data/utdanning/yrker.json).
// Se src/data/README.md.
import type { Yrker } from '../modules/fag/utdanning/skjema.ts';
import type { Skoleoppforing } from '../modules/opplaeringslop/skoler.ts';
import { enGang } from './enGang.ts';

export interface Skoleregister {
  hentet: string | null;
  skoler: Skoleoppforing[];
}

export const lastSkoler = enGang(() => import('virtual:skoler').then((m) => m.default as Skoleregister));

export const lastYrker = enGang(() => import('../../data/utdanning/yrker.json').then((m) => m.default as unknown as Yrker));
