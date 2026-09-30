# Arkitektur

Protokollen er en statisk nettapp (PWA) bygget med Vite, Preact og TypeScript (`strict`). Den publiseres på GitHub Pages og har ingen server. All henting fra kilder skjer i skript og GitHub Actions, ikke i appen.

## Lag

```
src/
├── config/app.ts        appnavn og metadata (eneste sted navnet står)
├── app/                 skall, ruting, tilstand, sider (forside, søk, favoritter, innstillinger, om, kilder)
├── core/                ren logikk uten grensesnitt
│   ├── i18n/            tekstoppslag, formatering
│   ├── innhold/         zod-skjema for innhold og kilder, status og gyldighet
│   ├── regler/          regelmotoren: hentVerdi(), periode og nivå
│   ├── lagring/         localStorage med skjemaversjon, migrering, eksport og import
│   ├── sok/             søkeindeks og normalisering mellom målformene
│   └── kildestatus/     lesing av kildestatus og «utdatert»
├── components/          Forklaring, Tallfelt, Resultatkort, merker, kildelenker, ikoner
├── modules/             modulregister og én mappe per modul
├── strings/             nb.ts og nn.ts (alle UI-tekster)
└── styles/              tokens.css (alle farger), tema.css, base.css
```

- `core/` og `modules/<modul>/beregning/` er rene funksjoner med enhetstester.
- Grensesnittet leser tekster med `t('nokkel')` og innhold med `tittel[malform]`.
- Farger står bare i `tokens.css`. `tema.css` gir dem semantiske navn for lyst og mørkt tema. En test sjekker at ingen farger står andre steder.

## Appskall og navigasjon

- **Hash-ruting** (`#/sti`). Hver navigasjon er en ny oppføring i nettleserhistorikken, så operativsystemets tilbakenavigasjon (sveip på iOS, tilbakeknapp på Android) virker som vanlig. Ingen egne sveipebevegelser.
- **Ett scrollområde:** dokumentet. Topplinjen er klebrig, bunnmenyen fast. Begge bruker `env(safe-area-inset-*)`. Høyder bruker `dvh`, og `overscroll-behavior` hindrer at gummistrikk viser tomt område.
- Ved navigasjon flyttes fokus til sidens `h1`. Tilbake gjenoppretter scrollposisjonen.
- `html` og `body` har toppfeltets farge som bakgrunnsfarge (`background-color`). Det er den iOS bruker bak statuslinjen i installerte nettapper, og en fargeovergang teller ikke. `html` har i tillegg en fargeovergang med menyfarge nederst, fordi iOS kan regne visningsområdet for kort ved oppstart, slik at lerretet blir synlig under bunnmenyen. Sidefargen ligger på `.skall`.
- Overskriften som får fokus ved navigasjon, har ingen synlig fokusramme. Det er ikke noe brukeren kan trykke på, men skjermlesere leser den.
- Pinch-zoom er ikke slått av. Bevegelse respekterer `prefers-reduced-motion`.
- Forsiden lastes med en gang. Andre sider og søket lastes ved behov, slik at startpakken holdes liten (grense 150 kB gzip, sjekkes ved bygg).

## Modulregister

Hver modul eksporterer `manifest` fra `src/modules/<modul>/index.ts` (typen står i `src/modules/typer.ts`):

| Felt | Innhold |
|---|---|
| `id`, `navn`, `beskrivelse`, `ikon`, `kategori`, `rekkefolge` | visning på forsiden. `navn` er en tekstnøkkel i `src/strings/` |
| `ruter` | stier (må starte med `/<id>`), tittel og side som lastes ved behov |
| `sokeoppforinger()` | det modulen bidrar med til samlet søk |
| `favorittbare()` | funksjoner, fag og begreper som kan favorittmerkes |
| `frister()` | frister modulen eier (samles i årshjulet i fase 8) |
| `hurtigfunksjoner` | hurtigkalkulatorer på forsiden |
| `kilder` | kilde-id-er fra `content/kilder.yaml` |
| `status` | `aktiv` eller `skjult`. Skjulte moduler vises bare i utvikling og testing |

`src/modules/register.ts` finner modulene automatisk med `import.meta.glob`. Forsiden, søket og favorittene bygges fra registeret, så en ny modul krever ingen endring i forsidekoden.

I utvikling og testing tas også testmodulen i `tests/fixtures/moduler/` med (via den virtuelle modulen `virtual:testoppsett`). I produksjonsbygget er den tom.

## Søk

MiniSearch med prefikssøk og toleranse for skrivefeil. Synonymlisten i `content/sok/synonymer.yaml` gjør nynorske former om til bokmål, både ved indeksering og ved søk, også inne i sammensatte ord («grunnskule» → «grunnskole»).

Indeksen bygges ved `npm run build` av `scripts/bygg-sokeindeks.ts`, som laster registeret gjennom Vite, og lastes første gang søket brukes. I utvikling bygges den i nettleseren med samme funksjon.

## Innhold og regelsett

Innhold ligger som YAML under `content/`, regelsett under `rules/`. En lokal Vite-plugin (`scripts/vite/plugins.ts`) validerer filene mot zod-skjemaet og gjør Markdown om til HTML ved bygg. En ugyldig fil gir byggefeil med lesbar melding. Se [INNHOLDSMODELL.md](INNHOLDSMODELL.md).

## Nivåer: nasjonal, fylke og skole

Innhold og regelverdier har et nivå (`nasjonal`, `fylke`, `skole`) og, for lokale nivåer, et forhold:

- **erstatter:** lokal verdi gjelder i stedet for den generelle. Rekkefølge ved oppslag: skole → fylke → nasjonal.
- **supplerer:** lokal regel gjelder i tillegg. Vises samlet, gruppert etter nivå.

Et regelsett kan være delt på flere filer med samme `id` (feltet `del`), og en regelverdi kan være en tabell, som årsrammene i vedlegg 1 til SFS 2213 ([avgjørelse 007](avgjorelser/007-regelsett-i-flere-filer-og-tabeller.md)). I utvikling og testing lastes også testregelsettene i `tests/fixtures/regler/`, slik at lokale testverdier kan prøves i appen.

`hentVerdi(nokkel, kontekst)` i `src/core/regler/` velger periode (etter dato, eller valgt av brukeren) og nivå, og returnerer `{ verdi, enhet, niva, kilde, kontrollert, periode }`. Grensesnittet merker verdier som ikke er nasjonale (`Nivamerke`) og verdier som ikke er kontrollert (`Statusmerke`).

For innhold velger `velgSynlige()` i `src/core/innhold/status.ts` hva som vises for valgt fylke og skole. Uten valgt fylke vises bare nasjonalt innhold, med merknad om at lokale regler kan gjelde.

## Arbeidstid (SFS 2213)

`src/modules/arbeidstid/` har hovedkalkulatoren Arbeidsplan (id og adresse `arbeidsplan`, side `sider/Arbeidsplan.tsx`; beregningen heter fortsatt `beregning/stillingsplan.ts` fordi fasittestene bruker navnet: undervisning + funksjoner − stillingsprosent, med teknisk undertid eller overtid, fordeling og årslønn) og kalkulatorene for beskjeftigelse, vikartimer og overtid. Arbeidsplan kan også gjelde en periode ([avgjørelse 015](avgjorelser/015-periode-i-arbeidsplan.md)). Fordelingen (`beregning/fordeling.ts`) vises i Arbeidsplan. `beregning/planfestet.ts` regner punkt 5.3 for én funksjon og brukes av fasittestene og av fordelingen. Funksjoner og redusert undervisning har egne komponenter i `komponenter/Funksjoner.tsx`. Se [avgjørelse 014](avgjorelser/014-arbeidsplan-samler-fordeling-og-planfestet.md).

- Beregningene i `beregning/` er rene funksjoner. De får regelverdiene gjennom en `Hent`-funksjon (i appen `hentVerdi()` med brukerens dato, fylke og skole), så ingen tariff- eller lovverdier står i koden.
- Hver beregning gir resultatet og **trinnene** i utregningen. Et trinn har en id, operandene (verdi, enhet, og om verdien kommer fra regelverket, en tabell, brukeren eller et tidligere trinn) og resultatet. Teksten og formelen for hvert trinn står i `src/strings/moduler/arbeidstid.*.ts` med plassholdere, f.eks. `{arstimer} ÷ {arsramme} × 100`. Appen fyller formelen inn to ganger: med navn og med tall. Kilde og nivå vises for hver regelverdi.
- **Rette en utregning:** tall rettes i `rules/`, formeltekster i `src/strings/`, metodebeskrivelser i `content/arbeidstid/metoder.yaml`, og selve regnestykket i `beregning/`. Fasittestene (`tests/fasit/sfs2213/`) viser om svarene fortsatt stemmer.
- Mellomregninger avrundes ikke. Svar vises med to desimaler.
- Fag velges med et søk i vedlegg 1 (`fagsok.ts`), med søkeord fra `rules/sfs2213/fagsok-2026-2027.yaml` og programområder fra Grep (`data/grep/programomrader.json`, `npm run hent:grep`). Det utfylte huskes i nettleserhistorikken (`useSkjematilstand`), se [avgjørelse 009](avgjorelser/009-fagsok-og-skjematilstand.md).
- Når brukeren velger fag, fylles årstimene inn fra `rules/sfs2213/arstimer-2026-2027.yaml` (radnummer i vedlegg 1 → årstimer og fagkoder i Grep). Brukeren kan endre tallet. `npm run hent:grep` henter omfanget for fagkodene til `data/grep/arstimer.json`, og en enhetstest sjekker at tabellen stemmer med Grep. Se [avgjørelse 011](avgjorelser/011-arstimer-fra-grep.md).
- `Kalkulatorside` har skjemaet og resultatet i hver sin del. På bred skjerm står de i to kolonner. Det som står i `etter`, kommer under begge. «Åpne i nytt vindu» åpner siden i et eget vindu, som leser skjemaet fra vinduet som åpnet det. Se [avgjørelse 012](avgjorelser/012-arbeidsplan-fullskjerm-og-nye-vinduer.md). Kortene kan legges sammen med et trykk på overskriften (`src/components/Sammenlegg.tsx`), se [avgjørelse 013](avgjorelser/013-kort-som-kan-legges-sammen.md). «Lagrede varianter» (`Varianter.tsx`) lagrer utfyllingen og hovedresultatet i `scenarier` i lagringen på enheten (høyst tre per kalkulator).
- Resultatkortet (`Utregningskort`) viser hovedsvaret i en fast linje nederst når kortet er utenfor skjermen, og kan kopiere utregningen som tekst. Korte forklaringer ligger bak «?» (`Hjelp`). Se [avgjørelse 010](avgjorelser/010-resultatlinje-hjelp-og-kopiering.md).

## Lagring og personvern

`src/core/lagring/` lagrer ett dokument i `localStorage` med `skjemaversjon`. Eldre versjoner migreres, ugyldige data erstattes med standardverdier, og hvis lagring ikke er mulig (privat nettlesing), holdes data i minnet med en merknad. Innstillinger og favoritter kan eksporteres og importeres som JSON. Ingen informasjonskapsler, ingen analyse, ingen kall til eksterne tjenester.

## PWA

vite-plugin-pwa (Workbox). Appskallet og all kode forhåndslagres. `data/**` hentes med «stale-while-revalidate», så sist besøkte data virker uten nett. Kildestatus hentes med «network-first». Når en ny versjon er lastet ned, vises «Ny versjon er klar» med knapp for å oppdatere.

### Ikonet

Ikonet har én kildefil: `ikon/ikon.svg` (kvadratisk, full bakgrunn, motivet innenfor midtre 80 %). `npm run lag:ikoner` lager alle størrelser i `public/ikoner/` med faste filnavn. Manifest, `index.html` og kode peker bare på filnavnene. Logoen i topplinjen (`logo.svg`) lages av samme fil: elementet med `id="bakgrunn"` fjernes, og bildet beskjæres til motivet, så logoen passer i både lyst og mørkt tema. Mangler `id="bakgrunn"`, brukes ikonet som det er.

**Bytte ikon:** legg inn ny `ikon/ikon.svg`, kjør `npm run lag:ikoner`, og lag en ny versjon. Ingen annen kode endres. På iPhone kan det gamle ikonet bli liggende på hjemskjermen til appen legges til på nytt.

## Kilder, kildejobb og kildestatus

Kilderegisteret er `content/kilder.yaml`. `docs/KILDER.md` genereres fra det, og en test sjekker at den er oppdatert.

`.github/workflows/kilder.yml` kjører hver mandag og kan startes manuelt:

1. `scripts/kilder/sjekk.ts` sjekker de aktive kildene:
   - `side`: henter siden, trekker ut delen `uttrekk.selektor` peker på, normaliserer teksten og lager et fingeravtrykk (SHA-256). Avviker det fra `godkjent_fingeravtrykk`, blir status `endret`.
   - `nsr`: henter aktive videregående skoler fra Nasjonalt skoleregister til `data/skoler/vgs.json`. Oppdateres automatisk, med endringsrapport i jobbsammendraget.
   - `kf-infoserie`: henter avtaletekster hos KF Infoserie med Chromium (Playwright), fordi siden krever nettleser.
   - `fil`: fingeravtrykk av hele filen, f.eks. PDF-en av hovedtariffavtalen.
   - `lovdata`: laster ned Lovdatas datasett med gjeldende lover og sjekker delen `uttrekk.selektor` peker på.
   - `grep` lages i fase 2. Se [avgjørelse 008](avgjorelser/008-kildesjekk-for-avtaletekst-pdf-og-lovdata.md).
2. Statusfilen `data/status/kildestatus.json` committes ved hver kjøring. Det holder den planlagte jobben i live (GitHub slår av planlagte jobber etter 60 dager uten aktivitet).
3. `scripts/kilder/varsle.ts` oppretter én sak per kilde (etikett `kilde`) ved endring eller feil, oppdaterer den når tilstanden endres, og lukker den når kilden er i orden igjen.
4. Arbeidsflyten publiserer siste versjon på nytt med fersk statusfil. Koden på Pages endres bare ved ny versjon.

Inndata `simuler_feil` gir simulert feil for én kilde, for å teste varslingen.

I appen viser topplinjen en diskret indikator (`ok`, `endret`, `feilet`, `utdatert`). Et varsel kan skjules på enheten til neste kjøring (lagres som `skjultKildevarsel`). Kildesiden viser neste planlagte kjøring, beregnet fra `app.kildesjekk` i `src/config/app.ts`. En test sjekker at den stemmer med cron i `kilder.yml`. `utdatert` betyr at siste kjøring er eldre enn 14 dager. Det fanger også en jobb som har stoppet. Detaljer står under Om → Kilder.

## Publisering

- `ci.yml`: lint, typesjekk, tester, bygg og ende-til-ende-tester på hver PR og hver push til `main`.
- `deploy.yml`: en tag `vX.Y.Z` starter publisering. Arbeidsflyten kjører fra `main` (GitHub Pages tillater som standard bare publisering derfra), bygger koden fra taggen og sjekker at taggen og versjonen i `package.json` stemmer. Tilbakerulling: kjør «Publiser» manuelt med forrige tag.
- Versjonen bygges inn fra `package.json` og vises under «Om».

## Legge til noe nytt

### Ny modul

1. Lag `src/modules/<id>/index.ts` som eksporterer `manifest` (se `src/modules/begreper/` og testmodulen i `tests/fixtures/moduler/testmodul/`).
2. Legg navn og tekster i `src/strings/nb.ts` og `nn.ts`.
3. Legg innhold i `content/<id>/` og nye kilder i `content/kilder.yaml`. Kjør `npm run kilder:dokumenter`.
4. Beregninger i `src/modules/<id>/beregning/` som rene funksjoner med tester.
5. Sett `status: 'skjult'` til eier har godkjent modulen.

### Ny regelperiode

1. Legg ny fil i `rules/<regelverk>/`, f.eks. `rules/sfs2213/2028-2029.yaml`, med `gyldig_fra` og `gyldig_til` som ikke overlapper forrige periode. Alle verdier får `kontrollert: null`.
2. Legg nye fasittester i `tests/fasit/<regelverk>/` (etter eiers godkjenning).
3. Ingen kodeendring. `hentVerdi()` velger perioden etter dato, og brukeren kan velge en annen.

### Ny fylkes- eller skoleprofil

1. Regelverdier: ny fil i `rules/<regelverk>/` med `gyldighet: { niva: fylke, fylke: "46", forhold: erstatter }` (eller `niva: skole` med `skole: <orgnr>`), og bare verdiene som avviker.
2. Innhold: samme `id` som det nasjonale elementet og `forhold: erstatter` for å erstatte, eller ny `id` og `forhold: supplerer` for å komme i tillegg.
3. Tester for oppslag på det nivået, etter mønster fra `tests/unit/regler.test.ts`.
