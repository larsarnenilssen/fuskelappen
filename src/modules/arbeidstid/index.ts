// Arbeidstid etter SFS 2213: arbeidsplan (med fordeling av arbeidstiden) og kalkulatorer for beskjeftigelse,
// vikartimer og overtid. Arbeidsplanen kan også gjelde en periode. Verdiene leses fra rules/ via hentVerdi().
import { begge, type Tekstnokkel } from '../../core/i18n/tekst.ts';
import type { Modulmanifest } from '../typer.ts';
import { kalkulatorer } from './kalkulatorer.ts';

const sider = {
  arbeidsplan: () => import('./sider/Arbeidsplan.tsx'),
  beskjeftigelse: () => import('./sider/Beskjeftigelse.tsx'),
  vikar: () => import('./sider/Vikar.tsx'),
  overtid: () => import('./sider/Overtid.tsx'),
};

export const manifest: Modulmanifest = {
  id: 'arbeidstid',
  navn: 'moduler.arbeidstid.navn',
  beskrivelse: 'moduler.arbeidstid.beskrivelse',
  ikon: 'klokke',
  kategori: 'arbeidstid',
  rekkefolge: 10,
  ruter: [
    ...kalkulatorer.map((k) => ({ sti: k.rute, tittel: k.tittel, side: sider[k.id] })),
    // Oversiktssiden er erstattet av boksene på forsiden (avgjørelse 030). Gamle lenker sendes dit.
    { sti: '/arbeidstid', tittel: 'arbeidstid.tittel', side: () => import('./sider/TilForsiden.tsx') },
  ],
  async sokeoppforinger() {
    return kalkulatorer.map((k) => ({
      id: `arbeidstid:${k.id}`,
      type: 'kalkulator' as const,
      tittel: begge(k.tittel),
      tekst: begge(k.beskrivelse),
      rute: k.rute,
      modul: 'arbeidstid',
    }));
  },
  async favorittbare() {
    return kalkulatorer.map((k) => ({ id: `arbeidstid:${k.id}`, type: 'funksjon' as const, tittel: begge(k.tittel), rute: k.rute }));
  },
  lokaleRegler: ['arbeidstid'],
  async frister() {
    return [];
  },
  async fakta() {
    // Lastes bare når modulen har dagen i dagens jukselapp (avgjørelse 086).
    return (await import('./fakta.ts')).fakta();
  },
  // Arbeidsplan er hovedboksen. De andre kalkulatorene står i en boks som kan åpnes.
  // Arbeidsplan har en kortere tekst på forsiden, så boksen ikke blir høy.
  innganger: kalkulatorer.map((k, i) => ({
    id: `arbeidstid:${k.id}`,
    tittel: k.kort,
    // Forsiden har egne, korte tekster, så boksene får én linje (eier 08.10.2026). Beskrivelsen er ingressen på siden.
    beskrivelse: `arbeidstid.kalkulatorer.${k.id}.forside` as Tekstnokkel,
    rute: k.rute,
    ikon: k.ikon,
    flere: i > 0,
  })),
  flereTittel: 'arbeidstid.kalkulatorer.flere',
  flereUnder: 'arbeidstid.kalkulatorer.flereUnder',
  kilder: ['ks-sfs2213-avtaletekst', 'ks-hovedtariffavtalen', 'arbeidsmiljoloven', 'opplaeringslova'],
  status: 'aktiv',
};
