# 012 – Arbeidsplan, stor visning og nye vinduer

**Kontekst:** Eier ønsket å gi hovedkalkulatoren navnet Arbeidsplan, å kunne vise diagrammet større, og å kunne ha flere kalkulatorer åpne i hvert sitt vindu på skrivebordet (tilbakemelding på 0.4.0).

**Valg:**
- **Navn:** bare visningsnavnet er endret. Id og adresse er fortsatt `stillingsplan`, så favoritter, lenker, lagrede varianter og fasittester virker som før.
- **Stor visning:** bruker nettleserens fullskjerm (`requestFullscreen`) på diagram og tabell. Esc eller tilbakeknappen lukker. Safari på iPhone har ikke fullskjerm for slike elementer, og der vises ikke knappen. Vi lager ikke et eget lag med egen rulling, så regelen om ett scrollområde holder.
- **Nytt vindu:** `window.open` med et eget vindusnavn per vindu. Det nye vinduet leser skjemaet fra vinduet som åpnet det (samme opphav), og har deretter sin egen tilstand. Ingenting lagres eller sendes ut av enheten. Knappen vises bare på bred skjerm med mus (`hover: hover` og `pointer: fine`).

**Konsekvens:** Ingen nye avhengigheter. Ender id-en en gang, må favoritter og varianter migreres.
