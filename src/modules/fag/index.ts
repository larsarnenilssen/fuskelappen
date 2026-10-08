// Fag og læreplaner fra Grep: søk og filter, fagside med kompetansemål og vurdering, og favoritter (fase 2).
// Dataene hentes hver uke med npm run hent:grep (avgjørelse 022).
import { oversiktsfavoritt } from '../favoritter.ts';
import type { Modulmanifest } from '../typer.ts';
import { lastFagindeks, lastFagroller } from './data.ts';
import { fagklasser } from './klasser.ts';

export const manifest: Modulmanifest = {
  id: 'fag',
  navn: 'moduler.fag.navn',
  beskrivelse: 'moduler.fag.beskrivelse',
  ikon: 'skole',
  kategori: 'fag',
  rekkefolge: 30,
  ruter: [
    { sti: '/fag', tittel: 'fag.tittel', side: () => import('./sider/Liste.tsx') },
    { sti: '/fag/:kode', tittel: 'fag.tittel', side: () => import('./sider/Fag.tsx') },
  ],
  async sokeoppforinger() {
    const indeks = await lastFagindeks();
    // Fag utenom de vanlige i tilbudene kommer lenger ned i søket, men finnes fortsatt (avgjørelse 031).
    const klasser = fagklasser(indeks, (await lastFagroller()).roller);
    return Object.entries(indeks.fag).map(([kode, f]) => ({
      ...(klasser.get(kode) === 'vanlig' ? {} : { vekt: 0.4 }),
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
    const oversikt = oversiktsfavoritt(manifest);
    const onsket = ider?.filter((id) => id.startsWith('fag:') && id !== oversikt.id);
    const medOversikt = !ider || ider.includes(oversikt.id) ? [oversikt] : [];
    if (onsket && onsket.length === 0) return medOversikt;
    const indeks = await lastFagindeks();
    const koder = onsket ? onsket.map((id) => id.slice(4)) : Object.keys(indeks.fag);
    return [
      ...medOversikt,
      ...koder.flatMap((kode) => {
        const f = indeks.fag[kode];
        return f ? [{ id: `fag:${kode}`, type: 'fag' as const, tittel: { nb: `${f.navn.nb} (${kode})`, nn: `${f.navn.nn} (${kode})` }, rute: `/fag/${kode}` }] : [];
      }),
    ];
  },
  async frister() {
    return [];
  },
  async fakta() {
    // Lastes bare når modulen har dagen i dagens jukselapp (avgjørelse 085).
    return (await import('./fakta.ts')).fakta();
  },
  kilder: ['udir-grep', 'udir-lk20'],
  status: 'aktiv',
};
