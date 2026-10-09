# 089 – Kildestatus for brukerne, godkjenning av kildene for eier

**Kontekst:** Kildestatusen i appen blandet to ting: om en kilde virker og er endret, og om eier har godkjent den. Nye kilder fikk status «endret» med «Ny kilde, ikke godkjent ennå», så appen viste 38 kilder som endret 08.10.2026, selv om bare én var det. Eier vil ikke at brukerne skal se godkjent eller ikke godkjent, og vil heller ikke ha kilder i bruk uten at de er godkjent (eier 08.10.2026).

**Valg:**
- **I appen:** Hver kilde står som «virker», «endret {dato}» i 30 dager etter at innholdet ble endret, «svarer ikke» når den har feilet to sjekker på rad, eller «sjekkes for hånd». Det samlede merket varsler bare når kilder ikke svarer eller sjekken er utdatert. Ordene «godkjent» og «ikke godkjent» står ikke i appen.
- **To feil på rad:** En kort feil hos kilden, f.eks. 502 fra udir.no, vises ikke. Nyhetskildene har sin egen regel (mer enn to dager) og feiler med en gang.
- **Godkjenning av kilden:** Kilderegisteret har `godkjent`: datoen eier godkjente at kilden kan brukes. Bare eier setter den, med `/godkjent` i kontrollsaken (avkrysning med merket `godkjenn-bruk`, eller id-en etter `/godkjent`), eller Claude etter eksplisitt beskjed. Kontrollsaken har delen «Kilder som ikke er godkjent for bruk», og kontrolloversikten merker dem. Innholdet vises som før til kilden er godkjent (eier 08.10.2026).
- **Endringer:** Grunnlaget er det eier har gått gjennom (`godkjent_fingeravtrykk`), ellers det kildesjekken så første gang (`data/status/kildegrunnlag.json`, sammen med antall feil på rad). `kildestatus.json` har samme format som før, så versjonen som er publisert, kan lese en fersk statusfil. En ny kilde står derfor ikke som endret. `endret_siden` er når innholdet sist ble et annet enn ved forrige sjekk, og står også etter at eier har gått gjennom endringen.
- **Eier godkjente 08.10.2026 alle kildene som var i bruk.** De 11 gamle Vestland-kildene (`vlfk-*`) som ikke er i bruk, har `godkjent: null`.

**Konsekvens:** Brukerne ser nøytral informasjon om kildene. Eier ser i kontrollsaken både nye kilder som venter på godkjenning, og endringer i godkjente kilder. Første kildesjekk etter endringen lagrer grunnlaget for kildene uten godkjent fingeravtrykk, uten å melde dem som endret.

**Endret 09.10.2026:** De elleve Vestland-kildene (`vlfk-*`) er tatt ut av kilderegisteret, og punktet for vestlandfylke.no i kontrollrundene er fjernet. Vestland behandles som de andre fylkene, med lenkene i `content/fylker/lenker.yaml` (eier 09.10.2026).
