# Endringslogg

Alle endringer brukerne merker, føres her. Formatet følger [Keep a Changelog](https://keepachangelog.com/no/1.1.0/), og versjonene følger [SemVer](https://semver.org/lang/no/).

## [Unreleased]

### Lagt til (for eier)

- **Automatisk verdisjekk:** Hvert tall fra SFS 2213 og hovedtariffavtalen har et kort sitat fra kilden. Kildesjekken ser hver mandag etter sitatet i kilden og foreslår det nye tallet hvis det er endret.
- **Kontrolloversikt** i `docs/KONTROLL.md`: hva som bygger på hver kilde, status for din kontroll og for verdisjekken, og hva som bør ses på nå.
- Tester sjekker at tallene henger sammen, for eksempel at årsverket er 225 dager à 7,5 timer og at 45-minutters årsrammen er 60-minutters årsrammen × 4/3 i hver rad i vedlegg 1.
- **Ukentlig kontrollsak** på GitHub i stedet for én sak per kilde: hvilket punkt i kilden som er endret, med den nye teksten og hvilket innhold i appen det kan berøre, tall og tabeller som ikke stemmer, og en avkrysningsliste. E-post bare når noe er nytt.
- Vedlegg 1 (151 rader) og garantilønnen sjekkes rad for rad mot kilden hver uke.
- Grep og skoleregisteret hentes hver uke og publiseres automatisk når testene består.
- **Kontrollspørsmål** til hvert begrep og hver forklaring: spørsmål om det som er usikkert i teksten. Spørsmålene står i kontrolloversikten og i kontrollsaken når en kilde endres.
- **Praksis og tolkninger** som ikke står i kildene, for eksempel 21,67 arbeidsdager per måned, er samlet i én liste som du bekrefter.
- **Kontrollrunder** første mandag i mai og august: en sak med praksis som bør bekreftes og kontroller som bør gjøres på nytt.
- **Endringsforslag:** Er et tall endret i kilden, lager kildesjekken en PR med nytt tall og nytt sitat, og viser hvilke tester som eventuelt feiler. Feiler testene med nye Grep-data, kommer det også en PR med dataene.

## [0.8.2] – 2026-09-30

### Endret

- «Ikke kontrollert»-merkene er erstattet av en samlet **brukserklæring** under «Om appen». Den sier at appen er utviklet privat og ikke gir garantier, hvordan utvikleren har brukt en KI-assistent, at appen bygger på kilder og er laget i god tro som et hjelpemiddel, og at innspill og beskjed om feil tas imot med takk.
- Nederst på forsiden står det at appen er utviklet privat og at opplysningene kan være uriktige. Den samme setningen følger med når du kopierer en utregning.

## [0.8.1] – 2026-09-30

### Endret

- Hjelpeteksten ved datoene og metodeteksten sier at offentlige fridager regnes som arbeidsdager i brutte måneder, slik Vestland fylkeskommune regner.

### Lagt til

- Begrepene «Variabel lønn» og «Planleggingsdager» i begrepsbanken.

### Rettet

- Søkesiden følger adressen: endres søket i adressen mens siden er åpen (lenke, tilbake-knappen eller adressefeltet), vises treffene for det nye søket.

## [0.8.0] – 2026-09-30

### Lagt til

- **Lønn i en periode regnes fra datoene**, slik lønnssystemet gjør når Visma InSchool sender lønnsprosenten og datoene for perioden. Arbeidsplan har fått feltene «Første dag i perioden» og «Siste dag i perioden». Hele måneder gir hel månedslønn, og i brutte måneder gir hver arbeidsdag (mandag–fredag) 1/21,67 av månedslønnen. Tillegg regnes på samme måte. Variabel lønn og overtid regnes fortsatt med timene i perioden.
- Fasiteksempel 024: variabel lønn og overtid i 80 % stilling, godkjent av eier.

### Endret

- Forklaringen av planleggingsdager sier at timene for lærere som er 60 år og eldre avhenger av hvor de fem ekstra feriedagene legges.

### Dokumentasjon

- README har fått en liste over kjente begrensninger. Første punkt: fordelingstabellen går utenfor skjermen ved skriftstørrelse på 150 % eller mer.

## [0.7.1] – 2026-09-30

### Endret

- **Planleggingsdager i Arbeidsplan:** De 6 dagene i arbeidsåret utenom elevenes skoleår står på egen linje i fordelingen, som i Visma InSchool: 6 × 7,5 = 45 timer for en lærer i hel stilling, tatt fra annen planfestet tid. Feltet «Timer på planleggingsdager» kan endres for den enkelte, for eksempel ved deltid eller for en periode.
- **Timer per uke** er nå planfestet tid utenom planleggingsdagene, delt på de 38 skoleukene (eller skoleukene i perioden). Hel stilling uten funksjoner gir 29,1 timer planfestet tid per uke (før 29,3). Grensen for utvidet arbeidsår er den samme som før.
- Fasiteksemplene 015–017, 018, 019 og 023 er oppdatert etter dette (annen planfestet tid, planleggingsdager og timer per uke).

### Rettet

- Teksten «Tillegg i lønnen» ble delt midt i ordene når skjermen var smal eller skriften stor. Nå flytter beløpsfeltet ned på neste linje når det ikke er plass.

## [0.7.0] – 2026-09-30

### Lagt til

- **Variabel lønn i Arbeidsplan:** Har læreren en stilling under 100 % og mer undervisning og funksjoner enn stillingen, heter det som er over stillingen og opp til hel stilling **variabel lønn**. Det som er over 100 %, er fortsatt teknisk overtid. Er det begge deler, vises de i hver sin rute, med årsrammetimer.
- **Lønn i året** har en egen linje for variabel lønn. Den regnes som vikartimer: prosenten gjøres om til timer i faget og videre til kalkulert tid, som betales med timelønnen for undervisning. Linjen viser den kalkulerte tiden. Overtid over 100 % betales som før, med 50 % tillegg. Stolpen for beskjeftigelsen viser variabel lønn og overtid i hver sin farge.
- **Arbeidsplan for en periode:** Bryteren «Hele skoleåret / En periode» gjør arbeidsplanen om til periodebeskjeftigelse. Fagene er timer i perioden, og stillingen og funksjonene gjelder perioden (en funksjon på 10 % er 10 % i perioden). Prosentene kan vises i perioden eller på årsbasis. Differansen, fordelingen og lønnen gjelder perioden.

### Endret

- **Funksjoner:** Knappen som fjerner en funksjon, står på linjen med navnet. Beløpet for tillegg står på linjen med vippen «Tillegg i lønnen», og feltet har plass til beløp på over 10 000 kr.

### Fjernet

- Kalkulatoren Periodebeskjeftigelse. Alt den gjorde, finnes i Arbeidsplan, og mer. Lagrede varianter fra den vises ikke lenger.

## [0.6.2] – 2026-09-30

### Endret

- **60 år og eldre:** De 37,5 timene årsverket er kortere med, er fem arbeidsdager ekstra ferie. Arbeidsåret er derfor 191 dager eller 38,2 uker, og timene per uke i Arbeidsplan regnes med det. Planfestet tid er samme andel av årsverket som for andre lærere, 1150 × 1650 ÷ 1687,5 = 1124,44 timer, så ferien tas like mye fra planfestet tid og tiden læreren disponerer selv. Utregningen viser begge deler.

### Lagt til

- Ni nye fasiteksempler godkjent av eier (015–023): fordeling i Arbeidsplan med og uten utvidet planfestet tid, deltid, stilling med bare funksjon, lønn med overtid og tillegg, lønn fra 60 år periode med uker regnet ut fra dagene og redusert undervisning fra 60 år.

## [0.6.1] – 2026-09-30

### Lagt til

- Begrepene «Livsfasetiltak (redusert undervisning)», «Kontaktlærer» og «Godtgjøring for funksjoner».

### Endret

- Arbeidsplan har adressen `#/arbeidstid/arbeidsplan` (tidligere `#/arbeidstid/stillingsplan`). Lagrede varianter fra den gamle adressen vises ikke.

## [0.6.0] – 2026-09-30

Arbeidsplan samler fordeling og planfestet tid, med redusert undervisning, funksjoner i årsrammetimer og utskrift.

### Lagt til

- **Redusert undervisning (livsfasetiltak, SFS 2213 punkt 6)** i Arbeidsplan: nyutdannet, 57 år eller 60 år, med den største reduksjonen fylt inn (6 %, 6 % og 12,5 %). Reduksjonen regnes som en del av stillingen og utvider ikke planfestet tid. 60 år gir årsverk på 1650 timer og høyere feriepengesats.
- **Funksjoner i årsrammetimer:** hver funksjon kan oppgis i prosent eller årsrammetimer. Heter funksjonen «Kontaktlærer», foreslås minst 28,5 årsrammetimer (punkt 7.3 b).
- **Skriv ut eller lagre som PDF** fra knappen ved tittelen i alle kalkulatorene. Utskriften viser utregningen og innholdet i lukkede kort, uten menyer og knapper, og alltid i lyst tema.
- **Fortsett i Arbeidsplan** fra Beskjeftigelse, med fagene ferdig utfylt.
- Figuren for en gjennomsnittlig uke og «Hva tiden brukes til» står i Arbeidsplan.
- Arbeidsplan er merket «Illustrasjon – ikke en arbeidsplan».
- Lokale verdier (fylke eller skole) merkes med nivå også i diagramkortet.

### Endret

- Kalkulatorene «Fordeling av arbeidstiden» og «Planfestet tid ved funksjoner» er fjernet. Alt de viste, finnes i Arbeidsplan.
- Kortene i Vikartimer og Overtid har overskrift og kan legges sammen, som i Arbeidsplan.
- Kronebeløp vises med mellomrom som tusenskille (600 000).
- Hjelpeteksten for antall uker nevner fag som bare går et halvår.

## [0.5.0] – 2026-09-30

Arbeidsplan med fordeling og årslønn, riktig uke ved utvidet arbeidsår, og større diagram.

### Lagt til

- **Arbeidsplan** (tidligere Stillingsplan) viser fordelingen av arbeidstiden i samme diagram og tabell som Fordeling. Diagrammet vises hele tiden, ut fra stillingsprosenten: en hel stilling uten fag og funksjoner gir 1150 timer annen planfestet tid og 537,5 timer tid læreren disponerer selv. Fag, funksjoner og møtetid per uke fyller stillingen etter hvert.
- Bryteren «Utvider planfestet tid» på hver funksjon i Arbeidsplan. Slås den av (f.eks. for kontaktlærer), fordeles funksjonen i diagrammet som undervisningen, og planfestet tid utvides ikke.
- Lagrede varianter kan få navn, f.eks. «Før endring». Navnefeltet åpnes når du lagrer, og blyanten ved navnet endrer det.
- «Regn ut lønn» i Arbeidsplan: velg garantilønn (stillingsgruppe og ansiennitet) eller skriv inn egen lønn, og se lønn i året med feriepenger i tillegg.
  - Bryteren «Tillegg i lønnen» ved hver funksjon fyller inn godtgjøringen i SFS 2213 punkt 9.1 (minst 12 000 kr for kontaktlærer og for rådgiver eller sosiallærer, etter navnet på funksjonen). Beløpet kan overskrives. En funksjon kan ha bare tillegg (0 %), bare avsatt tid eller begge deler.
  - Er samlet beskjeftigelse over 100 %, tas overtidsbetalingen med, regnet som i overtidskalkulatoren.
- «Vis stort» viser fordelingsdiagrammet og tabellen i fullskjerm, der nettleseren støtter det (PC, Mac og nettbrett).
- Kortene kan legges sammen og åpnes igjen med et trykk på overskriften (pil opp/ned): fagene, funksjoner, møter og lønn, resultatkortene og fordelingsdiagrammet. Et lukket kort viser en kort oppsummering, f.eks. faget, og resultatkort viser fortsatt svaret. Det huskes når du går til en annen side og tilbake.
- Periodebeskjeftigelse med økter per uke: antall uker i perioden regnes ut fra dagene (dager ÷ 5) når feltet står tomt, og kan overskrives. En advarsel minner om at ukene kan ha ulikt antall skoledager eller ulik timeplan.
- «Åpne i nytt vindu» ved tittelen på PC og Mac. Kalkulatoren åpnes i et eget vindu med det du har fylt ut, så flere kan være åpne samtidig.

### Endret

- Hovedkalkulatoren heter nå **Arbeidsplan**. Adressen, favoritter og lagrede varianter er de samme.
- Fordeling: blir planfestet tid mer enn 37,5 timer per uke i snitt, utvides arbeidsåret som i punkt 5.3, og timene per uke regnes med det utvidede året. En hel stilling med bare funksjon gir nå 37,5 timer per uke over 45 uker, ikke 43 timer over 39,2 uker.
- «Hva tiden brukes til» står under diagrammet og tabellen.
- Fordelingsdiagrammet er høyere og har større tekst, og står sammen med tabellen i et eget kort med mer luft. Tabellen viser fargen ved hver del og er fargeforklaringen, så den egne fargeforklaringen under stolpen er fjernet.

### Rettet

- Fordelingstabellen gikk utenfor skjermen på 320 px.
- Bryteren «Regn ut årslønn» og andre brytere uten «?» sto med teksten midt på linjen på bred skjerm.

## [0.4.0] – 2026-09-29

Programfag får årstimer, nye figurer og lagrede varianter.

### Lagt til

- Årstimer for programfag: søker du fram et bestemt fag med fagkode eller navn (f.eks. HEA2005 eller «Helsefremmende arbeid»), fylles årstimetallet inn fra Udir (Grep), og fagkoden vises ved faget. Det gjelder også programfag på yrkesfag.
- **Lagrede varianter** i alle kalkulatorene: lagre det du har fylt ut, sammenlign hovedresultatet med det du har nå, og hent varianten fram igjen. Opptil tre varianter per kalkulator lagres bare på enheten.
- Planfestet tid viser en gjennomsnittlig uke: planfestet tid og tid læreren disponerer selv, mot grensen på 37,5 timer planfestet tid i en uke, med snittet per dag og grensen på 9 timer for en enkelt dag.
- Timevikar og overtid viser lønnen og feriepengene i en stolpe.
- Periodebeskjeftigelse viser hva beskjeftigelsen i perioden tilsvarer for hele skoleåret.

### Endret

- På nettbrett og PC står resultatet i en egen kolonne ved siden av skjemaet.
- Planfestet tid starter med 0 % reduksjon, så grunnverdiene vises med en gang.

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

[Unreleased]: https://github.com/larsarnenilssen/protokollen/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/larsarnenilssen/protokollen/releases/tag/v0.4.0
[0.3.0]: https://github.com/larsarnenilssen/protokollen/releases/tag/v0.3.0
[0.2.2]: https://github.com/larsarnenilssen/protokollen/releases/tag/v0.2.2
[0.2.1]: https://github.com/larsarnenilssen/protokollen/releases/tag/v0.2.1
[0.2.0]: https://github.com/larsarnenilssen/protokollen/releases/tag/v0.2.0
[0.1.3]: https://github.com/larsarnenilssen/protokollen/releases/tag/v0.1.3
[0.1.2]: https://github.com/larsarnenilssen/protokollen/releases/tag/v0.1.2
[0.1.1]: https://github.com/larsarnenilssen/protokollen/releases/tag/v0.1.1
[0.1.0]: https://github.com/larsarnenilssen/protokollen/releases/tag/v0.1.0
