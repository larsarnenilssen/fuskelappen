# Endringslogg

Alle endringer brukerne merker, føres her. Formatet følger [Keep a Changelog](https://keepachangelog.com/no/1.1.0/), og versjonene følger [SemVer](https://semver.org/lang/no/).

## [Unreleased]

### Lagt til

- **Opplæringsløp: Lenke til utdanning.no** fra hvert tilbud utdanning.no har en side for.
- **Opplæringsløp: Løp kildene ikke er enige om, er merket.** Står et løp i Grep, men ikke i VIGO eller på utdanning.no (eller omvendt), står det ved løpet, med en forklaring.

## [0.29.0] – 2026-10-03

### Lagt til

- **Tre nye begreper i Inntak:** karakterpoeng, privatist og tilleggspoeng (Vestland, vises når fylket er valgt).
- **Status på søkerønsker:** Oppslag i begrepsbanken over statuskodene i inntaket fra VIGO, med søk. Fristen for svar og veiviseren lenker dit.
- **Opplæringsløp: Vg4 påbygging** står som påbygging etter lærefagene, fra VIGO.
- **Opplæringsløp: Vg2 på yrkesfag etter Vg1 studiespesialisering** med yrkesfaglig opphenting står i en egen boks med søk, i stedet for som en lang liste.

### Endret

- **Begreper i teksten lenker til begrepsbanken:** Første gang et begrep står i en tekst, kan du trykke på ordet for å lese hva det betyr. Lenken har en tynn, stiplet strek under, så teksten ikke fylles med blå lenker. Gjelder alle tekster, innledninger og hjelpetekster, og nye begreper får lenker av seg selv.

## [0.28.0] – 2026-10-03

### Lagt til

- **Inntak: Poengberegning** til Vg1, Vg2 og Vg3 etter opplæringsforskrifta § 4-19 og § 4-25, med utregningen trinn for trinn og kilden til hver regel.
  - **Vg1:** Fagene med standpunkt på vitnemålet fra grunnskolen står ferdig, med eksamen og valgfag (snittet av valgfagene teller som én karakter).
  - **Vg2 og Vg3:** Velg løpet søkeren har gått, så fylles fagene inn med standpunkt eller halvår, også de felles programfagene på yrkesfag. Du kan endre radene, legge til flere eller starte med blankt ark. «Annen karakter» gir den beste av to karakterer i samme fag, ved privatisteksamen eller omvalg.
  - IV og IM teller med null, fritak og «deltatt» teller ikke, og kalkulatoren sier fra når søkeren skal behandles individuelt.
  - **Vestland:** tilleggspoeng på Vg1 musikk, dans og drama og Vg1 idrettsfag.
  - «Slik regnes poengene» forklarer reglene, med kilder.

### Endret

- **Søket viser fylkesinnhold bare for valgt fylke:** Begreper som bare gjelder ett fylke (f.eks. inntaksområde i Vestland), vises i søket bare når det fylket er valgt.
- **Kortere kilder i utregningen** i alle kalkulatorene: f.eks. «Opplæringsforskrifta § 4-19 første ledd bokstav a» og «SFS 2213 Vedlegg 1» i stedet for de fulle navnene, med lenke rett til paragrafen i appen når den finnes der. Kopien av utregningen har fortsatt de fulle navnene.

## [0.27.0] – 2026-10-03

### Lagt til

- **Inntak: Søknad og frister gjennom året.** Fristene ved inntak fra oktober til september, med en stripe over året øverst, så du ser med ett blikk hvilke måneder som har frister. Trykk på en måned for å gå dit, og på en frist for å lese mer, med paragrafene og kildene.
  - Filter for **Ungdom**, **Voksne** og **Fortrinnsrett og individuell behandling**.
  - Med: melding om fortrinnsrett 1. oktober, kunngjøring, søknadsfristene 1. februar og 1. mars, søknader til skoler med tegnspråk, mer opplæring i fag som ikke er bestått, svar og andre inntak (datoene står på Vilbli), klage, og at voksne søker når som helst.
  - **Vestland:** Når Vestland er valgt, kommer fristene fra den lokale forskriften med: når voksne bør søke, flytting, møte første skoledag, ventelister, når inntaket er avsluttet og omvalg.
  - Oversikten over Inntak viser den neste fristen.
  - Hvem som har søknadsfrist 1. februar, og hvem som avgjør en klage, står som lister. «I regelverket» og «Kilder» er lukkede rader under hver frist, som i veiviserne.

## [0.26.0] – 2026-10-03

### Lagt til

- **Inntak** under «Elever og opplæring»: veiviseren **Rett, inntak og søknad**, steg for steg etter opplæringslova kapittel 5 og 18, opplæringsforskrifta kapittel 4 og 13 og Udirs merknader til forskriften.
  - **Rett:** fullført grunnskole eller tilsvarende, opphold i Norge, studie- eller yrkeskompetanse fra før, og om søkeren har ungdomsrett eller voksenrett. Veien kan ende i påbygging, yrkesfaglig rekvalifisering eller ingen rett.
  - **Inntaksmåte:** trinn, vilkår for Vg2 og Vg3, de tre grunnlagene for fortrinnsrett, individuell behandling og poeng.
  - **Søknad:** hvor søknaden sendes, søknadsfristen (1. februar eller 1. mars) i hver kategori, svar og hvem som avgjør en klage. Voksne søker fortløpende, og alt om voksne står på én side.
  - **Vestland:** Når Vestland er valgt, står reglene fra den lokale forskriften i egne bokser i stegene: inntaksområde og tilleggspoeng, retten til å fortsette på samme skole, deltidselever, flytting, ventelister og voksne. Uten valgt fylke sier en merknad at bare de nasjonale reglene vises.
  - Lenker begge veier mellom grunnopplæring i utlandet og steget om kort botid i veiviseren for særskilt språkopplæring.
- **Nye begreper:** ungdomsrett, voksenrett, sluttkompetanse, fortrinnsrett, individuell behandling, omvalg, realkompetansevurdering, landslinje og gjesteelev, og for Vestland inntaksområde og deltidselev.
- **Særskilt språkopplæring:** Læreplanboksen har fått læreplanen i norsk og samfunnskunnskap for språklige minoriteter (GNS02-01), for voksne i modulstrukturert opplæring. Den står i en egen gruppe «For voksne» nederst i boksen, uten merke for kompetansegivende, med vurderingen godkjent / ikke godkjent og fagkoden.

### Endret

- **Alle veiviserne har én side per valg:** Steg uten valg står på samme side som spørsmålet eller utfallet de fører til, så du trykker bare der det er et valg. «Neste»-knappen er borte.
- **Mindre rulling i veiviserne:** Hvert steg står i sin egen ramme, paragrafene står i en lukket rad «I regelverket» som kildene, lokale regler («I Vestland») er lukket til du åpner dem, «Veien hit» viser de to siste valgene med «Vis hele veien», og under knappene står «Tilbake til …» og nederst «Til toppen».
- **Lukkede steg på mobil:** Står flere steg på samme side, er stegene uten valg lukket på mobil, med den første setningen, fristen og ansvaret synlig og «Les hele steget». På PC er alt åpent. Øverst på siden går «Til spørsmålet» rett til knappene.
- **Svarknappene i veiviserne** står under hverandre også på PC, og har mindre tekst, så knapper med mye tekst ikke blir så høye. Svar som hører sammen, kan stå under en felles overskrift, som «Fortrinnsrett» og «Uten fortrinnsrett» i steget om inntaksmåte.
- **Veiviserne:** Titlene på steg med valg er et emne og ikke et spørsmål, for eksempel «Elever med kort botid» i stedet for «Kort botid?», fordi spørsmålet står over knappene.

## [0.25.0] – 2026-10-03

### Lagt til

- **Særskilt språkopplæring:** Steget om læreplaner viser nå alle tre læreplanene for særskilt språkopplæring i en boks som kan åpnes: grunnleggende norsk, norsk for kort botid og morsmål for språklige minoriteter. Hver læreplan har merke for om den er kompetansegivende, vurderingsuttrykket og alle fagkodene i én lukket rad per trinn (Vg1, Vg2, Vg3), med lenke til fagene.

### Endret

- **Tilrettelegging:** Veiviserne på oversikten står som like høye kort med en liten fasestolpe og fasene under, som stolpen øverst i veiviseren. På stor skjerm står kortene side om side. «Tilpasset opplæring og individuell tilrettelegging» står først.
- **Veiviserne har hver sin farge:** Særskilt språkopplæring er lilla, både på kortet og i hele veiviseren (stolpen, kartet, knappene, lenkene og feltene). Tilpasset opplæring er fortsatt blå.

## [0.24.0] – 2026-10-03

### Lagt til

- **Tilrettelegging:** ny veiviser **Særskilt språkopplæring og kort botid**, steg for steg etter opplæringslova § 6-5 og § 6-6, opplæringsforskrifta og Udirs sider.
  - Hvem som har rett, vurdering av norskferdighetene, vedtak om forsterket opplæring i norsk, morsmålsopplæring og tospråklig opplæring i fag.
  - For elever med kort botid: innføringsopplæring (frivillig, høyst to år) og læreplanen i norsk for språklige minoriteter med kort botid, med lenke til fagene.
  - Jevnlig vurdering til eleven kan følge den vanlige opplæringen. Veien viser hver runde.
  - Kartet over hele prosessen og fasene virker som i veiviseren om tilpasset opplæring.
- **Nye begreper:** minoritetsspråklig elev, særskilt språkopplæring, forsterket opplæring i norsk, morsmålsopplæring, tospråklig opplæring i fag, innføringsopplæring og kort botid.

### Endret

- **Tilrettelegging:** Ingressen og figuren sier «noen» elever i stedet for «noen få», og utfallet «Eleven trenger ikke lenger tilrettelegging» sier ikke lenger at det ikke trengs nytt vedtak. Det står åpent.
- **Begreper:** Øverst på hvert begrep står «Begreper» som lenke til begrepsbanken, så det er tydelig hvor du er når du har kommet dit via en lenke fra en annen del av appen.

## [0.23.0] – 2026-10-03

### Lagt til

- **Tilrettelegging** under «Elever og opplæring»: veiviseren **Tilpasset opplæring og individuell tilrettelegging**, steg for steg etter opplæringslova kapittel 11, forvaltningsloven og Udirs veileder.
  - Velg hvor saken starter: i den ordinære opplæringen, med vedtak fra grunnskolen, eller at eleven eller foreldrene ber om tilrettelegging.
  - Hvert steg viser hvem som har ansvaret, hva som skal dokumenteres, fristene og paragrafene i Regelverk. Kildene og en utdyping er lukket til du åpner dem.
  - Svarene står under steget, og neste steg kommer der du trykket. Veien du har gått, står som en linje med punkter, og du kan gå tilbake til et tidligere steg.
  - **Hele prosessen:** et kart over alle stegene i hver fase, med fristene som merker («Klage: 3 uker», «Hvert år») og hvor veien kan ende. Velg et steg for å gå rett dit.
  - Adressen viser steget og svarene, så et steg kan deles som lenke, og tilbakeknappen går ett steg tilbake.
  - På stor skjerm står prosessen med fasene og stegene i en egen kolonne til venstre.
  - På slutten kan du kopiere en oppsummering av veien, med ansvar, dokumentasjon, frister og paragrafer.
  - Oversikten viser med en figur at alle elever skal ha tilpasset opplæring, og at noen få i tillegg har rett til individuell tilrettelegging.
- **Nye begreper:** tilpasset opplæring, tilfredsstillende utbytte, individuell tilrettelegging, individuelt tilrettelagt opplæring, personlig assistanse, fysisk tilrettelegging og tekniske hjelpemidler, sakkyndig vurdering, PP-tjenesten, individuell opplæringsplan (IOP), selvråderett fra 15 år, og elevens beste og medvirkning.

### Endret

- **Skjermlesere:** Når bare en del av siden byttes ut, for eksempel et nytt steg i en veiviser, flyttes fokus til det nye innholdet og ikke til sidetittelen.

## [0.22.0] – 2026-10-02

### Lagt til

- **Regelverk** under «Oppslag»: lover, forskrifter og avtaler som gjelder videregående opplæring.
  - **Lover og forskrifter:** opplæringslova, opplæringsforskrifta, forvaltningsloven, arbeidsmiljøloven og forskrift om helse og miljø i skoler, med kapitlene som gjelder videregående. Teksten hentes fra Lovdata og vises slik den er fastsatt, på bokmål eller nynorsk.
  - **Lokale forskrifter** vises når du har valgt fylke. For Vestland: inntak og formidling, og skulereglar.
  - **Avtaler:** Hovedtariffavtalen og SFS 2213, skrevet med egne ord, med lenke til punktet i avtaleteksten.
  - Søk i hele regelverket øverst, også med bokmålsord i nynorsk tekst («individuelt tilrettelagt» finner «tilrettelagd»).
  - Kapitlene står i rubrikker og paragrafene i bokser som er lukket til du åpner dem. Hver paragraf har egen adresse, og henvisninger i teksten går til paragrafen i appen.
  - Gruppene lover, forskrifter, lokale forskrifter og avtaler kan legges sammen.
- **Søket på forsiden** finner paragrafene på nummer («§ 11-1») og tittel, og bestemmelsene i avtalene.
- **Kilder** som viser til en paragraf hos Lovdata, har også «Les i appen».
- **Nye begreper:** lov, forskrift, lokal forskrift, paragraf og ledd, enkeltvedtak, tariffavtale og særavtale, garantilønn, stillingskode, lønnsansiennitet, konstituering, tidsressurspott, midlertidig ansettelse, oppsigelse og avskjed, klage på enkeltvedtak, habilitet, forhåndsvarsel, aktivitetsplikt, bortvisning og skoleregler.

## [0.21.1] – 2026-10-02

### Rettet

- **Søket på forsiden:** Teksten du skriver i søkefeltet er synlig igjen. Den var hvit på hvit bakgrunn.
- **«Åpne i nytt vindu»** i kalkulatorene vises nå også i smalere vinduer på PC og Mac (fra 640 punkter), for eksempel i installert app. Før måtte vinduet være minst 1024 punkter bredt.
- **Lærefag i Opplæringsløp:** Under felles programfag står bare lærefaget. Grunnleggende norsk, morsmål og norsk og samfunnskunnskap for voksne, som Grep knytter til mange lærefag, står nederst som «Alternativer for særskilte grupper», som på vg1 og vg2. Fordypningsområder i lærefaget står som «Fag til valg». «0 timer» står ikke lenger i overskriften.

### Endret

- **Opplæringsløp:** Tilbud i skole står før opplæring i bedrift, både i løpet for hvert utdanningsprogram og under «Fører videre til». Etter vg1 i yrkesfag står vg2 øverst.

## [0.21.0] – 2026-10-02

### Lagt til

- **Arbeidsplan:**
  - **Sammenlign to varianter side om side**, f.eks. med og uten kontaktlærer. Velg to lagrede varianter, eller én variant og det som er fylt ut nå. Sammenligningen står i full bredde under kalkulatoren.
    - Tabellen viser stillingen, undervisningen, funksjonene, beskjeftigelsen og om planen går over eller under stillingen. Den viser også arbeidstiden i timer for hver del og lønnen når den er regnet ut.
    - Variantene er merket 1 og 2, og enheten står i overskriften over tallene. Delene av arbeidstiden har samme farge som i diagrammet.
    - Det som er endret, er uthevet med en gul lapp og pil opp eller ned. «Vis bare det som er endret» skjuler resten.
    - Arbeidstiden viser de planfestede delene og «Planfestet tid i alt» først, og så selvdisponert tid og årsverket i alt. Da er det tydelig at selvdisponert tid ikke er en del av planfestet tid.
  - **Del en variant som lenke.** Lenken har det som er fylt ut og navnet på varianten. Den som åpner lenken, får Arbeidsplan ferdig utfylt og kan lagre den som egen variant. Ingenting sendes noe sted: alt står i lenken.

### Endret

- **Fordelingen av arbeidstiden i Arbeidsplan:** Tabellen viser de planfestede delene og «Planfestet tid i alt» først, og så selvdisponert tid og årsverket i alt, i samme rekkefølge som i diagrammet. Da er det tydelig at selvdisponert tid ikke er en del av planfestet tid.
- **Arbeidsplan har nytt ikon:** en stolpe delt i deler, med strek for stillingen, som diagrammet i Arbeidsplan.
- **Lagrede varianter:**
  - Hver variant står på to linjer: navnet med «Gi nytt navn» og «Slett» og resultatet øverst, og tidspunktet, «Hent» og «Del» og forskjellen fra nå under.
  - En slettet variant kan hentes tilbake: «Angre» står der varianten sto i noen sekunder.

## [0.20.1] – 2026-10-02

### Endret

- **Overordnet del:**
  - Hele overordnet del står nå i rubrikker på første side, under søket, med delene inni som nye bokser. Grunnleggende ferdigheter og tverrfaglige temaer står til slutt. Alt er lukket til du åpner det.
  - En lenke til en del åpner delen og ruller dit med overskriften synlig under toppfeltet.
  - Knappen «Til toppen» vises når du har rullet langt ned.
- **Fagarket:** «Grunnleggende ferdigheter og tverrfaglige temaer» står før kompetansemålene. Kompetansemål, vurdering, ferdigheter og temaer og «Inngår i tilbud» er lukket til du åpner dem.
- **Forsiden:** Boksene er like høye, og undertekstene er kortere. Arbeidsplan og «Flere kalkulatorer» er til sammen like høye som to bokser, fordelt 2/3 og 1/3. «Periodebeskjeftigelse» deles med bindestrek på smale skjermer.

## [0.20.0] – 2026-10-02

### Endret

- **Forsiden:** Overskriften «Læreplanverk og opplæringsløp» heter nå «Læreplanverket». Boksene følger læreplanverkets tre deler: Overordnet del, Opplæringsløp (fag- og timefordelingen) og Fag og læreplaner.

### Lagt til

- **Overordnet del:** ny del under «Læreplanverket».
  - Overordnet del på bokmål og nynorsk, i bokser som er lukket til du åpner dem, med delene inni som nye bokser.
  - Innholdsregister med lenke til hver del, og søk i hele teksten med utdrag rundt treffet.
  - De fem grunnleggende ferdighetene og de tre tverrfaglige temaene, med lenke til omtalen i overordnet del.
  - Søket på forsiden finner delene i overordnet del.
- **Fagarket:** «Grunnleggende ferdigheter og tverrfaglige temaer» viser hva læreplanen sier om hver ferdighet og hvert tema i faget, med lenke til overordnet del.
- **Begreper:** læreplanverket, fag- og timefordelingen, overordnet del, formålsparagrafen, kompetanse, grunnleggende ferdigheter og tverrfaglige temaer. Læreplanverket beskrives med sine tre deler: overordnet del, fag- og timefordelingen og læreplanene for fag.
- **Kildesjekk:** Udirs side om læreplanverket sjekkes hver uke. Endres setningen om de tre delene, står det i kontrollsaken.
- **Kildesjekk for fag- og timefordelingen:** Kontrollsaken sier nå også fra når Udir flytter rundskrivet til «tidligere rundskriv», eller når teksten øverst i rundskrivet eller datoen det sist ble endret, endres. Slik fanges et nytt rundskriv opp også om det får et annet navn eller en annen adresse.
- **Søket** finner overskriftene og kapittelnumrene i overordnet del, ferdighetene og temaene, og stikkord som «LK20», også på nynorsk.

## [0.19.1] – 2026-10-02

### Endret

- **Opplæringsløp:**
  - Oversikten åpner med gruppene lukket. Antallet står midt på linjen, og ingressen er kortere.
  - Knappen til neste trinn er bunnen av tilbudskortet: «Vis 7 tilbud på vg2».
  - Fagene i et tilbud står i rader med lik høyde og avstand. Valg står dempet på linjen med faget, for eksempel «Fremmedspråk · velg én av 101».
  - Vurderingskoder og alternativer for særskilte grupper står som dempede rader nederst i rubrikken.
  - Lister som åpnes, er innrykket. Gruppene har roligere overskrifter, og antallet står som «3 fag».

## [0.19.0] – 2026-10-02

### Endret

- **Opplæringsløp er lettere å få oversikt over:**
  - Løpet i et program viser vg1 først. Vg2 og vg3 åpnes med en knapp, og strekene i treet ender ved siste tilbud.
  - Tilbudet viser timene i alt med en stolpe som viser fordelingen. Fellesfag, felles programfag og programfag til valg har hver sin rubrikk med timene i overskriften.
  - Hvert fag står på én linje med lenken i navnet. Tverrfaglig eksamen og muntlige koder står nederst i rubrikken.
  - Alle rubrikker kan legges sammen, også «Videre», «For særskilte skoler» og «Andre programområder i programmet».
  - Lange lister med fag å velge blant har søk og står i grupper: programfag til valg etter programområde (f.eks. Realfag, Idrettsfag), og så etter læreplan.
  - «Tilpassede ordninger» viser fagene som ikke er med, som kommer til og som har andre timer.
  - Navnene fra rundskrivet står på nynorsk når du har valgt nynorsk.
  - Der rundskrivet og Grep ikke stemmer overens, står det en kort merknad.
- **Arbeidsplan:** «Funksjon 1» vises først når du trykker «Legg til funksjon».

### Lagt til

- **Opplæringsløp:**
  - Søk etter tilbud på oversikten.
  - Sti tilbake til programmet øverst på tilbudet.
  - «Regn ut i Arbeidsplan» legger fagene i tilbudet inn i en ny arbeidsplan.
- **Fagarket:** «Inngår i tilbud» viser hvordan faget inngår i hvert tilbud, med timene.

## [0.18.0] – 2026-10-02

### Lagt til

- **Opplæringsløp:** ny del under «Læreplanverk og opplæringsløp».
  - Alle utdanningsprogram, og løpet i hvert program fra vg1 til vg2 og vg3 eller lærefag.
  - Hvert tilbud viser fagene og timene etter Udirs fag- og timefordeling, valgfrie programfag og yrkesfaglig fordypning, hva det bygger på og fører videre til, påbygging og kryssløp.
  - Lenker til Vilbli viser skolene og lærebedriftene som har tilbudet, i fylket du har valgt.
  - Fagene lenker til fagarket, og programområdene på fagarket lenker til tilbudene.
  - Søket finner utdanningsprogram og tilbud.

## [0.17.0] – 2026-10-02

### Endret

- **Nytt navn:** Appen heter nå **Fuskelappen**.
  - Nytt ikon: en hvit lapp med brettet hjørne og gul hake.
  - Toppfeltet viser bare navnet, uten logo.
  - Ny adresse: https://larsarnenilssen.github.io/fuskelappen/. Legg appen til på hjemskjermen på nytt derfra. Innstillinger, favoritter og lagrede varianter følger med, og eksportfiler fra før kan importeres.
- **Forsiden:**
  - Det mørkeblå toppfeltet fortsetter ned rundt søket.
  - Lenken «Alle favoritter» er fjernet. Bruk favorittknappen i bunnmenyen.
  - Modulene har ikonet i en farget sirkel, og overskriftene er roligere.
  - Merknaden om nasjonalt innhold har et ikon, og valgt fylke og skole står som én kort linje.
  - Har du ingen favoritter ennå, står det i et lite kort med en stjerne.
- **Bunnmenyen:** Fanen du står på, har en gul markering bak ikonet.

## [0.16.1] – 2026-10-02

### Endret

- **Fagarket:** Når årsrammen varierer med program og trinn, står årsrammen for hvert program i en utvidelse av ruten «Årsramme». Den er lukket til du trykker på «Se alle».

### Rettet

- **Nye versjoner:** Appen ser etter en ny versjon også når du går tilbake til den, og hver time mens den er åpen, ikke bare når den starter. En installert app som har ligget i bakgrunnen, viser da «Ny versjon er klar». Har du lukket varselet, kommer det igjen neste gang du går tilbake til appen.

## [0.16.0] – 2026-10-02

### Endret

- **Nytt design for kalkulatorene:** Arbeidsplan, Beskjeftigelse, Vikar og Overtid har skjemaet i deler, f.eks. Stilling, Undervisning, Funksjoner, Tid på skolen og Lønn.
  - Hver del har kant og overskrift i fargen den har i diagrammet, og summen står i overskriften.
  - Delene kan legges sammen.
  - Fag og funksjoner er egne små kort med luft mellom. Fagene har fargen de har i stolpen for beskjeftigelse.
  - «Legg til funksjon» er en knapp som «Legg til fag».
- **Arbeidsplan:** Livsfasetiltaket står under Stilling, og «Regn ut lønn» står i overskriften på delen Lønn, ikke sammen med møtetid og planleggingsdager.
- **Mørk visning:** Kantene på kortene er tydeligere mot bakgrunnen.
- **Fagsøket:**
  - Hele overskriftsraden åpner og lukker en gruppe, ikke bare teksten.
  - Når du har rullet langt ned, kommer knappen «Til toppen» nede til høyre.

### Rettet

- **Stor skrift på smal skjerm:** Tekst og beløp går ikke lenger utenfor kortene. Etiketten står under bryteren når det er trangt, og beløpet får hele linjen.
- **Fagarket:** Det er like mye luft mellom «Privatister» og «Vurderingsordning i læreplanen» som mellom «Elever» og «Privatister».
- **Fagarket for yrkesfaglig fordypning:** Forklaringen viste HTML-kode (`<p>`). Nå står den som vanlig tekst i avsnitt, og det er luft før «Vurderingsordning».

## [0.15.0] – 2026-10-01

### Endret

- **Nytt design for fagarket:**
  - Fagkode, fagtype og trinn står som merker under tittelen.
  - Årstimetall og årsramme står som nøkkeltall med store tall, og «Regn ut i Arbeidsplan» er en knapp.
  - Hver del står i et eget kort med en kant i fargen til fagtypen. Fellesfag er blå, felles programfag grønn, valgfrie programfag lilla og yrkesfaglig fordypning gul.
  - Kompetansemålene har strek mellom hvert mål.
- **Fagsøket** bruker de samme fargene: hvert fag og hver gruppe har en kant i fargen til fagtypen.

### Rettet

- **Arbeidsplan:** Når du har valgt «Skriv inn årsramme selv», står «Søk i vedlegg 1» på samme sted, til høyre for etiketten, i stedet for under bryteren for fag merket *.

## [0.14.1] – 2026-10-01

### Endret

- **Fagsøket:**
  - «Vis også» er lukket til du åpner den, og viser hvor mange skjulte fag som passer søket.
  - Du kan ta bort «Vanlige fag», så søket bare viser f.eks. variantene.
  - Har flere fag samme navn, står tilbudet etter fagkoden, f.eks. «HEA2005 · Helsearbeiderfag».
- **Begreper:** «Utdanningsprogram» sier at påbygging er et tilbud innenfor yrkesfag. «Kryssløp» er skrevet om: kryssløp krever ikke yrkesfaglig opphenting, som er for elever som bytter fra vg1 studiespesialisering til et vg2 som ikke er et kryssløp (eiers svar på kontrollspørsmålene).

## [0.14.0] – 2026-10-01

### Lagt til

- **Årsramme på fagarket:** Der koblingen til vedlegg 1 kjenner årsrammen, står den på fagarket, med en merknad om at den bygger på appens tolkning av vedlegget. Avhenger den av program og trinn, står hver rad. «Regn ut i Arbeidsplan» åpner en ny, ulagret arbeidsplan med faget som fag 1.
- **Begreper om opplæringsløpet:** utdanningsprogram, programområde, vg1–vg3, fellesfag, felles programfag, programfag og valgfrie programfag, yrkesfaglig fordypning, lærefag og opplæring i bedrift, påbygging og kryssløp. Fagarket har «i» med lenke til begrepene.
- Fagarket for yrkesfaglig fordypning forklarer hvorfor faget ikke har egen læreplan, og hva timene kan brukes til, etter Udirs forskrift om yrkesfaglig fordypning.

### Endret

- **Fagarket:** Grunnopplysningene står øverst, så kompetansemålene, så vurderingen samlet på ett sted (også vurderingsordningen i læreplanen), og til slutt programområdene. Hver del kan lukkes. Fag som brukes i alle yrkesfaglige eller alle studieforberedende utdanningsprogram, viser det i stedet for en lang liste.
- **Mørk visning:** Diagrammene i kalkulatorene har dempede farger og hvit tekst i stolpene.
- **Forsiden:** Kalkulatorene i «Flere kalkulatorer» har en egen bakgrunn, så de skiller seg fra siden. Teksten om Arbeidsplan nevner periodebeskjeftigelse.

### Rettet

- Overskriftene for kompetansemål, underveisvurdering og standpunktvurdering viser ikke lenger «Kompetansemål og vurdering» to ganger eller et kolon uten noe etter.

## [0.13.0] – 2026-10-01

### Endret

- **Fagsøket viser de vanlige fagene** i tilbudene og yrkesfaglig fordypning. Under «Vis også» kan du slå på varianter for særskilte grupper (f.eks. samisk, tegnspråk, kort botid og morsmål), opplæring i bedrift og andre fagkoder. Antallet som er skjult, står ved valget. Søker du på en hel fagkode, vises faget alltid.
- **Treffene grupperes** etter fagtype når du filtrerer uten å skrive noe. Yrkesfaglig fordypning står først på yrkesfaglige program. Store grupper deles etter læreplan, f.eks. «Fremmedspråk (214)», og du åpner dem med et trykk.
- **Søket på forsiden** viser de vanlige fagene først.

### Rettet

- Fagsøket følger adressen når den endres mens siden er åpen, f.eks. fra en lenke til et søk.

## [0.12.0] – 2026-10-01

### Endret

- **Forsiden:** Under «Arbeidstid» står Arbeidsplan som egen boks, og Beskjeftigelse, Vikartimer og Overtid i boksen «Flere kalkulatorer», som du åpner med et trykk. Overskriften «Hurtigkalkulatorer» og mellomsiden for arbeidstid er tatt bort. Gamle lenker til arbeidstid går til forsiden.
- «Fag og vurdering» på forsiden heter nå **Læreplanverk og opplæringsløp**.

## [0.11.0] – 2026-10-01

### Endret

- **Arbeidsplan:** Et fag som er lagt til i flere grupper, står bare én gang under «Årsrammetimer i» og «Timer i hvert fag».
- **Begreper:**
  - «Variabel lønn» gjelder også timevikarer.
  - «Fag merket *» forklarer at større årsramme gir lavere beskjeftigelse per undervisningstime, med et eksempel.
  - «Annet elevrettet arbeid» forklares som i Arbeidsplan, med det KS-rapporten og Utdanningsforbundet sier om begrepet.
- **Forsiden:** Kortere tekst i knappene for fag og arbeidstid. «Fra Grep» er tatt bort fra knappen og fra vurderingsordningen på fagsiden. Grep står fortsatt som kilde.

### Lagt til (for eier)

- Arbeidsflyten **Sett versjonstag** setter versjonsmerket og publiserer når versjonsnummeret i `package.json` endres på main (avgjørelse 029).

### Rettet (for eier)

- Publiseringen fra **Sett versjonstag** prøvde å publisere «main» i stedet for den nye taggen. Den bruker nå taggen.

## [0.10.0] – 2026-10-01

### Lagt til

- **Fagsiden** viser fag som brukes sammen, for eksempel tverrfaglig eksamen og fagene den gjelder, og hvilke utgåtte fagkoder faget erstatter. Er læreplanen erstattet av en ny versjon, står det på siden.
- **Utgåtte fagkoder:** Søker du på en utgått kode, eller åpner den, ser du hvilken kode som gjelder nå.
- **Fagmerknader (FAM-koder) og vitnemålsmerknader (VMM-koder)** i begrepsbanken, hver i sitt oppslag med søk på kode og tekst. Kodene finnes også i søket på forsiden.
- Forklaringene av fagmerknader og vitnemålsmerknader bygger nå på Udirs skriv om føring av vitnemål og kompetansebevis: hva merknadene brukes til, at det er plass til én fagmerknad per fag, og hvilke merknader som bare gjelder vitnemål eller bare kompetansebevis.

### Lagt til (for eier)

- **Kilder ved kontrollspørsmålene:** Kontrolloversikten (`docs/KONTROLL.md`) og kontrollrundene viser under hvert kontrollspørsmål, hver praksis og hvert punkt som bør kontrolleres på nytt, hvilke kilder du kan sjekke mot, med lenke og punkt.
- Data fra VIGO Kodeverksbase hentes hver uke sammen med Grep. `docs/VIGO-KODEVERK.md` beskriver hva kodebasen inneholder og hva det kan brukes til senere.
- Tilbudsoversikten (`docs/TILBUDSSTRUKTUR.md`) har lenker til Vilbli for hvert tilbud: skolene og lærebedriftene, og fag- og timefordelingen. Kontrollrundene i mai og august har seks av lenkene til avkrysning, fordi Vilbli ikke kan sjekkes automatisk. Lenkene til lærefag og påbygging er rettet etter eiers kontroll.
- **Tilbudsstrukturen** i `docs/TILBUDSSTRUKTUR.md`: alle utdanningsprogram ordnet fra vg1 til vg2-retninger, vg3, lærefag og påbygging. For hvert tilbud vises fag, timer, fagkoder og årsramme, valgfrie plasser med antall fag, obligatorisk yrkesfaglig fordypning med anbefalt kode, alternativer for særskilte grupper, tilpassede ordninger, kryssløp og avvik mellom rundskrivet og Grep.
- **Fag- og timefordelingen** fra rundskrivet Udir-1 hentes hver uke, med én fil per skoleår. Endringer står i kontrollsaken. Når rundskrivet for neste skoleår kommer, sier kontrollsaken fra.
- Grep-hentingen tar med hva hvert programområde bygger på og timetallet på trinnet. Kontrollsaken viser nye og nedlagte programområder, endret «bygger på» og fag som bytter trinn.

### Rettet

- **Flere fag får årsramme fra fagkoden** i kalkulatorene (1208 fagkoder, før 748): fellesfag på kunst, design og arkitektur og medier og kommunikasjon, varianter av fellesfag (samisk, tegnspråk, grunnleggende norsk, styrket opplæring o.l.), valgfrie programfag på idrett, musikk, dans og drama, kunst, design og arkitektur, medier og kommunikasjon og naturbruk, fremmedspråk og flere andre valgfrie programfag på studiespesialisering (årsramme fra InSchool), kroppsøving vg3 på påbygging og yrkesfaglig opphenting. Etter eiers svar.
- Kalkulatorene mister ikke lenger et fagvalg eller et fag når to endringer kommer rett etter hverandre, for eksempel når du velger fag og skriver årstimer raskt.

### Endret (for eier)

- `docs/TILBUDSSTRUKTUR.md` viser hvert felles programfag med navn og timer, og vurderingskodene (muntlig, tverrfaglig eksamen) under faget.
- Studieforberedende vg3 i naturbruk viser norsk, matematikk, naturfag og historie med kodene fra påbygging.
- «Fag for studiekompetanse» (PBPBY4) står som vg4 påbygging med fagene fra tabell 27 i rundskrivet.
- Lærefagene i salg, service og reiseliv står under vg2 salg, service og reiseliv. Grep mangler «bygger på» for dem.
- Yrkessjåførkurs for voksne står som voksenopplæring, uten tabell fra rundskrivet og uten kroppsøving.
- Fag som går over flere trinn (f.eks. dans, drama og musikk) står i rekkefølgen fra VIGO, f.eks. Scenisk dans 1 → 2 → 3. VIGO-hentingen tar med hvilke fag som bygger på andre fag.
- Begrepene om fagmerknader og vitnemålsmerknader viser også til Udirs skriv om føring av vitnemål og kompetansebevis og til registreringshåndboken. Begge sjekkes hver uke.
- Registreringshåndboken (regbok.udir.no) er ny kilde for hva programområdekodene betyr, bl.a. PBPBY4. `docs/REGISTRERINGSHANDBOKEN.md` beskriver hva den kan brukes til senere.
- Dronefag har fellesfagene for vg2 yrkesfag. Grep kobler dem ikke til programområdet, så kodene hentes fra et annet vg2-tilbud i elektro og datateknologi.
- Felles programfag på landbruk, maritime fag, idrettsfag og musikk, dans og drama stemmer nå med rundskrivet. Landbruk bruker læreplanen for opplæring i skole. Maritime fag har valg mellom dekk og maskin. Fag som går over flere trinn, står for seg.

### Endret

- Latin 1 og Gresk 1 får nå bare årsrammen for Latin/Gresk (496), etter beskjed fra eier.
- Eier har kontrollert tabellen over programnavn i koblingen, også etter endringene for KD, ME og de utgåtte programnavnene.

## [0.9.0] – 2026-09-30

### Lagt til

- **Fag og læreplaner** (fase 2): søk på fagnavn og fagkode, og filter på utdanningsprogram, trinn, fagtype, vurderingsordning, eksamensform og årstimetall, for alle fagkoder i videregående i Grep.
- **Fagside** med fagkode, fagtype, trinn, utdanningsprogram, årstimetall og vurderingsordning for elever og privatister, og kompetansemål, underveisvurdering, standpunktvurdering og vurderingsordning fra læreplanen, med lenke til læreplanen på udir.no.
- Læreplanteksten vises på målformen læreplanen er fastsatt i (bokmål, nynorsk eller samisk), merket og uoversatt.
- Fag kan legges til som favoritter, og fagene er med i det samlede søket.
- **Fagvalg i kalkulatorene:** søk på fagkode eller fagnavn fra Udir. Valgt fag fyller inn årstimetallet og årsrammen fra koblingen, og det står om årsrammen er koblet direkte eller med regel. Gir faget ulik årsramme på ulike program eller trinn, velger du program og trinn.
- Du kan overstyre årstimer og årsramme. Det merkes, og du kan gå tilbake til tallene fra Udir og koblingen med én knapp.

### Lagt til (for eier)

- Grep-hentingen tar nå med alle fag og læreplaner i videregående hver uke. Endrede læreplaner og fag står i den ukentlige kontrollsaken.
- **Kobling fra fagkode til årsramme** i `rules/sfs2213/kobling-fagkode.yaml`: fellesfag eksplisitt per fagkode, utdanningsprogram og trinn, felles programfag med regler. Forslag som du kontrollerer.
- **Rapport over koblingen** i `docs/KOBLING.md`: avvik, tabellen over programnavn, et utvalg koblinger til kontroll og alle fag som ikke er koblet, med grunn. Nye avvik og nye ukoblede fag kommer i kontrollsaken.
- **Automatisk verdisjekk:** Hvert tall fra SFS 2213 og hovedtariffavtalen har et kort sitat fra kilden. Kildesjekken ser hver mandag etter sitatet i kilden og foreslår det nye tallet hvis det er endret.
- **Kontrolloversikt** i `docs/KONTROLL.md`: hva som bygger på hver kilde, status for din kontroll og for verdisjekken, og hva som bør ses på nå.
- Tester sjekker at tallene henger sammen, for eksempel at årsverket er 225 dager à 7,5 timer og at 45-minutters årsrammen er 60-minutters årsrammen × 4/3 i hver rad i vedlegg 1.
- **Ukentlig kontrollsak** på GitHub i stedet for én sak per kilde: hvilket punkt i kilden som er endret, med den nye teksten og hvilket innhold i appen det kan berøre, tall og tabeller som ikke stemmer, og en avkrysningsliste. E-post bare når noe er nytt.
- Vedlegg 1 (151 rader) og garantilønnen sjekkes rad for rad mot kilden hver uke.
- Grep og skoleregisteret hentes hver uke og publiseres automatisk når testene består.
- **Kontrollspørsmål** til hvert begrep og hver forklaring: spørsmål om det som er usikkert i teksten. Spørsmålene står i kontrolloversikten og i kontrollsaken når en kilde endres.
- **Praksis og tolkninger** som ikke står i kildene, for eksempel 21,67 arbeidsdager per måned, er samlet i én liste som du bekrefter.
- **Kontrollrunder** første mandag i mai og august: en sak med praksis som bør bekreftes og kontroller som bør gjøres på nytt.
- **Endringsforslag:** Er et tall endret i kilden, lager kildesjekken en PR med nytt tall og nytt sitat, og viser hvilke tester som eventuelt feiler. Feiler testene med nye Grep-data, kommer det også en PR med dataene.
- **Godkjenning med /godkjent:** Kryss av i kontrollsaken og skriv `/godkjent` i en kommentar, så legges datoen for kontroll, bekreftet praksis eller nytt fingeravtrykk inn automatisk. Du kan også skrive id-er etter `/godkjent`.

## [0.8.2] – 2026-09-30

### Endret

- «Ikke kontrollert»-merkene er erstattet av en samlet **brukserklæring** under «Om appen». Den sier at appen er utviklet privat og ikke gir garantier, hvordan utvikleren har brukt en KI-assistent, at appen bygger på kilder og er laget i god tro som et hjelpemiddel, og at innspill og beskjed om feil tas imot med takk.
- Nederst på forsiden står det at appen er utviklet privat og at opplysningene kan være uriktige. Den samme setningen følger med når du kopierer en utregning.

## [0.8.1] – 2026-09-30

### Endret

- Hjelpeteksten ved datoene og metodeteksten sier at offentlige fridager regnes som arbeidsdager i brutte måneder, slik Vestland fylkeskommune regner.

### Lagt til

- Begrepene «Variabel lønn» og «Planleggingsdager» i begrepsbanken.

### Rettet

- Søkesiden følger adressen: endres søket i adressen mens siden er åpen (lenke, tilbake-knappen eller adressefeltet), vises treffene for det nye søket.

## [0.8.0] – 2026-09-30

### Lagt til

- **Lønn i en periode regnes fra datoene**, slik lønnssystemet gjør når Visma InSchool sender lønnsprosenten og datoene for perioden. Arbeidsplan har fått feltene «Første dag i perioden» og «Siste dag i perioden». Hele måneder gir hel månedslønn, og i brutte måneder gir hver arbeidsdag (mandag–fredag) 1/21,67 av månedslønnen. Tillegg regnes på samme måte. Variabel lønn og overtid regnes fortsatt med timene i perioden.
- Fasiteksempel 024: variabel lønn og overtid i 80 % stilling, godkjent av eier.

### Endret

- Forklaringen av planleggingsdager sier at timene for lærere som er 60 år og eldre avhenger av hvor de fem ekstra feriedagene legges.

### Dokumentasjon

- README har fått en liste over kjente begrensninger. Første punkt: fordelingstabellen går utenfor skjermen ved skriftstørrelse på 150 % eller mer.

## [0.7.1] – 2026-09-30

### Endret

- **Planleggingsdager i Arbeidsplan:** De 6 dagene i arbeidsåret utenom elevenes skoleår står på egen linje i fordelingen, som i Visma InSchool: 6 × 7,5 = 45 timer for en lærer i hel stilling, tatt fra annen planfestet tid. Feltet «Timer på planleggingsdager» kan endres for den enkelte, for eksempel ved deltid eller for en periode.
- **Timer per uke** er nå planfestet tid utenom planleggingsdagene, delt på de 38 skoleukene (eller skoleukene i perioden). Hel stilling uten funksjoner gir 29,1 timer planfestet tid per uke (før 29,3). Grensen for utvidet arbeidsår er den samme som før.
- Fasiteksemplene 015–017, 018, 019 og 023 er oppdatert etter dette (annen planfestet tid, planleggingsdager og timer per uke).

### Rettet

- Teksten «Tillegg i lønnen» ble delt midt i ordene når skjermen var smal eller skriften stor. Nå flytter beløpsfeltet ned på neste linje når det ikke er plass.

## [0.7.0] – 2026-09-30

### Lagt til

- **Variabel lønn i Arbeidsplan:** Har læreren en stilling under 100 % og mer undervisning og funksjoner enn stillingen, heter det som er over stillingen og opp til hel stilling **variabel lønn**. Det som er over 100 %, er fortsatt teknisk overtid. Er det begge deler, vises de i hver sin rute, med årsrammetimer.
- **Lønn i året** har en egen linje for variabel lønn. Den regnes som vikartimer: prosenten gjøres om til timer i faget og videre til kalkulert tid, som betales med timelønnen for undervisning. Linjen viser den kalkulerte tiden. Overtid over 100 % betales som før, med 50 % tillegg. Stolpen for beskjeftigelsen viser variabel lønn og overtid i hver sin farge.
- **Arbeidsplan for en periode:** Bryteren «Hele skoleåret / En periode» gjør arbeidsplanen om til periodebeskjeftigelse. Fagene er timer i perioden, og stillingen og funksjonene gjelder perioden (en funksjon på 10 % er 10 % i perioden). Prosentene kan vises i perioden eller på årsbasis. Differansen, fordelingen og lønnen gjelder perioden.

### Endret

- **Funksjoner:** Knappen som fjerner en funksjon, står på linjen med navnet. Beløpet for tillegg står på linjen med vippen «Tillegg i lønnen», og feltet har plass til beløp på over 10 000 kr.

### Fjernet

- Kalkulatoren Periodebeskjeftigelse. Alt den gjorde, finnes i Arbeidsplan, og mer. Lagrede varianter fra den vises ikke lenger.

## [0.6.2] – 2026-09-30

### Endret

- **60 år og eldre:** De 37,5 timene årsverket er kortere med, er fem arbeidsdager ekstra ferie. Arbeidsåret er derfor 191 dager eller 38,2 uker, og timene per uke i Arbeidsplan regnes med det. Planfestet tid er samme andel av årsverket som for andre lærere, 1150 × 1650 ÷ 1687,5 = 1124,44 timer, så ferien tas like mye fra planfestet tid og tiden læreren disponerer selv. Utregningen viser begge deler.

### Lagt til

- Ni nye fasiteksempler godkjent av eier (015–023): fordeling i Arbeidsplan med og uten utvidet planfestet tid, deltid, stilling med bare funksjon, lønn med overtid og tillegg, lønn fra 60 år periode med uker regnet ut fra dagene og redusert undervisning fra 60 år.

## [0.6.1] – 2026-09-30

### Lagt til

- Begrepene «Livsfasetiltak (redusert undervisning)», «Kontaktlærer» og «Godtgjøring for funksjoner».

### Endret

- Arbeidsplan har adressen `#/arbeidstid/arbeidsplan` (tidligere `#/arbeidstid/stillingsplan`). Lagrede varianter fra den gamle adressen vises ikke.

## [0.6.0] – 2026-09-30

Arbeidsplan samler fordeling og planfestet tid, med redusert undervisning, funksjoner i årsrammetimer og utskrift.

### Lagt til

- **Redusert undervisning (livsfasetiltak, SFS 2213 punkt 6)** i Arbeidsplan: nyutdannet, 57 år eller 60 år, med den største reduksjonen fylt inn (6 %, 6 % og 12,5 %). Reduksjonen regnes som en del av stillingen og utvider ikke planfestet tid. 60 år gir årsverk på 1650 timer og høyere feriepengesats.
- **Funksjoner i årsrammetimer:** hver funksjon kan oppgis i prosent eller årsrammetimer. Heter funksjonen «Kontaktlærer», foreslås minst 28,5 årsrammetimer (punkt 7.3 b).
- **Skriv ut eller lagre som PDF** fra knappen ved tittelen i alle kalkulatorene. Utskriften viser utregningen og innholdet i lukkede kort, uten menyer og knapper, og alltid i lyst tema.
- **Fortsett i Arbeidsplan** fra Beskjeftigelse, med fagene ferdig utfylt.
- Figuren for en gjennomsnittlig uke og «Hva tiden brukes til» står i Arbeidsplan.
- Arbeidsplan er merket «Illustrasjon – ikke en arbeidsplan».
- Lokale verdier (fylke eller skole) merkes med nivå også i diagramkortet.

### Endret

- Kalkulatorene «Fordeling av arbeidstiden» og «Planfestet tid ved funksjoner» er fjernet. Alt de viste, finnes i Arbeidsplan.
- Kortene i Vikartimer og Overtid har overskrift og kan legges sammen, som i Arbeidsplan.
- Kronebeløp vises med mellomrom som tusenskille (600 000).
- Hjelpeteksten for antall uker nevner fag som bare går et halvår.

## [0.5.0] – 2026-09-30

Arbeidsplan med fordeling og årslønn, riktig uke ved utvidet arbeidsår, og større diagram.

### Lagt til

- **Arbeidsplan** (tidligere Stillingsplan) viser fordelingen av arbeidstiden i samme diagram og tabell som Fordeling. Diagrammet vises hele tiden, ut fra stillingsprosenten: en hel stilling uten fag og funksjoner gir 1150 timer annen planfestet tid og 537,5 timer tid læreren disponerer selv. Fag, funksjoner og møtetid per uke fyller stillingen etter hvert.
- Bryteren «Utvider planfestet tid» på hver funksjon i Arbeidsplan. Slås den av (f.eks. for kontaktlærer), fordeles funksjonen i diagrammet som undervisningen, og planfestet tid utvides ikke.
- Lagrede varianter kan få navn, f.eks. «Før endring». Navnefeltet åpnes når du lagrer, og blyanten ved navnet endrer det.
- «Regn ut lønn» i Arbeidsplan: velg garantilønn (stillingsgruppe og ansiennitet) eller skriv inn egen lønn, og se lønn i året med feriepenger i tillegg.
  - Bryteren «Tillegg i lønnen» ved hver funksjon fyller inn godtgjøringen i SFS 2213 punkt 9.1 (minst 12 000 kr for kontaktlærer og for rådgiver eller sosiallærer, etter navnet på funksjonen). Beløpet kan overskrives. En funksjon kan ha bare tillegg (0 %), bare avsatt tid eller begge deler.
  - Er samlet beskjeftigelse over 100 %, tas overtidsbetalingen med, regnet som i overtidskalkulatoren.
- «Vis stort» viser fordelingsdiagrammet og tabellen i fullskjerm, der nettleseren støtter det (PC, Mac og nettbrett).
- Kortene kan legges sammen og åpnes igjen med et trykk på overskriften (pil opp/ned): fagene, funksjoner, møter og lønn, resultatkortene og fordelingsdiagrammet. Et lukket kort viser en kort oppsummering, f.eks. faget, og resultatkort viser fortsatt svaret. Det huskes når du går til en annen side og tilbake.
- Periodebeskjeftigelse med økter per uke: antall uker i perioden regnes ut fra dagene (dager ÷ 5) når feltet står tomt, og kan overskrives. En advarsel minner om at ukene kan ha ulikt antall skoledager eller ulik timeplan.
- «Åpne i nytt vindu» ved tittelen på PC og Mac. Kalkulatoren åpnes i et eget vindu med det du har fylt ut, så flere kan være åpne samtidig.

### Endret

- Hovedkalkulatoren heter nå **Arbeidsplan**. Adressen, favoritter og lagrede varianter er de samme.
- Fordeling: blir planfestet tid mer enn 37,5 timer per uke i snitt, utvides arbeidsåret som i punkt 5.3, og timene per uke regnes med det utvidede året. En hel stilling med bare funksjon gir nå 37,5 timer per uke over 45 uker, ikke 43 timer over 39,2 uker.
- «Hva tiden brukes til» står under diagrammet og tabellen.
- Fordelingsdiagrammet er høyere og har større tekst, og står sammen med tabellen i et eget kort med mer luft. Tabellen viser fargen ved hver del og er fargeforklaringen, så den egne fargeforklaringen under stolpen er fjernet.

### Rettet

- Fordelingstabellen gikk utenfor skjermen på 320 px.
- Bryteren «Regn ut årslønn» og andre brytere uten «?» sto med teksten midt på linjen på bred skjerm.

## [0.4.0] – 2026-09-29

Programfag får årstimer, nye figurer og lagrede varianter.

### Lagt til

- Årstimer for programfag: søker du fram et bestemt fag med fagkode eller navn (f.eks. HEA2005 eller «Helsefremmende arbeid»), fylles årstimetallet inn fra Udir (Grep), og fagkoden vises ved faget. Det gjelder også programfag på yrkesfag.
- **Lagrede varianter** i alle kalkulatorene: lagre det du har fylt ut, sammenlign hovedresultatet med det du har nå, og hent varianten fram igjen. Opptil tre varianter per kalkulator lagres bare på enheten.
- Planfestet tid viser en gjennomsnittlig uke: planfestet tid og tid læreren disponerer selv, mot grensen på 37,5 timer planfestet tid i en uke, med snittet per dag og grensen på 9 timer for en enkelt dag.
- Timevikar og overtid viser lønnen og feriepengene i en stolpe.
- Periodebeskjeftigelse viser hva beskjeftigelsen i perioden tilsvarer for hele skoleåret.

### Endret

- På nettbrett og PC står resultatet i en egen kolonne ved siden av skjemaet.
- Planfestet tid starter med 0 % reduksjon, så grunnverdiene vises med en gang.

## [0.3.0] – 2026-09-29

Ny hovedkalkulator, stillingsplan, og årstimer som fylles inn fra faget.

### Lagt til

- **Stillingsplan** står øverst i arbeidstidsmodulen og først blant hurtigkalkulatorene. Du legger inn stillingsprosent, fag og funksjoner (i prosent av full stilling), og ser:
  - samlet beskjeftigelse, med undervisning, funksjoner og stilling hver for seg
  - teknisk undertid eller teknisk overtid i prosent, og regnet om til årsrammetimer i et fag du velger
  - en stolpe med fagene og funksjonene mot stillingsprosenten
  - «Timer i hvert fag»: hvor mange årsrammetimer som mangler eller er for mye, regnet med årsrammen i hvert fag
  - en lenke til overtidskalkulatoren med prosenten ferdig utfylt når samlet beskjeftigelse er over 100 %
- Fasiteksemplene E1–E4 for stillingsplanen, som eier har kontrollert (fasit 011–014).
- Begrepet «Teknisk undertid og teknisk overtid».
- Årstimer fylles inn når du velger fag i beskjeftigelse, periodebeskjeftigelse, fordeling og stillingsplan, f.eks. 56 i kroppsøving og 140 i engelsk vg1 studieforberedende. Tallet kommer fra Udir (Grep), og du kan endre det. Det gjelder 98 av radene i vedlegg 1, også norsk (112) og engelsk (140) på yrkesfag. Programfag på yrkesfag, samisk og noen forkortelser som ikke kan bekreftes, er ikke med.

### Endret

- Fordeling med stillingsprosent: feltet er nå hele stillingen, og undervisningen er stillingen minus funksjonene. Tidligere var feltet bare undervisningen.
- Oversikten over arbeidstidsmodulen viser stillingsplanen som et stort kort øverst og de andre kalkulatorene under «Flere kalkulatorer».

### Rettet

- Fordelingen virker nå for en stilling med bare funksjon, for eksempel 10 % stilling med 10 % funksjon. Møtetid som ikke får plass i den planfestede tiden for undervisningen, legges i funksjonstiden. Delene i diagrammet summerer seg alltid til årsverket for stillingen. Med bare funksjoner kan fordelingen også regnes ut uten fag.

## [0.2.2] – 2026-09-29

Kalkulatorene tar mindre plass og viser svaret hele tiden.

### Lagt til

- Når resultatkortet er utenfor skjermen, vises svaret i en smal linje over menyen nederst. Trykk på linjen for å gå til resultatet.
- «Kopier» på resultatkortet kopierer svaret, utregningen og kildene som tekst, f.eks. til en e-post.
- Overtid viser undervisningstimene i overtid, kalkulert tid (timene det betales for) og timelønnen. Et «?» forklarer hvorfor faget endrer antall undervisningstimer, men ikke beløpet.
- Små «?» som viser en kort forklaring når du trykker på dem: ved tittelen på hver kalkulator, ved fagsøket og ved «15 eller færre elever».
- Overtid viser feriepenger (12 %, eller 14,3 % over 60 år) som en ekstraopplysning under overtidsbetalingen.

### Endret

- Fagkortene er tettere: bryteren for årstimer eller økter og tallfeltet står på samme linje, og delresultatet står ved «Fag 1», «Fag 2» osv.
- «Skriv inn årsramme selv» står på samme linje som «Fag». Søkefeltet viser eksempler på hva du kan søke etter.
- Minuttvalget (45, 60, 90 eller annet) står på én linje.
- Mindre tittel på kalkulatorsidene. Ingressen ligger bak «?».
- «Ikke kontrollert» står ved siden av tittelen på resultatkortet.
- Fordelingen starter med 0 % funksjon.
- Timevikar: hovedtallet er nå lønnen som utbetales. Feriepengene står under som en ekstraopplysning, i stedet for å være lagt til i hovedtallet.
- Overtid og timevikar har like resultatkort: lønnen som utbetales øverst, deretter undervisningstimer, kalkulert tid, timelønn og feriepenger i tillegg. Utregningen ligger under «Vis utregning».
- Kronebeløp vises alltid med øre (1 748,80 kr).
- Stolpen for stillingen står i resultatkortet også for overtid og periodebeskjeftigelse. Det som går over 100 %, er markert i rødt.

### Rettet

- Feltene for dager i perioden og dager i skoleåret står nå på linje. Tomt felt for skoleåret viser 190 som grå tekst.

## [0.2.1] – 2026-09-29

Rettinger etter eiers førsteinntrykk av fase 1.

### Lagt til

- Fag velges med søk: fag, program, trinn, fagnavn og fagkoder fra Grep (f.eks. «Helsefremmende arbeid», HEA2005), bokstavene i fagkodene og programområdene (f.eks. ENG, BAT, HEA) og kallenavn (1P, R1, Biologi 2).
- Fordelingen kan regnes ut fra stillingsprosent og årsramme i stedet for fag, f.eks. en vanlig 100 %-stilling.
- Brytere for årstimer eller økter, 45, 60 eller 90 minutter, «15 eller færre elever», vikartype og lønn.
- Delresultat på hvert fag, og en stolpe som viser stillingen mot 100 %.
- Tidslinje for perioden i skoleåret, og måler for planfestet tid mot grensen på 37,5 timer i uka.
- Fordelingen viser prosent i stolpen og timer per uke i arbeidsåret i tabellen.
- Det utfylte står der fortsatt når du går til en kilde eller et begrep og tilbake.

### Endret

- Mindre skrift og tettere skjema, kortere tekster og tydelig skille mellom fagene.
- Flere program eller nivåer i samme time legges til med en liten lenke under faget.
- Utregningen er kortere: én linje per trinn, formelen i liten skrift og kildene samlet nederst. Siste trinn vises under resultatet.
- Metodebeskrivelsen står nederst på siden.

## [0.2.0] – 2026-09-29

Fase 1: arbeidstid etter SFS 2213. Alle regelverdier og tekster er merket «Ikke kontrollert» til eier har godkjent dem.

### Lagt til

- Modulen **Arbeidstid (SFS 2213)** med hurtigkalkulatorer på forsiden:
  - Beskjeftigelse for ett eller flere fag, med blandede grupper (laveste årsramme) og fag merket * med 1–15 elever.
  - Periodebeskjeftigelse for undervisning i en del av skoleåret.
  - Vikartimer: økt beskjeftigelse for ansatte i stilling, og lønn for timevikarer med kalkulert tid, timelønn og feriepenger.
  - Planfestet arbeidstid ved funksjoner og andre oppgaver, med utvidelse av arbeidsåret over 37,5 timer i uka.
  - Overtid ved beskjeftigelse over 100 %, betalt med 1,5 × timelønn for undervisning.
  - Fordeling av arbeidstiden i en tenkt stilling, med diagram, møtetid og forklaring av hva tiden brukes til.
- Hvert resultat viser utregningen trinn for trinn, med formel, tall, kilde og nivå for hver verdi, og en forklaring av metoden.
- Vedlegg 1 til SFS 2213 (årsrammer i videregående) og verdier fra SFS 2213 og hovedtariffavtalen 2026–2028 som regelsett.
- Begrepsbanken er tatt i bruk, med begreper om arbeidstid.
- Kildesjekk av avtaleteksten til SFS 2213, hovedtariffavtalen og arbeidsmiljøloven kapittel 10.

### Rettet

- Søket kunne få to oppføringer for samme begrep når begrepet finnes både nasjonalt og lokalt.

## [0.1.3] – 2026-09-29

### Rettet

- Appnavnet i toppfeltet så uklart ut på iPhone, fordi iOS legger en uskarp kant under statuslinjen. Innholdet i toppfeltet er flyttet litt ned når appen er installert på mobil.

## [0.1.2] – 2026-09-29

### Rettet

- Den grå overgangen bak klokken og batteriet øverst på iPhone. iOS henter fargen der fra sidens bakgrunnsfarge, og den er nå den samme mørkeblå som toppfeltet.
- Logoen i topplinjen viste en blå firkant i mørkt tema. Logoen er nå bare boka, uten bakgrunn.

## [0.1.1] – 2026-09-29

Rettinger etter eiers kontroll av fase 0 på iPhone.

### Lagt til

- Logo i topplinjen.
- Kildesiden viser når neste kildesjekk kjøres, og har lenke for eier til å kjøre sjekken med en gang.
- Et kildevarsel kan skjules på enheten til neste kildesjekk, og vises igjen med én knapp.
- «Om appen» har «Teknisk informasjon» med skjermmål, som hjelper med feilsøking.

### Rettet

- Bunnmenyen kunne stå et stykke over bunnen av skjermen på iPhone, med en stripe i sidefarge under. Området under menyen har nå menyfarge.
- Toppfeltet fikk en lys overgang bak statuslinjen på iPhone. Området bak statuslinjen har nå toppfeltets farge.
- Overskriften fikk oransje ramme når en side ble åpnet. Rammen vises nå bare for ting som kan trykkes på.

## [0.1.0] – 2026-09-29

### Lagt til

- Fase 0 – fundament:
  - Installerbar app (PWA) som virker uten nett etter første besøk, med varsel når en ny versjon er klar.
  - Forside med samlet søk, favoritter, hurtigkalkulatorer og innhold gruppert i kategorier.
  - Søk som forstår både bokmål og nynorsk («skule» finner «skole») og tåler skrivefeil.
  - Favoritter som kan sorteres.
  - Innstillinger for målform (bokmål og nynorsk), tema (lyst, mørkt eller følg systemet), fylke og skole. Skolelisten kommer fra Nasjonalt skoleregister.
  - Kopi av innstillinger og favoritter kan lastes ned og hentes inn igjen, og alt kan slettes.
  - «Om appen» med versjon, ansvarsfraskrivelse, personvern og kreditering.
  - Kildestatus i topplinjen og egen side med alle kilder.
  - Begrepsbank som felles modul (skjult til fase 1 gir den innhold).
  - Plassholderikon (protokollbok med paragraftegn).

[Unreleased]: https://github.com/larsarnenilssen/protokollen/compare/v0.15.0...HEAD
[0.15.0]: https://github.com/larsarnenilssen/protokollen/releases/tag/v0.15.0
[0.14.1]: https://github.com/larsarnenilssen/protokollen/releases/tag/v0.14.1
[0.14.0]: https://github.com/larsarnenilssen/protokollen/releases/tag/v0.14.0
[0.13.0]: https://github.com/larsarnenilssen/protokollen/releases/tag/v0.13.0
[0.12.0]: https://github.com/larsarnenilssen/protokollen/releases/tag/v0.12.0
[0.11.0]: https://github.com/larsarnenilssen/protokollen/releases/tag/v0.11.0
[0.10.0]: https://github.com/larsarnenilssen/protokollen/releases/tag/v0.10.0
[0.9.0]: https://github.com/larsarnenilssen/protokollen/releases/tag/v0.9.0
[0.8.2]: https://github.com/larsarnenilssen/protokollen/releases/tag/v0.8.2
[0.7.1]: https://github.com/larsarnenilssen/protokollen/releases/tag/v0.7.1
[0.7.0]: https://github.com/larsarnenilssen/protokollen/releases/tag/v0.7.0
[0.6.2]: https://github.com/larsarnenilssen/protokollen/releases/tag/v0.6.2
[0.5.0]: https://github.com/larsarnenilssen/protokollen/releases/tag/v0.5.0
[0.4.0]: https://github.com/larsarnenilssen/protokollen/releases/tag/v0.4.0
[0.3.0]: https://github.com/larsarnenilssen/protokollen/releases/tag/v0.3.0
[0.2.2]: https://github.com/larsarnenilssen/protokollen/releases/tag/v0.2.2
[0.2.1]: https://github.com/larsarnenilssen/protokollen/releases/tag/v0.2.1
[0.2.0]: https://github.com/larsarnenilssen/protokollen/releases/tag/v0.2.0
[0.1.3]: https://github.com/larsarnenilssen/protokollen/releases/tag/v0.1.3
[0.1.2]: https://github.com/larsarnenilssen/protokollen/releases/tag/v0.1.2
[0.1.1]: https://github.com/larsarnenilssen/protokollen/releases/tag/v0.1.1
[0.1.0]: https://github.com/larsarnenilssen/protokollen/releases/tag/v0.1.0
