// Sidene eksamensdatoene leses fra (fase 6, pakke 3, avgjørelse 059), med mønstrene som finner hver dato. Udirs sider
// har `fylke: null` og går foran fylkene. Fylkene er med når sidene svarer og robots.txt tillater henting (lest
// 04.10.2026). Fylker som stenger skymiljøet (Østfold, Buskerud, Vestfold, Agder, Vestland, Møre og Romsdal og Troms),
// legges inn når sidene kan leses. Feltene står i content/vurdering/frister-eksamen.yaml (`eksamensdato`).
import type { Eksamenskilde } from './les.ts';

const D = '\\d{1,2}\\.?\\s?[a-zæøå]+';

export const EKSAMENSKILDER: readonly Eksamenskilde[] = [
  {
    id: 'udir-administrere-eksamen',
    navn: 'Udir: Administrere eksamen',
    url: 'https://www.udir.no/eksamen-og-prover/eksamen/administrere-eksamen/',
    fylke: null,
    selektor: 'main',
    regler: [
      { felt: 'skoler-oppmelding', periode: 'var', moenster: new RegExp(`Våreksamen: skolen[^\\n]*?Påmeldingen åpner (${D})`, 'i') },
      { felt: 'skoler-oppmelding', periode: 'var', del: 'til', moenster: new RegExp(`Våreksamen: skolen[^\\n]*?innen (${D})`, 'i') },
      { felt: 'skoler-oppmelding', periode: 'host', moenster: new RegExp(`Høsteksamen: på videregående[^\\n]*?Påmeldingen åpner (${D})`, 'i') },
      { felt: 'skoler-oppmelding', periode: 'host', del: 'til', moenster: new RegExp(`Høsteksamen: på videregående er fristen (${D})`, 'i') },
      { felt: 'privatister-oppmelding', periode: 'var', del: 'til', moenster: new RegExp(`Privatistene har egne frister\\s?:?\\s?(${D}) om våren`, 'i') },
      { felt: 'privatister-oppmelding', periode: 'host', del: 'til', moenster: new RegExp(`Privatistene har egne frister[^\\n]*?(${D}) om høsten`, 'i') },
      { felt: 'ekstra-trekk', periode: 'var', moenster: new RegExp(`For (?<aar>\\d{4}) fastsetter vi en ekstra trekkdato (?<dato>${D})`, 'i') },
    ],
  },
  {
    id: 'udir-kalender',
    navn: 'Udir: Kalender',
    url: 'https://www.udir.no/kalender/',
    fylke: null,
    selektor: 'main',
    regler: [
      { felt: 'eksamen', periode: 'host', valgfri: true, moenster: new RegExp(`(?<dato>${D}\\.?–${D}\\.?)\\s*Høsteksamen (?<aar>\\d{4})`, 'i') },
      { felt: 'eksamen', periode: 'var', valgfri: true, moenster: new RegExp(`(?<dato>${D}\\.?–${D}\\.?)\\s*Våreksamen (?<aar>\\d{4})`, 'i') },
    ],
  },
  {
    id: 'trondelag-trekk',
    navn: 'Trøndelag fylkeskommune: Trekk og frister',
    url: 'https://www.trondelagfylke.no/vare-tjenester/utdanning/elev/eksamen/for-eksamen/trekkogfrister/',
    fylke: '50',
    selektor: 'main',
    regler: [
      { felt: 'trekk', periode: 'host', kl: true, moenster: /eksamenstrekk til skriftlig eksamen\nHøsten (?<aar>\d{4}): (?<dato>[^\n]+)/i },
      { felt: 'trekk', periode: 'var', kl: true, moenster: /eksamenstrekk til skriftlig eksamen\s+Høsten[^\n]*\nVåren (?<aar>\d{4}): (?<dato>[^\n]+)/i },
      { felt: 'sensur', periode: 'host', moenster: /Fellessensur\nHøsten (?<aar>\d{4}): (?<dato>[^\n]+)/i },
      { felt: 'sensur', periode: 'var', moenster: /Fellessensur\s+Høsten[^\n]*\nVåren (?<aar>\d{4}): (?<dato>[^\n]+)/i },
    ],
  },
  {
    id: 'trondelag-privatist-tid',
    navn: 'Trøndelag fylkeskommune: Dato, tid og sted for eksamen',
    url: 'https://www.trondelagfylke.no/vare-tjenester/utdanning/privatisteksamen/tid-og-sted/',
    fylke: '50',
    selektor: 'main',
    regler: [
      { felt: 'privatister-datoer', periode: 'host', fylke: true, moenster: new RegExp(`etter (${D}) for høsteksamen`, 'i') },
      { felt: 'privatister-datoer', periode: 'var', fylke: true, moenster: new RegExp(`etter (${D}) for våreksamen`, 'i') },
    ],
  },
  {
    id: 'trondelag-privatist-tilrettelegging',
    navn: 'Trøndelag fylkeskommune: Tilrettelegging av eksamen',
    url: 'https://www.trondelagfylke.no/vare-tjenester/utdanning/privatisteksamen/tilrettelegging-av-eksamen/',
    fylke: '50',
    selektor: 'main',
    regler: [
      { felt: 'tilrettelegging-privatister', periode: 'host', fylke: true, moenster: new RegExp(`(${D}) for høsteksamen`, 'i') },
      { felt: 'tilrettelegging-privatister', periode: 'var', fylke: true, moenster: new RegExp(`(${D}) for våreksamen`, 'i') },
    ],
  },
  {
    id: 'trondelag-privatist-oppmelding',
    navn: 'Trøndelag fylkeskommune: Oppmelding',
    url: 'https://www.trondelagfylke.no/vare-tjenester/utdanning/privatisteksamen/oppmelding/',
    fylke: '50',
    selektor: 'main',
    regler: [
      { felt: 'privatister-oppmelding', periode: 'host', moenster: new RegExp(`(${D} - ${D}) kl\\. [\\d:]+ \\(høsteksamen\\)`, 'i') },
      { felt: 'privatister-oppmelding', periode: 'var', moenster: new RegExp(`(${D} - ${D}) kl\\. [\\d:]+ \\(våreksamen\\)`, 'i') },
    ],
  },
  {
    id: 'akershus-privatist-dato',
    navn: 'Akershus fylkeskommune: Dato, tid og sted for eksamen',
    url: 'https://afk.no/tjenester/skole-og-opplaring/eksamen-og-vitnemal/privatisteksamen/dato-tid-og-sted-for-eksamen/',
    fylke: '32',
    selektor: 'main',
    regler: [
      { felt: 'privatister-datoer', periode: 'host', fylke: true, moenster: new RegExp(`Høsteksamen: Fra (${D})`, 'i') },
      { felt: 'privatister-datoer', periode: 'var', fylke: true, moenster: new RegExp(`Våreksamen: Fra (${D})`, 'i') },
    ],
  },
  {
    id: 'akershus-privatist-oppmelding',
    navn: 'Akershus fylkeskommune: Meld deg opp til eksamen',
    url: 'https://afk.no/tjenester/skole-og-opplaring/eksamen-og-vitnemal/privatisteksamen/meld-deg-opp-til-eksamen/',
    fylke: '32',
    selektor: 'main',
    regler: [
      { felt: 'privatister-oppmelding', periode: 'host', moenster: new RegExp(`Høsteksamen: (${D}\\s?–\\s?${D})`, 'i') },
      { felt: 'privatister-oppmelding', periode: 'var', moenster: new RegExp(`Våreksamen: (${D}\\s?–\\s?${D})`, 'i') },
    ],
  },
  {
    id: 'akershus-privatist-tilrettelegging',
    navn: 'Akershus fylkeskommune: Tilrettelegging av eksamen',
    url: 'https://afk.no/tjenester/skole-og-opplaring/eksamen-og-vitnemal/privatisteksamen/tilrettelegging-av-eksamen/',
    fylke: '32',
    selektor: 'main',
    regler: [
      { felt: 'tilrettelegging-privatister', periode: 'var', fylke: true, moenster: new RegExp(`Søknadsfrist: (${D}) for våreksamen`, 'i') },
      { felt: 'tilrettelegging-privatister', periode: 'host', fylke: true, moenster: new RegExp(`og (${D}) for høsteksamen`, 'i') },
    ],
  },
  {
    id: 'akershus-privatist-karakter',
    navn: 'Akershus fylkeskommune: Karakter, vitnemål og klage',
    url: 'https://afk.no/tjenester/skole-og-opplaring/eksamen-og-vitnemal/privatisteksamen/karakter-vitnemal-og-klage/',
    fylke: '32',
    selektor: 'main',
    regler: [
      { felt: 'sensur', periode: 'host', moenster: new RegExp(`Karakter for høsteksamen blir satt senest (${D} \\d{4})`, 'i') },
      { felt: 'sensur', periode: 'var', moenster: new RegExp(`Karakter for våreksamen blir satt senest (${D} \\d{4})`, 'i') },
    ],
  },
  {
    id: 'innlandet-privatist-oppmelding',
    navn: 'Innlandet fylkeskommune: Oppmelding',
    url: 'https://innlandetfylke.no/tjenester/skole-og-utdanning/eksamen-og-vitnemal/eksamen-for-privatister/oppmelding/',
    fylke: '34',
    selektor: 'main',
    regler: [
      { felt: 'privatister-oppmelding', periode: 'host', moenster: /Høsteksamen: (\d{1,2}\.\s?–\s?\d{1,2}\. [a-zæøå]+)/i },
      { felt: 'privatister-oppmelding', periode: 'var', moenster: new RegExp(`Våreksamen: (${D}\\s?–\\s?${D})`, 'i') },
    ],
  },
  {
    id: 'innlandet-privatist-for-eksamen',
    navn: 'Innlandet fylkeskommune: Før eksamen',
    url: 'https://innlandetfylke.no/tjenester/skole-og-utdanning/eksamen-og-vitnemal/eksamen-for-privatister/for-eksamen/',
    fylke: '34',
    selektor: 'main',
    regler: [
      { felt: 'privatister-datoer', periode: 'host', fylke: true, moenster: new RegExp(`senest (${D}) for høsteksamen`, 'i') },
      { felt: 'privatister-datoer', periode: 'var', fylke: true, moenster: new RegExp(`for høsteksamen og (${D}) for våreksamen`, 'i') },
    ],
  },
  {
    id: 'innlandet-privatist-soknader',
    navn: 'Innlandet fylkeskommune: Søknader',
    url: 'https://innlandetfylke.no/tjenester/skole-og-utdanning/eksamen-og-vitnemal/eksamen-for-privatister/soknader/',
    fylke: '34',
    selektor: 'main',
    regler: [
      { felt: 'tilrettelegging-privatister', periode: 'var', fylke: true, moenster: new RegExp(`Søknadsfrist for særskilt tilrettelegging\\s+Våreksamen: (${D})`, 'i') },
      { felt: 'tilrettelegging-privatister', periode: 'host', fylke: true, moenster: new RegExp(`Søknadsfrist for særskilt tilrettelegging\\s+Våreksamen: ${D}\\s+Høsteksamen: (${D})`, 'i') },
    ],
  },
  {
    id: 'innlandet-klage',
    navn: 'Innlandet fylkeskommune: Klage på karakter',
    url: 'https://innlandetfylke.no/tjenester/skole-og-utdanning/eksamen-og-vitnemal/klage-pa-karakterer/',
    fylke: '34',
    selektor: 'main',
    regler: [
      { felt: 'standpunkt', periode: 'var', fylke: true, moenster: new RegExp(`Standpunktkarakterer i fag offentliggjøres [a-zæøå]+ (${D} \\d{4})`, 'i') },
      { felt: 'hurtigklage-standpunkt', periode: 'var', fylke: true, moenster: new RegExp(`Hurtigklagefristen for avgangselever er [a-zæøå]+ (${D} \\d{4})`, 'i') },
    ],
  },
  {
    id: 'rogaland-nettskolen',
    navn: 'Rogaland fylkeskommune: Nettskolen, eksamen og karakterer',
    url: 'https://www.rogfk.no/nettskolen/hovedmeny/for-elever/eksamen-og-karakterer/',
    fylke: '11',
    selektor: 'main',
    regler: [{ felt: 'trekk', periode: 'var', kl: true, moenster: /Melding om skriftlig og muntlig eksamen blir synlig[^\n]*?[a-zæøå]+dag (\d{1,2}\. [a-zæøå]+ \d{4} kl\. \d{1,2}(?:[:.]\d{2})?)/i }],
  },
  {
    id: 'nordland-privatist',
    navn: 'Nordland fylkeskommune: Privatisteksamen',
    url: 'https://www.nfk.no/tjenester/skole-og-opplaring/eksamen/privatisteeksamen/',
    fylke: '18',
    selektor: 'main',
    regler: [
      { felt: 'privatister-oppmelding', periode: 'host', moenster: new RegExp(`Høst eksamen - fra og med (${D} til og med ${D})`, 'i') },
      { felt: 'privatister-oppmelding', periode: 'var', moenster: new RegExp(`Våreksamen - fra og med (${D} til ${D})`, 'i') },
      { felt: 'privatister-datoer', periode: 'host', fylke: true, moenster: /publiseres i privatistportalen[^\n]*?(\d{1,2}\.? [a-zæøå]+) \(høsteksamen\)/i },
      { felt: 'privatister-datoer', periode: 'var', fylke: true, moenster: /publiseres i privatistportalen (\d{1,2}\.? [a-zæøå]+) \(våreksamen\)/i },
      { felt: 'tilrettelegging-privatister', periode: 'var', fylke: true, moenster: /særskilt tilrettelegging[^\n]*?Søknadsfrist er (\d{1,2}\.\s?[a-zæøå]+) \(vår\)/i },
      { felt: 'tilrettelegging-privatister', periode: 'host', fylke: true, moenster: /særskilt tilrettelegging[^\n]*?Søknadsfrist er [^\n]*?og (\d{1,2}\.?\s?[a-zæøå]+)\s?\(høst\)/i },
    ],
  },
  {
    id: 'oslo-privatist-tid',
    navn: 'Oslo kommune: Når og hvor er eksamen',
    url: 'https://www.oslo.kommune.no/skole-og-utdanning/privatisteksamen/nar-og-hvor-er-eksamen/',
    fylke: '03',
    selektor: 'main',
    regler: [
      { felt: 'privatister-datoer', periode: 'host', fylke: true, moenster: new RegExp(`Privatistportalen innen (${D}) \\(høst\\)`, 'i') },
      { felt: 'privatister-datoer', periode: 'var', fylke: true, moenster: new RegExp(`og innen (${D}) \\(vår\\)`, 'i') },
    ],
  },
  {
    id: 'oslo-privatist-oppmelding',
    navn: 'Oslo kommune: Meld deg opp til privatisteksamen',
    url: 'https://www.oslo.kommune.no/skole-og-utdanning/privatisteksamen/meld-deg-opp-til-privatisteksamen/',
    fylke: '03',
    selektor: 'main',
    regler: [
      { felt: 'privatister-oppmelding', periode: 'host', moenster: new RegExp(`fra og med (${D} til og med ${D}) for høstsemesteret`, 'i') },
      { felt: 'privatister-oppmelding', periode: 'var', moenster: new RegExp(`fra og med (${D} til og med ${D}) for vårsemesteret`, 'i') },
    ],
  },
  {
    id: 'oslo-privatist-tilrettelegging',
    navn: 'Oslo kommune: Særskilt tilrettelegging av privatisteksamen',
    url: 'https://www.oslo.kommune.no/skole-og-utdanning/privatisteksamen/sarskilt-tilrettelegging-av-privatisteksamen/',
    fylke: '03',
    selektor: 'main',
    regler: [
      { felt: 'tilrettelegging-privatister', periode: 'host', fylke: true, moenster: new RegExp(`fristen som er (${D}) \\(høst\\)`, 'i') },
      { felt: 'tilrettelegging-privatister', periode: 'var', fylke: true, moenster: new RegExp(`\\(høst\\) og (${D}) \\(vår\\)`, 'i') },
    ],
  },
  {
    id: 'finnmark-elev',
    navn: 'Finnmark fylkeskommune: Eksamen for elever',
    url: 'https://www.ffk.no/tjenester/skole-og-opplaring/eksamen-for-elever-og-privatister/eksamen-for-elever/',
    fylke: '56',
    selektor: 'main',
    regler: [{ felt: 'trekk', periode: 'var', kl: true, moenster: /Offentliggjøring av trekk i vårsemesteret skjer den (\d{1,2}\. [a-zæøå]+ kl\. \d{1,2}(?:[:.]\d{2})?)/i }],
  },
  {
    id: 'finnmark-privatist-tilrettelegging',
    navn: 'Finnmark fylkeskommune: Tilrettelegging av eksamen',
    url: 'https://www.ffk.no/tjenester/skole-og-opplaring/eksamen-for-elever-og-privatister/eksamen-for-privatister/tilrettelegging-av-eksamen/',
    fylke: '56',
    selektor: 'main',
    regler: [
      { felt: 'tilrettelegging-privatister', periode: 'host', fylke: true, moenster: new RegExp(`er (${D}) for høsteksamen`, 'i') },
      { felt: 'tilrettelegging-privatister', periode: 'var', fylke: true, moenster: new RegExp(`for høsteksamen og (${D}) for våreksamen`, 'i') },
    ],
  },
  {
    id: 'telemark-privatist',
    navn: 'Telemark fylkeskommune: Før eksamen (privatister)',
    url: 'https://telemarkfylke.no/no/meny/tjenester/opplaring-og-folkehelse/eksamen/eksamen-for-privatister/for-eksamen/',
    fylke: '40',
    selektor: 'main',
    regler: [
      { felt: 'privatister-oppmelding', periode: 'host', moenster: new RegExp(`For høsteksamen: (${D} - ${D})`, 'i') },
      { felt: 'privatister-oppmelding', periode: 'var', moenster: new RegExp(`For våreksamen: (${D} - ${D})`, 'i') },
      { felt: 'tilrettelegging-privatister', periode: 'host', fylke: true, moenster: new RegExp(`Frist for å søke om tilrettelegging er (${D}) \\(høst\\)`, 'i') },
      { felt: 'tilrettelegging-privatister', periode: 'var', fylke: true, moenster: new RegExp(`Frist for å søke om tilrettelegging er ${D} \\(høst\\) og (${D}) \\(vår\\)`, 'i') },
    ],
  },
];
