# OPPDRAG – Protokollen

**Versjon:** 1.2 · 30.09.2026 (1.0 → 1.1: appnavn bestemt, utviklingsmiljø lagt til. 1.1 → 1.2: Arbeidsplan bygd i fase 1, kalkulatorene for fordeling og planfestet tid slått sammen med den, fase 3 justert)
**Eier:** Lars Arne
**Utfører:** Claude
**Status:** Plan godkjent, klar for fase 0

> Appen heter *Protokollen*, også som kortnavn på hjemskjermen. Navnet defineres ett sted (`src/config/app.ts`) og hentes derfra til manifest, sidetittel og README.

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
- frister og årshjul

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
│       └── kobling-fagkode.yaml
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
- `frister()` – frister modulen eier (samles i årshjulet i fase 8)
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

Datamodell, oppslagslogikk og tester for nivåene lages i fase 0–1. Grensesnitt for å registrere lokale avtaler kommer i fase 9.

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

- Forsiden har samlet søkefelt øverst, deretter favoritter, hurtigkalkulatorer og moduler gruppert i kategorier.
- Oppsettet skal tåle mange moduler. Når en kategori blir stor, får den egen side.
- Søket treffer moduler, funksjoner, begreper, regler og fag (navn og kode). Kompetansemål ligger i en egen indeks som lastes første gang et søk trenger den.
- Favoritter: funksjoner, fag og begreper. Lagres lokalt og kan sorteres.

### 3.8 Lagring og personvern

- All brukerdata ligger lokalt på enheten: innstillinger, favoritter, scenarier og (fra fase 9) lokale profiler.
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
- Kobling fagkode → årsramme i `rules/sfs2213/kobling-fagkode.yaml`:
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

**Kontrollpunkt:** Eier går gjennom avviksrapporten og et utvalg koblinger.

### Fase 3 – Arbeidsplan som illustrasjon

Mye av denne fasen er bygd i fase 1 (se «Endret underveis» der): Arbeidsplan med tenkt stilling, grafisk fordeling, lokalt lagrede varianter og merkingen «Illustrasjon – ikke en arbeidsplan». Eier har bestemt at variantene kan få navn (30.09.2026). Appen foreslår navn som «Før endring» og ber ikke om personopplysninger.

**Leveranser som gjenstår**

- Fag og grupper hentes fra fagoppslaget i fase 2. Resultater fra andre kalkulatorer kan hentes inn (beskjeftigelse kan allerede føres videre til Arbeidsplan).
- Sammenligning av to varianter side om side, f.eks. med og uten kontaktlærerfunksjon.
- Varianter kan deles som lenke (komprimert tilstand i adressen).

**Kontrollpunkt:** Eier vurderer om illustrasjonen er riktig og pedagogisk nyttig.

### Fase 4 – Tilpasset opplæring og individuell tilrettelegging

**Leveranser**

- Veiviserkomponent: steg, spørsmål og vilkår, utfall, kilder og forklaring. Tastatur- og skjermleservennlig. Tilstanden ligger i adressen, slik at et steg kan deles. Gjenbrukes i fase 5–7.
- Prosessen trinn for trinn fra tilpasset opplæring til individuell tilrettelegging, med vilkår, ansvar, dokumentasjon og frister, etter gjeldende opplæringslov og forskrift og Udirs veileder.
- Særskilt språkopplæring, minoritetsspråkliges rettigheter og rettigheter ved kort butid.
- VLFK-innhold der det er relevant, merket som fylkesinnhold.
- Oppsummeringene skrives under utviklingen som utkast, og eier kontrollerer dem.

**Kontrollpunkt:** Eier kontrollerer prosess, begrepsbruk og kildehenvisninger.

### Fase 5 – Inntak

**Leveranser**

- Søkerkategorier etter opplæringslova, forskriften og VLFKs lokale forskrift om inntak (fylkesinnhold).
- Veiviser: «Hvilken søkerkategori?»
- Tidslinje for søkertidspunkt og frister, og oversikt over rettigheter knyttet til inntak.
- Poengberegning etter gjeldende inntaksregler, med utregning og kilde.
- Uten valgt fylke vises bare nasjonale regler, med merknad.

**Kontrollpunkt:** Eier kontrollerer kategorier, flyt og poengberegning.

### Fase 6 – Vurdering, fravær og eksamen

**Leveranser**

- Vurderingsbestemmelsene i forskriften til opplæringslova: underveis- og standpunktvurdering, grunnlag for vurdering, klage, eksamen og særskilt tilrettelegging.
- Fraværskalkulator per fag: årstimetall fra Grep → hvor mange timer som tilsvarer fraværsgrensen, med forklaring av unntak etter gjeldende regler.
- Veivisere for grunnlag for vurdering og for klagegangen.

Fasen kan flyttes foran fase 4 hvis eier ønsker det, siden den bare bygger på fase 2.

**Kontrollpunkt:** Eier kontrollerer regler, kalkulator og veivisere.

### Fase 7 – Skolemiljø og skoleregler

**Leveranser**

- Aktivitetsplikten trinn for trinn: plikten til å følge med, gripe inn, varsle, undersøke og sette inn tiltak, skjerpet aktivitetsplikt, aktivitetsplan og dokumentasjon, og elevens mulighet til å melde saken til statsforvalteren.
- VLFKs skulereglar: reaksjoner og saksbehandling (fylkesinnhold).
- Plass til skolens egne regler som `supplerer` (skoleinnhold).

**Kontrollpunkt:** Eier kontrollerer innholdet.

### Fase 8 – Frister og årshjul

**Leveranser**

- Samlet oversikt over frister fra alle moduler, filtrert på modul, målgruppe og nivå.
- Visning som årshjul og som liste.
- Eksport til kalender (.ics), generert i nettleseren.

**Kontrollpunkt:** Eier kontrollerer frister og visning.

### Fase 9 – Lokale avtaler og profiler for fylke og skole

**Leveranser**

- Grensesnitt for å registrere lokale avvik (`erstatter`) og lokale regler (`supplerer`) på fylkes- og skolenivå.
- En lokal profil kan eksporteres og importeres som fil eller lenke, slik at kolleger ved samme skole kan bruke samme oppsett.
- Verdier registrert av brukere merkes tydelig som lokale og ikke kontrollert av appens eier.
- Profiler som eier godkjenner, kan legges inn i repoet som faste fylkes- eller skoleprofiler.
- Innhold for nye fylker legges til etter hvert som brukerkretsen vokser.

**Kontrollpunkt:** Eier tester registrering og deling av en skoleprofil.

## 5. Kildegrunnlag (første versjon av kilderegisteret)

| Kilde | Nivå | Type | Fase |
|---|---|---|---|
| SFS 2213 med vedlegg 1 og protokoller (KS) | nasjonal | side | 1–3 |
| KS-hovedtariffavtalen | nasjonal | side | 1, 3 |
| Arbeidsmiljøloven | nasjonal | Lovdata-datasett | 1, 3 |
| Opplæringslova | nasjonal | Lovdata-datasett | 4–8 |
| Forskrift til opplæringslova, inkludert vurderingsbestemmelsene | nasjonal | Lovdata-datasett | 4–8 |
| Grep: fag, læreplaner, vurderingsordninger, årstimetall (Udir, NLOD) | nasjonal | grep | 2, 3, 6 |
| Udirs veileder om tilpasset opplæring og individuell tilrettelegging | nasjonal | side | 4 |
| Overordnet del av læreplanverket (Udir) | nasjonal | side | 4, 6 |
| VLFK: lokal forskrift om inntak (Lovdata) | fylke | side | 5 |
| VLFK: skulereglar (Lovdata) | fylke | side | 7 |
| vlfk.no: relevante sider om inntak, tilrettelegging og språk | fylke | side | 4, 5 |
| Nasjonalt skoleregister (Udir) | – | data | innstillinger |

Sekundærkilder (partenes tolkninger, B-rundskriv, organisasjonenes veiledninger, opplæringsmateriell for Visma InSchool) brukes som bakgrunn og kan lenkes til, men kopieres ikke inn. Materiale basert på opplæringsloven fra 1998 brukes bare når det er kontrollert mot gjeldende lov, som trådte i kraft 1.8.2024.

## 6. Vedlikehold etter levering

- Ny periode for SFS 2213 (reforhandles før 2028): ny regelfil og nye fasittester side om side med den gamle.
- Kildevarsler behandles når de kommer.
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
| InSchool-data for årsramme og årstimetall, tabell over programnavn | fase 2 | Venter |
| Fordelingstabellen i Arbeidsplan går utenfor skjermen ved skriftstørrelse på 150 % eller mer (kjent begrensning, README) | senere | Venter, etter eiers ønske |
| Poengberegning ved inntak i Vestland | fase 5 | Venter |

## 8. Ferdig når

- Fase 0–9 er levert og godkjent.
- All faglig tekst og alle regelverdier har status `kontrollert`.
- README og `docs/` beskriver arkitektur, innholdsmodell og kilder, og hvordan man legger til en ny modul, en ny regelperiode og en ny fylkes- eller skoleprofil.
