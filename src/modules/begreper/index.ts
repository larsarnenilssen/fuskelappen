// Begrepsbanken: felles modul som alle moduler legger sine begreper i.
// Skjult til fase 1 gir den innhold.
import type { Modulmanifest } from '../typer.ts';
import { hentBegreper } from './innhold.ts';

export const manifest: Modulmanifest = {
  id: 'begreper',
  navn: 'moduler.begreper.navn',
  beskrivelse: 'moduler.begreper.beskrivelse',
  ikon: 'bok',
  kategori: 'felles',
  rekkefolge: 10,
  ruter: [
    { sti: '/begreper', tittel: 'begreper.tittel', side: () => import('./sider/Liste.tsx') },
    { sti: '/begreper/:id', tittel: 'begreper.tittel', side: () => import('./sider/Begrep.tsx') },
  ],
  async sokeoppforinger() {
    return (await hentBegreper()).map((b) => ({
      id: `begrep:${b.id}`,
      type: 'begrep' as const,
      tittel: b.tittel,
      tekst: b.tekst,
      stikkord: b.stikkord,
      rute: `/begreper/${b.id}`,
      modul: 'begreper',
    }));
  },
  async favorittbare() {
    return (await hentBegreper()).map((b) => ({
      id: `begreper:${b.id}`,
      type: 'begrep' as const,
      tittel: b.tittel,
      rute: `/begreper/${b.id}`,
    }));
  },
  async frister() {
    return [];
  },
  kilder: [],
  status: 'skjult',
};
