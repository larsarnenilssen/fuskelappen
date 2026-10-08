# OPPDRAG – Jukselappen

**Versjon:** 1.6 · 08.10.2026 (1.0 → 1.1: appnavn bestemt, utviklingsmiljø lagt til. 1.1 → 1.2: Arbeidsplan bygd i fase 1, kalkulatorene for fordeling og planfestet tid slått sammen med den, fase 3 justert. 1.2 → 1.3: fase 2 uten InSchool-data. 1.3 → 1.4 (01.10.2026): videre arbeid i fase 2 etter eiers innspill, ny forside. 1.4 → 1.5 (07.10.2026): fase 8 bare dagens jukselapp, fase 9 lokale regler som meldes inn og godkjennes, nye faser 10 (velkomst) og 11 (reklamefilm). 1.5 → 1.6 (08.10.2026): fase 8 levert, og velkomsten i fase 10 spør om dagens jukselapp)
**Eier:** Lars Arne
**Utfører:** Claude
**Status:** Plan godkjent, klar for fase 0

> Appen heter *Jukselappen* (eier 04.10.2026, avgjørelse 058), også som kortnavn på hjemskjermen. Før het den *Fuskelappen* (0.17.0, avgjørelse 034) og *Protokollen*. Adressen, repoet og lagringsnøkkelen har også fått det nye navnet. Navnet defineres ett sted (`src/config/app.ts`) og hentes derfra til manifest, sidetittel og README.

---

## 0. Slik brukes dette dokumentet

- Dette dokumentet beskriver **hva** som skal bygges. [AGENTS.md](AGENTS.md) beskriver **hvordan** det skal arbeides i repoet, og gjelder også etter at dette oppdraget er fullført.
- Arbeidet gjøres **fase for fase**. Hver fase avsluttes med et kontrollpunkt. Neste fase startes ikke før eier har godkjent.
- Faglige og juridiske uklarheter avklares med eier. Ikke gjett. Tekniske valg innenfor rammene i kapittel 2 tas av utfører og dokumenteres kort i `docs/avgjorelser/`.
- Ved motstrid mellom dette dokumentet og AGENTS.md: spør eier.
- Når oppdraget er fullført, flyttes filen til `docs/oppdrag/OPPDRAG-v1.md`.

## 1. Formål, brukere og avgrensning

### 1.1 Formål

En installerbar nettapp for skoleledere og lærere i videregående opplæring som gjør det enklere å regne ut, forstå og forklare regelverket rundt lærerstillinger og skolens drift:

- arbeidstid etter SFS 2213: beskjeftigelse, planfestet arbeidstid, periode og vikar, med forklaringer
- oppslag i fag og læreplaner (Grep)
- inntak til videregående
- tilpasset opplæring og individuell tilrettelegging, særskilt språkopplæring
- vurdering, fravær og eksamen
- skolemiljø og skoleregler
- frister og datoer i en samlet kalender

Forklaringene skal kunne brukes direkte i samtaler med lærere, og er derfor skjult til brukeren åpner dem.

### 1.2 Brukere

Eier og en gradvis voksende krets han deler appen med. Først og fremst skoleledere, dernest lærere, i første omgang i Vestland. Brukeren kan velge fylke og skole, la være, eller bytte.

### 1.3 Avgrensning

Appen er ikke:

- **en juridisk fasit.** Den forklarer regelverket og viser kildene, og sier tydelig at kildene gjelder foran appen.
- **et arbeidsplanverktøy.** Arbeidsplanfunksjonen er illustrasjon, læringsverktøy og kalkulator. Ekte arbeidsplaner lages i skolens egne systemer.
- **et register.** Ingen personopplysninger, ingen innlogging, ingen server, ingen sporing.
- **KI-drevet i bruk.** Alle tekster er skrevet og kontrollert på forhånd. Ingen språkmodell kalles fra appen.

## 2. Faste rammer

| Område | Beslutning |
|---|---|
| Publisering | GitHub Pages fra offentlig repo. GitHub Actions for test, bygg, publisering og kildejobber. |
| Utvikling | Claude Code i skyøkter, én økt per fase eller større oppgave. Skymiljøet har egendefinert nettilgang til kildene (Udir, Lovdata, KS, VLFK) og til nedlasting av Playwright-nettlesere. Kodeøktene ser ikke planleggingssamtalen; alt som er avtalt, står i dette dokumentet og i AGENTS.md. |
| Kode | TypeScript (`strict`), Vite, Preact. |
| Ruting | Hash-ruting (`#/…`), robust på Pages og i installert modus. |
| Tester | Vitest (enhet, innhold, fasit), Playwright (WebKit og Chromium, mobil og skrivebord), axe-core. |
| Søk | MiniSearch eller tilsvarende. Indeks bygges ved publisering. |
| PWA | vite-plugin-pwa (Workbox) med varsel om ny versjon. |
| Lagring | `localStorage` via egen lagringsmodul med skjemaversjon og feilhåndtering. |
| Grafikk | Egne SVG-komponenter. Tunge diagrambibliotek krever avgjørelsesnotat. |
| Målform | Bokmål og nynorsk med bryter. Kildetekster oversettes ikke. |
| Tema | Lys, mørk eller følg systemet. |
| Tilgjengelighet | WCAG 2.1 AA. |
| Nettlesere | Safari (iOS) og Chrome (Android), to siste hovedversjoner. Oppdaterte skrivebordsnettlesere. |
| Versjonering | SemVer. Publisering ved tag `vX.Y.Z`. CHANGELOG etter Keep a Changelog. |
| Ytelse | Forsiden interaktiv under 2 s på mellomklassemobil over 4G. Startpakke ≤ 150 kB gzip, data ikke medregnet. |

Nye avhengigheter utover disse krever avgjørelsesnotat.

## 3. Arkitektur

### 3.1 Mappestruktur (utgangspunkt)

```
/
├── AGENTS.md  CLAUDE.md  README.md  CHANGELOG.md  OPPDRAG.md
├── docs/
│   ├── ARKITEKTUR.md  INNHOLDSMODELL.md  KILDER.md (generert)
│   ├── avgjorelser/          korte beslutningsnotater (NNN-tittel.md)
│   └── oppdrag/              arkiverte oppdrag
├── content/                  redigerbart innhold (YAML), per modul
│   ├── kilder.yaml           kilderegister
│   ├── begreper/
│   └── <modul>/
├── rules/                    regelsett som data
│   └── sfs2213/
│       ├── 2026-2027.yaml
│       ├── arsrammer-2026-2027.yaml
│       └── kobling-fagkode-2026-2027.yaml
├── data/                     genererte data, sjekkes inn
│   ├── grep/
│   └── status/kildestatus.json
├── scripts/                  henting, validering, generering
├── src/
│   ├── config/app.ts         appnavn, kortnavn, beskrivelse
│   ├── app/                  skall, ruting, innstillinger, forside
│   ├── core/                 regelmotor, lagring, søk, i18n, kildestatus
│   ├── components/           Forklaring, Veiviser, Tallfelt, Diagram …
│   ├── modules/<modul>/      manifest, sider, beregninger
│   ├── strings/              nb.ts, nn.ts
│   └── styles/               tokens.css (palett), tema.css, base.css
├── tests/
│   ├── unit/  content/  e2e/
│   └── fasit/                eiergodkjente eksempler
└── .github/workflows/        ci.yml, deploy.yml, kilder.yml
```

### 3.2 Modulregister

Hver modul eksporterer et manifest fra `src/modules/<modul>/index.ts`:

- `id`, `navn` (nb/nn), `ikon`, `kategori`
- `ruter`
- `sokeoppforinger()` – det modulen bidrar med til samlet søk
- `favorittbare` – funksjoner, fag, begreper osv. som kan favorittmerkes
- `frister()` – frister modulen eier (samles i kalenderen, avgjørelse 066)
- `fakta()` – fakta til dagens jukselapp (fra fase 8)
- `kilder` – kilde-id-er modulen bygger på
- `status` – `aktiv` eller `skjult` (moduler fra senere faser er skjult til de er godkjent)

Forsiden, søket og favorittene bygges fra registeret. En ny modul skal kunne legges til uten endringer i forsidekoden.

### 3.3 Gyldighetsnivåer: nasjonal, fylke og skole

Lokale variasjoner kan komme fra både fylke og skole: lokale arbeidstidsavtaler, skuleregler og lokale rutiner. Alt innhold og alle regelverdier har derfor et nivå:

- `nasjonal`
- `fylke` (med fylkes-id)
- `skole` (med skole-id)

To typer forhold mellom nivåene:

- **erstatter** – en lokal verdi gjelder i stedet for en mer generell, f.eks. lokalt avtalt lengde på arbeidsåret eller endret årsramme. Rekkefølge ved oppslag: skole → fylke → nasjonal.
- **supplerer** – en lokal regel gjelder i tillegg, f.eks. skolens egne regler innenfor fylkets skulereglar. Vises samlet, gruppert etter nivå.

Hvert oppslag returnerer `{ verdi, niva, kilde }`. Grensesnittet viser tydelig når en ikke-nasjonal verdi er brukt.

Innstillinger: fylke (valgfritt) og skole (valgfritt, forutsetter fylke). Skolelisten hentes fra Udirs Nasjonalt skoleregister hvis det lar seg gjøre i kildejobben, ellers fritekst. Uten valgt fylke vises bare nasjonalt innhold, med merknad om at lokale regler kan gjelde.

Datamodell, oppslagslogikk og tester for nivåene lages i fase 0–1. Grensesnitt for å legge inn og melde inn lokale regler, som eier godkjenner, kommer i fase 9.

### 3.4 Regelsett

Tariff- og lovavhengige verdier ligger i versjonerte filer per periode, aldri i koden.

```yaml
# rules/sfs2213/2026-2027.yaml
id: sfs2213-2026-2027
gyldig_fra: 2026-01-01
gyldig_til: 2027-12-31
kilde: sfs2213
verdier:
  arsverk_timer:
    verdi: 1687.5
    enhet: timer
    kilde: { id: sfs2213, punkt: "4" }
    kontrollert: null        # settes av eier
```

- Flere perioder kan ligge side om side. Perioden velges etter dato, og brukeren kan velge en annen.
- SFS 2213 er videreført uendret for 1.1.2026–31.12.2027 og skal reforhandles før hovedoppgjøret i 2028. Å legge inn neste periode skal være rutine: ny fil, nye fasittester, ingen kodeendring.
- All lesing går gjennom én funksjon, `hentVerdi(nokkel, kontekst)`, som velger periode og nivå.
- Verdier med `kontrollert: null` vises med merket «ikke kontrollert». *(Endret 30.09.2026: merket er erstattet av en brukserklæring, se avgjørelse 016.)*

### 3.5 Innholdsmodell

Innhold ligger som YAML under `content/`, med Markdown tillatt i tekstfelt. Felles felter:

| Felt | Innhold |
|---|---|
| `id`, `type` | begrep, regel, forklaring, steg, frist, kildeomtale |
| `tittel`, `tekst` | `nb` og `nn`, begge påkrevd |
| `kildetekst` | valgfritt sitat fra kilden: `{ spraak, tekst }`, uoversatt |
| `gyldighet` | `{ niva, fylke?, skole?, forhold? }` |
| `kilder` | liste med `{ id, punkt?, url? }`, minst én |
| `kontrollert` | `{ dato }` eller `null` |
| `stikkord`, `relatert` | for søk og kryssreferanser |

Status beregnes automatisk:

- `utkast` – ikke kontrollert
- `kontrollert`
- `kilde_endret` – kilden er endret etter kontroll
- `bor_kontrolleres` – kontrollert for mer enn 12 måneder siden

Frister har i tillegg `dato` eller `regel` (f.eks. «1. mars hvert år»), `modul` og `malgruppe`.

Skjemaet defineres med zod og valideres i testene.

### 3.6 Målform og tekster

- UI-strenger ligger i `src/strings/nb.ts` og `nn.ts`. `nn` er typet mot `nb`, slik at en manglende nøkkel gir byggefeil.
- Egne tekster finnes alltid i begge målformer. Utfører skriver begge, eier kontrollerer.
- Kildetekster (lov, forskrift, læreplan) vises i originalform, merket med målform, og oversettes aldri.
- Søket normaliserer mellom målformene med en synonymliste (skole/skule, fravær/fråvær, lærer/lærar, opplæringsloven/opplæringslova …) og tåler skrivefeil.

### 3.7 Forside, søk og favoritter

- Forsiden har samlet søkefelt øverst, deretter favoritter og moduler gruppert under overskrifter.
- *(Endret 01.10.2026, eier:)* Hver overskrift har én til tre hovedbokser og eventuelt én sammenleggbar boks med resten. Under «Arbeidstid» står Arbeidsplan som egen boks og de andre kalkulatorene i den sammenleggbare boksen. Egen overskrift for hurtigkalkulatorer og mellomsiden for arbeidstid tas bort, og gamle adresser sendes videre.
- *(Endret 04.10.2026, eier:)* Opplæringstilbud flyttes fra «Læreplanverket» til den nye overskriften «Inntak og opplæringstilbud», sammen med Inntak. Læreplanverket har da bare Overordnet del og Fag og læreplaner. Når alle fasene er levert, er overskriftene og modulene etter planen:
  - **Arbeidstid:** Arbeidsplan og kalkulatorene.
  - **Læreplanverket:** Overordnet del, Fag og læreplaner.
  - **Inntak og opplæringstilbud:** Inntak, Opplæringstilbud.
  - **Elever og opplæring:** Tilrettelegging, Vurdering (fase 6, med fravær, eksamen og klage).
  - **Skolemiljø:** Aktivitetsplikt og skoleregler (fase 7, før «Skolemiljø») og Elevundersøkelsen. *(Eier 08.10.2026:)* Elevundersøkelsen er egen modul, og modulen Skolemiljø har fått et navn som ikke er det samme som kategorien (avgjørelse 087).
  - **Oppslag:** Begreper, Regelverk, Fylkene. *(Fase 6, pakke 5, eier 05.10.2026:)* Kalenderen sto her, og forsiden hadde gruppen «Neste datoer» (avgjørelse 066). *(Eier 07.10.2026:)* Kalender og Nyheter står ikke lenger under «Oppslag», men i panelet øverst.
  - *(Eier 07.10.2026:)* Øverst på forsiden (i sidekolonnen på stor skjerm) er et panel med Kalender, Nyheter og Videregående i tall som alternative visninger. Valgene står i overskriften, og brukeren velger visningene under «Tilpass» (avgjørelse 081). Videregående i tall står ikke under «Oppslag». *(Eier 08.10.2026:)* Dagens jukselapp er en fjerde visning i panelet når brukeren har slått den på (avgjørelse 086).
  - Lokale regler (fase 9) legges inn og meldes inn fra Innstillinger, ved valget av fylke og skole.
- Oppsettet skal tåle mange moduler. Forsiden bygges fortsatt bare fra modulregisteret.
- Søket treffer moduler, funksjoner, begreper, regler og fag (navn og kode). Kompetansemål ligger i en egen indeks som lastes første gang et søk trenger den.
- Favoritter: funksjoner, fag og begreper. Lagres lokalt og kan sorteres.

### 3.8 Lagring og personvern

- All brukerdata ligger lokalt på enheten: innstillinger, favoritter, scenarier og (fra fase 9) egne lokale regler til de er godkjent. Godkjente regler blir vanlig innhold i appen.
- Eksport og import som JSON-fil.
- Ingen informasjonskapsler, analyseverktøy eller kall til eksterne tjenester fra appen. Appen henter bare egne statiske filer.
- Ingen personopplysninger i repoet. Testdata anonymiseres.

### 3.9 Kilder, oppdatering og varsling

Kilderegisteret ligger i `content/kilder.yaml`, og `docs/KILDER.md` genereres fra det. Hver kilde har `id`, `navn`, `utgiver`, `url`, `type`, `niva`, `lisens`, `sjekkmetode` og `godkjent_fingeravtrykk`.

Tre oppdateringsnivåer:

1. **Grep (strukturerte data):** hentes automatisk, valideres, lagres som snapshot i `data/grep/` og publiseres. Feiler henting eller validering, beholdes forrige snapshot og status settes til `feilet`. En endringsrapport (nye, fjernede og endrede fagkoder) følger med.
2. **Lover og sentrale forskrifter:** hentes fra Lovdatas gratis datasett (NLOD 2.0). Relevante bestemmelser trekkes ut, normaliseres og får et fingeravtrykk. Endring gir status `endret`. Innholdet i appen overskrives aldri automatisk.
3. **Øvrige kilder** (lokale forskrifter på Lovdata, SFS 2213 og hovedtariffavtalen hos KS, Udir-veilederen, sider på vlfk.no): siden hentes, og hovedinnholdet eller relevante metadata trekkes ut, normaliseres og sammenlignes med forrige fingeravtrykk. Hele HTML-en brukes ikke, for å unngå falske varsler. Lav frekvens, tydelig User-Agent og respekt for nettstedets vilkår.

Arbeidsflyten `kilder.yml` kjører ukentlig og kan startes manuelt. Den:

- skriver `data/status/kildestatus.json` med tidspunkt for kjøringen og status per kilde
- committer statusfilen ved hver kjøring, også når ingenting er endret. GitHub slår av planlagte jobber i offentlige repoer etter 60 dager uten aktivitet, og commiten holder jobben i live.
- oppretter eller oppdaterer én GitHub-issue per kilde (etikett `kilde`) ved endring eller feil, slik at eier får varsel
- *(Lagt til 30.09.2026, avgjørelse 017:)* sjekker at sitatet til hver regelverdi fortsatt står i kilden (`data/status/verdistatus.json`), og lager kontrolloversikten `docs/KONTROLL.md` på nytt
- *(Endret 30.09.2026, avgjørelse 018:)* samler alt eier bør se på, i én ukentlig kontrollsak i stedet for én sak per kilde, med endrede punkter, berørt innhold og avkrysningsliste. Vedlegg 1 og garantilønnen sjekkes rad for rad. Grep og skoleregisteret tas inn og publiseres automatisk når testene består (eier 30.09.2026)
- *(Lagt til 30.09.2026, avgjørelse 019 og 020:)* kontrollspørsmål til hver tekst, en liste over praksis og tolkninger, kontrollrunder i mai og august, endringsforslag som PR når et tall i en kilde er endret, og godkjenning med `/godkjent` i kontrollsaken (avgjørelse 021)

I appen:

- diskret indikator i topplinjen og en detaljside under «Om»
- statusene `ok`, `endret`, `feilet` og `utdatert` (siste kjøring eldre enn 14 dager, som også fanger en jobb som har stoppet)
- innhold knyttet til en endret kilde får en stille merknad

Et varsel lukkes når eier har gjennomgått endringen, innholdet er oppdatert ved behov og `godkjent_fingeravtrykk` er satt til ny verdi (av eier, eller av utfører etter eksplisitt beskjed).

Kreditering for NLOD-data (Udir, Lovdata) vises under «Om».

### 3.10 Appskall, gester og visning

- Manifest med navn fra `src/config/app.ts`, ikoner (inkludert maskable og apple-touch-icon), `display: standalone` og `theme-color` per tema.
- Ett scrollområde med fast topp og navigasjon. `overscroll-behavior`, safe-area-innfelt og `dvh`-høyder.
- Native scroll og operativsystemets egen tilbakenavigasjon via History API. Ingen egne sveipebevegelser for navigasjon.
- Ingen horisontal overflyt på noen side. Innholdet er festet til rammene, og scroll, sveip eller pinch skal aldri avdekke tomt område.
- Pinch-zoom slås ikke av globalt. Diagrammer som kan zoomes, håndterer pinch selv innenfor faste grenser.
- Forklaringer er skjult til brukeren åpner dem (knapp med `aria-expanded`) og kan inneholde SVG.
- Bevegelse respekterer `prefers-reduced-motion`.
- Farger ligger bare i `tokens.css`. Kontrast AA i begge tema.

### 3.11 Kvalitet og tester

- **Beregninger** er rene funksjoner med enhetstester.
- **Fasittester** (`tests/fasit/`): eiergodkjente eksempler med input, forventet svar og begrunnelse. Endres aldri uten eiers godkjenning.
- **Innholdstester**: skjema, begge målformer, minst én kilde, gyldige referanser mellom innholdselementer.
- **Ende-til-ende**: hovedflyten i hver modul, i WebKit og Chromium, i mobilbredder (320–430 px) og på skrivebord. Egen test for horisontal overflyt på alle ruter, og for bytte av tema og målform.
- **Tilgjengelighet**: axe på alle ruter, tastaturnavigasjon og fokushåndtering.
- `ci.yml` kjører lint, typesjekk, enhets-, innholds- og fasittester, bygg og ende-til-ende-tester på hver PR og hver push til `main`.

### 3.12 Publisering og versjoner

- `deploy.yml` bygger og publiserer til Pages når en tag `vX.Y.Z` pushes.
- Versjonsnummeret bygges inn fra `package.json` og vises under «Om».
- Service worker viser «Ny versjon er klar» med knapp for å oppdatere.
- Tilbakerulling: kjør publisering på forrige tag.
- Tagger settes etter godkjent kontrollpunkt.

## 4. Faser

### Gjelder alle faser

- Nye kilder legges i kilderegisteret og inn i kildejobben.
- Nytt innhold følger innholdsmodellen, i begge målformer, med status `utkast` til eier har kontrollert.
- Begrepsbanken utvides med modulens begreper. Frister registreres i felles format.
- Tester for alt nytt. CI grønn.
- CHANGELOG oppdateres.
- Fasen avsluttes med kontrollpunkt: utfører leverer en kort oppsummering (hva er bygget, hva må eier kontrollere, hva er åpent) og stopper.

### Fase 0 – Fundament

**Leveranser**

- Prosjektoppsett etter kapittel 2 og 3.1. `OPPDRAG.md`, `AGENTS.md` og `CLAUDE.md` (inneholder bare `@AGENTS.md`) ligger i repoet fra start. Fase 0 legger til `README.md`, `docs/ARKITEKTUR.md`, `docs/INNHOLDSMODELL.md` og første avgjørelsesnotater.
- CI, publisering og en kildejobb som skriver statusfil.
- PWA: manifest, ikon (plassholder til ikonet er godkjent), offline for appskall og sist besøkte innhold.
- Appskall etter 3.10, tema, palett og målformbryter.
- Modulregister, forside, samlet søk og favoritter.
- Innstillinger: målform, tema, fylke og skole.
- Innholdsmodell med zod-skjema, regelmotor med nivåer (uten regelsett ennå), lagringsmodul med eksport og import.
- Komponenter: Forklaring (skjult til åpnet), tallfelt, resultatkort med «vis utregning».
- Kildestatus i appen, og «Om» med versjon, kilder, kreditering og ansvarsfraskrivelse.
- Begrepsbank som felles modul (struktur, uten innhold).

**Akseptkriterier**

- CI er grønn, og en tag gir publisert versjon på Pages.
- Appen kan installeres på iOS og Android og åpnes offline.
- Målform og tema kan byttes og huskes. En manglende nn-nøkkel gir byggefeil.
- En testmodul dukker opp på forsiden og i søket uten endring i forsidekoden.
- Søk på «skule» finner innhold skrevet med «skole», og omvendt.
- Fylke og skole kan velges, fjernes og endres.
- Kildejobben kjører manuelt, skriver status og oppretter issue ved simulert feil. Appen viser `utdatert` når statusfilen er for gammel.
- Ingen horisontal overflyt i 320–430 px. Ingen alvorlige axe-funn.

**Kontrollpunkt:** Eier installerer appen på egen telefon og tester gester, tema og målform.

### Fase 1 – SFS 2213: regelsett og hurtigkalkulatorer

**Leveranser**

- `rules/sfs2213/2026-2027.yaml` med verdier fra SFS 2213 med protokoller, alle med `kontrollert: null` til eier har godkjent.
- `rules/sfs2213/arsrammer-2026-2027.yaml`: vedlegg 1 som data. Kategori → årsramme i 60- og 45-minuttersenheter, med fag, utdanningsprogram og trinn slik vedlegget angir dem.
- Nivålogikk for lokale avvik på skole- og fylkesnivå (`erstatter`), med testdata. Ingen registrering i grensesnittet ennå.
- Hurtigkalkulatorer, tilgjengelige fra forsiden:
  1. Beskjeftigelse for én gruppe: årsramme (valgt manuelt fra vedlegget i denne fasen), timer per uke eller årstimer, minutter per økt og antall uker → stillingsprosent.
  2. Fagkombinasjoner: flere grupper summert.
  3. Periodebeskjeftigelse: undervisning i deler av skoleåret.
  4. Vikar: enkelttimer og perioder.
  5. Planfestet arbeidstid for en stilling, med utvidelse ved funksjoner.
  6. Blandede grupper: laveste årsramme brukes når en time har elever fra program eller nivåer med ulik årsramme.
- Alle resultater kan vise utregningen trinn for trinn og hvilket nivå verdiene kommer fra.
- Forklaringer med grafikk: fordelingen mellom undervisning, for- og etterarbeid, andre oppgaver, planfestet og ikke-planfestet tid.
- Begrepsbank: arbeidstid, årsramme, beskjeftigelse, planfestet tid, delt dagsverk, lokale forhandlinger og drøftinger med flere. Søkbar og filtrerbar.
- Kilder: SFS 2213 med vedlegg og protokoller, KS-hovedtariffavtalen, arbeidsmiljøloven.

**Endret underveis etter eiers ønsker (0.2–0.6)**

- **Arbeidsplan** er hovedkalkulatoren i modulen (adresse `#/arbeidstid/arbeidsplan`). Den samler fag, funksjoner og redusert undervisning mot stillingsprosenten, med teknisk undertid eller overtid, fordeling av arbeidstiden (diagram, tabell og uke), lønn med tillegg, overtid og feriepenger, og lagrede varianter med navn.
- Hurtigkalkulator 5 (planfestet arbeidstid med utvidelse ved funksjoner) og forklaringen med grafikk om fordelingen er en del av Arbeidsplan. De egne kalkulatorene for planfestet tid og fordeling er fjernet (30.09.2026).
- Funksjoner oppgis i prosent eller årsrammetimer, og hver funksjon kan utvide planfestet tid eller ikke, og gi tillegg (SFS 2213 punkt 9.1).
- Livsfasetiltak (punkt 6) regnes som funksjoner som ikke utvider planfestet tid, også for 57-åringer (eier 30.09.2026). Lærere som er 60 år og eldre har årsverk på 1650 timer. De 37,5 timene er fem arbeidsdager ekstra ferie, så arbeidsåret er 191 dager eller 38,2 uker. Planfestet tid er samme andel av årsverket som for andre: 1150 × 1650 ÷ 1687,5 (eier 30.09.2026).
- Variabel lønn: beskjeftigelse over en stilling under 100 %, opp til hel stilling, regnes som vikartimer. Bare det som er over 100 %, er overtid (eier 30.09.2026).
- Planleggingsdagene (6 × 7,5 = 45 timer for hel stilling, som i Visma InSchool) står på egen linje i fordelingen, og timer per uke er resten fordelt på 38 skoleuker (eier 30.09.2026).
- Periodebeskjeftigelse er en del av Arbeidsplan, med periodenøkkel som i InSchool. Lønn i en periode regnes fra datoene: hele måneder, og arbeidsdager ÷ 21,67 i brutte måneder, med offentlige fridager medregnet (eier 30.09.2026, avgjørelse 015).
- Hurtigkalkulatorene er Arbeidsplan (også for en periode), beskjeftigelse (fag og fagkombinasjoner, blandede grupper), vikartimer og overtid.

**Avklares med eier før implementering**

- Hva «utvidet planfestet arbeidstid ved funksjoner» skal omfatte i kalkulatoren.
- Hvilke regler vikarberegningen skal bygge på i praksis.

**Fra eier:** 5–10 anonymiserte eksempler med riktig svar, som legges i `tests/fasit/sfs2213/`.

**Akseptkriterier**

- Alle fasittester er grønne.
- Hver regelverdi har kilde.
- Forklaringer er skjult til de åpnes.
- Lokale testverdier slår gjennom og merkes med nivå.

**Kontrollpunkt:** Eier kontrollerer regelsett, årsrammetabell, beregninger og tekster.

### Fase 2 – Fag og læreplaner, kobling til årsramme

**Leveranser**

- `scripts/hent-grep.ts` henter gjeldende fagkoder og læreplaner for videregående: tittel, fagkode, utdanningsprogram, trinn, årstimetall, vurderingsordning og eksamensform, kompetansemål og tekst om underveisvurdering. Dataene deles i en liten fagindeks og filer per læreplan som lastes ved behov.
- Grep-jobb i `kilder.yml` med validering, snapshot, endringsrapport og tilbakefall ved feil.
- Oppslag: søk og filter på fagnavn, fagkode, utdanningsprogram, trinn, vurderingsordning, eksamensform og årstimetall. Fagside med kompetansemål, vurderingsordning, underveisvurdering og lenke til udir.no. Fag kan favorittmerkes.
- Læreplantekster vises i målformen de er fastsatt i, merket og uoversatt.
- Kobling fagkode → årsramme i `rules/sfs2213/kobling-fagkode-2026-2027.yaml`:
  - **Fellesfag** kobles alltid eksplisitt per kombinasjon av fagkode, utdanningsprogram og trinn. Fellesfag som norsk har ulik årsramme på tvers av trinn og program, så prefiksregler brukes aldri for fellesfag.
  - **Programfag og felles programfag** kan kobles med regler på fagkodeprefiks + utdanningsprogram + trinn, med eksplisitte unntak.
  - En tabell kobler programnavnene i vedlegg 1 til utdanningsprogrammene i Grep.
  - Oppslaget returnerer årsramme og hvordan den ble funnet (`eksplisitt`, `regel`, `manuell`). Er koblingen ikke entydig, spør kalkulatoren om utdanningsprogram og trinn.
- Kalkulatorene får fagvalg: valgt fag fyller inn årstimetall og årsramme. Manuell overstyring er mulig og merkes.

**Tester**

- Alle vgs-fagkoder i Grep er enten koblet eller står i en rapport over ukoblede.
- Ingen fellesfag kobles via prefiksregel.
- Eiers InSchool-data brukes som fasit, og avvik listes i en rapport. Testen feiler bare for avvik som ikke står i `godkjente_avvik`.

**Fra eier:** Dagens status for årsramme og årstimetall per fag (CSV eller Excel), og bekreftelse av tabellen over programnavn.

**Endret underveis etter eiers ønsker (30.09.2026)**

- Fase 2 gjøres uten InSchool-data. Koblingene kontrolleres med tester, rapporten over ukoblede fag og avvik (`docs/KOBLING.md`) og eiers gjennomgang av et utvalg koblinger. InSchool-data kan legges inn som ekstra kontroll senere.
- Kontrollen av innholdet i fase 1 tas fortløpende i kontrollrundene og med `/godkjent`. Fase 1 regnes som ferdig.
- Levert i 0.9.0: fag og læreplaner fra Grep (avgjørelse 022), koblingen fra fagkode til årsramme med rapport (avgjørelse 023) og fagvalg i kalkulatorene.
- Levert i 0.10.0 (01.10.2026): VIGO Kodeverksbase (avgjørelse 026) med fag som brukes sammen og utgåtte koder på fagsiden, FAM- og VMM-koder i begrepsbanken, tilbudsstrukturen som rapport (avgjørelse 024) med lenker til Vilbli (avgjørelse 027), registreringshåndboken som kilde (avgjørelse 028), 1208 koblede fagkoder etter eiers svar, og kilder ved hvert kontrollspørsmål. Eier har godkjent tabellen over programnavn.

**Videre arbeid i fase 2 etter eiers innspill (01.10.2026)**

Eier har gitt innspill til «Fag og vurdering» og fase 1, og svart på B1–B6. Arbeidet deles i pakker. Hver pakke er én PR og én versjon, i denne rekkefølgen:

1. **Rettinger i fase 1 og små endringer**
   - Arbeidsplan: hvert fag vises én gang under «timer i hvert fag», med timene lagt sammen (samme fagkode, eller samme navn og årsramme for fag skrevet inn for hånd).
   - Begrepene «variabel lønn» (gjelder også timevikarer), «fag merket *» (lavere beskjeftigelse per økt) og «annet elevrettet arbeid» (kildebelagte eksempler, også omstridte, med hvem som mener hva). Arbeidsplan og begrepsbanken bruker samme tekst om annet elevrettet arbeid.
   - «Fra Grep» tas bort fra modulknappen og fra vurderingsordningen. Grep står som kilde nederst på fagarket og under «Om». Kortere tekst i modulknappene på forsiden.
   - Testen for fasit 014 som svikter av og til i WebKit.
2. **Forsiden** (se 3.7)
   - «Arbeidstid»: Arbeidsplan som egen boks og Beskjeftigelse, Vikar og Overtid i en sammenleggbar boks.
   - «Fag og vurdering» får navnet **Læreplanverk og opplæringsløp** (eier, B1).
3. **Fagsøk og filter**
   - «Vanlige fag» er standard: fagene i det ordinære tilbudet i tilbudsmodellen og yrkesfaglig fordypning (eier, B3). Varianter (morsmål, kvensk, samisk, tegnspråk, kort botid o.l.), fag uten timetall eller læreplan, opplæring i bedrift og utgåtte fag vises når brukeren slår dem på. Hvor mange som er skjult, står ved resultatet.
   - Et søk på en hel fagkode viser alltid faget.
   - Treffene grupperes etter fagtype, og valgfrie programfag på studieforberedende etter læreplan. Gruppene kan lukkes. Yrkesfaglig fordypning står øverst når et yrkesfaglig program er valgt.
   - Søket på forsiden følger de samme reglene.
4. **Fagarket og begreper for opplæringsløpet**
   - Rekkefølge: grunnopplysninger (navn, kode, fagtype, trinn, program, årstimetall, årsramme), så kompetansemål, så vurdering samlet på ett sted, så resten. Alle deler kan lukkes og har et sammendrag i overskriften.
   - Program og programområder samles («Alle yrkesfaglige utdanningsprogram, vg1»), med hele listen i en del som kan åpnes.
   - Årsramme der den er kjent, med forklaring om at den bygger på appens tolkning av vedlegg 1, og en lenke som åpner en ny, ulagret arbeidsplan med faget som fag 1 (eier, B4).
   - Yrkesfaglig fordypning forklares på fagarket og i et begrep, med kilde fra Udir.
   - Nye begreper: utdanningsprogram, programområde, vg1–vg3, fellesfag, felles programfag, valgfrie programfag, yrkesfaglig fordypning, lærefag og opplæring i bedrift, påbygging. Fagarket viser dem med «i».
5. **Opplæringsløp** (tilbudsstrukturen i appen)
   - Ny modul som boks direkte under «Læreplanverk og opplæringsløp», uten mellomside: program → tilbud → fag og timer, med valgfrie plasser og yrkesfaglig fordypning.
   - Lenker begge veier mellom fag og tilbud. Lenkene til Vilbli (avgjørelse 027) bygges inn, for valgt fylke.
   - Dataene lastes når de trengs.
6. **Læreplanverket**
   - Ny modul som egen boks under samme overskrift (eier, B2): overordnet del, grunnleggende ferdigheter og tverrfaglige temaer.
   - Overordnet del har mye tekst og skal være lett å navigere: innholdsregister med lenker, søk, og tekstene i bokser som er lukket til brukeren åpner dem, med nye lukkede bokser inni.
   - Fagarket viser grunnleggende ferdigheter og tverrfaglige temaer i faget, med lenke til overordnet del.
   - Kilder: Grep har grunnleggende ferdigheter og tverrfaglige temaer (koder og titler). Teksten i overordnet del hentes fra Lovdatas datasett (forskrift) eller fra udir.no. Det avgjøres i pakken.
Levert: pakke 1 i 0.11.0, pakke 2 i 0.12.0 (avgjørelse 030) pakke 3 i 0.13.0 (avgjørelse 031) og pakke 4 i 0.14.0, 01.10.2026. Eier ba 01.10.2026 i tillegg om dempede diagramfarger i mørk visning, egen bakgrunn i «Flere kalkulatorer», punktum i oppsummeringen og periodebeskjeftigelse i teksten om Arbeidsplan. Det kom med i pakke 4. Nytt design for fagarket og fagtypefarger i fagsøket kom i 0.15.0 (avgjørelse 032). Etter tre prototyper fikk alle fire kalkulatorene skjemaet i fargede deler i 0.16.0 (avgjørelse 033), før pakke 5. Appen fikk navnet Fuskelappen, ny logo og en roligere forside i 0.17.0 (avgjørelse 034). Pakke 5 (Opplæringsløp) kom i 0.18.0 (avgjørelse 035). Etter eiers gjennomgang fikk Opplæringsløp bedre oversikt, sortering etter kildene, «Inngår i tilbud» på fagarket, navn på nynorsk og merknader om avvik i 0.19.0 og 0.19.1 (avgjørelse 036). Pakke 6 (Læreplanverket) kom i 0.20.0 (avgjørelse 037), med overordnet del fra udir.no. Samtidig fikk overskriften navnet «Læreplanverket», med boksene Overordnet del, Opplæringsløp og Fag og læreplaner, som Udirs tre deler (eier 02.10.2026). Fase 2 er levert. Kontrollpunktet tas i kontrollrundene.

Begrepsbanken utvides der det passer i hver pakke. Nytt og endret innhold får `kontrollert: null` og kontrollspørsmål med kilder. Fasittestene endres ikke.

**Utgår:** En oversikt over tilbudene ved hver skole og i hvert fylke (eier, B5). Det finnes ingen åpen kilde: VIGO-kodeverket har skolene, men ikke tilbudene, Vilbli stenger for automatisk henting, og Udirs åpne statistikkbank har bare Elevundersøkelsen (sjekket 01.10.2026). Tas opp igjen hvis en kilde blir kjent.

**Kontrollpunkt:** Eier går gjennom avviksrapporten, et utvalg koblinger og tabellen over programnavn.

### Fase 3 – Arbeidsplan som illustrasjon

Mye av denne fasen er bygd i fase 1 (se «Endret underveis» der): Arbeidsplan med tenkt stilling, grafisk fordeling, lokalt lagrede varianter og merkingen «Illustrasjon – ikke en arbeidsplan». Eier har bestemt at variantene kan få navn (30.09.2026). Appen foreslår navn som «Før endring» og ber ikke om personopplysninger.

**Leveranser som gjenstår**

- Fag og grupper hentes fra fagoppslaget i fase 2. Resultater fra andre kalkulatorer kan hentes inn (beskjeftigelse kan allerede føres videre til Arbeidsplan).
- Sammenligning av to varianter side om side, f.eks. med og uten kontaktlærerfunksjon.
- Varianter kan deles som lenke (komprimert tilstand i adressen).

*Status 02.10.2026:* Fagvalg fra Grep, «Regn ut i Arbeidsplan» fra fagarket og Opplæringsløp og videreføring fra Beskjeftigelse fantes fra før. Vikar og Overtid føres ikke over, fordi de regner ut enkeltoppdrag og ikke en stilling. Sammenligning og deling er bygd i 0.21.0 (avgjørelse 038). Lenken har med navnet på varianten (eier 02.10.2026).

**Lov og forskrift** (eier 02.10.2026: flyttet fra fase 2 til fase 3, så den er klar før fase 4)

- Ny modul «Lov og forskrift» under «Oppslag», ved siden av Begreper: opplæringslova og opplæringsforskrifta med innholdsregister (kapitler og paragrafer), søk i hele teksten og bokser som er lukket til brukeren åpner dem, som i overordnet del.
- Teksten hentes hver uke fra Lovdatas gratis datasett (NLOD 2.0) i kildesjekken, valideres og vises uendret. Opplæringslova og forskriften er fastsatt på nynorsk og vises uoversatt, merket med målform. Endringer per paragraf står i kontrollsaken, som for overordnet del.
- Hver paragraf har egen adresse, så begreper, fagark og modulene i fase 4–8 kan lenke rett til den, og en lenke til Lovdata.
- Søket på forsiden finner paragrafene på nummer («§ 11-1», «11-1») og tittel. Nye begreper der det trengs, f.eks. lov, forskrift og paragraf/ledd.
- Kildene `opplaeringslova` og `opplaeringsforskrifta` slås på i kilderegisteret. Lovdata kan ikke nås fra utviklingsmiljøet, bare fra GitHub Actions. Leseren lages derfor mot et lite utdrag i testene, og første ekte henting kjøres i Actions før modulen publiseres.
- Omfang (eier 02.10.2026): delene som gjelder videregående opplæring og fagopplæring, tolket vidt. Formål og andre generelle bestemmelser som også gjelder videregående (f.eks. skolemiljø, vurdering, tilpasset opplæring og individuell tilrettelegging), tas med. Kapitler som bare gjelder grunnskolen, tas ikke med. Utvalget legges fram for eier som en liste over kapitler før modulen bygges.
- Andre forskrifter kan være aktuelle, f.eks. om inntak. Hvilke som finnes og hva de dekker, kartlegges i fasen og legges fram for eier som forslag. De kan tas inn med samme henting og visning.
- *Utvalg godkjent av eier 02.10.2026:*
  - Opplæringslova: kapittel 1, 5–21, 23–25 og 27–30. Ikke med: 2–4 (grunnskolen), 22 (privat opplæring) og 26 (kulturskole).
  - Opplæringsforskrifta: kapittel 4–20, 22 og 23. Ikke med: 1–3 (grunnskolen), 21 (kommunens økonomiske ansvar), 24 (iverksetjing) og vedlegg 1–2.
  - Hele kapitler tas med, også paragrafer i dem som bare gjelder grunnskolen, så teksten står som i kilden.
  - Eier ba om at Udirs regelverkssider brukes til å avgjøre om flere lover og forskrifter er aktuelle (02.10.2026). Forslaget fra den kartleggingen legges fram før pakken Lov og forskrift bygges.
  - Etter kartleggingen godkjente eier 02.10.2026 også forvaltningsloven kapittel II–VI og forskrift om helse og miljø i barnehager og skoler, på vilkår av at nye kilder er lette å legge til. Senere samme dag: arbeidsmiljøloven kapittel 4, 10, 12, 14 og 15, og Vestlands lokale forskrifter om inntak (2020-09-29-3380) og skolereglar (2026-06-16-1587).

*Status 02.10.2026:* Levert i 0.22.0 som modulen **Regelverk** (avgjørelse 039). Eier valgte navnet, med «Lov, forskrift og avtaler» som undertekst.
- Gruppene lover, forskrifter, lokale forskrifter og avtaler kan legges sammen.
- Lokale forskrifter vises bare når brukeren har valgt fylket. De hentes fra siden hos Lovdata hver 13. uke, fordi de ikke er i datasettene (eier valgte å hente uten å spørre Lovdata først).
- Hovedtariffavtalen og SFS 2213 står under «Avtaler», skrevet med egne ord, fordi vilkårene for gjenbruk av avtaleteksten ikke er avklart. Kildesjekken melder endringer i avtalene, med de berørte bestemmelsene og kontrollspørsmålene.
- Søket finner bokmål i nynorsk tekst og omvendt. Paragraftitler i eldre lover ryddes. Kilder som lenker til en paragraf hos Lovdata, får også «Les i appen».
- Nye begreper: lov, forskrift, lokal forskrift, paragraf og ledd, enkeltvedtak, tariffavtale, garantilønn, stillingskode, lønnsansiennitet, konstituering, tidsressurspott, midlertidig ansettelse, oppsigelse og avskjed, klage, habilitet, forhåndsvarsel, aktivitetsplikt, bortvisning og skoleregler.

**Kontrollpunkt:** Eier vurderer om illustrasjonen er riktig og pedagogisk nyttig, og godkjenner utvalget av kapitler og forskrifter før modulen Lov og forskrift bygges.

Levert: Arbeidsplan (sammenligning og deling) i 0.21.0 (avgjørelse 038), rettinger etter eiers innspill i 0.21.1, og Regelverk i 0.22.0 (avgjørelse 039). Fase 3 er levert (eier 03.10.2026). Kontrollpunktet tas i kontrollrundene: eier vurderer Arbeidsplan som illustrasjon og ser over det nye innholdet i Regelverk (avtalene med egne ord og de nye begrepene har `kontrollert: null` og kontrollspørsmål).

*Avklart 02.10.2026:* Det lages ikke `npm run test:endret`, og CI fortsetter å kjøre på main etter fletting (eier).

### Fase 4 – Tilpasset opplæring og individuell tilrettelegging

Bygger på Regelverk i fase 3 (avgjørelse 039): forklaringene lenker til paragrafene der, f.eks. `#/lov/opplaeringslova/11-6`.

**Leveranser**

- Veiviserkomponent: steg, spørsmål og vilkår, utfall, kilder og forklaring. Tastatur- og skjermleservennlig. Tilstanden ligger i adressen, slik at et steg kan deles. Gjenbrukes i fase 5–7.
- Prosessen trinn for trinn fra tilpasset opplæring til individuell tilrettelegging, med vilkår, ansvar, dokumentasjon og frister, etter gjeldende opplæringslov og forskrift og Udirs veileder.
- Særskilt språkopplæring, minoritetsspråkliges rettigheter og rettigheter ved kort butid.
- VLFK-innhold der det er relevant, merket som fylkesinnhold.
- Oppsummeringene skrives under utviklingen som utkast, og eier kontrollerer dem.

*Status 03.10.2026:*
- Pakke 1 (veiviseren som felles komponent, avgjørelse 041) ble flettet uten egen versjon, fordi modulen var skjult (eier).
- Pakke 2 er levert i 0.23.0 som modulen **Tilrettelegging** med veiviseren «Tilpasset opplæring og individuell tilrettelegging» (navnet valgt av eier, fordi alle elever skal ha tilpasset opplæring), kartet over hele prosessen og elleve nye begreper.
- Eiers svar 03.10.2026: Fristen for foreløpig svar regnes fra den sakkyndige vurderingen er mottatt, og står i praksislisten til bekreftelse. Om det trengs nytt vedtak for å avslutte tilrettelegging, står åpent i veiviseren (eier 03.10.2026).
- Ende-til-ende-testene i CI er delt på seks jobber (avgjørelse 040).
- Pakke 3 er levert i 0.24.0: veiviseren «Særskilt språkopplæring og kort botid» og sju nye begreper. Eier 03.10.2026: Ukraina-unntaket nevnes ikke, veiviseren sier ikke noe om vedtak når språkopplæringen avsluttes eller når eleven ikke har rett, NOR09-05 er gjeldende læreplan, og eleven samtykker selv til innføringsopplæring så lenge eleven er samtykkekompetent (praksislisten). Begrepsarket har fått «Begreper» som sti øverst.
- 0.25.0 (03.10.2026): læreplanene for særskilt språkopplæring i en boks i veiviseren, med kompetansegivende og fagkodene per trinn (eier: plassering godkjent, trinnene lukket). Veiviserne står som like høye kort med fasestolpe, og hver veiviser har sin farge (avgjørelse 042).

**Uløst:** vestlandfylke.no svarer ikke, verken fra utviklingsmiljøet, fra GitHub Actions eller for eier (03.10.2026). Vestland-innhold i veiviserne (Rettleiingstenesta, midlertidig vedtak ved inntak, særskild språkopplæring og innføringskurs) venter til sidene svarer igjen, eventuelt til en senere fase. Kilden `vlfk-sider` har fortsatt adressen vlfk.no og må få vestlandfylke.no når sidene kan leses.

**Kontrollpunkt:** Eier kontrollerer prosess, begrepsbruk og kildehenvisninger.

### Fase 5 – Inntak

**Leveranser**

- Søkerkategorier etter opplæringslova, forskriften og VLFKs lokale forskrift om inntak (fylkesinnhold).
- Se `docs/VIGO-KODEVERK.md` for data fra VIGO Kodeverksbase som kan brukes: hva et programområde gir grunnlag for å søke videre på, status på søkerønsker, og hvilke fag som teller for poeng.
- Veiviser: «Hvilken søkerkategori?»
- Tidslinje for søkertidspunkt og frister, og oversikt over rettigheter knyttet til inntak.
- Poengberegning etter gjeldende inntaksregler, med utregning og kilde.
- Uten valgt fylke vises bare nasjonale regler, med merknad.

*Status 03.10.2026:*
- Forslaget med søkerkategorier, frister, poengregler og fasittester F1–F9 er godkjent av eier (`docs/arbeidsordrer/fase-5-forslag.md`). Udirs merknader til opplæringsforskrifta er ny kilde for poengberegningen.
- Pakke 1 er levert i 0.26.0: modulen **Inntak** med veiviseren «Rett, inntak og søknad» (navnet valgt av eier) og Vestland-innhold i egne bokser (avgjørelse 043). Alle veiviserne har fått én side per valg, lukkede steg på mobil og mindre rulling (avgjørelse 044). Eier kan teste en gren under `test/` (avgjørelse 045). GNS02-01 er med i læreplanboksen for særskilt språkopplæring, i en egen gruppe for voksne.
- Pakke 2 er levert i 0.27.0: **Søknad og frister gjennom året**, en tidslinje over inntaksåret med filter og Vestland-frister (avgjørelse 046). Datoene for svar og andre inntak står på Vilbli, som appen lenker til.
- Pakke 3 er levert i 0.28.0: **Poengberegning** til Vg1, Vg2 og Vg3 med regler i `rules/inntak/`, fasittestene F1–F9 og F7b, og tilleggspoeng i Vestland (avgjørelse 047). VIGOs felt «teller for poeng» brukes ikke, fordi det ikke stemmer med § 4-25 bokstav b.
- Med 0.28.0 er kildekontrollen og fylkesinnholdet gått gjennom i hele appen (avgjørelse 048), og dataene fra kildene er samlet i et felles datalag (avgjørelse 049).
- 0.29.0: begrepene karakterpoeng, privatist og tilleggspoeng, lenker til begrepsbanken i brødtekst (avgjørelse 050), status på søkerønsker, Vg4 påbygging og yrkesfaglig opphenting fra VIGO og Grep (avgjørelse 051). Kontrollpunktet for fase 5 er utsatt etter ønske fra eier.
- Spørsmålene til vestlandfylke.no (inntaksområdepoeng og klagenemnd) tas med til senere faser til sidene svarer.
- Arbeidsordren for fase 6 står i `docs/arbeidsordrer/fase-6.md`.
- 0.30.0: utdanning.no som kontrollkilde for løpene, med merking der Grep, VIGO og utdanning.no er uenige (avgjørelse 052). Modulen Opplæringsløp heter nå **Opplæringstilbud**, med Opplæringsløp som underside, oppslag over skolene og tilbudene deres fra utdanning.no, «Min skole» / «Alle», yrkene for lærefagene, oppslag over opplæringskontorene fra NOR, lenker fra fagarket til NDLA og seks nye begreper (avgjørelse 053).

**Kontrollpunkt:** Eier kontrollerer kategorier, flyt og poengberegning.

### Fase 6 – Vurdering, fravær og eksamen

**Leveranser**

- Vurderingsbestemmelsene i forskriften til opplæringslova: underveis- og standpunktvurdering, grunnlag for vurdering, klage, eksamen og særskilt tilrettelegging.
- Fraværskalkulator per fag: årstimetall fra Grep → hvor mange timer som tilsvarer fraværsgrensen, med forklaring av unntak etter gjeldende regler.
- Se `docs/VIGO-KODEVERK.md` for data fra VIGO Kodeverksbase som kan brukes: vurderingsordning per fagkode, karakterkoder og fagmerknader knyttet til fag. Fagmerknadene og vitnemålsmerknadene er alt i begrepsbanken (avgjørelse 026).
- Veivisere for grunnlag for vurdering og for klagegangen.
- Kobling begge veier mellom vurdering og eksamen og de to veiviserne i Tilrettelegging (eier 03.10.2026): for eksempel individuelt tilrettelagt opplæring uten vurdering med karakter, fritak fra vurdering med karakter i innføringsopplæring, og læreplanene i særskilt språkopplæring som ikke gir karakter.

Fasen kan flyttes foran fase 4 hvis eier ønsker det, siden den bare bygger på fase 2.

*Status 04.10.2026:*
- Forslaget med tre pakker, fasittestene FR1–FR8 og svarene fra eier står i `docs/arbeidsordrer/fase-6-forslag.md`.
- Pakke 1 er levert i 0.31.0: modulen **Vurdering** under «Elever og opplæring» med veiviseren «Grunnlag for vurdering», siden «Underveis- og sluttvurdering» med vurderingsteksten i læreplanen for et fag, «Orden og oppførsel», ni begreper og oppslaget over karakterkoder fra registreringshåndboken (avgjørelse 054). Regelverk og kilder står som lukkede rader nederst i alle kort i appen.
- 0.31.0: bare de berørte ende-til-ende-testene kjøres lokalt, og hele suiten kjøres i CI med bygget én gang og åtte jobber (avgjørelse 055).
- 0.32.0: forsiden kan tilpasses (grupper som lukkes og sorteres, favoritter som sorteres der de står, «Bare favoritter»), og toppfeltet med søk og innstillinger erstatter bunnmenyen (avgjørelse 056).
- Pakke 2 er levert i 0.33.0: **Fraværsgrensen** i Vurdering med fasittestene FR1–FR8, VIGO som kontroll av fagene i Grep, boksen «Fravær og eksamen» på fagarket, og søketreff som sier hva treffet er (avgjørelse 057).
- Pakke 3 (eksamen og klage), og «Fag- og svennebrev» i Opplæringstilbud, kommer etter. Overleveringen til pakke 3 står i `docs/arbeidsordrer/fase-6-pakke-3.md`.
- Pakke 3 er levert i 0.35.0: **Eksamen**, veiviseren «Klage på karakter», fag- og svenneprøven og kalender for eksamen (avgjørelse 059). Grep hentes nå bare når noe er endret (avgjørelse 060).
- Pakke 4 (**Fylkene**, eier 05.10.2026) er levert i 0.36.0: lenker til fylkenes egne sider per tema, fylkessiden, og lokale forskrifter fra Lovdata for alle fylker og skoler, oppdatert fra Norsk Lovtidend hver uke (avgjørelse 061). Alle lenker i appen sjekkes hver uke (avgjørelse 062). Arbeidsordren står i `docs/arbeidsordrer/fase-6-pakke-4-fylkene.md`. Samme versjon har søket i toppfeltet over siden, med knapp for fylket, og sti på alle sider.
- 0.36.1 (05.10.2026, pausen før pakke 5): temafilter i begrepsbanken, lukket fylkesboks, tilbakemelding på e-post (avgjørelse 064) og forberedelse til eget domene, jukselappen.no (avgjørelse 065).
- Pakke 5 er levert i 0.37.0 (05.10.2026): **Kalenderen** med skoleruta, fylkenes inntaksdatoer og kommende endringer i regelverket (avgjørelse 066), «Neste datoer» og sidekolonnen på forsiden (avgjørelse 068), og CI etter hva som er endret (avgjørelse 067).
- 27 nye begreper (eier 05.10.2026) er levert i 0.36.0: `docs/arbeidsordrer/fase-6-begreper.md`.
- Pakke 6 er levert i 0.38.0 (06.10.2026): **Lærlinger og kandidater** i Opplæringstilbud, med veiene til fag- og svennebrev, praksisbrev og kompetansebevis, overgangene med kilder, siden for hver vei og «Veiene hit» på prøvesiden (avgjørelse 069). Overleveringen står i `docs/arbeidsordrer/fase-6-pakke-6-fag-og-svennebrev.md`, og arbeidsordren for fase 7 i `docs/arbeidsordrer/fase-7.md`.
- 0.38.1 (06.10.2026): alle løp fra Grep, VIGO og utdanning.no, merket når bare én kilde har dem (avgjørelse 070). Samme versjon har like høye knapper på forsiden, klokkeslettet under tittelen i Kalenderen, søk på «kalender» uten doble treff, ingen kildeliste på oversiktssidene og ingen komma foran siste «og»/«eller» i oppramsinger (testes).
- 0.38.2 (06.10.2026): «Bytte vei» uten kilder i kortene (kildene lukket under og på siden overgangen går til), og overgangene lærekandidat → elev og lærling → Vg3 i skole (avgjørelse 069).
- 0.38.3 (06.10.2026): regelverket og kildene som lukkede rader nederst i alle kort og bokser (avgjørelse 071), og tilbake til samme sted: åpne kort og rulleposisjonen huskes for siden (avgjørelse 072).
- Pakke 7 er levert i 0.39.0 (06.10.2026): **Mer opplæring** i Inntak (forskrift til opplæringslova § 5-2 og Udirs veiledninger), med lenker fra Vurdering, Lærlinger og kandidater, Tilrettelegging, Kalenderen og veiviseren for rett til inntak, og deler av siden som kan lukkes (avgjørelse 073). Overleveringen står i `docs/arbeidsordrer/fase-6-pakke-7-mer-opplaering.md`.

**Kontrollpunkt:** Eier kontrollerer regler, kalkulator og veivisere.

### Fase 7 – Skolemiljø og skoleregler

**Leveranser**

- Aktivitetsplikten trinn for trinn: plikten til å følge med, gripe inn, varsle, undersøke og sette inn tiltak, skjerpet aktivitetsplikt, aktivitetsplan og dokumentasjon, og elevens mulighet til å melde saken til statsforvalteren.
- VLFKs skulereglar: reaksjoner og saksbehandling (fylkesinnhold).
- Plass til skolens egne regler som `supplerer` (skoleinnhold).
- *(Eier 06.10.2026)* Privatskolelova og forskriften til den i kildegrunnlaget og i Lov og forskrift, med et forslag til hvordan de brukes som kilder og regelreferanser i appen. Tas først i fasen (`docs/arbeidsordrer/fase-7.md`).
- Resultater fra Elevundersøkelsen (Udirs statistikkbank, åpent API, NLOD) for valgt skole og fylke, sammenlignet med landet: hentes automatisk og kontrolleres som de andre dataene (avgjørelse 049 og 053). Hvilke spørsmål og indekser som tas med, og hvordan små grupper og skjulte tall vises, legges fram for eier før det bygges. Ingen tall om enkeltelever.

**Kontrollpunkt:** Eier kontrollerer innholdet.

- Levert i 0.40.0 (06.10.2026): **Skolemiljø** med siden om opplæringslova kapittel 12, veiviseren for aktivitetsplikten etter rolle, skolereglene i fylket og på skolen, og **Elevundersøkelsen** med sammenligning, «Kort om» og søk (avgjørelse 076, 077 og 079). **Privatskoler** i appen og privatskolelova i Lov og forskrift (avgjørelse 075). **Eksamen og klage** som egen modul (avgjørelse 078). To kolonner på skrivebord (avgjørelse 074). Forslag og svar står i `docs/arbeidsordrer/fase-7-forslag.md`. Innholdet venter på eiers kontroll (`kontrollert: null`).
- Levert i 0.41.0 (07.10.2026): **Videregående i tall** med tall fra Udirs statistikkbank (søkere, elever, læreplass, lærekontrakter, fravær, gjennomføring, fag- og svennebrev og eksamen), hentet hver uke. Tallene står også på fylkessiden, i Inntak, Lærlinger og kandidater, Fraværsgrensen, Eksamen og skolekortet (avgjørelse 080). Forsiden har et **panel** med kalenderen og tallene som alternative visninger, og plass til nyhetene i fase 7b (avgjørelse 081). Kapittel 12-siden viser til kapittel 13, og to nye begreper (nulltoleranse og psykososialt skolemiljø). Forslaget og eiers svar står i `docs/arbeidsordrer/forslag-statistikk.md`. **Fase 7 er levert.** Kontrollpunktet tas i kontrollrundene.

### Fase 7b – Nyheter

*(Eier 06.10.2026.)* Tas etter fase 7 og før fase 8, fordi «Siste nytt» og Kalenderen hører sammen på forsiden. Arbeidsordren står i `docs/arbeidsordrer/fase-7b-nyheter.md`, og kartleggingen av kildene i `docs/arbeidsordrer/forslag-meropplaering-og-nyheter.md`.

**Leveranser**

- Et skript i GitHub Actions henter nyheter (tittel, dato, lenke og eventuelt ingress) fra så mange kilder som er forsvarlig, til `data/nyheter.json`. Appen gjør ingen eksterne kall.
- Myndighetene er med: regjeringen.no, Udir og Statsforvalteren. Fagpressen, Utdanningsnytt, er med. Organisasjonene, f.eks. Skolelederforbundet, Skolenes landsforbund og Utdanningsforbundet, er med og merkes som interesseparter.
- Kilder uten feed eller åpen liste skrapes ikke når det er ugreit (f.eks. Lektorlaget, eier 06.10.2026).
- «Siste nytt» på forsiden og en egen side under «Oppslag». Statsforvalterens saker vises bare med valgt fylke. *(Eier 07.10.2026:)* På forsiden er nyhetene visningen «Nyheter» i panelet øverst, sammen med kalenderen og tallene (avgjørelse 081). Plassen og en skisse er laget i 0.41.0, og bare testversjonen viser den.
- Om ingress skal vises for alle kilder, noen eller ingen, avgjør eier når designet legges fram (eier 06.10.2026).
- Nyhetsfilen publiseres daglig uten PR når den passer skjemaet (eier 06.10.2026). Det får et eget avgjørelsesnotat.
- KS og KF Infoserie: eier tar stilling etter rådet i arbeidsordren (robots.txt hos KS, abonnement hos KF Infoserie).

**Kontrollpunkt:** Eier kontrollerer kildene, merkingen og visningen.

- Levert i 0.42.0 (07.10.2026): **Nyheter** fra KD, Udir, HKdir, Lovdata, Statsforvalteren og fylkeskommunen i valgt fylke, forskning.no, NIFU, Utdanningsnytt, Utdanningsforbundet og Skolelederforbundet, valgt ut for videregående med et ordfilter og hentet hver dag (avgjørelse 084). Visningen «Nyheter» i panelet på forsiden med filter og ingress, og en egen side med filter på hvem, fylke og kilde, de siste 30 dagene og «Vis eldre». Kalender og Nyheter står ikke under «Oppslag». Kalenderen, nyhetene og tallene i panelet har samme oppsett. Nynorsk lastes bare når den trengs (avgjørelse 083). Kilder som ikke kan hentes, står i `docs/KILDER-IKKE-MED.md`. Forslaget og eiers svar står i `docs/arbeidsordrer/fase-7b-forslag.md`. **Fase 7b er levert.** Eier har godkjent designet og kildene underveis.

### Fase 8 – Dagens jukselapp

*(Eier 07.10.2026:)* Fasen har bare dagens jukselapp. Årshjulet og eksporten til kalender (.ics) er tatt ut, fordi kalenderen dekker behovet. Arbeidsordren står i `docs/arbeidsordrer/fase-8.md`.

*(Fase 6, pakke 5, 05.10.2026:)* Den samlede oversikten over fristene er bygget som **Kalenderen** (`#/kalender`, avgjørelse 066): fristene fra alle manifestene, skoleruta fra fylkenes forskrifter, fylkenes datoer for inntak og vedtatte endringer i regelverket, med filter på tema og hvem det gjelder, de neste tolv månedene eller et skoleår.

**Leveranser**

- *(Ønske fra eier 04.10.2026)* **Dagens jukselapp** (navnet endret fra «Dagens fuskelapp», eier 04.10.2026)**:** et faktum fra appen på forsiden, som en morsomhet, en kuriositet og en inngang til å bli kjent med innholdet. Den bygger på samme mønster som fristene: hver modul bidrar gjennom manifestet.
  - Dagens jukselapp skrus av og på fra forsiden (eier 04.10.2026), og gjerne også under Innstillinger. Den er av fra start, og valget lagres lokalt som de andre valgene.
  - Når den er på, står en rubrikk «Dagens jukselapp» på forsiden med ett faktum: en frist, en regel, et begrep, timetallet og årsrammen i et fag, en setning fra overordnet del og så videre. Hvert faktum lenker til stedet i appen der det står, og har kilden. *(Eier 08.10.2026:)* Kortet viser ikke kildene. De står på siden lenken går til.
  - Jukselappen byttes a) automatisk hver dag (samme faktum hele dagen, valgt ut fra datoen), eller b) når brukeren trykker på et tegn for ny jukselapp ved siden av overskriften. Eier velger a, b eller begge når forslaget legges fram.
  - Modulene bidrar med fakta gjennom en ny funksjon i manifestet (som `frister()`), så nye moduler kommer med av seg selv. Fakta hentes fra innholdet, regelsettene og dataene appen alt har. Det gjøres ingen kall til eksterne tjenester, og alt virker uten nett.
  - Innhold for fylke og skole vises bare når brukeren har valgt fylket eller skolen. Teksten står på bokmål og nynorsk.
  - Når den er av, kan forsiden ha en kort tekst med en knapp som slår på dagens jukselapp. Teksten kan lukkes for godt.
  - *(Eier 08.10.2026:)* Ingen tekst på forsiden som slår den på. Bryteren står under Innstillinger og under «Tilpass» på forsiden, og velkomsten i fase 10 spør om brukeren vil slå den på.

**Åpne punkter (avklares i fasen, før det bygges)**

- Hvilke typer fakta som tas med.
- Om bare kontrollert innhold skal vises. Per 07.10.2026 har ikke noe innhold `kontrollert` satt, så jukselappen ville vært tom.
- Om jukselappen byttes hver dag, med en knapp eller begge deler.
- Hvor rubrikken og bryteren står: som egen rubrikk eller som en fjerde visning i panelet øverst (avgjørelse 081), og hvordan teksten som slår den på, ser ut.

**Kontrollpunkt:** Eier kontrollerer visningen og fakta i dagens jukselapp.

- Levert i 0.43.0 (08.10.2026): **Dagens jukselapp** som fjerde visning i panelet øverst på forsiden, med samme oppsett som kalenderen, nyhetene og tallene (avgjørelse 086). Av fra start, med samme bryter under «Tilpass» og Innstillinger. Første besøk hver dag står panelet på jukselappen (alternativ C). Byttes hver dag og med knappen «Ny jukselapp». Fakta fra `fakta()` i manifestene: begreper, forklaringer, regler, frister og steg i veiviserne, SFS 2213 og hovedtariffavtalen, paragrafer i opplæringslova og forskriften, overordnet del, årstimer og årsramme i fagene, og tall fra Videregående i tall. Innhold som ikke er kontrollert, vises (eier 08.10.2026). Elevundersøkelsen er egen modul under Skolemiljø, og modulen Skolemiljø heter «Aktivitetsplikt og skoleregler» (avgjørelse 087). Forslaget og eiers svar står i `docs/arbeidsordrer/fase-8-forslag.md`. **Fase 8 er levert.** Eier har godkjent designet underveis, og faktaene tas i kontrollrundene.

### Fase 9 – Lokale regler for fylke og skole

*(08.10.2026:)* Arbeidsordren står i `docs/arbeidsordrer/fase-9.md`.

*(Eier 07.10.2026:)* Brukerne melder inn lokale regler, og eier godkjenner dem. Godkjente regler vises for alle som har valgt fylket eller skolen. Lokale profiler som bare lagres og deles som fil eller lenke, er tatt ut.

**Leveranser**

- **Legge inn:** Brukeren kan legge inn en lokal regel for fylket eller skolen sin. Den kan komme i tillegg til de nasjonale (`supplerer`) eller gjelde i stedet for en nasjonal verdi (`erstatter`). Regelen gjelder med en gang for brukeren selv, lagres bare på enheten og merkes tydelig som brukerens egen og ikke kontrollert av eier.
- **Dato og dokumentasjon:** Regelen merkes med dato. Brukeren kan velge å dokumentere den, for eksempel med en lenke til kilden eller et vedlegg.
- **Melde inn:** Brukeren kan melde regelen inn. Eier får beskjed på e-post.
- **Godkjenne:** Eier kontrollerer regelen. Godkjent blir den fast innhold eller en fast verdi for fylket eller skolen (`gyldighet`), med kilde, dato og `kontrollert`, og vises automatisk for alle som har valgt fylket eller skolen. Brukerens egen kopi erstattes av den godkjente.
- Innhold for nye fylker legges til etter hvert som brukerkretsen vokser.

**Utgangspunkt (forslag fra Claude, godtatt som utgangspunkt av eier 07.10.2026)**

- **Innmelding på e-post,** med samme løsning som tilbakemeldingen (avgjørelse 064): appen lager en ferdig e-post med regelen i fast form til appens adresse. Brukeren trenger ingen konto og kan legge ved dokumentasjon selv. Appen sender ingenting, og regelen om ingen eksterne kall gjelder fortsatt. Claude legger regelen inn i repoet etter beskjed fra eier, og eier godkjenner som for annet innhold. Alternativet er en GitHub-sak som går rett inn i godkjenningen med `/godkjent` (avgjørelse 021), men den krever en GitHub-konto og er offentlig.
- **Datoene:** når regelen ble meldt inn, når eier godkjente den, og eventuelt fra og til når den gjelder.
- **Plassen:** i Innstillinger, ved valget av fylke og skole.

**Åpne punkter (avklares i fasen)**

- E-post, GitHub-sak eller begge.
- Repoet er offentlig, så godkjente regler blir offentlige. Hva gjøres med dokumentasjon som har navn eller underskrifter, og med lokale avtaler som ikke er offentlige? Forslag: regelen skrives med egne ord, med lenke til kilden når den finnes, og dokumentet legges ikke i repoet.
- Når godkjente regler vises for andre: med neste versjon, eller med en egen, rask publisering for lokale regler (som nyhetene, avgjørelse 084).
- Hvilke regler og verdier som kan meldes inn (f.eks. arbeidstid, skoleregler, inntak og eksamen), og hvordan brukeren velger hva regelen gjelder.
- Om datoene over er nok.

**Kontrollpunkt:** Eier legger inn og melder inn en regel for en skole, godkjenner den og ser at den vises for andre som har valgt skolen.

### Fase 10 – Velkomst

*(Eier 07.10.2026.)* Tas etter fase 9, fordi ett av trinnene viser til innmeldingen av lokale regler.

**Leveranser**

- Et vindu over appen, med uklar bakgrunn, som åpnes første gang brukeren besøker appen. Brukeren blar med «Neste» og «Tilbake» og kan lukke vinduet når som helst, også ved første trinn. Valget lagres lokalt.
- Vinduet kan åpnes igjen fra Innstillinger og fra forsiden.
- En trinnvis veileder i bruken av appen, med korte, gjentakende animasjoner i trinnene der det passer. Trinnene kan ha felt å fylle ut eller lenker og tips om navigasjon. Trinnene er:
  1. **Hva appen er:** kort om den og hvem den er for.
  2. **Oppbyggingen:** appens oppbygging og funksjoner, steg for steg, i ett eller flere trinn.
  3. **Fylke og skole:** hva valget gjør, og valget kan gjøres i trinnet.
  4. **Lokale regler:** at brukeren kan melde inn regler for eget fylke eller egen skole (fase 9), med lenke dit.
  5. **Hvem du er:** rollen og hva brukeren vil bruke appen til, med anbefalte favoritter som kan legges til. Trinnet viser også hvordan favorittene virker. Kan være ett eller flere trinn.
  6. **Dagens jukselapp:** spørsmål om brukeren vil slå på dagens jukselapp (fase 8), med bryteren i trinnet *(eier 08.10.2026)*.
  7. **Installere appen** på mobil eller skrivebord.
  8. **Takk:** appen er et privat prosjekt laget med hjelp av KI, og innspill om feil, mangler og forbedringer er velkomne (lenke til Tilbakemelding). Takk, og «Du er klar!».
- Tekstene står på bokmål og nynorsk.

**Utgangspunkt (forslag fra Claude, godtatt som utgangspunkt av eier 07.10.2026)**

- **Åpnes igjen** med en knapp under Innstillinger og en diskré lenke nederst på forsiden, ved forbeholdet («Ny her? Se velkomsten»).
- **Første besøk:** Vinduet åpnes bare av seg selv når første besøk lander på forsiden. En delt lenke til en side går rett dit.
- **Animasjonene** lages i CSS eller SVG, ikke som video, og lastes først når vinduet åpnes, så startpakken ikke vokser. For WCAG 2.1 AA (2.2.2) stopper en gjentakende animasjon av seg selv innen fem sekunder eller har en pauseknapp. Med redusert bevegelse på enheten vises ingen animasjon.
- **Vinduet** holder fokus inne til det lukkes, og Esc lukker det. Bakgrunnen gjøres uklar også i WebKit. Det bygger på `Overlegg` fra meldingen om ny versjon (avgjørelse 088).
- **Rollen** gir anbefalte favoritter og kan sette filteret «hvem det gjelder» i kalenderen.
- **Installasjon:** egen hjelp for iPhone og iPad (Del, så Legg til på Hjem-skjerm), Android og skrivebord. Trinnet hoppes over når appen alt er installert.

**Åpne punkter (avklares i fasen)**

- Om brukere som har appen fra før, skal få velkomsten én gang når den kommer.
- Hvilke roller som er med (f.eks. lærer, kontaktlærer, avdelingsleder, rådgiver og rektor), og hvilke favoritter hver rolle får.
- Hvor mange trinn det blir om oppbyggingen, og hva de viser.
- Tekstene og animasjonene i hvert trinn.

**Kontrollpunkt:** Eier går gjennom velkomsten på mobil og skrivebord.

### Fase 11 – Reklamefilm

*(Eier 07.10.2026.)* Tas sist, så filmen viser den ferdige appen.

**Leveranser**

- En kort og enkel reklamefilm for appen.

**Utgangspunkt (forslag fra Claude, godtatt som utgangspunkt av eier 07.10.2026)**

- Opptak av den ekte appen med eksempeldata, uten personopplysninger, med tekst og overganger. Lages i skyøkten med Playwright og ffmpeg.
- Uten tale. Musikk bare med fri lisens, ellers uten musikk.
- Filmen ligger ikke i selve appen, fordi den er for stor.

**Åpne punkter (avklares i fasen)**

- Hvor filmen skal brukes (sosiale medier, nettsiden, presentasjoner), og formatet: liggende (16:9), stående (9:16) eller kvadratisk.
- Lengden, f.eks. 20–30 eller 45–60 sekunder.
- Bokmål, nynorsk eller begge.
- Hvor filmen skal ligge, og om appen skal lenke til den.
- Musikk eller ikke.

**Kontrollpunkt:** Eier godkjenner filmen.

## 5. Kildegrunnlag (første versjon av kilderegisteret)

| Kilde | Nivå | Type | Fase |
|---|---|---|---|
| SFS 2213 med vedlegg 1 og protokoller (KS) | nasjonal | side | 1–3 |
| KS-hovedtariffavtalen | nasjonal | side | 1, 3 |
| Arbeidsmiljøloven | nasjonal | Lovdata-datasett | 1, 3 |
| Opplæringslova | nasjonal | Lovdata-datasett | 3, 4–8 |
| Forskrift til opplæringslova, inkludert vurderingsbestemmelsene | nasjonal | Lovdata-datasett | 3, 4–8 |
| Grep: fag, læreplaner, vurderingsordninger, årstimetall (Udir, NLOD) | nasjonal | grep | 2, 3, 6 |
| Udirs veileder om tilpasset opplæring og individuell tilrettelegging | nasjonal | side | 4 |
| Overordnet del av læreplanverket (Udir) | nasjonal | side | 2, 4, 6 |
| VLFK: lokal forskrift om inntak (Lovdata) | fylke | side | 5 |
| VLFK: skulereglar (Lovdata) | fylke | side | 7 |
| vlfk.no: relevante sider om inntak, tilrettelegging og språk | fylke | side | 4, 5 |
| Nasjonalt skoleregister (Udir) | – | data | innstillinger |
| VIGO Kodeverksbase (Novari IKS): erstattede fag, fag som brukes sammen, fagmerknader og vitnemålsmerknader. Se `docs/VIGO-KODEVERK.md`. | nasjonal | data | 2, 6 |
| utdanning.no (HK-dir): løpene, skolene og tilbudene deres, yrkene (avgjørelse 052 og 053) | nasjonal | data | 2, 5 |
| NOR (Udir, NLOD): opplæringskontorene | nasjonal | data | 5, 6 |
| NDLA (CC BY 4.0): fagene per fagkode | nasjonal | data | 2 |
| Elevundersøkelsen i Udirs statistikkbank (NLOD) | skole, fylke | data | 7 |

Sekundærkilder (partenes tolkninger, B-rundskriv, organisasjonenes veiledninger, opplæringsmateriell for Visma InSchool) brukes som bakgrunn og kan lenkes til, men kopieres ikke inn. Materiale basert på opplæringsloven fra 1998 brukes bare når det er kontrollert mot gjeldende lov, som trådte i kraft 1.8.2024.

## 6. Vedlikehold etter levering

- Ny periode for SFS 2213 (reforhandles før 2028): ny regelfil og nye fasittester side om side med den gamle.
- Kildevarsler behandles når de kommer. *(Eier 07.10.2026:)* Eier får e-post når noe har gått galt eller bør ses på, ikke når alt virker. Hver e-post har hele listen, og det som ikke løser seg selv, kommer igjen som påminnelse til det er løst (avgjørelse 086, `docs/EIER.md` punkt 6b).
- Innhold med status `bor_kontrolleres` gjennomgås minst årlig.
- Nye moduler bestilles som nye oppdrag.

## 7. Åpne punkter

| Punkt | Avklares | Status 30.09.2026 |
|---|---|---|
| Ikon (forslag: innbundet protokollbok med paragraftegn på omslaget) | før fase 0 avsluttes | Avklart |
| Hva «utvidet planfestet arbeidstid ved funksjoner» omfatter, og regler for vikarberegning | ved start av fase 1 | Avklart. Hver funksjon kan utvide planfestet tid eller ikke. |
| Fasiteksempler for SFS 2213 | fase 1 | 001–024 er godkjent. |
| Eiers kontroll av regelverdier og tekster (`kontrollert`) | etter fase 1 | Venter, etter eiers ønske |
| Overtid for deltidsansatte (merarbeid under 100 %) | når dommen er rettskraftig | Praksis inntil videre (eier 30.09.2026): beskjeftigelse over stillingen og opp til 100 % gir variabel lønn med vanlig timelønn, og bare beskjeftigelse over 100 % gir overtid. |
| Periodebeskjeftigelse med funksjoner, eller som del av Arbeidsplan | fase 1 | Avklart. Perioder er en del av Arbeidsplan, og kalkulatoren Periode er fjernet (avgjørelse 015). |
| InSchool-data for årsramme og årstimetall, tabell over programnavn | fase 2 | Fase 2 uten InSchool-data (eier 30.09.2026). Tabellen over programnavn er godkjent (eier 01.10.2026). |
| Fordelingstabellen i Arbeidsplan går utenfor skjermen ved skriftstørrelse på 150 % eller mer (kjent begrensning, README) | senere | Venter, etter eiers ønske |
| Poengberegning ved inntak i Vestland | fase 5 | Venter |
| Oversikt over tilbudene ved hver skole | fase 2 | Avklart. Skolene og tilbudene deres hentes fra utdanning.no (eier 03.10.2026, avgjørelse 053). |
| Gjennomføring per fylke fra kullet som startet i 2020: Udir oppgir det på fylkene fra 2020 til 2023, som ikke kan deles opp | når Udir legger ut kullet | Venter. Appen regner om de eldre kullene. SSB (dagens fylker) prøves fra GitHub Actions for de sju fylkene som mangler (avgjørelse 080). |
| KS: robots.txt nekter ukjente roboter (`User-agent: * Disallow: /`), også for kildesjekken av ks.no. KF Infoserie i nyhetene | fase 7b | Avklart for nyhetene (eier 07.10.2026): KS og KF Infoserie hentes ikke. Nyhetssiden har en fast lenke til KS, og vi spør ikke KS om en feed. Begge står i `docs/KILDER-IKKE-MED.md`. Særavtalesiden på ks.no svarer 403 fra 06.10.2026. Den sjekkes for hånd i kontrollrundene, og Utdanningsforbundets gjengivelse av SFS 2213 sjekkes hver uke som varsel (eier 07.10.2026, avgjørelse 008). |
| Årshjul og eksport til kalender (.ics) | fase 8 | Tatt ut (eier 07.10.2026). Kalenderen dekker behovet. |
| Lokale profiler som deles som fil eller lenke | fase 9 | Tatt ut (eier 07.10.2026). Lokale regler meldes inn og godkjennes av eier, og vises da for alle med samme fylke eller skole. |

## 8. Ferdig når

- Fase 0–11 er levert og godkjent.
- All faglig tekst og alle regelverdier har status `kontrollert`.
- README og `docs/` beskriver arkitektur, innholdsmodell og kilder, og hvordan man legger til en ny modul, en ny regelperiode og en ny fylkes- eller skoleprofil.
