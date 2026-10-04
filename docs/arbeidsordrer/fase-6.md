# Arbeidsordre: fase 6

Lim inn teksten under streken som første melding i en ny samtale.

---

Vi starter fase 6 i Fuskelappen (repo `larsarnenilssen/fuskelappen`). Skriv til meg på bokmål, kort og enkelt.

**Les først:**
- `AGENTS.md` (faste regler)
- `OPPDRAG.md` (fase 6 og «Gjelder alle faser»)
- `CHANGELOG.md` (siste versjoner)
- Avgjørelsene i `docs/avgjorelser/`:
  - om innhold og kontroll (016, 017, 019, 021)
  - om Regelverk (039)
  - om veiviseren og fargene (041, 042, 044)
  - om VIGO (026, 051)
  - om frister og tidslinje (046)
  - om kalkulatoren med utregning og kilde for hver regel (047)
  - om kildekontroll, fylker og data (048, 049)
  - om lenker til begrepsbanken (050)
  - om utdanning.no, skoler og tilbud, opplæringskontorer og NDLA (052, 053)
- `docs/VIGO-KODEVERK.md`

**Status:** Fase 5 er levert. Siste publiserte versjon er 0.30.0 (03.10.2026):
- Modulen **Inntak** har veiviseren «Rett, inntak og søknad» (turkis), tidslinjen «Søknad og frister gjennom året» og **Poengberegning** til Vg1, Vg2 og Vg3 med regler i `rules/inntak/` og fasittestene F1–F9 og F7b.
- Vestland-innhold vises bare når Vestland er valgt, og legges inn slik at andre fylker kan legges inn på samme måte (avgjørelse 048).
- Dataene fra kildene lastes gjennom `src/data/` i appen og `scripts/data/les.ts` i skriptene (avgjørelse 049). Ingen moduler leser filer i `data/` direkte.
- Begreper i brødtekst lenker til begrepsbanken av seg selv (avgjørelse 050). Nye begreper med en tittel som ikke står ordrett i teksten, trenger `lenkeord`.
- VIGO gir status på søkerønsker (oppslag i begrepsbanken), Vg4 påbygging og overgangen med yrkesfaglig opphenting i Opplæringsløp (avgjørelse 051).
- 0.30.0 (avgjørelse 052 og 053): utdanning.no er kontrollkilde for løpene, og løp kildene er uenige om, er merket. Modulen Opplæringsløp heter nå **Opplæringstilbud** (id og adresser er fortsatt `opplaeringslop`). Landingssiden har søk etter tilbud og skoler og to deler: «Utdanningsprogram og løp» med undersiden Opplæringsløp (`#/opplaeringslop/lop`, «Min skole» / «Alle» med skolen fra innstillingene), og «Skoler og opplæringskontorer» med oppslagene over skolene og tilbudene deres (utdanning.no) og over opplæringskontorene (NOR). Lærefagene har yrkene, og fagarket lenker til NDLA. Alt hentes hver uke og kontrolleres i kildesjekken.
- Seks nye begreper venter på kontroll: opplæringskontor, lærebedrift, lærling, kontrakt om opplæring, generell studiekompetanse og yrkesfaglig opphenting. Lærling og kontrakt om opplæring er begreper som innholdet om fag- og svenneprøven kan lenke til.

**Åpent fra fase 5 (tas med videre):**
- Kontrollpunktet for fase 5 er utsatt etter ønske fra meg: kategorier, flyt og poengberegning i Inntak, og kontrollspørsmålene i kontrolloversikten.
- vestlandfylke.no har ikke svart. Sjekk først om sidene svarer. Da kan antall inntaksområdepoeng og Vestlands klagenemnd legges inn. Svarer de ikke, tas spørsmålene med videre.
- Forskjellene mellom VIGO og Grep i «bygger på» står i `docs/TILBUDSSTRUKTUR.md`: noen koblinger finnes bare i VIGO (salg, service og reiseliv Vg2 → fire lærefag, tysk skole) og noen bare i Grep. Ta dem opp med meg når det passer.

**Forsiden (eier 04.10.2026), ikke publisert ennå:** Opplæringstilbud er flyttet fra «Læreplanverket» til den nye overskriften «Inntak og opplæringstilbud», sammen med Inntak. Endringen ligger på grenen `claude/fase-6` og er bare kontrollert med lint, typesjekk, `npm test` og forsidetestene i WebKit mobil. **Start på den grenen** (`git fetch origin claude/fase-6 && git checkout claude/fase-6`), og bygg pakke 1 videre der. Hele testrunden og publiseringen tas sammen med pakke 1. Planen for overskriftene når alle fasene er levert, står i `OPPDRAG.md` punkt 3.7.

**Fase 6: Vurdering, fravær og eksamen.** Hver pakke er én gren, én PR og én versjon:

1. **Vurdering**
   - Vurderingsbestemmelsene i opplæringsforskrifta kapittel 9: underveisvurdering, halvårsvurdering, standpunkt, grunnlag for vurdering, «ikke vurderingsgrunnlag» (IV), fritak fra vurdering med karakter og særskilt tilrettelegging.
   - Veiviseren «Grunnlag for vurdering» bygges med den felles komponenten. Den får neste ledige farge (rav, avgjørelse 042).
   - Lenk til paragrafene i Regelverk.
2. **Fravær**
   - Fraværskalkulator per fag: årstimetallet fra Grep gir hvor mange timer som svarer til fraværsgrensen, med utregningen synlig og kilde for hver regel, og forklaring av unntakene.
   - Regelen står i opplæringsforskrifta § 9-8 (data/lovdata). Tall fra regelverket legges i `rules/` med `sitat` og leses med `hentVerdi()`. Beregningen er rene funksjoner i `src/modules/<modul>/beregning/` med tester.
   - Bruk samme mønster som poengberegningen (avgjørelse 047): kortnavn på kildene i utregningen, fylkesinnhold bare når fylket er valgt.
3. **Eksamen og klage**
   - Eksamen, utsatt og ny eksamen, særskilt tilrettelegging av eksamen, og klage på standpunkt- og eksamenskarakter.
   - Veiviseren for klagegangen. Den trenger en ny veiviserfarge i `tokens.css`, `tema.css` og skjemaet (avgjørelse 042).
   - Frister (f.eks. klagefrister og oppmelding) registreres i felles format og kan vises på samme måte som i Inntak (avgjørelse 046).

I alle pakkene:
- Kobling begge veier mellom vurdering og eksamen og de to veiviserne i Tilrettelegging (eier 03.10.2026): for eksempel individuelt tilrettelagt opplæring uten vurdering med karakter, fritak fra vurdering med karakter i innføringsopplæring, og læreplanene i særskilt språkopplæring som ikke gir karakter.
- Fag- og svenneprøven er vurdering for lærlinger. Lenk fra den til begrepene lærling og kontrakt om opplæring og til oppslaget over opplæringskontorer (`#/opplaeringslop/opplaeringskontor`, fra NOR) der det passer. NOR sier ikke hvilke lærefag et kontor har; koblingen hentes ikke fra det interne API-et til utdanning.no (eier 03.10.2026).
- Data fra VIGO Kodeverksbase der det passer: vurderingsordning per fagkode (`exam-assessments`), karakterkoder (`grades`) og fagmerknader knyttet til fag. Nye data hentes i `scripts/hent-vigo.ts`, kontrolleres før de tas inn og lastes gjennom `src/data/`.

**Start med å legge fram for meg:**
- Reglene for vurdering, fravær og eksamen, med kildene du vil bygge på (paragraf og ledd).
- Hvordan fraværsgrensen regnes ut, hvilke unntak som gjelder, og hvilke eksempler du foreslår som fasittester. Fasittestene godkjenner jeg før de legges inn.
- Stegene i de to veiviserne, med kilder.
- Hvilke frister og datoer som skal med, og hvor de står.
- Hvilke nye begreper du foreslår til begrepsbanken.
- Om det trengs en ny modul for vurdering, eller om noe passer i en modul som finnes. Etter planen for forsiden blir det én modul, Vurdering (med fravær, eksamen og klage), under «Elever og opplæring» sammen med Tilrettelegging. Foreslår du noe annet, vis hvordan det passer med overskriftene (én til tre hovedbokser per overskrift).
- Hvilke VIGO-data du vil bruke, og til hva.

Bygg først når jeg har godkjent dette.

**Ønsker som gjelder videre:**
- Visualisering er viktigere enn å gjengi kildene ord for ord. Appen skal gi bedre og raskere oversikt enn kildene.
- God UI både på mobil og PC.
- Lange lister grupperes og står lukket til brukeren åpner dem. Svært lange lister vises med søk.
- Utregningen i kalkulatorene er ryddig, med korte kildenavn.
- Innhold og beregninger vedlikeholdes fra kildene og kontrolleres automatisk. Data lagres ett sted.
- Visning uten valgt fylke har ikke dødt innhold.

**Regler for innholdet:**
- Alt nytt innhold får `kontrollert: null` og 1–5 kontrollspørsmål med `punkt` (og `url` der kilden har egne adresser).
- Tolkninger som ikke står i kildene, føres i `content/kontroll/praksis.yaml` med `bekreftet: null`.
- Er noe faglig eller juridisk uklart, spør meg. Gjett aldri på hva en regel betyr.
- Vis meg skjermbilder (iPhone 15 Pro, WebKit) før testene kjøres, så vi kan diskutere løsningene. Kjør ikke lange tester før vi er enige om en versjon å teste.

**Praktisk:**
- Playwright lokalt: `PLAYWRIGHT_BROWSERS_PATH=/root/pw163 npx playwright test <fil> -g "<test>"`. Mangler Chromium der, kan den forhåndsinstallerte i `/opt/pw-browsers` lenkes inn med samme mappeoppsett som Playwright venter. Kjør enkelttester lokalt. Hele runden går i CI, delt på seks jobber (avgjørelse 040), og tar rundt fem minutter.
- Skjermbilder: `npm run build`, så `npx vite preview --port 4173`. Ta bildene med et Playwright-skript som kjøres fra repoets rot (skriptet må finne `@playwright/test`, og trenger `PLAYWRIGHT_BROWSERS_PATH=/root/pw163`). Slett skriptet etterpå. Stopp forhåndsvisningen før e2e, fordi testene bruker samme port.
- Lokal henting med Node trenger `NODE_USE_ENV_PROXY=1` (f.eks. `NODE_USE_ENV_PROXY=1 npm run hent:nor`). GitHub Actions trenger det ikke.
- Lovdata kan bare nås fra GitHub Actions. Lokale data i `data/lovdata/` hentes av kildesjekken.
- Bruk ikke `pkill -f` eller `ps | grep` med kommandoteksten. Begge kan treffe ditt eget skall.
- Kjør ikke `prettier` på filer. Repoet har ingen oppsett for det, og den skriver om hele filen.
- Startpakken skal holdes lav (nå rundt 91 kB). Importer ikke tunge moduler (søk, tilbudsmodellen, kontekst) fra moduler som lastes med en gang.
- Kontrollsaker godkjennes med `/godkjent`. Sett aldri `kontrollert`, `bekreftet` eller `godkjent_fingeravtrykk` selv.
- Eier kan teste en gren under `test/` (avgjørelse 045): `git push origin <gren>:test --force`.
- Claude fletter PR-ene når CI er grønn og det ikke er konflikter. Versjonsnummeret avtales med meg, og taggen settes av arbeidsflyten «Sett versjonstag» når versjonen i `package.json` endres på main.
