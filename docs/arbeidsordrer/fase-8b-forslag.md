# Fase 8b – Designløft: forslag til eier

Til eier, 08.10.2026. Svar gjerne punkt for punkt (f.eks. «D1 ja, D3 B»). Rundene står med den nyeste øverst.

---

## Pakke 1: kalkulatorene (08.10.2026)

Testversjonen: https://jukselappen.no/test/ (sammenlign med https://jukselappen.no/).

- **Skjemaet:** hvite kort med tynn kant og titler i tekstfarge. I Arbeidsplan har delene og fagene en prikk i fargen fra diagrammet (D1). «Fag 1» står i kortet, i vanlig skrift.
- **Valgene:** gule piller. Korte valg (høyst sju tegn, f.eks. 45, 60, 90 og Annet) er avrundede firkanter (D2). Det gjelder alle stedene appen har slike valg, også Opplæringstilbud, Kalender og Elevundersøkelsen. Valget i det mørke toppfeltet på forsiden er som før.
- **Resultatet:** et hvitt kort med tynn kant. Før noe er fylt inn, står kortet der med en strek og en linje om hva som må fylles inn (D3).
- **«Lagrede varianter»** står i et kort.
- **Forklaringene** etter hverandre («Hva tiden brukes til», «Slik regnes grensen», «Slik regnes poengene») står i én boks med en tynn strek mellom.

**Eiers merknader (08.10.2026) og hva som er gjort:**
- **1 100 timer planfestet tid** i skjermbildene var en testverdi for Vestland som bare finnes i utviklingsmiljøet (`tests/fixtures/regler/sfs2213-fylke-46.yaml`). Appen bruker 1 150 timer fra regelsettet. Skjermbildene er tatt på nytt uten valgt fylke.
- **«Disponerer læreren selv»:** Teksten er skrevet om to ganger (eier: den første omskrivingen var uoversiktlig). Den vises bare når fag og funksjoner ikke fyller stillingsprosenten, og lyder nå: «Fag og funksjoner fyller ikke hele stillingen. Delen som står igjen (100 % av stillingen), er fordelt på samme måte som undervisning: en del er annen planfestet tid, f.eks. møter og annet elevrettet arbeid, og en del er tid læreren disponerer selv.» Beregningen er ikke endret.
- **Bryterne:** Av/på-bryterne er gule med mørk knott når de er på, som de valgte pillene, i hele appen.

| | Før | Etter |
|---|---|---|
| Arbeidsplan, skrivebord | ![](bilder/fase-8b-arbeidsplan-for.jpg) | ![](bilder/fase-8b-arbeidsplan-etter.jpg) |
| Fraværsgrensen, skrivebord | ![](bilder/fase-8b-p1-for-fravaer.jpg) | ![](bilder/fase-8b-p1-etter-fravaer.jpg) |
| Poengberegning, mobil | ![](bilder/fase-8b-p1-for-poeng-m.jpg) | ![](bilder/fase-8b-p1-etter-poeng-m.jpg) |

---

## Svar på runde 1 (eier 08.10.2026)

> Det nye designet er gjennomgående bedre.

- **D1:** Godtatt. Eier likte at fargene var lette å følge i den eldre versjonen, men det er penere nå.
- **D2:** Fargen og pillene er gode, men 45/60/90 er for runde. **Gjort:** korte valg på én linje i skjemaene (`Bryter kompakt`) er avrundede firkanter.
- **D3:** A. Resultatkortet vises fra start.
- **D4:** Godtatt.
- **D5:** Ja, tallet først også i Videregående i tall. Tas i oppryddingen (pakke 7).

---

## Runde 1: designprinsippene og skissen

**Reglene** står i `docs/DESIGN.md`. De bygger på sidekolonnen på forsiden, Kalender, Nyheter og Videregående i tall.

**Skissen** står i testversjonen: https://jukselappen.no/test/#/utvikling/design
- Hvert mønster har «Før» og «Etter». «Etter» er de samme komponentene som i appen, med de nye stilene.
- **Bryteren øverst** viser kalkulatorene og fagarket i ny stil i hele testversjonen, så du kan se de ekte sidene. Slå den av for å se dem som før.
- Resten av appen er ikke endret ennå. Det kommer i pakkene, etter ditt svar.

**Kort fortalt, det som endres:**
- **Kort:** tynn kant rundt, ingen tykke fargede streker til venstre. Titlene står i tekstfarge, ikke blått, lilla eller brunt.
- **Overskrifter:** «FAG 1» står i kortet i vanlig skrift, ikke med store bokstaver på rammen. Delene på oversiktene får en strek over og en fet overskrift, som på forsiden og temasidene.
- **Valgknapper:** gule piller med luft mellom, som fanene i Videregående i tall, i stedet for mørkeblå blokker.
- **Innganger:** ikonet i en myk sirkel og tittelen i tekstfarge, som modulene på forsiden.
- **Delene som kan lukkes:** som delene på temasidene: strek over, tittel og en liten pil. Ingen ramme og ingen tykk strek.
- **Tall:** tallet først og stort, teksten under. Tynn kant i stedet for den tykke blå rammen rundt resultatet.

| | Før | Etter |
|---|---|---|
| Arbeidsplan, skrivebord | ![](bilder/fase-8b-arbeidsplan-for.jpg) | ![](bilder/fase-8b-arbeidsplan-etter.jpg) |
| Vikartimer, mobil | ![](bilder/fase-8b-vikar-for.jpg) | ![](bilder/fase-8b-vikar-etter.jpg) |
| Fagarket, skrivebord | ![](bilder/fase-8b-fag-for.jpg) | ![](bilder/fase-8b-fag-etter.jpg) |

Hele skissen: [skrivebord](bilder/fase-8b-skisse-skrivebord.jpg) og [mobil](bilder/fase-8b-skisse-mobil.jpg).

**Spørsmål:**

- **D1 Fargen til delene i Arbeidsplan.** Den tykke streken blir en liten prikk foran tittelen, i samme farge som delen i diagrammet. Prikken står bare i Arbeidsplan, der diagrammet er. I de andre kalkulatorene er det ingen farge. Er det greit?
- **D2 Valgknappene.** Gule piller overalt der brukeren velger mellom noen få ting, også i skjemaene (kalkulatorene, poengberegningen og «Min skole / Alle» i Opplæringstilbud). Er det greit, eller vil du ha en roligere variant i skjemaene (hvit pille med blå kant for det valgte)?
- **D3 Resultatkolonnen i kalkulatorene på skrivebord.** I dag står den tom med en løs tekst til noe er fylt inn.
  - **A (anbefalt):** Resultatkortet står der fra start, med streker («–») der tallene kommer og en kort linje om hva som må fylles inn. Siden hopper ikke når tallene kommer.
  - **B:** Skjemaet bruker hele bredden til noe er fylt inn, og resultatet kommer til høyre etterpå.
- **D4 Delene på fagarket** («Kompetansemål og læreplan», «Vurderingsordning», «Inngår i tilbud»). I skissen er de som delene på temasidene: en strek over, uten ramme. Er det greit, eller vil du ha dem som hvite kort med tynn kant?
- **D5 Nøkkeltallene i Videregående i tall** har teksten over tallet («Søkere 2026», så «25 090»). Resten av appen får tallet først. Skal flisene der også få tallet først (i oppryddingen), eller beholdes de som de er?

**Neste steg etter svaret:** pakke 1, kalkulatorene, med skisse før og etter på `test/`, PR og grønn CI.
