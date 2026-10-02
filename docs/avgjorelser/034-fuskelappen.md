# 034 – Fuskelappen: nytt navn, ny logo og roligere forside

**Kontekst:** Eier ville gi appen et nytt navn og et mer tiltrekkende utseende (02.10.2026). Eier valgte navnet «Fuskelappen», logoforslag C (hvit lapp med brettet hjørne og gul hake) og alle forslagene til mindre endringer, men uten logo i toppfeltet.

**Valg:**
- Navnet endres i `src/config/app.ts`, som før er eneste sted navnet defineres. Nettadressen (`/protokollen/`), repoet, lagringsnøkkelen og nøklene i historikken beholder det gamle navnet. Ellers ville de som har installert appen, mistet innstillinger, favoritter og lagrede varianter.
- Ikonet lages fra `ikon/ikon.svg` som før. Toppfeltet viser bare appnavnet.
- Forsiden: toppfeltet fortsetter ned rundt en kort undertekst og søket, med runde hjørner nederst.
- Gul aksentfarge fra logoen (`--farge-aksent`) brukes sparsomt: markeringen bak den aktive fanen i bunnmenyen. Teksten og ikonet på gul er mørkeblå (`--farge-aksent-tekst`).
- Modulene på forsiden har ikonet i en farget sirkel, og kategorioverskriftene står uten store bokstaver.
- Merknaden om nasjonalt innhold har et ikon. Når fylke er valgt, står valget som én kort linje med lenke til innstillingene, ikke i en boks.
- Ingen favoritter ennå: et lite kort med stiplet kant og stjerne.
- Systemlinjen: i installert app går toppfeltet allerede opp bak klokke og batteri (`black-translucent` og `safe-area-inset-top`), så den er uendret.

**Konsekvens:** Appen har et eget uttrykk som henger sammen med ikonet. Ingen brukerdata går tapt. Skal adressen også endres, må det skje med en omdirigering og en plan for lagrede data.
