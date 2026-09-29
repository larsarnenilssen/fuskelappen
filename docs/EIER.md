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

**Teste varslingen:** Gjør det samme, men skriv `ks-sfs2213` i feltet «Simuler feil». Da lages en sak under **Issues**, og du får e-post fra GitHub. Det er alltid bare én sak per kilde: finnes det allerede en åpen sak for kilden, blir den oppdatert og får en kommentar i stedet for at det lages en ny. Neste vanlige kjøring lukker saken automatisk når kilden er i orden.

## 6. Når du får et kildevarsel

Varslene kommer som saker under **Issues** med merket `kilde`, og som e-post fra GitHub. Det er én sak per kilde.

**«Kildesjekken … feilet»:** Sjekken fikk ikke hentet kilden, for eksempel fordi nettstedet var nede eller har fått ny utforming. Ofte går det over av seg selv, og saken lukkes automatisk ved neste vellykkede kjøring. Står den åpen i flere uker, si fra til Claude.

**«… har et nytt fingeravtrykk som må godkjennes»:** Innholdet i kilden er endret siden du sist godkjente den. Fingeravtrykket er et «stempel» som viser hvordan siden så ut da du godkjente den.

1. Åpne lenken til kilden i saken og se hva som er nytt.
2. Vurder om noe i appen må endres. Si i så fall fra til Claude hva, med vanlige ord.
3. Når du er fornøyd, skriv til Claude: «Godkjent fingeravtrykk for [kilden]». Claude legger inn det nye fingeravtrykket, og saken lukkes ved neste kjøring.

Innholdet i appen endres aldri automatisk.

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

Alt nytt innhold er merket «Ikke kontrollert» til du har godkjent det. Du godkjenner ved å skrive til Claude hva som er kontrollert, med dato. Claude legger da inn datoen.

**Kildene (etter at endringsforslaget er slått sammen):**

- [ ] Kjør kildesjekken (punkt 5). Du får tre saker om nye fingeravtrykk: avtaleteksten til SFS 2213, hovedtariffavtalen og arbeidsmiljøloven kapittel 10. Åpne lenkene og se at det er riktig dokument. Skriv så til Claude: «Godkjent fingeravtrykk for ks-sfs2213-avtaletekst, ks-hovedtariffavtalen og arbeidsmiljoloven».

**Regelverdiene** (filene ligger i mappen `rules/` på GitHub, men du kan like gjerne kontrollere dem i appen under «Vis utregning»):

- [ ] SFS 2213: årsverk 1687,5 (1650 fra 60 år), 6 ekstra dager à 7,5 timer, planfestet tid 1150, høyst 9 timer per dag og 37,5 per uke, årsramme 607,5 ved funksjon, tillegg 52,5 for fag merket * med 1–15 elever, kontaktlærer 28,5, skoleår 190 dager og 38 uker, 5 arbeidsdager per uke.
- [ ] Vedlegg 1: årsrammene for videregående (151 rader). Se særlig blokken 525/700, der vedlegget har overskriften «Felles programfag» over fellesfag.
- [ ] Hovedtariffavtalen: 1400, 1687,5 og 100/112 i § 12.4, feriepenger 12 % og 14,3 %, overtidstillegg 50 %, garantilønn fra 1.5.2026.

**Kalkulatorene** (på telefonen, under Hjem → Hurtigkalkulatorer):

- [ ] Beskjeftigelse: søk etter fag på navn, kallenavn (R1, 2P) og koder (ENG, BAT, HEA). Prøv ett fag, et fag merket * med «15 eller færre elever», to fag, og en blandet gruppe.
- [ ] Søkeordene: kallenavn og koder står i `rules/sfs2213/fagsok-2026-2027.yaml`. Se særlig over tabellen som kobler programnavnene i vedlegg 1 til utdanningsprogrammene.
- [ ] Periodebeskjeftigelse, vikartimer (ansatt og timevikar), planfestet tid (20 % og 80 %), overtid og fordeling.
- [ ] Årstimer: velg noen fag og se at riktig årstimetall fylles inn. Tabellen står i `rules/sfs2213/arstimer-2026-2027.yaml`, med fagkodene i Grep.
- [ ] Programfag: søk på en fagkode (f.eks. HEA2005) og se at årstimetallet fra Udir stemmer.
- [ ] Lagrede varianter: lagre, endre og hent fram igjen.
- [ ] Stillingsplan: prøv eksemplene E1–E4. Se at teknisk undertid og overtid, timene i hvert fag og lenken til overtid er riktige.
- [ ] Trykk «Vis utregning» og «Slik regnes det ut». Er metoden og formlene forståelige og riktige?
- [ ] Velg Vestland og en skole under Innstillinger. Ingen ekte lokale avtaler er lagt inn ennå, så verdiene skal fortsatt være nasjonale.

**Tekstene:**

- [ ] Begrepene under Oppslag → Begreper, på bokmål og nynorsk.
- [ ] «Hva tiden brukes til» under Fordeling, særlig «Annen planfestet tid og annet elevrettet arbeid».

Skriv til Claude hva som er riktig, og hva som må endres.
