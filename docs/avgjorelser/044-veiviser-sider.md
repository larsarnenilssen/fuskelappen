# 044 – Veiviseren: én side per valg, og mindre rulling

**Kontekst:** Eier så 03.10.2026 at veiviserne hadde mange steg uten valg, der brukeren bare trykket «Neste». I «Hvilken søkerkategori?» hadde 13 av 29 steg bare «Neste», og den vanligste veien hadde 12 kort. Eier ba om at informasjonen ble samlet der det ikke er valg, at løsningen skulle gjelde alle veiviserne, og at tiltak mot lang rulling skulle vurderes for veiviserne generelt, så de forblir like.

**Valg:**
- **Én side per valg.** Steg uten spørsmål står på samme side som spørsmålet eller utfallet de fører til (`finnSide` i `src/core/veiviser/veiviser.ts`). Brukeren trykker bare der det er et valg, og «Neste»-knappen er borte. Adressen peker på det første steget på siden. En adresse som peker på et annet steg på siden, gir samme side, så gamle lenker og kartet virker.
- **Hvert steg på siden** står som en egen del i samme kort, med tittel, tekst, felt for ansvar, dokumentasjon og frist, paragrafer og egne rader for «Mer om dette steget» og kildene. Den første delen har «Steg n», der n er nummeret på siden. Utfallet har flagget «Her ender veien».
- **Titler på steg med valg er et emne** («Elever med kort botid»), fordi spørsmålet står over knappene.
- **Mindre rulling:**
  - Paragrafene står kompakt: numrene side om side under navnet på loven eller forskriften. Tittelen står i tipset og i navnet til lenken for skjermlesere.
  - Lokale bokser («I Vestland») er lukket til brukeren åpner dem. Stedet og tittelen står alltid synlig.
  - «Veien hit» viser de to siste valgene. Resten vises med «Vis hele veien».
  - Under knappene står «Tilbake til …», med lenke til forrige valg, og nederst «Til toppen».
- **Vurdert, men ikke valgt:** en egen fast verktøylinje med fram og tilbake. Nettleserens tilbakeknapp og lenken under knappene dekker det samme, og en ekstra fast linje tar plass på små skjermer. Å lukke teksten i stegene uten valg er heller ikke valgt, fordi teksten er det brukeren trenger.

**Konsekvens:** Alle veiviserne har færre sider uten nye tekster. «Hvilken søkerkategori?» har 23 steg. Den vanligste veien er 7 sider med 6 trykk, og siden der veien ender, er omtrent tre skjermhøyder på mobil med Vestland valgt. Før var det fem.
