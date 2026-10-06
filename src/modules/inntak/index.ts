// Inntak (fase 5): søkerkategorier og rettigheter ved inntak til videregående opplæring, bygd med den felles
// veiviseren (avgjørelse 041), fristene gjennom året på en tidslinje (avgjørelse 046) og poengberegningen
// (avgjørelse 047, tallene i rules/inntak/). Innholdet står i content/inntak/. Vestland-innholdet vises bare når
// Vestland er valgt.
import { begge } from '../../core/i18n/tekst.ts';
import type { Modulmanifest } from '../typer.ts';
import { fristerRute, gammelFristerRute, hentInnhold, merOpplaeringRute, poengRute, UNDERSIDER, veiviserRute } from './innhold.ts';
import { oversiktsfavoritt } from '../favoritter.ts';

export const manifest: Modulmanifest = {
  id: 'inntak',
  navn: 'moduler.inntak.navn',
  beskrivelse: 'moduler.inntak.beskrivelse',
  ikon: 'inngang',
  kategori: 'inntak',
  rekkefolge: 5,
  ruter: [
    { sti: '/inntak', tittel: 'inntak.tittel', side: () => import('./sider/Oversikt.tsx') },
    // Den gamle kalenderen og poengberegningen må stå før veiviserne, fordi rutene prøves i rekkefølge. Den gamle
    // adressen sender videre til kalenderen, filtrert på inntak (avgjørelse 066).
    { sti: gammelFristerRute, tittel: 'kalender.tittel', side: () => import('../kalender/sider/TilKalender.tsx') },
    { sti: poengRute, tittel: 'inntak.poeng.tittel', side: () => import('./sider/Poeng.tsx') },
    { sti: merOpplaeringRute, tittel: 'inntak.merOpplaering.tittel', side: () => import('./sider/MerOpplaering.tsx') },
    { sti: '/inntak/:veiviser', tittel: 'inntak.tittel', side: () => import('./sider/Veiviserside.tsx') },
  ],
  async sokeoppforinger() {
    const { veivisere } = await hentInnhold();
    const poeng = {
      id: 'inntak:poeng',
      type: 'kalkulator' as const,
      tittel: begge('inntak.poeng.tittel'),
      tekst: begge('inntak.poeng.beskrivelse'),
      stikkord: ['poeng', 'karakterpoeng', 'poengsum', 'snitt', 'gjennomsnitt', 'inntak', 'kalkulator'],
      rute: poengRute,
      modul: 'inntak',
    };
    const merOpplaering = {
      id: 'inntak:mer-opplaering',
      type: 'side' as const,
      tittel: begge('inntak.merOpplaering.tittel'),
      tekst: begge('inntak.merOpplaering.beskrivelse'),
      stikkord: ['mer opplæring', 'meir opplæring', 'ikke bestått', 'ikkje bestått', 'stryk', 'IV', 'fag- eller svenneprøve', 'gjennomført', '1. mars', 'fullføringsretten'],
      rute: merOpplaeringRute,
      modul: 'inntak',
    };
    return [poeng, merOpplaering, ...veivisere
      .filter((v) => v.gyldighet.niva === 'nasjonal')
      .map((v) => ({
        id: `inntak:${v.id}`,
        type: 'veiviser' as const,
        tittel: v.tittel,
        tekst: v.tekst,
        stikkord: v.stikkord,
        rute: veiviserRute(v.id),
        modul: 'inntak',
      }))];
  },
  undersider: Object.values(UNDERSIDER),
  async favorittbare() {
    const { veivisere } = await hentInnhold();
    // Ikonene kommer fra kortene på oversikten (undersider, avgjørelse 058).
    return [
      oversiktsfavoritt(manifest),
      { id: 'inntak:frister', type: 'funksjon' as const, tittel: begge('inntak.frister.tittel'), rute: fristerRute },
      { id: 'inntak:poeng', type: 'funksjon' as const, tittel: begge('inntak.poeng.tittel'), rute: poengRute },
      { id: 'inntak:mer-opplaering', type: 'funksjon' as const, tittel: begge('inntak.merOpplaering.tittel'), rute: merOpplaeringRute },
      ...veivisere.map((v) => ({ id: `inntak:${v.id}`, type: 'funksjon' as const, tittel: v.tittel, rute: veiviserRute(v.id) })),
    ];
  },
  async frister() {
    return (await hentInnhold()).frister;
  },
  kilder: ['opplaeringslova', 'opplaeringsforskrifta', 'udir-retten-til-vgo', 'udir-merknader-ofo', 'udir-mer-opplaering', 'udir-mer-opplaering-voksne', 'udir-fullforingsretten-iop', 'udir-klageinstanser', 'vestland-forskrift-inntak', 'udir-fag-og-timefordeling-grunnskole', 'vilbli'],
  status: 'aktiv',
};
