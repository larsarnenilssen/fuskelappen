// Fylkenes sider med datoene for svar, svarfrist og andre inntak (fase 6, pakke 5, eier 05.10.2026), med mønstrene
// som finner hver dato. Datoene er fylkets egne og vises bare når fylket er valgt. Lesingen står i
// scripts/inntak/les.ts.
//
// Sidene er lest 05.10.2026, og robots.txt tillater henting på alle:
// - Med: Trøndelag, Telemark, Vestfold, Akershus, Agder, Troms og Finnmark. Telemark svarer ustabilt, så hentingen
//   prøver igjen med pauser.
// - Ikke med, fordi siden ikke sier hvilket år datoene gjelder: Østfold («Cirka 6. juli er første inntak klart») og
//   Buskerud («Senest 6. juli er førsteinntaket klart»). De legges inn når siden har årstallet.
// - Ikke med, fordi siden bare har omtrentlige tider uten dato: Rogaland («i begynnelsen av juli», «i midten av juli»,
//   svarfrist 6 dager) og Møre og Romsdal («i starten av juli», «i slutten av juli»).
// - Ikke med, fordi sidene bare lenker til Vilbli: Oslo, Innlandet og Nordland.
// - Ikke med, fordi nettstedet stenger skymiljøet: Vestland (vestlandfylke.no) og Vilbli (robotsjekk).
import type { Inntakskilde } from './les.ts';

const D = '\\d{1,2}\\.?\\s?[a-zæøå]+';
const UKE = 'Uke \\d{1,2}(?:\\s?\\/\\s?\\d{1,2})?';
const CA = '(?:ca\\.\\s?|cirka\\s)?';

export const INNTAKSKILDER: readonly Inntakskilde[] = [
  {
    id: 'trondelag-inntak-sporsmal',
    navn: 'Trøndelag fylkeskommune: Ofte stilte spørsmål om inntak',
    url: 'https://www.trondelagfylke.no/vare-tjenester/utdanning/elev/inntak-videregaende-opplaring/ofte-stilte-sporsmal-om-inntak2/',
    fylke: '50',
    selektor: 'main',
    aar: [/skoleåret (?<aar>\d{4})\/\d{4}/i],
    regler: [
      { felt: 'fortrinnsinntak', moenster: new RegExp(`Fortrinnsinntak ${CA}(?<dato>${D})`, 'i') },
      { felt: 'svarfrist-fortrinn', moenster: new RegExp(`Fortrinnsinntak [^\\n]*?svarfrist (?<dato>${D})`, 'i') },
      { felt: 'forste-inntak', moenster: new RegExp(`Første inntak ${CA}(?<dato>${D})`, 'i') },
      { felt: 'svarfrist-forste', moenster: new RegExp(`Første inntak [^\\n]*?svarfrist (?<dato>${D})`, 'i') },
      { felt: 'andre-inntak', moenster: new RegExp(`Andre inntak ${CA}(?<dato>${D})`, 'i') },
      { felt: 'svarfrist-andre', moenster: new RegExp(`Andre inntak [^\\n]*?svarfrist (?<dato>${D})`, 'i') },
      { felt: 'tredje-inntak', moenster: new RegExp(`Tredje inntak ${CA}(?<dato>${D})`, 'i') },
      { felt: 'svarfrist-tredje', moenster: new RegExp(`Tredje inntak [^\\n]*?svarfrist (?<dato>${D})`, 'i') },
    ],
  },
  {
    id: 'trondelag-inntak-forste',
    navn: 'Trøndelag fylkeskommune: Første inntak til videregående, spørsmål og svar',
    url: 'https://www.trondelagfylke.no/vare-tjenester/utdanning/elev/inntak-videregaende-opplaring/forste-inntak-til-videregaende-sporsmal-og-svar/',
    fylke: '50',
    selektor: 'main',
    aar: [/skolerute (?<aar>\d{4})\/\d{4}/i, /(?<ukedag>mandag|tirsdag|onsdag|torsdag|fredag) (?<dato>\d{1,2}\. august)/i],
    regler: [
      { felt: 'forste-inntak', moenster: new RegExp(`1\\. inntak: ${CA}(?<dato>${D})`, 'i') },
      { felt: 'svarfrist-forste', moenster: new RegExp(`1\\. inntak: [^\\n]*\\nSvarfrist: (?<dato>${D})`, 'i') },
      { felt: 'andre-inntak', moenster: new RegExp(`2\\. inntak: ${CA}(?<dato>${D})`, 'i') },
      { felt: 'svarfrist-andre', moenster: new RegExp(`2\\. inntak: [^\\n]*\\nSvarfrist: (?<dato>${D})`, 'i') },
      { felt: 'tredje-inntak', moenster: new RegExp(`3\\. inntak: ${CA}(?<dato>${D})`, 'i') },
      { felt: 'svarfrist-tredje', moenster: new RegExp(`3\\. inntak: [^\\n]*\\nSvarfrist: (?<dato>${D})`, 'i') },
    ],
  },
  {
    id: 'telemark-inntak',
    navn: 'Telemark fylkeskommune: Søke skoleplass',
    url: 'https://telemarkfylke.no/no/meny/tjenester/opplaring-og-folkehelse/opplaring-i-skole/soke-skoleplass/',
    fylke: '40',
    selektor: 'main',
    aar: [],
    regler: [
      // Setningen i spørsmålene: «I 2026 har vi hovedinntak 8. juli og sisteinntak 5. august (…). Etter inntakene er
      // svarfristen ca. 1 uke.»
      { felt: 'forste-inntak', moenster: new RegExp(`I (?<aar>\\d{4}) har vi hovedinntak (?<dato>${D})`, 'i') },
      { felt: 'andre-inntak', moenster: new RegExp(`I (?<aar>\\d{4}) har vi hovedinntak [^\\n]*?sisteinntak (?<dato>${D})`, 'i') },
      { felt: 'svarfrist-forste', moenster: /I (?<aar>\d{4}) har vi hovedinntak [^\n]*?svarfristen (?<relativ>(?:ca\. )?\d+ (?:uker?|dager|virkedager))/i, relativTillegg: 'etter inntaket' },
      { felt: 'svarfrist-andre', moenster: /I (?<aar>\d{4}) har vi hovedinntak [^\n]*?svarfristen (?<relativ>(?:ca\. )?\d+ (?:uker?|dager|virkedager))/i, relativTillegg: 'etter inntaket' },
      // Boksen øverst for neste inntak (lagt ut høsten 2026): «Vigo.no åpner for søking onsdag 6. januar 2027 (…)
      // Hovedinntak: 7. juli, kl. 08.00 / Sisteinntak: 4. august, kl. 08.00». Står ikke alltid på siden.
      { felt: 'forste-inntak', valgfri: true, moenster: new RegExp(`søking [a-zæøå]+ \\d{1,2}\\. januar (?<aar>\\d{4})[\\s\\S]*?Hovedinntak: (?<dato>${D})`, 'i') },
      { felt: 'andre-inntak', valgfri: true, moenster: new RegExp(`søking [a-zæøå]+ \\d{1,2}\\. januar (?<aar>\\d{4})[\\s\\S]*?Sisteinntak: (?<dato>${D})`, 'i') },
    ],
  },
  {
    id: 'vestfold-inntak',
    navn: 'Vestfold fylkeskommune: Søke skoleplass',
    url: 'https://vestfoldfylke.no/no/meny/tjenester/opplaring/opplaring-i-skole/soke-skoleplass/',
    fylke: '39',
    selektor: 'main',
    aar: [],
    regler: [
      // «I 2027 har vi hovedinntak 7. juli og sisteinntak 5. august (…). Etter inntakene er svarfristen 2 uker.»
      { felt: 'forste-inntak', moenster: new RegExp(`I (?<aar>\\d{4}) har vi hovedinntak (?<dato>${D})`, 'i') },
      { felt: 'andre-inntak', moenster: new RegExp(`I (?<aar>\\d{4}) har vi hovedinntak [^\\n]*?sisteinntak (?<dato>${D})`, 'i') },
      { felt: 'svarfrist-forste', moenster: /I (?<aar>\d{4}) har vi hovedinntak [^\n]*?svarfristen (?<relativ>(?:ca\. )?\d+ (?:uker?|dager|virkedager))/i, relativTillegg: 'etter inntaket' },
      { felt: 'svarfrist-andre', moenster: /I (?<aar>\d{4}) har vi hovedinntak [^\n]*?svarfristen (?<relativ>(?:ca\. )?\d+ (?:uker?|dager|virkedager))/i, relativTillegg: 'etter inntaket' },
    ],
  },
  {
    id: 'akershus-inntak',
    navn: 'Akershus fylkeskommune: Søke skoleplass og læreplass',
    url: 'https://afk.no/tjenester/skole-og-opplaring/opplaring-i-skole/soke-skoleplass/',
    fylke: '32',
    selektor: 'main',
    // Siden har ikke årstallet, men ukedagen til søknadsfristene («Mandag 2. februar»).
    aar: [/(?<ukedag>mandag|tirsdag|onsdag|torsdag|fredag) (?<dato>\d{1,2}\. februar) er frist/i, /(?<ukedag>mandag|tirsdag|onsdag|torsdag|fredag) (?<dato>\d{1,2}\. mars) er ordinær søknadsfrist/i],
    regler: [
      { felt: 'forste-inntak', moenster: new RegExp(`(?<dato>${D}) er førsteinntaket klart`, 'i') },
      { felt: 'andre-inntak', moenster: new RegExp(`(?<dato>${D}) er andreinntaket klart`, 'i') },
    ],
  },
  {
    id: 'agder-inntak',
    navn: 'Agder fylkeskommune: Ofte stilte spørsmål om skoleplass',
    url: 'https://agderfk.no/vare-tjenester/skole-og-opplaring/opplaring-i-skole/skoleplass-og-innsoking-til-videregaende-opplaring/ofte-stilte-sporsmal-om-skoleplass/',
    fylke: '42',
    selektor: 'main',
    aar: [/takke nei til skoleplass\/venteplass er \d{1,2}\. [a-zæøå]+ (?<aar>\d{4})/i],
    regler: [
      { felt: 'forste-inntak', moenster: new RegExp(`hovedinntaket, gjennomføres (?:senest )?(?<dato>${D})`, 'i') },
      { felt: 'svarfrist-forste', moenster: new RegExp(`takke nei til skoleplass\\/venteplass er (?<dato>${D}(?: \\d{4})?)`, 'i') },
      { felt: 'andre-inntak', moenster: new RegExp(`suppleringsinntaket \\((?:senest )?(?<dato>${D})\\)`, 'i') },
    ],
  },
  {
    id: 'troms-inntak',
    navn: 'Troms fylkeskommune: Inntakskalender',
    url: 'https://www.tromsfylke.no/tjenester/skole-og-opplaring/opplaring-i-skole/soke-skoleplass/inntakskalender/',
    fylke: '55',
    selektor: 'main',
    aar: [/Inntakskalender (?<aar>\d{4})/i],
    regler: [
      { felt: 'forste-inntak', nesteLinje: true, moenster: new RegExp(`(?<dato>${UKE})[^\\n]*\\n[^\\n]*ungdomsrett får svar`, 'i') },
      { felt: 'svarfrist-forste', nesteLinje: true, moenster: new RegExp(`(?<dato>${UKE})[^\\n]*\\n[^\\n]*?svare på tilbud[^\\n]*? er (?<relativ>\\d+ (?:virke)?dager etter at 1\\. inntak er klart)`, 'i') },
      { felt: 'andre-inntak', nesteLinje: true, moenster: new RegExp(`(?<dato>${UKE})[^\\n]*\\n[^\\n]*venteliste[^\\n]*får svar`, 'i') },
      { felt: 'svarfrist-andre', nesteLinje: true, moenster: new RegExp(`(?<dato>${UKE})[^\\n]*\\n[^\\n]*?svare på tilbud[^\\n]*? er (?<relativ>\\d+ (?:virke)?dager etter at 2\\. inntak er klart)`, 'i') },
      { felt: 'skolene-overtar', nesteLinje: true, moenster: new RegExp(`(?<dato>${UKE})[^\\n]*\\nSkolene overtar inntaket`, 'i') },
    ],
  },
  {
    id: 'finnmark-inntak',
    navn: 'Finnmark fylkeskommune: Slik søker du skoleplass',
    url: 'https://www.ffk.no/tjenester/skole-og-opplaring/opplaring-i-skole-for-elever/inntak-til-videregaende-opplaring/slik-soker-du-skoleplass/',
    fylke: '56',
    selektor: 'main',
    aar: [/åpner for innsøking [a-zæøå]+ \d{1,2}\. januar (?<aar>\d{4})/i],
    regler: [
      { felt: 'forste-inntak', moenster: new RegExp(`(?<dato>${UKE}) Søkere med opplæringsrett for ungdom får svar`, 'i') },
      { felt: 'svarfrist-forste', moenster: new RegExp(`(?<dato>${UKE}) Siste frist for å svare på første inntak er (?<relativ>\\d+ (?:virke)?dager etter mottatt tilbud)`, 'i') },
      { felt: 'andre-inntak', moenster: new RegExp(`(?<dato>${UKE}) Søkere på venteliste[^\\n]*?får svar`, 'i') },
      { felt: 'svarfrist-andre', moenster: new RegExp(`(?<dato>${UKE}) Siste frist for å svare på andre inntak er (?<relativ>\\d+ (?:virke)?dager etter mottatt tilbud)`, 'i') },
      { felt: 'skolene-overtar', moenster: new RegExp(`(?<dato>${UKE}) Skolene overtar`, 'i') },
    ],
  },
];
