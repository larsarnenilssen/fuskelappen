# AGENTS.md

Varige arbeidsregler for alle agenter og utviklere i dette repoet. Aktivt oppdrag står i `OPPDRAG.md`. Arkitektur og innholdsmodell står i `docs/`.

## Prosjektet

Installerbar nettapp (PWA) for skoleledere og lærere i videregående: arbeidstid etter SFS 2213, fag og læreplaner, inntak, tilpasset opplæring og individuell tilrettelegging, vurdering, skolemiljø og frister. Statisk side på GitHub Pages. Ingen server, ingen innlogging, ingen personopplysninger.

## Kommandoer

| Kommando | Gjør |
|---|---|
| `npm ci` | installerer avhengigheter |
| `npm run dev` | starter utviklingsserver |
| `npm run build` | lager produksjonsbygg |
| `npm run lint` | lint |
| `npm run typecheck` | typesjekk |
| `npm test` | enhets-, innholds- og fasittester |
| `npm run test:e2e` | Playwright i WebKit og Chromium |
| `npm run kilder:sjekk` | kjører kildesjekken lokalt |
| `npm run hent:grep` | henter Grep-data og lager endringsrapport |

En endring er ikke ferdig før alle er grønne.

## Struktur

- `src/modules/<modul>/` – én mappe per modul, med manifest i `index.ts`
- `src/core/` – regelmotor, søk, lagring, i18n, kildestatus
- `src/components/` – felles komponenter (Forklaring, Veiviser …)
- `src/strings/` – alle UI-tekster (`nb.ts`, `nn.ts`)
- `src/styles/tokens.css` – alle farger og designverdier
- `src/config/app.ts` – appnavn og metadata
- `rules/` – regelsett som data, per regelverk og periode
- `content/` – innhold (YAML) og kilderegister (`kilder.yaml`)
- `data/` – genererte data fra kilder; endres bare av skript
- `tests/fasit/` – eiergodkjente eksempler

## Arbeidsmåte

- Følg fasene i `OPPDRAG.md`. Stopp ved hvert kontrollpunkt med en kort oppsummering: hva er bygget, hva må eier kontrollere, hva er åpent.
- Arbeid på en egen gren per fase eller oppgave, og slå sammen til `main` via PR med grønn CI.
- Sett aldri versjonstag uten eiers godkjenning.
- Oppdater `CHANGELOG.md` for alt brukeren merker.
- Tekniske valg av betydning dokumenteres i `docs/avgjorelser/NNN-tittel.md`: kontekst, valg og konsekvens, noen få linjer.
- Er noe faglig eller juridisk uklart: spør eier. Gjett aldri på hva en regel betyr.

## Kode

- TypeScript `strict`. Ingen `any` uten begrunnet kommentar.
- Beregninger er rene funksjoner i `src/modules/<modul>/beregning/`, uten avhengighet til grensesnittet, og har tester.
- Ingen tariff- eller lovverdier i koden. Slike verdier leses fra `rules/` via `hentVerdi()`.
- Ingen UI-tekst utenfor `src/strings/` og `content/`. Ingen farger utenfor `tokens.css`.
- Domenebegreper beholdes på norsk i koden, uten æøå i identifikatorer (`arsramme`, `beskjeftigelse`, `planfestetTid`). Øvrig teknisk kode skrives på engelsk. Kommentarer og dokumentasjon skrives på bokmål.
- Nye avhengigheter krever avgjørelsesnotat.
- Appen gjør ingen kall til eksterne tjenester. All henting fra kilder skjer i skript og GitHub Actions.

## Innhold og kilder

- Alt innhold følger skjemaet i `docs/INNHOLDSMODELL.md` og har minst én kilde.
- Egne tekster skrives på både bokmål og nynorsk. Kildetekster (lov, forskrift, læreplan) gjengis uoversatt og merkes med målform.
- Nytt eller endret faglig eller juridisk innhold får alltid `kontrollert: null`. **Sett aldri `kontrollert` selv.** Det gjør bare eier, eller du etter eksplisitt beskjed fra eier, med dato.
- **Endre aldri fasittester** uten eiers godkjenning. Feiler en fasittest, er det koden eller regelsettet som skal undersøkes.
- Bruk gjeldende regelverk: opplæringslova og forskriften som gjelder fra 1.8.2024. Eldre materiale er bare bakgrunn.
- Lov- og forskriftstekst kan siteres. Partenes tolkninger, andres veiledninger og Visma-materiell kopieres ikke. Skriv med egne ord og lenk til kilden.
- Innhold og verdier har riktig `gyldighet` (nasjonal, fylke eller skole). Fylkes- og skoleinnhold vises bare når brukeren har valgt fylke eller skole.
- Data under NLOD (Udir, Lovdata) krediteres under «Om».
- Oppdater `godkjent_fingeravtrykk` i kilderegisteret bare etter beskjed fra eier.

## Personvern

- Ingen personopplysninger i repo, testdata, skjermbilder eller issues.
- All brukerdata lagres lokalt på enheten. Ingen informasjonskapsler eller analyse.

## Grensesnitt

- Ett scrollområde. Ingen horisontal overflyt i 320–430 px (testes).
- Native scroll og tilbakenavigasjon. Ingen egne sveipebevegelser for navigasjon.
- Pinch-zoom slås ikke av globalt.
- Forklaringer er skjult til brukeren åpner dem.
- WCAG 2.1 AA. Test i WebKit, ikke bare Chromium.

## Legge til noe nytt

- **Ny modul:** ny mappe i `src/modules/` med manifest, innhold i `content/<modul>/`, kilder i kilderegisteret, tester.
- **Ny regelperiode:** ny fil i `rules/<regelverk>/` og nye fasittester. Det skal ikke trengs kodeendringer.
- **Ny fylkes- eller skoleprofil:** innhold og verdier med riktig `gyldighet`, og tester for oppslag på det nivået.
