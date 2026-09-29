# Endringslogg

Alle endringer brukerne merker, føres her. Formatet følger [Keep a Changelog](https://keepachangelog.com/no/1.1.0/), og versjonene følger [SemVer](https://semver.org/lang/no/).

## [Unreleased]

## [0.1.2] – 2026-09-29

### Rettet

- Den grå overgangen bak klokken og batteriet øverst på iPhone. iOS henter fargen der fra sidens bakgrunnsfarge, og den er nå den samme mørkeblå som toppfeltet.

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

[Unreleased]: https://github.com/larsarnenilssen/protokollen/compare/v0.1.2...HEAD
[0.1.2]: https://github.com/larsarnenilssen/protokollen/releases/tag/v0.1.2
[0.1.1]: https://github.com/larsarnenilssen/protokollen/releases/tag/v0.1.1
[0.1.0]: https://github.com/larsarnenilssen/protokollen/releases/tag/v0.1.0
