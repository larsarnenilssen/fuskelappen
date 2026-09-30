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
}

const ider: { id: KalkulatorId; ikon: Ikonnavn }[] = [
  { id: 'arbeidsplan', ikon: 'kategori' },
  { id: 'beskjeftigelse', ikon: 'kalkulator' },
  { id: 'vikar', ikon: 'kalkulator' },
  { id: 'overtid', ikon: 'kalkulator' },
];

export const kalkulatorer: Kalkulator[] = ider.map(({ id, ikon }) => ({
  id,
  rute: `/arbeidstid/${id}`,
  tittel: `arbeidstid.kalkulatorer.${id}.tittel` as Tekstnokkel,
  kort: `arbeidstid.kalkulatorer.${id}.kort` as Tekstnokkel,
  beskrivelse: `arbeidstid.kalkulatorer.${id}.beskrivelse` as Tekstnokkel,
  ikon,
}));
