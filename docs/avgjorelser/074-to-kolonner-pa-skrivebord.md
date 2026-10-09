# 074 – To kolonner på skrivebord som hovedregel, og Regelverk med lukkede grupper

**Kontekst:** Mer opplæring og sidene for lærlinger og kandidater står i to kolonner på skrivebord (avgjørelse 069 og 073). Eier ba 06.10.2026 om at «Underveis- og sluttvurdering», «Eksamen» og «Fag- og svenneprøven og de andre prøvene» blir delt på samme måte, at delingen blir hovedregelen for nye sider på skrivebord, og at andre sider som kan ha nytte av det, vurderes. Eier ba samtidig om at gruppene på oversikten i Regelverk er lukket fra start.

**Valg:**
- **Felles komponent:** `components/ToKolonner.tsx` med `hoved` og `side`, og klassen `side-bred` på siden. Fra 64rem står hoveddelen til venstre (3/5) og sidedelen til høyre (2/5), og siden er opptil 72rem bred. Under 64rem står delene under hverandre. `useBred()` sier om skjermen er bred nok, for innhold som skal stå et annet sted på mobil.
- **Rekkefølgen på mobil endres ikke:** Hoveddelen er de første delene på siden, og sidedelen resten. Unntaket er fagsøket i «Underveis- og sluttvurdering»: det står øverst til høyre på skrivebord og rett under skoleåret på mobil, som før (eier 04.10.2026).
- **Sidene:**
  - Underveis- og sluttvurdering: skoleåret, forskjellen og prinsippene til venstre, læreplanen for et fag til høyre.
  - Eksamen: antallet og gangen til venstre, hele veien, ikke bestått og «Videre» til høyre.
  - Prøvene: prøvene (med «Veiene hit») og gangen til venstre, hele veien, ikke bestått og «Videre» til høyre.
  - Fylkessiden: lenkene hos fylket og de lokale forskriftene til venstre, skoler, kontor, datoer og klage til høyre.
  - Fagarket (eier 06.10.2026): læreplanverket, kompetansemålene og vurderingen til venstre, nøkkeltallene, faktaene og programområdene til høyre. Her er rekkefølgen på skrivebord en annen enn på mobil (`useBred`), fordi kompetansemålene trenger bredden.
  - Tilbudene i Opplæringstilbud (eier 06.10.2026): sammensetningen, fagene og tilpasningene til venstre, veien videre, skolene, yrkene og Vilbli til høyre.
  - Mer opplæring bruker komponenten i stedet for egne klasser. Sidene for lærlinger og kandidater beholder sine (`fb-to`), fordi de har egne bredder og en kolonne som står fast.
- **Kildene til siden** (eier 06.10.2026): På fagarket og tilbudene står kildene i en lukket boks nederst i høyre kolonne (`Kildeboks`), med raden «Kilder (n)» som i kortene, ikke som en liste rett på bakgrunnen nederst på siden. På mobil står boksen nederst.
- **Regelen** står i AGENTS.md under «Grensesnitt»: nye sider med flere deler bruker `ToKolonner`.
- **Regelverk:** Gruppene (lover, forskrifter, lokale forskrifter og avtaler) er lukket fra start på mobil og skrivebord. Det brukeren åpner, huskes for siden (avgjørelse 072).

**Konsekvens:** Nye sider får to kolonner uten egen CSS. Kalkulatorene, forsiden og kalenderen har egne oppsett på skrivebord og er ikke endret. Vurderingen av de andre sidene står i `docs/arbeidsordrer/fase-7-forslag.md`.

**Endret 09.10.2026:** Gruppene i Regelverk står åpne, med dokumentene i en liste under gruppenavnet (avgjørelse 100).
