// Nyheter (fase 7b): det siste fra myndighetene, fagpressen og organisasjonene, valgt ut for videregående. Sakene
// hentes hver dag av scripts/hent-nyheter.ts til data/nyheter/nyheter.json. Kildene står i content/nyheter/kilder.yaml.
// De nyeste står som visningen «Nyheter» i panelet øverst på forsiden (avgjørelse 081), og hele listen på en egen side
// under «Oppslag», med filter på hvem og kilde.
import { oversiktsfavoritt } from '../favoritter.ts';
import type { Modulmanifest } from '../typer.ts';
import { NYHETER_RUTE } from './adresse.ts';

export const manifest: Modulmanifest = {
  id: 'nyheter',
  navn: 'moduler.nyheter.navn',
  beskrivelse: 'moduler.nyheter.beskrivelse',
  ikon: 'dokument',
  kategori: 'felles',
  rekkefolge: 6,
  stikkord: ['nyheter', 'siste nytt', 'Udir', 'regjeringen', 'Kunnskapsdepartementet', 'Statsforvalteren', 'Utdanningsnytt', 'Utdanningsforbundet', 'Skolelederforbundet'],
  ruter: [{ sti: NYHETER_RUTE, tittel: 'nyheter.tittel', side: () => import('./sider/Nyheter.tsx') }],
  async sokeoppforinger() {
    return [];
  },
  async favorittbare() {
    return [oversiktsfavoritt(manifest)];
  },
  async frister() {
    return [];
  },
  kilder: ['regjeringen-kd-nyheter', 'udir-siste-nytt', 'skolelederforbundet-nyheter', 'utdanningsforbundet-nyheter'],
  status: 'aktiv',
};
