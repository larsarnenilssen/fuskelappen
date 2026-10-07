# 081 – Panelet øverst på forsiden: kalender, nyheter og tall

**Kontekst:** Eier vil ha Kalender, de kommende Nyhetene (fase 7b) og Videregående i tall som alternative visninger på samme plass på forsiden, i sidekolonnen på skrivebord og øverst på mobil, ikke som tre grupper over hverandre (07.10.2026). Videregående i tall skal ikke stå under «Oppslag».

**Valg:**
- **Ett panel** (`src/app/Forsidepanel.tsx`) er én gruppe i rekkefølgen på forsiden (`panel`). Valgene står i overskriften når panelet er åpent: rolige tekstknapper («Kalender», «Nyheter», «I tall»), der den valgte er fet med en strek under (eier 07.10.2026). De dekker overskriften unntatt pilen, så et trykk mellom dem ikke lukker panelet, og panelet lukkes med pilen. Lukket er valgene borte, og overskriften viser tittelen og oppsummeringen av visningen som er valgt. Valget lagres i `forside.visning`. På mobil er panelet lukket fra start (avgjørelse 066). En første skisse med en segmentert bryter over panelet ble for stor og fremtredende.
- **Brukeren velger visningene** under «Tilpass». Valget lagres i `forside.skjult` med de samme id-ene som før (`neste`, `nyheter`, `itall`), så den som hadde slått av «Neste datoer», har det fortsatt av. Er bare én visning med, står den som en vanlig gruppe uten valg. Er ingen med, er panelet borte.
- **«Bare favoritter»:** Bare visningene brukeren har merket som favoritt, hver for seg, står der, hver som sin egen gruppe, som kalenderen gjorde før. Kortet for kalenderen står da ikke under kategorien.
- **Eget oppsett per visning:** datoene som en liste. Tallene i ett kort som kalenderens, med tynne streker mellom delene: fire nøkkeltall, en stripe der hvert fylke er en prikk etter andelen som fikk læreplass (fylket i seriefargen, landet stiplet, med en forklaring i tekst), skolen og lenken videre.
- **Nyhetene** er en skisse til fase 7b. Den finnes bare i testversjonen og i utvikling (`__TESTVERSJON__` eller annen modus enn `production`), så den publiserte appen har bare kalenderen og tallene til nyhetene er laget.
- **Videregående i tall** står ikke under «Oppslag» (`paaForsiden: false` i manifestet, avgjørelse 080).
- Gruppene på forsiden er flyttet til `src/app/Forsidegruppe.tsx`, så panelet og forsiden bruker den samme.

**Konsekvens:** Fase 7b legger nyhetene inn som visningen `nyheter` i panelet og tar bort skissen. En ny visning krever en oppføring i `VISNINGER`, en komponent i panelet og en tekst i `forside.panel` og `forside.tilpass.visning`.
