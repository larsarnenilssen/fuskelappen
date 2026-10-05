// Temaene i begrepsbanken (eier 05.10.2026). Begrepene får tema etter filen de står i under content/begreper/, så et
// nytt begrep får tema av seg selv. En ny fil må føres opp her (testes).

export const begrepstemaer = ['inntak', 'fag', 'tilrettelegging', 'vurdering', 'arbeidstid', 'forvaltning'] as const;

export type Begrepstema = (typeof begrepstemaer)[number];

/** Temaet til hver fil i content/begreper/, etter filnavnet uten .yaml. */
export const TEMA_FOR_FIL: Readonly<Record<string, Begrepstema>> = {
  inntak: 'inntak',
  opplaeringslop: 'inntak',
  laereplanverket: 'fag',
  dokumentasjon: 'fag',
  tilrettelegging: 'tilrettelegging',
  sprak: 'tilrettelegging',
  vurdering: 'vurdering',
  eksamen: 'vurdering',
  arbeidstid: 'arbeidstid',
  ansettelse: 'arbeidstid',
  lov: 'forvaltning',
  regelverk: 'forvaltning',
  forvaltning: 'forvaltning',
  'innsyn-og-arkiv': 'forvaltning',
  fylker: 'forvaltning',
};

/** Filnavnet uten mappe og .yaml, f.eks. «innsyn-og-arkiv» fra «/content/begreper/innsyn-og-arkiv.yaml». */
export function filnavn(sti: string): string {
  return sti.replace(/^.*\//, '').replace(/\.yaml$/, '');
}

export function erBegrepstema(verdi: string | null): verdi is Begrepstema {
  return verdi !== null && (begrepstemaer as readonly string[]).includes(verdi);
}
