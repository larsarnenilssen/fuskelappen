# Arbeidsordre: fase 9 – Lokale regler for fylke og skole

Lim inn teksten under streken som første melding i en ny samtale. Bakgrunnen står under arbeidsordren.

*Status 08.10.2026:* Skrevet etter at fase 8 ble levert i 0.43.0. Arbeidsordren er klar til bruk.

---

Vi starter fase 9 i Jukselappen: **Lokale regler for fylke og skole** (repo `larsarnenilssen/jukselappen`, appen på https://jukselappen.no). Skriv til meg på bokmål, kort og enkelt.

**Les først:**
- `AGENTS.md` (faste regler)
- `OPPDRAG.md`: fase 9, kapittel 3.3 om gyldighetsnivåene og «Gjelder alle faser»
- `CHANGELOG.md` (siste versjoner)
- Denne filen, også bakgrunnen under arbeidsordren
- `docs/INNHOLDSMODELL.md`: `gyldighet`, `forhold` (`erstatter` og `supplerer`) og `kontrollert`
- Avgjørelsene i `docs/avgjorelser/`:
  - om tilbakemelding på e-post, løsningen innmeldingen kan bygge på (064)
  - om godkjenning med `/godkjent` i en kontrollsak (021), kontrollspørsmål og kontrollrunder (019)
  - om fylkene, de lokale forskriftene og boksen «Hos fylkeskommunen» (061)
  - om regelsett i flere filer og tabeller (007), og om automatisk kontroll av regelverdier (017)
  - om nyhetene som publiseres hver dag uten PR (084), som mønster for en rask publisering
  - om privatskoler (075)
  - om brukserklæringen og merket «Kontrollert» (016)

**Status:**
- Siste versjon er 0.43.0 (08.10.2026), med dagens jukselapp i panelet øverst på forsiden (avgjørelse 086).
- Innhold og regelverdier har `gyldighet` (nasjonal, fylke eller skole), og oppslaget går skole → fylke → nasjonal (`hentVerdi` i `src/core/regler/`, `velgSynlige` i `src/core/innhold/status.ts`). Vestland har fylkesinnhold for inntak, eksamen og skoleregler, og alle fylkene har lokale forskrifter fra Lovdata.
- Fylke og skole velges under Innstillinger og lagres lokalt (`src/core/lagring/lagring.ts`, skjemaversjon 3).
- Tilbakemeldingen lager en ferdig e-post til appens adresse (avgjørelse 064). Appen sender ingenting selv.
- Startpakken er 122,8 kB (grense 150 kB). Nye sider og skjemaer lastes når de vises.

**Fasen (fra `OPPDRAG.md`):**
- **Legge inn:** Brukeren kan legge inn en lokal regel for fylket eller skolen sin, i tillegg til de nasjonale (`supplerer`) eller i stedet for en nasjonal verdi (`erstatter`). Regelen gjelder med en gang for brukeren selv, lagres bare på enheten og merkes tydelig som brukerens egen og ikke kontrollert.
- **Dato og dokumentasjon:** Regelen merkes med dato. Brukeren kan dokumentere den, f.eks. med lenke til kilden eller et vedlegg.
- **Melde inn:** Brukeren kan melde regelen inn. Eier får beskjed på e-post.
- **Godkjenne:** Eier kontrollerer regelen. Godkjent blir den fast innhold eller en fast verdi for fylket eller skolen, med kilde, dato og `kontrollert`, og vises for alle som har valgt fylket eller skolen. Brukerens egen kopi erstattes av den godkjente.

**Utgangspunkt (godtatt av eier 07.10.2026):** innmelding på e-post som tilbakemeldingen, datoene for innmelding, godkjenning og eventuelt fra og til, og plassen i Innstillinger ved valget av fylke og skole.

**Arbeidsmåte:**
- Først et forslag med mockup i appen, med skjermbilder på mobil og skrivebord, før noe bygges ferdig. Push til `test` etter hver designrunde.
- Legg fram for meg, med et råd for hvert punkt:
  - hvilke regler og verdier som kan legges inn i første omgang, og hvordan brukeren velger hva regelen gjelder (et kort, en verdi i regelsettet, et steg i en veiviser)
  - hvordan brukerens egne regler vises på sidene og i kalkulatorene, og hvordan de skilles fra godkjent innhold
  - e-post, GitHub-sak eller begge
  - hva som gjøres med dokumentasjon som har navn eller underskrifter, og med lokale avtaler som ikke er offentlige
  - når godkjente regler vises for andre: med neste versjon, eller med en egen, rask publisering
  - om datoene er nok
- Personvern: Ingen personopplysninger i repoet. Den innmeldte regelen skrives med egne ord, og navn og underskrifter tas ikke med.
- Lagringen får en ny skjemaversjon med migrering hvis brukerens egne regler ikke passer i et valgfritt felt.
- Nye avhengigheter (f.eks. til vedlegg) krever avgjørelsesnotat.
- Ingen ende-til-ende-tester før jeg har sagt at designet er ferdig.
- Versjons-PR når vi er enige.
- Når fasen er levert, skriver du arbeidsordren for fase 10 (`docs/arbeidsordrer/fase-10.md`) etter `OPPDRAG.md`, med de åpne punktene der.

---

## Bakgrunn

### Levert i fase 8 (0.43.0, 08.10.2026)

- **Dagens jukselapp** er en fjerde visning i panelet øverst på forsiden. Den er av fra start og slås på under «Tilpass» eller Innstillinger. Første besøk hver dag står panelet på jukselappen (avgjørelse 086).
- Modulene gir fakta gjennom `fakta()` i manifestet. Fakta med `gyldighet` for et fylke vises bare når fylket er valgt. Godkjente lokale regler fra fase 9 kan komme med i jukselappen av seg selv når de står i innholdet med riktig `gyldighet`.
- Velkomsten i fase 10 skal spørre om brukeren vil slå på dagens jukselapp (`OPPDRAG.md`, eier 08.10.2026).

### Åpent etter fase 8

- **Eiers kontroll:** Faktaene i jukselappen kommer fra innhold som ikke er kontrollert ennå (eier har sagt ja til å vise dem). Innholdet fra fase 7, 7b og 8 tas i kontrollrundene.
- **Utvalget av paragrafer** i jukselappen er kapittel 5, 10, 11, 12 og 13 i opplæringslova og kapittel 4, 9 og 10 i opplæringsforskrifta (`UTVALG` i `src/modules/lov/fakta.ts`). Eier kan be om flere eller færre.
- **Kilder som ikke er med:** `docs/KILDER-IKKE-MED.md`. Trøndelag og Østfold fylkeskommune er fortsatt ikke med i nyhetene.

### Tekniske hensyn

- Brukerens egne regler må passe inn i oppslaget skole → fylke → nasjonal, så kalkulatorene og sidene bruker dem uten egen kode per modul. Et mulig grep er et eget nivå for brukerens regler som slås opp før skolen, merket «din egen».
- Godkjente regler blir vanlig innhold i `content/` eller verdier i `rules/` med `gyldighet` for fylket eller skolen, med `kontrollert` satt av eier. Fylkes- og skoleinnhold vises bare når fylket eller skolen er valgt (AGENTS.md), og trenger tester for oppslag på det nivået.
- Innmeldingen må ha en fast form som Claude kan legge inn uten å tolke (regel, nivå, fylke eller skole, forhold, tekst, kilde og datoer).
- Repoet er offentlig. Alt som godkjennes, blir offentlig.
- Nye tekster i `src/strings/` på bokmål og nynorsk. Farger bare i `tokens.css`.
