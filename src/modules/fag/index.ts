// Fag og læreplaner fra Grep: søk og filter, fagside med kompetansemål og vurdering, og favoritter (fase 2).
// Dataene hentes hver uke med npm run hent:grep (avgjørelse 022).
import type { Modulmanifest } from '../typer.ts';
import { lastFagindeks } from './data.ts';

export const manifest: Modulmanifest = {
  id: 'fag',
  navn: 'moduler.fag.navn',
  beskrivelse: 'moduler.fag.beskrivelse',
  ikon: 'skole',
  kategori: 'fag',
  rekkefolge: 10,
  ruter: [
    { sti: '/fag', tittel: 'fag.tittel', side: () => import('./sider/Liste.tsx') },
    { sti: '/fag/:kode', tittel: 'fag.tittel', side: () => import('./sider/Fag.tsx') },
  ],
  async sokeoppforinger() {
    const indeks = await lastFagindeks();
    return Object.entries(indeks.fag).map(([kode, f]) => ({
      id: `fag:${kode}`,
      type: 'fag' as const,
      tittel: f.navn,
      stikkord: [kode],
      rute: `/fag/${kode}`,
      modul: 'fag',
    }));
  },
  async favorittbare(ider) {
    // Fagindeksen lastes bare når brukeren har fag blant favorittene.
    const onsket = ider?.filter((id) => id.startsWith('fag:'));
    if (onsket && onsket.length === 0) return [];
    const indeks = await lastFagindeks();
    const koder = onsket ? onsket.map((id) => id.slice(4)) : Object.keys(indeks.fag);
    return koder.flatMap((kode) => {
      const f = indeks.fag[kode];
      return f ? [{ id: `fag:${kode}`, type: 'fag' as const, tittel: { nb: `${f.navn.nb} (${kode})`, nn: `${f.navn.nn} (${kode})` }, rute: `/fag/${kode}` }] : [];
    });
  },
  async frister() {
    return [];
  },
  kilder: ['udir-grep', 'udir-lk20'],
  status: 'aktiv',
};
