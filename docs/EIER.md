# Veiledning for eier

Denne veiledningen er for deg som eier appen. Den forutsetter ingen tekniske kunnskaper. Alt gjøres i nettleseren på github.com eller på telefonen. Du trenger aldri redigere filer selv: si fra til Claude med vanlige ord, så gjør Claude endringen og ber deg godkjenne den.

Repoet ligger på **https://github.com/larsarnenilssen/jukselappen**, og appen på **https://larsarnenilssen.github.io/jukselappen/**.

Står en knapp ikke der veiledningen sier, eller GitHub spør om noe som ikke står her: stopp og spør Claude.

---

## 1. Godkjenne og slå sammen et endringsforslag (PR)

Fra 01.10.2026 fletter Claude PR-ene på dine vegne når CI er grønn og det ikke er konflikter. Du får lenken og en kort oppsummering. Vil du se på en PR før den flettes, så si fra. Stegene under gjelder når du fletter selv, og for endringsforslagene fra kildesjekken (punkt 6).

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

Fra 01.10.2026 setter Claude versjonsmerket når dere er enige om at en versjon skal publiseres, og hvilket nummer den får (det står også øverst i `CHANGELOG.md`). Claude øker versjonsnummeret i en egen PR. Når den flettes, setter arbeidsflyten **Sett versjonstag** merket og publiserer (avgjørelse 029). Arbeidsflyten lager også en utgivelse under **Releases** med teksten fra `CHANGELOG.md`. Claude følger med til publiseringen er ferdig og sier fra. Stegene under gjelder når du setter versjonsmerket selv.

1. Åpne repoet og trykk **Releases** i høyre kolonne (eller gå til `…/jukselappen/releases`).
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
2. Kryss av punktene du godkjenner, og skriv `/godkjent` i en kommentar (punkt 12).
3. Skal noe endres, skriv til Claude hva, med vanlige ord. For eksempel: «Oppdater forklaringen av planfestet tid til 10 timer per dag.»

Innholdet i appen endres aldri automatisk. Unntaket er registerdataene fra Grep og skoleregisteret.

**Skjule varselet i appen:** Under **Om appen → Kilder** kan du trykke «Skjul varselet til neste sjekk». Da forsvinner advarselen øverst til høyre på din enhet til neste kildesjekk, eller til statusen endrer seg. Saken på GitHub påvirkes ikke.

## 7. Installere appen

- **iPhone og iPad:** Åpne https://larsarnenilssen.github.io/jukselappen/ i **Safari** → trykk **Del**-knappen (firkant med pil opp) → **Legg til på Hjem-skjerm** → **Legg til**.
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

**Kalkulatorene** (på telefonen, under Hjem → Arbeidstid: Arbeidsplan, og de andre under «Flere kalkulatorer»):

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

**Kontrollspørsmål:** Hvert begrep og hver forklaring har 1–5 spørsmål om det Claude er usikker på i teksten. Et eksempel: «Er det nøytralt å si at overtidstillegg for deltidsansatte er omstridt mellom partene?» Du finner alle spørsmålene nederst i `docs/KONTROLL.md`. Endres en kilde, står spørsmålene til det som kan være berørt, i kontrollsaken. Da kontrollerer du det som er usikkert, og trenger ikke lese hele teksten fra bunnen av. Under hvert spørsmål står «Kilder å sjekke mot»: kildene teksten bygger på, med lenke og punkt. Det samme står ved hver praksis og i kontrollrundene.

**Praksis og tolkninger:** Noe i appen står ikke i kildene. Det bygger på praksis eller på valg du har gjort, for eksempel 21,67 arbeidsdager per måned, 45 timer planleggingsdager for alle og variabel lønn for deltidsansatte. Alt dette står i `content/kontroll/praksis.yaml` og i kontrolloversikten, med hva appen gjør og hvem som har bestemt det.

**Kontrollrundene:** Første mandag i **mai**, når hovedtariffavtalen endres, og første mandag i **august**, før skoleåret, lager kildesjekken en egen sak med merket `kontrollrunde`. Den har tre deler:

- **Praksis og tolkninger** som ikke er bekreftet, eller som ble bekreftet for mer enn 12 måneder siden.
- **Det som bør kontrolleres på nytt:** innhold du har kontrollert, men der kontrollen er over 12 måneder gammel eller kilden er endret siden.
- **Lenker til Vilbli** fra tilbudsoversikten, som ikke kan sjekkes automatisk (se punkt 15).
- **Hvor mye som ikke er kontrollert ennå**, med lenke til kontrollspørsmålene.

Kryss av det som fortsatt stemmer, og skriv i en kommentar hva som er endret. Vil du ha en kontrollrunde nå: **Actions** → **Kildesjekk** → **Run workflow** → kryss av for «Lag en kontrollrunde nå» → **Run workflow**.

**Kontrollspørsmålene til fagmerknader og vitnemålsmerknader** ble besvart fra Udirs skriv om føring av vitnemål og kompetansebevis, kapittel 3, etter beskjed fra eier 01.10.2026:

- Fagmerknader står ved et fag på vitnemål og kompetansebevis. Noen gjelder bare det ene. Det er plass til én per fag.
- Tekst i vinkelparentes (f.eks. `<FAGKODE>`, `<åååå>`) fylles ut for eleven. Registreringshåndboken sier at disse overføres som fritekst.
- Utgåtte koder vises fortsatt samlet nederst, fordi de kan stå på eldre vitnemål (Claudes valg).
- Vitnemålsmerknader gjelder opplæringen generelt eller hele dokumentet. De kan også vise til vedlegg eller utdype en fagmerknad.
- Vitnemålsmerknader brukes også på kompetansebevis. Noen gjelder bare vitnemål (VMM06, VMM36), og noen bare kompetansebevis (VMM14, 26, 27, 29, 33, 34, 38).

Tekstene er skrevet om etter dette. De har ett nytt kontrollspørsmål hver og `kontrollert: null` til du har lest dem.

## 12. Godkjenne i saken med /godkjent

Du kan godkjenne direkte i kontrollsaken eller kontrollrunden. Det går fint på telefonen.

1. Kryss av punktene du godkjenner.
2. Skriv en kommentar som begynner med `/godkjent`, og trykk **Comment**.

Etter et par minutter legger en jobb inn datoen for det du har krysset av, og svarer i saken med hva som er godkjent:

- **Nytt fingeravtrykk for en kilde:** kilden er godkjent, og varselet forsvinner ved neste kildesjekk.
- **Praksis:** praksisen er bekreftet og kommer ikke opp i kontrollrundene de neste 12 månedene.
- **Begreper, forklaringer og tall:** de er kontrollert, og appen viser «Kontrollert» med datoen fra neste versjon.

Du kan også skrive id-er etter `/godkjent`, for eksempel `/godkjent arsverk planleggingsdager feriepenger_prosent`. Id-ene står i `kodeskrift` i `docs/KONTROLL.md`. Slik kontrollerer du begreper og forklaringer du har lest, også når de ikke står i saken.

Nye tall fra kildene godkjennes ved å flette PR-en med forslaget (punkt 6), ikke med `/godkjent`. Bare du kan godkjenne. Kommentarer fra andre blir ikke lest av jobben.

## 13. Sjekkliste for kontrollpunktet i fase 2

Fase 2 har tre deler: fag og læreplaner fra Grep, koblingen fra fagkode til årsramme, og fagvalg i kalkulatorene. Koblingen er et forslag fra Claude, og alt har `kontrollert: null` til du har sett på det.

**Rapporten over koblingen** ligger i `docs/KOBLING.md` på GitHub. Den lages på nytt hver mandag.

- [ ] **Avvik:** Les avsnittet «Avvik». Nå står det ett: Latin 1 står både under «Antikkens språk og kultur» og «Latin/Gresk» i tabellene fra fase 1. Koblingen bruker «Latin/Gresk». Stemmer det?
- [ ] **Programnavn:** Se tabellen «Programnavn i vedlegg 1 og utdanningsprogram i Grep». Stemmer koblingen for hvert navn? Se særlig:
  - «Stud.spes» → bare Studiespesialisering (ST). Skal fellesfag på Kunst, design og arkitektur (KD) og Medier og kommunikasjon (ME) ha årsrammen for «Stud.spes»? Nå er de ikke koblet.
  - «Med./komm» → Medier og kommunikasjon (ME). Radene i vedlegget er fra da programmet var yrkesfaglig.
  - «Yrkes/På» → påbygging (PB).
  - «Design og hå» og «Serv/samf» er utgått og er ikke koblet. Hva skal Vg3 på Håndverk, design og produktutvikling, Frisør …, Informasjonsteknologi og medieproduksjon og Salg, service og reiseliv ha?
- [ ] **Utvalget:** Se tabellen «Utvalg til kontroll». Stemmer årsrammen med det dere bruker for disse fagene?
- [ ] **Ukoblede fag:** Se avsnittet «Program og trinn uten kobling» og listene nederst. Si fra hvilke som skal kobles, og til hvilken rad. For eksempel:
  - varianter av fellesfag (samisk plan, tegnspråk, kort botid, grunnleggende norsk)
  - valgfrie programfag på studiespesialisering som vedlegget ikke nevner (f.eks. sosiologi, toppidrett)
  - valgfrie programfag på idrett, musikk, dans og drama, kunst, design og arkitektur og medier og kommunikasjon
  - «Yrkesfaglig opphenting» (YFO2002)
- [ ] **Yrkesfaglig fordypning:** Skal den ha årsrammen for felles programfag, slik vedlegget sier om prosjekt til fordypning? Den står i praksislisten som `yff-arsramme`.

**I appen** (fra versjon 0.9.0; versjon 0.10.0 har flere fag med årsramme):

- [ ] **Fag og læreplaner** (Hjem → Fag og vurdering): søk på et fag du kjenner, og prøv filtrene. Åpne faget. Stemmer vurderingsordning og årstimetall? Står læreplanen på riktig målform?
- [ ] Prøv et fag med læreplan på nynorsk (f.eks. AKT2004) med appen på bokmål: teksten fra læreplanen skal stå på nynorsk, merket «Fastsatt på nynorsk».
- [ ] Legg et fag til som favoritt.
- [ ] **Kalkulatorene:** Skriv en fagkode i fagfeltet i Beskjeftigelse (f.eks. HEA2005). Velg faget under «Fag med fagkode fra Udir». Årstimer og årsramme fylles inn, og det står hvordan årsrammen er funnet.
- [ ] Prøv SAM3045 (Markedsføring og ledelse 1). Da skal du velge trinn, fordi vedlegget har ulik årsramme for vg2 og vg3.
- [ ] Endre årstimene og velg årsramme selv. Begge deler skal merkes «Overstyrt», med en knapp tilbake til tallene fra Udir og koblingen.

Svar fra eier 01.10.2026 (K1–K4):
- K1: Fellesfag på KD og ME har årsrammen for «Stud.spes».
- K2: De utgåtte radene gjelder programmene som har tatt over: «Design og hå» for DT og FD, «Serv/samf» for SR og IM.
- K3: Utvalget ser riktig ut.
- K4: Varianter av fellesfag har samme årsramme som det ordinære faget. Valgfrie programfag har raden for programfag på programmet og trinnet. Yrkesfaglig opphenting har årsrammen for felles programfag på vg1 i programmet som hentes opp.

Oppfølging: Koblet er nå 1047 fagkoder (før 748). Tabellen over programnavn ble endret, og eier godkjente den på nytt 01.10.2026. Fortsatt åpent:
- [x] **Fremmedspråk som valgfritt programfag** (PSP) på studiespesialisering: eier 01.10.2026: som fremmedspråk vg2 og vg3 (496, rad 102 og 103).
- [x] **Kroppsøving vg3 på påbygging** (KRO1019): eier 01.10.2026: som kroppsøving vg3 på studiespesialisering (635, rad 8).
- [x] **Andre valgfrie programfag på studiespesialisering:** Eier fant årsrammen i InSchool 01.10.2026. Fagene er koblet til raden i vedlegget med samme årsramme som passer best:

  | Fagkode | Fag | Årsramme (InSchool) | Rad i vedlegg 1 |
  |---|---|--:|---|
  | REA3041 | Geofag X | 496 | Geofag 1/2 (130, 131), samme læreplan |
  | REA3051 | Teknologi og forskningslære X | 496 | Teknol/forsk (138, 139), samme læreplan |
  | REA3055 | Matematikk X | 496 | Matematikk (128, 129) |
  | REA3064 | Programmering og modellering X | 496 | Matematikk (128, 129). Info.tekn. har 525, så den passer ikke |
  | SAM3051 | Sosialkunnskap | 496 | Pol/samf (126, 127) |
  | SAM3053 | Samfunnsgeografi | 496 | Pol/samf (126, 127) |
  | SAM3068 | Økonomistyring | 496 | Nær.øk (120, 121), samme læreplan som økonomi og ledelse |
  | SAM3070 | Økonomi og ledelse | 496 | Nær.øk (120, 121) |
  | SPR3022 | Antikkens kultur, vg3 | 525 | Ant.spr. og ku. (77), raden for vg2 |

  Ikke funnet i InSchool (antakelig friskolefag eller utgått), derfor fortsatt uten årsramme: KRI1023 og KRI1024 Kristendomskunnskap 3, KRI1028 og KRI1029 Katolsk kristendom, REA3065 Statistikk, REA3067 Matematikk for økonomi, SAM3066 og SAM3067 Samisk historie og samfunn 1 og 2. Kalkulatoren lar brukeren skrive inn årsrammen selv.

Nå er 1208 fagkoder koblet.

Skriv til Claude hva som stemmer, og hva som skal endres. Du kan også godkjenne tabellene med `/godkjent programnavn kobling_fellesfag kobling_programfag kobling_regler` i kontrollsaken, og praksisen med `/godkjent yff-arsramme`.

## 14. Sjekkliste for tilbudsstrukturen

Tilbudsstrukturen viser fagene samlet for hvert utdanningsprogram, trinn og retning. Den bygger på Grep og rundskrivet Udir-1 «Fag- og timefordeling og tilbudsstruktur». Den lages på nytt hver mandag (avgjørelse 024).

**Oversikten** ligger i `docs/TILBUDSSTRUKTUR.md` på GitHub. Start med «Sammendrag».

- [ ] **Rekkefølgen:** Er det lett å finne fram? Programmene står slik: studieforberedende, så yrkesfaglige, så påbygging. Under hvert program kommer vg1, så hver vg2-retning med vg3 og lærefag.
- [ ] **Et tilbud du kjenner godt,** f.eks. Vg2 Helsearbeiderfag (HSHEA2) eller Vg2 Realfag (STREA2): Stemmer fagene, timene og den anbefalte YFF-koden? Stemmer antall valgfrie fag?
- [ ] **Alternativer:** Fag med samisk, tegnspråk, kort botid, grunnleggende norsk, minoritet, styrket opplæring, morsmål eller katolske skoler i navnet regnes som alternativer, ikke som det vanlige tilbudet. Det gjelder også fellesfag i Grep som ikke står i den ordinære kolonnen, f.eks. fremmedspråk I+II på vg3. Samisk og tegnspråk som fremmedspråk regnes som vanlige valg. Stemmer det?
- [ ] **Valgfrie plasser:** Antall fag er timene ÷ 140. Fagene som kan velges, er de valgfrie programfagene på trinnet i de studieforberedende programmene, og for fordypning de valgfrie programfagene på programområdet. Er det riktig?
Svar fra eier 01.10.2026: Rekkefølgen er oversiktlig (1), alternativene stemmer (3), og de valgfrie plassene stemmer (4). Hvert programfag står nå med navn og timer, og muntlig-kodene står under faget (2). Felles programfag på landbruk, maritime fag, idrettsfag og musikk, dans og drama er rettet ut fra læreplanene i Grep og Udirs sider om programområdene (5).

Oppfølging samme dag:
- Studieforberedende vg3 i naturbruk (NANAB3) har fellesfagene fra påbygging. Grep merker programområdet «påbygg».
- Romteknologi (ELROM3) har 700 timer programfag i Grep. Rundskrivet har 925. Den eneste skolen som har tilbudet, bruker resten til matematikk 2P-Y og naturfag, og elevene tar norsk og historie som privatister. Dette er skolens ordning, ikke en nasjonal regel. Derfor står det fortsatt som avvik.
- Fag som går over flere trinn, tas normalt i rekkefølge. Om rekkefølgen er obligatorisk, er ikke avklart. Rapporten sier derfor «normalt».

- [ ] **Avvik:** Se «Avvik mellom rundskrivet og Grep». De viktigste:
  - Felles programfag på idrettsfag, musikk, dans og drama, Maritime fag (TPMAR2), Landbruk (NALBR3) og Romteknologi (ELROM3) har en annen sum i Grep enn i rundskrivet. Hvilke fag tar eleven?
  - Studieforberedende vg3 i naturbruk (NANAB3): Grep kobler ikke norsk, matematikk, naturfag og historie til programområdet.
  - Dronefag (ELDRF2) og variantene for særskilte skoler har ingen fellesfag i Grep.
  - «Fag for studiekompetanse» (PBPBY4) har ingen tabell. Er dette vg4 påbygging (tabell 27)?
Svar fra eier 01.10.2026 (andre runde):
- «Fag for studiekompetanse» (PBPBY4) er påbygging vg4, for dem som har fag- eller yrkeskompetanse, eller som går mot grunnkompetanse etter opplæringskontrakt. Den bruker nå tabell 27: norsk, matematikk 2P-Y, naturfag og historie, 645 timer. Kilder: rundskrivet Udir-1-2026 punkt 3.5.3 (rett til vg4 påbygging etter tabell 27) og registreringshåndboken, A03 Programområdekode (PBPBY4YK-- for elever med fag- og yrkeskompetanse, PBPBY4H--- for elever som går mot planlagt sluttkompetanse på lavere nivå etter kontrakt om opplæring). Lenken du fant, er versjonen fra 2016. Appen bruker gjeldende versjon fra 08.04.2025, se avgjørelse 028 og `docs/REGISTRERINGSHANDBOKEN.md`.
- Dronefag (ELDRF2) har de samme fellesfagene som de andre vg2-tilbudene, slik Vilbli viser. Grep og VIGO kobler dem ikke til dronefag. Kodene hentes nå fra et annet vg2-tilbud i elektro og datateknologi, og dette står i rapporten.
- Steiner- og Montessoriskolene følger egne læreplaner. Variantene vises med det Grep har.
- De to tilbudene ved tysk skole kan mangle «bygger på». De står nederst under studiespesialisering.

Svar fra eier 01.10.2026 (tredje runde):
- T1: De fire lærefagene i salg, service og reiseliv bygger på vg2 salg, service og reiseliv (udir.no/kl06/SR). De står nå under vg2.
- T2: Yrkessjåførkurs for voksne (TPYSL3) er voksenopplæring uten kroppsøving. Det har ikke lenger tabell fra rundskrivet.
- T3: Rekkefølgen på fag over flere trinn kan hentes fra VIGO.
- T4: «Like fag» i VIGO er antakelig for godkjenning. Ingen av eksemplene er i bruk i dag. Tas ikke i bruk nå.

- [ ] **Programområder som ikke nås:** Fire vg3 på salg, service og reiseliv, og to realfag-tilbud ved tysk skole, mangler «bygger på» i Grep. Hvor hører de til?

## 15. Lenker til Vilbli

Tilbudsoversikten (`docs/TILBUDSSTRUKTUR.md`) har lenker til skolene og lærebedriftene på Vilbli for hvert tilbud (avgjørelse 027). Lenkene lages fra kodene i Grep. Vilbli kan ikke sjekkes automatisk. Klikk derfor på disse lenkene nå. Kontrollrundene i mai og august har de samme lenkene til avkrysning. Vises riktig side med skoler?

- [x] Vg2 helsearbeiderfag, hele landet: https://www.vilbli.no/nb/nb/no/helse-og-oppvekstfag/program/v.hs/v.hshea2----/p5
- [x] Vg2 helsearbeiderfag, Vestland: https://www.vilbli.no/nb/nb/vestland/helse-og-oppvekstfag/program/v.hs/v.hshea2----/p5
- [x] Lærefag: helsearbeiderfaget: https://www.vilbli.no/nb/nb/no/helse-og-oppvekstfag/program/v.hs/v.hshea3----/p5
- [x] Vg3 språk, samfunnsfag og økonomi: https://www.vilbli.no/nb/nb/no/studiespesialisering/program/v.st/v.stssa3----/p5
- [x] Påbygging etter vg2 helsearbeiderfag: https://www.vilbli.no/nb/nb/no/helse-og-oppvekstfag/program/v.hs/v.pbpby3----/p5
- [x] Vg2 helsearbeiderfag, Møre og Romsdal: https://www.vilbli.no/nb/nb/more-og-romsdal/helse-og-oppvekstfag/program/v.hs/v.hshea2----/p5

Eier 01.10.2026: Med hele løpet i adressen virket fire av seks lenker. Lærefaget sendte til vg1, og påbygging under `v.pb` ga 404. Lenkene bruker nå bare koden for tilbudet, og påbygging står under et yrkesfaglig program, slik Vilbli selv gjør.

Eier 01.10.2026, etter rettingen: Alle seks lenkene virker.

Slutter en lenke å virke senere, si fra hvordan adressen ser ut når du finner siden selv på Vilbli.

