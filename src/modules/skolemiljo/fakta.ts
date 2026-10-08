// Fakta til dagens jukselapp fra Aktivitetsplikt og skoleregler (modulen skolemiljo, avgjørelse 086): kapittel 12,
// skolereglene og aktivitetsplikten fra innholdet. Elevundersøkelsen har egne fakta. Lastes bare når modulen har dagen.
import type { Innholdselement } from '../../core/innhold/skjema.ts';
import { faktaFraModul } from '../../core/jukselapp/innhold.ts';
import type { Faktum } from '../typer.ts';
import { kapittel12Rute, skolereglerRute, veiviserRute } from './innhold.ts';

const filer = import.meta.glob<Innholdselement[]>('/content/skolemiljo/*.yaml', { import: 'default' });

export function fakta(): Promise<Faktum[]> {
  return faktaFraModul(filer, {
    modul: 'skolemiljo',
    under: 'moduler.skolemiljo.navn',
    veiviserRute,
    sider: {
      'kapittel-12': { rute: kapittel12Rute, lenke: 'skolemiljo.kapittel12.tittel' },
      skoleregler: { rute: skolereglerRute, lenke: 'skolemiljo.skoleregler.tittel' },
      'skoleregler-fylker': { rute: skolereglerRute, lenke: 'skolemiljo.skoleregler.tittel' },
    },
  });
}
