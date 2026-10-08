// Nyheter (fase 7b): det siste fra myndighetene, fagpressen og organisasjonene, valgt ut for videregående. Sakene
// hentes hver dag av scripts/hent-nyheter.ts til data/nyheter/nyheter.json. Kildene står i content/nyheter/kilder.yaml.
// De nyeste står som visningen «Nyheter» i panelet øverst på forsiden (avgjørelse 081), og hele listen på en egen side
// med filter på hvem og kilde. Siden nås fra panelet, søket og favorittene, ikke fra «Oppslag» (eier 07.10.2026).
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
  async fakta() {
    return [];
  },
  kilder: ['regjeringen-kd-nyheter', 'udir-siste-nytt', 'utdanningsnytt-nyheter', 'statsforvalteren-nyheter', 'lovdata-lovtidend', 'forskning-no-skole', 'nifu-nyheter', 'hkdir-aktuelt', 'fylkeskommunene-nyheter', 'skolelederforbundet-nyheter', 'utdanningsforbundet-nyheter'],
  // Står i panelet øverst på forsiden, ikke under «Oppslag» (eier 07.10.2026).
  paaForsiden: false,
  status: 'aktiv',
};
