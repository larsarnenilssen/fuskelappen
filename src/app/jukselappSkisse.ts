// SKISSE til eier (fase 8): eksempler på fakta til dagens jukselapp, ett eller to fra hver type. Tekstene er hentet
// fra innholdet, regelsettene og dataene appen har, med samme kilder. Når designet er godkjent, erstattes filen av
// `fakta()` i manifestene, som lager faktaene fra innholdet selv. Lastes bare når jukselappen vises.
import type { Ikonnavn } from '../components/Ikon.tsx';
import type { Flerspraak, KildeRef } from '../core/innhold/skjema.ts';

export interface Faktum {
  id: string;
  /** Typen og modulen, f.eks. «Begrep». */
  type: Flerspraak;
  /** Fylket eller skolen, når faktumet bare gjelder der. */
  sted?: string;
  ikon: Ikonnavn;
  tekst: Flerspraak;
  /** Lenken videre, f.eks. «Mer om årsverk». */
  lenke: Flerspraak;
  rute: string;
  kilder: KildeRef[];
  fylke?: string;
  skole?: string;
}


export const SKISSEFAKTA: Faktum[] = [
  {
    id: 'begreper:arsverk',
    type: { nb: 'Begrep', nn: 'Omgrep' },
    ikon: 'bok',
    tekst: {
      nb: 'Et årsverk for lærere er 1687,5 timer, eller 1650 timer for lærere som er 60 år og eldre. Forskjellen er fem arbeidsdager ekstra ferie.',
      nn: 'Eit årsverk for lærarar er 1687,5 timar, eller 1650 timar for lærarar som er 60 år og eldre. Skilnaden er fem arbeidsdagar ekstra ferie.',
    },
    lenke: { nb: 'Årsverk', nn: 'Årsverk' },
    rute: '/begreper/arsverk',
    kilder: [{ id: 'ks-sfs2213-avtaletekst', punkt: '4' }],
  },
  {
    id: 'fag:MAT1019',
    type: { nb: 'Fag', nn: 'Fag' },
    ikon: 'skole',
    tekst: {
      nb: 'Matematikk 1P på Vg1 har 140 årstimer. Årsrammen for matematikk på studiespesialiserende Vg1 er 525 timer (700 i 45-minutters enheter).',
      nn: 'Matematikk 1P på Vg1 har 140 årstimar. Årsramma for matematikk på studiespesialiserande Vg1 er 525 timar (700 i 45-minutts einingar).',
    },
    lenke: { nb: 'Matematikk 1P', nn: 'Matematikk 1P' },
    rute: '/fag/MAT1019',
    kilder: [
      { id: 'udir-grep', punkt: 'MAT1019' },
      { id: 'ks-sfs2213-avtaletekst', punkt: 'Vedlegg 1' },
    ],
  },
  {
    id: 'eksamen:fe-klagefrist',
    type: { nb: 'Frist', nn: 'Frist' },
    ikon: 'kalender',
    tekst: {
      nb: 'Fristen for å klage på standpunktkarakterer, vedtak om IV og eksamenskarakterer er ti kalenderdager.',
      nn: 'Fristen for å klage på standpunktkarakterar, vedtak om IV og eksamenskarakterar er ti kalenderdagar.',
    },
    lenke: { nb: 'Klage på karakter', nn: 'Klage på karakter' },
    rute: '/eksamen/klage-pa-karakter',
    kilder: [{ id: 'opplaeringsforskrifta', punkt: '§ 10-2', url: 'https://lovdata.no/forskrift/2024-06-03-900/§10-2' }],
  },
  {
    id: 'laereplanverket:2.3',
    type: { nb: 'Overordnet del', nn: 'Overordna del' },
    ikon: 'lag',
    tekst: {
      nb: 'Skolen skal legge til rette for og støtte elevenes utvikling av de fem grunnleggende ferdighetene gjennom hele opplæringsløpet.',
      nn: 'Skolen skal leggje til rette for og støtte elevane si utvikling av dei fem grunnleggjande ferdigheitene gjennom heile opplæringsløpet.',
    },
    lenke: { nb: '2.3 Grunnleggende ferdigheter', nn: '2.3 Grunnleggjande ferdigheiter' },
    rute: '/laereplanverket/overordnet-del/2.3',
    kilder: [{ id: 'udir-overordnet-del', punkt: '2.3 Grunnleggende ferdigheter' }],
  },
  {
    id: 'vurdering:fr-teller',
    type: { nb: 'Regel', nn: 'Regel' },
    ikon: 'vurdering',
    tekst: {
      nb: 'Fraværsgrensen er nådd når udokumentert og helserelatert fravær til sammen er 10 prosent av årstimetallet i faget.',
      nn: 'Fråværsgrensa er nådd når udokumentert og helserelatert fråvær til saman er 10 prosent av årstimetalet i faget.',
    },
    lenke: { nb: 'Fraværsgrensen', nn: 'Fråværsgrensa' },
    rute: '/vurdering/fravaer',
    kilder: [{ id: 'opplaeringsforskrifta', punkt: '§ 9-8 tredje ledd', url: 'https://lovdata.no/forskrift/2024-06-03-900/§9-8' }],
  },
  {
    id: 'lov:opplaeringslova/12-2',
    type: { nb: 'Paragraf', nn: 'Paragraf' },
    ikon: 'paragraf',
    // Lovteksten gjengis uoversatt, på nynorsk som den er vedtatt.
    tekst: {
      nb: '«Alle elevar har rett til eit trygt og godt skolemiljø som fremjar helse, inkludering, trivsel og læring.»',
      nn: '«Alle elevar har rett til eit trygt og godt skolemiljø som fremjar helse, inkludering, trivsel og læring.»',
    },
    lenke: { nb: 'Opplæringslova § 12-2', nn: 'Opplæringslova § 12-2' },
    rute: '/lov/opplaeringslova/12-2',
    kilder: [{ id: 'opplaeringslova', punkt: '§ 12-2', url: 'https://lovdata.no/lov/2023-06-09-30/§12-2' }],
  },
  {
    id: 'inntak:po-vg1',
    type: { nb: 'Inntak', nn: 'Inntak' },
    ikon: 'inngang',
    tekst: {
      nb: 'Til Vg1 teller alle standpunkt- og eksamenskarakterer fra grunnskolen like mye. Poengsummen er gjennomsnittet, avrundet til to desimaler, ganget med ti.',
      nn: 'Til Vg1 tel alle standpunkt- og eksamenskarakterar frå grunnskolen like mykje. Poengsummen er gjennomsnittet, avrunda til to desimalar, gonga med ti.',
    },
    lenke: { nb: 'Poengberegning', nn: 'Poengutrekning' },
    rute: '/inntak/poeng',
    kilder: [{ id: 'opplaeringsforskrifta', punkt: '§ 4-19 første ledd bokstav a, b og e', url: 'https://lovdata.no/forskrift/2024-06-03-900/§4-19' }],
  },
  {
    id: 'statistikk:gjennomforing',
    type: { nb: 'I tall', nn: 'I tal' },
    sted: 'Vestland',
    fylke: '46',
    ikon: 'sammenlign',
    tekst: {
      nb: '81,6 prosent av elevene i Vestland som startet på Vg1 i 2019, fullførte og besto innen fem eller seks år. I hele landet var det 81,8 prosent.',
      nn: '81,6 prosent av elevane i Vestland som starta på Vg1 i 2019, fullførte og bestod innan fem eller seks år. I heile landet var det 81,8 prosent.',
    },
    lenke: { nb: 'Vestland i tall', nn: 'Vestland i tal' },
    rute: '/statistikk?fylke=46',
    kilder: [{ id: 'udir-statistikkbanken', punkt: 'Gjennomføring' }],
  },
  {
    id: 'skolemiljo:k12-hvem',
    type: { nb: 'Skolemiljø', nn: 'Skulemiljø' },
    ikon: 'person',
    tekst: {
      nb: 'Kapittel 12 i opplæringslova gjelder ikke for lærlinger og lærekandidater i bedrift. De har arbeidsmiljøloven.',
      nn: 'Kapittel 12 i opplæringslova gjeld ikkje for lærlingar og lærekandidatar i bedrift. Dei har arbeidsmiljølova.',
    },
    lenke: { nb: 'Et trygt og godt skolemiljø', nn: 'Eit trygt og godt skulemiljø' },
    rute: '/skolemiljo/trygt-og-godt-skolemiljo',
    kilder: [{ id: 'opplaeringslova', punkt: '§ 12-1', url: 'https://lovdata.no/lov/2023-06-09-30/§12-1' }],
  },
  {
    id: 'inntak:fr-vl-voksne-host',
    type: { nb: 'Frist', nn: 'Frist' },
    sted: 'Vestland',
    fylke: '46',
    ikon: 'kalender',
    tekst: {
      nb: 'Det er ingen søknadsfrist for voksne i Vestland, men søkeren bør søke innen 1. mars for tilbud som starter om høsten.',
      nn: 'Det er ingen søknadsfrist for vaksne i Vestland, men søkjaren bør søkje innan 1. mars for tilbod som startar om hausten.',
    },
    lenke: { nb: 'Vestland fylkeskommune', nn: 'Vestland fylkeskommune' },
    rute: '/fylker/46',
    kilder: [{ id: 'vestland-forskrift-inntak', punkt: '§ 4-1 første ledd', url: 'https://lovdata.no/forskrift/2020-09-29-3380/§4-1' }],
  },
  {
    id: 'opplaeringslop:vei-laerling',
    type: { nb: 'Opplæringsløp', nn: 'Opplæringsløp' },
    ikon: 'vei',
    tekst: {
      nb: 'Den vanlige veien til fagbrev: Vg1 og Vg2 på et yrkesfaglig utdanningsprogram, og så læretid i bedrift med lærekontrakt.',
      nn: 'Den vanlege vegen til fagbrev: Vg1 og Vg2 på eit yrkesfagleg utdanningsprogram, og så læretid i bedrift med lærekontrakt.',
    },
    lenke: { nb: 'Lærling', nn: 'Lærling' },
    rute: '/opplaeringslop/laerlinger-og-kandidater/laerling',
    kilder: [{ id: 'opplaeringslova', punkt: '§ 5-2 tredje ledd', url: 'https://lovdata.no/lov/2023-06-09-30/§5-2' }],
  },
];
