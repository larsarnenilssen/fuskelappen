// Formen på datafilene kalenderen leser i tillegg til fristene (avgjørelse 066). Filene lages av skriptene i scripts/
// og hentes hver uke i GitHub Actions.

/** data/skolerute/skolerute.json: skoleruta fra fylkenes forskrifter i Lovdata (scripts/skolerute/). */
export interface Skoleruter {
  lest: string;
  fylker: Record<
    string,
    {
      dokumenter: { id: string; refid: string; skolear: string; malform: 'nb' | 'nn'; vertskommune: boolean }[];
      hendelser: Skolerutehendelse[];
    }
  >;
  ulest: { dokument: string; skolear: string; tekst: string; grunn: string }[];
}

export type Skolerutetype =
  | 'forste-skoledag'
  | 'siste-skoledag'
  | 'hostferie'
  | 'juleferie'
  | 'vinterferie'
  | 'paskeferie'
  | 'forste-etter-jul'
  | 'forste-etter-paske'
  | 'elevfri'
  | 'planlegging'
  | 'helligdag'
  | 'annet';

export interface Skolerutehendelse {
  type: Skolerutetype;
  fra: string;
  til?: string;
  /** Teksten i forskriften, uendret. */
  tekst: string;
  dokument: string;
  skolear: string;
}

/** data/inntak/datoer.json: fylkenes datoer for svar og inntak (scripts/inntak/). */
export type Inntaksfelt =
  | 'fortrinnsinntak'
  | 'svarfrist-fortrinn'
  | 'forste-inntak'
  | 'svarfrist-forste'
  | 'andre-inntak'
  | 'svarfrist-andre'
  | 'tredje-inntak'
  | 'svarfrist-tredje'
  | 'skolene-overtar';

export interface Inntaksdato {
  fra?: string;
  til?: string;
  uke?: string;
  omtrent?: boolean;
  forbehold?: 'ca' | 'senest' | 'begynnelsen' | 'midten' | 'slutten';
  relativ?: string;
  tekst: string;
  kilder: string[];
}

export interface Inntaksdatoer {
  hentet: string;
  kilder: Record<string, { navn: string; url: string; fylke: string }>;
  fylker: Record<string, Record<string, Partial<Record<Inntaksfelt, Inntaksdato>>>>;
}

/** data/lovdata/kommende.json: vedtatte endringer i regelverket appen har (scripts/lovdata/). */
export interface KommendeEndring {
  id: string;
  dokument: string;
  paragrafer: string[];
  endretVed: { refid: string; tittel: string };
  iKraft: string | null;
  iKraftTekst: string;
  kunngjoring: string | null;
  kilde: 'datasett' | 'lovtidend';
}

export interface KommendeEndringer {
  lest: string;
  lovtidendAvd1: string | null;
  endringer: KommendeEndring[];
}
