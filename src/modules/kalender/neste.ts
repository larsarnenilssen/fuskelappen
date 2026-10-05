// De neste datoene til gruppen «Neste datoer» på forsiden (forslag D, eier 05.10.2026, avgjørelse 066). Lastes etter
// at forsiden er tegnet, så startpakken ikke blir større.
import type { Sted } from '../../core/innhold/status.ts';
import { nestePoster, rullendeVindu, velgPoster, type Kalenderpost } from './beregning/kalender.ts';
import { hentKalenderdata, samle } from './samle.ts';

/** De `antall` neste datoene fra i dag, med fylkets egne datoer og skoleruta når fylket er valgt. */
export async function hentNeste(sted: Sted, idag: string, antall = 3): Promise<Kalenderpost[]> {
  const { poster } = samle(await hentKalenderdata(), sted, rullendeVindu(idag));
  return nestePoster(velgPoster(poster, { tema: null, gruppe: null }), idag, antall);
}
