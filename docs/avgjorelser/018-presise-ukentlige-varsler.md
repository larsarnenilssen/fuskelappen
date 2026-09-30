# 018 – Presise ukentlige varsler og registerdata som oppdateres automatisk

**Kontekst:** Dette er steg 2 i kontrollsystemet (avgjørelse 017). Eier ville ha varsel én gang i uken, vite nøyaktig hva som er endret og hva i appen det kan berøre, og at registerdata tas inn og publiseres automatisk når testene består (30.09.2026).

**Valg:**
- **Hva som er endret:** Teksten fra hver kilde deles i setninger. Sist kilden var godkjent (status `ok`), lagres et kort fingeravtrykk per setning i `data/status/kildetekst.json`. Selve teksten lagres ikke, fordi flere kilder har opphavsrett. Ved endring viser en sammenligning (lengste felles delsekvens) de nye setningene og punktet de står under. Fjernet tekst kan bare telles.
- **Hva det kan berøre:** Regelverdier og innhold som viser til samme punkt, et underpunkt eller et overordnet punkt. Treffet er grovt med vilje.
- **Tabeller rad for rad:**
  - Vedlegg 1 leses fra HTML-tabellen i dokumentet hos KF Infoserie og sammenlignes rad for rad med regelsettet.
  - Garantilønnen sjekkes mot teksten i hovedtariffavtalen («ansiennitet 545 400 … Laveste årslønn 558 400 …»).
  - Resultatet står i `verdistatus.json`.
- **Én ukentlig kontrollsak** (etikett `kontroll`) i stedet for én sak per kilde:
  - Innhold: endrede kilder, tall og tabeller som ikke stemmer, Grep og kilder som feilet.
  - Avkrysningspunktene har skjulte merker. Steg 5 bruker dem til godkjenning.
  - Saken får en kommentar, og eier dermed e-post, bare når innholdet er nytt. Er alt i orden, lukkes den.
  - De gamle sakene per kilde lukkes.
- **Grep hver uke:**
  - `hent:grep` skriver filene bare ved endring og lagrer endringene.
  - Består testene, tas dataene inn. Ellers legges de gamle tilbake, og kilden `udir-grep` får status `endret`.
- **Publisering av registerdata:** Den ukentlige publiseringen bygger fortsatt koden fra siste versjon, men henter Grep-dataene og skoleregisteret fra main. Består ikke versjonens tester med de nye dataene, brukes versjonens egne.

**Konsekvens:** Eier får én e-post i uken når noe er nytt, med nok informasjon til å avgjøre hva som skal gjøres. Nye fag og årstimetall fra Grep kommer ut i appen uten ny versjon. Lovdata-kilder har ingen tabeller og vises bare med endrede paragrafer. Steg 3–5: kontrollspørsmål og kontrollrunder, automatiske endringsforslag og godkjenning med avkrysning.
