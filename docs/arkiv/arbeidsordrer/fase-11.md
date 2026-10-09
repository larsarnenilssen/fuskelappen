# Arbeidsordre: fase 11 – Reklamefilm

Lim inn teksten under streken som første melding i en ny samtale. Bakgrunnen står under arbeidsordren.

*Status 09.10.2026:* Skrevet da fase 10 ble levert i 1.0.1. Arbeidsordren er klar til bruk.

---

Vi starter fase 11 i Jukselappen: **Reklamefilm** (repo `larsarnenilssen/jukselappen`, appen på https://jukselappen.no). Skriv til meg på bokmål, kort og enkelt.

**Les først:**
- `AGENTS.md` (faste regler, særlig «Personvern» og «Grensesnitt»)
- `OPPDRAG.md`: fase 11, «Gjelder alle faser» og kapittel 7 «Åpne punkter»
- `CHANGELOG.md` (siste versjoner)
- Denne filen, også bakgrunnen under arbeidsordren
- `docs/DESIGN.md`: designprinsippene, som filmen skal vise
- Avgjørelsene i `docs/avgjorelser/`:
  - om velkomsten, som forklarer navnet og delene av appen (094)
  - om dagens jukselapp (086), lokale regler (093) og Videregående i tall (080)
  - om forsiden, favorittene og ikonene (056 og 058)
  - om testversjonen (045)
- `docs/arbeidsordrer/fase-10-forslag.md`: slik forslaget med skisse og svar ble lagt fram i fase 10

**Status:**
- Siste versjon er 1.0.1 (09.10.2026), med velkomsten (fase 10, avgjørelse 094).
- Eier er klar til å dele appen med kolleger.
- Velkomsten forklarer navnet: Jukselappen er en digital jukselapp, en enkel oversikt og et raskt oppslag. Innholdet er det en skoleleder eller lærer bør kunne, og når det teller, kan hen «jukse litt» og sjekke jukselappen: regelen, tallet eller neste skritt, med lenke til kilden (eier 09.10.2026). Filmen bør bruke den samme tanken.

**Fasen (fra `OPPDRAG.md`):**
- En kort og enkel reklamefilm for appen.
- Tas sist, så filmen viser den ferdige appen.

**Utgangspunkt (godtatt av eier 07.10.2026):**
- Opptak av den ekte appen med eksempeldata, uten personopplysninger, med tekst og overganger. Lages i skyøkten med Playwright og ffmpeg.
- Uten tale. Musikk bare med fri lisens, ellers uten musikk.
- Filmen ligger ikke i selve appen, fordi den er for stor.

**Arbeidsmåte:**
- Først et forslag med manus (scene for scene: hva som vises, teksten på skjermen og lengden) og noen stillbilder, før filmen lages. Forslaget og svarene mine står i `docs/arbeidsordrer/fase-11-forslag.md`, som i fase 9 og 10.
- Så en første versjon av filmen som jeg kan se, og runder til jeg er fornøyd.
- Legg fram for meg, med et råd for hvert punkt:
  - hvor filmen skal brukes (sosiale medier, nettsiden, presentasjoner), og formatet: liggende (16:9), stående (9:16) eller kvadratisk
  - lengden, f.eks. 20–30 eller 45–60 sekunder
  - bokmål, nynorsk eller begge
  - hvor filmen skal ligge, og om appen skal lenke til den
  - musikk eller ikke
  - hvilke deler av appen filmen viser, og i hvilken rekkefølge
- Personvern: Ingen personopplysninger i filmen, opptakene eller skjermbildene. Fylket og skolen i opptakene er valgt fordi de viser lokalt innhold, ikke fordi noen jobber der.
- Opptakene viser appen slik den er publisert. Innhold som ikke er kontrollert, kan vises, men filmen skal ikke love mer enn appen gjør.
- Nye avhengigheter (f.eks. til redigering eller musikk) krever avgjørelsesnotat, og musikk må ha en lisens som tillater bruken.
- Filmen og råfilene legges ikke i repoet hvis de er store. Avklar med meg hvor de skal ligge.
- Når fasen er levert, oppdateres `OPPDRAG.md` (kapittel 8, «Ferdig når»).

---

## Bakgrunn

### Levert i fase 10 (1.0.1, 09.10.2026)

- **Velkomsten:** ni trinn i et vindu over appen ved første besøk på forsiden: velkommen (hva appen er og hvorfor den heter Jukselappen), søket, forsiden, sidene, «Hvor jobber du?» (fylke, skole og lokale regler), rolle med forslag til favoritter, dagens jukselapp, installering og takk.
- Rollene er lærer, kontaktlærer, rådgiver, skoleleder og «Annen rolle», med seks forslag til favoritter hver.
- Velkomsten åpnes igjen nederst på forsiden («Ny her? Se velkomsten») og i Innstillinger.
- Animasjonene i velkomsten er HTML og CSS i appens farger. De kan være et utgangspunkt for overgangene i filmen.
- Overskriftene over verktøyene på oversiktene står i entall eller flertall etter antallet, og Innstillinger har jevn luft i «Fylke og skole».
- Forslaget og svarene står i `docs/arbeidsordrer/fase-10-forslag.md`.

### Åpent etter fase 10

- **Eiers kontrollpunkt for fase 9:** Eier legger inn og melder inn en regel for en skole, godkjenner den og ser at den vises for andre som har valgt skolen.
- **Eiers kontroll:** Innhold som ikke er kontrollert ennå, tas i kontrollrundene (`OPPDRAG.md`, kapittel 8: all faglig tekst og alle regelverdier skal ha status `kontrollert`).
- **Kilder som ikke er med:** `docs/KILDER-IKKE-MED.md`. Trøndelag og Østfold fylkeskommune er fortsatt ikke med i nyhetene.
- **Kjent begrensning:** Fordelingstabellen i Arbeidsplan går utenfor skjermen ved skriftstørrelse på 150 % eller mer (`OPPDRAG.md`, kapittel 7).

### Tekniske hensyn

- **Opptak:** I skymiljøet finnes Chromium (`/opt/pw-browsers/chromium`) og ffmpeg (`/usr/bin/ffmpeg`). Playwright kan ta opp video av en side (`recordVideo`) eller ta skjermbilder som settes sammen med ffmpeg. Skjermbilder gir skarpest bilde og jevnest tempo.
- **Eksempeldata:** Lagringen kan settes før opptaket, som i `tests/e2e/hjelp.ts` (`settLagret`), med fylke, skole, favoritter og dagens jukselapp. `?vis=velkomst&trinn=…` viser et bestemt trinn i velkomsten, og `?vis=nyversjon` meldingen om ny versjon (bare i utvikling og testversjonen).
- **Velkomsten åpnes ikke av seg selv** når nettleseren styres av Playwright (navigator.webdriver). Det er nyttig i opptakene.
- **Tekst på skjermen** står på bokmål og nynorsk hvis filmen kommer i begge målformer. Oppramsinger har ikke komma foran siste «og»/«eller».
- **Lyd:** Musikk med fri lisens krediteres der filmen publiseres.
