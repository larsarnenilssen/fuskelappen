// Fagmerknader (FAM-koder), vitnemålsmerknader (VMM-koder) og status på søkerønsker fra VIGO Kodeverksbase, til oppslagene i
// begrepsbanken og det samlede søket (avgjørelse 026). Egen JS-bit, som lastes når den trengs.
import type { Sokeoppforing } from '../../core/sok/sok.ts';
import type { Merknader, Merknadsliste } from '../fag/vigo/skjema.ts';

// Lastingen står i datalaget (avgjørelse 049).
export { lastMerknader } from '../../data/vigo.ts';

/** Begrepet som viser hver kodeliste. */
export const BEGREP_FOR: Record<Merknadsliste, string> = { fagmerknader: 'fagmerknader', vitnemalsmerknader: 'vitnemalsmerknader', sokerstatuser: 'status-sokeronsker' };

const STIKKORD: Record<Merknadsliste, string> = { fagmerknader: 'fagmerknad', vitnemalsmerknader: 'vitnemålsmerknad', sokerstatuser: 'status på søkerønske' };

/** Én søkeoppføring per gjeldende kode, som åpner oppslaget med koden søkt fram. */
export function merknadsoppforinger(m: Merknader): Sokeoppforing[] {
  return (['fagmerknader', 'vitnemalsmerknader', 'sokerstatuser'] as const).flatMap((liste) =>
    m[liste]
      .filter((x) => x.utgatt === null)
      .map((x) => ({
        id: `merknad:${x.kode}`,
        type: 'begrep' as const,
        tittel: { nb: `${x.kode} ${x.nb}`, nn: `${x.kode} ${x.nn}` },
        stikkord: [x.kode, STIKKORD[liste]],
        rute: `/begreper/${BEGREP_FOR[liste]}?q=${x.kode}`,
        modul: 'begreper',
      })),
  );
}
