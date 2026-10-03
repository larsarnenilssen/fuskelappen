# Arbeidsordre: fase 4

Lim inn teksten under streken som første melding i en ny samtale.

---

Vi starter fase 4 i Fuskelappen (repo `larsarnenilssen/fuskelappen`). Skriv til meg på bokmål, kort og enkelt.

**Les først:**
- `AGENTS.md` (faste regler)
- `OPPDRAG.md` (fase 4 og «Gjelder alle faser»)
- `CHANGELOG.md` (siste versjoner)
- Avgjørelsene i `docs/avgjorelser/` om innhold og kontroll (særlig 016, 017, 019 og 021), om Læreplanverket (037) og om Regelverk (039)

**Status:** Fase 3 er levert. Siste publiserte versjon er 0.22.0 (02.10.2026):
- Modulen Regelverk har lover, forskrifter, lokale forskrifter for valgt fylke, og avtaler med egne ord.
- Hver paragraf har egen adresse, f.eks. `#/lov/opplaeringslova/11-6`.

**Fase 4: Tilpasset opplæring og individuell tilrettelegging.** Hver pakke er én gren, én PR og én versjon:

1. **Veiviseren** (OPPDRAG, fase 4, «Leveranser»)
   - En felles komponent med steg, spørsmål og vilkår, utfall, kilder og forklaring.
   - Den skal kunne brukes med tastatur og skjermleser.
   - Tilstanden ligger i adressen, så et steg kan deles.
   - Den skal gjenbrukes i fase 5–7, så lag den generell.
   - Vis meg skjermbilder av et lite eksempel før du bygger videre.
2. **Fra tilpasset opplæring til individuell tilrettelegging**
   - Prosessen trinn for trinn etter opplæringslova kapittel 11 og forskriften, med vilkår, ansvar, dokumentasjon og frister.
   - Bruk Udirs veileder (`udir-veileder-tilpasset-opplaering`, slå på kilden).
   - Lenk til paragrafene i Regelverk, ikke bare til Lovdata.
3. **Særskilt språkopplæring og rettigheter for minoritetsspråklige**, også ved kort botid.
   - Innhold fra Vestland fylkeskommune er fylkesinnhold og vises bare når Vestland er valgt.

**Start med å legge fram for meg:**
- En liste over stegene i hver veiviser, med kildene du vil bygge på (paragraf og avsnitt i veilederen).
- Hvilke Udir-sider og hvilke sider fra Vestland fylkeskommune du vil bruke. Vilkårene for gjenbruk av vlfk.no er ikke avklart, så skriv med egne ord og lenk.
- Hvilke nye begreper du foreslår til begrepsbanken.

Bygg først når jeg har godkjent dette.

**Regler for innholdet:**
- Alt nytt innhold får `kontrollert: null` og 1–5 kontrollspørsmål med `punkt` (og `url` der kilden har egne adresser).
- Er noe faglig eller juridisk uklart, spør meg. Gjett aldri på hva en regel betyr.
- Vis meg skjermbilder (iPhone 15 Pro, WebKit) før testene kjøres, så vi kan diskutere løsningene.

**Praktisk:**
- Playwright: `CI=1 PLAYWRIGHT_BROWSERS_PATH=/root/pw163 npx playwright test`.
  - Hele runden tar 15–18 minutter, så gi en kjøring i bakgrunnen minst 60 minutters tidsgrense.
  - Les antallet feilede tester i utskriften. Avslutningskoden fra `| tail` sier ikke om testene feilet.
- Lovdata kan bare nås fra GitHub Actions. Lokale data i `data/lovdata/` hentes av kildesjekken.
- Bruk ikke `pkill -f` eller `ps | grep` med kommandoteksten. Begge kan treffe ditt eget skall. Stopp en server ved å stoppe bakgrunnsoppgaven.
- Kontrollsaker godkjennes med `/godkjent`. Sett aldri `kontrollert`, `bekreftet` eller `godkjent_fingeravtrykk` selv.
- Claude fletter PR-ene når CI er grønn og det ikke er konflikter. Versjonsnummeret avtales med meg, og taggen settes av arbeidsflyten «Sett versjonstag» når versjonen i `package.json` endres på main.
