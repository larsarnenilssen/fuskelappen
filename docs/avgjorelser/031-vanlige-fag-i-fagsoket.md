# 031 – Vanlige fag i fagsøket, og roller regnet ut når appen bygges

**Kontekst:** Filteret i fagsøket ga for mange treff. Helse- og oppvekstfag ga 164 fag, blant dem morsmål, kvensk og andre varianter, og studiespesialisering ga hundrevis av fag. Tilbudsmodellen (avgjørelse 024) vet allerede hvilke fag som står i det ordinære tilbudet. Eier godkjente 01.10.2026 at «vanlige fag» er fagene i det ordinære tilbudet pluss yrkesfaglig fordypning.

**Valg:**
- Hver fagkode får en klasse (`src/modules/fag/klasser.ts`):
  - **vanlig:** ordinært fag i minst ett tilbud, og all yrkesfaglig fordypning.
  - **variant:** alternativ for særskilte grupper, f.eks. samisk, tegnspråk, kort botid og morsmål.
  - **bedrift:** bare i opplæring i bedrift.
  - **andre:** alt annet, f.eks. fag uten timetall eller læreplan, vurderingskoder og individuell opplæringsplan.
- Fagsøket viser de vanlige fagene. Under «Vis også» kan brukeren slå på hver av de andre klassene. Valget står i adressen (`vis=`). Antallet som er skjult, står ved valget.
- Et søk på en hel fagkode viser alltid faget.
- *(Endret etter eiers gjennomgang 01.10.2026:)* «Vis også» er lukket til brukeren åpner den. Der kan også «Vanlige fag» tas bort (`vanlige=nei` i adressen), så søket bare viser f.eks. variantene. Fag med samme navn i treffene får tilbudet (programområdet) etter fagkoden, f.eks. «HEA2005 · Helsearbeiderfag».
- Uten fritekst grupperes treffene etter fagtype. Yrkesfaglig fordypning står først når et yrkesfaglig program er valgt. Grupper med mer enn 12 fag deles etter læreplan, og de delene er lukket til brukeren åpner dem.
- Søket på forsiden gir fag utenom de vanlige lavere vekt (0,4), så de kommer lenger ned, men de finnes fortsatt.
- Det tar om lag ett sekund å bygge alle tilbudene. Rollene regnes derfor ut når appen bygges, i Vite-modulen `virtual:fagroller`. Modulen inneholder også titlene på læreplanene, som brukes til gruppene. Den bruker fag- og timefordelingen som gjelder på byggedatoen og følger dataene hver gang appen bygges, uten en egen fil i `data/`.
- Kan rollene ikke lastes, vises alle fagene, som før.

**Konsekvens:** Søket blir kortere og lettere å lese, og ingen fag blir umulige å finne. Endres tilbudsmodellen, endres også hvilke fag som er vanlige.

**Endret 09.10.2026:** Alle gruppene i fagsøket (fellesfag, felles programfag, valgfrie programfag og yrkesfaglig fordypning) er lukket når siden åpnes, og siden husker hvilke som er åpne (eier 09.10.2026, avgjørelse 072).
