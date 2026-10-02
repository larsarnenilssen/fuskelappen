# 037 – Læreplanverket: overordnet del, grunnleggende ferdigheter og tverrfaglige temaer

**Kontekst:** Pakke 6 i fase 2 (OPPDRAG.md). Eier ønsker en egen boks under «Læreplanverk og opplæringsløp» med overordnet del, grunnleggende ferdigheter og tverrfaglige temaer (B2). Overordnet del har mye tekst og skal være lett å navigere. Fagarket skal vise ferdighetene og temaene i faget med lenke til overordnet del. Kilden for teksten skulle avgjøres i pakken.

**Valg:**
- **Kilde for overordnet del: udir.no**, ikke Lovdatas datasett.
  - udir.no har teksten delt i kapitler med egne adresser, på bokmål og nynorsk, og under NLOD 2.0.
  - Lovdata har forskriften bare i datasettet. Det kan ikke hentes fra utviklingsmiljøet, og det har ikke nynorsk.
  - Lovdata-datasettet virker fra GitHub Actions: kildesjekken hentet arbeidsmiljøloven derfra 30.09.2026.
- **Henting:** `npm run hent:overordnet` henter innholdsfortegnelsen og hver side på begge målformer til `data/udir/overordnet-del.json`.
  - Teksten lagres som avsnitt og punktlister, uten lenker og ressurser.
  - Ser innholdet ufullstendig ut, beholdes forrige fil.
  - Kildesjekken henter hver uke, og endrede deler står til orientering i kontrollsaken.
  - Teksten er forskriftstekst og vises uendret. Den oppdateres derfor uten eiers kontroll, som Grep.
- **Grep:** Hentingen tar med listene over grunnleggende ferdigheter (GF1–GF5) og tverrfaglige temaer (TT1–TT3), med navn på begge målformer, i `data/grep/laereplanverket.json`. Hver læreplanfil får ferdighetene og temaene i faget, med koden og teksten fra læreplanen.
- **Modulen:**
  - Oversikten har søk i overordnet del, innholdsregisteret med lenke til hver del, og ferdighetene og temaene som lenker.
  - Overordnet del vises i bokser som er lukket. Delene inni er nye lukkede bokser, og de lukkede boksene er selve innholdsregisteret.
  - Adressen `#/laereplanverket/overordnet-del/2.5.1` åpner delen og boksene rundt den og ruller dit. Koden til en ferdighet eller et tema (`…/TT1`) finner delen ut fra navnet, ikke fra faste numre.
- **Fagarket:** «Grunnleggende ferdigheter og tverrfaglige temaer» viser teksten fra læreplanen, uoversatt, med lenke til omtalen i overordnet del.
- **Begreper og søk:**
  - Sju nye begreper med kilder og kontrollspørsmål: læreplanverket, fag- og timefordelingen, overordnet del, formålsparagrafen, kompetanse, grunnleggende ferdigheter og tverrfaglige temaer. Modulen og fagarket lenker til dem.
  - Læreplanverket har tre deler: overordnet del, fag- og timefordelingen og læreplanene for fag (eier 02.10.2026). Kilden er ingressen på udir.no/laring-og-trivsel/lareplanverket (`udir-lareplanverket`), som sjekkes hver uke med selektor og tekst, så kontrollsaken sier fra om setningen endres. Punkt 1.1 i Udir-1 sier at både læreplanene og tabellene med fag- og timefordelingen er forskrifter.
  - Søket finner delene i overordnet del på tittel, kapittelnummer og ingress, og ferdighetene og temaene på navn.
  - Nye synonymer gjør at nynorske ord som «grunnleggjande» og «berekraftig» også gir treff.
- **Sitater:** Formålsparagrafen og definisjonen av kompetanse står som sitater på udir.no og vises som sitater. Står det noe annet i teksten enn avsnitt, lister og sitater (f.eks. en tabell), stopper hentingen, så ingen tekst forsvinner uten at det merkes.
- **Data i appen:** Overordnet del og listene er egne JS-biter, om lag 24 kB komprimert. De lastes når de trengs og følger med når appen installeres. Søket finner delene på tittel, nummer og ingress.

- **Navn på forsiden (eier 02.10.2026):** Overskriften heter nå «Læreplanverket», og de tre boksene følger Udirs tre deler i Udirs rekkefølge: «Overordnet del» (denne modulen, som før het Læreplanverket), «Opplæringsløp» (fag- og timefordelingen og tilbudsstrukturen) og «Fag og læreplaner» (læreplanene for fag). Adressene er de samme, så favoritter og lenker virker som før.

**Konsekvens:** Teksten følger udir.no hver uke uten manuelt arbeid. Endrer Udir adressene eller sidene, stopper valideringen hentingen før noe skrives, og kontrollsaken sier fra. Rubrikken fra Opplæringsløp er flyttet til felles komponenter, så begge modulene bruker den.
