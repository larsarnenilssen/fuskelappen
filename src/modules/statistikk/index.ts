// Videregående i tall (eier 07.10.2026, avgjørelse 080): nøkkeltallene fra Udirs statistikkbank for fylket og landet.
// Komponentene i komponenter.tsx brukes også på fylkessiden og på sidene der tallene hører hjemme (Inntak, Lærlinger
// og kandidater, fraværsgrensen, eksamen og skolene). Tallene står i data/statistikk/.
// Modulen står ikke under «Oppslag» på forsiden, men som en egen gruppe i sidekolonnen, «Vestland i tall» (eier
// 07.10.2026). Den kan slås av under «Tilpass».
import { oversiktsfavoritt } from '../favoritter.ts';
import type { Modulmanifest } from '../typer.ts';
import { STATISTIKK_RUTE } from './adresse.ts';

export const manifest: Modulmanifest = {
  id: 'statistikk',
  navn: 'moduler.statistikk.navn',
  beskrivelse: 'moduler.statistikk.beskrivelse',
  ikon: 'sammenlign',
  kategori: 'felles',
  rekkefolge: 35,
  stikkord: ['statistikk', 'tall', 'søkere', 'elevtall', 'læreplass', 'formidling', 'lærekontrakter', 'gjennomføring', 'fravær', 'eksamenskarakterer', 'statistikkbanken'],
  ruter: [{ sti: STATISTIKK_RUTE, tittel: 'statistikk.tittel', side: () => import('./sider/Oversikt.tsx') }],
  async sokeoppforinger() {
    return [];
  },
  async favorittbare() {
    return [oversiktsfavoritt(manifest)];
  },
  async frister() {
    return [];
  },
  paaForsiden: false,
  kilder: ['udir-statistikkbanken'],
  status: 'aktiv',
};
