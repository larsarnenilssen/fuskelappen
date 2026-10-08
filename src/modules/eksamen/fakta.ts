// Fakta til dagens jukselapp fra Eksamen og klage (avgjørelse 085). Lastes bare når modulen har dagen.
import type { Innholdselement } from '../../core/innhold/skjema.ts';
import { faktaFraModul } from '../../core/jukselapp/innhold.ts';
import type { Faktum } from '../typer.ts';
import { eksamenRute, fristerRute, proveneRute, veiviserRute } from './innhold.ts';

const filer = import.meta.glob<Innholdselement[]>('/content/eksamen/*.yaml', { import: 'default' });

export function fakta(): Promise<Faktum[]> {
  return faktaFraModul(filer, {
    modul: 'eksamen',
    under: 'moduler.eksamen.navn',
    veiviserRute,
    sider: {
      eksamen: { rute: eksamenRute, lenke: 'eksamen.eksamen.tittel' },
      proevene: { rute: proveneRute, lenke: 'eksamen.provene.tittel' },
    },
    frister: { rute: fristerRute, lenke: 'kalender.tittel' },
  });
}
