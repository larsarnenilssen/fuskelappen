# 070 – Alle løp fra Grep, VIGO og utdanning.no, merket med kilden

**Kontekst:** Appen viste løpene fra Grep, og VIGO bare for påbygging (avgjørelse 051). Løp som bare VIGO eller utdanning.no hadde, kom ikke med, og utdanning.no bruker den gamle koden TPGPT3 for Grafisk produksjonsteknikkfaget, som nå er IMGPT3. Eier ba 06.10.2026 om at alle mulige løp fra kildene vises, merket tydelig når bare én kilde viser dem.

**Valg:**
- **Alle løp:** `medLopFraKildene` (`src/modules/fag/tilbud/kildesamsvar.ts`) legger hvert løp som VIGO eller utdanning.no har, og som Grep ikke har, til «bygger på» når tilbudene bygges. Grep endres ikke. Løp fra VIGO gir VIGO som kilde på tilbudet, og løp som bare står på utdanning.no, gir utdanning.no som kilde.
- **Merking:** Et løp merkes når en kilde er uenig (avgjørelse 052), eller når bare én kilde har det. Bare én kilde: «Står bare i VIGO». Ellers: «Står ikke i utdanning.no», med kildene som mangler løpet. Yrkesfaglig opphenting merkes fortsatt ikke (avgjørelse 051).
- **Gamle koder:** En kode på utdanning.no som ikke har løpet i Grep, regnes som koden med de samme fire tegnene for faget og trinnet i et annet utdanningsprogram, når den har løpet (TPGPT3 → IMGPT3). I dag gjelder det bare dette faget.
- **Rapporten:** docs/TILBUDSSTRUKTUR.md viser om løpet står på tilbudet i appen, også når det er funnet ut fra programmet. Før sto to løp i salg, service og reiseliv som «ikke vist», selv om appen viste dem. Løp som bare én kilde har uten at en annen er uenig, står i egne grupper.
- **utdanning.no:** Avgjørelse 052 brukte løpene fra utdanning.no bare til kontroll og lenker. Nå kan et løp som bare står der, vises, merket med kilden. Det vises bare koblingen mellom to programområder fra Grep, ingen tekst fra utdanning.no.

**Konsekvens:** Løpene til Sikkerhetsfaget og Service- og administrasjonsfaget har VIGO som kilde, ikke en avledning fra programmet. Realfag på den tyske skolen nås fra inngangen. Seks lærefag fører videre til Vg4 påbygging etter utdanning.no. Nye løp i én kilde kommer med av seg selv og merkes.
