// Opplæringstilbud (id opplaeringslop, eier 03.10.2026): tilbudsstrukturen i videregående i appen (pakke 5, avgjørelse 035). Program → tilbud → fag og timer,
// med lenker til fagarkene og til Vilbli for skolene som har tilbudet (avgjørelse 027). Skoleregisteret og
// opplæringskontorene (avgjørelse 053).
import { lastFagindeks } from '../fag/data.ts';
import type { Modulmanifest } from '../typer.ts';
import { kortKode, tilbudRute } from './data.ts';
import { lastSkoler } from '../../data/utdanning.ts';
import { begge } from '../../core/i18n/tekst.ts';
import { fylker } from '../../app/Stedmerknad.tsx';

export const manifest: Modulmanifest = {
  id: 'opplaeringslop',
  navn: 'moduler.opplaeringslop.navn',
  beskrivelse: 'moduler.opplaeringslop.beskrivelse',
  ikon: 'veiviser',
  kategori: 'fag',
  rekkefolge: 20,
  ruter: [
    { sti: '/opplaeringslop', tittel: 'opplaeringslop.tittel', side: () => import('./sider/Oversikt.tsx') },
    // Registrene står før /:program, så adressene ikke leses som et utdanningsprogram (avgjørelse 053).
    { sti: '/opplaeringslop/lop', tittel: 'opplaeringslop.lop.tittel', side: () => import('./sider/Lop.tsx') },
    { sti: '/opplaeringslop/skoler', tittel: 'opplaeringslop.skoler.tittel', side: () => import('./sider/Skoler.tsx') },
    { sti: '/opplaeringslop/opplaeringskontor', tittel: 'opplaeringslop.kontor.tittel', side: () => import('./sider/Kontor.tsx') },
    { sti: '/opplaeringslop/:program', tittel: 'opplaeringslop.tittel', side: () => import('./sider/Program.tsx') },
    { sti: '/opplaeringslop/:program/:tilbud', tittel: 'opplaeringslop.tittel', side: () => import('./sider/Tilbud.tsx') },
  ],
  async sokeoppforinger() {
    // Søket trenger bare navnene, som står i fagindeksen. Tilbudene lastes først når et tilbud åpnes.
    const indeks = await lastFagindeks();
    // Skolene kan søkes på navn, sted og fylke, og åpnes i skoleoppslaget (eier 03.10.2026).
    const skoler = (await lastSkoler()).skoler;
    const fylkenavn = (nr: string) => fylker.find((f) => f.nummer === nr)?.navn ?? '';
    return [
      {
        id: 'opplaeringslop:lop',
        type: 'funksjon' as const,
        tittel: begge('opplaeringslop.lop.tittel'),
        tekst: begge('opplaeringslop.inngang.programTekst'),
        stikkord: ['utdanningsprogram', 'løp', 'tilbudsstruktur', 'vg1', 'vg2', 'vg3'],
        rute: '/opplaeringslop/lop',
        modul: 'opplaeringslop',
      },
      ...skoler.map((s) => ({
        vekt: 0.6,
        id: `skole:${s.nr ?? s.navn}`,
        type: 'skole' as const,
        tittel: { nb: s.navn, nn: s.navn },
        tekst: { nb: [s.sted, fylkenavn(s.fylke)].filter(Boolean).join(', '), nn: [s.sted, fylkenavn(s.fylke)].filter(Boolean).join(', ') },
        stikkord: [s.sted ?? '', fylkenavn(s.fylke)].filter(Boolean),
        rute: s.nr ? `/opplaeringslop/skoler?fylke=alle&skole=${s.nr}` : `/opplaeringslop/skoler?fylke=alle&q=${encodeURIComponent(s.navn)}`,
        modul: 'opplaeringslop',
      })),
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
  kilder: ['udir-grep', 'udir-fag-og-timefordeling', 'utdanning-no', 'udir-nor'],
  status: 'aktiv',
};
