# 038 – Sammenligning og deling av varianter i Arbeidsplan

**Kontekst:** Fase 3 (OPPDRAG.md): to varianter skal kunne sammenlignes side om side, f.eks. med og uten kontaktlærerfunksjon, og en variant skal kunne deles som lenke med komprimert tilstand i adressen. Appen har ingen server og lagrer ingenting utenfor enheten.

**Valg:**
- **Samme utregning overalt:** Utregningen i Arbeidsplan er flyttet ut av siden til `beregnArbeidsplan` (`src/modules/arbeidstid/arbeidsplan.ts`). Siden og sammenligningen bruker den samme funksjonen, så tallene alltid er like.
- **Sammenligning:** Under «Lagrede varianter» velger brukeren to av variantene eller «Fylt ut nå». Tabellen viser stillingen, undervisningen, funksjonene, redusert undervisning, beskjeftigelsen og forskjellen mot stillingen i prosent. Den viser også de seks delene av arbeidstiden og planfestet tid i timer, og lønnen når den er regnet ut. Forskjellen er den andre minus den første.
  - Navnet på hvert tall står på egen linje over tallene, så tabellen får plass på 320 px. Timene står uten enhet, fordi gruppen heter «Arbeidstiden i timer».
  - For en periode gjelder tallene perioden, og det står en merknad om det under tabellen.
  - Komponenten er felles for kalkulatorene, men bare Arbeidsplan bruker sammenligningen og delingen foreløpig.
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

**Konsekvens:** Endres skjemaet i Arbeidsplan, må kontrollen i `lesDeltArbeidsplan` følge med. Testene sjekker at et skjema fra appen godtas. Må eldre lenker leses annerledes, økes `v`. Lenken inneholder ingen personopplysninger utover det brukeren selv skriver i navnet eller i navnet på en funksjon.
