// Fakta til dagens jukselapp fra Inntak (avgjørelse 086). Lastes bare når modulen har dagen.
import type { Innholdselement } from '../../core/innhold/skjema.ts';
import { faktaFraModul } from '../../core/jukselapp/innhold.ts';
import type { Faktum } from '../typer.ts';
import { fristerRute, merOpplaeringRute, poengRute, veiviserRute } from './innhold.ts';

const filer = import.meta.glob<Innholdselement[]>('/content/inntak/*.yaml', { import: 'default' });

export function fakta(): Promise<Faktum[]> {
  return faktaFraModul(filer, {
    modul: 'inntak',
    under: 'moduler.inntak.navn',
    veiviserRute,
    sider: {
      'mer-opplaering': { rute: merOpplaeringRute, lenke: 'inntak.merOpplaering.tittel' },
      poeng: { rute: poengRute, lenke: 'inntak.poeng.tittel' },
    },
    frister: { rute: fristerRute, lenke: 'kalender.tittel' },
  });
}
