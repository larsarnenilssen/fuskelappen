// Kalkulatorene i arbeidstidsmodulen: rute, tekster og ikon. Brukes av manifestet og oversiktssiden.
import type { Ikonnavn } from '../../components/Ikon.tsx';
import type { Tekstnokkel } from '../../core/i18n/tekst.ts';
import type { KalkulatorId } from './komponenter/Kalkulatorside.tsx';

export interface Kalkulator {
  id: KalkulatorId;
  rute: string;
  tittel: Tekstnokkel;
  kort: Tekstnokkel;
  beskrivelse: Tekstnokkel;
  ikon: Ikonnavn;
  /**
   * Bildet på boksen på forsiden (eier 08.10.2026): delene brukeren fyller inn, og det kalkulatoren regner ut. Bare
   * Arbeidsplan, som har egen boks. Kalkulatorene under «Flere kalkulatorer» har ikke bilde.
   */
  bilde?: { inn: Tekstnokkel[]; ut: Tekstnokkel };
}

const ider: { id: KalkulatorId; ikon: Ikonnavn; bilde?: { inn: Tekstnokkel[]; ut: Tekstnokkel } }[] = [
  {
    id: 'arbeidsplan',
    ikon: 'arbeidsplan',
    bilde: { inn: ['arbeidstid.skjema.stilling', 'arbeidstid.skjema.undervisning', 'arbeidstid.skjema.tid'], ut: 'arbeidstid.resultat.samletBeskjeftigelse' },
  },
  { id: 'beskjeftigelse', ikon: 'kalkulator' },
  { id: 'vikar', ikon: 'kalkulator' },
  { id: 'overtid', ikon: 'kalkulator' },
];

export const kalkulatorer: Kalkulator[] = ider.map(({ id, ikon, bilde }) => ({
  id,
  rute: `/arbeidstid/${id}`,
  tittel: `arbeidstid.kalkulatorer.${id}.tittel` as Tekstnokkel,
  kort: `arbeidstid.kalkulatorer.${id}.kort` as Tekstnokkel,
  beskrivelse: `arbeidstid.kalkulatorer.${id}.beskrivelse` as Tekstnokkel,
  ikon,
  ...(bilde ? { bilde } : {}),
}));
