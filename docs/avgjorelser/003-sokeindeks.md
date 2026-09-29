# 003 – Søkeindeks og normalisering mellom målformene

**Kontekst:** Søket skal treffe moduler, funksjoner, begreper, regler og fag, bygges ved publisering (kap. 2), tåle skrivefeil og finne «skole» ved søk på «skule» og omvendt (3.6).

**Valg:**
- MiniSearch med prefikssøk og uklart søk (redigeringsavstand 1 for ord over tre tegn).
- `scripts/bygg-sokeindeks.ts` laster modulregisteret gjennom Vite (`ssrLoadModule`) og lagrer indeksen som `sok/indeks.json`. Da brukes nøyaktig samme register som i appen. I utvikling bygges indeksen i nettleseren med samme funksjon.
- Synonymlisten (`content/sok/synonymer.yaml`) gjør nynorske former om til bokmål både ved indeksering og ved søk, også inne i sammensatte ord (`skul` → `skol`).
- Søkekoden og indeksen lastes først når søkefeltet tas i bruk.

**Konsekvens:** Nye ord med ulik form på bokmål og nynorsk må legges i synonymlisten. Kompetansemål får egen indeks i fase 2.
