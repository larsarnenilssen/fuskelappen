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

**Enklest:** skriv til Claude «Publiser v0.1.0». Claude setter merket, og publiseringen starter av seg selv. Claude setter aldri et versjonsmerke uten at du ber om det.

**Selv, på GitHub:**

1. Åpne repoet og trykk **Releases** i høyre kolonne (eller gå til `…/protokollen/releases`).
2. Trykk **Draft a new release**.
3. Trykk **Choose a tag**, skriv versjonen (f.eks. `v0.1.0`) og velg **Create new tag**.
4. Skriv gjerne en kort tittel, og trykk **Publish release**.

Etter omtrent 5 minutter er den nye versjonen ute. Du kan følge med under **Actions** → **Publiser**. Grønt hakemerke betyr at den er publisert.

Brukere som har appen installert, får meldingen «Ny versjon er klar» med en knapp for å oppdatere.

## 4. Gå tilbake til en tidligere versjon

1. Åpne **Actions** og velg **Publiser** i listen til venstre.
2. Trykk **Run workflow** (til høyre).
3. Skriv versjonen du vil tilbake til i feltet, f.eks. `v0.1.0`, og trykk den grønne **Run workflow**.

## 5. Kildesjekken

En automatisk jobb sjekker kildene hver mandag morgen. Den lagrer resultatet, som vises i appen under **Om appen → Kilder**, og gir deg beskjed hvis noe er endret eller feiler.

**Kjøre sjekken selv:** Åpne **Actions** → **Kildesjekk** → **Run workflow** → la feltet stå tomt → **Run workflow**. Etter et par minutter kommer det et grønt hakemerke. Trykker du på kjøringen, ser du et sammendrag.

**Teste varslingen:** Gjør det samme, men skriv `ks-sfs2213` i feltet «Simuler feil». Da lages en sak under **Issues**, og du får e-post fra GitHub. Det er alltid bare én sak per kilde: finnes det allerede en åpen sak for kilden, blir den oppdatert og får en kommentar i stedet for at det lages en ny. Neste vanlige kjøring lukker saken automatisk når kilden er i orden.

## 6. Når du får et kildevarsel

Varslene kommer som saker under **Issues** med merket `kilde`, og som e-post fra GitHub. Det er én sak per kilde.

**«Kildesjekken … feilet»:** Sjekken fikk ikke hentet kilden, for eksempel fordi nettstedet var nede eller har fått ny utforming. Ofte går det over av seg selv, og saken lukkes automatisk ved neste vellykkede kjøring. Står den åpen i flere uker, si fra til Claude.

**«… har et nytt fingeravtrykk som må godkjennes»:** Innholdet i kilden er endret siden du sist godkjente den. Fingeravtrykket er et «stempel» som viser hvordan siden så ut da du godkjente den.

1. Åpne lenken til kilden i saken og se hva som er nytt.
2. Vurder om noe i appen må endres. Si i så fall fra til Claude hva, med vanlige ord.
3. Når du er fornøyd, skriv til Claude: «Godkjent fingeravtrykk for [kilden]». Claude legger inn det nye fingeravtrykket, og saken lukkes ved neste kjøring.

Innholdet i appen endres aldri automatisk.

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
