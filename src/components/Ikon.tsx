// Enkle SVG-ikoner som arver tekstfargen (currentColor).

const baner = {
  hjem: 'M3 11.5 12 4l9 7.5M5.5 9.5V20h5v-6h3v6h5V9.5',
  sok: 'M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13ZM15.5 15.5 21 21',
  stjerne: 'm12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z',
  innstillinger:
    'M4 7h10M18 7h2M4 17h4M12 17h8M16 4.5v5M10 14.5v5',
  tilbake: 'M15 5 8 12l7 7',
  // Håndtaket for dra og slipp: seks prikker.
  dra: 'M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01',
  hoyre: 'm9 5 7 7-7 7',
  opp: 'm6 15 6-6 6 6',
  ned: 'm6 9 6 6 6-6',
  // Sortering: piler opp og ned, for kolonner som kan sorteres.
  sorter: 'm8 9 4-4 4 4M8 15l4 4 4-4',
  lukk: 'M6 6l12 12M18 6 6 18',
  bok: 'M5 4.5h11a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3V4.5ZM5 17a3 3 0 0 1 3-3h11M10.5 7.5v4M8.5 9.5h4',
  kalkulator: 'M6 3.5h12v17H6zM9 7h6M9 11h.01M12 11h.01M15 11h.01M9 14.5h.01M12 14.5h.01M15 14.5h.01M9 18h.01M12 18h.01M15 18h.01',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 11v5.5M12 7.5h.01',
  advarsel: 'M12 4 2.5 20h19L12 4ZM12 10v4.5M12 17.5h.01',
  ok: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8 12.5l2.7 2.7L16 9.8',
  hake: 'M5 12.5l4.5 4.5L19 7.5',
  feil: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM9 9l6 6M15 9l-6 6',
  klokke: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3.5 2',
  // Kalender: et ark med ringer og ruter, for kalenderen (fase 6, pakke 5).
  kalender: 'M4 6h16v14H4zM4 10.5h16M8.5 3.5V8M15.5 3.5V8M8 14h2M14 14h2M8 17h2',
  // Filter: tre streker som blir kortere.
  filter: 'M4 6h16M7 12h10M10 18h4',
  // Kontor: en mappe, for opplæringskontorene (avgjørelse 053).
  kontor: 'M4 8h16v11H4zM9 8V5.5h6V8M4 12.5h16',
  // Inntak: en pil inn gjennom en døråpning (eier 04.10.2026).
  inngang: 'M14 4h5.5v16H14M3.5 12H14m0 0-4-4m4 4-4 4',
  // Ark med hake, for Vurdering (fase 6).
  vurdering: 'M6 3.5h8.5L18 7v13.5H6zM14.5 3.5V7H18M9 13l2.2 2.2L15.5 11',
  skole: 'M3 9.5 12 5l9 4.5-9 4.5-9-4.5ZM6.5 11.5V16c1.5 1.5 3.5 2.2 5.5 2.2s4-.7 5.5-2.2v-4.5M21 9.5V15',
  dokument: 'M6 3.5h8l4 4v13H6v-17ZM14 3.5v4h4M9 12h6M9 15.5h6',
  ekstern: 'M14 4h6v6M20 4l-8.5 8.5M18 14v5.5H4.5V6H10',
  kategori: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  last: 'M12 4v11m0 0-4-4m4 4 4-4M5 19h14',
  hent: 'M12 16V5m0 0-4 4m4-4 4 4M5 19h14',
  slett: 'M5 7h14M10 7V4.5h4V7M7 7l1 13h8l1-13',
  pluss: 'M12 5v14M5 12h14',
  sporsmal: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM9.6 9.4a2.5 2.5 0 1 1 3.4 2.4c-.6.3-1 .8-1 1.5v.5M12 16.8h.01',
  kopier: 'M9 9h10.5v11.5H9zM5.5 15V4H15',
  del: 'M15.5 5.5a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0M3.5 12a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0M15.5 18.5a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0M8.2 10.8l7.6-4.1M8.2 13.2l7.6 4.1',
  blyant: 'M4 20h4L19.5 8.5l-4-4L4 16v4ZM13.5 6.5l4 4',
  skriv: 'M7 8V3.5h10V8M7 17H4.5V9.5h15V17H17M7 13.5h10V20.5H7z',
  utvid: 'M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5',
  forminsk: 'M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5',
  // Veiviser: en stolpe med to skilt, for opplæringsløp.
  veiviser: 'M12 3v18M12 5h7l2 2.5-2 2.5h-7M12 12H5l-2 2.5L5 17h7M9 21h6',
  // Arbeidsplan: stillingen som en stolpe delt i deler, med strek for stillingsprosenten (eier 02.10.2026).
  arbeidsplan: 'M3 7.5h18v9H3zM9.5 7.5v9M14.5 7.5v9M18 4.5v15',
  // Sammenlign: to stolper med ulik høyde.
  sammenlign: 'M3.5 20h17M6.5 20v-8h4v8M13.5 20V6h4v14',
  // Paragraf: paragraftegnet, for Lov og forskrift.
  paragraf: 'M15.5 6.8c-.6-1.4-1.9-2.3-3.5-2.3-2 0-3.5 1.2-3.5 2.8 0 3.8 7.5 2.6 7.5 6.6 0 1.3-1 2.4-2.6 2.8M8.5 17.2c.6 1.4 1.9 2.3 3.5 2.3 2 0 3.5-1.2 3.5-2.8 0-3.8-7.5-2.6-7.5-6.6 0-1.3 1-2.4 2.6-2.8',
  // Person: hode og skuldre, for hvem som har ansvaret i et steg.
  person: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20.5c.8-3.6 3.8-5.5 7.5-5.5s6.7 1.9 7.5 5.5',
  // Trapp: trinn for trinn, for veiviserne i Tilrettelegging.
  trapp: 'M3.5 20h4.5v-4.5h4.5V11h4.5V6.5h3.5',
  // Flagg: der veien i en veiviser ender.
  flagg: 'M5.5 21V3.5M5.5 4h12l-2.5 4.25L17.5 12.5h-12',
  // Sted: en nål på kartet, for «Hvor er du nå?» og «Kommer fra» i veiene til fag- og svennebrev.
  sted: 'M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  // Vei: en vei som deler seg i to, for veiene til fag- og svennebrev.
  vei: 'M12 21v-8.5L6 6.5V3M12 12.5l6-6V3',
  // Lag: tre lag oppå hverandre, for læreplanverket (overordnet del, ferdigheter og temaer).
  lag: 'M12 4 3 8.5l9 4.5 9-4.5L12 4ZM3 12.5l9 4.5 9-4.5M3 16.5l9 4.5 9-4.5',
  // Igjen: en pil i ring, for mer opplæring i fag som ikke er bestått.
  igjen: 'M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4v4.5H9',
} as const;

export type Ikonnavn = keyof typeof baner;

interface Props {
  navn: Ikonnavn;
  fylt?: boolean;
  class?: string;
}

export function Ikon({ navn, fylt = false, class: klasse }: Props) {
  return (
    <svg
      class={`ikon${klasse ? ` ${klasse}` : ''}`}
      viewBox="0 0 24 24"
      width="24"
      height="24"
      aria-hidden="true"
      focusable="false"
      data-ikon={navn}
      fill={fylt ? 'currentColor' : 'none'}
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d={baner[navn]} />
    </svg>
  );
}
