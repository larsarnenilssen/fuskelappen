# Veiledning for eier

Denne veiledningen er for deg som eier appen. Den forutsetter ingen tekniske kunnskaper. Alt gjøres i nettleseren på github.com eller på telefonen. Du trenger aldri redigere filer selv: si fra til Claude med vanlige ord, så gjør Claude endringen og ber deg godkjenne den.

Repoet ligger på **https://github.com/larsarnenilssen/protokollen**, og appen på **https://larsarnenilssen.github.io/protokollen/**.

Står en knapp ikke der veiledningen sier, eller GitHub spør om noe som ikke står her: stopp og spør Claude.

---

## 1. Godkjenne og slå sammen et endringsforslag (PR)

Når Claude er ferdig med en fase, får du en lenke til et endringsforslag («pull request»).

1. Åpne lenken.
2. Se nederst på siden. Står det et **grønt hakemerke** og «All checks have passed», er alle automatiske tester bestått. Står det et rødt kryss, skal du ikke slå sammen. Si fra til Claude.
3. Trykk den grønne knappen **Merge pull request** og deretter **Confirm merge**.

Endringene er nå en del av hovedversjonen (`main`), men de er ikke publisert i appen ennå. Se punkt 3.

## 2. Slå på publisering (gjøres én gang)

1. Åpne repoet og trykk **Settings** (tannhjulet øverst til høyre i menyen).
2. Velg **Pages** i menyen til venstre.
3. Under «Build and deployment» og «Source» velger du **GitHub Actions**. Det lagres med en gang.

## 3. Publisere en ny versjon

En ny versjon publiseres ved at den får et versjonsmerke (en «tag»), f.eks. `v0.1.0`.

Du setter versjonsmerket selv. Claude har ikke lov til å opprette versjonsmerker fra sine økter, men forteller deg når en ny versjon er klar og hvilket nummer den skal ha (det står også øverst i `CHANGELOG.md`).

1. Åpne repoet og trykk **Releases** i høyre kolonne (eller gå til `…/protokollen/releases`).
2. Trykk **Draft a new release**.
3. Trykk **Choose a tag**, skriv versjonen (f.eks. `v0.1.1`) og velg **Create new tag**. «Target» skal være `main`.
4. Skriv gjerne en kort tittel, og trykk **Publish release**.

Etter omtrent 5 minutter er den nye versjonen ute. Du kan følge med under **Actions** → **Publiser**. Grønt hakemerke betyr at den er publisert.

Brukere som har appen installert, får meldingen «Ny versjon er klar» med en knapp for å oppdatere.

## 4. Gå tilbake til en tidligere versjon

1. Åpne **Actions** og velg **Publiser** i listen til venstre.
2. Trykk **Run workflow** (til høyre).
3. Skriv versjonen du vil tilbake til i feltet, f.eks. `v0.1.0`, og trykk den grønne **Run workflow**.

## 5. Kildesjekken

En automatisk jobb sjekker kildene hver mandag morgen. Den lagrer resultatet, som vises i appen under **Om appen → Kilder**, og gir deg beskjed hvis noe er endret eller feiler.

**Når kjøres den neste gang?** Det står i appen under **Om appen → Kilder**.

**Kjøre sjekken selv:** Trykk lenken «Kjør kildesjekken på GitHub» nederst på kildesiden i appen, eller åpne **Actions** → **Kildesjekk** → **Run workflow** → la feltet stå tomt → **Run workflow**. Etter et par minutter kommer det et grønt hakemerke. Trykker du på kjøringen, ser du et sammendrag.

**Teste varslingen:** Gjør det samme, men skriv `ks-sfs2213` i feltet «Simuler feil». Da lages kontrollsaken under **Issues** (punkt 6), og du får e-post fra GitHub. Neste vanlige kjøring lukker saken automatisk når alt er i orden.

**Grep og skoleregisteret** hentes også hver mandag. Består appens tester med de nye dataene, tas de inn og publiseres automatisk, uten at du trenger å gjøre noe. Det står i kontrollsaken hva som er endret. Feiler testene, tas dataene ikke inn, og kontrollsaken sier fra.

## 6. Den ukentlige kontrollsaken

Etter kildesjekken hver mandag samles alt du bør se på, i **én sak** under **Issues** med merket `kontroll`. Du får e-post fra GitHub når saken lages, og når den får noe nytt. Er alt i orden, lukkes saken automatisk. Uker uten noe nytt gir ingen e-post.

Saken kan ha disse delene:

- **Endret i kildene:** hvilket punkt i kilden som er endret, med den nye teksten sitert, og hvilke tall, begreper og forklaringer i appen som kan være berørt. Tekst som er fjernet, kan ikke vises, fordi appen ikke lagrer kildeteksten (opphavsrett). Da står det hvor mange setninger som er fjernet.
- **Tall og tabeller som ikke stemmer med kilden:** tall der sitatet ikke lenger står i kilden, med forslag til nytt tall når det finnes. Vedlegg 1 og garantilønnen sjekkes rad for rad.
- **Grep:** hva som er tatt inn automatisk, eller at Grep er endret slik at testene feiler.
- **Kilder som ikke kunne sjekkes:** for eksempel fordi nettstedet var nede. Det går ofte over av seg selv. Står en kilde der i flere uker, si fra til Claude.

**Endringsforslag:** Er et tall endret i kilden, lager kildesjekken en PR med det nye tallet og det nye sitatet. Kontrollsaken lenker til den. Beskrivelsen av PR-en viser tallene før og etter, og hvilke tester som eventuelt feiler. Stemmer tallene, og gjelder endringen samme avtaleperiode, fletter du PR-en som vanlig (punkt 1). Gjelder den en ny periode, for eksempel en ny hovedtariffavtale, skal PR-en ikke flettes. Si fra til Claude, som lager en ny regelfil. Feiler testene med nye Grep-data, kommer det også en PR med dataene, så Claude kan rette koblingene der.

**Slik behandler du saken:**

1. Les gjennom punktene. Åpne lenken til kilden hvis du vil se mer.
2. Kryss av punktene du har sett på.
3. Skriv til Claude hva som skal gjøres, med vanlige ord. For eksempel: «Godkjent fingeravtrykk for SFS 2213. Oppdater maks timer per dag til 10.»

Innholdet i appen endres aldri automatisk. Unntaket er registerdataene fra Grep og skoleregisteret.

**Skjule varselet i appen:** Under **Om appen → Kilder** kan du trykke «Skjul varselet til neste sjekk». Da forsvinner advarselen øverst til høyre på din enhet til neste kildesjekk, eller til statusen endrer seg. Saken på GitHub påvirkes ikke.

## 7. Installere appen

- **iPhone og iPad:** Åpne https://larsarnenilssen.github.io/protokollen/ i **Safari** → trykk **Del**-knappen (firkant med pil opp) → **Legg til på Hjem-skjerm** → **Legg til**.
- **Android:** Åpne adressen i **Chrome** → trykk menyen **⋮** → **Installer app** (eller **Legg til på startsiden**).
- **Mac og PC:** I Chrome eller Edge vises et installer-ikon i adressefeltet.

Etter første besøk virker appen også uten nett.

## 8. Sjekkliste for kontrollpunktet i fase 0

Kryss av mens du tester på telefonen:

- [ ] Appen kan installeres og åpnes fra hjemskjermen, uten adressefelt.
- [ ] Ikonet på hjemskjermen ser greit ut (plassholder: protokollbok med §). Si fra om du vil ha et annet.
- [ ] **Tema:** Innstillinger → Utseende. Prøv Lyst, Mørkt og Følg systemet. Lukk appen helt og åpne den igjen: valget er husket.
- [ ] **Målform:** Innstillinger → Nynorsk. Menyen blir «Heim» og «Innstillingar». Lukk og åpne: valget er husket.
- [ ] **Fylke og skole:** Velg Vestland og en skole. Gå til Hjem: merknaden viser skolen. Bytt fylke: skolen nullstilles. Trykk «Fjern fylke og skole».
- [ ] **Tilbake:** Gå inn på noen sider og bruk tilbake-sveip (iPhone, fra venstre kant) eller tilbakeknappen (Android). Du kommer tilbake dit du var, også i scrollposisjon.
- [ ] **Zoom:** Knip for å zoome. Det skal gå.
- [ ] **Sidelengs:** Prøv å dra siden til siden. Den skal ikke flytte seg eller vise tomt område.
- [ ] **Uten nett:** Slå på flymodus og åpne appen. Den skal starte som vanlig.
- [ ] **Søk:** Søk etter «innstillinger» eller «kjelder». Søket forstår både bokmål og nynorsk.
- [ ] **Kildestatus:** Trykk på symbolet øverst til høyre. Du kommer til siden med kildene.
- [ ] **Tekster:** Les «Om appen» (ansvarsfraskrivelse, personvern, kreditering) på bokmål og nynorsk.

Skriv til Claude hva som var bra og hva som bør endres.

## 9. Sjekkliste for kontrollpunktet i fase 1

Innhold du ikke har godkjent, har `kontrollert: null` i filene, men vises uten merke i appen (brukserklæringen dekker det, avgjørelse 016). Du godkjenner ved å skrive til Claude hva som er kontrollert, med dato. Claude legger da inn datoen, og innholdet får merket «Kontrollert» med datoen.

**Kildene (etter at endringsforslaget er slått sammen):**

- [ ] Kjør kildesjekken (punkt 5). Du får tre saker om nye fingeravtrykk: avtaleteksten til SFS 2213, hovedtariffavtalen og arbeidsmiljøloven kapittel 10. Åpne lenkene og se at det er riktig dokument. Skriv så til Claude: «Godkjent fingeravtrykk for ks-sfs2213-avtaletekst, ks-hovedtariffavtalen og arbeidsmiljoloven».

**Regelverdiene** (filene ligger i mappen `rules/` på GitHub, men du kan like gjerne kontrollere dem i appen under «Vis utregning»):

- [ ] SFS 2213: årsverk 1687,5 (1650 fra 60 år), 6 ekstra dager à 7,5 timer, planfestet tid 1150, høyst 9 timer per dag og 37,5 per uke, årsramme 607,5 ved funksjon, tillegg 52,5 for fag merket * med 1–15 elever, kontaktlærer 28,5, skoleår 190 dager og 38 uker, 5 arbeidsdager per uke.
- [ ] Vedlegg 1: årsrammene for videregående (151 rader). Se særlig blokken 525/700, der vedlegget har overskriften «Felles programfag» over fellesfag.
- [ ] Hovedtariffavtalen: 1400, 1687,5 og 100/112 i § 12.4, feriepenger 12 % og 14,3 %, overtidstillegg 50 %, garantilønn fra 1.5.2026.

**Kalkulatorene** (på telefonen, under Hjem → Hurtigkalkulatorer):

- [ ] Beskjeftigelse: søk etter fag på navn, kallenavn (R1, 2P) og koder (ENG, BAT, HEA). Prøv ett fag, et fag merket * med «15 eller færre elever», to fag, og en blandet gruppe.
- [ ] Søkeordene: kallenavn og koder står i `rules/sfs2213/fagsok-2026-2027.yaml`. Se særlig over tabellen som kobler programnavnene i vedlegg 1 til utdanningsprogrammene.
- [ ] Arbeidsplan: planleggingsdager på egen linje (45 timer for hel stilling, kan endres), og timer per uke fordelt på 38 skoleuker.
- [ ] Lønn i en periode fra datoene: hele måneder, og arbeidsdager ÷ 21,67 i brutte måneder (verdien 21,67 står i regelfilen for hovedtariffavtalen, med InSchool-artikkelen om fastlønn som kilde).
- [ ] Arbeidsplan for en periode: periodebeskjeftigelse (også økter per uke med uker regnet ut fra dagene), funksjoner i perioden, prosent på årsbasis, fordeling og lønn for perioden.
- [ ] Vikartimer (ansatt og timevikar) og overtid.
- [ ] Årstimer: velg noen fag og se at riktig årstimetall fylles inn. Tabellen står i `rules/sfs2213/arstimer-2026-2027.yaml`, med fagkodene i Grep.
- [ ] Programfag: søk på en fagkode (f.eks. HEA2005) og se at årstimetallet fra Udir stemmer.
- [ ] Lagrede varianter: lagre, endre og hent fram igjen.
- [ ] Arbeidsplan: prøv eksemplene E1–E4. Se at teknisk undertid og overtid, timene i hvert fag og lenken til overtid er riktige.
- [ ] Arbeidsplan: se at diagrammet over arbeidstiden stemmer, og prøv «Regn ut lønn» med garantilønn og egen lønn, med tillegg og med overtid over 100 %.
- [ ] Regelverdiene for godtgjøring i SFS 2213 punkt 9.1: 12 000 kr for kontaktlærer og for rådgiver/sosiallærer (`rules/sfs2213/2026-2027.yaml`).
- [ ] Arbeidsplan: slå av «Utvider planfestet tid» for en funksjon på 20 % i hel stilling. Planfestet tid skal da bli 1150 timer, ikke 1257,5.
- [ ] Arbeidsplan: 100 % stilling med 100 % funksjon skal gi 37,5 timer per uke og 29 dager utvidet arbeidsår. 20 % og 80 % funksjon skal gi 1257,5 og 1580 timer planfestet tid.
- [ ] Arbeidsplan: variabel lønn for det som er over en stilling under 100 %, opp til hel stilling (regnet som vikartimer: kalkulert tid × timelønn), og overtid for det som er over 100 %.
- [ ] Arbeidsplan: kontaktlærer i årsrammetimer (28,5 = 4,69 %), og redusert undervisning for nyutdannet, 57 år og 60 år (60 år gir årsverk 1650, arbeidsår på 191 dager eller 38,2 uker, planfestet tid 1124,44 og høyere feriepengesats).
- [ ] Regelverdiene for livsfasetiltak i punkt 6: 6 %, 6 % og 12,5 % (`rules/sfs2213/2026-2027.yaml`).
- [ ] Skriv ut Arbeidsplan eller lagre som PDF fra knappen ved tittelen.
- [ ] PC/Mac: prøv «Vis stort» på diagrammet og «Åpne i nytt vindu» ved tittelen.
- [ ] Lukk og åpne kortene i Arbeidsplan med et trykk på overskriften. Se at oppsummeringene er nyttige.
- [ ] Trykk «Vis utregning» og «Slik regnes det ut». Er metoden og formlene forståelige og riktige?
- [ ] Velg Vestland og en skole under Innstillinger. Ingen ekte lokale avtaler er lagt inn ennå, så verdiene skal fortsatt være nasjonale.

**Tekstene:**

- [ ] Begrepene under Oppslag → Begreper, på bokmål og nynorsk.
- [ ] «Hva tiden brukes til» under Arbeidsplan, særlig «Annen planfestet tid og annet elevrettet arbeid».

Skriv til Claude hva som er riktig, og hva som må endres.

## 10. Kontrolloversikten og den automatiske verdisjekken

**Kontrolloversikten** ligger i `docs/KONTROLL.md` på GitHub. Den lages på nytt hver mandag når kildesjekken kjører. For hver kilde viser den:

- hvilke tall i appen som bygger på kilden, og hvilke begreper og forklaringer som viser til den
- om du har kontrollert dem, og om kontrollen er gammel eller kilden er endret siden
- resultatet av den automatiske verdisjekken

Øverst står et sammendrag og en liste over det som bør ses på nå.

**Den automatiske verdisjekken:** Hvert tall fra en kilde har et kort sitat fra kilden der tallet står. Årsverket har for eksempel sitatet «utføres innenfor et årsverk på 1687,5 timer (1650 timer for lærere som er 60 år og eldre)». Hver mandag ser kildesjekken etter sitatet i kilden:

- **✅ samsvarer:** sitatet med tallet står fortsatt i kilden.
- **⚠️ avvik:** sitatet står ikke der lenger. Finner sjekken den samme teksten med et annet tall, står det nye tallet i oversikten, for eksempel «Kilden har nå 1700 der verdien sto».
- **ikke sjekket:** kilden kunne ikke leses denne gangen, eller den sjekkes ikke automatisk ennå.

Automatisk samsvar betyr bare at tallet står i kilden. Det sier ikke noe om tolkningen eller forklaringen, og det teller ikke som din kontroll.

**Tall som ikke kan sjekkes automatisk:**
- **praksis:** for eksempel 21,67 arbeidsdager per måned. Det står ikke i kilden, men er praksis du har beskrevet.
- **avledet:** regnet ut fra andre tall, for eksempel 5 arbeidsdager per uke (37,5 ÷ 7,5).
- **tabeller og lister:** vedlegg 1 og garantilønnen sjekkes rad for rad mot kilden. Andre tabeller og lister sjekkes ikke mot kilden, men tester sjekker at tallene henger sammen, for eksempel at 45-minutters årsrammen er 60-minutters årsrammen × 4/3 i hver rad.

## 11. Kontrollspørsmål, praksis og kontrollrundene

**Kontrollspørsmål:** Hvert begrep og hver forklaring har 1–5 spørsmål om det Claude er usikker på i teksten. Et eksempel: «Er det nøytralt å si at overtidstillegg for deltidsansatte er omstridt mellom partene?» Du finner alle spørsmålene nederst i `docs/KONTROLL.md`. Endres en kilde, står spørsmålene til det som kan være berørt, i kontrollsaken. Da kontrollerer du det som er usikkert, og trenger ikke lese hele teksten fra bunnen av.

**Praksis og tolkninger:** Noe i appen står ikke i kildene. Det bygger på praksis eller på valg du har gjort, for eksempel 21,67 arbeidsdager per måned, 45 timer planleggingsdager for alle og variabel lønn for deltidsansatte. Alt dette står i `content/kontroll/praksis.yaml` og i kontrolloversikten, med hva appen gjør og hvem som har bestemt det.

**Kontrollrundene:** Første mandag i **mai**, når hovedtariffavtalen endres, og første mandag i **august**, før skoleåret, lager kildesjekken en egen sak med merket `kontrollrunde`. Den har tre deler:

- **Praksis og tolkninger** som ikke er bekreftet, eller som ble bekreftet for mer enn 12 måneder siden.
- **Det som bør kontrolleres på nytt:** innhold du har kontrollert, men der kontrollen er over 12 måneder gammel eller kilden er endret siden.
- **Hvor mye som ikke er kontrollert ennå**, med lenke til kontrollspørsmålene.

Kryss av det som fortsatt stemmer, og skriv i en kommentar hva som er endret. Vil du ha en kontrollrunde nå: **Actions** → **Kildesjekk** → **Run workflow** → kryss av for «Lag en kontrollrunde nå» → **Run workflow**.
