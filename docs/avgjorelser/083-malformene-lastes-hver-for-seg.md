# 083 – Målformene lastes hver for seg

**Kontekst:** Startpakken var 149,4 kB gzip med grense 150 kB (avgjørelse 082). Tekstene på bokmål og nynorsk lå begge i startpakken, om lag 32 kB hver, selv om brukeren bare ser den ene. Nyhetene og tekstene deres skal komme på toppen (fase 7b).

**Valg:**
- `nb.ts` og `nn.ts` importeres dynamisk i `core/i18n/tekst.ts` og blir hver sin fil. Ved oppstart lastes bare målformen brukeren har valgt (`lastTekster`), og appen tegnes når den er lastet.
- `index.html` legger inn en `modulepreload` for den valgte målformen, så tekstene hentes samtidig med resten av appen og ikke etter. Byggesteget fyller inn filnavnene (`htmlPlugin`).
- Ved bytte av målform lastes den andre før endringen vises (`Tilstand.sett`).
- Par med begge målformene (`begge`, `latBegge`) slås opp når de leses, så den målformen som ikke er lastet, ikke låses til den andres tekst.
- Søkeindeksen, utviklingssøket og enhetstestene laster begge (`lastAlleTekster`).
- Størrelsessjekken regner med den største av de to tekstfilene, fordi den lastes ved oppstart.

**Konsekvens:** Startpakken er om lag 119 kB, med den ene målformen regnet med. Uten nett virker byttet som før, fordi begge filene ligger i appens hurtigbuffer. Neste store besparelse er å dele tekstene per modul, så de lastes med sidene.
