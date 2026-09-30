# 019 – Kontrollspørsmål, praksis og kontrollrunder

**Kontekst:** Dette er steg 3 i kontrollsystemet (avgjørelse 017 og 018). Eier ville ha støtte til kontrollen: spørsmål om en forklaring kan være villedende og om praksis stemmer, og faste runder for det som ikke kan sjekkes automatisk (30.09.2026).

**Valg:**
- **Kontrollspørsmål:**
  - Innhold i `content/` har 1–5 `kontrollsporsmal` om det som er usikkert i teksten. Det testes.
  - Spørsmålene er for eier, skrives på bokmål og vises ikke i appen.
  - De står i kontrolloversikten. I den ukentlige kontrollsaken står de ved det som kan være berørt av en endring i kilden.
- **Praksis og tolkninger:**
  - `content/kontroll/praksis.yaml` har det appen bygger på uten at det står i kildene. For hvert punkt står spørsmålet til eier, hva appen gjør, grunnlaget og hva som bygger på det.
  - `bekreftet` settes bare av eier, som `kontrollert`.
  - Verdier med `grunnlag: praksis` må stå i listen. Det testes.
- **Kontrollrunder:**
  - Første mandag i mai og august lager kildesjekken en sak (etikett `kontrollrunde`) med praksis som bør bekreftes og kontroller som er gamle eller har endret kilde. Det som ikke er kontrollert ennå, telles bare.
  - Det lages bare én sak per runde, også om jobben kjøres flere ganger.
  - Eier kan starte en runde manuelt.
- **Bør kontrolleres på nytt:** Den ukentlige kontrollsaken får også innhold og verdier eier har kontrollert, men der kilden er endret etterpå eller kontrollen er over 12 måneder gammel.

**Konsekvens:** Det som ikke kan sjekkes automatisk, kommer opp to ganger i året. Kontrollen blir rettet mot det som er usikkert. Nye tekster må få kontrollspørsmål, og nye valg eier gjør, føres i praksislisten. Neste steg: automatiske endringsforslag og godkjenning med avkrysning.
