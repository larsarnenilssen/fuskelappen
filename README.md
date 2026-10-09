# Jukselappen

Installerbar nettapp (PWA) for skoleledere og lærere i videregående opplæring. Den regner ut, forklarer og viser kildene for regelverket rundt lærerstillinger og skolens drift: arbeidstid etter SFS 2213, fag og læreplaner, inntak, tilpasset opplæring, vurdering, skolemiljø og frister.

Appen er en statisk side på GitHub Pages: **https://jukselappen.no/** (avgjørelse 065). Den gamle adressen på github.io sender videre dit. Den har ingen server, ingen innlogging og ingen sporing. All brukerdata lagres på enheten.

Appnavnet er definert i `src/config/app.ts` og hentes derfra til manifest og sidetittel.

## Kom i gang

Krever Node 24 (se `.nvmrc`).

| Kommando | Gjør |
|---|---|
| `npm ci` | installerer avhengigheter |
| `npm run dev` | starter utviklingsserver på http://localhost:5173/jukselappen/ |
| `npm run build` | typesjekk, søkeindeks, produksjonsbygg og sjekk av startpakkens størrelse |
| `npm run lint` | lint |
| `npm run typecheck` | typesjekk |
| `npm test` | enhets-, innholds- og fasittester |
| `npm run test:e2e` | Playwright i WebKit og Chromium, mobil og skrivebord (kjøres i CI) |
| `npm run test:e2e:berorte` | bare de berørte ende-til-ende-testene, i WebKit mobil |
| `npm run kilder:sjekk` | kjører kildesjekken lokalt (issues sendes bare fra GitHub Actions) |
| `npm run kilder:dokumenter` | lager `docs/KILDER.md` fra kilderegisteret |
| `npm run lag:ikoner` | lager alle ikonstørrelser fra `ikon/ikon.svg` |
| `npm run hent:grep` | henter Grep-data og lager endringsrapport |
| `npm run avgjorelser` | lager oversikten over avgjørelsene i `docs/avgjorelser/README.md` |

## Dokumentasjon

- [AGENTS.md](AGENTS.md) – arbeidsregler for repoet, og skills for driftsoppgavene (`.claude/skills/`)
- [DRIFT.md](DRIFT.md) – hvordan appen holdes ved like: faste jobber, endringer, versjoner og åpne punkter
- [docs/EIER.md](docs/EIER.md) – veiledning for eier: publisering, kildevarsler, installering
- [docs/ARKITEKTUR.md](docs/ARKITEKTUR.md) – oppbygging, og hvordan man legger til modul, regelperiode og fylkes- eller skoleprofil
- [docs/INNHOLDSMODELL.md](docs/INNHOLDSMODELL.md) – innhold, regelsett og kilderegister
- [docs/KILDER.md](docs/KILDER.md) – kildene appen bygger på (generert)
- [docs/avgjorelser/](docs/avgjorelser/README.md) – avgjørelsene, med oversikt over hva som fortsatt gjelder
- [docs/arkiv/](docs/arkiv/README.md) – oppdraget og arbeidsordrene fra byggingen (fase 0–10)
- [CHANGELOG.md](CHANGELOG.md) – endringer per versjon

## Kjente begrensninger

Feil og mangler eier har valgt å vente med. Hver har en linje i tabellen over åpne punkter i [DRIFT.md](DRIFT.md).

- **Fordelingstabellen i Arbeidsplan ved stor skrift:** Med skriftstørrelse på 150 % eller mer blir tabellen bredere enn skjermen, og siden må rulles sidelengs. Med vanlig skriftstørrelse er det ingen overflyt i 320–430 px (testet). Eier 30.09.2026: venter.

## Kilder og lisens

Appen inneholder data fra Utdanningsdirektoratet og Lovdata under Norsk lisens for offentlige data (NLOD) 2.0. Kildene gjelder alltid foran appen.
