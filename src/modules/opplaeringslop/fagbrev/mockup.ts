// MOCKUP (fase 6, pakke 6): veiene for lærlinger og kandidater til fag- og svennebrev, praksisbrev og kompetansebevis,
// og overgangene mellom dem. Bare bokmål, og kildene som korte etiketter. Når eier har godkjent designet, flyttes
// innholdet til content/opplaeringslop/ med nynorsk, kilder fra kilderegisteret og kontrollspørsmål, og filen fjernes.
// Ingen påstand uten belegg i kildene (eier 06.10.2026, svar 5): det som ikke står i kildene, er tatt bort eller sagt
// som at kilden ikke har en regel.

export type Mal = 'fagbrev' | 'praksisbrev' | 'kompetansebevis';
export type Del = 'skole' | 'bedrift' | 'praksis' | 'prove';

export interface Vegsteg {
  del: Del;
  tekst: string;
  /** Under teksten, f.eks. «1 år». Bare når kilden sier det. */
  tid?: string;
  /** Adressen steget lenker til (tilbudet, begrepet eller prøven). */
  rute: string;
}

export interface Vei {
  id: string;
  mal: Mal;
  tittel: string;
  /** Kort navn på rollen i knappen «Mer om …», så knappen får plass på smal skjerm. */
  kortnavn: string;
  kort: string;
  ingress: string;
  steg: Vegsteg[];
  kontrakt: string;
  prove: string;
  melderOpp: string;
  /** Om fellesfagene må være bestått: ja, nei, eller ingen egen regel. */
  fellesfag: 'ja' | 'nei' | 'ingen';
  fellesfagTekst: string;
  dokumentasjon: string;
  /** Bare når kildene sier noe om voksne på denne veien. */
  voksne?: string;
  kilder: string[];
  /** Utgangspunktet brukeren står på når veien er gått, for «Veien videre». */
  etter: string;
}

export interface Overgang {
  /** En vei i listen, eller en annen side (påbygging, nytt fagbrev). */
  til: string;
  vilkar: string;
  kilder: string[];
}

export interface Utgangspunkt {
  id: string;
  tittel: string;
  overganger: Overgang[];
}

export const PROVE_RUTE = '/vurdering/fag-og-svenneproven';
export const FAGBREV_RUTE = '/opplaeringslop/laerlinger-og-kandidater';
const YRKESFAG = '/opplaeringslop/lop';
const begrep = (id: string) => `/begreper/${id}`;

/** Når kontrakten sies opp eller heves (ol. § 7-3 og § 7-4), på veiene med kontrakt (eier 06.10.2026, svar 4). */
export const KONTRAKT_SLUTT = {
  tekst:
    'Kontrakten kan sies opp når partene er enige. Fylkeskommunen hever den når den som har læretid, sier skriftlig fra at hen ikke vil fortsette, og kan heve den ved vesentlige brudd på pliktene. Lærebedriften skriver ut en attest for opplæringen som er gjennomført, og arbeidsavtalen faller bort.',
  kilder: ['ol. § 7-3', 'ol. § 7-4 fjerde ledd'],
};

const LAERLING_FELLESFAG = 'Må være bestått. Med ett eller to som ikke er bestått, kan prøven tas, men fagene må bestås etterpå.';

export const VEIER: Vei[] = [
  {
    id: 'laerling',
    mal: 'fagbrev',
    tittel: 'Lærling',
    kortnavn: 'lærling',
    kort: 'Hovedmodellen: to år i skole og to år i bedrift',
    ingress: 'Den vanlige veien: Vg1 og Vg2 på et yrkesfaglig utdanningsprogram, og så læretid i bedrift med lærekontrakt.',
    steg: [
      { del: 'skole', tekst: 'Vg1 yrkesfag', tid: '1 år', rute: YRKESFAG },
      { del: 'skole', tekst: 'Vg2 yrkesfag', tid: '1 år', rute: YRKESFAG },
      { del: 'bedrift', tekst: 'Lærling', tid: 'Vanligvis 2 år', rute: begrep('laerling') },
      { del: 'prove', tekst: 'Fag- eller svenneprøve', rute: PROVE_RUTE },
    ],
    kontrakt: 'Lærekontrakt med lærebedriften',
    prove: 'Fag- eller svenneprøve',
    melderOpp: 'Lærebedriften',
    fellesfag: 'ja',
    fellesfagTekst: LAERLING_FELLESFAG,
    dokumentasjon: 'Fag- eller svennebrev',
    voksne: 'Voksne med rett til videregående opplæring skal få et tilbud som fører fram til sluttkompetansen de har søkt på.',
    kilder: ['ol. § 5-2 tredje ledd', 'ol. § 7-1', 'ol. § 18-3 andre ledd', 'ofo. § 9-48', 'ofo. § 9-56', 'ofo. § 9-57'],
    etter: 'ferdig-fagbrev',
  },
  {
    id: 'laerling-tidlig',
    mal: 'fagbrev',
    tittel: 'Lærling rett etter grunnskolen eller Vg1',
    kortnavn: 'tidlig lærekontrakt',
    kort: '0+4, 1+3 og særløp',
    ingress: 'Fylkeskommunen kan godkjenne kontrakter som avviker fra opplæringsløpet, f.eks. med opplæringen i skole og bedrift i en annen rekkefølge.',
    steg: [
      { del: 'skole', tekst: 'Vg1 yrkesfag', tid: '0 eller 1 år', rute: YRKESFAG },
      { del: 'bedrift', tekst: 'Lærling', tid: '3 eller 4 år', rute: begrep('laerling') },
      { del: 'prove', tekst: 'Fag- eller svenneprøve', rute: PROVE_RUTE },
    ],
    kontrakt: 'Lærekontrakt der organiseringen går klart fram',
    prove: 'Fag- eller svenneprøve',
    melderOpp: 'Lærebedriften',
    fellesfag: 'ja',
    fellesfagTekst: `${LAERLING_FELLESFAG} Kontrakten sier hvem som har ansvaret for de ulike delene av opplæringen.`,
    dokumentasjon: 'Fag- eller svennebrev',
    kilder: ['ol. § 7-2 første og fjerde ledd', 'ofo. § 6-3 første ledd bokstav a–c og tredje ledd', 'Udir-1-2026 vedlegg 1, 3.4.3 og 3.4.4'],
    etter: 'ferdig-fagbrev',
  },
  {
    id: 'praksisbrev-fagbrev',
    mal: 'fagbrev',
    tittel: 'Praksisbrevkandidat som blir lærling',
    kortnavn: 'praksisbrev til fagbrev',
    kort: 'Praksisbrev først, og så fag- eller svennebrev',
    ingress: 'Praksisbrevkandidaten tar praksisbrevprøven og kan så skrive lærekontrakt i lærefaget.',
    steg: [
      { del: 'bedrift', tekst: 'Praksisbrevkandidat', rute: begrep('praksisbrev') },
      { del: 'prove', tekst: 'Praksisbrevprøve', rute: PROVE_RUTE },
      { del: 'bedrift', tekst: 'Lærling', tid: 'Etter godskriving', rute: begrep('laerling') },
      { del: 'prove', tekst: 'Fag- eller svenneprøve', rute: PROVE_RUTE },
    ],
    kontrakt: 'Opplæringskontrakt, og så lærekontrakt',
    prove: 'Praksisbrevprøve, og så fag- eller svenneprøve',
    melderOpp: 'Lærebedriften',
    fellesfag: 'ja',
    fellesfagTekst: 'Praksisbrev: må være bestått, men prøven kan tas med ett fellesfag som ikke er bestått. Fag- eller svennebrev: som for lærlinger.',
    dokumentasjon: 'Praksisbrev, og så fag- eller svennebrev',
    kilder: ['ofo. § 6-3 første ledd bokstav e', 'ofo. § 6-9 første ledd', 'ofo. § 9-57'],
    etter: 'ferdig-fagbrev',
  },
  {
    id: 'fra-studieforberedende',
    mal: 'fagbrev',
    tittel: 'Lærling etter Vg1 studieforberedende',
    kortnavn: 'opphenting og kryssløp',
    kort: 'Med yrkesfaglig opphenting eller kryssløp',
    ingress: 'En elev med Vg1 studiespesialisering kan gå videre til Vg2 på yrkesfag, med yrkesfaglig opphenting eller som kryssløp.',
    steg: [
      { del: 'skole', tekst: 'Vg1 studieforberedende', tid: '1 år', rute: YRKESFAG },
      { del: 'skole', tekst: 'Vg2 yrkesfag med opphenting', tid: '1 år', rute: begrep('yrkesfaglig-opphenting') },
      { del: 'bedrift', tekst: 'Lærling', tid: 'Vanligvis 2 år', rute: begrep('laerling') },
      { del: 'prove', tekst: 'Fag- eller svenneprøve', rute: PROVE_RUTE },
    ],
    kontrakt: 'Lærekontrakt med lærebedriften',
    prove: 'Fag- eller svenneprøve',
    melderOpp: 'Lærebedriften',
    fellesfag: 'ja',
    fellesfagTekst: `${LAERLING_FELLESFAG} Fellesfagene fra Vg1 studiespesialisering dekker fellesfagene på Vg2, unntatt kroppsøving.`,
    dokumentasjon: 'Fag- eller svennebrev',
    kilder: ['Udir-1-2026 vedlegg 1, 3.1 og 3.4.2', 'Grep: YFO2002 Yrkesfaglig opphenting'],
    etter: 'ferdig-fagbrev',
  },
  {
    id: 'vg3-i-skole',
    mal: 'fagbrev',
    tittel: 'Elev på Vg3 i skole',
    kortnavn: 'Vg3 i skole',
    kort: 'Uten læreplass: fag- eller svenneprøve som elev',
    ingress: 'Den som oppfyller vilkårene for læreplass, men ikke får det, har rett til et annet tilbud på Vg3, og tar prøven som elev.',
    steg: [
      { del: 'skole', tekst: 'Vg1 yrkesfag', tid: '1 år', rute: YRKESFAG },
      { del: 'skole', tekst: 'Vg2 yrkesfag', tid: '1 år', rute: YRKESFAG },
      { del: 'skole', tekst: 'Vg3 i skole', rute: begrep('vg3-i-skole') },
      { del: 'prove', tekst: 'Fag- eller svenneprøve', rute: PROVE_RUTE },
    ],
    kontrakt: 'Ingen. Fylkeskommunen skal fortsatt prøve å formidle læreplass til den som ønsker det.',
    prove: 'Fag- eller svenneprøve som elev',
    melderOpp: 'Skolen',
    fellesfag: 'ja',
    fellesfagTekst: 'Må være bestått. Med ett eller to som ikke er bestått, kan eleven ta prøven, men må bestå fagene etterpå.',
    dokumentasjon: 'Fag- eller svennebrev',
    voksne: 'Voksne som har valgt videregående opplæring etter kapittel 5, får de samme rettighetene som ungdom.',
    kilder: ['ol. § 5-6', 'ol. § 18-3 tredje ledd', 'ofo. § 6-2', 'ofo. § 9-56 første ledd', 'ofo. § 9-57'],
    etter: 'ferdig-fagbrev',
  },
  {
    id: 'laerekandidat-laerling',
    mal: 'fagbrev',
    tittel: 'Lærekandidat som blir lærling',
    kortnavn: 'lærekandidat til lærling',
    kort: 'Kontrakten endres underveis',
    ingress: 'Kontrakten kan endres fra opplæringskontrakt til lærekontrakt, men bare med samtykke fra fylkeskommunen.',
    steg: [
      { del: 'bedrift', tekst: 'Lærekandidat', rute: begrep('laerekandidat') },
      { del: 'bedrift', tekst: 'Lærling', tid: 'Etter godskriving', rute: begrep('laerling') },
      { del: 'prove', tekst: 'Fag- eller svenneprøve', rute: PROVE_RUTE },
    ],
    kontrakt: 'Opplæringskontrakt som endres til lærekontrakt',
    prove: 'Fag- eller svenneprøve',
    melderOpp: 'Lærebedriften',
    fellesfag: 'ja',
    fellesfagTekst: `Som for lærlinger, når kandidaten er blitt lærling. ${LAERLING_FELLESFAG}`,
    dokumentasjon: 'Fag- eller svennebrev',
    kilder: ['ol. § 7-2 andre ledd', 'ofo. § 6-9 tredje ledd', 'ofo. § 9-57'],
    etter: 'ferdig-fagbrev',
  },
  {
    id: 'fagbrev-pa-jobb',
    mal: 'fagbrev',
    tittel: 'Kandidat for fagbrev på jobb',
    kortnavn: 'fagbrev på jobb',
    kort: 'Praksis og kontrakt med arbeidsgiveren',
    ingress: 'Minst ett års allsidig praksis i lærefaget i heltid før kontrakten, og så minst ett år med kontrakt.',
    steg: [
      { del: 'praksis', tekst: 'Allsidig praksis', tid: 'Minst 1 år i heltid', rute: begrep('fagbrev-pa-jobb') },
      { del: 'bedrift', tekst: 'Kontrakt om opplæring', tid: 'Minst 1 år', rute: begrep('kontrakt-om-opplaering') },
      { del: 'prove', tekst: 'Fag- eller svenneprøve', rute: PROVE_RUTE },
    ],
    kontrakt: 'Kontrakt om opplæring med lærebedriften',
    prove: 'Fag- eller svenneprøve',
    melderOpp: 'Lærebedriften',
    fellesfag: 'nei',
    fellesfagTekst: 'Trengs ikke for fag- eller svennebrev.',
    dokumentasjon: 'Fag- eller svennebrev',
    voksne: 'Fylkeskommunen skal sørge for at voksne med mye realkompetanse i et yrke får mulighet til å ta fag- eller svennebrev.',
    kilder: ['ol. § 7-1 fjerde ledd', 'ol. § 18-3 andre ledd', 'ofo. § 9-58', 'ofo. § 9-48 tredje ledd'],
    etter: 'ferdig-fagbrev',
  },
  {
    id: 'praksiskandidat',
    mal: 'fagbrev',
    tittel: 'Praksiskandidat',
    kortnavn: 'praksiskandidat',
    kort: 'Praksis uten opplæring, og prøven',
    ingress: 'Den som har allsidig praksis i et lærefag som er 25 prosent lengre enn opplæringsløpet, kan melde seg til prøven uten opplæring i skole eller bedrift.',
    steg: [
      { del: 'praksis', tekst: 'Allsidig praksis', tid: '25 % lengre enn løpet', rute: begrep('praksiskandidat') },
      { del: 'prove', tekst: 'Fag- eller svenneprøve', rute: PROVE_RUTE },
    ],
    kontrakt: 'Ingen',
    prove: 'Fag- eller svenneprøve, og eksamen når læreplanverket krever det',
    melderOpp: 'Kandidaten selv, med prøveavgift',
    fellesfag: 'nei',
    fellesfagTekst: 'Trengs ikke for fag- eller svennebrev.',
    dokumentasjon: 'Fag- eller svennebrev',
    voksne: 'Fylkeskommunen skal sørge for at voksne med mye realkompetanse i et yrke får mulighet til å ta fag- eller svennebrev.',
    kilder: ['ol. § 23-2', 'ol. § 18-3 andre ledd', 'ofo. § 9-25 tredje ledd', 'ofo. § 9-56 tredje ledd', 'ofo. § 9-48 tredje ledd'],
    etter: 'ferdig-fagbrev',
  },
  {
    id: 'praksisbrevkandidat',
    mal: 'praksisbrev',
    tittel: 'Praksisbrevkandidat',
    kortnavn: 'praksisbrevkandidat',
    kort: 'Opplæring etter lokal læreplan, og praksisbrev',
    ingress: 'Opplæring i bedrift med opplæringskontrakt. Praksisbrevprøven bygger på kompetansemålene i en lokal læreplan i faget.',
    steg: [
      { del: 'bedrift', tekst: 'Praksisbrevkandidat', rute: begrep('praksisbrev') },
      { del: 'prove', tekst: 'Praksisbrevprøve', rute: PROVE_RUTE },
    ],
    kontrakt: 'Opplæringskontrakt',
    prove: 'Praksisbrevprøve',
    melderOpp: 'Lærebedriften',
    fellesfag: 'ja',
    fellesfagTekst: 'Må være bestått. Med ett som ikke er bestått, kan prøven tas, men faget må bestås etterpå.',
    dokumentasjon: 'Praksisbrev',
    kilder: ['ol. § 7-1', 'ofo. § 6-3 første ledd bokstav e', 'ofo. § 9-57', 'ofo. § 9-64', 'ofo. § 9-48'],
    etter: 'praksisbrevkandidat',
  },
  {
    id: 'laerekandidat',
    mal: 'kompetansebevis',
    tittel: 'Lærekandidat',
    kortnavn: 'lærekandidat',
    kort: 'Opplæring mot mål som er fastsatt for kandidaten, og kompetansebevis',
    ingress: 'Opplæring mot en mindre omfattende prøve enn fag- eller svenneprøven. En elev kan bli lærekandidat etter grunnskolen, etter Vg1 eller Vg2, eller ved å endre kontrakten.',
    steg: [
      { del: 'skole', tekst: 'Grunnskolen, Vg1 eller Vg2', rute: YRKESFAG },
      { del: 'bedrift', tekst: 'Lærekandidat', rute: begrep('laerekandidat') },
      { del: 'prove', tekst: 'Kompetanseprøve', rute: PROVE_RUTE },
    ],
    kontrakt: 'Opplæringskontrakt',
    prove: 'Kompetanseprøve',
    melderOpp: 'Lærebedriften',
    fellesfag: 'ingen',
    fellesfagTekst: 'Kandidaten prøves i målene som er fastsatt for kandidaten. Forskriften har ingen egen regel om fellesfag for lærekandidater.',
    dokumentasjon: 'Kompetansebevis',
    kilder: ['ol. § 7-1', 'ol. § 7-2', 'ofo. § 6-3 første ledd bokstav c', 'ofo. § 7-3 tredje og fjerde ledd', 'ofo. § 9-64', 'ofo. § 9-51', 'Udir: Hvordan bli lærekandidat'],
    etter: 'laerekandidat',
  },
];

/** Andre steder en overgang kan føre til, som ikke er en vei i listen. */
export const ANDRE: Record<string, { tittel: string; rute: string }> = {
  pabygging: { tittel: 'Vg3 påbygging til generell studiekompetanse', rute: '/opplaeringslop/PB' },
  vg4: { tittel: 'Vg4 påbygging etter fag- eller svennebrev', rute: '/opplaeringslop/PB' },
  'nytt-fagbrev': { tittel: 'Nytt fag- eller svennebrev', rute: `${FAGBREV_RUTE}/laerling` },
};

export const UTGANGSPUNKTER: Utgangspunkt[] = [
  {
    id: 'grunnskolen',
    tittel: 'Grunnskolen',
    overganger: [
      { til: 'laerling', vilkar: 'Søk Vg1 yrkesfag. Ungdomsretten gjelder.', kilder: ['ol. § 5-1'] },
      { til: 'laerling-tidlig', vilkar: 'Lærekontrakt rett etter grunnskolen (0+4), godkjent av fylkeskommunen.', kilder: ['ol. § 7-2 fjerde ledd', 'ofo. § 6-3'] },
      { til: 'fra-studieforberedende', vilkar: 'Søk Vg1 studieforberedende og bytt etter Vg1.', kilder: ['Udir-1-2026 vedlegg 1, 3.4.2'] },
      { til: 'laerekandidat', vilkar: 'Opplæringskontrakt som lærekandidat, etter et løp som avviker fra tilbudsstrukturen.', kilder: ['ol. § 7-2 fjerde ledd', 'ofo. § 6-3 første ledd bokstav c', 'Udir: Hvordan bli lærekandidat'] },
      { til: 'praksisbrevkandidat', vilkar: 'Opplæringskontrakt som praksisbrevkandidat.', kilder: ['ofo. § 6-3 første ledd bokstav e'] },
    ],
  },
  {
    id: 'vg1-st',
    tittel: 'Vg1 studieforberedende',
    overganger: [{ til: 'fra-studieforberedende', vilkar: 'Vg2 yrkesfag med yrkesfaglig opphenting, eller et Vg2 som er kryssløp.', kilder: ['Udir-1-2026 vedlegg 1, 3.4.2'] }],
  },
  {
    id: 'vg1-yf',
    tittel: 'Vg1 yrkesfag',
    overganger: [
      { til: 'laerling', vilkar: 'Vg2 på et programområde som bygger på Vg1.', kilder: ['ofo. § 4-13'] },
      { til: 'laerling-tidlig', vilkar: 'Lærekontrakt etter Vg1 (1+3) eller særløp.', kilder: ['ofo. § 6-3 første ledd bokstav c', 'Udir-1-2026 vedlegg 1, 3.4.3'] },
      { til: 'laerekandidat', vilkar: 'Også når fagene på Vg1 ikke er bestått.', kilder: ['ofo. § 7-3 fjerde ledd'] },
      { til: 'praksisbrevkandidat', vilkar: 'Også når fagene på Vg1 ikke er bestått.', kilder: ['ofo. § 7-3 fjerde ledd'] },
    ],
  },
  {
    id: 'vg2-yf',
    tittel: 'Vg2 yrkesfag',
    overganger: [
      { til: 'laerling', vilkar: 'Søk formidling til læreplass innen 1. mars. Vilkårene for inntak til neste trinn må være oppfylt.', kilder: ['ofo. § 7-3 andre ledd', 'ofo. § 7-5'] },
      { til: 'vg3-i-skole', vilkar: 'Når søkeren ikke får læreplass. Tilbudet starter så snart som mulig og senest 1. oktober.', kilder: ['ol. § 5-6', 'ofo. § 6-2'] },
      { til: 'laerekandidat', vilkar: 'Også når fagene på Vg1 og Vg2 ikke er bestått. Søk innen 1. februar.', kilder: ['ofo. § 7-3 fjerde ledd', 'ofo. § 7-5'] },
      { til: 'praksisbrevkandidat', vilkar: 'Også når fagene på Vg1 og Vg2 ikke er bestått. Søk innen 1. februar.', kilder: ['ofo. § 7-3 fjerde ledd', 'ofo. § 7-5'] },
      { til: 'pabygging', vilkar: 'Gir studiekompetanse, ikke yrkeskompetanse, og bruker opp ungdomsretten.', kilder: ['Udir-1-2026 vedlegg 1, 3.5.2', 'Eier 04.10.2026'] },
    ],
  },
  {
    id: 'laerling',
    tittel: 'Lærling',
    overganger: [{ til: 'laerekandidat', vilkar: 'Kontrakten kan bare endres med samtykke fra fylkeskommunen.', kilder: ['ol. § 7-2 andre ledd'] }],
  },
  {
    id: 'laerekandidat',
    tittel: 'Lærekandidat',
    overganger: [
      {
        til: 'laerekandidat-laerling',
        vilkar: 'Kontrakten kan bare endres med samtykke fra fylkeskommunen. For lærekandidater godskrives tidligere læretid etter en konkret vurdering.',
        kilder: ['ol. § 7-2 andre ledd', 'ofo. § 6-9 tredje ledd'],
      },
    ],
  },
  {
    id: 'praksisbrevkandidat',
    tittel: 'Praksisbrevkandidat',
    overganger: [{ til: 'praksisbrev-fagbrev', vilkar: 'Lærekontrakt etter praksisbrevet. Tidligere læretid i lærefaget skal godskrives fullt ut som læretid.', kilder: ['ofo. § 6-9 første ledd'] }],
  },
  {
    id: 'ferdig-fagbrev',
    tittel: 'Ferdig fag- eller svennebrev',
    overganger: [
      { til: 'vg4', vilkar: 'Retten varer ut skoleåret som starter det året man fyller 24. Etter det gjelder reglene for voksne.', kilder: ['ol. § 5-7', 'Udir-1-2026 vedlegg 1, 3.5.3'] },
      { til: 'nytt-fagbrev', vilkar: 'Den som har studie- eller yrkeskompetanse, har rett til opplæring fram til én ny sluttkompetanse på et yrkesfaglig program. Et bestått fag- eller svennebrev godskrives.', kilder: ['ol. § 18-4', 'ofo. § 6-10'] },
    ],
  },
  {
    id: 'praksis',
    tittel: 'Praksis i arbeidslivet',
    overganger: [
      { til: 'fagbrev-pa-jobb', vilkar: 'Minst ett års allsidig praksis i lærefaget i heltid før kontrakten.', kilder: ['ofo. § 9-58'] },
      { til: 'praksiskandidat', vilkar: 'Allsidig praksis 25 prosent lengre enn opplæringsløpet.', kilder: ['ol. § 23-2'] },
    ],
  },
];

export const finnVei = (id: string) => VEIER.find((v) => v.id === id);
export const veiRute = (id: string) => `${FAGBREV_RUTE}/${id}`;

/** Om veien har en kontrakt i bedrift, så teksten om oppsigelse og heving hører hjemme der. */
export const harKontrakt = (vei: Vei) => vei.steg.some((s) => s.del === 'bedrift');

/** Utgangspunktene som har en overgang til veien («Kommer fra»). */
export function kommerFra(vei: string): { fra: Utgangspunkt; overgang: Overgang }[] {
  return UTGANGSPUNKTER.flatMap((u) => u.overganger.filter((o) => o.til === vei).map((overgang) => ({ fra: u, overgang })));
}

/** Overgangene fra der brukeren står når veien er gått («Veien videre»). */
export function veienVidere(vei: Vei): Overgang[] {
  return UTGANGSPUNKTER.find((u) => u.id === vei.etter)?.overganger ?? [];
}

export function maal(o: Overgang): { tittel: string; rute: string } {
  const v = finnVei(o.til);
  if (v) return { tittel: v.tittel, rute: veiRute(v.id) };
  return ANDRE[o.til] ?? { tittel: o.til, rute: '/opplaeringslop' };
}
