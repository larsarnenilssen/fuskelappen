// Lenker til Vilbli.no for et tilbud: oversikten, fag- og timefordelingen og skolene og lærebedriftene som tilbyr
// det. Vilbli er fylkeskommunenes informasjonstjeneste for søkere og holder skoletilbudet oppdatert fra VIGO. Appen
// lagrer ingen skoledata; lenken lages fra programområdekodene i Grep (avgjørelse 027).
//
// Formatet er lest ut av adressene på Vilbli, f.eks.
// https://www.vilbli.no/nb/nb/no/aktivitorfaget/program/v.hs/v.hsakt3----/p5
// - «no» er hele landet, ellers fylket (f.eks. «vestland», «more-og-romsdal»).
// - Teksten etter fylket er utdanningsprogrammet.
// - Programområdet står alene, med «v.» foran. Hele løpet (vg1_vg2_vg3) sender lærefag til vg1 (eier 01.10.2026),
//   så det brukes ikke.
// - Påbygging (PB) står under et yrkesfaglig utdanningsprogram: programmet brukeren kom fra, ellers det første
//   programmet påbyggingen bygger på. Under v.pb gir Vilbli 404 (eier 01.10.2026).
// - p1 er oversikten, p2 fag- og timefordelingen, p5 skoler og lærebedrifter.
// Vilbli stenger for maskinell henting, så formatet kontrolleres for hånd i kontrollrundene.
import type { Fagindeks } from '../skjema.ts';

export type Vilblisside = 'p1' | 'p2' | 'p5';

/** Tekst i adressen: små bokstaver, æ/ø/å skrevet om, og bindestrek mellom ordene. «Møre og Romsdal» → «more-og-romsdal». */
export function vilbliTekst(tekst: string): string {
  return tekst
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Lenke til et tilbud på Vilbli, for hele landet eller et fylke (fylkesnavnet, f.eks. «Vestland»). `via` er
 * programområdet brukeren kom fra; det avgjør programmet påbygging vises under. `bygger` er hva tilbudet bygger på,
 * når det ikke står i Grep (Vg4 påbygging fra VIGO, medGrunnlagFraVigo).
 */
export function vilbliLenke(
  kode: string,
  indeks: Pick<Fagindeks, 'programomrader' | 'utdanningsprogram'>,
  valg: { side: Vilblisside; fylke?: string | null; via?: string | null; bygger?: readonly string[] },
): string | null {
  const po = indeks.programomrader[kode];
  if (!po) return null;
  const bygger = po.bygger.length > 0 ? po.bygger : (valg.bygger ?? []);
  const program =
    po.program === 'PB' ? (indeks.programomrader[valg.via && bygger.includes(valg.via) ? valg.via : ([...bygger].sort()[0] ?? '')]?.program ?? null) : po.program;
  if (!program) return null;
  const programnavn = indeks.utdanningsprogram[program]?.nb ?? program;
  const sted = valg.fylke ? vilbliTekst(valg.fylke) : 'no';
  return `https://www.vilbli.no/nb/nb/${sted}/${vilbliTekst(programnavn)}/program/v.${program.toLowerCase()}/v.${kode.toLowerCase()}/${valg.side}`;
}

/**
 * Lenker eier sjekker for hånd i hver kontrollrunde, fordi Vilbli ikke kan sjekkes automatisk: hele landet, et
 * fylke, et lærefag, vg3 studiespesialisering, påbygging og et fylke med æ/ø/å. Programområder som ikke finnes
 * lenger, hoppes over.
 */
export function kontrollenker(indeks: Pick<Fagindeks, 'programomrader' | 'utdanningsprogram'>): { tekst: string; url: string }[] {
  const utvalg: [string, string, { side: Vilblisside; fylke?: string; via?: string }][] = [
    ['Vg2 helsearbeiderfag, hele landet', 'HSHEA2----', { side: 'p5' }],
    ['Vg2 helsearbeiderfag, Vestland', 'HSHEA2----', { side: 'p5', fylke: 'Vestland' }],
    ['Lærefag: helsearbeiderfaget', 'HSHEA3----', { side: 'p5', via: 'HSHEA2----' }],
    ['Vg3 språk, samfunnsfag og økonomi', 'STSSA3----', { side: 'p5' }],
    ['Påbygging etter vg2 helsearbeiderfag', 'PBPBY3----', { side: 'p5', via: 'HSHEA2----' }],
    ['Vg2 helsearbeiderfag, Møre og Romsdal', 'HSHEA2----', { side: 'p5', fylke: 'Møre og Romsdal' }],
  ];
  return utvalg.flatMap(([tekst, kode, valg]) => {
    const url = vilbliLenke(kode, indeks, valg);
    return url ? [{ tekst, url }] : [];
  });
}
