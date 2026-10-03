# 041 – Veiviseren: steg som innhold, tilstand i adressen

**Kontekst:** Fase 4, pakke 1. Veiviseren skal vise en prosess steg for steg med spørsmål, utfall, ansvar, dokumentasjon, frister, kilder og forklaring. Den skal kunne brukes med tastatur og skjermleser, kunne deles som lenke og gjenbrukes i fase 5–7. Eier vil at appen skal gi raskere oversikt enn kildene, med visualisering der det passer (03.10.2026).

**Valg:**
- **Innhold:** Veiviseren (`type: veiviser`) og hvert steg (`type: steg`) er vanlige innholdselementer i `content/<modul>/`. Hvert steg har da egen `kontrollert`, egne kontrollspørsmål og egne kilder, og kommer med i kontrolloversikten og kontrollsakene uten ny kode. Steg på fylkes- eller skolenivå kan erstatte eller supplere et nasjonalt steg med samme id.
- **Steget:** tekst, og om det trengs `ansvar`, `dokumentasjon`, `frist`, `forklaring` (skjult til den åpnes) og `paragrafer` (`opplaeringslova/11-2`), som vises som lenker til paragrafen i Regelverk, med tittel. Steget går til `neste`, eller stiller et spørsmål der hvert svar har sitt neste steg. Et steg uten noen av delene er et utfall.
- **Gangen** er rene funksjoner i `src/core/veiviser/veiviser.ts`. Adressen har steget og svarene (`?steg=ti-nok&svar=tvil`), og veien regnes ut fra starten. Et svar kan føre tilbake til et tidligere steg. En adresse som ikke stemmer, gir det siste steget den fører fram til, med en merknad. Testene sjekker at alle steg kan nås, at ingen peker på steg som ikke finnes, og at paragrafene finnes i Regelverk.
- **Visning:** Øverst står en fasestolpe med ferdige, gjeldende og senere faser. Under den står veien hit som en linje med punkter, der hvert punkt er en lenke tilbake og viser svaret som ble valgt. Det gjeldende steget står som et kort på samme linje. Ansvar, dokumentasjon og frist står i egne felt med ikon, så de kan leses med et blikk. Svarene er store lenkeknapper. Et utfall har grønn kant og en knapp som kopierer oppsummeringen av veien.
- **Navigasjon:** Hvert svar og hvert «Neste» er en lenke og en ny oppføring i historikken, så «tilbake» virker som vanlig. Fokus flyttes til overskriften i det nye steget. Skallet gir nå sidetittelen fokus bare én gang per side, så det ikke tar fokus fra steget når bare spørringen i adressen endres. Sider som laster data, får fokus på tittelen når den kommer.

**Tillegg etter eiers innspill (03.10.2026):** Kortene var høye, og knappene druknet nederst i kortet.
- Kildene er lukket bak «Kilder (n)», og «Mer om dette steget» står som en lav rad over dem, nederst i kortet.
- Spørsmålet og svarknappene står under kortet som veien videre, med større tekst. Et steg uten spørsmål har én fylt «Neste»-knapp.
- Et trykk på et svar gir neste kort der knappene sto. Siden ruller ikke til toppen, men glir fram til det nye kortet, med det siste punktet på veien synlig over. Går brukeren tilbake, gjenoppretter historikken posisjonen.
- På stor skjerm (fra 64rem) står prosessen i en kolonne til venstre som følger med ved rulling: fasene som punkter på en linje, med stegene på veien under hver fase og det gjeldende steget markert. Kortet og knappene står til høyre, og svarknappene står side om side.

**Konsekvens:** En ny veiviser i fase 5–7 er bare innhold i YAML og en side som viser komponenten. Ingressen står bare på starten, så stegene kommer høyt opp på skjermen.

**Tillegg i pakke 2 (03.10.2026):**
- **Kartet «Hele prosessen»** under knappene viser stegene i hver fase med fristene som merker («Klage: 3 uker», «Hvert år»). Det er åpent på første steg, så brukeren ser hele løpet med en gang. Hvert steg er en lenke dit, med den korteste veien fra starten (`korstesteVei`). Steget kan ha `fristKort` til merket.
- **Utfall:** Eier forsto ikke de grønne «Resultat»-merkene (foreløpig, ønsket eller eneste mulighet?). Et utfall er der veien ender, avhengig av svarene. Kortet heter nå «Her ender veien» og har nøytral kant og et flagg. I kartet står utfallene for seg sist i hver fase under «Veien kan ende her», med stiplet linje og flagg. Grønt brukes bare om steg brukeren har gått gjennom.
- **Navn:** Veiviseren heter «Tilpasset opplæring og individuell tilrettelegging», fordi alle elever skal ha tilpasset opplæring og bare noen få trenger individuell tilrettelegging (eier 03.10.2026).
