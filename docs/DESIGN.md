# Designprinsipper

Dagens standard for hele appen (fase 8b, eier 08.10.2026). Den bygger på de nyeste delene: sidekolonnen på forsiden, Kalender, Nyheter og Videregående i tall. Nye sider følger reglene her, og eldre sider løftes til dem i fase 8b.

Godkjent av eier 08.10.2026 etter skissen på `#/utvikling/design` i testversjonen (svarene står i `docs/arbeidsordrer/fase-8b-forslag.md`).

Reglene i AGENTS.md under «Grensesnitt» gjelder fortsatt. Denne filen sier hvordan det skal se ut.

## Grunnregler

- **Rolig og flatt.** Papirbakgrunn, hvite kort med tynn kant og myke flater i temafargen. Ingen skygger i innholdet.
- **Farge bare når den betyr noe.** Tekst og titler står i tekstfarge. Blått er lenker og det brukeren kan trykke på. Gult er det som er valgt. Seriefargene er tall og diagrammer.
- **Ingen nye farger.** Alle farger er tokenene i `tokens.css` og `tema.css`.
- **Samme mønster for det samme.** Finnes det et mønster under, brukes det i stedet for en ny variant.

## Kort

Et kort samler én ting: et skjema, en oppføring eller en forklaring.

- Hvit flate (`--farge-flate`), tynn kant (`--strek` i `--farge-kant`) og avrundede hjørner (`--radius-m`).
- Luft inni: `--rom-3` over og under, `--rom-4` på sidene (`--rom-3` på smal skjerm).
- Rader i et kort skilles med en tynn strek (`--farge-linje`), ikke med egne kort.
- Et kort som er en lenke, har pilen til høyre. Ikonet står til venstre, i en myk sirkel i temafargen.
- **Ingen tykke streker til venstre.** En farge som betyr noe, f.eks. delen i diagrammet i Arbeidsplan, vises som en liten rund prikk foran tittelen, som i forklaringene til diagrammene. Der fargen ikke står i et diagram på siden, er det ingen prikk.

*Eksempler:* modulene på forsiden, kalenderen og nyhetene i panelet, figurene i Videregående i tall.

## Flater

- **Bakgrunnen** (`--farge-bakgrunn`) er siden selv. Overskrifter, ingress og løpende tekst står rett på den.
- **Hvit flate** (`--farge-flate`) er kort og bokser med sidens eget innhold.
- **Myk flate i temafargen** (`--farge-flate-2` og blandingene `--farge-sidekolonne` og `--farge-itall-flate`) er det som står rundt eller oppsummerer: sidekolonnen, «Kort fortalt», temakortene, lenkelinjen nederst i en boks («Hele kalenderen») og tallboksene.
- En boks inni en boks unngås. Trengs det, er den indre en myk flate uten kant.
- **Strek til venstre** (4 px) brukes bare der den sier at innholdet kommer fra et annet sted eller oppsummerer siden: tallboksene fra Videregående i tall, «Kort fortalt» og sitert lov- og forskriftstekst.

*Eksempler:* sidekolonnen på forsiden, «Kort fortalt» på temasidene, tallboksene.

## Overskrifter og merkelapper

- **Sidetittel** (`h1`) med stjernen til høyre (`Sidetopp`) og stien over (`Brodsmuler`).
- **Delene på en side** (`h2`) er fete, i tekstfarge og normal størrelse, med en tynn strek over (`Seksjon`). Ikke farget, ikke store bokstaver.
- **Titler i kort** er fete og i tekstfarge. Teksten under er dempet og mindre.
- **Merkelapp** over en tittel: liten, store bokstaver, litt sperret, i merkefargen (`st-boks-merke`). Den sier hvilken type boks det er, f.eks. «Videregående i tall», «Kort fortalt» eller «Dagens jukselapp». Den står aldri alene som overskrift.
- **Gruppenavn** inni en figur eller liste: små store bokstaver i dempet farge («Studieforberedende», «Yrkesfag»).

*Eksempler:* temasidene i Videregående i tall, tallboksene, gruppene på forsiden.

## Valgknapper

- **Valg mellom få alternativer** (2–5) er piller: avrundet helt, hvit med tynn kant. Det valgte er gult (`--farge-aksent`) med mørk tekst. Pillene står med litt luft mellom, ikke i én blokk.
- **Korte valg** (høyst sju tegn, f.eks. 45, 60, 90 og Annet) er avrundede firkanter (`--radius-m`), ikke runde piller, med samme farger (eier 08.10.2026). `Bryter` gir dem klassen `bryter-korte` selv.
- Det samme gjelder faner og filtre på en side (temafanene i Videregående i tall, filtrene i søket og kalenderen).
- Unntak: valgene i overskriften på panelet på forsiden er rolige tekstknapper med strek under, og valget i det mørke toppfeltet på forsiden beholder sin form.
- **Av/på-brytere** (`vippe`) er gule med mørk knott når de er på, som de valgte pillene (eier 08.10.2026). Nedtrekkslister er som før.
- Ingen mørkeblå fylte flater i innholdet. Mørkeblått er toppfeltet og hovedknappene.

*Eksempler:* fanene på temasidene, «Fylkene / Etter bakgrunn», filtrene i kalenderen.

## To kolonner

- Sider med flere deler står i to kolonner fra 64rem (`ToKolonner`): de første delene til venstre (3/5) og resten til høyre (2/5). Rekkefølgen på mobil er den samme.
- Kildene til siden står nederst i høyre kolonne i en lukket boks (`Kildeboks`). En tallboks fra Videregående i tall står over kildene.
- **En kolonne står aldri tom.** I kalkulatorene står resultatkortet i høyre kolonne fra start, med en strek der tallet kommer og en kort linje om hva som må fylles inn (eier 08.10.2026).
- Oversiktene i modulene: ingressen og inngangene til venstre, veiviserne, kalenderen og tallene til høyre.

*Eksempler:* fagarket, temasidene, Mer opplæring, Eksamen.

## Delene som kan lukkes

- **En del av en side** som kan lukkes, er en `Seksjon`: tynn strek over, tittelen til venstre og en liten pil til høyre. Lukket viser den innholdet på én dempet linje.
- **Et kort som kan åpnes** (`Innholdskort`, `Lukketkort`) viser tittelen og første setning, med pilen til høyre. Det har regelverket og kildene som lukkede rader nederst (`Kortfot`).
- **Tilleggsstoff** som ikke er sidens eget innhold, er en lukket rad med ikon og blå tekst, som «Kilder (n)», «I regelverket (n)» og «Slik regnes det ut» (`Forklaring`). Flere slike rader etter hverandre står i én boks, med en tynn strek mellom.
- Det som er åpent, huskes for siden (`useHusketApen`).

*Eksempler:* delene på temasidene, kortene i Vurdering, kildeboksen.

## Tall og resultater

- **Tallet først og stort** (fet, `--str-xl` eller større, faste sifferbredder), med teksten under eller ved siden av, og eventuelt en dempet linje under det igjen.
- Det gjelder alle tall, også nøkkeltallene i Videregående i tall (eier 08.10.2026).
- Flere tall står side om side på én linje og brytes til neste linje når det ikke er plass.
- Resultatet i en kalkulator er et hvitt kort med tynn kant som de andre kortene: tittelen i tekstfarge, hovedtallet stort og delresultatene i rader under. «Vis utregning» og «Kopier» står nederst. Før noe er fylt inn, står det tomme kortet (`Tomtresultat`) på samme plass.
- Seriefargen (`--serie-1`) markerer det valgte i en figur. Grått er resten.

*Eksempler:* «Kort fortalt», hovedtallene i figurene, tallene i temakortene.

## Avstander

- Mellom delene på en side: `--rom-5`, før en ny hoveddel `--rom-6`.
- Mellom kort i en liste: `--rom-3`.
- Inni et kort: `--rom-3` og `--rom-4`.
