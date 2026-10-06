# 077 – Elevundersøkelsen

**Kontekst:** Fase 7: Elevundersøkelsen i Skolemiljø. Eier vil ha en fullverdig visning med mobbing, sammenligning mellom skoler, fylker og landet, fjoråret og privatskolene sammenlignet med sin egen gruppe. Visningen skal stå på eget fylke og egen skole, og det skal være enkelt å bytte (06.10.2026).

**Valg:**
- **Tallene fra Udirs statistikkbank** (`api.statistikkbanken.udir.no`, NLOD), tabell 152 (indeksene) og 154 (mobbing), for de to siste skoleårene. `npm run hent:elevundersokelsen` lager `data/elevundersokelsen/resultater.json`, som lastes når siden åpnes (om lag 110 kB komprimert). Kildesjekken henter på nytt hver uke, og endringene står i kontrollsaken. Appen gjør ingen kall selv.
- **Eierform:** Landet og fylkene har alle, offentlige og private skoler. En skole har bare sine egne tall. Fylker som ikke finnes lenger, tas ikke med.
- **Skjermede tall** («*») og tall som mangler, vises som det de er, aldri som 0. Hentingen stopper hvis landet mangler tall for et spørsmål, eller et tall er utenfor skalaen.
- **Siden:**
  - Opptil tre serier. Standard er valgt skole, valgt fylke og landet, og landet for private skoler når «Privatskole» er på. Uten valg vises landet for alle, offentlige og private skoler. Seriene, trinnet og visningen står i adressen (`s`, `trinn`, `vis`), så en sammenligning kan lagres som favoritt.
  - Nøkkeltall for «Mobbing på skolen», mobbingen som liggende søyler og indeksene som punkter på skalaen 1–5. Fjoråret er et hult merke. Endringen står i tekst, for mobbing i prosentpoeng.
  - Hver serie har farge og form (sirkel, firkant, rute), så fargen aldri står alene. Fargene er validert for fargesvake i lyst og mørkt tema (`--serie-1` til `--serie-3`).
  - Tabellvisning med antall svar.
  - «Om tallene» forklarer hvem som svarer, når og hva skjermingen betyr. To kolonner på skrivebord (avgjørelse 074).

**Konsekvens:** Et nytt skoleår kommer med av seg selv i desember. Endrer Udir tabellene eller kodene, stopper hentingen og kildesjekken melder fra. Tolkningen av tallene er Udirs. Appen forklarer skalaene, men rangerer ikke skoler.
