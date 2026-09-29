// Enkle SVG-ikoner som arver tekstfargen (currentColor).

const baner = {
  hjem: 'M3 11.5 12 4l9 7.5M5.5 9.5V20h5v-6h3v6h5V9.5',
  sok: 'M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13ZM15.5 15.5 21 21',
  stjerne: 'm12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z',
  innstillinger:
    'M4 7h10M18 7h2M4 17h4M12 17h8M16 4.5v5M10 14.5v5',
  tilbake: 'M15 5 8 12l7 7',
  hoyre: 'm9 5 7 7-7 7',
  opp: 'm6 15 6-6 6 6',
  ned: 'm6 9 6 6 6-6',
  lukk: 'M6 6l12 12M18 6 6 18',
  bok: 'M5 4.5h11a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3V4.5ZM5 17a3 3 0 0 1 3-3h11M10.5 7.5v4M8.5 9.5h4',
  kalkulator: 'M6 3.5h12v17H6zM9 7h6M9 11h.01M12 11h.01M15 11h.01M9 14.5h.01M12 14.5h.01M15 14.5h.01M9 18h.01M12 18h.01M15 18h.01',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 11v5.5M12 7.5h.01',
  advarsel: 'M12 4 2.5 20h19L12 4ZM12 10v4.5M12 17.5h.01',
  ok: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8 12.5l2.7 2.7L16 9.8',
  feil: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM9 9l6 6M15 9l-6 6',
  klokke: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3.5 2',
  skole: 'M3 9.5 12 5l9 4.5-9 4.5-9-4.5ZM6.5 11.5V16c1.5 1.5 3.5 2.2 5.5 2.2s4-.7 5.5-2.2v-4.5M21 9.5V15',
  dokument: 'M6 3.5h8l4 4v13H6v-17ZM14 3.5v4h4M9 12h6M9 15.5h6',
  ekstern: 'M14 4h6v6M20 4l-8.5 8.5M18 14v5.5H4.5V6H10',
  kategori: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  last: 'M12 4v11m0 0-4-4m4 4 4-4M5 19h14',
  hent: 'M12 16V5m0 0-4 4m4-4 4 4M5 19h14',
  slett: 'M5 7h14M10 7V4.5h4V7M7 7l1 13h8l1-13',
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
