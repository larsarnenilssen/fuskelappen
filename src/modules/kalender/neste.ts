// De neste datoene til gruppen «Neste datoer» på forsiden (forslag D, eier 05.10.2026, avgjørelse 066). Lastes etter
// at forsiden er tegnet, så startpakken ikke blir større.
import { velgSynlige, type Sted } from '../../core/innhold/status.ts';
import { lastEksamensdatoer } from '../../data/eksamen.ts';
import { nestePoster, rullendeVindu, velgPoster, type Kalenderpost } from './beregning/kalender.ts';
import { fristposter } from './beregning/oppforinger.ts';
import { hentAlleFrister } from './data.ts';

/** De `antall` neste datoene fra i dag, med fylkets egne datoer når fylket er valgt. */
export async function hentNeste(sted: Sted, idag: string, antall = 3): Promise<Kalenderpost[]> {
  const [frister, data] = await Promise.all([hentAlleFrister(), lastEksamensdatoer().catch(() => null)]);
  const poster = fristposter(velgSynlige(frister, sted), data, rullendeVindu(idag), sted.fylke);
  return nestePoster(velgPoster(poster, { tema: null, gruppe: null }), idag, antall);
}
