// Inntak (fase 5): søkerkategorier og rettigheter ved inntak til videregående opplæring, bygd med den felles
// veiviseren (avgjørelse 041), og fristene gjennom året på en tidslinje (avgjørelse 046). Innholdet står i
// content/inntak/. Vestland-innholdet vises bare når Vestland er valgt.
import { begge } from '../../core/i18n/tekst.ts';
import type { Modulmanifest } from '../typer.ts';
import { fristerRute, hentInnhold, veiviserRute } from './innhold.ts';

export const manifest: Modulmanifest = {
  id: 'inntak',
  navn: 'moduler.inntak.navn',
  beskrivelse: 'moduler.inntak.beskrivelse',
  ikon: 'skole',
  kategori: 'elev',
  rekkefolge: 5,
  ruter: [
    { sti: '/inntak', tittel: 'inntak.tittel', side: () => import('./sider/Oversikt.tsx') },
    // Tidslinjen må stå før veiviserne, fordi rutene prøves i rekkefølge.
    { sti: fristerRute, tittel: 'inntak.frister.tittel', side: () => import('./sider/Frister.tsx') },
    { sti: '/inntak/:veiviser', tittel: 'inntak.tittel', side: () => import('./sider/Veiviserside.tsx') },
  ],
  async sokeoppforinger() {
    const { veivisere } = await hentInnhold();
    const tidslinje = {
      id: 'inntak:frister',
      type: 'funksjon' as const,
      tittel: begge('inntak.frister.tittel'),
      tekst: begge('inntak.frister.beskrivelse'),
      stikkord: ['frist', 'søknadsfrist', 'tidslinje', 'inntak', '1. mars', '1. februar'],
      rute: fristerRute,
      modul: 'inntak',
    };
    return [tidslinje, ...veivisere
      .filter((v) => v.gyldighet.niva === 'nasjonal')
      .map((v) => ({
        id: `inntak:${v.id}`,
        type: 'funksjon' as const,
        tittel: v.tittel,
        tekst: v.tekst,
        stikkord: v.stikkord,
        rute: veiviserRute(v.id),
        modul: 'inntak',
      }))];
  },
  async favorittbare() {
    const { veivisere } = await hentInnhold();
    return veivisere.map((v) => ({ id: `inntak:${v.id}`, type: 'funksjon' as const, tittel: v.tittel, rute: veiviserRute(v.id) }));
  },
  async frister() {
    return (await hentInnhold()).frister;
  },
  kilder: ['opplaeringslova', 'opplaeringsforskrifta', 'udir-retten-til-vgo', 'udir-merknader-ofo', 'udir-klageinstanser', 'vestland-forskrift-inntak'],
  status: 'aktiv',
};
