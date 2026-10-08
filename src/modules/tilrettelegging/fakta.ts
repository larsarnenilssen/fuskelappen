// Fakta til dagens jukselapp fra Tilrettelegging (avgjørelse 086): stegene i veiviserne. Lastes bare når modulen har
// dagen.
import type { Innholdselement } from '../../core/innhold/skjema.ts';
import { faktaFraModul } from '../../core/jukselapp/innhold.ts';
import type { Faktum } from '../typer.ts';
import { veiviserRute } from './innhold.ts';

const filer = import.meta.glob<Innholdselement[]>('/content/tilrettelegging/*.yaml', { import: 'default' });

export function fakta(): Promise<Faktum[]> {
  return faktaFraModul(filer, { modul: 'tilrettelegging', under: 'moduler.tilrettelegging.navn', veiviserRute, sider: {} });
}
