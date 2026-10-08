// Fakta til dagens jukselapp fra begrepsbanken (avgjørelse 085): de første setningene i hvert begrep. Lastes bare når
// modulen har dagen.
import { faktaFraElementer } from '../../core/jukselapp/fakta.ts';
import type { Faktum } from '../typer.ts';
import { hentBegreper } from './innhold.ts';

export async function fakta(): Promise<Faktum[]> {
  return faktaFraElementer(await hentBegreper(), { modul: 'begreper', under: 'moduler.begreper.navn', rute: (e) => `/begreper/${e.id}`, lenke: (e) => e.tittel });
}
