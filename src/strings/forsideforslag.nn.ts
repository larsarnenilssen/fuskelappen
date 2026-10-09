// Tekstane i forslaget til ny presentasjon av framsida (09.10.2026) på nynorsk. Same nøklar som forsideforslag.nb.ts.
import type { forsideforslagNb } from './forsideforslag.nb.ts';

type Skjema<T> = { [K in keyof T]: T[K] extends string ? string : Skjema<T[K]> };

export const forsideforslagNn: Skjema<typeof forsideforslagNb> = {
  merke: 'Aktuelt',
  meny: 'Vel kva som står i Aktuelt',
  menyTittel: 'Vis i Aktuelt',
  skjul: 'Skjul Aktuelt',
  skjulHjelp: 'Du får det tilbake under «Tilpass».',
  apne: 'Vis alt i Aktuelt',
  leggSammen: 'Legg saman Aktuelt',
  lukk: 'Lukk',
  ingen: 'Ingenting er valt.',
  tilpass: {
    tittel: 'Aktuelt',
    vis: 'Vis Aktuelt på framsida',
    hjelp: 'Kalenderen, nyheitene, tala og dagens jukselapp. Kva som står der, vel du i menyen i Aktuelt.',
  },
  linje: {
    tekst: 'Forslag {nr} av 3: {navn}.',
    prov: 'Prøv',
    lenke: 'forslag {nr} ({navn})',
    dagens: 'dagens framside',
  },
  navn: {
    1: 'sidekolonne med lukk',
    2: 'band',
    3: 'kompakt rad',
  },
};
