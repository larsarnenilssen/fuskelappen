# OPPDRAG – Fuskelappen

**Versjon:** 1.4 · 01.10.2026 (1.0 → 1.1: appnavn bestemt, utviklingsmiljø lagt til. 1.1 → 1.2: Arbeidsplan bygd i fase 1, kalkulatorene for fordeling og planfestet tid slått sammen med den, fase 3 justert. 1.2 → 1.3: fase 2 uten InSchool-data. 1.3 → 1.4 (01.10.2026): videre arbeid i fase 2 etter eiers innspill, ny forside)
**Eier:** Lars Arne
**Utfører:** Claude
**Status:** Plan godkjent, klar for fase 0

> Appen heter *Fuskelappen* (fra 0.17.0, eier 02.10.2026, før *Protokollen*), også som kortnavn på hjemskjermen. Adressen, repoet og lagringsnøkkelen har også fått det nye navnet (avgjørelse 034). Navnet defineres ett sted (`src/config/app.ts`) og hentes derfra til manifest, sidetittel og README.

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

- Forsiden har samlet søkefelt øverst, deretter favoritter og moduler gruppert under overskrifter.
- *(Endret 01.10.2026, eier:)* Hver overskrift har én til tre hovedbokser og eventuelt én sammenleggbar boks med resten. Under «Arbeidstid» står Arbeidsplan som egen boks og de andre kalkulatorene i den sammenleggbare boksen. Egen overskrift for hurtigkalkulatorer og mellomsiden for arbeidstid tas bort, og gamle adresser sendes videre.
- Oppsettet skal tåle mange moduler. Forsiden bygges fortsatt bare fra modulregisteret.
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
- Pakke 2 er bygget: **Søknad og frister gjennom året**, en tidslinje over inntaksåret med filter og Vestland-frister (avgjørelse 046). Datoene for svar og andre inntak står på Vilbli, som appen lenker til.
- Venter på vestlandfylke.no: antall inntaksområdepoeng og Vestlands klagenemnd.

**Kontrollpunkt:** Eier kontrollerer kategorier, flyt og poengberegning.

### Fase 6 – Vurdering, fravær og eksamen

**Leveranser**

- Vurderingsbestemmelsene i forskriften til opplæringslova: underveis- og standpunktvurdering, grunnlag for vurdering, klage, eksamen og særskilt tilrettelegging.
- Fraværskalkulator per fag: årstimetall fra Grep → hvor mange timer som tilsvarer fraværsgrensen, med forklaring av unntak etter gjeldende regler.
- Se `docs/VIGO-KODEVERK.md` for data fra VIGO Kodeverksbase som kan brukes: vurderingsordning per fagkode, karakterkoder og fagmerknader knyttet til fag. Fagmerknadene og vitnemålsmerknadene er alt i begrepsbanken (avgjørelse 026).
- Veivisere for grunnlag for vurdering og for klagegangen.
- Kobling begge veier mellom vurdering og eksamen og de to veiviserne i Tilrettelegging (eier 03.10.2026): for eksempel individuelt tilrettelagt opplæring uten vurdering med karakter, fritak fra vurdering med karakter i innføringsopplæring, og læreplanene i særskilt språkopplæring som ikke gir karakter.

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
| InSchool-data for årsramme og årstimetall, tabell over programnavn | fase 2 | Fase 2 uten InSchool-data (eier 30.09.2026). Tabellen over programnavn er godkjent (eier 01.10.2026). |
| Fordelingstabellen i Arbeidsplan går utenfor skjermen ved skriftstørrelse på 150 % eller mer (kjent begrensning, README) | senere | Venter, etter eiers ønske |
| Poengberegning ved inntak i Vestland | fase 5 | Venter |
| Oversikt over tilbudene ved hver skole | fase 2 | Utgår til en åpen kilde finnes (eier 01.10.2026). Lenker til Vilbli brukes. |

## 8. Ferdig når

- Fase 0–9 er levert og godkjent.
- All faglig tekst og alle regelverdier har status `kontrollert`.
- README og `docs/` beskriver arkitektur, innholdsmodell og kilder, og hvordan man legger til en ny modul, en ny regelperiode og en ny fylkes- eller skoleprofil.
