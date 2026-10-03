// Inntak (fase 5): søkerkategorier og rettigheter ved inntak til videregående opplæring, bygd med den felles
// veiviseren (avgjørelse 041), fristene gjennom året på en tidslinje (avgjørelse 046) og poengberegningen
// (avgjørelse 047, tallene i rules/inntak/). Innholdet står i content/inntak/. Vestland-innholdet vises bare når
// Vestland er valgt.
import { begge } from '../../core/i18n/tekst.ts';
import type { Modulmanifest } from '../typer.ts';
import { fristerRute, hentInnhold, poengRute, veiviserRute } from './innhold.ts';

export const manifest: Modulmanifest = {
  id: 'inntak',
  navn: 'moduler.inntak.navn',
  beskrivelse: 'moduler.inntak.beskrivelse',
  ikon: 'skole',
  kategori: 'elev',
  rekkefolge: 5,
  ruter: [
    { sti: '/inntak', tittel: 'inntak.tittel', side: () => import('./sider/Oversikt.tsx') },
    // Tidslinjen og poengberegningen må stå før veiviserne, fordi rutene prøves i rekkefølge.
    { sti: fristerRute, tittel: 'inntak.frister.tittel', side: () => import('./sider/Frister.tsx') },
    { sti: poengRute, tittel: 'inntak.poeng.tittel', side: () => import('./sider/Poeng.tsx') },
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
    const poeng = {
      id: 'inntak:poeng',
      type: 'funksjon' as const,
      tittel: begge('inntak.poeng.tittel'),
      tekst: begge('inntak.poeng.beskrivelse'),
      stikkord: ['poeng', 'karakterpoeng', 'poengsum', 'snitt', 'gjennomsnitt', 'inntak', 'kalkulator'],
      rute: poengRute,
      modul: 'inntak',
    };
    return [tidslinje, poeng, ...veivisere
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
    return [
      { id: 'inntak:poeng', type: 'funksjon' as const, tittel: begge('inntak.poeng.tittel'), rute: poengRute },
      ...veivisere.map((v) => ({ id: `inntak:${v.id}`, type: 'funksjon' as const, tittel: v.tittel, rute: veiviserRute(v.id) })),
    ];
  },
  async frister() {
    return (await hentInnhold()).frister;
  },
  kilder: ['opplaeringslova', 'opplaeringsforskrifta', 'udir-retten-til-vgo', 'udir-merknader-ofo', 'udir-klageinstanser', 'vestland-forskrift-inntak', 'udir-fag-og-timefordeling'],
  status: 'aktiv',
};
