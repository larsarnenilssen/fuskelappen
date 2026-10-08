// Fakta til dagens jukselapp fra begrepsbanken (avgjørelse 085): de første setningene i hvert begrep, og kodene i
// kodegruppene, f.eks. karakterene og vurderingsuttrykkene (IV, IM, Ng). Kodelistene fra VIGO er ikke med. Lastes bare
// når modulen har dagen.
import { faktaFraElementer, faktatekst } from '../../core/jukselapp/fakta.ts';
import type { Faktum } from '../typer.ts';
import { hentBegreper } from './innhold.ts';

export async function fakta(): Promise<Faktum[]> {
  const begreper = await hentBegreper();
  const fraBegreper = faktaFraElementer(begreper, { modul: 'begreper', under: 'moduler.begreper.navn', rute: (e) => `/begreper/${e.id}`, lenke: (e) => e.tittel });
  const fraKoder = begreper.flatMap((b) =>
    'kodegrupper' in b && b.kodegrupper && b.gyldighet.niva === 'nasjonal'
      ? b.kodegrupper.flatMap((g) =>
          g.koder.flatMap((k): Faktum[] => {
            const tekst = faktatekst(k.tekst);
            if (!tekst) return [];
            return [
              {
                id: `begreper:kode:${b.id}:${g.id}:${k.kode}`,
                tittel: { nb: `${k.kode} ${k.navn.nb}`, nn: `${k.kode} ${k.navn.nn}` },
                tekst: { nb: `${k.kode} (${k.navn.nb}): ${tekst.nb}`, nn: `${k.kode} (${k.navn.nn}): ${tekst.nn}` },
                under: g.tittel,
                lenke: b.tittel,
                rute: `/begreper/${b.id}?q=${encodeURIComponent(k.kode)}`,
                kilder: b.kilder,
              },
            ];
          }),
        )
      : [],
  );
  return [...fraBegreper, ...fraKoder];
}
