# 082 – Stiler som lastes med sidene

**Kontekst:** Startpakken har en grense på 150 kB gzip, som sjekkes ved bygg. Med 0.41.0 (statistikken, panelet på forsiden og tekstene på begge målformer) ble den 156 kB.

**Valg:**
- Manifestet til statistikkmodulen henter adressen fra `adresse.ts`, ikke fra komponentene. Manifestene lastes med en gang, og komponentene kom ellers med i startpakken.
- Tallene i panelet på forsiden lastes når visningen vises, sammen med dataene (`Forsidepanel.tsx`).
- Stiler som bare brukes på én side eller i én modul, står i egne filer i `src/styles/` og importeres av siden eller komponentene. Vite legger dem i en egen fil som lastes med siden. Det gjelder `statistikk.css`, `elevundersokelsen.css`, `skolemiljo.css` (kapittel 12 og skolereglene) og `fravaer.css` (reglene der alle klassene er sidens egne). Felles stiler blir i `base.css`.
- Fargene står fortsatt bare i `tokens.css` (testes for alle CSS-filer i `src/`).

**Konsekvens:** Startpakken er 149,4 kB. Nye sider med mye egen stil bør få en egen CSS-fil på samme måte. Stilene i en slik fil kommer etter `base.css`, så de vinner ved lik spesifisitet. Neste store besparelse er å laste nynorsk bare når den er valgt.
