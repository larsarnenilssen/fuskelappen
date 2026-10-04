# 056 – Forsiden som kan tilpasses, og toppfeltet i stedet for bunnmenyen

**Kontekst:** Eier ønsket favorittene ordnet bedre og foreslo at forsiden kunne tilpasses i stedet for en egen favorittside, og at bunnmenyen kunne tas bort (04.10.2026). Bunnmenyen tok rundt 70 piksler på mobil og dekket innhold nederst. Forslaget og skjermbildene ble gått gjennom i flere runder samme dag.

**Valg:**
- **Toppfeltet:** tilbake til venstre på undersider, «Fuskelappen» midt på (til forsiden), søk og innstillinger til høyre. Søket står på forsiden, så søkeknappen vises der først når søkefeltet er rullet ut av syne, og fører da tilbake til feltet. Bunnmenyen er tatt bort (erstatter punktet om bunnmeny i avgjørelse 005). Kildestatusen står under Innstillinger. Nettleserens egen tilbake-sveip er uendret.
- **Forsiden:** visningen («Alt innhold» / «Bare favoritter», korte ord på smal skjerm) og «Tilpass» står i det blå feltet under søket. Fylkesmerknaden er én linje. Favorittene og kategoriene er grupper som lukkes og åpnes med hele overskriften, med en myk animasjon (ikke ved redusert bevegelse). Lukkede grupper viser hva som er inni. «Tilpass» sorterer gruppene. Favorittene sorteres der de står, med blyanten i overskriften. Komponenten `Sorterbar` gir dra og slipp med håndtak og piler for tastatur og skjermleser.
- **Bare favoritter:** favorittgruppen forsvinner, og favorittene står under kategorien til modulen sin, uten stjernemerke. Med alt innhold har favorittene ikonet sitt med en liten stjerne nede til venstre.
- **Ikoner:** en favoritt kan ha eget ikon. Uten får den ikonet til den nærmeste inngangen over, ellers modulens ikon (`ikonForFavoritt`). En test sjekker at alle favorittene i alle modulene får et ikon, og regelen står i AGENTS.md.
- **Lagring:** skjemaversjon 3 med `forside` (rekkefølge, lukkede grupper, bare favoritter), med migrering fra versjon 2. Gamle lenker til `#/favoritter` går til forsiden.
- **«Til toppen»** står i appskallet og vises på alle sider når brukeren har rullet mer enn en skjermhøyde. Sidene og veiviserne har ikke egne knapper lenger.
- **PC:** forsiden er bredere (72rem), med gruppene i to spalter. Toppfeltet følger samme bredde.
- **Søkesiden:** søkefeltet får fokus i stedet for overskriften (`data-autofokus`).

**Konsekvens:** Én flate å ordne appen på, mer plass på mobil og ingen fast meny nederst. Startpakken øker til om lag 95,6 kB, fordi forsiden lastes med en gang. Nye moduler får grupper, favoritter og ikoner uten endringer i forsiden.
