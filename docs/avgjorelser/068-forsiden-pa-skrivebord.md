# 068 – Forsiden på skrivebord: sidekolonnen

**Kontekst:** «Neste datoer» og favorittene tok mye plass øverst på forsiden på skrivebord. Eier ville ha dem i en egen kolonne, med plass til tre kolonner på hel skjerm og to på halv skjerm på en 15" laptop (fase 6, pakke 5, 05.10.2026). Eier valgte forslag 2 av tre mockuper: bryteren i kolonnen, og en smal skinne når kolonnen er slått av.

**Valg:**
- **Bredder:** Like brede kolonner. Fra 44rem (704 px, halv skjerm med 1440 px eller mer) står gruppene og sidekolonnen side om side, og fra 68rem (1088 px) to kolonner med grupper og sidekolonnen. Smalere står alt i én kolonne, som på mobil, uten bryter. Siden er høyst 92rem bred (`.forside-bred`).
- **Flaten:** Kolonnen har en lys nyanse av temafargen (`--farge-sidekolonne`), bare på skrivebord. I én kolonne har gruppene ingen flate (eier).
- **Står fast og ruller selv:** `position: sticky` under toppfeltet. Høyden (`--kolonne-hoyde`) regnes ut ved rulling, så kolonnen aldri går under skjermkanten og slutter der gruppene slutter. Området med kolonnene er minst like høyt som skjermen, så kolonnen står fast helt til bunnen. Rullefeltet er skjult, og en toning øverst og nederst viser at det er mer (`mer-over`, `mer-under`). `overscroll-behavior: contain` hindrer at siden bak ruller videre.
- **Bryteren** er en skyvebryter (`role="switch"`, som i Arbeidsplan) fast øverst i kolonnen. Valget lagres i `forside.skjult` (`sidekolonne`). Slått av står en smal skinne med bryteren og knapper for «Neste datoer» og favorittene (med antall), som åpner kolonnen igjen. Gruppene får så mange kolonner som får plass.
- **Datoen over tittelen** i «Neste datoer» når kolonnen er smal, med en container query (`@container sidekolonne`).
- **«Tilpass»:** Med sidekolonnen står «Neste datoer» og favorittene i en egen del med bryteren og sin egen rekkefølge. Plassen i den felles rekkefølgen beholdes (`flyttInnenfor`), så de står der brukeren satte dem når vinduet blir smalt.
- **«Bare favoritter»:** Ingen sidekolonne. Er kalenderen favoritt, står «Neste datoer» øverst i stedet for et kort for kalenderen.

**Konsekvens:** Bredden avgjøres av `matchMedia` i `Forside.tsx` (`SIDEKOLONNE_FRA`) og av mediespørringene i `base.css`. De må endres sammen. Ende-til-ende-testene på skrivebord (1280 px) ser sidekolonnen, og testene som gjelder én kolonne, setter mobilbredde selv.

**Endret 09.10.2026:** Bryteren og den smale skinnen er tatt bort. Øverst i kolonnen står Aktuelt, som lukkes med pilen i overskriften, og favorittene under. Er Aktuelt skjult og det ikke er favoritter, er det ingen sidekolonne, og gruppene får hele bredden. `sidekolonne` i `forside.skjult` gir Aktuelt lukket (avgjørelse 102).
