# Endringslogg

Alle endringer brukerne merker, føres her. Formatet følger [Keep a Changelog](https://keepachangelog.com/no/1.1.0/), og versjonene følger [SemVer](https://semver.org/lang/no/).

## [Unreleased]

## [0.3.0] – 2026-09-29

Ny hovedkalkulator, stillingsplan, og årstimer som fylles inn fra faget.

### Lagt til

- **Stillingsplan** står øverst i arbeidstidsmodulen og først blant hurtigkalkulatorene. Du legger inn stillingsprosent, fag og funksjoner (i prosent av full stilling), og ser:
  - samlet beskjeftigelse, med undervisning, funksjoner og stilling hver for seg
  - teknisk undertid eller teknisk overtid i prosent, og regnet om til årsrammetimer i et fag du velger
  - en stolpe med fagene og funksjonene mot stillingsprosenten
  - «Timer i hvert fag»: hvor mange årsrammetimer som mangler eller er for mye, regnet med årsrammen i hvert fag
  - en lenke til overtidskalkulatoren med prosenten ferdig utfylt når samlet beskjeftigelse er over 100 %
- Fasiteksemplene E1–E4 for stillingsplanen, som eier har kontrollert (fasit 011–014).
- Begrepet «Teknisk undertid og teknisk overtid».
- Årstimer fylles inn når du velger fag i beskjeftigelse, periodebeskjeftigelse, fordeling og stillingsplan, f.eks. 56 i kroppsøving og 140 i engelsk vg1 studieforberedende. Tallet kommer fra Udir (Grep), og du kan endre det. Det gjelder 98 av radene i vedlegg 1, også norsk (112) og engelsk (140) på yrkesfag. Programfag på yrkesfag, samisk og noen forkortelser som ikke kan bekreftes, er ikke med.

### Endret

- Fordeling med stillingsprosent: feltet er nå hele stillingen, og undervisningen er stillingen minus funksjonene. Tidligere var feltet bare undervisningen.
- Oversikten over arbeidstidsmodulen viser stillingsplanen som et stort kort øverst og de andre kalkulatorene under «Flere kalkulatorer».

### Rettet

- Fordelingen virker nå for en stilling med bare funksjon, for eksempel 10 % stilling med 10 % funksjon. Møtetid som ikke får plass i den planfestede tiden for undervisningen, legges i funksjonstiden. Delene i diagrammet summerer seg alltid til årsverket for stillingen. Med bare funksjoner kan fordelingen også regnes ut uten fag.

## [0.2.2] – 2026-09-29

Kalkulatorene tar mindre plass og viser svaret hele tiden.

### Lagt til

- Når resultatkortet er utenfor skjermen, vises svaret i en smal linje over menyen nederst. Trykk på linjen for å gå til resultatet.
- «Kopier» på resultatkortet kopierer svaret, utregningen og kildene som tekst, f.eks. til en e-post.
- Overtid viser undervisningstimene i overtid, kalkulert tid (timene det betales for) og timelønnen. Et «?» forklarer hvorfor faget endrer antall undervisningstimer, men ikke beløpet.
- Små «?» som viser en kort forklaring når du trykker på dem: ved tittelen på hver kalkulator, ved fagsøket og ved «15 eller færre elever».
- Overtid viser feriepenger (12 %, eller 14,3 % over 60 år) som en ekstraopplysning under overtidsbetalingen.

### Endret

- Fagkortene er tettere: bryteren for årstimer eller økter og tallfeltet står på samme linje, og delresultatet står ved «Fag 1», «Fag 2» osv.
- «Skriv inn årsramme selv» står på samme linje som «Fag». Søkefeltet viser eksempler på hva du kan søke etter.
- Minuttvalget (45, 60, 90 eller annet) står på én linje.
- Mindre tittel på kalkulatorsidene. Ingressen ligger bak «?».
- «Ikke kontrollert» står ved siden av tittelen på resultatkortet.
- Fordelingen starter med 0 % funksjon.
- Timevikar: hovedtallet er nå lønnen som utbetales. Feriepengene står under som en ekstraopplysning, i stedet for å være lagt til i hovedtallet.
- Overtid og timevikar har like resultatkort: lønnen som utbetales øverst, deretter undervisningstimer, kalkulert tid, timelønn og feriepenger i tillegg. Utregningen ligger under «Vis utregning».
- Kronebeløp vises alltid med øre (1 748,80 kr).
- Stolpen for stillingen står i resultatkortet også for overtid og periodebeskjeftigelse. Det som går over 100 %, er markert i rødt.

### Rettet

- Feltene for dager i perioden og dager i skoleåret står nå på linje. Tomt felt for skoleåret viser 190 som grå tekst.

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

[Unreleased]: https://github.com/larsarnenilssen/protokollen/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/larsarnenilssen/protokollen/releases/tag/v0.3.0
[0.2.2]: https://github.com/larsarnenilssen/protokollen/releases/tag/v0.2.2
[0.2.1]: https://github.com/larsarnenilssen/protokollen/releases/tag/v0.2.1
[0.2.0]: https://github.com/larsarnenilssen/protokollen/releases/tag/v0.2.0
[0.1.3]: https://github.com/larsarnenilssen/protokollen/releases/tag/v0.1.3
[0.1.2]: https://github.com/larsarnenilssen/protokollen/releases/tag/v0.1.2
[0.1.1]: https://github.com/larsarnenilssen/protokollen/releases/tag/v0.1.1
[0.1.0]: https://github.com/larsarnenilssen/protokollen/releases/tag/v0.1.0
