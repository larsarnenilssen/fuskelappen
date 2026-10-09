# Drift – Jukselappen

Fase 0–10 er levert, og appen er i drift fra 09.10.2026 (avgjørelse 105). Dette dokumentet sier hvordan den holdes ved like. De varige reglene står i [AGENTS.md](AGENTS.md), eiers veiledning i [docs/EIER.md](docs/EIER.md), og oppdraget med fasene og arbeidsordrene i [docs/arkiv/](docs/arkiv/README.md).

## Hva appen er, og ikke er

- **Ikke en juridisk fasit.** Den forklarer regelverket og viser kildene, og sier tydelig at kildene gjelder foran appen.
- **Ikke et arbeidsplanverktøy.** Arbeidsplan er illustrasjon, læringsverktøy og kalkulator. Ekte arbeidsplaner lages i skolens egne systemer.
- **Ikke et register.** Ingen personopplysninger, ingen innlogging, ingen server, ingen sporing.
- **Ikke KI-drevet i bruk.** Alle tekster er skrevet på forhånd, og eier kontrollerer dem etter hvert. Ingen språkmodell kalles fra appen.

## Faste jobber

Jobbene går av seg selv i GitHub Actions. Eier får e-post bare når noe har gått galt eller bør ses på (avgjørelse 085, `docs/EIER.md` punkt 6b).

| Jobb | Når | Hva den gjør | Sak (etikett) |
|---|---|---|---|
| **Kildesjekk** (`kilder.yml`) | Mandag 04.17 UTC, og 2. januar, juli og august (avgjørelse 063) | Sjekker kildene og lenkene, henter dataene (Grep, skoleregisteret, lov- og forskriftsteksten, datoene, statistikken og de andre), tester dem og lagrer dem på `main`. Lager kontrollsaken, `docs/KONTROLL.md` og endringsforslag som PR, og publiserer appen på nytt. | `kontroll`, `lenker` |
| **Lovteksten fra Lovdata** | Med kildesjekken | Publiseres fra `main` uten ny versjon (avgjørelse 098), så den er ute innen et døgn etter 1. januar, 1. juli og 1. august. Lovdata kan bare nås fra Actions, ikke fra skymiljøet. | `kontroll` |
| **Nyheter** (`nyheter.yml`) | Hver time | Henter nyhetene til grenen `nyheter` og publiserer når sakene er endret (avgjørelse 084 og 098). Sjekker også at jukselappen.no svarer (avgjørelse 099). | `nyheter`, `feil` |
| **Kontrollrundene** | Første mandag i mai og august | Praksis og tolkninger som skal bekreftes, innhold som bør kontrolleres på nytt, lenkene til Vilbli og særavtalesiden hos KS, som sjekkes for hånd (avgjørelse 019). Mai har også påminnelsen om inntaksdatoene. | `kontrollrunde` |
| **Godkjenning** (`godkjenning.yml`) | Når eier skriver `/godkjent` i en kontrollsak | Setter datoen for det eier har krysset av (avgjørelse 021). | – |
| **Lokale regler** (`lokale-regler.yml`) | Når en PR som endrer `lokale/regler.yaml`, er flettet | Publiserer uten ny versjon (avgjørelse 093). | – |
| **Dependabot** (`.github/dependabot.yml`) | Én gang i måneden | Grupperte PR-er for npm og Actions (avgjørelse 099). Se skillen `dependabot`. | – |
| **Varsle eier** (`varsle.yml`) | Når en av jobbene over, publiseringen eller CI på `main` feiler | Lager eller oppdaterer saken for arbeidsflyten, og lukker den når det går bra igjen. | `feil` |
| **Ukentlig kontroll og kvartalsrunde for fylkeslenkene** | Kommer | Bygges i en egen pakke. | – |

Kildesjekken committer statusfilen hver mandag, også når ingenting er endret. Det holder de planlagte jobbene i live: GitHub slår dem av i offentlige repoer etter 60 dager uten aktivitet.

Er en sak uklar, gir eier Claude lenken. En kilde som ser ut til å ha endret format, går ikke over av seg selv og rettes med en gang (avgjørelse 099).

## Slik går en endring

1. **Ny økt per oppgave.** Økten ser ikke tidligere samtaler. Det som er avtalt, står i AGENTS.md, i dette dokumentet, i avgjørelsene og i skillene.
2. **Egen gren fra `main`** (`claude/<navn>`). Hold PR-ene små. Boten lagrer data på `main` hver uke, så flett inn `main` når grenen er bak.
3. **Før PR:** `npm run lint`, `npm run typecheck`, `npm test` og `npm run test:e2e:berorte`. Kjør `npm run build` når startpakken kan ha vokst. Hele ende-til-ende-suiten kjøres i CI (avgjørelse 055).
4. **CHANGELOG** under `## [Unreleased]` for alt brukerne merker. Et valg av betydning får et notat i `docs/avgjorelser/`, og `npm run avgjorelser` oppdaterer oversikten.
5. **PR → grønn CI → Claude fletter** på eiers vegne når det ikke er konflikter (eier 01.10.2026). Er CI rød, rettes feilen først. CI velger nivå etter filene som er endret (avgjørelse 067), og kjører alt på `main` etter fletting.
6. **Faglig eller juridisk uklart:** spør eier. Nytt innhold får `kontrollert: null` og kontrollspørsmål.

## Testversjon

Eier kan prøve en gren på `https://jukselappen.no/test/` før en versjon avtales: `git push origin <gren>:test --force` (avgjørelse 045). Testversjonen tas ned, og grenen `test` slettes, hver gang en versjon publiseres (avgjørelse 095). Se skillen `testversjon`.

## Ny versjon

En versjon publiseres bare når eier og Claude er enige om at den skal ut, og om nummeret (SemVer).

1. **Versjons-PR:** versjonen i `package.json` og `package-lock.json`, overskriften `## [x.y.z] – åååå-mm-dd` under `## [Unreleased]` i `CHANGELOG.md`, og 1–4 korte punkter på bokmål og nynorsk i `content/versjoner.yaml` til meldingen om ny versjon (avgjørelse 088).
2. **Flett** når CI er grønn. «Sett versjonstag» lager taggen og utgivelsen og starter «Publiser» (avgjørelse 029).
3. **Følg publiseringen** til røyktesten er grønn (avgjørelse 099), og si fra til eier. Testversjonen og grenen `test` tas ned av seg selv.
4. **Tilbakerulling:** Actions → Publiser → Run workflow med forrige tag.

Se skillen `ny-versjon`.

## Versjonstakt (forslag til eier)

*Forslag fra Claude 09.10.2026. Ikke bestemt av eier.* Fra 0.1.0 til 1.2.0 kom det 70 versjoner på 11 dager. Hver versjon gir brukerne meldingen «Ny versjon er klar».

- **En versjon når det er noe brukerne merker**, typisk høyst én i måneden. Endringer samles på `main` og prøves på `test/` i mellomtiden.
- **Raske rettinger** (x.y.Z) når som helst ved feil brukerne merker.
- **Uten ny versjon:** lovtekst, data fra kildene, nyheter og lokale regler kommer ut av seg selv.
- **Avhengigheter** fra Dependabot når brukerne med neste versjon. En sikkerhetsretting som gjelder appen i nettleseren, kan gi en egen rask retting.

## Årshjul

| Når | Hva |
|---|---|
| 2. januar, 2. juli og 2. august | Ekstra kildesjekk etter de vanligste datoene for nye lover og forskrifter. |
| Første mandag i mai | Kontrollrunde (hovedtariffavtalen endres), og påminnelse om inntaksdatoene. |
| Første mandag i august | Kontrollrunde før skoleåret. |
| Hvert år | Innhold med status `bor_kontrolleres` (kontrollert for mer enn 12 måneder siden) gjennomgås. Hele registeret over lokale forskrifter sjekkes én gang i året (avgjørelse 063). |
| Før 30.04.2028 | Ny hovedtariffavtale: ny fil i `rules/hta/` (nå `2026-2028.yaml`). |
| Før 31.12.2027 | SFS 2213 reforhandles før hovedoppgjøret i 2028: nye filer for perioden i `rules/sfs2213/` side om side med de gamle, og nye fasittester som eier godkjenner. Ingen kodeendring. Et endringsforslag fra kildesjekken som gjelder en ny periode, flettes ikke. |

## Grenser

| Område | Grense |
|---|---|
| Startpakke | Høyst 150 kB gzip, data ikke medregnet. `npm run build` stopper når den er større (`scripts/sjekk-storrelse.ts`). |
| Ytelse | Forsiden interaktiv under 2 s på en mellomklassemobil over 4G. |
| Nettlesere | Safari (iOS) og Chrome (Android), de to siste hovedversjonene, og oppdaterte skrivebordsnettlesere. |
| Tilgjengelighet | WCAG 2.1 AA, testet i WebKit og Chromium. |
| Nett | Appen henter bare egne statiske filer. All henting fra kilder skjer i skript og GitHub Actions. |
| Avhengigheter | Nye avhengigheter og tunge diagrambibliotek krever et avgjørelsesnotat. |
| Versjoner | SemVer. Publisering med tag `vX.Y.Z`. CHANGELOG etter Keep a Changelog. |

## Åpne punkter

Punkter eier har valgt å vente med, eller som venter på andre. Avklarte punkter står i `docs/arkiv/OPPDRAG.md` kapittel 7.

| Punkt | Status |
|---|---|
| Eiers kontroll av regelverdier og tekster (`kontrollert`) | Venter, etter eiers ønske. Målet i oppdraget var at alt er kontrollert. Det tas i kontrollrundene og med `/godkjent`. |
| Kontrollpunktene for fasene | Tas i kontrollrundene. For fase 9 gjenstår kontrollpunktet for eier: legge inn, melde inn og godkjenne en regel for en skole og se at den vises for andre. |
| Overtid for deltidsansatte (merarbeid under 100 %) | Praksis til dommen er rettskraftig (eier 30.09.2026): beskjeftigelse over stillingen og opp til 100 % gir variabel lønn med vanlig timelønn, og bare beskjeftigelse over 100 % gir overtid. |
| Fordelingstabellen i Arbeidsplan går utenfor skjermen ved skriftstørrelse på 150 % eller mer (kjent begrensning, README) | Venter, etter eiers ønske (30.09.2026). |
| Poengberegning ved inntak i Vestland | Venter. Spørsmålene om inntaksområdepoeng og klagenemnd står åpne. |
| Gjennomføring per fylke fra kullet som startet i 2020 | Venter på at Udir legger ut kullet. Appen regner om de eldre kullene (avgjørelse 080). |
| KS og KF Infoserie | Hentes ikke (robots.txt og abonnement, eier 07.10.2026). Særavtalesiden sjekkes for hånd i kontrollrundene, og Utdanningsforbundets gjengivelse av SFS 2213 hver uke (`docs/KILDER-IKKE-MED.md`). |
| Reklamefilm (fase 11) | Ikke startet. Arbeidsordren står i `docs/arkiv/arbeidsordrer/fase-11.md`. Tas som et eget lite oppdrag når eier vil. |

## Hvor ting står

| Oppgave | Les |
|---|---|
| Regler for kode, innhold, kilder og grensesnitt | [AGENTS.md](AGENTS.md) |
| Oppskrifter: ny versjon, testversjon, ny kilde, lokal regel, Dependabot | `.claude/skills/` |
| Oppbygging, ny modul, ny regelperiode, ny fylkes- eller skoleprofil | [docs/ARKITEKTUR.md](docs/ARKITEKTUR.md) |
| Innhold, regelsett og kilderegister | [docs/INNHOLDSMODELL.md](docs/INNHOLDSMODELL.md) |
| Utseende | [docs/DESIGN.md](docs/DESIGN.md) |
| Avgjørelsene og hva som fortsatt gjelder | [docs/avgjorelser/README.md](docs/avgjorelser/README.md) |
| Kildene, og kildene som ikke er med | [docs/KILDER.md](docs/KILDER.md), [docs/KILDER-IKKE-MED.md](docs/KILDER-IKKE-MED.md) |
| Eiers veiledning og beredskap | [docs/EIER.md](docs/EIER.md) |
