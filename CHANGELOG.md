# Endringslogg

Alle endringer brukerne merker, føres her. Formatet følger [Keep a Changelog](https://keepachangelog.com/no/1.1.0/), og versjonene følger [SemVer](https://semver.org/lang/no/).

## [Unreleased]

### Endret

- **Legg til fag og Legg til funksjon** i Arbeidsplan og Beskjeftigelse lukker kortene som står fra før, så det nye kortet står åpent under dem.

## [1.0.3] – 2026-10-09

### Endret

- **Fag og funksjoner i Arbeidsplan og Beskjeftigelse:**
  - Søkefeltet for faget står øverst i kortet, der «Fag 1» sto, med prikken i fargen fra stolpen foran.
  - Når et fag er valgt, står kortnavnet i feltet. Å skrive i feltet søker på nytt.
  - Funksjonene har navnefeltet øverst, der «Funksjon 1» sto.
  - Lukkede kort viser kortnavnet, for eksempel «Matematikk R1 · 26,67 %».
  - Kortnavnet er navnet på faget, uten program og trinn, med høyst tre ord.
- **Stolpen over stillingen og utregningen** bruker kortnavnene i stedet for «Fag 1» og «Fag 2».
- **Litt mer luft** i fag- og funksjonskortene.

### Rettet

- Et lukket funksjonskort viste fortsatt feltene.

## [1.0.2] – 2026-10-09

### Endret

- **Søket over sidene** har ikke lenger knappen «Lukk søket». Esc, et trykk utenfor søket og tilbake lukker det.
- **Innstillinger:** Den gule knappen øverst fører tilbake til siden du kom fra, eller til forsiden hvis du kom rett til Innstillinger.
- **Innstillinger:** Kildestatusen er en rad, «Kildesjekken», med statusen under. Den står i listen nederst, mellom «Velkomst» og «Om appen».

## [1.0.1] – 2026-10-09

### Lagt til

- **Velkomst** (fase 10): en kort omvisning i et vindu over appen ved første besøk på forsiden, i ni trinn:
  - hva appen er, og hvorfor den heter Jukselappen
  - søket, forsiden og sidene
  - fylke og skole, og lokale regler
  - rolle med forslag til favoritter (lærer, kontaktlærer, rådgiver, skoleleder eller annen rolle)
  - dagens jukselapp, med bryteren
  - hjelp til å installere appen på iPhone og iPad, Android eller datamaskin
  - takk, med lenke til tilbakemelding
- Velkomsten kan åpnes igjen nederst på forsiden («Ny her? Se velkomsten») og i Innstillinger. Den har korte animasjoner, som står stille med redusert bevegelse.

### Endret

- **Overskriftene over verktøyene på oversiktene** står i entall når det er ett verktøy («Veiviser», «Kalkulator») og i flertall når det er flere.

### Rettet

- **Innstillinger, «Fylke og skole»:** Teksten under knappen «Fjern fylke og skole» står ikke lenger tett inntil knappen.

## [0.46.0] – 2026-10-08

### Lagt til

- **Lokale regler for fylket og skolen** (fase 9): Under Innstillinger → «Lokale regler» kan du legge inn en regel som gjelder hos dere.
  - Velg først hva endringen gjelder (Arbeidstid, Skoleregler, Fraværsgrensen, Eksamen eller Inntak), så hva du vil endre.
  - Et tall i kalkulatorene gjelder i stedet for det nasjonale:
    - planfestet tid
    - redusert undervisning for kontaktlærer, i prosent eller årsrammetimer
    - godtgjøring for kontaktlærer og rådgiver
    - undervisningsdagene i skoleåret
  - En regel på en side står i tillegg, i delen «Lokale regler for …» på siden for temaet.
  - Regelen gjelder med en gang for deg, lagres bare på enheten og er merket «Din egen · ikke kontrollert».
- **Meld inn en lokal regel:** «Lagre og meld inn» lager en e-post med regelen. Godkjent av eier blir den vist for alle som har valgt fylket eller skolen, uten at det trengs en ny versjon av appen, og din kopi byttes ut.
- **Feil eller endret?** Under en godkjent lokal regel, på siden og i kalkulatoren, kan du endre den for deg selv eller melde inn en endring.

## [0.45.0] – 2026-10-08

### Endret

- **Kalkulatorene har fått samme design som de nyeste delene av appen** (Arbeidsplan, Beskjeftigelse, Vikartimer, Overtid, Fraværsgrensen og Poengberegning):
  - Delene i skjemaet er hvite kort med tynn kant og titler i vanlig tekstfarge, uten de tykke fargede strekene. I Arbeidsplan har delene og fagene en liten prikk i fargen de har i diagrammet.
  - «Fag 1» står i kortet, i vanlig skrift.
  - Valgene er gule piller, og korte valg som 45, 60 og 90 er avrundede firkanter. Det samme gjelder valgene i Opplæringstilbud, Kalender og Elevundersøkelsen.
  - Av/på-bryterne er gule når de er på, som valgene, i hele appen.
  - Resultatet står i et kort fra start, også før noe er fylt inn, så kolonnen til høyre ikke står tom på skrivebord.
  - «Lagrede varianter» står i et kort, og forklaringene under kalkulatoren står samlet i én boks.
- **Fag og læreplaner har fått samme design:**
  - I fagsøket står fagtypene (Fellesfag, Felles programfag …) på en lys blå flate med en prikk i fargen til fagtypen, uten tykke fargede streker. Gruppene av fag, f.eks. «Engelsk (2)», har et ikon, så de skiller seg fra fagene.
  - På fagarket står årstimetallet og årsrammen med tallet først og stort. «Regn ut i Arbeidsplan» er en lenkelinje nederst i kortet.
  - Delene som kan lukkes («Kompetansemål og læreplan», «Vurderingsordning», «Inngår i tilbud» …) er kort med overskriften på en lys blå flate.
  - «Inngår i tilbud» viser tilbudene som rader med pil, ikke som en punktliste.
- **Kalkulatorene:** Overskriftene på delene i skjemaet og på kortene i resultatkolonnen står på en lys blå flate, som delene på fagarket.
- **Oversiktene i modulene** (Vurdering, Tilrettelegging, Eksamen og klage, Opplæringstilbud, Inntak og Aktivitetsplikt og skoleregler) står i to kolonner på skrivebord: sidene i modulen til venstre, og veiviserne, kalkulatorene, fristene og tallene til høyre, i den rekkefølgen og likt i alle modulene. I Inntak, Vurdering, Eksamen og klage og Aktivitetsplikt og skoleregler er veiviserne, kalkulatoren og kalenderen flyttet til høyre. Kalkulatorene har fått en stolpe som veiviserne, som viser hva du fyller inn og hva som regnes ut. Inngangene har ikonet i en lys blå sirkel og tittelen i vanlig tekstfarge, som modulene på forsiden, og delene har en strek over.
- **Veiviserne:** Steget og tittelen står på en lys flate i fargen til veiviseren. Svarene står som rader i én boks med pil, i stedet for tykke blå rammer. «Hos fylkeskommunen» har ikke lenger en tykk strek.
- **Forsiden:** Teksten om Arbeidsplan er kortere: «Utregning og illustrasjon av beskjeftigelse og arbeidstid.» Kalkulatorene under «Flere kalkulatorer» har korte tekster på én linje og er like høye som boksene under «Oppslag».
- **Begrepene** står i et hvitt kort med «I regelverket» og «Kilder» som lukkede rader nederst, og «Se også» er rader med pil. Søket i begrepene har forstørrelsesglass.
- **Kildene nederst på siden** i Lov og forskrift, Overordnet del og Opplæringstilbud står i en lukket boks, som på fagarket, i stedet for en punktliste.
- **Innstillinger og Om appen:** Delene i Innstillinger er kort med overskriften på en lys blå flate, som i kalkulatorene. På Om appen har brukserklæringen samme overskrift, og delene under har en strek over. Lenkene til Om appen og til kildene er rader med pil.
- **Fant ikke siden** har «Til forsiden» og «Søk i appen» som rader med ikon og pil.
- **Veiviserne:** Svarene brukeren har gitt, står med gul bakgrunn øverst i veien og i fasene til venstre, som det som er valgt ellers i appen. «Start på nytt» har fått et ikon, og knappene «Kopier oppsummeringen» og «Start på nytt» er like brede.
- **De siste tykke strekene til venstre er borte:** delene i «Et trygt og godt skolemiljø» har overskriften på en lys blå flate, «Om veien» i Lærlinger og kandidater er et kort med overskrift, og utfallet i fraværsgrensen står i en boks med tynn kant i statusfargen. Det samme gjelder fag nummer to i samme økt i Arbeidsplan, merknaden når årsrammen er skrevet inn selv, valget av vei og steget du står på i «Hele prosessen».
- **Videregående i tall:** Tallet står først og stort i flisene, med teksten under, som i resten av appen.
- **Kortene som kan lukkes** i Opplæringstilbud, Læreplanverket og Lov og forskrift har overskriften på en lys blå flate i stedet for en tykk strek. Fellesfag, felles programfag og yrkesfaglig fordypning i et tilbud har en prikk i samme farge som i stolpen over.

### Rettet

- **Videregående i tall:** Uten valgt fylke står det «i hele landet» med liten h inni titler og tekster, f.eks. «Lærerne i videregående i hele landet» i Arbeidsplan.
- **Arbeidsplan:** Teksten under fordelingen om delen av stillingen som fag og funksjoner ikke fyller, er tatt bort.
- **Videregående i tall:** Den stiplede streken for landet står rett gjennom alle radene i figurene med fylkene, f.eks. «Hva fylkeskommunen bruker per elev». Før flyttet den seg litt i rader med bredere tall, og stolpene ble litt for korte der.
- **Merker, piler og ikoner** ved tekst står midt i teksthøyden i hele appen, f.eks. pilen i «Mer i Videregående i tall» og merkene «SSB» og «Udir».

## [0.44.0] – 2026-10-08

### Lagt til

- **Videregående i tall med tall fra SSB:** tre temasider, Ungdom og søkere, Skolen og Læreplass og fullføring, med tallene fra Udir og SSB sammen. Hver temaside begynner med «Kort fortalt», tre tall med kilden.
  - Fra SSB:
    - 16–18-åringene nå og framover
    - unge utenfor arbeid og utdanning
    - grunnskolepoeng
    - hvem som går i videregående, også etter bakgrunn
    - lærerne
    - hva fylkeskommunen bruker per elev
  - Tallene hentes hver uke.
- **Tallene der de er nyttige:**
  - Inntak har søkerne og ungdomskullene i én boks.
  - Poengberegning har grunnskolepoengene i fylket.
  - Oppfølgingstjenesten har andelen unge utenfor arbeid og utdanning.
  - Arbeidsplan har lærerne i fylket.

- **Nye begreper:** Læreplan i fag, Kompetansemål, Fagkode, Årstimetall, Vurderingsordning, Sidemål, Egenmelding, Tilbudsstruktur, Instruktør, Rådgiving, Oppfølgingstjenesten og Elevråd. Ordene lenker til begrepene der de står i teksten.
- **Ny versjon:** Når appen har lastet ned en ny versjon, kommer en melding over appen med det som er nytt, og knappene «Oppdater nå» og «Senere». Den kommer bare for nye versjoner, ikke når nyhetene, tallene eller kildestatusen er oppdatert. Da tas oppdateringen i bruk neste gang du åpner appen.

### Endret

- **Stien øverst på sidene** står i en rolig, avrundet flate med piler mellom leddene, i hele appen.
- **Videregående i tall:** Oversikten har nøkkeltallene, tre temakort og fylkene side om side, som står åpen. Figurene står på temasidene.
- **Tallboksene** på de andre sidene har merkelappen «Videregående i tall» og står etter sidens eget innhold. På Lærlinger og kandidater og fylkessiden sto de øverst.
- **Kreditering:** SSB står under «Om» med lisensen CC BY 4.0, også for fylkeslisten.
- **Dagens jukselapp** er merket med det gule merket «Dagens jukselapp» når den står først på dagen, med «Tilbake til …» kalenderen, nyhetene eller tallene. Visningen du har valgt, blir ikke lenger byttet ut med jukselappen.
- **Ungdomsrett** forklarer at retten også kalles fullføringsretten, og «fullføringsretten» i teksten lenker dit.
- **Spesialundervisning** i teksten lenker til Individuell tilrettelegging, fordi Udir skriver at det gamle begrepet nå er delt i tre rettigheter. **PPT** lenker til PP-tjenesten.
- **Søket** finner veiviseren for inntak på «inntakskontor», «VIGO» og «Vilbli».
- **Nyhetene** hentes tre ganger om dagen (morgen, formiddag og ettermiddag), så de kommer også når GitHub hopper over den første hentingen.
- **Kildene:** Siden om kildene viser om hver kilde virker, er endret de siste 30 dagene eller ikke svarer. En kilde står som «svarer ikke» først når den har feilet to sjekker på rad, så korte feil hos kilden ikke vises.

### Rettet

- **Kildestatusen:** Statistikkbanken sto som «feilet» når tallene var uendret, og to kilder for Vestland pekte til den gamle adressen vlfk.no.
- **Lenkene til kildene:** Læreplanverket, Statsforvalteren og Udirs «Ord og omgrep» er flyttet hos kilden og har fått de nye adressene.

## [0.43.0] – 2026-10-08

### Lagt til

- **Dagens jukselapp:** ett faktum fra appen hver dag, som en fjerde visning i panelet øverst på forsiden, ved siden av kalenderen, nyhetene og tallene. Den er av fra start. Slå den på under «Tilpass» eller Innstillinger.
  - Faktaene kommer fra hele appen: begreper, regler og frister (med når fristen er), stegene i veiviserne, veiene til fag- og svennebrev, eksamen og fraværsgrensen, SFS 2213 og hovedtariffavtalen, paragrafer i opplæringslova og forskriften, overordnet del, årstimene og årsrammen i fagene, og tallene fra Videregående i tall: søkere, elever, læreplass, gjennomføring, fag- og svennebrev, fravær og snittkarakterer til eksamen. Elevundersøkelsen gir mobbing og læringsmiljøet for Vg1, og begrepene kodene for karakterer, orden og oppførsel. Fylkets innhold og tall kommer med når du har valgt fylke, og skolens elevtall, fravær, tilbud og resultater i Elevundersøkelsen når du har valgt skole.
  - Hvert faktum har en tittel og lenker til stedet i appen der det står, med kildene. Lenken har hele linjen nederst, og «Ny jukselapp» står øverst til høyre. Jukselappen er like høy som kalenderen.
  - Jukselappen byttes hver dag, og «Ny jukselapp» gir en ny med en gang.
  - Første gang du åpner appen en ny dag, står panelet på jukselappen. Velger du en annen visning, gjelder den resten av dagen.

### Endret

- **Elevundersøkelsen** er en egen del av appen under Skolemiljø på forsiden, med adressen `#/elevundersokelsen`. Gamle lenker og favoritter virker.
- **Skolemiljø** (aktivitetsplikten, skolereglene og kapittel 12) heter nå **Aktivitetsplikt og skoleregler**, så den ikke har samme navn som kategorien.

### Rettet

- **Lenker til fylkene:** Lenkene til særskilt språkopplæring i Buskerud, inntak og klage i Agder, inntak i Nordland og klage på standpunkt i Møre og Romsdal går til de nye sidene hos fylkene.
- **Kildene:** Lenkene til Grep, Nasjonalt skoleregister og SSBs fylkesinndeling går til sider som finnes.

## [0.42.0] – 2026-10-07

### Lagt til

- **Nyheter:** Det siste fra Udir, Kunnskapsdepartementet, HKdir, Statsforvalteren og fylkeskommunen i fylket ditt, Lovdata, forskning.no, NIFU, Utdanningsnytt, Utdanningsforbundet og Skolelederforbundet, valgt ut for videregående og hentet hver dag.
  - På forsiden er nyhetene en visning i panelet øverst, sammen med kalenderen og tallene. Filtrer på hvem eller kilde øverst. Trykk på en sak for å se ingressen og gå videre til kilden.
  - Nyhetssiden har sakene fra de siste 30 dagene per dag, med «Vis eldre» under og filter på hvem, fylke og kilde. Trykk på en sak for å se ingressen, og en gang til for å lese den hos kilden.
  - Organisasjonene er merket som interesseparter, og Utdanningsnytt som fagpresse utgitt av Utdanningsforbundet.

### Endret

- **Oppslag:** Kalender og Nyheter står ikke lenger under «Oppslag». De nås fra panelet øverst på forsiden (sidekolonnen på stor skjerm), fra søket og som favoritter, som Videregående i tall.
- **Forsiden:** Kalenderen, nyhetene og tallene i panelet har samme skrift, luft og lenke nederst. Kalenderen viser opptil fire datoer. Klikk hvor som helst i overskriften til høyre for valgene lukker og åpner panelet.
- **Raskere oppstart:** Bare tekstene på målformen du har valgt, lastes når appen åpnes. Den andre lastes når du bytter.

## [0.41.0] – 2026-10-07

### Lagt til

- **Videregående i tall** (ny side): søkere per utdanningsprogram, fylkene side om side, læreplass fylke for fylke og gjennom høsten, gjennomføring, fag- og svennebrev, fravær og eksamen. Velg fylke eller hele landet. Tallene kommer fra Udirs statistikkbank og hentes hver uke.
  - Delene kan lukkes og viser en kort oppsummering når de er lukket. På mobil er de lukket fra start, unntatt gjennomføring og fravær.
  - Tabellen over fylkene kan sorteres på alle kolonnene. På mobil velger du hvilken kolonne som vises.
- **Forsiden:** Kalenderen og tallene står i ett panel øverst, i sidekolonnen på stor skjerm. Du veksler mellom dem i overskriften når panelet er åpent, og under «Tilpass» velger du hvilke som er med. Er bare én med, står den alene. Med «Bare favoritter» står de som er favoritter, hver for seg. Tallene viser fire nøkkeltall, fylket blant fylkene på læreplass og skolen du har valgt. Uten valgt fylke viser de hele landet, med en lenke for å velge fylke. Videregående i tall står ikke lenger som boks under «Oppslag». (Nyhetene kommer i samme panel i fase 7b.)
- **Tallene der de hører hjemme:**
  - Fylkessiden: fire nøkkeltall og fylkets plass.
  - Inntak: søkerne.
  - Lærlinger og kandidater: læreplass og lærekontrakter.
  - Fraværsgrensen: median fravær, også for valgt skole.
  - Eksamen: snittkarakterer.
  - Skolekortet: elevtall og fravær, med knappene til nettsiden og skolens regler i samme ramme.
- **Nye begreper:** nulltoleranse og psykososialt skolemiljø.

### Endret

- **Skolenes egne regler fra Lovdata:** mobilregler for Slåtthaug videregående skole og Stend vidaregåande skule, skoleregler for Os vidaregåande skule, og oppdaterte skoleregler for Akershus.
- **Et trygt og godt skolemiljø:** Kortet om fysiske inngrep under «Henger sammen med» heter nå «Fysiske inngrep (kapittel 13)» og lenker til bortvisning og pålagt skolebytte under Skoleregler.

## [0.40.0] – 2026-10-06

### Lagt til

- **Skolemiljø** (ny del av appen):
  - **Veiviseren «Aktivitetsplikten»:** starter med hvem du er i saken. Den som arbeider på skolen, får følge med, gripe inn og melde fra, og skjerpet plikt når en ansatt krenker en elev. Rektor får undersøke, tiltak og tiltaksplan, dokumentere og følge opp. Eleven og foreldrene får ta saken opp med skolen og melde den til statsforvalteren. Hvert steg har ansvar, dokumentasjon, frist og paragrafene.
  - **Skoleregler:** reglene i loven om skoleregler, bortvisning og pålagt skolebytte. For valgt fylke kommer paragrafene om reaksjoner, saksbehandling og klage i fylkets skoleregler, og for valgt skole skolens egne regler når de står i Lovdata.
  - **Privatskoler:** egne merknader når «Privatskole» er valgt.
  - **Elevundersøkelsen:** mobbing og alle indeksene for skolen, fylket og landet, med fjoråret. Sammenlign opptil tre skoler, fylker eller landet, også offentlige og private skoler hver for seg, per trinn, som diagram eller tabell.
    - «Kort om» skolen (eller fylket): mobbing og de tre sterkeste og svakeste indeksene mot landet.
    - Overskriftene kan lukkes, og boksene om mobbing er lukket til du åpner dem.
    - Bedre og svakere enn året før er markert med grønn og rød pil.
    - På stor skjerm står mobbingen og læringsmiljøet side om side.
    - Skoler og fylker kan søkes fram når du velger hva som skal sammenlignes.
    - Tabellen har en ramme rundt det beste tallet i hver rad.
    - Nye tall fra Udir kommer med av seg selv, uten ny versjon av appen.
  - **Et trygt og godt skolemiljø:** opplæringslova kapittel 12 i fem deler som er lukket til du åpner dem: retten, skolens plikter, statsforvalteren, det fysiske miljøet og ansvaret, med de fem delpliktene og veien til statsforvalteren.
  - **Oversikten** har «Retten og resultatene» øverst, med kapittel 12 og Elevundersøkelsen.
- **Nye begreper:** trygt og godt skolemiljø, krenkende oppførsel, skjerpet aktivitetsplikt, tiltaksplan, håndhevingsordningen, tvangsmulkt, fysisk skolemiljø, fysiske inngrep, pålagt skolebytte, Elevundersøkelsen, kompetanseprøve og praksisbrevprøve. Begrepene om skolemiljøet har eget tema, «Skolemiljø».
- **Regler for mobil og ordensreglement** fra skolene og fylkene i Lovdata kommer med i Lov og forskrift og på siden «Skoleregler».
- **Privatskole:** En ny bryter under «Fylke og skole» i innstillingene. Velger du en privat skole, slås den på av seg selv. Når den er på:
  - kort og steg der privatskolene har egne regler, har en boks «For privatskoler»: inntaket, klage på karakter, individuell tilrettelegging, skoleregler og bortvisning
  - kildene og «I regelverket» viser paragrafen i forskriften til privatskolelova i stedet for den samme regelen i opplæringsforskrifta, f.eks. fraværsgrensen, eksamen og klage
  - privatskolelova og forskriften står først i Regelverk
- **Privatskolelova og forskriften til den** i Lov og forskrift, med kapitlene som gjelder videregående opplæring. Teksten kommer med neste henting fra Lovdata.
- **Begrepet «Privatskole».**

### Endret

- **Eksamen og klage** er en egen del av appen under «Elever og opplæring» på forsiden, med eksamen, fag- og svenneprøven, klage på karakter og kalenderen for eksamen, under overskriftene «Eksamen og prøver» og «Klage». Sidene stod før i Vurdering. Gamle lenker og favoritter virker fortsatt.
- **To kolonner på stor skjerm:** «Underveis- og sluttvurdering», «Eksamen», «Fag- og svenneprøven og de andre prøvene», fagarket, tilbudene i Opplæringstilbud og siden for hvert fylke står i to kolonner, som Mer opplæring og Lærlinger og kandidater. På mobil står alt som før.
- **Kildene på fagarket og tilbudene** står i en lukket boks («Kilder»), nederst i høyre kolonne på stor skjerm og nederst på siden på mobil.
- **Regelverk:** Gruppene på oversikten (lover, forskrifter, lokale forskrifter og avtaler) er lukket når du kommer til siden. Det du åpner, er fortsatt åpent når du går tilbake.
- **Mer opplæring:** Kortet om privatskoler har forskriften til privatskolelova (§§ 4-2 og 3-4) som kilde.

## [0.39.0] – 2026-10-06

### Lagt til

- **Mer opplæring** i Inntak: hvem som har rett til mer opplæring i fag som ikke er bestått, hva retten gir, privatskolene, fristen og vedtaket, fag- eller svenneprøven som ikke er bestått, de egne reglene for vurdering, voksne og elever med individuelt tilrettelagt opplæring. Overskriftene kan lukkes, og på stor skjerm står siden i to kolonner. Søk på «meropplæring» i ett ord finner også siden.
- **Begrepet «Mer opplæring»**, som teksten i appen lenker til.
- **Lenker til siden** fra Eksamen og prøvesiden i Vurdering, steget om IOP i Tilrettelegging og Kalenderen.
- **«Bytte vei» for lærlinger og kandidater:** nytt utgangspunkt «Fag- eller svenneprøven ikke bestått», med mer opplæring på Vg3, ny eller utsatt prøve, lengre eller ny lærekontrakt og lærekandidat.
- **Veiviseren «Rett, inntak og søknad»:** nytt spørsmål om søkeren har fag i videregående som ikke er bestått, med et nytt sluttsteg om mer opplæring.

### Endret

- **Sammenligningene** i «Underveis- og sluttvurdering» og «Sammenlign» for lærlinger og kandidater har regelverket og kildene nederst i samme boks som tabellen.
- **«Om veien»** for lærlinger og kandidater har ikke lenger tomrom på stor skjerm: feltene fyller bredden eller står to og to. Uten «Voksne» står «Melder opp» og «Dokumentasjon» under hverandre ved siden av fellesfagene.

## [0.38.3] – 2026-10-06

### Lagt til

- **Tilbake til samme sted:** Følger du en lenke under «I regelverket» eller «Kilder» og går tilbake, er kortene og radene du hadde åpne, fortsatt åpne, og siden står der du var. Det gjelder kortene i Vurdering, Lærlinger og kandidater og Kalenderen, forklaringene, veiviserne og fylkesboksen.

### Endret

- **Lærlinger og kandidater:** Regelverket og kildene står som lukkede rader nederst i kortene og boksene («I regelverket» og «Kilder»), som ellers i appen. Det gjelder veiene, «Om veien», merknaden om kompetansebevis, sammenligningen og overgangene. «Mer om …» står over radene.
- **Resten av appen:** Bestemmelsene i avtalene i Regelverk og forklaringene av delene i Arbeidsplan har kildene som en lukket rad, ikke en åpen liste. Kort med paragrafer i kildene viser også «I regelverket», f.eks. fraværsreglene og poengberegningen.

## [0.38.2] – 2026-10-06

### Endret

- **Lærlinger og kandidater, «Bytte vei»:**
  - Kortene står uten kilder, så fanen leses som «Veiene». Kildene står lukket under kortene, og på siden hver overgang går til.
  - Nye overganger: lærekandidat til elev i videregående skole, og lærling til Vg3 i skole når kontrakten er sagt opp eller hevet.

## [0.38.1] – 2026-10-06

### Endret

- **Løpene i Opplæringstilbud** viser alle løp som Grep, VIGO eller utdanning.no har. Et løp som bare én kilde har, er merket «Står bare i …». Når en kilde mangler et løp de andre har, står det «Står ikke i …». Realfag på den tyske skolen nås nå fra inngangen, og seks lærefag fører videre til Vg4 påbygging.
- **Forsiden:** Knappene er like høye, med plass til tittel og to linjer. Arbeidsplan og «Flere kalkulatorer» står sammen, og knappene under «Oppslag» er lavere. Sidekolonnen på stor skjerm har luft over seg når siden rulles.
- **Kalenderen:** Klokkeslettet står på linjen under tittelen og vises når kortet er åpent.
- **Søk på «kalender»** gir kalenderen og hvert tema i den, uten doble treff og uten de gamle fristlistene.
- **Oversiktssidene** i Lov og forskrift og Opplæringstilbud har ikke lenger kildeliste. Kildene står på sidene under.
- **Tekstene:** Ikke lenger komma foran siste «og» eller «eller» i oppramsinger.

## [0.38.0] – 2026-10-06

### Lagt til

- **Lærlinger og kandidater** i Opplæringstilbud: veiene til fag- og svennebrev, praksisbrev og kompetansebevis for lærling, lærekandidat, praksisbrevkandidat, praksiskandidat og kandidat for fagbrev på jobb.
  - **Veiene:** Velg mål og se veiene med stegene, hvem som melder opp, fellesfagene, voksne og kilder.
  - **Sammenlign:** to veier side om side.
  - **Bytte vei:** fra der du er, til veiene videre, med vilkår og kilde for hver overgang.
  - **Egen side for hver vei,** med prøven i Vurdering, «Om veien» (også når kontrakten sies opp eller heves), «Kommer fra» og «Veien videre».
  - **På stor skjerm** står siden i to kolonner.
- **«Veiene hit»** på siden om fag- og svenneprøven og de andre prøvene, med lenker tilbake til hver vei.

### Endret

- **Begrepene:**
  - «Påbygging» følger opplæringslova § 5-7: retten varer ut skoleåret som starter det året man fyller 24.
  - «Kontrakt om opplæring» forteller hva som skjer når kontrakten sies opp eller heves.
  - «Individuell tilrettelegging», «Individuelt tilrettelagt opplæring» og «Tilpasset opplæring» sier hva som gjelder for lærekandidater, lærlinger og praksisbrevkandidater.

## [0.37.0] – 2026-10-05

### Lagt til

- **Kalenderen** under «Oppslag»: fristene og datoene fra hele appen på én side, de neste tolv månedene eller et skoleår. Filter på tema (inntak, vurdering, eksamen, skolerute, regelverk) og hvem det gjelder (elever, privatister, lærlinger, voksne, fortrinnsrett). Passerte datoer er dempet, og en strek viser i dag. Trykk på en dato for å lese mer og gå videre til veivisere, begreper og sider. På stor skjerm står to eller tre deler av året side om side.
- **«Neste datoer» på forsiden:** de tre neste datoene fra kalenderen. På mobil står neste dato under overskriften til du åpner gruppen. Gruppen kan flyttes og slås av under «Tilpass».
- **Eksamensdatoer fra seks fylker til:** Østfold, Buskerud, Vestfold, Agder, Møre og Romsdal og Troms. Med et av dem valgt viser fristene når datoene for muntlig eksamen for privatister kommer, og søknadsfristen for tilrettelegging, der fylket har dem. Datoene teller også med når fylkene sammenlignes.

### Endret

- **Søket i toppfeltet** legger seg over siden, og siden står synlig bak. Trykk utenfor søket for å komme tilbake til siden.
- **Kalender for inntak og Kalender for eksamen** åpner kalenderen, ferdig filtrert. Lagrede favoritter og lenker til de gamle sidene virker fortsatt.
- **Svar, svarfrist og andre inntak** og klagen på inntak står i juli og august.
- **Inntaksdatoer fra Østfold, Buskerud, Rogaland og Møre og Romsdal** kommer med fra neste inntak. Sidene deres har ikke årstall, så datoene hentes fra januar til august.
- **Kalenderen i «Bare favoritter»:** Er kalenderen en favoritt, står «Neste datoer» øverst i favorittvisningen, i stedet for et kort for kalenderen.
- **Forsiden på skrivebord:** «Neste datoer» og favorittene står i en egen kolonne til høyre, med en lys flate i temafargen. Kolonnene er like brede: to på halv skjerm, tre på hel. Kolonnen står fast mens siden rulles, og ruller selv når den er lang, med en toning som viser at det er mer. En skyvebryter øverst i kolonnen slår den av, og da står bare en smal skinne igjen, med antall favoritter. I «Tilpass» har kolonnen en egen del. I smale vinduer står alt i én kolonne, som på mobil.
- **Kalenderen på stor skjerm** står i to eller tre deler side om side, ikke fire, så kortene har plass til lange ord.
- **Fra kalenderen til fylkessiden:** «Hos fylkeskommunen» er åpen når du kommer fra en dato i kalenderen.
- **Filterboksen i kalenderen** heter «Filtrer kalenderen». Når den er lukket, står valgene på en linje under. På stor skjerm står de tre filtrene like langt fra hverandre.
- **Tabeller i lokale forskrifter** (f.eks. skoleruta) viser linjeskiftene i cellene, så datoene og hendingene står på hver sin linje. Gjelder forskriftene etter neste henting fra Lovdata.

## [0.36.1] – 2026-10-05

### Lagt til

- **Tilbakemelding på e-post** under Innstillinger og i Om appen: «Skriv e-post» åpner e-postprogrammet med emne, versjonen og siden du kom fra. «Kopier adressen» kopierer adressen for deg som ikke bruker et e-postprogram. Lenken til GitHub i brukserklæringen er tatt bort.
- **Temafilter i begrepsbanken:** Begrepene kan filtreres på inntak og tilbud, læreplanverket, tilrettelegging, vurdering og eksamen, arbeidstid og regelverk, med antall på hvert tema. Temaene står i en boks som kan lukkes, og overskriften viser temaet du har valgt. Temaet og teksten i filteret står i adressen.
- **Varsel om ny adresse:** Når appen har flyttet til jukselappen.no, viser appen på den gamle adressen et varsel med lenke til den nye. Innstillingene og favorittene blir med.

### Endret

- **Fylkessiden:** Boksen «Hos fylkeskommunen» er lukket til du åpner den.

## [0.36.0] – 2026-10-05

### Lagt til

- **Fylkene** under «Oppslag» på forsiden: én side per fylke med lenker til fylkets egne sider om inntak, klage, eksamen, særskilt språkopplæring, tilrettelegging, privatister og fagprøver, de lokale forskriftene, skolene, opplæringskontorene og kalenderne. Med valgt fylke går inngangen rett til fylket. Skolenes egne regler står i en egen gruppe, med skolen din øverst.
- **Boksen «Hos fylkeskommunen»** i veiviserne for inntak, tilrettelegging, språkopplæring og klage: lenker til temaet hos fylket ditt. Uten valgt fylke velger du fylke i boksen. Boksen er lukket på mobil og åpen på større skjermer.
- **Lokale forskrifter for alle fylker og skoler** i Regelverk, hentet fra Lovdata: skoleregler for fylket og for den enkelte skole, regler for voksne, inntak, skolerute, skyss og fag- og timefordeling. Skolens egne regler merkes «Skolen din». Navnene følger målformen du har valgt.
- **Offentleglova, offentlegforskrifta, arkivlova og arkivforskrifta** i Regelverk: innsyn, journalføring, unntak og klage, og den nye arkivlova og arkivforskrifta fra 1.1.2026.
- **Søket i toppfeltet** åpnes over siden du står på, i stedet for på en egen side. «Lukk søket», Esc og tilbake (også sveip tilbake) viser siden igjen der du var. Tilbake fra et treff viser søket slik du forlot det.
- **Knappen med fylket ditt i søket:** Med valgt fylke viser søket bare skoler, opplæringskontor, lokale forskrifter og fylkessider i fylket. Trykk på knappen for å se alle fylkene. Lokale forskrifter og opplæringskontorene kan nå søkes fram fra søket.
- **Sti øverst på alle sider** under en modul, også kalkulatorene i Arbeidstid, kildeoversikten under Om appen og fagarket for utgåtte fagkoder.
- **Skolekortet** har knappene «Nettsiden» og «Skolens regler» øverst, og en strek før opplæringstilbudene.
- **Dato for ikrafttredelse** og siste endring på alle lover og forskrifter i Regelverk.
- **Tabeller** i lov- og forskriftsteksten.
- **27 nye begreper** i begrepsbanken: innsyn, partsinnsyn, taushetsplikt, organinternt dokument, journalføring, arkivplikt, bevaring og kassasjon, statsforvalteren, tilsyn, begrunnelse, veiledningsplikt, delegering, hjemmel, skolerute, skoleskyss, fleksibilitet i fag- og timefordelingen, ikrafttredelse og kunngjøring, oppmelding, sensur, annullering, hurtigklage, praksisbrev, lærekandidat, praksiskandidat, fagbrev på jobb, Vg3 i skole og formidling til læreplass.

### Endret

- **Eksamensdatoene** fra Udir og fylkene oppdateres nå hver uke, ikke bare i januar og august.
- **Vestland:** Skulereglane og inntaksforskrifta hentes nå på samme måte som de lokale forskriftene for de andre fylkene.

## [0.35.0] – 2026-10-04

### Lagt til

- **Eksamen** i Vurdering: blå bokser med antall eksamener på hvert trinn, en sti fra oppmelding til karakter med datoene for skoleåret, det som gjelder hele veien (sentralt og lokalt gitt eksamen, særskilt tilrettelegging, bortvisning og annullering), og utsatt, ny og særskilt eksamen samlet i én boks. Vestland: bortvisning og annullering etter skulereglane.
- **Veiviseren «Klage på karakter»** (bær): hva eleven kan klage på, begrunnelse og frist, hva skolen kan gjøre, og hva statsforvalteren, klagenemnda eller fylkestinget kan komme til. Halvårsvurdering gir svaret «Ingen klagerett».
- **Fag- og svenneprøven og de andre prøvene**, med samme oppsett som Eksamen: prøvene som blå bokser, en sti fra krav til resultat, og ny og utsatt prøve samlet i én boks. Siden lenker til Udir.
- **Kalender for eksamen**: oppmelding, trekk, eksamen, sensur og klage fra august til juli, med filter for elever, privatister og lærlinger. Datoene hentes fra Udir og fylkeskommunene hvert halvår. Fylkets egne datoer vises når fylket er valgt.
- **Nye begreper:** trekkfag, sentralt og lokalt gitt eksamen, tverrfaglig eksamen, utsatt, ny og særskilt eksamen, særskilt tilrettelegging av eksamen, fag- og svenneprøve, prøvenemnd, klagenemnd, og vitnemål og kompetansebevis.
- **Fagarket** lenker til Eksamen i boksen «Fravær og eksamen».

### Endret

- **Kalender for inntak:** Tidslinjen i Inntak heter nå «Kalender for inntak», og søket kaller tidslinjene kalender.
- **Oversikten i Vurdering** har fått delen «Eksamen og klage», med Eksamen og fag- og svenneprøven ved siden av hverandre, og veiviseren og kalenderen under.

## [0.34.0] – 2026-10-04

### Lagt til

- **Stjerne på alle sider:** Oversiktssidene i modulene, dokumentene og avtalene i Regelverk, og løpet, skoleregisteret, opplæringskontorene, utdanningsprogrammene og tilbudene i Opplæringsløp kan nå legges til i favorittene.
- **Diskré stjerne for det som ikke har egen side:** skolene i skoleregisteret, opplæringskontorene, paragrafene og avtalebestemmelsene i Regelverk og delene av overordnet del har en liten stjerne ved navnet. Favoritten åpner siden med skolen, kontoret, paragrafen eller delen.
- **Filtre i søket:** Når treffene er fra flere deler av appen, står filtre med antall under søkefeltet: sider, regelverk, fag, begreper og tilbud og skoler. Søket viser 50 treff om gangen, med «Vis flere».

### Endret

- **Nytt ikon:** hvit lapp med brettet hjørne og stor gul hake på mørkeblå bakgrunn, tydelig også i liten størrelse.
- **Nytt navn:** Appen heter nå **Jukselappen**, med ny adresse: https://larsarnenilssen.github.io/jukselappen/. Legg appen til på hjemskjermen på nytt derfra. Innstillinger, favoritter og lagrede varianter følger med, og eksportfiler fra før kan importeres.
- **Ikonene til favorittene** følger også ikonene på oversiktssidene i modulene, f.eks. skoleregisteret og opplæringskontorene i Opplæringsløp.

### Fjernet

- **«Tilbake til …» under knappene i veiviserne.** Veien hit lenker allerede til hvert valg.

## [0.33.0] – 2026-10-04

### Lagt til

- **Fraværsgrensen** i Vurdering: velg faget (søk på navn eller kode) eller skriv inn årstimetallet, og velg hvor lange øktene er. Svaret er grensen i klokketimer og økter ved 10 og 15 prosent, med utregningen linje for linje og kilde på hver linje.
  - **Sjekk fraværet** (valgfritt): udokumentert fravær, helsefravær og fravær dokumentert med andre grunner, og en stolpe med merker ved 10 og 15 prosent, med utfallet i tekst. Både fraværet som teller og alt fraværet står i økter og prosent. Helsefraværet deles i før og etter grensen bare når brukeren krysser av for det. Grunnene for dokumentert fravær kan åpnes under feltet. Er eleven over 15 prosent, står fagmerknaden med kode.
  - Under står reglene, lukket til de åpnes: fravær som teller, dokumentert fravær som ikke teller, det som ikke er fravær, rektors skjønn, årstimetallet og øktene, hvem grensen gjelder for, og forskjellen mot fraværet på vitnemålet.
- **Fagarket** har boksen «Fravær og eksamen» ved siden av elever og privatister: fraværsgrensen i faget, om eksamen er sentralt eller lokalt gitt, og fagmerknadene som hører til faget, med lenkene til kalkulatoren og til underveis- og sluttvurdering i faget. Er Grep og VIGO uenige om årstimetallet eller eksamen, står det i boksen.
- **Veiviseren «Grunnlag for vurdering»** lenker fra steget om fravær til kalkulatoren. Kalkulatoren lenker tilbake fra kortet «Varsel, vedtak og karakter», under utregningen på mobil og nederst i venstre spalte på stor skjerm.
- **Søkefeltet** har et kryss som tømmer søket.
- **Øktlengden huskes:** Kalkulatorene husker øktlengden brukeren sist valgte (Fraværsgrensen, Vikartimer, Beskjeftigelse og Arbeidsplan). Den lagres på enheten.

### Endret

- **Søketreffene** sier hva treffet er i appen: veiviser, kalkulator, tidslinje eller side i stedet for «funksjon», og fagmerknad, vitnemålsmerknad, status på søkerønske eller karakter/statuskode i stedet for «begrep» for kodene i oppslagene.
- **Vurdering på forsiden** skriver underveis- og sluttvurdering helt ut.
- **Forsiden på stor skjerm** har gruppene i rader med to og to, så overskriftene i hver rad står i samme høyde. Gruppene leses rad for rad i rekkefølgen fra «Tilpass».
- **Fagarket:** «i» for trinnet står inni merket, som for fagtypen, og «Læreplan i …» er tatt bort over kompetansemålene. At årsrammen bygger på appens tolkning av vedlegg 1, står nå i en gul merknad på begrepet Årsramme, og «Regn ut i Arbeidsplan» er en knapp på linje med «Årsramme» (bare ikonet på mobil), så nøkkeltallene tar mindre plass.

## [0.32.0] – 2026-10-04

### Endret

- **Toppfeltet erstatter bunnmenyen:** tilbake, «Fuskelappen» (til forsiden), søk og innstillinger står øverst. Kildestatusen står under Innstillinger.
- **Forsiden kan tilpasses:** gruppene lukkes og åpnes med overskriften, og lukkede grupper viser hva som er inni. «Tilpass» endrer rekkefølgen på gruppene, med dra og slipp eller piler. Valgene lagres på enheten.
- **Favorittene** står øverst på forsiden, med ikonet sitt og et lite stjernemerke, og sorteres der de står med blyanten i overskriften. «Bare favoritter» viser favorittene under kategoriene sine. Favorittsiden er tatt bort, og gamle lenker går til forsiden.
- **Søket** blir en knapp i toppfeltet når søkefeltet på forsiden er rullet bort. På søkesiden står markøren i søkefeltet med en gang.
- **«Til toppen»** kommer på alle sider som er lange nok.
- **Fylkesmerknaden** på forsiden er én linje, og forsiden har to spalter på stor skjerm.

## [0.31.0] – 2026-10-04

### Lagt til

- **Vurdering** under «Elever og opplæring», etter opplæringsforskrifta kapittel 9, Udirs merknader og rundskrivet om fraværsgrensen:
  - **Underveis- og sluttvurdering:** skoleåret som én stripe (underveis, halvår, eksamen og standpunkt), søk etter et fag for å se hva læreplanen sier om underveis- og standpunktvurdering i faget, forskjellen mellom underveis- og sluttvurdering side om side, og hvordan kompetansemålene vurderes, som en sti av kort som kan åpnes.
  - **Grunnlag for vurdering:** veiviser i ravfarge, steg for steg gjennom læreplanen eleven følger (også individuell opplæringsplan, innføringsopplæring og læreplaner uten karakter), fritak i sidemål, fremmedspråk og kroppsøving, fravær og rektors skjønn, grunnlaget for karakter, og vedtak om IV. Varselet kommer rett etter fraværet eller grunnlaget, med eget steg for varsel om fravær og varsel om manglende grunnlag, og et steg for karakter uten varsel. Lærlinger, lærekandidater og praksisbrevkandidater har egen gren.
  - **Orden og oppførsel** for seg: skolereglene, karakterene, varsel, standpunkt og klage, og skulereglane i Vestland når Vestland er valgt.
- **Begreper:** underveisvurdering, halvårsvurdering, sluttvurdering, standpunktkarakter, ikke vurderingsgrunnlag (IV), fraværsgrensen, fritak fra vurdering med karakter og orden og oppførsel.
- **Karakterer og vurderingsuttrykk:** oppslag i begrepsbanken med kodene fra Udirs registreringshåndbok i tre grupper (karakterer og vurderingsuttrykk, orden og oppførsel, karakterstatus), med søk. Hver kode finnes også i det samlede søket.
- **Lenker begge veier** mellom veiviserne i Tilrettelegging (individuell opplæringsplan, fritak i sidemålet, innføringsopplæring og læreplanene i særskilt språkopplæring) og veiviseren «Grunnlag for vurdering».
- **Fagarket** lenker til underveis- og sluttvurdering med faget valgt.

### Endret

- **Forsiden:** Ny overskrift «Inntak og opplæringstilbud» med Inntak og Opplæringstilbud. Læreplanverket har nå Overordnet del og Fag og læreplaner. Inntak har fått et eget ikon.
- **Regelverk og kilder** står som lukkede rader nederst i alle kort og bokser som har dem: i veiviserne, fristene i Inntak, reglene for poengberegningen, «Slik regnes det ut» i Arbeidstid og kortene i Vurdering.
- **Stien tilbake** står nå øverst også i veiviserne, i lover, forskrifter og avtaler og på fagarket.
- **Overordnet del** kan legges til som favoritt.
- **Forsiden** følger elevens vei gjennom videregående: Inntak og opplæringstilbud, Læreplanverket, Elever og opplæring og Skolemiljø, deretter Arbeidstid og til slutt Oppslag.

### Fikset

- **Favoritter:** «Søknad og frister gjennom året» sto som «ikke lenger tilgjengelig» når den var lagt til som favoritt. En ny test sjekker at alle stjerneknappene i appen har en favoritt som finnes.
- **Kildesjekken** fant ikke innholdet i oversikten over registreringshåndboken.

## [0.30.0] – 2026-10-03

### Lagt til

- **Opplæringstilbud:** Modulen Opplæringsløp heter nå Opplæringstilbud. Landingssiden har to likestilte deler med kort: «Utdanningsprogram og løp» (Opplæringsløp) og «Skoler og opplæringskontorer», med antall i fylket ditt. Søket finner både tilbud og skoler.
- **Opplæringsløp** er en egen side under Opplæringstilbud, med «Min skole» / «Alle» og utdanningsprogrammene.
- **Min skole.** Har du valgt skole under Innstillinger, viser Opplæringsløp først utdanningsprogrammene og løpene ved skolen. Bryteren «Min skole» / «Alle» bytter visning, og valget huskes. Tilbudene ved skolen har egen farge og merket «✓ Din skole», og knappen til neste trinn sier hvor mange av tilbudene videre som er ved skolen. Uten valgt skole står en merknad om å velge skole.
- **Skoler og tilbud.** Et søkbart oppslag over skolene i videregående og tilbudene de har, etter utdanning.no, med filter for fylke og utdanningsprogram og søk på tilbud («Finn skolene som har et tilbud»). Hvert tilbud lenker til skolene som har det, i fylket du har valgt og i hele landet.
  - Hver skole er et eget kort. En åpen skole har egen flate, og navnet blir stående øverst mens tilbudene rulles forbi.
  - Tilbudene ved skolen står per utdanningsprogram som løp, med Vg2 under Vg1 og Vg3 under Vg2.
  - Har du søkt på et tilbud, viser skolen bare løpet til det tilbudet, og tilbudet er merket. Har du valgt et utdanningsprogram, viser skolen bare det programmet. «Vis alle tilbudene ved skolen» gir resten.
- **Opplæringskontorer.** Oppslag over opplæringskontorene som er godkjent i fylket, fra registeret til Udir (NOR), med søk, lenke til nettsiden og til kontoret på utdanning.no, og fylkene kontoret er godkjent i. Oppslaget viser fylket du har valgt, og kan utvides til hele landet med ett trykk. Lærefagene lenker dit.
- **Yrker.** Lærefagene viser yrkene utdanning.no knytter til faget, med lenker.
- **Lenke til utdanning.no** fra hvert tilbud utdanning.no har en side for.
- **Løp kildene ikke er enige om, er merket.** Står et løp i Grep, men ikke i VIGO eller på utdanning.no (eller omvendt), står det ved løpet, med en forklaring.
- **Seks nye begreper:** opplæringskontor, lærebedrift, lærling, kontrakt om opplæring, generell studiekompetanse og yrkesfaglig opphenting.
- **Søk: Skolene kan søkes** fra forsiden og søkesiden.
- **Fag: Faget på NDLA.** Fagarket lenker til faget på NDLA når NDLA har det.

### Rettet

- **Matematikk på Vg2 studieforberedende:** Eleven velger 2P, R1 eller S1 (Udir-1, punkt 3.3.1.4). Tilbudene viste bare 2P. Nå står de tre som «velg én», med en merknad om at R1 og S1 er programfag og krever et ekstra programfag.
- **Matematikk på Vg1 yrkesfag:** En merknad sier at eleven kan velge det studieforberedende tilbudet (1P eller 1T) i stedet, med et annet timetall (Udir-1, punkt 3.5).
- **Regn ut i Arbeidsplan:** Fag der eleven velger mellom flere (f.eks. 1P eller 1T, 2P, R1 eller S1, et fremmedspråk, eller dekk eller maskin), ble ikke tatt med. Nå legges det første valget inn, på alle trinn.

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
