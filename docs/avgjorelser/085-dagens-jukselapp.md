# 085 – Dagens jukselapp

**Status:** Designet godkjent av eier 08.10.2026 (`docs/arbeidsordrer/fase-8-forslag.md`, runde 1–2).

**Kontekst:** Fase 8 skal gi ett faktum fra appen på forsiden: en morsomhet og en inngang til innholdet. Modulene skal bidra gjennom manifestet, som med fristene (avgjørelse 066). Faktaene skal komme fra innholdet og dataene appen alt har, uten eksterne kall, og startpakken skal ikke vokse.

**Valg:**
- **Plassen:** en fjerde visning, «Jukselapp», i panelet øverst på forsiden (avgjørelse 081), med samme oppsett som kalenderen, nyhetene og tallene. Den er av fra start. Den samme bryteren står under «Tilpass» og under Innstillinger (`forside.jukselapp`). Det er ingen egen tekst på forsiden som slår den på. Velkomsten i fase 10 spør om brukeren vil slå den på (eier 08.10.2026).
- **Første besøk hver dag** står panelet på jukselappen (alternativ C). Datoen huskes i `forside.jukselappVist`. Bytter brukeren visning, gjelder valget resten av dagen. Begge feltene kan mangle, så skjemaversjonen er den samme.
- **`fakta()` i manifestet** gir modulens fakta (`Faktum` i `src/modules/typer.ts`): tittel, én til tre setninger, hvor det kommer fra, lenken til stedet i appen, kildene og eventuelt paragrafene og gyldigheten. Logikken står i `fakta.ts` i hver modul, som lastes først når modulen har dagen. Moduler uten fakta gir en tom liste.
- **Teksten** er de første setningene i første avsnitt, høyst om lag 240 tegn, som ren tekst (`faktatekst` i `src/core/jukselapp/`). Elementer som begynner med en liste, slutter med kolon eller har en første setning over 320 tegn, gir ikke noe faktum. Antallet setninger regnes på bokmål og brukes på nynorsk.
- **Hvor faktaene kommer fra:** begrepene, forklaringene, reglene, fristene uten fast dato og stegene i veiviserne i innholdet, bestemmelsene i SFS 2213 og hovedtariffavtalen, første ledd i paragrafene i et utvalg kapitler i opplæringslova og opplæringsforskrifta, første avsnitt i ingressen og teksten i overordnet del, årstimene og årsrammen i fagene, og søkerne, læreplassen og gjennomføringen i Videregående i tall. Stegene lenker rett til steget (`veiTil`).
- **Fagene** kommer fra et utdrag som lages når appen bygges (`virtual:jukselappfag`): fagene som kobles til én årsramme i SFS 2213 vedlegg 1. Hele fagindeksen (1,2 MB) lastes ikke.
- **Utvalget:** Dagene går på rundgang mellom modulene, så bare modulen som har dagen, laster innholdet sitt. Innenfor modulen går rundene gjennom alle faktaene før noe gjentas (et primtall som hopp). Faktumet er det samme hele dagen og likt for alle med samme fylke og skole, og ingenting lagres. Knappen «Ny jukselapp» går ett steg videre. Moduler uten fakta for brukeren hoppes over.
- **Fylke og skole:** Fakta med `gyldighet` for et fylke eller en skole vises bare når det er valgt.
- **Kontroll:** Innhold som ikke er kontrollert, vises, med brukserklæringen som forbehold (avgjørelse 016, eier 08.10.2026).
- **Lasting:** Kortet, stilene (`jukselapp.css`, avgjørelse 082) og utvalget lastes når jukselappen vises. Er den av, lastes ingenting.

**Konsekvens:** En ny modul kommer med av seg selv når manifestet har `fakta()`, og typesjekken krever funksjonen. En test sjekker at faktaene har tekst på begge målformene, kilder i kilderegisteret og en adresse i appen. Startpakken økte med om lag 2 kB.
