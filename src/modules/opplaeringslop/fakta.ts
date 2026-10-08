// Fakta til dagens jukselapp fra Opplæringsløp (avgjørelse 085): veiene til fag- og svennebrev. Lastes bare når
// modulen har dagen.
import { faktaFraElementer } from '../../core/jukselapp/fakta.ts';
import type { Faktum } from '../typer.ts';
import { hentVeier, veiRute } from './fagbrev/data.ts';

export async function fakta(): Promise<Faktum[]> {
  const { veier } = await hentVeier();
  return faktaFraElementer(veier, { modul: 'opplaeringslop', under: 'moduler.opplaeringslop.navn', rute: (e) => veiRute(e.id), lenke: (e) => e.tittel });
}
