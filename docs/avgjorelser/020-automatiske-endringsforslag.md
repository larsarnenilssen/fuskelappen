# 020 – Automatiske endringsforslag fra kildesjekken

**Kontekst:** Dette er steg 4 i kontrollsystemet (avgjørelse 017–019). Eier ville at maskinen gjør arbeidet frem til en ferdig endring, og at eier bare godkjenner (30.09.2026). Innhold i appen skal fortsatt ikke endres uten eier, med unntak av registerdata.

**Valg:**
- **Nye tall og sitater:**
  - Når verdisjekken finner et nytt tall i kilden, lager kildejobben grenen `kontroll/forslag` fra main.
  - Grenen har nytt tall og nytt sitat i regelfilen, og `kontrollert: null`.
  - Verdier der tallet er uendret, men et annet tall i sitatet er endret, får bare nytt sitat.
  - Filen endres linje for linje, så kommentarer og rekkefølge beholdes.
- **Grep som feiler:** Feiler testene med nye Grep-data, lages grenen `kontroll/grep` med de nye dataene, så feilen kan rettes der.
- **PR og tester:**
  - Kildejobben lager eller oppdaterer én PR per gren. Grenene skrives over hver uke.
  - PR-er som lages med `GITHUB_TOKEN`, starter ikke CI av seg selv. Derfor starter jobben CI med `workflow_dispatch` (ci.yml har fått den utløseren).
  - Jobben kjører også testene selv og skriver i beskrivelsen hvilke tester som feiler.
- **Fasittester:** Endres ikke automatisk. Feiler en fasittest med et nytt tall, står det i PR-en, og eier avgjør.
- **Ny avtaleperiode:** Gjelder endringen en ny periode, skal PR-en ikke flettes, og det lages en ny regelfil i stedet. Det står i PR-en.
- **Kontrollsaken** lenker til PR-ene.
- **Tabeller** (vedlegg 1, garantilønn) får ikke automatiske forslag ennå. Radene som ikke stemmer, står i kontrollsaken.

**Konsekvens:** Et endret tall i en kilde gir en ferdig PR med nytt tall og sitat og testresultat, som eier kan flette. Forklaringer og begreper som nevner tallet, oppdateres ikke automatisk. Kontrollsaken viser hva som kan være berørt.
