# 060 – Lager for Grep-hentingen

**Kontekst:** Fra oktober 2026 svarer Grep (data.udir.no) 429 («for mange forespørsler») og slipper bare gjennom om lag 1,7 forespørsler i sekundet fra GitHub Actions. En full henting er omtrent 5 000 forespørsler, altså 45–50 minutter, og kildesjekken gir Grep 20 (#91, #93). Kildesjekkene 04. og 05.10.2026 ble stoppet halvveis, og appen beholdt forrige henting. Listene i Grep oppgir for hvert element når det sist ble endret («sist-endret»). Eier har opplyst at et element i Grep ikke endres oftere enn én gang i året (05.10.2026).

**Valg:**
- **Lageret:** `scripts/grep/lager.ts` lagrer detaljene for hvert element (programområder, opplæringsfag, fagkoder, læreplaner og kompetansemålsett) med «sist-endret» fra listen og datoen for hentingen. Lageret er én gzip-fil.
- **Hva som hentes:** `npm run hent:grep` henter detaljene bare for elementer som er nye, har ny «sist-endret», eller er eldre enn sin maksimale alder. Den maksimale alderen er mellom 180 og 359 dager, spredt etter koden. Da fanges endringer i elementer som et element viser til, uten at alt hentes samme uke.
- **Avbrudd:** Lageret skrives underveis og når hentingen stoppes. Neste kjøring fortsetter der forrige slapp.
- **Opprydding:** Etter en fullført henting fjernes elementer som ikke lenger er i bruk.
- **Kildesjekken** henter lageret fra grenen `grep-lager` og lagrer det der igjen, også når Grep ble stoppet. Grenen har én commit, som skrives over, så historikken i repoet ikke vokser. Den starter ingen arbeidsflyter. GitHubs hurtiglager for Actions brukes ikke, fordi det slettes etter sju dager uten bruk, og kildesjekken går hver sjuende dag.
- **Utenfor kildesjekken** ligger lageret i `.generert/grep-lager.json.gz`. `GREP_LAGER` kan peke på en annen fil.

**Konsekvens:** En vanlig ukentlig henting tar noen få minutter. Dataene i appen bygges som før og testes på samme måte. Mangler lageret eller kan det ikke leses, hentes alt på nytt, og det kan ta to eller tre kjøringer før hentingen er fullført.
