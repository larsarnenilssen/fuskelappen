// Fakta til dagens jukselapp fra Lov og forskrift (avgjørelse 085): bestemmelsene i SFS 2213 og hovedtariffavtalen med
// egne ord, og første ledd i paragrafene om rett til vidaregåande opplæring, skolereglar, tilpassa opplæring, skolemiljø
// og ordenstiltak i opplæringslova, og om inntak, vurdering og klage i forskrifta. Lovteksten vises uoversatt, på
// målformen den er fastsett på. Lastes bare når modulen har dagen.
import { faktaFraElementer, faktatekst } from '../../core/jukselapp/fakta.ts';
import type { Faktum } from '../typer.ts';
import { avtaler, lastBestemmelser } from './avtaler.ts';
import { lastDokument, lovdataUrl, paragrafRute } from './data.ts';
import { alleParagrafer, type Lovdokument, type Segment } from './typer.ts';

/** Kapitlene paragrafene hentes fra (eier 08.10.2026: om tilpasset opplæring, inntak, vurdering og skolemiljø). */
export const UTVALG: Readonly<Record<string, readonly string[]>> = {
  opplaeringslova: ['kap5', 'kap10', 'kap11', 'kap12', 'kap13'],
  opplaeringsforskrifta: ['kap4', 'kap9', 'kap10'],
};

const tekstAv = (segmenter: readonly Segment[]) => segmenter.map((s) => (typeof s === 'string' ? s : 't' in s ? s.t : '')).join('');

/** Paragrafene i utvalget, med første ledd. Reglene om grunnskolen er ikke med. */
export function faktaFraDokument(d: Lovdokument, kapitler: readonly string[]): Faktum[] {
  const fakta: Faktum[] = [];
  for (const { paragraf: p, seksjoner } of alleParagrafer(d.seksjoner)) {
    if (!seksjoner.some((s) => kapitler.includes(s.id)) || seksjoner.some((s) => /grunnskolen/i.test(s.overskrift)) || /oppheva|opphevet/i.test(p.tittel)) continue;
    const forste = p.ledd[0];
    const tekst = forste && !forste.liste ? faktatekst({ nb: tekstAv(forste.tekst), nn: tekstAv(forste.tekst) }) : null;
    if (!tekst) continue;
    fakta.push({
      id: `lov:${d.id}:${p.nr}`,
      tittel: { nb: `${p.visNr} ${p.tittel}`, nn: `${p.visNr} ${p.tittel}` },
      tekst,
      under: { nb: d.korttittel, nn: d.korttittel },
      lenke: { nb: `${d.korttittel} ${p.visNr}`, nn: `${d.korttittel} ${p.visNr}` },
      rute: paragrafRute(d.id, p.nr),
      kilder: [{ id: d.kilde, punkt: p.visNr, url: lovdataUrl(d.refid, p.nr) }],
      paragrafer: [`${d.id}/${p.nr}`],
    });
  }
  return fakta;
}

export async function fakta(): Promise<Faktum[]> {
  const bestemmelser = await lastBestemmelser();
  const fraAvtaler = avtaler.flatMap((a) =>
    faktaFraElementer(
      a.kapitler.flatMap((k) => k.elementer.flatMap((id) => bestemmelser.get(id) ?? [])),
      { modul: `lov:${a.id}`, under: a.korttittel, rute: (e) => paragrafRute(a.id, e.id), lenke: (e) => e.tittel },
    ),
  );
  const dokumenter = await Promise.all(Object.keys(UTVALG).map((id) => lastDokument(id)));
  const fraLovene = dokumenter.flatMap((d) => (d ? faktaFraDokument(d, UTVALG[d.id] ?? []) : []));
  return [...fraAvtaler, ...fraLovene];
}
