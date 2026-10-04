// Tilrettelegging (fase 4): veivisere for tilpasset opplæring, individuell tilrettelegging og særskilt
// språkopplæring, bygd med den felles veiviseren (avgjørelse 041). Innholdet står i content/tilrettelegging/.
import type { Modulmanifest } from '../typer.ts';
import { hentInnhold, veiviserRute } from './innhold.ts';

export const manifest: Modulmanifest = {
  id: 'tilrettelegging',
  navn: 'moduler.tilrettelegging.navn',
  beskrivelse: 'moduler.tilrettelegging.beskrivelse',
  ikon: 'trapp',
  kategori: 'elev',
  rekkefolge: 10,
  ruter: [
    { sti: '/tilrettelegging', tittel: 'tilrettelegging.tittel', side: () => import('./sider/Oversikt.tsx') },
    { sti: '/tilrettelegging/:veiviser', tittel: 'tilrettelegging.tittel', side: () => import('./sider/Veiviserside.tsx') },
  ],
  async sokeoppforinger() {
    const { veivisere } = await hentInnhold();
    return veivisere
      .filter((v) => v.gyldighet.niva === 'nasjonal')
      .map((v) => ({
        id: `tilrettelegging:${v.id}`,
        type: 'veiviser' as const,
        tittel: v.tittel,
        tekst: v.tekst,
        stikkord: v.stikkord,
        rute: veiviserRute(v.id),
        modul: 'tilrettelegging',
      }));
  },
  async favorittbare() {
    const { veivisere } = await hentInnhold();
    return veivisere.map((v) => ({ id: `tilrettelegging:${v.id}`, type: 'funksjon' as const, tittel: v.tittel, rute: veiviserRute(v.id) }));
  },
  async frister() {
    return [];
  },
  kilder: ['udir-veileder-tilpasset-opplaering', 'opplaeringslova'],
  status: 'aktiv',
};
