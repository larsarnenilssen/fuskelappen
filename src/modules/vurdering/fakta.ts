// Fakta til dagens jukselapp fra Vurdering (avgjørelse 085). Lastes bare når modulen har dagen.
import type { Innholdselement } from '../../core/innhold/skjema.ts';
import { faktaFraModul } from '../../core/jukselapp/innhold.ts';
import type { Faktum } from '../typer.ts';
import { fravaerRute, ordenRute, underveisSluttRute, veiviserRute } from './innhold.ts';

const filer = import.meta.glob<Innholdselement[]>('/content/vurdering/*.yaml', { import: 'default' });

export function fakta(): Promise<Faktum[]> {
  return faktaFraModul(filer, {
    modul: 'vurdering',
    under: 'moduler.vurdering.navn',
    veiviserRute,
    sider: {
      fravaer: { rute: fravaerRute, lenke: 'vurdering.fravaer.tittel' },
      'orden-og-oppforsel': { rute: ordenRute, lenke: 'vurdering.orden.tittel' },
      'underveis-og-slutt': { rute: underveisSluttRute, lenke: 'vurdering.underveisSlutt.tittel' },
    },
  });
}
