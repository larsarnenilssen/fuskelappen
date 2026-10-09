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
| `npm run build:test` | lager testversjonen som publiseres under `test/` (avgjørelse 045) |
| `npm run lint` | lint |
| `npm run typecheck` | typesjekk |
| `npm test` | enhets-, innholds- og fasittester |
| `npm run test:e2e` | hele ende-til-ende-suiten, Playwright i WebKit og Chromium (kjøres i CI) |
| `npm run test:e2e:berorte` | bare de berørte ende-til-ende-testene, i WebKit mobil (avgjørelse 055) |
| `npm run kilder:sjekk` | kjører kildesjekken lokalt |
| `npm run hent:grep` | henter Grep-data og lager endringsrapport |

En endring er ikke ferdig før alle er grønne. Lokalt kjøres `test:e2e:berorte`, og hele ende-til-ende-suiten kjøres i CI med bygget én gang og åtte jobber (avgjørelse 055). Kjør ikke hele suiten lokalt uten grunn.

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
- Hver fase startes i en ny samtale med arbeidsordren i `docs/arbeidsordrer/fase-N.md` (eier 02.10.2026). Når en fase er levert, skrives arbeidsordren for neste fase.
- Arbeid på en egen gren per fase eller oppgave, og slå sammen til `main` via PR med grønn CI.
- Claude fletter PR-ene på eiers vegne når CI er grønn og det ikke er konflikter (eier 01.10.2026). Er CI rød, rettes feilen først.
- Eier kan teste en gren før versjonen avtales: push grenen til `test` (`git push origin <gren>:test --force`), så publiseres den under `test/` ved siden av appen, f.eks. `https://jukselappen.no/test/` (avgjørelse 045 og 065).
- Versjonstag settes bare når eier og Claude er enige om at en versjon skal publiseres, og hvilket nummer den får. Da setter Claude taggen og følger med til publiseringen er ferdig (eier 01.10.2026).
- Versjons-PR-en har 1–4 korte punkter om det som er nytt i `content/versjoner.yaml`, på bokmål og nynorsk. De vises i meldingen om ny versjon i appen (avgjørelse 088, testes).
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
- Oppramsinger har ikke komma foran siste «og»/«eller»: «A, B og C», ikke «A, B, og C». Komma mellom helsetninger står («…, og skolen sender …»). Testes i `tests/unit/oxfordkomma.test.ts`, som har en kort unntaksliste.
- Nytt eller endret faglig eller juridisk innhold får alltid `kontrollert: null`. **Sett aldri `kontrollert` selv.** Det gjør bare eier, eller du etter eksplisitt beskjed fra eier, med dato. Godkjenningsjobben (`/godkjent` i en kontrollsak, avgjørelse 021) regnes som eiers beskjed.
- **Endre aldri fasittester** uten eiers godkjenning. Feiler en fasittest, er det koden eller regelsettet som skal undersøkes.
- Bruk gjeldende regelverk: opplæringslova og forskriften som gjelder fra 1.8.2024. Eldre materiale er bare bakgrunn.
- Lov- og forskriftstekst kan siteres. Partenes tolkninger, andres veiledninger og Visma-materiell kopieres ikke. Skriv med egne ord og lenk til kilden.
- Appen er skrevet for fylkeskommunale skoler. Der privatskolelova eller forskriften til den gir egne regler, får kortet eller steget `privatskole` (tekst og kilder), som vises når brukeren har valgt «Privatskole». Paragrafer i opplæringsforskrifta med en parallell i privatskoleforskrifta føres i `content/privatskole/paralleller.yaml` (avgjørelse 075).
- Innhold og verdier har riktig `gyldighet` (nasjonal, fylke eller skole). Fylkes- og skoleinnhold vises bare når brukeren har valgt fylke eller skole.
- Data under NLOD (Udir, Lovdata) krediteres under «Om».
- Oppdater `godkjent_fingeravtrykk` i kilderegisteret bare etter beskjed fra eier.
- En ny kilde får `godkjent: null` i kilderegisteret. **Sett aldri `godkjent` selv.** Det gjør bare eier, med `/godkjent` i kontrollsaken, eller du etter eksplisitt beskjed fra eier, med dato. Appen viser ikke om en kilde er godkjent, bare om den virker, er endret nylig eller ikke svarer (eier 08.10.2026, avgjørelse 089).
- En kilde som skulle vært med, men som ikke kan hentes (robots.txt, stengt, ingen feed, ingen lisens), føres i `docs/KILDER-IKKE-MED.md` med hva som kan åpne den. Blir den tatt med eller gitt opp, oppdateres raden (eier 07.10.2026).
- Nytt innhold i `content/` får 1–5 `kontrollsporsmal` til eier om det som er usikkert: om en formulering kan misforstås, om en praksis stemmer. Eier skal kunne svare ut fra kildene: oppgi `punkt` for hver kilde (og `url` til avsnittet når kilden har egne adresser for avsnitt). Kontrolloversikten og kontrollrundene viser kildene med lenke under hvert spørsmål (eier 01.10.2026). Ny praksis eller tolkning som ikke står i kildene, føres i `content/kontroll/praksis.yaml` med `bekreftet: null`. Sett aldri `bekreftet` selv.
- Tall i `rules/` fra en kilde får et `sitat` (kort, ordrett utdrag der tallet står). Tall som ikke står i kilden, får `grunnlag: avledet` eller `grunnlag: praksis` og en merknad. Automatisk samsvar med kilden er ikke det samme som eiers kontroll.

## Personvern

- Ingen personopplysninger i repo, testdata, skjermbilder eller issues.
- All brukerdata lagres lokalt på enheten. Ingen informasjonskapsler eller analyse.

## Grensesnitt

- Utseendet følger `docs/DESIGN.md` (kort, flater, overskrifter, valgknapper, to kolonner, veiviserne og tall). Finnes det et mønster der, brukes det i stedet for en ny variant (fase 8b, eier 08.10.2026).
- Ett scrollområde. Ingen horisontal overflyt i 320–430 px (testes).
- Native scroll og tilbakenavigasjon. Ingen egne sveipebevegelser for navigasjon.
- Pinch-zoom slås ikke av globalt.
- Forklaringer er skjult til brukeren åpner dem.
- Merker, piler og ikoner som står sammen med tekst, står midt i teksthøyden: `vertical-align: middle` i løpende tekst, `align-items: center` i flex og grid, uten egne småjusteringer (eier 08.10.2026, avgjørelse 092). Testes for alle rutene.
- Meldinger over hele appen, som meldingen om ny versjon og velkomsten, bruker `Overlegg`: et kort over et uklart slør, med tynn ramme i merkefargen (eier 08.10.2026, avgjørelse 088).
- Nye sider med flere deler står i to kolonner på skrivebord (`ToKolonner`, fra 64rem): de første delene til venstre og resten til høyre, så rekkefølgen på mobil er den samme. Kildene til siden står i en lukket boks nederst i høyre kolonne (`Kildeboks`), ikke rett på bakgrunnen (eier 06.10.2026, avgjørelse 074).
- Kort, bokser og rader som kan åpnes, husker for siden om de er åpne (`useHusketApen`), så tilbake fra en lenke (f.eks. en paragraf under «I regelverket») viser siden slik den var, der den var (eier 06.10.2026, avgjørelse 072).
- Kort og bokser med kilder har regelverket og kildene som lukkede rader nederst (`Kortfot`): «I regelverket (n)» med paragrafene i Lov og forskrift, og «Kilder (n)». De har ikke egne kildelinjer. En knapp i kortet, f.eks. «Mer om …», står over radene. Lister med lenkekort (f.eks. overganger) har ingen kilder i kortene, men radene samlet under listen (eier 06.10.2026, avgjørelse 071). Unntak: utregningen i kalkulatorene, kilderadene i poengberegningen og dagens jukselapp, som lenker til siden der kildene står (eier 08.10.2026).
- Tall fra Videregående i tall på andre sider står i en `Tallboks`: merkelappen «Videregående i tall», en tittel som sier hva tallene er og hvor de gjelder, tallene, og lenken og kilden. Boksen står etter sidens eget innhold: nederst på siden, eller nederst i høyre kolonne over kildene (eier 08.10.2026, avgjørelse 091).
- Alle sider har sti øverst (`Brodsmuler`, i én avrundet flate med piler mellom leddene, eier 08.10.2026), unntatt forsiden og sidene rett under den: oversiktene i modulene, kategoriene, søket, innstillingene og Om appen (eier 05.10.2026). Testes for rutene i `tests/e2e/hjelp.ts`, så nye sider kommer med av seg selv.
- WCAG 2.1 AA. Test i WebKit, ikke bare Chromium.
- Ende-til-ende-tester som bare gjelder mobil (overflyt, axe), merkes `@mobil`. Overflyt testes i lys visning, axe i lys og mørk. En ny modul får en spesifikasjon i `tests/e2e/` og en linje i `MODULSPEKER` i `scripts/e2e/velg.ts`.

## Legge til noe nytt

- **Ny modul:** ny mappe i `src/modules/` med manifest, innhold i `content/<modul>/`, kilder i kilderegisteret, tester. Manifestet har `fakta()` til dagens jukselapp, med logikken i `fakta.ts` (avgjørelse 086). En modul uten fakta gir en tom liste.
- **Favoritter og ikoner:** Alle sider har stjernen ved overskriften (`Sidetopp`, testes for rutene i `tests/e2e/hjelp.ts`). Elementer uten egen side (en skole, en paragraf) får den diskré stjernen (`FavorittKnapp liten`) når de har en adresse favoritten kan åpne. Alt med stjerneknapp har en oppføring i modulens `favorittbare` (testes). En favoritt kan ha eget `ikon`. Uten får den ikonet til den nærmeste inngangen over: boksene på forsiden og lenkene med ikon på modulens oversiktssider (`undersider`), ellers modulens ikon (`ikonForFavoritt`, avgjørelse 056 og 058). En oversiktsside med egne ikoner henter dem fra `undersider`, så de ikke kan bli ulike.
- **Ny regelperiode:** ny fil i `rules/<regelverk>/` og nye fasittester. Det skal ikke trengs kodeendringer.
- **Nytt begrep:** lenkes automatisk i brødtekst med tittelen. Er ikke tittelen ordet som står i teksten, får begrepet `lenkeord` (avgjørelse 050). Begrepet får temaet til filen det står i under `content/begreper/`. En ny fil føres opp i `src/modules/begreper/tema.ts` (testes).
- **Velkomsten (avgjørelse 094):** Får appen en ny del eller et nytt valg som brukeren bør kjenne til, vurder om velkomsten skal nevne det. Tekstene står i `src/strings/velkomst.*.ts`, og rollene med forslag til favoritter i `src/app/velkomst/roller.ts` (testes).
- **Lokale regler (avgjørelse 093):** Kan noe nytt variere lokalt (fylke, skole eller lokal avtale), blir det et valg under Lokale regler. En ny regelverdi får `lokal: true` eller `lokal: false`, og en lokal verdi får et navn i `src/strings/moduler/lokaleregler.*.ts`. En ny modul har `lokaleRegler` i manifestet (temaene den har en side for, eller en tom liste). Testes. Er du i tvil, spør eier (eier 08.10.2026).
- **Godkjenne en lokal regel:** Innmeldingen fra e-posten legges inn i `lokale/regler.yaml` med `kontrollert: null` og kontrollspørsmål. `kontrollert` settes bare etter eiers beskjed, med dato. Vedlegg, navn og underskrifter legges aldri i repoet.
- **Ny fylkes- eller skoleprofil:** innhold og verdier med riktig `gyldighet`, og tester for oppslag på det nivået.
