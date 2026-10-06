# 076 – Skolemiljø: aktivitetsplikten som veiviser og skolereglene i fylket

**Kontekst:** Fase 7 (`OPPDRAG.md` kapittel 4 og `docs/arbeidsordrer/fase-7.md`): aktivitetsplikten trinn for trinn, skolereglene med reaksjoner og saksbehandling som fylkesinnhold, og plass til skolens egne regler. Kategorien «Skolemiljø» på forsiden hadde ingen moduler. Dette er mockupen til eier, runde 3 i `docs/arbeidsordrer/fase-7-forslag.md`.

**Valg:**
- **Ny modul `skolemiljo`** i kategorien «Skolemiljø», med oversikt, veiviser og siden «Skoleregler» (`#/skolemiljo/skoleregler`).
- **Aktivitetsplikten** er en veiviser i `content/skolemiljo/aktivitetsplikten.yaml`, som veiviserne i Tilrettelegging (avgjørelse 041).
  - Fire faser: i hverdagen, melde fra, undersøke og sette inn tiltak, statsforvalteren. Seks innganger.
  - Kildene er opplæringslova kapittel 12 og Udirs rundskriv om skolemiljø, kapittel 6–8 (nye kilder `udir-rundskriv-skolemiljo` og `udir-rundskriv-skolemiljo-statsforvalteren`).
  - Stegene for å melde fra, skjerpet plikt og statsforvalteren har en merknad for privatskoler (privatskolelova § 2-4, avgjørelse 075).
- **Ny veiviserfarge, indigo:** Alle de fem fargene var i bruk. Indigo (`--p-indigo-*`) har 700-tonen i lyst tema (over 4,5:1 mot hvit) og 300-tonen i mørkt, som de andre (avgjørelse 042). Grønt og rødt brukes fortsatt ikke.
- **Skolereglene:**
  - **Reglene i loven** (ol. §§ 10-6 til 10-8, 13-1 og 13-2) er kort med egne ord. Privatskolene har sine regler i merknaden (pl. §§ 5A-7, 3-10 og 2-4).
  - **Skolereglene i fylket** er ett kort per fylke med `gyldighet: fylke`, i `content/skolemiljo/skoleregler-fylker.yaml`. Paragrafene om reaksjoner, saksbehandling og klage står åpne med titlene fra teksten, og lenker til forskriften i Lov og forskrift. Teksten gjengis ikke, den vises uendret i Regelverk.
  - **Paragrafene er valgt ut fra titlene** og har kontrollspørsmål. En test sjekker at paragrafene finnes, og at hvert fylke med skoleregler i Lovdata har ett kort.
  - **Skolens egne regler** er forskriftene i Lovdata med `gyldighet: skole` for skolen brukeren har valgt (avgjørelse 061). Når valget «Privatskole» er på, står det at fylkets skoleregler ikke gjelder, i stedet for fylkesboksen.
- **To kolonner på skrivebord** for «Skoleregler» (avgjørelse 074), med kildene i en lukket boks.

**Konsekvens:**
- En ny forskrift om skoleregler i et fylke må få et kort med paragrafene. Testen feiler til kortet finnes.
- Endres nummereringen i en forskrift, feiler testen til kortet er rettet.
- Ende-til-ende-tester for modulen skrives når eier har godkjent designet.
