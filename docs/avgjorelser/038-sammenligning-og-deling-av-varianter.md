# 038 – Sammenligning og deling av varianter i Arbeidsplan

**Kontekst:** Fase 3 (OPPDRAG.md): to varianter skal kunne sammenlignes side om side, f.eks. med og uten kontaktlærerfunksjon, og en variant skal kunne deles som lenke med komprimert tilstand i adressen. Appen har ingen server og lagrer ingenting utenfor enheten.

**Valg:**
- **Samme utregning overalt:** Utregningen i Arbeidsplan er flyttet ut av siden til `beregnArbeidsplan` (`src/modules/arbeidstid/arbeidsplan.ts`). Siden og sammenligningen bruker den samme funksjonen, så tallene alltid er like.
- **Sammenligning (eier 02.10.2026):** «Sammenlign» under lagrede varianter åpner en egen del i full bredde under kalkulatoren, ikke i resultatkolonnen. Der velger brukeren to av variantene eller «Fylt ut nå». Den står på samme side, så «Fylt ut nå» følger skjemaet.
  - Tabellen har én rad per tall: stillingen, undervisningen, funksjonene, redusert undervisning, beskjeftigelsen og forskjellen mot stillingen i prosent. Den har også de seks delene av arbeidstiden og planfestet tid i timer, og lønnen når den er regnet ut. Endringen er fra 1 til 2.
  - Variantene er merket 1 (blått) og 2 (gult) ved valgene og over kolonnene. Enheten står i gruppeoverskriften, så tallene står uten enhet. Delene av arbeidstiden har fargemerket fra diagrammet.
  - Endrede rader er uthevet, og endringen står i en gul lapp med pil opp eller ned. Uendrede rader er dempet. «Vis bare det som er endret» skjuler dem.
  - På smale skjermer står bare merkene over kolonnene. Endringen står på samme linje som tallene (eier 02.10.2026), med mindre lapp og tettere kolonner. Lange ord deles med bindestrek, også i Safari (`-webkit-hyphens`). På de smaleste skjermene (under 360 px) er navnene og tallene i liten skrift. Da får tabellen plass på 320 px.
  - Arbeidstiden står i denne rekkefølgen: de planfestede delene, «Planfestet tid i alt», selvdisponert tid og «Årsverk i alt» (eier 02.10.2026). Summene har strek over og fet skrift, så det er tydelig at selvdisponert tid ikke er en del av planfestet tid.
  - Korte navn (eier 02.10.2026): «Over/under stillingen» i stedet for «Over (+) eller under (−) stillingen». På smale skjermer står «Funksjoner» i stedet for «Funksjoner og andre oppgaver». Skjermlesere får hele navnet.
  - For en periode gjelder tallene perioden, og det står en merknad om det under tabellen.
  - Komponenten er felles for kalkulatorene, men bare Arbeidsplan bruker sammenligningen og delingen foreløpig.
- **Variantlisten (eier 02.10.2026):** Hver variant står på to linjer. Øverst står navnet med blyant og kryss, og resultatet. Under står tidspunktet, «Hent» og «Del», og forskjellen fra nå. En slettet variant fjernes med en gang, men «Angre» står der den sto i 8 sekunder, med samme høyde, og legger den tilbake på samme plass. «Angre» får fokus. Står fokus der når tiden er ute, flyttes det til «Lagre variant».
- **Lenke:** `#/arbeidstid/arbeidsplan?del=…`. Innholdet er `{ v: 1, navn, skjema }`, gjort om til JSON og komprimert med nettleserens innebygde `CompressionStream('deflate-raw')` som base64url (`src/core/deling.ts`).
  - Det trengs ingen ny avhengighet. En vanlig arbeidsplan gir en lenke på om lag 500 tegn.
  - Første tegn sier hvordan innholdet er pakket: `z` er komprimert, og `j` er ukomprimert (nettlesere uten CompressionStream).
- **Navnet følger med** (eier 02.10.2026). Hjelpeteksten ber brukeren ikke bruke navn på personer. Navnet kortes til 40 tegn, som i lagrede varianter.
- **Kontroll av lenken:** Lenken kan komme fra hvem som helst.
  - Hvert felt i skjemaet sjekkes mot forventet type. Ukjente felt, for lange tekster (over 200 tegn), for lange lister (over 50) og for mye innhold avvises.
  - Er noe feil, endres ikke skjemaet, og brukeren får en merknad.
  - Felt som mangler, får standardverdien, slik som i varianter lagret med en eldre versjon.
- **Åpning:** Skjemaet fylles ut, og parameteren fjernes fra adressen uten ny oppføring i historikken. Da fylles skjemaet ikke ut på nytt når siden lastes igjen. Øverst i skjemaet står en merknad med knappen «Lagre som variant». Ingenting lagres før brukeren trykker på den.
- **Deling:** På telefon brukes telefonens egen deling (`navigator.share`). Ellers kopieres lenken. Lenken står også i et felt, så den kan kopieres selv om kopieringen ikke virker.

- **Ikoner (eier 02.10.2026):** Arbeidsplan har fått eget ikon, en stolpe delt i deler med strek for stillingen (som stolpen for beskjeftigelse), i stedet for de fire rutene. «Sammenlign» har to stolper med ulik høyde.

**Konsekvens:** Endres skjemaet i Arbeidsplan, må kontrollen i `lesDeltArbeidsplan` følge med. Testene sjekker at et skjema fra appen godtas. Må eldre lenker leses annerledes, økes `v`. Lenken inneholder ingen personopplysninger utover det brukeren selv skriver i navnet eller i navnet på en funksjon.
