# 081 – Panelet øverst på forsiden: kalender, nyheter og tall

**Kontekst:** Eier vil ha Kalender, de kommende Nyhetene (fase 7b) og Videregående i tall som alternative visninger på samme plass på forsiden, i sidekolonnen på skrivebord og øverst på mobil, ikke som tre grupper over hverandre (07.10.2026). Videregående i tall skal ikke stå under «Oppslag».

**Valg:**
- **Ett panel** (`src/app/Forsidepanel.tsx`) er én gruppe i rekkefølgen på forsiden (`panel`). En segmentert bryter over panelet veksler mellom visningene, og valget lagres i `forside.visning`. På mobil er panelet lukket fra start, og overskriften viser oppsummeringen av visningen som er valgt (avgjørelse 066). Bryteren står alltid synlig, så brukeren kan bytte uten å åpne panelet.
- **Brukeren velger visningene** under «Tilpass». Valget lagres i `forside.skjult` med de samme id-ene som før (`neste`, `nyheter`, `itall`), så den som hadde slått av «Neste datoer», har det fortsatt av. Er bare én visning med, står den som en vanlig gruppe uten bryter. Er ingen med, er panelet borte.
- **«Bare favoritter»:** Hver visning som er favoritt, står som sin egen gruppe, som kalenderen gjorde før. Kortet for kalenderen står da ikke under kategorien.
- **Eget oppsett per visning:** datoene som en liste. Tallene som fire fliser, en stripe der hvert fylke er en prikk etter andelen som fikk læreplass (fylket i seriefargen, landet stiplet, med en forklaring i tekst), skolen og lenken videre.
- **Nyhetene** er en skisse til fase 7b. Den finnes bare i testversjonen og i utvikling (`__TESTVERSJON__` eller annen modus enn `production`), så den publiserte appen har bare kalenderen og tallene til nyhetene er laget.
- **Videregående i tall** står ikke under «Oppslag» (`paaForsiden: false` i manifestet, avgjørelse 080).
- Gruppene på forsiden er flyttet til `src/app/Forsidegruppe.tsx`, så panelet og forsiden bruker den samme.

**Konsekvens:** Fase 7b legger nyhetene inn som visningen `nyheter` i panelet og tar bort skissen. En ny visning krever en oppføring i `VISNINGER`, en komponent i panelet og en tekst i `forside.panel` og `forside.tilpass.visning`.
