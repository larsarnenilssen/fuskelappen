# Forslag: fase 8 – Dagens jukselapp

*Status 08.10.2026:* Eier godkjente designet etter runde 2, med alternativ C. Levert i 0.43.0 (avgjørelse 086). Rundene under står som de ble skrevet, nyeste øverst.

Til eier. Svar gjerne punkt for punkt (f.eks. «J1 ja, men uten paragrafer, J4 A»). Rundene står med den nyeste øverst.

---

## Runde 5: tittelen tilbake, og Elevundersøkelsen som egen modul (eier 08.10.2026)

**Lengden og tittelen:** Med høyden på 268 px er det plass til tittelen på en linje over faktumet når teksten er høyst om lag 240 tegn, som før. Over 60 fakta på mobil (390 px) holdt 58 seg innenfor kalenderhøyden, og den lengste ble 20 px høyere. Lengre tekst ville gjort kortet høyere enn de andre visningene, så tittelen er tatt tilbake, og lengden er den samme.
- Tittelen står i halvfet over faktumet, og begge står midt i plassen.
- Gjentakelser er tatt bort: fagene sier «Faget har 140 årstimer» under tittelen, kodene har koden i tittelen («IV – Ikke vurderingsgrunnlag»), og Elevundersøkelsen har navnet på indeksen som tittel.
- Er lenken den samme som tittelen (et begrep, en vei), står «Les mer».

**Elevundersøkelsen** er en egen modul under Skolemiljø på forsiden (`#/elevundersokelsen`). Modulen Skolemiljø heter nå **Aktivitetsplikt og skoleregler**, og Elevundersøkelsen er tatt ut av den (avgjørelse 087). Andre navn jeg vurderte: «Trygt skolemiljø» (for likt siden «Et trygt og godt skolemiljø») og «Skolemiljøregler».

| Jukselappen, mobil | Jukselappen, skrivebord | Skolemiljø på forsiden |
|---|---|---|
| ![](bilder/fase-8-r5-mobil.png) | ![](bilder/fase-8-r5-skrivebord.png) | ![](bilder/fase-8-r5-skolemiljo.png) |

---

## Runde 4: flere fakta og lik høyde (eier 08.10.2026)

- **Tatt med etter rådene i vurderingen:**
  - Elevundersøkelsen: mobbing og indeksene for Vg1, for landet, fylket og skolen, fra et lite utdrag som lages ved bygging. Ordlyden om mobbing følger teksten på siden for Elevundersøkelsen: «… svarte i Elevundersøkelsen 2025-26 at de er blitt mobbet 2 eller 3 ganger i måneden eller oftere de siste månedene».
  - Skoleregisteret: tilbudene ved skolen du har valgt.
  - Kodene i begrepene: karakterer og vurderingsuttrykk, orden og oppførsel, og karakterstatus. Kodelistene fra VIGO er ikke med.
- **Ikke med foreløpig:** kompetansemål, skolenes egne regler, datoene, nyhetene og opplæringskontorene.
- **Høyden:** Jukselappen er 268 px, som kalenderen (269 px på mobil). Nyhetene er 255 px og tallene 330 px. Faktumet står midt i plassen, i litt større skrift. Testes i `tests/e2e/jukselapp.spec.ts`.

---

## Runde 3: kortet uten tittel og kilder (eier 08.10.2026)

- «I regelverket» og «Kilder» er tatt ut av kortet. Kildene står på siden lenken går til.
- Tittelen er tatt bort. Den øverste linjen er høyere, med hvor faktumet kommer fra til venstre og «Ny jukselapp» til høyre.
- Lenken til stedet i appen har hele bunnfeltet.

| Mobil | Skrivebord |
|---|---|
| ![](bilder/fase-8-r3-mobil.png) | ![](bilder/fase-8-r3-skrivebord.png) |

---

## Kontroll og vurdering av innholdet (eier 08.10.2026)

Eier ba om en kontroll av at veiene for lærlinger og kandidater, eksamen og fraværsgrensen er med, og en vurdering av om innhold på flere sider kan brukes.

**Kontrollert (testes i `tests/unit/jukselapp.test.ts`):**
- **Veiene til fag- og svennebrev:** alle ti er med, fra lærling til praksiskandidat.
- **Eksamen og klage:** 65 fakta: reglene for eksamen, fag- og svenneprøven, stegene i «Klage på karakter» og fristene.
- **Fraværsgrensen:** sju fakta: hva som teller, unntakene, rektors skjønn, årstimetallet, hvem den gjelder for, varselet og begrepet.

**Lagt til nå:**
- **Fristene** viser når de er («Ti dager», «1. mars», «Hvert halvår»).
- **Videregående i tall:**
  - elever og skoler
  - fag- og svennebrev
  - medianfravær
  - snittkarakteren til skriftlig eksamen i de sju fellesfagene, for landet og fylkene
- **Skolen du har valgt:** elevtallet og fraværet, synlig bare når skolen er valgt.

**Vurdert, men ikke lagt inn (si fra om du vil ha noe av det):**

| Innhold | Vurdering |
|---|---|
| **Elevundersøkelsen** (mobbing og indeksene for skolen, fylket og landet) | Godt egnet, særlig for valgt skole. Filen er stor (600 kB), så det bør lages et lite utdrag ved bygging, som for fagene. Ordlyden om mobbing må være presis, så jeg vil foreslå teksten før den tas med. **Råd: ta med.** |
| **Skolen du har valgt** i skoleregisteret (antall tilbud og plasser fra utdanning.no) | Lett å lage og passer kravet om skoleinnhold. **Råd: ta med.** |
| **Kodelistene** i begrepene (karakterer, vurderingsuttrykk, fag- og vitnemålsmerknader) | Kuriositeter, f.eks. hva en vitnemålsmerknad betyr. Mange er korte og tekniske. **Råd: et utvalg.** |
| **Kompetansemål** i læreplanene | Morsomt, men hver læreplan er en egen fil, og målene sier lite alene. **Råd: vent.** |
| **Skolenes og fylkenes egne regler** fra Lovdata | Passer for valgt fylke og skole, men teksten varierer mye og begynner ofte med formål eller virkeområde. **Råd: vent.** |
| **Opplæringskontorene** | Lite verdi som faktum. **Råd: nei.** |
| **Datoene** i kalenderen, skoleruta og eksamensdatoene | Står allerede i kalenderen og blir fort gamle. **Råd: nei.** |
| **Nyhetene** | Ferskvare med egen visning. **Råd: nei.** |

---

## Svar på runde 2 (eier 08.10.2026) og leveransen

- **J7:** B med C. Første besøk hver dag står panelet på jukselappen.
- **J8:** Teksten er grei, med en setning om at jukselappen vises først ved første besøk hver dag.
- Testing, fletting og publisering, med versjon valgt av Claude: 0.43.0.
- Skissen er erstattet av `fakta()` i manifestene. Om lag 1 600 fakta fra tolv moduler, se avgjørelse 086.

---

## Runde 2: dine svar 08.10.2026

- **Plass:** B, en fjerde visning i panelet. Variant A og adressen `?jukselapp=panel` er tatt bort.
- **Ingen rad på forsiden** som slår den på. Bryteren står under Innstillinger og under «Tilpass», den samme begge steder. Slått på blir «Jukselapp» valgt i panelet, så den vises med en gang.
- **Velkomsten:** I fase 10 har velkomsten fått et trinn som spør om brukeren vil slå på dagens jukselapp (`OPPDRAG.md`).
- **Oppsettet** er som kalenderen, nyhetene og tallene, uten gul kant:
  - en boks med tittelen i halvfet og faktumet i liten skrift, og typen i dempet skrift under
  - «I regelverket» og «Kilder» som lukkede rader
  - den blå linjen nederst, med «Ny jukselapp» til venstre og lenken til stedet i appen til høyre
- **Fakta:** Typene er godkjent, og fakta som ikke er kontrollert, kan vises. I skissen er det lagt til hovedtariffavtalen (ferie og overtid) og mer fra overordnet del (de fem grunnleggende ferdighetene, de tre tverrfaglige temaene samt profesjonsfellesskap og skoleutvikling). Skissen har nå 15 fakta.
- **Bytte:** hver dag, og med knappen.
- **Med «Bare favoritter»:** Jukselappen kan ikke være favoritt, så den står som egen gruppe når den er slått på.

Panelet med jukselappen er om lag 235 px høyt på mobil (390 px), mot 337 px for kalenderen. Boksen blir høyere når kildene åpnes.

| | Mobil | Skrivebord |
|---|---|---|
| Jukselapp i panelet | ![](bilder/fase-8-r2-mobil.png) | ![](bilder/fase-8-r2-skrivebord.png) |
| 320 px, nynorsk | ![](bilder/fase-8-r2-mobil320-nn.png) | |
| «Tilpass» og Innstillinger | ![](bilder/fase-8-r2-tilpass-mobil.png) | ![](bilder/fase-8-innstillinger-mobil.png) |

### J7. Et tredje alternativ?

Ulempen med B er at panelet husker visningen. Den som bruker kalenderen, ser sjelden jukselappen. To måter å løse det på:

- **C: Jukselappen først én gang om dagen.** Første gang forsiden åpnes en ny dag, står panelet på «Jukselapp». Bytter brukeren visning, gjelder valget resten av dagen. Det er ikke noe nytt element på forsiden, og ett trykk tar deg til kalenderen. Appen husker datoen jukselappen sist ble vist, lokalt.
- **D: En linje nederst i panelet.** Under kalenderen, nyhetene og tallene står én linje: «Dagens jukselapp: Ferie …», som bytter til jukselappen. Den er alltid synlig, men er et nytt element på forsiden, som du ikke ønsket.

**Mitt råd:** B som nå, eventuelt med C. Si fra om du vil ha C, så legger jeg det inn i skissen.

### J8. Teksten under bryteren

«Ett faktum fra appen hver dag, med lenke og kilde. Den står øverst på forsiden, ved siden av kalenderen, nyhetene og tallene.» Under «Tilpass» står bryteren under valgene for kalenderen, nyhetene og tallene. Greit?

---

## Runde 1: typer fakta, kontroll, bytte og plass

Skissen har elleve ekte fakta fra innholdet, ett eller to av hver type. Faktaene står i en egen fil til designet er godkjent. Etterpå lager hver modul faktaene sine selv med `fakta()` i manifestet. Skissen virker bare i testversjonen, og den publiserte appen er uendret.

### Slik ser det ut

| | Mobil | Skrivebord |
|---|---|---|
| A: egen rubrikk (anbefalt) | ![](bilder/fase-8-a-mobil.png) | ![](bilder/fase-8-a-skrivebord.png) |
| B: fjerde visning i panelet | ![](bilder/fase-8-b-mobil.png) | ![](bilder/fase-8-b-skrivebord.png) |
| Av, med teksten som slår den på | ![](bilder/fase-8-av-mobil.png) | ![](bilder/fase-8-av-skrivebord.png) |
| Innstillinger | ![](bilder/fase-8-innstillinger-mobil.png) | |

**Kortet** (likt i A og B):
- Øverst typen med ikon («Begrep», «Frist», «I tall · Vestland») og knappen for ny jukselapp (↻).
- Faktumet i litt større skrift, én til tre setninger.
- En blå lenkelinje til stedet i appen, som «Hele kalenderen» i panelet.
- «I regelverket» og «Kilder» som lukkede rader nederst (`Kortfot`, avgjørelse 071).
- En gul kant øverst, som lappen i logoen.

Lukket viser overskriften begynnelsen av faktumet, som de andre gruppene.

### J1. Hvilke typer fakta

Hver modul gir fakta fra innholdet og dataene den alt har. Teksten er de første setningene i elementet (høyst om lag 220 tegn), uten lenkene i teksten. Et element som ikke gir mening alene, kan tas ut med et felt i innholdet.

| Type | Fra | Eksempel |
|---|---|---|
| **Begrep** | Begrepsbanken (165) | «Et årsverk for lærere er 1687,5 timer, eller 1650 timer for lærere som er 60 år og eldre.» → Årsverk |
| **Regel** | Vurdering, eksamen, inntak, skolemiljø, tilrettelegging (om lag 200 forklaringer og regler) | «Fraværsgrensen er nådd når udokumentert og helserelatert fravær til sammen er 10 prosent av årstimetallet i faget.» → Fraværsgrensen |
| **Frist** | Fristene i inntak og eksamen, med regelen og ikke datoen | «Fristen for å klage på standpunktkarakterer, vedtak om IV og eksamenskarakterer er ti kalenderdager.» → Klage på karakter |
| **Fag** | Fagene med årsramme i SFS 2213 | «Matematikk 1P på Vg1 har 140 årstimer. Årsrammen for matematikk på studiespesialiserende Vg1 er 525 timer.» → Matematikk 1P |
| **Overordnet del** | Første setning i hver av de 24 delene | «Skolen skal legge til rette for og støtte elevenes utvikling av de fem grunnleggende ferdighetene …» → 2.3 Grunnleggende ferdigheter |
| **Paragraf** | Et utvalg paragrafer i opplæringslova og opplæringsforskrifta, uoversatt | «Alle elevar har rett til eit trygt og godt skolemiljø som fremjar helse, inkludering, trivsel og læring.» → § 12-2 |
| **Arbeidstid** | Verdiene i SFS 2213 med sitat | «Arbeidsåret er elevenes skoleår og 6 dager à 7,5 timer til kompetanseutvikling, planlegging og lignende.» → Arbeidsplan |
| **Opplæringsløp** | Veiene til fag- og svennebrev | «Den vanlige veien til fagbrev: Vg1 og Vg2 på et yrkesfaglig utdanningsprogram, og så læretid i bedrift med lærekontrakt.» → Lærling |
| **I tall** | Videregående i tall for valgt fylke, ellers landet | «81,6 prosent av elevene i Vestland som startet på Vg1 i 2019, fullførte og besto innen fem eller seks år. I hele landet var det 81,8 prosent.» → Vestland i tall |
| **Fylket** | Fylkets frister, inntaksregler og skoleregler, bare med valgt fylke | «Det er ingen søknadsfrist for voksne i Vestland, men søkeren bør søke innen 1. mars …» → Vestland fylkeskommune |

**Ikke med:** nyhetene (ferskvare, de har sin egen visning), datoene i kalenderen (står i «Neste datoer»), Elevundersøkelsen (stor fil) og skoleregisteret.

**Spørsmål:**
- Er typene riktige? Noe som bør ut eller inn?
- Paragrafene: et utvalg (forslag: kapitlene appen bruker mest, om tilpasset opplæring, inntak, vurdering og skolemiljø) eller alle?
- Skolen du har valgt: tall om skolen (elevtall, fravær) når skolen er valgt?

### J2. Bare kontrollert innhold?

Ingenting har `kontrollert` satt ennå, så med bare kontrollert innhold blir jukselappen tom.

**Mitt råd:** Vis alt nå, med brukserklæringen som forbehold (avgjørelse 016), som resten av appen. Faktumet er en lenke inn til innholdet, og innholdet har det samme forbeholdet der. Jeg lager det slik at det er én linje å endre for å vise bare kontrollert innhold, eller kontrollert innhold først, når kontrollrundene har kommet langt nok.

### J3. Hver dag, med en knapp eller begge?

**Mitt råd: begge.** Faktumet velges ut fra datoen, så det er det samme hele dagen og likt for alle med samme fylke. Ingenting lagres. Knappen ↻ viser et nytt med en gang. Neste dag kommer dagens igjen. Rekkefølgen hopper mellom modulene, og alle faktaene kommer før noe gjentas.

### J4. Egen rubrikk eller fjerde visning i panelet?

**A: egen rubrikk (anbefalt).** Står først på forsiden når den er slått på, og øverst i sidekolonnen på skrivebord. Den kan flyttes og lukkes under «Tilpass» som de andre gruppene. Krysset i overskriften slår den av.
- Den som har slått den på, ser den uten å bytte visning.
- Kortet er lavt: 270 px på mobil (390 px bred).

**B: fjerde visning i panelet.** «Jukselapp» ved siden av «I tall».
- Tar ingen ekstra plass.
- Fire valg får akkurat plass på 320 px, og «Nyheiter» på nynorsk gjør det trangere.
- Panelet husker visningen, så den som bruker kalenderen, ser sjelden jukselappen.

### J5. Teksten som slår den på

En rolig rad under linjen om fylket, med gul kant til venstre: «Nytt: Dagens jukselapp gir deg ett faktum fra appen hver dag, med lenke og kilde.», knappen «Slå på» og et kryss som lukker raden for godt.

Under Innstillinger står en bryter under «Forsiden». Under «Tilpass» står den med kalenderen, nyhetene og tallene.

**Spørsmål:** Når brukeren slår jukselappen av med krysset i overskriften, viser skissen raden igjen med «Dagens jukselapp er slått av. Du kan slå den på igjen her eller under Innstillinger.» Er det greit, eller skal raden ikke komme igjen (den kan slås på under «Tilpass» og Innstillinger)?

### J6. Den gule kanten

Kortet har en gul kant øverst, som lappen i logoen, så det skiller seg fra kalenderen og listene. Greit, eller skal det se ut som de andre kortene?

### Tekniske valg (til orientering)

- `fakta()` i manifestet, som `frister()`. En test sjekker at alle manifestene har den.
- Kortet og faktaene lastes først når jukselappen vises. Er den av, lastes ingenting. Skissen la til 0,6 kB i startpakken (121,4 kB).
- Fag og tall hentes fra et lite utdrag som lages ved bygging, ikke fra hele fagindeksen (1,2 MB).
- Valget lagres i `forside.jukselapp`, uten ny skjemaversjon (feltet kan mangle, og da er den av).
- Ingen ende-til-ende-tester før du har sagt at designet er ferdig.
