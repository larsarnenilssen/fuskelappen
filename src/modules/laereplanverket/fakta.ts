// Fakta til dagens jukselapp fra overordnet del (avgjørelse 086): første avsnitt i ingressen og i teksten til hver
// del, f.eks. de fem grunnleggende ferdighetene og de tre tverrfaglige temaene. Teksten er Udirs, på bokmål og
// nynorsk. Lastes bare når modulen har dagen.
import { hentTekst, latBegge } from '../../core/i18n/tekst.ts';
import { faktatekst } from '../../core/jukselapp/fakta.ts';
import type { Faktum } from '../typer.ts';
import { delRute, lastOverordnetDel } from './data.ts';
import { alleDeler, type Blokk, type Del } from './typer.ts';

const forsteAvsnitt = (blokker: readonly Blokk[]) => blokker.find((b) => b.type === 'avsnitt')?.tekst ?? '';

function faktaFraDel(d: Del): Faktum[] {
  const navn = d.nr ? `${d.nr} ${d.tittel.nb}` : d.tittel.nb;
  const fakta: Faktum[] = [];
  for (const [del, blokker] of [
    ['ingress', d.ingress],
    ['tekst', d.tekst],
  ] as const) {
    const tekst = faktatekst({ nb: forsteAvsnitt(blokker.nb), nn: forsteAvsnitt(blokker.nn) });
    if (!tekst || fakta.some((f) => f.tekst.nb === tekst.nb)) continue;
    fakta.push({
      id: `laereplanverket:${d.nr ?? d.id}:${del}`,
      tittel: d.tittel,
      tekst,
      under: 'moduler.laereplanverket.navn',
      lenke: d.nr ? latBegge((m) => hentTekst(m, 'jukselapp.overordnetDel', { nr: d.nr ?? '' })) : d.tittel,
      rute: delRute(d),
      kilder: [{ id: 'udir-overordnet-del', punkt: navn, url: d.url }],
    });
  }
  return fakta;
}

export async function fakta(): Promise<Faktum[]> {
  return alleDeler((await lastOverordnetDel()).deler).flatMap(faktaFraDel);
}
