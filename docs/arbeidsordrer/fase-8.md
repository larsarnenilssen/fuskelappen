# Arbeidsordre: fase 8 – Frister og årshjul

Lim inn teksten under streken som første melding i en ny samtale. Bakgrunnen står under arbeidsordren.

*Status 07.10.2026:* Fase 7b (Nyheter) er levert i 0.42.0. Denne arbeidsordren er klar til bruk.

---

Vi starter fase 8 i Jukselappen: **Frister og årshjul** (repo `larsarnenilssen/jukselappen`, appen på https://jukselappen.no). Skriv til meg på bokmål, kort og enkelt.

**Les først:**
- `AGENTS.md` (faste regler)
- `OPPDRAG.md` (fase 8 og «Gjelder alle faser»)
- `CHANGELOG.md` (siste versjoner)
- Denne filen, også bakgrunnen under arbeidsordren
- Avgjørelsene i `docs/avgjorelser/`:
  - om kalenderen, skoleruta og fylkenes datoer (059, 066)
  - om forsiden, sidekolonnen og panelet øverst (056, 068, 081)
  - om favoritter og ikoner (056, 058)
  - om startpakken og stiler som lastes med sidene (082, 083)
  - om nyhetene, som siste visning i panelet (084)
- `docs/arbeidsordrer/fase-7b-forslag.md`, runde 6: slik panelet ser ut nå
- `docs/KILDER-IKKE-MED.md`: kilder som ikke er med ennå, også datoene for fylkene

**Status:**
- Siste versjon er 0.42.0 (07.10.2026), med nyhetene i panelet og på egen side.
- Kalenderen (`#/kalender`, `src/modules/kalender/`) samler fristene fra manifestene (`frister()`), skoleruta fra fylkenes forskrifter (`data/skolerute/`), fylkenes datoer for inntak (`data/inntak/`) og vedtatte endringer i regelverket (`data/lovdata/kommende.json`). Den har filter på tema og hvem det gjelder, og viser de neste tolv månedene eller et skoleår.
- Panelet øverst på forsiden har tre visninger: Kalender, Nyheter og I tall (`src/app/Forsidepanel.tsx`). De deler oppsettet `panel-boks`, `panel-liste` og `panel-videre` og kroken `useTilpassetListe`, som skjuler det som ikke får plass.
- Startpakken skal holdes under 150 kB med god margin (`npm run build` sjekker det). Nye visninger lastes når de vises.

**Fasen (fra `OPPDRAG.md`):**
1. **Årshjul:** en visning som årshjul ved siden av listen i kalenderen, for skoleåret.
2. **Eksport til kalender (.ics):** lages i nettleseren fra postene i kalenderen, med filteret brukeren har valgt. Ingen eksterne kall.
3. **Dagens jukselapp:** ett faktum fra appen på forsiden, av fra start, som skrus av og på fra forsiden og under Innstillinger. Modulene bidrar med fakta gjennom en ny funksjon i manifestet (som `frister()`). Hvert faktum lenker dit det står og har kilden. Fylkes- og skoleinnhold bare når fylket eller skolen er valgt.

**Arbeidsmåte:**
- Først et forslag med mockup i appen, med skjermbilder på mobil og skrivebord, før noe bygges ferdig. Push til `test` etter hver designrunde.
- Legg fram for meg:
  - årshjulet: hvordan det ser ut på mobil og skrivebord, og hva som skjer når man trykker på en dato
  - eksporten: hvilke poster som tas med, og hvordan den står i kalenderen
  - dagens jukselapp: hvilke typer fakta som tas med, om bare kontrollert innhold skal vises (`kontrollert` satt), om den byttes hver dag, med en knapp eller begge, og hvor rubrikken og bryteren står (egen rubrikk eller en fjerde visning i panelet)
- Ingen ende-til-ende-tester før jeg har sagt at designet er ferdig.
- Versjons-PR når vi er enige.

---

## Bakgrunn

### Hva som er åpent etter fase 7b

- **Kilder som ikke er med:** `docs/KILDER-IKKE-MED.md`. For kalenderen gjelder særlig Vestland (eksamens- og inntaksdatoer), inntaksdatoene for Oslo, Innlandet og Nordland, og skoleruta for fylkene uten forskrift i Lovdata. Eier har ikke avgjort om skoleruta skal hentes fra fylkenes egne sider.
- **Nyhetene:** Trøndelag og Østfold fylkeskommune er ikke med (robots.txt og ingen svar). Prøvekildene prøves igjen fra Actions med `npm run nyheter:prove` (arbeidsflyten Nyheter, manuell kjøring).
- **Eiers kontroll:** Innholdet fra fase 7 og 7b venter på kontroll (`kontrollert: null`) og tas i kontrollrundene.

### Forslag til rekkefølge

1. Dagens jukselapp først, fordi den trenger mest avklaring (hvilke fakta) og en ny funksjon i alle manifestene.
2. Eksporten til .ics, som er liten og bygger på postene kalenderen alt har.
3. Årshjulet, som trenger mest design.

### Tekniske hensyn

- Ny funksjon i manifestet (f.eks. `fakta()`) må finnes i alle moduler. En test sjekker at alle manifestene har den, slik som for `favorittbare`.
- .ics lages som tekst i nettleseren og lastes ned med en `Blob`. Datoer uten fast dag (bare måned) tas ikke med, eller tas med som heldagshendelse den første. Det må eier avgjøre.
- Årshjulet bør være SVG, med en tekstliste ved siden av for skjermleser og tastatur (WCAG 2.1 AA).
- Nye tekster i `src/strings/` på bokmål og nynorsk. Farger bare i `tokens.css`.
