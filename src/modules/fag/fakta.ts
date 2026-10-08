// Fakta til dagens jukselapp fra Fag og læreplaner (avgjørelse 086): årstimene og årsrammen i et fag, fra utdraget som
// lages når appen bygges. Lastes bare når modulen har dagen.
import fagliste from 'virtual:jukselappfag';
import { formaterTall, hentTekst, latBegge } from '../../core/i18n/tekst.ts';
import type { Faktum } from '../typer.ts';

export async function fakta(): Promise<Faktum[]> {
  return fagliste.map(([kode, nb, nn, timer, t60, t45]) => ({
    id: `fag:${kode}`,
    tittel: { nb, nn },
    tekst: latBegge((m) => hentTekst(m, 'jukselapp.fag', { fag: m === 'nb' ? nb : nn, timer: formaterTall(timer), t60: formaterTall(t60), t45: formaterTall(t45) })),
    under: 'moduler.fag.navn',
    lenke: { nb, nn },
    rute: `/fag/${kode}`,
    kilder: [
      { id: 'udir-grep', punkt: kode },
      { id: 'ks-sfs2213-avtaletekst', punkt: 'Vedlegg 1' },
    ],
  }));
}
