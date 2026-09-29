# Endringslogg

Alle endringer brukerne merker, føres her. Formatet følger [Keep a Changelog](https://keepachangelog.com/no/1.1.0/), og versjonene følger [SemVer](https://semver.org/lang/no/).

## [Unreleased]

## [0.2.1] – 2026-09-29

Rettinger etter eiers førsteinntrykk av fase 1.

### Lagt til

- Fag velges med søk: fag, program, trinn, fagnavn og fagkoder fra Grep (f.eks. «Helsefremmende arbeid», HEA2005), bokstavene i fagkodene og programområdene (f.eks. ENG, BAT, HEA) og kallenavn (1P, R1, Biologi 2).
- Fordelingen kan regnes ut fra stillingsprosent og årsramme i stedet for fag, f.eks. en vanlig 100 %-stilling.
- Brytere for årstimer eller økter, 45, 60 eller 90 minutter, «15 eller færre elever», vikartype og lønn.
- Delresultat på hvert fag, og en stolpe som viser stillingen mot 100 %.
- Tidslinje for perioden i skoleåret, og måler for planfestet tid mot grensen på 37,5 timer i uka.
- Fordelingen viser prosent i stolpen og timer per uke i arbeidsåret i tabellen.
- Det utfylte står der fortsatt når du går til en kilde eller et begrep og tilbake.

### Endret

- Mindre skrift og tettere skjema, kortere tekster og tydelig skille mellom fagene.
- Flere program eller nivåer i samme time legges til med en liten lenke under faget.
- Utregningen er kortere: én linje per trinn, formelen i liten skrift og kildene samlet nederst. Siste trinn vises under resultatet.
- Metodebeskrivelsen står nederst på siden.

## [0.2.0] – 2026-09-29

Fase 1: arbeidstid etter SFS 2213. Alle regelverdier og tekster er merket «Ikke kontrollert» til eier har godkjent dem.

### Lagt til

- Modulen **Arbeidstid (SFS 2213)** med hurtigkalkulatorer på forsiden:
  - Beskjeftigelse for ett eller flere fag, med blandede grupper (laveste årsramme) og fag merket * med 1–15 elever.
  - Periodebeskjeftigelse for undervisning i en del av skoleåret.
  - Vikartimer: økt beskjeftigelse for ansatte i stilling, og lønn for timevikarer med kalkulert tid, timelønn og feriepenger.
  - Planfestet arbeidstid ved funksjoner og andre oppgaver, med utvidelse av arbeidsåret over 37,5 timer i uka.
  - Overtid ved beskjeftigelse over 100 %, betalt med 1,5 × timelønn for undervisning.
  - Fordeling av arbeidstiden i en tenkt stilling, med diagram, møtetid og forklaring av hva tiden brukes til.
- Hvert resultat viser utregningen trinn for trinn, med formel, tall, kilde og nivå for hver verdi, og en forklaring av metoden.
- Vedlegg 1 til SFS 2213 (årsrammer i videregående) og verdier fra SFS 2213 og hovedtariffavtalen 2026–2028 som regelsett.
- Begrepsbanken er tatt i bruk, med begreper om arbeidstid.
- Kildesjekk av avtaleteksten til SFS 2213, hovedtariffavtalen og arbeidsmiljøloven kapittel 10.

### Rettet

- Søket kunne få to oppføringer for samme begrep når begrepet finnes både nasjonalt og lokalt.

## [0.1.3] – 2026-09-29

### Rettet

- Appnavnet i toppfeltet så uklart ut på iPhone, fordi iOS legger en uskarp kant under statuslinjen. Innholdet i toppfeltet er flyttet litt ned når appen er installert på mobil.

## [0.1.2] – 2026-09-29

### Rettet

- Den grå overgangen bak klokken og batteriet øverst på iPhone. iOS henter fargen der fra sidens bakgrunnsfarge, og den er nå den samme mørkeblå som toppfeltet.
- Logoen i topplinjen viste en blå firkant i mørkt tema. Logoen er nå bare boka, uten bakgrunn.

## [0.1.1] – 2026-09-29

Rettinger etter eiers kontroll av fase 0 på iPhone.

### Lagt til

- Logo i topplinjen.
- Kildesiden viser når neste kildesjekk kjøres, og har lenke for eier til å kjøre sjekken med en gang.
- Et kildevarsel kan skjules på enheten til neste kildesjekk, og vises igjen med én knapp.
- «Om appen» har «Teknisk informasjon» med skjermmål, som hjelper med feilsøking.

### Rettet

- Bunnmenyen kunne stå et stykke over bunnen av skjermen på iPhone, med en stripe i sidefarge under. Området under menyen har nå menyfarge.
- Toppfeltet fikk en lys overgang bak statuslinjen på iPhone. Området bak statuslinjen har nå toppfeltets farge.
- Overskriften fikk oransje ramme når en side ble åpnet. Rammen vises nå bare for ting som kan trykkes på.

## [0.1.0] – 2026-09-29

### Lagt til

- Fase 0 – fundament:
  - Installerbar app (PWA) som virker uten nett etter første besøk, med varsel når en ny versjon er klar.
  - Forside med samlet søk, favoritter, hurtigkalkulatorer og innhold gruppert i kategorier.
  - Søk som forstår både bokmål og nynorsk («skule» finner «skole») og tåler skrivefeil.
  - Favoritter som kan sorteres.
  - Innstillinger for målform (bokmål og nynorsk), tema (lyst, mørkt eller følg systemet), fylke og skole. Skolelisten kommer fra Nasjonalt skoleregister.
  - Kopi av innstillinger og favoritter kan lastes ned og hentes inn igjen, og alt kan slettes.
  - «Om appen» med versjon, ansvarsfraskrivelse, personvern og kreditering.
  - Kildestatus i topplinjen og egen side med alle kilder.
  - Begrepsbank som felles modul (skjult til fase 1 gir den innhold).
  - Plassholderikon (protokollbok med paragraftegn).

[Unreleased]: https://github.com/larsarnenilssen/protokollen/compare/v0.1.3...HEAD
[0.1.3]: https://github.com/larsarnenilssen/protokollen/releases/tag/v0.1.3
[0.1.2]: https://github.com/larsarnenilssen/protokollen/releases/tag/v0.1.2
[0.1.1]: https://github.com/larsarnenilssen/protokollen/releases/tag/v0.1.1
[0.1.0]: https://github.com/larsarnenilssen/protokollen/releases/tag/v0.1.0
