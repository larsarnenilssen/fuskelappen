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

**Tillegg (runde 5, eier 06.10.2026):**
- **«Kort om»** skolen brukeren har valgt, ellers fylket, øverst: mobbing på skolen mot landet og året før, og de tre indeksene der tallene ligger mest over og mest under landet (privatskolene i landet når «Privatskole» er valgt og skolen er privat). Uten valgt skole og fylke står en lenke til innstillingene.
- **Overskrifter som kan lukkes** (`Seksjon`): «Kort om», «Mobbing», «Læringsmiljøet» og «Om tallene». Boksene under «Mobbing» er lukket fra start og har tallene for seriene i overskriften. Nøkkeltallene over boksene er tatt bort, fordi tallene står i overskriften.
- **To kolonner på skrivebord** i et rutenett: «Kort om» over hele bredden, mobbingen og «Om tallene» til venstre, og læringsmiljøet og kildene til høyre. På mobil står delene i samme rekkefølge under hverandre. Tabellen står over hele bredden.
- **Tabellen** har fast oppsett med like brede kolonner for seriene, ledelinjer og tallene til høyre.
- **Bedre og svakere** enn året før (og enn landet i «Kort om») er grønt og rødt (`--farge-ok` og `--farge-feil`), alltid med pil (▲ ▼) og tekst for skjermlesere. For mobbing er lavere bedre. En endring som rundes til 0, får ingen pil.

**Tillegg (runde 6, eier 06.10.2026):**
- **Søk i seriene:** Hvert valg er et søkefelt med liste (combobox etter ARIA 1.2). Uten søk står landet og fylkene. Med søk står treffene blant landet, fylkene og skolene, og «vgs» finner «videregående». Listen viser opptil 40 skoler.
- **Beste resultat i tabellen:** Det beste tallet i hver rad har en ramme i tekstfargen og fet skrift, med «best i raden» for skjermlesere. Høyest er best for indeksene og lavest for mobbing. Like tall merkes alle, men er alle tallene i raden like, merkes ingen.
- **Publiseringen:** Dataene fra Elevundersøkelsen hentes fra main når appen publiseres, som Grep og skoleregisteret (avgjørelse 018). Et nytt skoleår kommer da med i appen uten ny versjon, når kildesjekken har hentet det.

**Endret 08.10.2026:** Elevundersøkelsen er egen modul med adressen `#/elevundersokelsen` (avgjørelse 087).
