# Arbeidsordre: fase 5

Lim inn teksten under streken som første melding i en ny samtale.

---

Vi starter fase 5 i Fuskelappen (repo `larsarnenilssen/fuskelappen`). Skriv til meg på bokmål, kort og enkelt.

**Les først:**
- `AGENTS.md` (faste regler)
- `OPPDRAG.md` (fase 5 og «Gjelder alle faser»)
- `CHANGELOG.md` (siste versjoner)
- Avgjørelsene i `docs/avgjorelser/`:
  - om innhold og kontroll (016, 017, 019, 021)
  - om Regelverk (039)
  - om veiviseren (041) og fargene til veiviserne (042)
  - om VIGO (026)
- `docs/VIGO-KODEVERK.md`

**Status:** Fase 4 er levert. Siste publiserte versjon er 0.25.0 (03.10.2026):
- Modulen Tilrettelegging har to veivisere: «Tilpasset opplæring og individuell tilrettelegging» (blå) og «Særskilt språkopplæring og kort botid» (lilla).
- Veiviseren er en felles komponent (`src/components/Veiviser.tsx`). Stegene er innhold i YAML (`type: veiviser` og `type: steg`). Den har fasestolpe, kart over hele prosessen og en kopierbar oppsummering.
- Et steg kan vise læreplaner fra Grep i en boks (`laereplaner`), med fagkodene per trinn.
- Uløst: vestlandfylke.no svarte ikke i fase 4. Sjekk først om sidene svarer igjen. Den lokale forskriften om inntak for Vestland ligger allerede i Regelverk (`data/lovdata/vestland-inntak.json`).

**Fase 5: Inntak.** Hver pakke er én gren, én PR og én versjon:

1. **Søkerkategorier og rettigheter**
   - Søkerkategoriene og rettighetene ved inntak etter opplæringslova, forskriften og den lokale forskriften om inntak i Vestland.
   - Innholdet fra den lokale forskriften er fylkesinnhold og vises bare når Vestland er valgt. Uten valgt fylke står bare de nasjonale reglene, med en merknad.
   - Veiviseren «Hvilken søkerkategori?» bygges med den felles komponenten. Den får neste ledige farge (turkis).
   - Lenk til paragrafene i Regelverk. Lenk begge veier til veiviseren om særskilt språkopplæring der rett til videregående og kort botid henger sammen (steget «Kort botid?»).
2. **Tidslinje og frister**
   - Når søkerne søker, og fristene gjennom året: søknad, svar, tilbud, ventelister og klage.
   - Vis det som en tidslinje som gir oversikt med ett blikk, og som virker på mobil og PC.
3. **Poengberegning**
   - Poengberegning etter gjeldende inntaksregler, med utregningen synlig og kilde for hver regel.
   - Beregningen er rene funksjoner i `src/modules/<modul>/beregning/` med tester. Tall fra regelverket leses fra `rules/` via `hentVerdi()`, med `sitat`.
   - Bruk data fra VIGO Kodeverksbase der det passer: hvilke fag som teller for poeng, og hva et programområde gir grunnlag for å søke videre på.

**Start med å legge fram for meg:**
- Søkerkategoriene og stegene i veiviseren, med kildene du vil bygge på (paragraf og avsnitt).
- Hvilke frister og datoer tidslinjen skal ha, og hvor de står.
- Reglene for poengberegningen, med kilde, og hvilke eksempler du foreslår som fasittester. Fasittestene godkjenner jeg før de legges inn.
- Hvilke nye begreper du foreslår til begrepsbanken.
- Om det trengs en ny modul for inntak, eller om noe passer i en modul som finnes.

Bygg først når jeg har godkjent dette.

**Ønsker fra fase 4 som gjelder videre:**
- Visualisering er viktigere enn å gjengi kildene ord for ord. Appen skal gi bedre og raskere oversikt enn kildene.
- God UI både på mobil og PC.
- Lange lister grupperes og står lukket til brukeren åpner dem.
- Kobling begge veier mellom vurdering og eksamen og veiviserne i Tilrettelegging venter til fase 6.

**Regler for innholdet:**
- Alt nytt innhold får `kontrollert: null` og 1–5 kontrollspørsmål med `punkt` (og `url` der kilden har egne adresser).
- Tolkninger som ikke står i kildene, føres i `content/kontroll/praksis.yaml` med `bekreftet: null`.
- Er noe faglig eller juridisk uklart, spør meg. Gjett aldri på hva en regel betyr.
- Vis meg skjermbilder (iPhone 15 Pro, WebKit) før testene kjøres, så vi kan diskutere løsningene. Kjør ikke lange tester før vi er enige om en versjon å teste.

**Praktisk:**
- Playwright lokalt: `PLAYWRIGHT_BROWSERS_PATH=/root/pw163 npx playwright test <fil> -g "<test>"`. Kjør enkelttester lokalt. Hele runden går i CI, delt på seks jobber (avgjørelse 040), og tar rundt fem minutter.
- Skjermbilder: `npm run build`, så `npx vite preview --port 4173`. Ta bildene med et Playwright-skript som kjøres fra repoets rot (skriptet må finne `@playwright/test`). Slett skriptet etterpå.
- Lovdata kan bare nås fra GitHub Actions. Lokale data i `data/lovdata/` hentes av kildesjekken.
- Bruk ikke `pkill -f` eller `ps | grep` med kommandoteksten. Begge kan treffe ditt eget skall.
- Kjør ikke `prettier` på filer. Repoet har ingen oppsett for det, og den skriver om hele filen.
- Kontrollsaker godkjennes med `/godkjent`. Sett aldri `kontrollert`, `bekreftet` eller `godkjent_fingeravtrykk` selv.
- Claude fletter PR-ene når CI er grønn og det ikke er konflikter. Versjonsnummeret avtales med meg, og taggen settes av arbeidsflyten «Sett versjonstag» når versjonen i `package.json` endres på main.
