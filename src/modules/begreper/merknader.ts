// Fagmerknader (FAM-koder) og vitnemålsmerknader (VMM-koder) fra VIGO Kodeverksbase, til oppslagene i
// begrepsbanken og det samlede søket (avgjørelse 026). Egen JS-bit, som lastes når den trengs.
import type { Sokeoppforing } from '../../core/sok/sok.ts';
import type { Merknader, Merknadsliste } from '../fag/vigo/skjema.ts';

// Lastingen står i datalaget (avgjørelse 049).
export { lastMerknader } from '../../data/vigo.ts';

/** Begrepet som viser hver kodeliste. */
export const BEGREP_FOR: Record<Merknadsliste, string> = { fagmerknader: 'fagmerknader', vitnemalsmerknader: 'vitnemalsmerknader' };

/** Én søkeoppføring per gjeldende kode, som åpner oppslaget med koden søkt fram. */
export function merknadsoppforinger(m: Merknader): Sokeoppforing[] {
  return (['fagmerknader', 'vitnemalsmerknader'] as const).flatMap((liste) =>
    m[liste]
      .filter((x) => x.utgatt === null)
      .map((x) => ({
        id: `merknad:${x.kode}`,
        type: 'begrep' as const,
        tittel: { nb: `${x.kode} ${x.nb}`, nn: `${x.kode} ${x.nn}` },
        stikkord: [x.kode, liste === 'fagmerknader' ? 'fagmerknad' : 'vitnemålsmerknad'],
        rute: `/begreper/${BEGREP_FOR[liste]}?q=${x.kode}`,
        modul: 'begreper',
      })),
  );
}
