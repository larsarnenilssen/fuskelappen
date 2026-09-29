# Protokollen

Installerbar nettapp (PWA) for skoleledere og lærere i videregående opplæring. Den regner ut, forklarer og viser kildene for regelverket rundt lærerstillinger og skolens drift: arbeidstid etter SFS 2213, fag og læreplaner, inntak, tilpasset opplæring, vurdering, skolemiljø og frister.

Appen er en statisk side på GitHub Pages: **https://larsarnenilssen.github.io/protokollen/**. Den har ingen server, ingen innlogging og ingen sporing. All brukerdata lagres på enheten.

Appnavnet er definert i `src/config/app.ts` og hentes derfra til manifest og sidetittel.

## Kom i gang

Krever Node 22 (se `.nvmrc`).

| Kommando | Gjør |
|---|---|
| `npm ci` | installerer avhengigheter |
| `npm run dev` | starter utviklingsserver på http://localhost:5173/protokollen/ |
| `npm run build` | typesjekk, søkeindeks, produksjonsbygg og sjekk av startpakkens størrelse |
| `npm run lint` | lint |
| `npm run typecheck` | typesjekk |
| `npm test` | enhets-, innholds- og fasittester |
| `npm run test:e2e` | Playwright i WebKit og Chromium, mobil og skrivebord |
| `npm run kilder:sjekk` | kjører kildesjekken lokalt (issues sendes bare fra GitHub Actions) |
| `npm run kilder:dokumenter` | lager `docs/KILDER.md` fra kilderegisteret |
| `npm run lag:ikoner` | lager alle ikonstørrelser fra `ikon/ikon.svg` |
| `npm run hent:grep` | henter Grep-data (kommer i fase 2) |

## Dokumentasjon

- [AGENTS.md](AGENTS.md) – arbeidsregler for repoet
- [OPPDRAG.md](OPPDRAG.md) – aktivt oppdrag og faser
- [docs/EIER.md](docs/EIER.md) – veiledning for eier: publisering, kildevarsler, installering
- [docs/ARKITEKTUR.md](docs/ARKITEKTUR.md) – oppbygging, og hvordan man legger til modul, regelperiode og fylkes- eller skoleprofil
- [docs/INNHOLDSMODELL.md](docs/INNHOLDSMODELL.md) – innhold, regelsett og kilderegister
- [docs/KILDER.md](docs/KILDER.md) – kildene appen bygger på (generert)
- [docs/avgjorelser/](docs/avgjorelser/) – tekniske avgjørelser
- [CHANGELOG.md](CHANGELOG.md) – endringer per versjon

## Kilder og lisens

Appen inneholder data fra Utdanningsdirektoratet og Lovdata under Norsk lisens for offentlige data (NLOD) 2.0. Kildene gjelder alltid foran appen.
