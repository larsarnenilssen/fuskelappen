---
name: dependabot
description: Behandle PR-ene fra Dependabot i Jukselappen (oppdateringer av npm-pakker og GitHub Actions, én gang i måneden). Brukes når en Dependabot-PR er åpen, har konflikt i package-lock.json, feiler i CI, eller gjelder en ny hovedversjon.
---

# Dependabot

Avgjørelse 099. Oppsettet står i `.github/dependabot.yml`.

## Hva som kommer

- **Én gang i måneden**, med prefiksene `Avhengigheter:` (npm) og `Actions:`.
- **Grupperte PR-er** for minor og patch: `npm-utvikling`, `npm-produksjon` og `actions`.
- **Hver for seg:** nye hovedversjoner av npm-pakker, og `@playwright/test`. Høyst fire åpne for npm og to for Actions.
- **Ignorert:** hovedversjoner av `@types/node` (følger Node i `.nvmrc`, nå 24) og av `typescript` (TypeScript 7 venter til typescript-eslint støtter den). Tas en regel ut, endres `dependabot.yml` og avgjørelse 099 får en «Endret»-linje.

## Slik behandles de

1. **Grønn CI og ingen konflikter:** flett, som andre PR-er (eier 01.10.2026).
2. **`@playwright/test`:** bildet i `.github/workflows/ci.yml` (`mcr.microsoft.com/playwright:vX.Y.Z-noble`) må ha samme versjon (testet i `tests/unit/arbeidsflyter.test.ts`). Endre bildet i samme PR.
3. **Ny hovedversjon:** les endringene først. Rett det som må rettes i samme PR, og kjør `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` og `npm run test:e2e:berorte`. Endres noe brukerne merker, spør eier. Kan den ikke rettes nå, lukk PR-en med en kommentar om hvorfor. En ny avhengighet (ikke bare en ny versjon) krever avgjørelsesnotat.
4. **Konflikt i `package-lock.json`** (vanlig når en annen Dependabot-PR er flettet først): ta låsfilen fra `main` og la npm legge oppdateringen inn på nytt.

   ```sh
   git fetch origin main
   git checkout <dependabot-grenen>
   git merge origin/main            # konflikt i package-lock.json
   git checkout origin/main -- package-lock.json
   npm install                      # legger versjonene fra package.json inn i låsfilen
   npm ci && npm test
   git add package-lock.json && git commit --no-edit
   git push
   ```

   Er også `package.json` i konflikt, behold den høyeste versjonen av hver pakke. Dependabot rører ikke en PR etter at andre har pushet til den.
5. **CI feiler:** rett i samme PR hvis det er lite. Ellers lukk den med en kommentar, og si fra til eier.

## Når de når brukerne

Koden i appen bygges fra versjonstaggen. En oppdatering av en avhengighet når brukerne først med neste versjon (skillen `ny-versjon`). Actions og utviklingspakkene gjelder bare CI og byggingen. En sikkerhetsretting i en pakke som følger med appen (`dependencies` i `package.json`), kan gi en egen rask retting etter avtale med eier.
