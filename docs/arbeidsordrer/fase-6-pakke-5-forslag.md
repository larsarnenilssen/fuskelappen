# Fase 6, pakke 5: Kalenderen – forslag til eier (05.10.2026)

Grunnlaget er `fase-6-pakke-5.md`. Mockupene er laget med ekte datoer: fristene i Inntak og Vurdering, eksamensdatoene og skoleruta for Vestland. De er tegnet inn i appen, så topplinjen, fargene og skriften er som i dag. Eksempelet fra Regelverk er oppdiktet.

## Søket fra toppfeltet (eiers ønske denne økten, bygget)

- Søket legges over siden, og siden står synlig bak et slør.
- Et trykk på sløret lukker søket, og siden står der den sto. «Lukk søket», Esc og tilbake virker som før.
- Treffene ruller inne i den blå boksen. Nederst står alltid en stripe av siden igjen, så det finnes et sted å trykke.
- Siden bak kan ikke nås med tastatur eller skjermleser mens søket er åpent.

## 1. Siden `#/kalender`

- **Plassering:** Kalender blir en ny modul under «Oppslag», sammen med Regelverk, Begreper og Fylker. Den får ikon og stjerne.
- **Innhold:** Siden samler `frister()` fra alle manifestene.
- **De gamle sidene:** Kalender for inntak (`#/inntak/frister`) og Kalender for eksamen (`#/vurdering/eksamen-og-klage`) sender videre til kalenderen, ferdig filtrert:
  - `#/kalender?tema=inntak`
  - `#/kalender?tema=eksamen&vis=privatister`
  
  Lagrede favoritter og lenker virker da fortsatt. Boksene i Inntak og Vurdering lenker til de filtrerte adressene.
- **Adressen:** Alle valgene står i adressen: `visning=skolear`, `aar=2026`, `tema=…` og `vis=…`.

## 2. Visning (mockup 1, 2, 6 og 7)

- **To visninger:** Bryteren øverst velger mellom «Neste tolv måneder» (standard, fra måneden vi er i) og «Skoleåret» (august–juli).
- **Skoleåret:** Under bryteren står knappene 2026–2027 og 2027–2028.
- **Tidslinjen** er loddrett.
  - Datoen står til venstre, med ukedagen under. En periode over to måneder står som «23.» med «til 1. jan» under.
  - Til høyre står et kort med tittel, tema, hvem det gjelder og fylket.
  - Et kort åpnes med et trykk og viser teksten, lenkene, regelverket og kildene (mockup 3).
- **Passerte datoer** er dempet.
- **I dag** er en rød strek med «I dag, mandag 5. oktober».
- **Hver måned** har overskriften med året, og overskriften blir stående øverst mens brukeren ruller.
- **Stripen** «Året med ett blikk» beholdes øverst. Prikkene har temafargen, og et trykk på en måned ruller dit.
- **Stor skjerm** (fra 56rem): tre deler side om side, hver med fire måneder (aug–nov, des–mar, apr–jul). Fra 80rem: fire deler med tre måneder. Siden er da bredere, som kalkulatorene.

## 3. Filtre (mockup 4)

- **Plassering:** Filtrene står i en boks som er lukket fra start, som temaene i begrepsbanken. Overskriften viser valget, f.eks. «Filter: Eksamen, privatister».
- **Tema:** Inntak, Vurdering, Eksamen, Skolerute og Regelverk. Arbeidstid og Skolemiljø kommer når modulene har frister.
  - Fristene får et nytt felt, `tema`. Uten feltet gjelder modulen.
  - Fristene i Vurdering deles i vurdering (samtale, varsel, halvårsvurdering, standpunkt) og eksamen.
- **Hvem det gjelder:** Elever, Privatister, Lærlinger, Voksne og Fortrinnsrett.
  - `ungdom` i Inntak blir `elever`, og `fortrinn` blir `fortrinnsrett`. Gamle adresser med `?vis=ungdom` virker fortsatt.
- **Temafarger:** inntak blå, vurdering rav, eksamen lilla, skolerute grønn og regelverk grå. Fargene finnes allerede i lyst og mørkt tema.

## 4. Datoer uten fast dag (mockup 5)

- **Når de vises:** Frister uten fast dag («Udir fastsetter datoen», «Ti dager», «Hvert halvår») vises bare når det er filtrert på tema.
- **Hvor:** De står samlet under «Uten fast dato» etter tidslinjen. Måneden eller tidspunktet med ord står til venstre.
- **Når datoen kommer:** Får en slik frist en dato fra dataene (eksamensdatoene), flyttes den inn i tidslinjen.

## 5. Skoleruta

- **Hva Lovdata har:** Bare fire fylker har skoleruta som forskrift: Vestland, Rogaland, Troms og Finnmark (7 forskrifter, alle hentet). De andre fylkene har skoleruta bare på egne sider.
- **Tolkningen:** Et skript (`scripts/skolerute/`) leser tabellene etter `hent:lovdata` og skriver `data/skolerute/<fylke>.json`.
  - Typene er skolestart, ferie, fridag og siste skoledag. Fra og til står som datoer.
  - Hver dato kontrolleres: ukedagen må stemme med kalenderen, og datoen må ligge i skoleåret.
  - En prøve på alle sju forskriftene fant over 120 datoer. Alle ukedagene stemte.
  - Det skriptet ikke kan lese sikkert, gir en kontrollsak i stedet for data.
- **Vestland må hentes på nytt:** Linjeskiftene i tabellcellene forsvinner i dag (`<br>` blir mellomrom). Det ødelegger tabellen:
  - Mars har «Veke 9 måndag 1.–fredag 5. mars Siste skuledag før påske …» mot bare «Påskeferie».
  - Hentingen må beholde linjeskiftene, og Vestland må hentes på nytt i Actions. Skymiljøet når ikke Lovdata.
- **Merknad:** Der skoleruta brukes, står en merknad om at datoene ved den enkelte skolen kan avvike, med lenke til forskriften. For Vestland sier merknaden at skolene følger vertskommunen.
- **Andre fylker:** Uten skolerute i Lovdata står en linje med lenke til fylkets side under «Hos fylkeskommunen» (pakke 4).

## 6. Kommende endringer i regelverket

**Svar på spørsmålet i arbeidsordren:** Nei, ikrafttredelsen står ikke alltid i metadataene. Dette viser datasettene vi allerede har:

- Offentleglova §§ 2, 6, 7, 8 og 30: «Vert endra ved lov 19 juni 2026 nr. 36 (i kraft frå den tid Kongen bestemmer)».
- Arbeidsmiljøloven § 14-2: «Endres ved lov 19 juni 2026 nr. 48 (i kraft fra den tid Kongen bestemmer)».
- Opplæringslova § 6-6: «Vert endra ved lov 12 juni 2026 nr. 22 (i kraft 1 juli 2028)».
- En endring i opplæringslova i 2025 fikk datoen et halvt år senere, i en egen resolusjon («i kraft 1 jan 2026 iflg. res. 19 des 2025 nr. 2711»).

**Forslag:**

- **To kilder:**
  1. **Notatene i datasettene** («Vert endra / Endres ved lov … (i kraft …)»). De gir paragrafen, og de hentes allerede hver uke.
  2. **Lovtidend avd. I hver uke,** som avd. II. Bare kunngjøringer fra departementene som eier dokumentene i `lovverk.yaml` hentes. De tas med når «Endrer» inneholder et av dokumentene, eller en endringslov vi venter på datoen for. Da fanges også «Ikrafttredelse av …», som kommer senere.
- **Lagring:** `data/lovdata/kommende.json` med dokumentet, paragrafene, endringsloven, datoen (eller ingen dato) og lenken til kunngjøringen.
- **Visning:**
  - Med dato står endringen i kalenderen: «Endring i opplæringslova § 6-6 gjelder fra 1. juli 2028». Datoen lenker til kunngjøringen hos Lovdata og til paragrafen i Regelverk.
  - Uten dato står endringen under «Uten fast dato» som «Vedtatt, ikke satt i kraft», når det er filtrert på Regelverk.
- **Feil som rettes samtidig:** Hentingen av de lokale forskriftene setter i dag en endring uten dato til å gjelde fra i dag. Den skal i stedet vente på datoen.
- **Kontroll:** Kunnskapsdepartementets oversikt «Endringer i lover og forskrifter fra 1. januar / 1. juli» og Udirs «Nytt til barnehage- og skolestart» lenkes nederst i kalenderen.

## 7. Lenker fra datoene

- **Nytt felt:** Fristene får `lenker`, en liste med adresser i appen (f.eks. `#/vurdering/klage-pa-karakter`, `#/begreper/sensur`).
- **Tittel og type** hentes fra søket, så kortet viser «Klage på karakter – Veiviser» uten at teksten skrives to ganger.
- **Test:** En test krever at hver lenke finnes.
- **Fagarket** lenker til `#/kalender?tema=eksamen` i stedet for siden Eksamen. Du ba 04.10.2026 om at lenken skulle gå til Eksamen. Skal den byttes, eller skal begge stå?

## 8. Svar, svarfrist og andre inntak

- **Automatisk henting virker ikke her:**
  - Vilbli stenger med en robotsjekk.
  - Fem fylker nås fra skymiljøet: Trøndelag, Troms, Finnmark, Akershus og Rogaland.
  - Datoene er fylkets egne og oftest omtrentlige («ca. 8. juli», «uke 28/29», «senest 10. juli»). Bare Trøndelag har eksakte datoer.
  - Regelen fra eksamensdatoene, der to fylker må ha samme dato, passer derfor ikke.
- **Forslag:**
  - `content/inntak/datoer-2027.yaml` med en nasjonal oppføring («Første inntak tidlig i juli, fylket bestemmer datoen»).
  - Én oppføring per fylke vi har lest, med `gyldighet: fylke`, `grunnlag: praksis`, `kontrollert: null` og fylkets side som kilde.
  - De fem sidene legges i kildesjekken, så en endring på siden gir beskjed.
  - Kontrollrunden i mai får en påminnelse om å oppdatere filen for neste inntak.

## 9. Forsiden (mockup 8, 9 og 10)

| | Hvor | Skyver ned på mobil |
|---|---|---|
| **A** | Én linje i det blå feltet under søket: «Neste: 5.–9. okt · Haustferie». Pilen åpner de tre neste. | ca. 65 px |
| **B** | Egen boks «Neste datoer» med tre datoer og lenken «Kalenderen». | ca. 400 px |
| **C** | Samme boks, lukket: viser bare neste dato til den åpnes. | ca. 100 px |

**Forslag:** C på mobil, som åpnes til B. På stor skjerm står den åpen (B), der det er plass. Boksen slås av og på under «Tilpass», som gruppene.

## 10. Kontrollsakene

- **Kildesjekken (#92):**
  - Kilder uten godkjent fingeravtrykk får overskriften «Ny kilde, ikke godkjent ennå» i saken og i kontrolloversikten.
  - De står under egen overskrift før «Endret i kildene».
  - Avkrysningen for godkjenning virker som før.
- **Lenkesjekken (#98):**
  - Saken opprettes bare når en lenke er borte eller flyttet.
  - Nettstedene som stenger, skrives til `data/status/stengte-lenker.json` og vises i `docs/KONTROLL.md`.
  - Lenkesjekken må da gå før kontrolloversikten lages i den ukentlige jobben.
  - Avgjørelse 062 oppdateres. #98 lukkes når endringen er flettet.

## 11. CI etter hva som er endret

- **Ny første jobb:** Den ser hvilke filer PR-en endrer, og gir ett av tre nivåer:
  - **Ingen tester:** bare `docs/` og `*.md` utenom `content/`.
    - Unntak: `docs/KOBLING.md`, `docs/TILBUDSSTRUKTUR.md`, `docs/KILDER.md` og `README.md` testes mot dataene og gir alle testene.
  - **Rask jobb:** bare versjonen er endret i `package.json` og `package-lock.json`, og `CHANGELOG.md` har bare fått en ny versjonsoverskrift.
  - **Alt:** alt annet, og alltid på `main` og ved manuell start.
- **Hopp over på jobbnivå:** Jobbene hoppes over på jobbnivå, så de åtte ende-til-ende-jobbene ikke henter Playwright-containeren bare for å rapportere.
- **«Test og bygg»:** Jobben samler resultatet og er grønn når de overhoppede jobbene var lov å hoppe over.
- **Kreves før fletting:** I dag krever ikke `main` noen sjekk. Vil du at «Test og bygg» skal kreves, slås det på under Settings → Branches.
- **Testet logikk:** Logikken står i et lite skript med enhetstester.

## 12. Dokumentasjon

- Avgjørelse 066 (kalenderen) og 067 (CI etter hva som er endret).
- `OPPDRAG.md`: fase 8 bygger årshjulet og eksporten (.ics) på kalenderen og datafilene over.

## Spørsmål til deg

1. **Neste skoleår:** Arbeidsordren sier «ellers står det som et generisk skoleår». Jeg leser det slik: Knappen for neste skoleår står alltid. Uten datoer viser den de faste fristene uten år, med linjen «Datoene for 2027–2028 er ikke kjent ennå». Stemmer det?
2. **Uten fast dato:** Samlet nederst (mockup 5), eller i måneden sin etter datoene?
3. **Forsiden:** A, B, C eller C på mobil og B på stor skjerm?
4. **Fagarket:** lenke til kalenderen, til Eksamen, eller begge?
5. **Regelverk:** Skal vedtatte endringer uten dato vises (under «Uten fast dato»), eller bare endringer med dato?
6. **Rekkefølgen:** Jeg foreslår å bygge siden, filtrene og lenkene først, så skoleruta og regelverket (de trenger nye hentinger i Actions), og til slutt forsiden, kontrollsakene og CI. Passer det?

## Svar fra eier (05.10.2026, runde 1) og endringer i forslaget

### 1. Neste skoleår

Eier sa ja, men var usikker på om spørsmålet var forstått rett. Eksempelet med «Skoleåret» valgt i oktober 2026 viser hva som menes:

- **2026–2027:** alle datoene, som i mockup 6.
- **2027–2028:**
  - Eksamensdatoene er ikke kjent ennå. Eksamen står med måneden, som «Uten fast dato» (punkt 4).
  - Faste årlige frister (1. mars, 1. oktober …) står med riktig dato i 2027 og 2028.
  - Skoleruta står bare der fylket har vedtatt den (Troms, Finnmark og Rogaland har 2027–2028, Vestland ikke).
  - Øverst står «Datoene for eksamen i 2027–2028 er ikke kjent ennå».
- **Knappen for neste skoleår** står alltid. Alternativet er å vise den bare når Udir har lagt ut datoene, og ellers vise ett «generisk» skoleår uten årstall. Det ville skjule de faste fristene, som er like sikre i 2028 som i 2027.

### 2. Uten fast dag

**Eier:** Fristen står i måneden sin når måneden er pålitelig, ellers i alle månedene som trengs for å dekke perioden.

- **Pålitelig måned:** Fristen står nederst i måneden som «I løpet av november», med stiplet kant. Det gjelder f.eks. trekket til høsteksamen og standpunkt i juni.
- **Periode:** Regelen får en ny type for perioder (`perioden` med fra- og til-måned). Fristen står da i hver av månedene, merket «juli–august». Det gjelder to frister:
  - «Svar, svarfrist og andre inntak»: juli–august. Første inntak er 8. juli og sisteinntak 5. august i Telemark og Trøndelag.
  - «Klage på vedtaket om inntak»: juli–august.
- **Uten måned:** Frister som gjelder hele året eller regnes fra noe annet («Ti dager», «Hvert halvår»), står i boksen «Gjelder hele året» øverst, slik som i dag.
- **Når de vises:** Fremdeles bare når kalenderen er filtrert på tema.
- **Avgrensning:** Hvilke måneder som er pålitelige, er en faglig vurdering. Endringene får `kontrollert: null` og kontrollspørsmål.

### 3. Forsiden: forslag D

**Eiers innvending:**
- Under toppbåndet blir det to elementer uten overskrift og med ulike funksjoner (stedlinjen og kalenderen).
- I toppbåndet blir det voldsomt når kalenderen åpnes, og bryterne og «Tilpass» står med andre bredder.

**Forslag D** (mockup 12–15): «Neste datoer» blir en vanlig gruppe på forsiden, på linje med Favoritter og kategoriene.

- Den har overskrift og pil som de andre gruppene.
- Lukket står neste dato under overskriften, slik lukkede grupper viser innholdet i dag («5.–9. okt: Haustferie»).
- Åpen står de tre neste datoene som rader i et kort, med lenken «Hele kalenderen» nederst.
- Den flyttes, lukkes og slås av under «Tilpass», som de andre gruppene. Valget huskes.
- Den står først, lukket på mobil og åpen på stor skjerm. På stor skjerm står den ved siden av Favoritter.
- Toppbåndet er uendret og styrer fortsatt bare innholdet under.

**Hvorfor D:** D bruker et mønster brukeren kjenner fra før, og tar ingen ny plass på mobil utover én gruppeoverskrift (ca. 70 px). Variantene A, B og C utgår.

### 4. Fagarket

Fagarket lenker fortsatt til siden Eksamen. Ingen endring.

### 5. Endringer uten dato

Med offentleglova som eksempel:

1. **Vedtatt:** Lov 19. juni 2026 nr. 36 endrer offentleglova §§ 2, 6, 7, 8 og 30 «frå den tid Kongen bestemmer». Den ukentlige hentingen finner notatet i datasettet og kunngjøringen i Lovtidend avd. I.
2. **Uten dato:** Endringen står i boksen «Vedtatt, ikke satt i kraft ennå» øverst når kalenderen er filtrert på Regelverk. Raden er «Offentleglova §§ 2, 6, 7, 8 og 30 – endret ved lov 19. juni 2026 nr. 36. Gjelder fra den dagen Kongen bestemmer». Den lenker til paragrafene i Regelverk og til endringsloven hos Lovdata. Uten filter vises den ikke, som andre frister uten fast dag.
3. **Satt i kraft:** Når resolusjonen om ikrafttredelse kunngjøres, finner hentingen den neste mandag. Endringen flyttes da inn i tidslinjen på datoen («Endring i offentleglova gjelder fra 1. januar 2027»). Den vises da også uten filter, og på forsiden når den er blant de tre neste.
4. **Gjelder:** Etter datoen forsvinner raden. Teksten i Regelverk oppdateres når datasettet fra Lovdata har den nye teksten.

**Forslag:** Ta med endringer uten dato. For skoleledere er det nyttig å vite hva som er vedtatt før datoen er satt.

### 6. Rekkefølgen

Eier lar Claude velge. Rekkefølgen er:

1. Siden, filtrene, lenkene og flyttingen fra de gamle kalenderne.
2. Forsiden.
3. Skoleruta, inntaksdatoene og regelverket.
4. Kontrollsakene og CI.

### De gamle kalenderne

- **Boksene:** Boksene i Inntak og Vurdering som lenker til Kalender for inntak og Kalender for eksamen, beholder tekst, ikon og plass. De lenker til kalenderen, ferdig filtrert:
  - `#/kalender?tema=inntak`
  - `#/kalender?tema=eksamen` (i dag `?vis=…` når boksen har en gruppe)
- **Sidene:** De gamle sidene fjernes når kalenderen kan erstatte dem.
- **Gamle adresser:** Adressene, favorittene og søketreffene til dem åpner den filtrerte kalenderen.

### Fylkene som svarer (oppklaring)

**De åtte fylkene** i arbeidsordren er fylkene eksamensdatoene hentes fra (`scripts/eksamen/kilder.ts`): Oslo, Rogaland, Nordland, Akershus, Innlandet, Telemark, Trøndelag og Finnmark.

- **Tallet fem** i forslaget gjaldt fylker med datoer for inntak på sidene sine.
- **Oslo, Innlandet og Nordland** svarer, men lenker bare til Vilbli.
- **Telemark** ble lest på feil adresse. Miljøet slipper inn telemarkfylke.no, men ikke www.telemarkfylke.no.
  - Telemark har datoene (hovedinntak 8. juli og sisteinntak 5. august 2026).
  - Det blir seks fylker med datoer: Trøndelag, Telemark, Akershus, Troms, Finnmark og Rogaland.

**Sjekket på nytt 05.10.2026:**

| | Fylker |
|---|---|
| Svarer | Oslo, Rogaland (undersidene), Nordland, Akershus, Innlandet, Telemark (uten www, ustabilt), Trøndelag, Troms (tregt), Finnmark |
| Stengt av miljøet (ikke åpnet) | Østfold (ofk.no), Buskerud (bfk.no), Vestfold (vestfoldfylke.no), Agder (agderfk.no), Møre og Romsdal (mrfylke.no), www.telemarkfylke.no |
| Stengt av nettstedet selv | Vestland (vestlandfylke.no bryter forbindelsen), Vilbli (robotsjekk), Lovdata |

- **Troms** svarer nå. 04.10.2026 sto Troms blant fylkene som stengte. Troms kan da legges inn i eksamenskildene i denne pakken.

**Inntaksdatoene, endret forslag:** Med seks fylker hentes datoene automatisk, som eksamensdatoene.

- Et mønster per fylke skriver til `data/inntak/datoer.json`, med `grunnlag: praksis`.
- Både eksakte datoer («8. juli») og uker («uke 28/29») leses.
- Datoene er fylkets egne og vises bare når fylket er valgt. Regelen om at to fylker må ha samme dato, brukes ikke.
- Finner mønsteret ikke datoen, gir det en kontrollsak.
- Uten valgt fylke står den nasjonale oppføringen «juli–august».
- Påminnelsen i kontrollrunden i mai beholdes.
