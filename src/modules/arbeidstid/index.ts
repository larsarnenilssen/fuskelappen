// Arbeidstid etter SFS 2213: arbeidsplan (med fordeling av arbeidstiden) og kalkulatorer for beskjeftigelse,
// vikartimer og overtid. Arbeidsplanen kan også gjelde en periode. Verdiene leses fra rules/ via hentVerdi().
import { begge } from '../../core/i18n/tekst.ts';
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
    { sti: '/arbeidstid', tittel: 'arbeidstid.tittel', side: () => import('./sider/Oversikt.tsx') },
    ...kalkulatorer.map((k) => ({ sti: k.rute, tittel: k.tittel, side: sider[k.id] })),
  ],
  async sokeoppforinger() {
    return kalkulatorer.map((k) => ({
      id: `arbeidstid:${k.id}`,
      type: 'funksjon' as const,
      tittel: begge(k.tittel),
      tekst: begge(k.beskrivelse),
      rute: k.rute,
      modul: 'arbeidstid',
    }));
  },
  async favorittbare() {
    return kalkulatorer.map((k) => ({ id: `arbeidstid:${k.id}`, type: 'funksjon' as const, tittel: begge(k.tittel), rute: k.rute }));
  },
  async frister() {
    return [];
  },
  hurtigfunksjoner: kalkulatorer.map((k) => ({ id: `arbeidstid:${k.id}`, tittel: k.kort, beskrivelse: k.beskrivelse, rute: k.rute, ikon: k.ikon })),
  kilder: ['ks-sfs2213-avtaletekst', 'ks-hovedtariffavtalen', 'arbeidsmiljoloven', 'opplaeringslova'],
  status: 'aktiv',
};
