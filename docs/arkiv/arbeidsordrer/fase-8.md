# Arbeidsordre: fase 8 – Dagens jukselapp

Lim inn teksten under streken som første melding i en ny samtale. Bakgrunnen står under arbeidsordren.

*Status 08.10.2026:* Fasen er levert i 0.43.0 (avgjørelse 086). Arbeidsordren for fase 9 står i `fase-9.md`.

*Status 07.10.2026:* Skrevet om etter eiers beskjed 07.10.2026. Fase 8 har bare dagens jukselapp. Årshjulet og eksporten til kalender (.ics) er tatt ut, og fasene 9–11 er skrevet om i `OPPDRAG.md`. Arbeidsordren er klar til bruk.

---

Vi starter fase 8 i Jukselappen: **Dagens jukselapp** (repo `larsarnenilssen/jukselappen`, appen på https://jukselappen.no). Skriv til meg på bokmål, kort og enkelt.

**Les først:**
- `AGENTS.md` (faste regler)
- `OPPDRAG.md` (fase 8 og «Gjelder alle faser»)
- `CHANGELOG.md` (siste versjoner)
- Denne filen, også bakgrunnen under arbeidsordren
- Avgjørelsene i `docs/avgjorelser/`:
  - om kalenderen og `frister()` i manifestene, mønsteret jukselappen følger (066)
  - om forsiden, sidekolonnen og panelet øverst (056, 068, 081)
  - om favoritter og ikoner (056, 058)
  - om startpakken, stiler og målformer som lastes ved behov (082, 083)
  - om nyhetene, som siste visning i panelet (084)
  - om brukserklæringen og merket «Kontrollert» (016)
- `docs/arbeidsordrer/fase-7b-forslag.md`, runde 6: slik panelet ser ut nå

**Status:**
- Siste versjon er 0.42.0 (07.10.2026), med nyhetene i panelet og på egen side.
- Panelet øverst på forsiden har tre visninger: Kalender, Nyheter og I tall (`src/app/Forsidepanel.tsx`). De deler oppsettet `panel-boks`, `panel-liste` og `panel-videre` og kroken `useTilpassetListe`.
- Modulene gir frister til kalenderen gjennom `frister()` i manifestet (`src/modules/typer.ts`). Jukselappen får fakta på samme måte.
- Startpakken skal holdes under 150 kB med god margin (`npm run build` sjekker det). Nye visninger lastes når de vises.

**Fasen (fra `OPPDRAG.md`):**
- **Dagens jukselapp:** ett faktum fra appen på forsiden: en frist, en regel, et begrep, timetallet og årsrammen i et fag, en setning fra overordnet del og så videre. Det er en morsomhet, en kuriositet og en inngang til innholdet.
- **Av og på:** Den er av fra start. Den skrus av og på fra forsiden og under Innstillinger, og valget lagres lokalt.
- **Når den er av,** kan forsiden ha en kort tekst med en knapp som slår den på. Teksten kan lukkes for godt.
- **Fakta fra modulene:** Modulene bidrar gjennom en ny funksjon i manifestet (`fakta()`), så nye moduler kommer med av seg selv. Fakta hentes fra innholdet, regelsettene og dataene appen alt har. Ingen eksterne kall, og alt virker uten nett.
- **Lenke og kilde:** Hvert faktum lenker til stedet i appen der det står, og har kilden.
- **Fylke og skole:** Fylkes- og skoleinnhold vises bare når fylket eller skolen er valgt.
- **Målform:** Tekstene står på bokmål og nynorsk.

**Arbeidsmåte:**
- Først et forslag med mockup i appen, med skjermbilder på mobil og skrivebord, før noe bygges ferdig. Push til `test` etter hver designrunde.
- Legg fram for meg:
  - hvilke typer fakta som tas med, med noen eksempler fra hver modul
  - om bare kontrollert innhold skal vises (se bakgrunnen: ingenting er kontrollert ennå)
  - om jukselappen byttes hver dag, med en knapp eller begge
  - hvor rubrikken og bryteren står: egen rubrikk eller en fjerde visning i panelet, og hvordan teksten som slår den på, ser ut
- Ingen ende-til-ende-tester før jeg har sagt at designet er ferdig.
- Versjons-PR når vi er enige.
- Når fasen er levert, skriver du arbeidsordren for fase 9 (`docs/arbeidsordrer/fase-9.md`) etter `OPPDRAG.md`, med de åpne punktene der.

---

## Bakgrunn

### Endret 07.10.2026 (eier)

- Årshjulet og eksporten til kalender (.ics) er tatt ut av fase 8. Kalenderen dekker behovet.
- Fase 9 er nå **Lokale regler for fylke og skole**: brukerne legger inn og melder inn lokale regler, eier godkjenner, og godkjente regler vises for alle som har valgt fylket eller skolen. Lokale profiler som bare deles som fil eller lenke, er tatt ut.
- Nye faser: 10 **Velkomst** (en trinnvis veileder i et vindu ved første besøk) og 11 **Reklamefilm**.
- Hver fase har et utgangspunkt og åpne punkter i `OPPDRAG.md`, som avklares i fasen.

### Hva som er åpent etter fase 7b

- **Kilder som ikke er med:** `docs/KILDER-IKKE-MED.md`.
- **Nyhetene:** Trøndelag og Østfold fylkeskommune er ikke med (robots.txt og ingen svar). Prøvekildene prøves igjen fra Actions med `npm run nyheter:prove` (arbeidsflyten Nyheter, manuell kjøring).
- **Eiers kontroll:** Innholdet fra fase 7 og 7b venter på kontroll (`kontrollert: null`) og tas i kontrollrundene.

### Bare kontrollert innhold?

Per 07.10.2026 har ingen innhold eller regelverdier `kontrollert` satt (545 med `kontrollert: null`). Viser jukselappen bare kontrollert innhold, blir den tom til kontrollrundene er i gang. Et mulig mellomsteg er å vise alt, med brukserklæringen som forbehold (avgjørelse 016), og bytte til bare kontrollert senere. Det må eier avgjøre.

### Tekniske hensyn

- Den nye funksjonen i manifestet (f.eks. `fakta()`) må finnes i alle moduler. En test sjekker at alle manifestene har den, slik som for `favorittbare`.
- Faktaene lastes først når jukselappen vises, så startpakken ikke vokser. Er jukselappen av, lastes ingenting.
- Samme faktum hele dagen kan velges ut fra datoen, så det er likt for alle og ikke må lagres.
- Kildene vises med `Kortfot` som på andre kort (avgjørelse 071), og en rubrikk som kan åpnes, husker det med `useHusketApen` (avgjørelse 072).
- Nye tekster i `src/strings/` på bokmål og nynorsk. Farger bare i `tokens.css`.
- Valget lagres med lagringsmodulen, med skjemaversjon som de andre valgene.
