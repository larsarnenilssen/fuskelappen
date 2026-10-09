# Arbeidsordre: fase 10 – Velkomst

Lim inn teksten under streken som første melding i en ny samtale. Bakgrunnen står under arbeidsordren.

*Status 09.10.2026:* Levert i 1.0.1 (avgjørelse 094). Forslaget og svarene står i `docs/arbeidsordrer/fase-10-forslag.md`, og arbeidsordren for fase 11 i `docs/arbeidsordrer/fase-11.md`.

---

Vi starter fase 10 i Jukselappen: **Velkomst** (repo `larsarnenilssen/jukselappen`, appen på https://jukselappen.no). Skriv til meg på bokmål, kort og enkelt.

**Les først:**
- `AGENTS.md` (faste regler, særlig «Grensesnitt»)
- `OPPDRAG.md`: fase 10, «Gjelder alle faser» og kapittel 7 «Åpne punkter»
- `CHANGELOG.md` (siste versjoner)
- Denne filen, også bakgrunnen under arbeidsordren
- `docs/DESIGN.md`: designprinsippene fra fase 8b, som velkomsten følger
- Avgjørelsene i `docs/avgjorelser/`:
  - om meldingen om ny versjon og `Overlegg`, som velkomsten bygger på (088)
  - om dagens jukselapp, som velkomsten spør om (086)
  - om lokale regler for fylke og skole (093)
  - om tilbakemelding på e-post, som takketrinnet lenker til (064)
  - om privatskoler og valget i innstillingene (075)
  - om forsiden, favorittene og ikonene (056 og 058)
  - om stiler og målformer som lastes når de trengs (082 og 083)
  - om testversjonen (045)
- `docs/arbeidsordrer/fase-9-forslag.md`: slik forslaget med skisse og svar ble lagt fram i fase 9

**Status:**
- Siste versjon er 0.46.0 (08.10.2026), med lokale regler for fylke og skole (fase 9, avgjørelse 093).
- Valgene velkomsten kan spørre om, står under Innstillinger (`src/app/sider/Innstillinger.tsx`):
  - målform
  - fylke og skole, med bryteren «Privatskole» (avgjørelse 075)
  - dagens jukselapp (`Jukselappbryter`), som er av fra start
  - «Lokale regler», med skjemaet på `#/innstillinger/lokal-regel`
- Alt lagres lokalt (`src/core/lagring/lagring.ts`, skjemaversjon 3). Nye valg har kommet som valgfrie felt, som `forside.jukselapp` og `egneRegler`, så skjemaversjonen er den samme.
- `Overlegg` (`src/components/Overlegg.tsx`) brukes av meldingen om ny versjon: et kort midt på skjermen over et uklart slør, med tynn ramme i merkefargen. Resten av appen kan ikke nås mens det er åpent, og Esc lukker det (avgjørelse 088).
- Tilbakemeldingen lager en ferdig e-post til appens adresse (avgjørelse 064). Appen sender ingenting selv.
- Startpakken skal holdes under 150 kB (`npm run build` sjekker det). Nye deler lastes når de vises.

**Fasen (fra `OPPDRAG.md`):**
- **Vinduet:** Et vindu over appen, med uklar bakgrunn, åpnes første gang brukeren besøker appen. Brukeren blar med «Neste» og «Tilbake» og kan lukke vinduet når som helst, også ved første trinn. Valget lagres lokalt.
- **Åpnes igjen** fra Innstillinger og fra forsiden.
- **En trinnvis veileder** i bruken av appen, med korte, gjentakende animasjoner der det passer. Trinnene kan ha felt å fylle ut eller lenker og tips om navigasjon:
  1. **Hva appen er:** kort om den og hvem den er for.
  2. **Oppbyggingen:** appens oppbygging og funksjoner, steg for steg, i ett eller flere trinn.
  3. **Fylke og skole:** hva valget gjør, og valget kan gjøres i trinnet.
  4. **Lokale regler:** at brukeren kan melde inn regler for eget fylke eller egen skole (fase 9), med lenke dit.
  5. **Hvem du er:** rollen og hva brukeren vil bruke appen til, med anbefalte favoritter som kan legges til. Trinnet viser også hvordan favorittene virker.
  6. **Dagens jukselapp:** spørsmål om brukeren vil slå på dagens jukselapp, med bryteren i trinnet (eier 08.10.2026).
  7. **Installere appen** på mobil eller skrivebord.
  8. **Takk:** appen er et privat prosjekt laget med hjelp av KI, og innspill om feil, mangler og forbedringer er velkomne (lenke til Tilbakemelding). Takk, og «Du er klar!».
- **Målform:** Tekstene står på bokmål og nynorsk.

**Utgangspunkt (godtatt av eier 07.10.2026):**
- **Åpnes igjen** med en knapp under Innstillinger og en diskré lenke nederst på forsiden, ved forbeholdet («Ny her? Se velkomsten»).
- **Første besøk:** Vinduet åpnes bare av seg selv når første besøk lander på forsiden. En delt lenke til en side går rett dit.
- **Animasjonene** lages i CSS eller SVG, ikke som video, og lastes først når vinduet åpnes. En gjentakende animasjon stopper av seg selv innen fem sekunder eller har en pauseknapp (WCAG 2.2.2). Med redusert bevegelse på enheten vises ingen animasjon.
- **Vinduet** bygger på `Overlegg`. Det holder fokus inne til det lukkes, og Esc lukker det. Bakgrunnen er uklar også i WebKit.
- **Rollen** gir anbefalte favoritter og kan sette filteret «hvem det gjelder» i kalenderen.
- **Installasjon:** egen hjelp for iPhone og iPad (Del, så Legg til på Hjem-skjerm), Android og skrivebord. Trinnet hoppes over når appen alt er installert.

**Arbeidsmåte:**
- Først et forslag med skisse i testversjonen, med skjermbilder på mobil og skrivebord, før noe bygges ferdig. Push til `test` etter hver designrunde. Forslaget og svarene mine står i `docs/arbeidsordrer/fase-10-forslag.md`, som i fase 9.
- Velkomsten følger `docs/DESIGN.md`: valg er gule piller, brytere er gule når de er på, og valgene i trinnene ser ut som de samme valgene i Innstillinger.
- Legg fram for meg, med et råd for hvert punkt:
  - om brukere som har appen fra før, skal få velkomsten én gang når den kommer
  - hvilke roller som er med (f.eks. lærer, kontaktlærer, avdelingsleder, rådgiver og rektor), og hvilke favoritter hver rolle får
  - hvor mange trinn det blir om oppbyggingen, og hva de viser
  - tekstene og animasjonene i hvert trinn
  - om velkomsten skal nevne lokale regler, og i så fall som eget trinn med lenke til skjemaet (trinn 4 over) eller som en linje i trinnet om fylke og skole
  - hvordan trinnet om dagens jukselapp viser hva brukeren sier ja til
- Personvern: Rollen og valgene lagres bare på enheten, som de andre valgene. Ingen personopplysninger i repoet, testdata eller skjermbilder.
- Nye avhengigheter (f.eks. til animasjonene) krever avgjørelsesnotat.
- Ingen ende-til-ende-tester før jeg har sagt at designet er ferdig.
- Versjons-PR når vi er enige, med 1–4 punkter i `content/versjoner.yaml` (avgjørelse 088).
- Når fasen er levert, skriver du arbeidsordren for fase 11 (`docs/arbeidsordrer/fase-11.md`) etter `OPPDRAG.md`, med de åpne punktene der.

---

## Bakgrunn

### Levert i fase 9 (0.46.0, 08.10.2026)

- **Lokale regler:** Brukeren kan legge inn lokale regler for fylket eller skolen sin under Innstillinger → «Lokale regler» (`#/innstillinger/lokal-regel`).
  - Skjemaet begynner med temaet: Arbeidstid, Skoleregler, Fraværsgrensen, Eksamen eller Inntak.
  - Så kommer hva som endres: et tall i kalkulatorene eller en regel på siden for temaet.
  - Tallene er:
    - planfestet tid
    - redusert undervisning for kontaktlærer, i prosent eller årsrammetimer
    - godtgjøring for kontaktlærer og rådgiver
    - undervisningsdager
- **Egne regler** gjelder med en gang for brukeren og lagres bare på enheten (valgfritt felt `egneRegler`, skjemaversjonen er fortsatt 3). De merkes «Din egen · ikke kontrollert», med stiplet ravfarget kant.
- **Innmelding på e-post** i fast form (YAML). Etterpå kommer kortet «E-posten er laget», fordi e-postprogrammet kan åpne seg bak nettleseren.
- **Godkjente regler** ligger i `lokale/regler.yaml` og blir `data/lokale/regler.json`. De publiseres uten ny versjon når PR-en flettes (arbeidsflyten «Lokale regler», som nyhetene). Kilden kan være en lokal avtale som ikke er offentlig (eier 08.10.2026, L4 B). Avgjørelse 093.
- Under godkjente regler står «Feil eller endret? Endre for deg eller meld inn».
- **Vedlikehold (L7):** Verdiene i `rules/` har `lokal: true` eller `lokal: false`, og modulene har `lokaleRegler` i manifestet. Testene feiler når noe nytt mangler valget.
- Forslaget og svarene står i `docs/arbeidsordrer/fase-9-forslag.md`.

### Åpent etter fase 9

- **Eiers kontrollpunkt for fase 9:** Eier legger inn og melder inn en regel for en skole, godkjenner den og ser at den vises for andre som har valgt skolen. Det gjenstår til etter publiseringen.
- **Eiers kontroll:** Innhold som ikke er kontrollert ennå, tas i kontrollrundene.
- **Kilder som ikke er med:** `docs/KILDER-IKKE-MED.md`. Trøndelag og Østfold fylkeskommune er fortsatt ikke med i nyhetene.

### Velkomsten og de andre fasene

- Fase 10 tas etter fase 9, fordi ett av trinnene viser til innmeldingen av lokale regler (eier 07.10.2026).
- Dagens jukselapp har ingen egen tekst på forsiden som slår den på. Bryteren står under «Tilpass» og Innstillinger, og velkomsten spør om brukeren vil slå den på (eier 08.10.2026, avgjørelse 086).
- `Overlegg` ble laget for meldingen om ny versjon med velkomsten i tankene (avgjørelse 088, AGENTS.md under «Grensesnitt»).

### Tekniske hensyn

- **Første besøk:** `lesLagret` gir status `ny` når ingenting er lagret. Brukere som har appen fra før, har lagrede data. Et valgfritt felt for at velkomsten er sett, holder skjemaversjonen på 3.
- **Overlegget:** `Overlegg` gjør resten av appen utilgjengelig (`inert`), gir fokus til vinduet og lukkes med Esc. Velkomsten og meldingen om ny versjon (`Oppdateringsvarsel`, i `src/app/Skall.tsx`) må ikke stå oppå hverandre.
- **Valgene i trinnene** bør bruke samme kode som Innstillinger, så de virker likt: `velgFylke`, skolevalget som setter `privatskole` (avgjørelse 075) og `Jukselappbryter`.
- **Rollen og kalenderen:** Filteret «hvem det gjelder» står i adressen i dag (`src/modules/kalender/adresse.ts`), ikke i lagringen. Skal rollen sette filteret, må rollen lagres.
- **Favorittene:** De anbefalte favorittene må finnes i modulenes `favorittbare`. En test kan sjekke det.
- **Installert:** `src/app/TekniskInfo.tsx` sjekker allerede om appen er installert (`navigator.standalone` og `display-mode: standalone`).
- **Lasting:** Velkomsten, stilene og animasjonene lastes når vinduet åpnes (avgjørelse 082 og 083), så startpakken ikke vokser.
- **Forhåndsvisning:** Som `?vis=nyversjon` (avgjørelse 088) kan en egen adresse vise velkomsten i utvikling, i testene og i testversjonen. Testversjonen har egen lagringsnøkkel (avgjørelse 045), så velkomsten kommer der første gang også for den som har appen fra før.
- **Ende-til-ende-tester:** Mange tester starter uten lagrede data. Velkomsten som åpnes av seg selv på forsiden, må ikke stå i veien for testene som ikke gjelder den. Overflyt (320–430 px) og axe i lys og mørk visning gjelder også vinduet.
- Nye tekster i `src/strings/` på bokmål og nynorsk. Farger bare i `tokens.css`.
- Lokale ende-til-ende-tester: Playwright bruker en `vite preview` som allerede kjører på port 4173 i stedet for å bygge på nytt. Stopp en gammel server før en kjøring, ellers testes et gammelt bygg.
- I skymiljøet finnes bare Chromium (`/opt/pw-browsers/chromium`), og ikke nettleserne til Playwright-versjonen i repoet. Lokalt kjøres ende-til-ende-testene da i Chromium med `launchOptions.executablePath` i en egen konfigurasjon som ikke committes. WebKit testes i CI.
