# Designprinsipper

Dagens standard for hele appen (fase 8b, eier 08.10.2026). Den bygger på de nyeste delene: sidekolonnen på forsiden, Kalender, Nyheter og Videregående i tall. Nye sider følger reglene her, og eldre sider løftes til dem i fase 8b.

Godkjent av eier 08.10.2026 etter en skisse i testversjonen, som ble fjernet i oppryddingen (svarene står i `docs/arbeidsordrer/fase-8b-forslag.md`).

Reglene i AGENTS.md under «Grensesnitt» gjelder fortsatt. Denne filen sier hvordan det skal se ut.

## Grunnregler

- **Rolig og flatt.** Papirbakgrunn, hvite kort med tynn kant og myke flater i temafargen. Ingen skygger i innholdet.
- **Farge bare når den betyr noe.** Tekst og titler står i tekstfarge. Blått er lenker og det brukeren kan trykke på. Gult er det som er valgt. Seriefargene er tall og diagrammer.
- **Ingen nye farger.** Alle farger er tokenene i `tokens.css` og `tema.css`.
- **Samme mønster for det samme.** Finnes det et mønster under, brukes det i stedet for en ny variant.
- **Lesbar tekst.** Brødteksten er 16 px (`--str-m`). Dempede linjer er 14 px (`--str-s`), og datoer, merker og merkelapper minst 13 px (`--str-xs`). Overskriftene er `--str-l` (18 px), `--str-xl` (21 px) og `--str-xxl` (26 px). Alle størrelser er tokenene i `tokens.css` (avgjørelse 100).

## Kort

Et kort samler én ting: et skjema, en oppføring eller en forklaring.

- Hvit flate (`--farge-flate`), tynn kant (`--strek` i `--farge-kant`) og avrundede hjørner (`--radius-m`).
- Luft inni: `--rom-3` over og under, `--rom-4` på sidene (`--rom-3` på smal skjerm).
- Rader i et kort skilles med en tynn strek (`--farge-linje`), ikke med egne kort.
- **Lenker i en liste** er rader med tittel, en dempet linje under og pil til høyre (`listelenke`), ikke punktlister med understrekede lenker (eier 08.10.2026).
- **En gruppe i en liste** (f.eks. «Engelsk (2)» i fagsøket) har ikonet i en myk sirkel, så den skiller seg fra radene for hvert element, som ikke har ikon. Gruppene øverst (fagtypene) står på en myk flate i temafargen.
- **En lenke videre fra et kort** (f.eks. «Regn ut i Arbeidsplan») er en blå lenkelinje nederst i kortet (`panel-videre`), som «Hele kalenderen» på forsiden.
- Et kort som er en lenke (`frist-inngang`, `Inngang`), har ikonet i en myk sirkel til venstre, tittelen i tekstfarge, teksten dempet under og pilen til høyre, som modulene på forsiden.
- **Verktøyene på oversiktene har et lite bilde av hva de gjør** (eier 08.10.2026):
  - En veiviser (`Veiviserinnganger`) har fasestolpen i fargen til veiviseren, med fasene under.
  - En kalkulator (`Kalkulatorinngang`) har en stolpe med delene brukeren fyller inn, i grått, og det som regnes ut, i merkefargen. Navnene er overskriftene i skjemaet og på resultatkortet.
  - Bildet står bare på oversiktene i modulene, der det har navn og sier hva verktøyet gjør. Boksene på forsiden har bare ikonet (eier 08.10.2026). Uten navn ble bildet der pynt, og to av ti bokser skilte seg ut uten grunn.
  - Kalenderen og fristene viser den neste datoen i stedet for et bilde.
  - Sidene med tekst (`Inngang`) har bare ikonet. Et bilde på dem ville vært pynt og ikke sagt noe om innholdet.
- **Ingen tykke streker til venstre.** En farge som betyr noe, f.eks. delen i diagrammet i Arbeidsplan, vises som en liten rund prikk foran tittelen, som i forklaringene til diagrammene. Der fargen ikke står i et diagram på siden, er det ingen prikk. Fagtypen står i farge som tekst («Fellesfag») og i merket på fagarket, ikke som strek.

- **En oppføring med egen side** (f.eks. et begrep) står i et hvitt kort med regelverket og kildene som lukkede rader nederst (`Kortfot`). Lenker videre («Se også») er rader med pil under kortet.

*Eksempler:* modulene på forsiden, kalenderen og nyhetene i Aktuelt, figurene i Videregående i tall, begrepene.

## Flater

- **Bakgrunnen** (`--farge-bakgrunn`) er siden selv. Overskrifter, ingress og løpende tekst står rett på den.
- **Hvit flate** (`--farge-flate`) er kort og bokser med sidens eget innhold.
- **Myk flate i temafargen** (`--farge-flate-2` og blandingene `--farge-sidekolonne` og `--farge-itall-flate`) er det som står rundt eller oppsummerer: sidekolonnen og Aktuelt på forsiden, «Kort fortalt», temakortene, lenkelinjen nederst i en boks («Hele kalenderen») og tallboksene.
- En boks inni en boks unngås. Trengs det, er den indre en myk flate uten kant.
- **Strek til venstre** (4 px) brukes bare der den sier at innholdet kommer fra et annet sted eller oppsummerer siden: tallboksene fra Videregående i tall, «Kort fortalt» og sitert lov- og forskriftstekst. Andre steder blir den stoppet av `tests/unit/designregler.test.ts`, som har listen over de tillatte.

*Eksempler:* sidekolonnen på forsiden, «Kort fortalt» på temasidene, tallboksene.

## Overskrifter og merkelapper

- **Sidetittel** (`h1`) med stjernen til høyre (`Sidetopp`) og stien over (`Brodsmuler`).
- **Delene på en side** (`h2`) er fete, i tekstfarge og normal størrelse, med en tynn strek over (`Seksjon`). Ikke farget, ikke store bokstaver.
- **Titler i kort** er fete og i tekstfarge. Teksten under er dempet og mindre.
- **Merkelapp** over en tittel: liten, store bokstaver, litt sperret, i merkefargen (`st-boks-merke`). Den sier hvilken type boks det er, f.eks. «Videregående i tall», «Kort fortalt» eller «Dagens jukselapp». Den står aldri alene som overskrift. Unntak: «Aktuelt» på forsiden, der merkelappen er overskriften på gruppen, med menyen og pilen ved siden av (eier 09.10.2026, avgjørelse 102).
- **Gruppenavn** inni en figur eller liste: små store bokstaver i dempet farge («Studieforberedende», «Yrkesfag»).

*Eksempler:* temasidene i Videregående i tall, tallboksene, gruppene på forsiden.

## Valgknapper

- **Valg mellom få alternativer** (2–5) er piller: avrundet helt, hvit med tynn kant. Det valgte er gult (`--farge-aksent`) med mørk tekst. Pillene står med litt luft mellom, ikke i én blokk.
- **Korte valg** (høyst sju tegn, f.eks. 45, 60, 90 og Annet) er avrundede firkanter (`--radius-m`), ikke runde piller, med samme farger (eier 08.10.2026). `Bryter` gir dem klassen `bryter-korte` selv.
- Det samme gjelder faner og filtre på en side (temafanene i Videregående i tall, filtrene i søket og kalenderen).
- Unntak: fanene i Aktuelt på forsiden er rolige tekstknapper med strek under, og valget i det mørke toppfeltet på forsiden beholder sin form.
- **Av/på-brytere** (`vippe`) er gule med mørk knott når de er på, som de valgte pillene (eier 08.10.2026). Nedtrekkslister er som før.
- Ingen mørkeblå fylte flater i innholdet. Mørkeblått er toppfeltet og hovedknappene.

*Eksempler:* fanene på temasidene, «Fylkene / Etter bakgrunn», filtrene i kalenderen.

## To kolonner

- Sider med flere deler står i to kolonner fra 64rem (`ToKolonner`): de første delene til venstre (3/5) og resten til høyre (2/5). Rekkefølgen på mobil er den samme.
- Kildene til siden står nederst i høyre kolonne i en lukket boks (`Kildeboks`). En tallboks fra Videregående i tall står over kildene. Sider med én kolonne har også kildene i `Kildeboks` nederst, aldri som en punktliste rett på bakgrunnen.
- **En kolonne står aldri tom.** I kalkulatorene står resultatkortet i høyre kolonne fra start, med en strek der tallet kommer og en kort linje om hva som må fylles inn (eier 08.10.2026).
- **Oversiktene i modulene:** ingressen øverst over begge kolonnene. Har en del bare én inngang, står den uten overskrift, og flere slike står som én liste (`Oversiktsdel`, avgjørelse 100). Til venstre står sidene i modulen: oppslag, forklaringer og figurer. Til høyre står verktøyene og det som endrer seg, alltid i denne rekkefølgen: veiviserne, kalkulatorene, fristene eller kalenderen, og tallene fra Videregående i tall (eier 08.10.2026, testes). På mobil står venstre kolonne først.

*Eksempler:* fagarket, temasidene, Mer opplæring, Eksamen.

## Delene som kan lukkes

- **En del av en side** som kan lukkes, er en `Seksjon`: tynn strek over, tittelen til venstre og en liten pil til høyre. Lukket viser den innholdet på én dempet linje.
- **Fag- og funksjonskortene i kalkulatorene** har ingen egen tittel. Feltet for faget eller navnet på funksjonen står øverst, med prikken i fargen fra stolpen foran og pilen og krysset til høyre. Lukket står kortnavnet der, f.eks. «Matematikk R1 · 26,67 %». Stolpen og utregningen bruker de samme kortnavnene (eier 09.10.2026). «Legg til fag» og «Legg til funksjon» lukker kortene som står fra før (`leggSammen`, eier 09.10.2026).
- **Kort med overskrift** (skjemadelene i kalkulatorene, resultatkortet, rubrikkene i Opplæringstilbud, Læreplanverket og Lov og forskrift, delene i Innstillinger og brukserklæringen i Om appen) har overskriften på en myk flate i temafargen, med innholdet på hvitt under (eier 08.10.2026).
- **Har delene egne underoverskrifter** (f.eks. fagarket, med ferdighetene, kompetansemålene og vurderingen), er hver del et hvitt kort med overskriften på en myk flate i temafargen, så nivåene skilles (eier 08.10.2026). Underdelene er rader med en tynn strek mellom, og forklaringene inni står med luft over og under.
- **Et kort som kan åpnes** (`Innholdskort`, `Lukketkort`) viser tittelen og første setning, med pilen til høyre. Det har regelverket og kildene som lukkede rader nederst (`Kortfot`).
- **Tilleggsstoff** som ikke er sidens eget innhold, er en lukket rad med ikon og blå tekst, som «Kilder (n)», «I regelverket (n)» og «Slik regnes det ut» (`Forklaring`). Flere slike rader etter hverandre står i én boks, med en tynn strek mellom.
- Det som er åpent, huskes for siden (`useHusketApen`).
- **Hovedinnholdet står åpent på skrivebord.** Det brukeren kommer for (kompetansemålene og vurderingsordningen på fagarket, dokumentene i Regelverk), er åpent fra start på skrivebord (fra 64rem, `useBred`) og lukket på mobil, så siden ikke blir lang (eier 09.10.2026). Lukket overalt står det som bare noen trenger (avgjørelse 100).
- Et skjema i deler (`fieldset.valggruppe`) har overskriften (`legend`) på den myke flaten i kortet, ikke på rammen. Et vanlig kort får det samme med `kort-med-topp`.

*Eksempler:* delene på temasidene, kortene i Vurdering, kildeboksen.

## Veiviserne

- Et steg er et hvitt kort med steget og tittelen på en myk flate i fargen til veiviseren (`--farge-flate-2` settes per veiviser).
- Svarene er rader i ett hvitt kort med tynn strek mellom og pil til høyre (`veiviser-svarliste`).
- Svarene brukeren har gitt, står med gul bakgrunn (`veiviser-svar-valgt`) øverst i veien og i fasene, fordi gult er det som er valgt (eier 08.10.2026).
- Knappene i veiviseren følger fargen til veiviseren, som lenkene, og er ikke gule. «Kopier oppsummeringen» og «Start på nytt» har ikon, står under hverandre og er like brede.
- Det som er lokalt (fylket, skolen), står på en myk flate uten strek. Lokale tillegg og privatskoler har stiplet kant.

## Tall og resultater

- **Tallet først og stort** (fet, `--str-xl` eller større, faste sifferbredder), med teksten under eller ved siden av, og eventuelt en dempet linje under det igjen.
- Det gjelder alle tall, også nøkkeltallene i Videregående i tall (eier 08.10.2026).
- Flere tall står side om side på én linje og brytes til neste linje når det ikke er plass.
- Resultatet i en kalkulator er et hvitt kort med tynn kant som de andre kortene: tittelen i tekstfarge, hovedtallet stort og delresultatene i rader under. «Vis utregning» og «Kopier» står nederst. Før noe er fylt inn, står det tomme kortet (`Tomtresultat`) på samme plass.
- Seriefargen (`--serie-1`) markerer det valgte i en figur. Grått er resten.
- **Stolpene i kalkulatorene** er én felles komponent (`Stolpe`): HTML med fast høyde (0,75rem, årsverket 2rem), 2 px mellomrom mellom delene og avrundede hjørner. Tekst ved stolpen står i tekstfarge og vanlig størrelse, aldri i seriefargen. Tall som står i en tabell rett under, står ikke inni stolpen (eier 09.10.2026, avgjørelse 096).
- **Fargene i figurene** kommer fra den validerte paletten (`--serie-1` til `--serie-5`: blå, oransje, grønn, gul og fiolett). Årsverket har dem i denne rekkefølgen, med lys grå for tiden læreren disponerer selv. Fagene i stolpen for beskjeftigelse har de fire første etter tur, og funksjonene fiolett. En del i en figur har fast farge, så fargen ikke bytter når en annen del faller bort.
- En strek tvers over radene i en figur (f.eks. landet) må stå rett. Radene deler kolonnene (`st-felles-kolonner`, subgrid) eller har en fast bredde på tallkolonnen, så sporet er like bredt i alle radene (testes).

*Eksempler:* «Kort fortalt», hovedtallene i figurene, tallene i temakortene.

## Forsiden

- **Gruppene** (kategoriene med modulene, favorittene og Aktuelt) lukkes og åpnes med pilen i overskriften, og lukket viser overskriften hva som er inni. Rekkefølgen settes under «Tilpass» (avgjørelse 056).
- **Aktuelt** (kalenderen, nyhetene, Videregående i tall og dagens jukselapp) er én gruppe på den myke flaten i temafargen: merkelappen «Aktuelt» som overskrift, filterknappen og pilen til høyre, og fanene mellom visningene under. Filterknappen åpner menyen, et hvitt kort under overskriften, som velger visningene, slår dagens jukselapp av og på og skjuler Aktuelt. «Tilpass» henter det tilbake. Visningen brukeren valgte sist, står (eier 09.10.2026, avgjørelse 102).
- **Skrivebord** (fra 44rem): Aktuelt øverst i sidekolonnen, åpent fra start, og favorittene under. Kolonnen står fast og ruller selv (avgjørelse 068). Er Aktuelt skjult og det ikke er favoritter, får gruppene hele bredden.
- **Mobil:** Aktuelt i en egen ramme øverst, lukket fra start med én linje: visningen og den neste datoen, nyheten, tallet eller faktumet.
- **«Bare favoritter»:** Visningene som er favoritter, står som egne grupper, og favorittene under kategoriene sine.

*Eksempler:* forsiden.

## Avstander

- Mellom delene på en side: `--rom-5`, før en ny hoveddel `--rom-6`.
- Mellom kort i en liste: `--rom-3`.
- Inni et kort: `--rom-3` og `--rom-4`.
