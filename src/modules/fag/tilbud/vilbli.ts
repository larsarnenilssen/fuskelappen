// Lenker til Vilbli.no for et tilbud: oversikten, fag- og timefordelingen og skolene og lærebedriftene som tilbyr
// det. Vilbli er fylkeskommunenes informasjonstjeneste for søkere og holder skoletilbudet oppdatert fra VIGO. Appen
// lagrer ingen skoledata; lenken lages fra programområdekodene og «bygger på» i Grep (avgjørelse 027).
//
// Formatet er lest ut av adressene på Vilbli, f.eks.
// https://www.vilbli.no/nb/nb/no/helse-og-oppvekstfag/program/v.hs/v.hshsf1----_v.hshea2----/p5
// - «no» er hele landet, ellers fylket (f.eks. «viken», «agder»).
// - Teksten etter fylket er utdanningsprogrammet.
// - Løpet er programområdekodene fra vg1 og fram til tilbudet, med «v.» foran og «_» mellom.
// - p1 er oversikten, p2 fag- og timefordelingen, p5 skoler og lærebedrifter.
// Vilbli stenger for maskinell henting, så formatet kontrolleres for hånd i kontrollrundene.
import type { Fagindeks } from '../skjema.ts';
import { erVariant } from './modell.ts';

export type Vilblisside = 'p1' | 'p2' | 'p5';

/** Tekst i adressen: små bokstaver, æ/ø/å skrevet om, og bindestrek mellom ordene. «Møre og Romsdal» → «more-og-romsdal». */
export function vilbliTekst(tekst: string): string {
  return tekst
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Løpet fram til et programområde: følger «bygger på» bakover i samme utdanningsprogram (hovedløpet, ikke
 * varianter og kryssløp) til inngangen. Gir [vg1, vg2, …, koden].
 */
export function lopTil(kode: string, indeks: Pick<Fagindeks, 'programomrader'>): string[] {
  const lop = [kode];
  const sett = new Set(lop);
  let naa = kode;
  for (;;) {
    const po = indeks.programomrader[naa];
    const forrige = po?.bygger.filter((b) => indeks.programomrader[b]?.program === po.program && !erVariant(b) && !sett.has(b)).sort()[0];
    if (!forrige) return lop;
    lop.unshift(forrige);
    sett.add(forrige);
    naa = forrige;
  }
}

/**
 * Lenke til et tilbud på Vilbli, for hele landet eller et fylke (fylkesnavnet, f.eks. «Vestland»). Kan tilbudet nås
 * fra flere programområder (f.eks. et lærefag etter to vg2), gir `via` løpet brukeren kom fra.
 */
export function vilbliLenke(
  kode: string,
  indeks: Pick<Fagindeks, 'programomrader' | 'utdanningsprogram'>,
  valg: { side: Vilblisside; fylke?: string | null; via?: string | null },
): string | null {
  const po = indeks.programomrader[kode];
  if (!po) return null;
  const programnavn = indeks.utdanningsprogram[po.program]?.nb ?? po.program;
  const via = valg.via && po.bygger.includes(valg.via) ? valg.via : null;
  const lop = (via ? [...lopTil(via, indeks), kode] : lopTil(kode, indeks))
    .map((k) => `v.${k.toLowerCase()}`)
    .join('_');
  const sted = valg.fylke ? vilbliTekst(valg.fylke) : 'no';
  return `https://www.vilbli.no/nb/nb/${sted}/${vilbliTekst(programnavn)}/program/v.${po.program.toLowerCase()}/${lop}/${valg.side}`;
}
