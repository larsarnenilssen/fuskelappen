// Kalenderen (fase 6, pakke 5, avgjørelse 066): fristene og datoene fra alle modulene på én side, med filter på tema og
// hvem det gjelder. Kalender for inntak og Kalender for eksamen er lenker hit, ferdig filtrert. Grunnlaget for
// årshjulet og eksporten til kalender i fase 8.
import { bareSpurte, oversiktsfavoritt } from '../favoritter.ts';
import type { Modulmanifest } from '../typer.ts';
import { kalenderRute } from './adresse.ts';

export const manifest: Modulmanifest = {
  id: 'kalender',
  navn: 'moduler.kalender.navn',
  beskrivelse: 'moduler.kalender.beskrivelse',
  ikon: 'kalender',
  kategori: 'felles',
  rekkefolge: 5,
  ruter: [{ sti: kalenderRute, tittel: 'kalender.tittel', side: () => import('./sider/Kalender.tsx') }],
  async sokeoppforinger() {
    return [
      {
        id: 'kalender:kalender',
        type: 'tidslinje' as const,
        tittel: { nb: 'Kalender', nn: 'Kalender' },
        stikkord: ['frister', 'datoer', 'årshjul', 'skolerute', 'ferie', 'eksamen', 'inntak'],
        rute: kalenderRute,
        modul: 'kalender',
      },
    ];
  },
  async favorittbare(ider) {
    return bareSpurte([oversiktsfavoritt(manifest)], ider);
  },
  async frister() {
    return [];
  },
  kilder: ['eksamensdatoer', 'lovdata-lokale', 'udir-administrere-eksamen'],
  status: 'aktiv',
};
