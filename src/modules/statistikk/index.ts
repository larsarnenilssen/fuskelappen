// Videregående i tall (eier 07.10.2026, avgjørelse 080 og 090): nøkkeltallene fra Udirs statistikkbank og tallene fra
// SSB for fylket og landet, på en oversikt og tre temasider (ungdom og søkere, skolen, læreplass og fullføring).
// Komponentene i komponenter.tsx brukes også på fylkessiden og på sidene der tallene hører hjemme (Inntak, Lærlinger
// og kandidater, fraværsgrensen, eksamen og skolene). Tallene står i data/statistikk/.
// Modulen står ikke under «Oppslag» på forsiden, men som en egen gruppe i sidekolonnen, «Vestland i tall» (eier
// 07.10.2026). Den kan slås av under «Tilpass».
import { oversiktsfavoritt } from '../favoritter.ts';
import type { Modulmanifest } from '../typer.ts';
import { begge } from '../../core/i18n/tekst.ts';
import { STATISTIKK_RUTE } from './adresse.ts';
import { TEMAER, temaFavoritt, temarute } from './temaer.ts';

export const manifest: Modulmanifest = {
  id: 'statistikk',
  navn: 'moduler.statistikk.navn',
  beskrivelse: 'moduler.statistikk.beskrivelse',
  ikon: 'sammenlign',
  kategori: 'felles',
  rekkefolge: 35,
  stikkord: ['statistikk', 'tall', 'søkere', 'elevtall', 'læreplass', 'formidling', 'lærekontrakter', 'gjennomføring', 'fravær', 'eksamenskarakterer', 'statistikkbanken', 'SSB', 'ungdomskull', 'framskriving', 'grunnskolepoeng', 'lærere', 'KOSTRA', 'NEET', 'utenfor arbeid og utdanning'],
  ruter: [
    { sti: STATISTIKK_RUTE, tittel: 'statistikk.tittel', side: () => import('./sider/Oversikt.tsx') },
    { sti: `${STATISTIKK_RUTE}/:tema`, tittel: 'statistikk.tittel', side: () => import('./sider/Tema.tsx') },
  ],
  async sokeoppforinger() {
    return [];
  },
  async favorittbare() {
    return [
      oversiktsfavoritt(manifest),
      ...TEMAER.map((x) => ({ id: temaFavoritt(x.id), type: 'side' as const, tittel: begge(`statistikk.tema.${x.id}.navn`), rute: temarute(x.id), ikon: x.ikon })),
    ];
  },
  lokaleRegler: [],
  async frister() {
    return [];
  },
  async fakta() {
    // Lastes bare når modulen har dagen i dagens jukselapp (avgjørelse 086).
    return (await import('./fakta.ts')).fakta();
  },
  paaForsiden: false,
  kilder: ['udir-statistikkbanken', 'ssb-statistikkbanken'],
  status: 'aktiv',
};
