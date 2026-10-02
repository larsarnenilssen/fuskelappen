# Arbeidsordre: fase 3

Lim inn teksten under streken som første melding i en ny samtale.

---

Vi starter fase 3 i Fuskelappen (repo `larsarnenilssen/fuskelappen`). Skriv til meg på bokmål, kort og enkelt.

**Les først:** `AGENTS.md` (faste regler), `OPPDRAG.md` (fase 3 og «Gjelder alle faser»), `CHANGELOG.md` (siste versjoner) og avgjørelsene i `docs/avgjorelser/` som gjelder Arbeidsplan og overordnet del (særlig 015, 030, 033 og 037).

**Status:** Fase 2 er levert. Siste publiserte versjon er 0.20.1 (02.10.2026): overordnet del på én side, fagarket med lukkede deler og like høye bokser på forsiden.

**Fase 3 har to deler. Hver pakke er én gren, én PR og én versjon:**

1. **Arbeidsplan** (OPPDRAG, fase 3, «Leveranser som gjenstår»)
   - Sjekk først hva som allerede er bygd. Fagvalg fra fagoppslaget og videreføring av beskjeftigelse finnes. Legg fram for meg det som faktisk gjenstår, før du bygger.
   - Sammenligning av to lagrede varianter side om side, f.eks. med og uten kontaktlærerfunksjon.
   - Deling av en variant som lenke (komprimert tilstand i adressen, ingen personopplysninger).
2. **Lov og forskrift** (OPPDRAG, fase 3, «Lov og forskrift»)
   - Start med å legge fram for meg:
     - en liste over kapitlene i opplæringslova og opplæringsforskrifta du foreslår å ta med (videregående og fagopplæring, tolket vidt)
     - et forslag til andre forskrifter, f.eks. om inntak
   - Bygg modulen først når jeg har godkjent utvalget.
   - Lovdata kan ikke nås fra utviklingsmiljøet, bare fra GitHub Actions. Lag leseren mot et lite utdrag i testene, og kjør første ekte henting i Actions før modulen publiseres.
   - Følg mønsteret fra overordnet del slik det er etter 0.20.1 (avgjørelse 037, «Én side»):
     - ukentlig henting med validering, og endringer i kontrollsaken
     - én side med søket øverst, så kapitlene som rubrikker som er lukket, med paragrafene inni som lukkede bokser (ikke et eget innholdsregister eller en egen tekstside)
     - egen adresse per paragraf, som åpner og ruller dit med overskriften synlig under toppfeltet
     - «Til toppen» og søk på forsiden
   - Boksen på forsiden skal følge reglene fra 0.20.1: samme høyde som de andre boksene, og en undertekst på høyst to linjer på telefon.

**Avklar med meg før du starter:**
- Skal du lage `npm run test:endret`, som bare kjører testene en endring berører lokalt, og slå av den ekstra CI-kjøringen på main etter fletting? Det ble foreslått 02.10.2026, men er ikke besluttet.

**Praktisk:**
- Playwright: `CI=1 PLAYWRIGHT_BROWSERS_PATH=/root/pw163 npx playwright test`. Hele runden tar omtrent 11 minutter, så gi en kjøring i bakgrunnen minst 60 minutters tidsgrense.
- Bruk ikke `pkill -f`. Det kan treffe ditt eget skall. Finn prosessen med `ps` og stopp den med `kill`.
- Repoet har flyttet fra `protokollen` til `fuskelappen`. Bruk det nye navnet i GitHub-verktøyene.
- Kontrollsaker godkjennes med `/godkjent`. Sett aldri `kontrollert`, `bekreftet` eller `godkjent_fingeravtrykk` selv.
