// Elevundersøkelsen (fase 7, avgjørelse 077): mobbing og læringsmiljøet på skolen, i fylket og i landet, fra Udirs
// statistikkbank. Egen modul under Skolemiljø på forsiden fra 0.43.0 (eier 08.10.2026, avgjørelse 087). Den sto før som
// en side i modulen Skolemiljø, og den gamle adressen sender videre hit.
import { oversiktsfavoritt } from '../favoritter.ts';
import type { Modulmanifest } from '../typer.ts';
import { ELEVUNDERSOKELSEN_RUTE } from './adresse.ts';

export const manifest: Modulmanifest = {
  id: 'elevundersokelsen',
  navn: 'moduler.elevundersokelsen.navn',
  beskrivelse: 'moduler.elevundersokelsen.beskrivelse',
  stikkord: ['elevundersøkelsen', 'elevundersøkinga', 'mobbing', 'trivsel', 'læringsmiljø', 'skolemiljø', 'statistikk'],
  ikon: 'vurdering',
  kategori: 'skolemiljo',
  rekkefolge: 20,
  ruter: [{ sti: ELEVUNDERSOKELSEN_RUTE, tittel: 'elevundersokelsen.tittel', side: () => import('./sider/Elevundersokelsen.tsx') }],
  async sokeoppforinger() {
    // Siden er modulen selv, som søket har fra før («modul:elevundersokelsen»).
    return [];
  },
  async favorittbare() {
    return [oversiktsfavoritt(manifest)];
  },
  async frister() {
    return [];
  },
  async fakta() {
    // Lastes bare når modulen har dagen i dagens jukselapp (avgjørelse 086).
    return (await import('./fakta.ts')).fakta();
  },
  kilder: ['udir-elevundersokelsen'],
  status: 'aktiv',
};
