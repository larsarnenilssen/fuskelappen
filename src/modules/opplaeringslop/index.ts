// Opplæringsløp: tilbudsstrukturen i videregående i appen (pakke 5, avgjørelse 035). Program → tilbud → fag og timer,
// med lenker til fagarkene og til Vilbli for skolene som har tilbudet (avgjørelse 027).
import { lastFagindeks } from '../fag/data.ts';
import type { Modulmanifest } from '../typer.ts';
import { kortKode, tilbudRute } from './data.ts';

export const manifest: Modulmanifest = {
  id: 'opplaeringslop',
  navn: 'moduler.opplaeringslop.navn',
  beskrivelse: 'moduler.opplaeringslop.beskrivelse',
  ikon: 'veiviser',
  kategori: 'fag',
  rekkefolge: 20,
  ruter: [
    { sti: '/opplaeringslop', tittel: 'opplaeringslop.tittel', side: () => import('./sider/Oversikt.tsx') },
    { sti: '/opplaeringslop/:program', tittel: 'opplaeringslop.tittel', side: () => import('./sider/Program.tsx') },
    { sti: '/opplaeringslop/:program/:tilbud', tittel: 'opplaeringslop.tittel', side: () => import('./sider/Tilbud.tsx') },
  ],
  async sokeoppforinger() {
    // Søket trenger bare navnene, som står i fagindeksen. Tilbudene lastes først når et tilbud åpnes.
    const indeks = await lastFagindeks();
    return [
      ...Object.entries(indeks.utdanningsprogram).map(([program, navn]) => ({
        id: `opplaeringslop:${program}`,
        type: 'tilbud' as const,
        tittel: navn,
        stikkord: [program],
        rute: `/opplaeringslop/${program}`,
        modul: 'opplaeringslop',
      })),
      ...Object.entries(indeks.programomrader).map(([kode, po]) => ({
        // Varianter for særskilte skoler og opplæring i bedrift kommer lenger ned.
        ...(po.sted === 'bedrift' || /^[A-Z]{5}\d[A-Z]{2}/.test(kode) ? { vekt: 0.5 } : {}),
        id: `opplaeringslop:${kortKode(kode)}`,
        type: 'tilbud' as const,
        tittel: po.navn,
        stikkord: [kortKode(kode)],
        rute: tilbudRute(po.program, kode),
        modul: 'opplaeringslop',
      })),
    ];
  },
  async favorittbare() {
    return [];
  },
  async frister() {
    return [];
  },
  kilder: ['udir-grep', 'udir-fag-og-timefordeling'],
  status: 'aktiv',
};
