# 034 – Fuskelappen: nytt navn, ny logo og roligere forside

**Kontekst:** Eier ville gi appen et nytt navn og et mer tiltrekkende utseende (02.10.2026). Eier valgte navnet «Fuskelappen», logoforslag C (hvit lapp med brettet hjørne og gul hake) og alle forslagene til mindre endringer, men uten logo i toppfeltet.

**Valg:**
- Navnet endres i `src/config/app.ts`, som før er eneste sted navnet defineres.
- Eier ba om at også nettadressen og lagringsnøkkelen endres, siden ingen andre har tatt appen i bruk ennå. Repoet får navnet `fuskelappen`, og appen publiseres under `/fuskelappen/`. Den gamle adressen sender ikke videre.
- Lagringsnøkkelen er `fuskelappen`. Finnes det ingenting under den, leses data fra den gamle nøkkelen `protokollen` én gang, og neste lagring skjer under den nye. Det er samme domene (github.io), så eiers innstillinger og favoritter følger med. Eksportfiler fra før kan fortsatt importeres.
- Merkene i kontrollsakene (`<!-- protokollen-kontroll … -->`) beholdes, så kildesjekken finner sakene den har laget før.
- Ikonet lages fra `ikon/ikon.svg` som før. Toppfeltet viser bare appnavnet.
- Forsiden: toppfeltet fortsetter ned rundt søket, med runde hjørner nederst og lite luft, så forsiden ikke bruker mer høyde enn nødvendig. Lenken «Alle favoritter» er fjernet, siden favorittknappen i bunnmenyen gjør det samme.
- Gul aksentfarge fra logoen (`--farge-aksent`) brukes sparsomt: markeringen bak den aktive fanen i bunnmenyen. Teksten og ikonet på gul er mørkeblå (`--farge-aksent-tekst`).
- Modulene på forsiden har ikonet i en farget sirkel, og kategorioverskriftene står uten store bokstaver.
- Merknaden om nasjonalt innhold har et ikon. Når fylke er valgt, står valget som én kort linje med lenke til innstillingene, ikke i en boks.
- Ingen favoritter ennå: et lite kort med stiplet kant og stjerne.
- Systemlinjen: i installert app går toppfeltet allerede opp bak klokke og batteri (`black-translucent` og `safe-area-inset-top`), så den er uendret.

**Konsekvens:** Appen har et eget uttrykk som henger sammen med ikonet. Den installerte appen må legges til på hjemskjermen på nytt fra den nye adressen. Repoet må få nytt navn før endringen publiseres, ellers peker den publiserte appen på feil sti.

**Endret:** Appen heter Jukselappen, med lagringsnøkkelen `jukselappen` og nytt ikon (avgjørelse 058), adressen er https://jukselappen.no/ (avgjørelse 065), og bunnmenyen er tatt bort (avgjørelse 056). Linjen er ført inn 09.10.2026 sammen med oversikten over avgjørelsene.
