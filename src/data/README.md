# Datalaget

All lasting av data fra kildene i appen går gjennom filene her (avgjørelse 049). Modulene importerer fra filen
de trenger, så lastere som brukes med en gang ikke drar med seg de andre inn i startpakken. Dataene i `data/` hentes hver uke
av skriptene i `scripts/` (kildesjekken, avgjørelse 018) og endres bare av dem. Ingen moduler importerer filer i
`data/` direkte.

| Fil | Kilde | Data | Laster |
|---|---|---|---|
| `grep.ts` | Grep (udir-grep) | fagindeksen, læreplanene, grunnleggende ferdigheter og tverrfaglige temaer, rollene til fagkodene | `lastFagindeks`, `lastLaereplan`, `lastLaereplanverket`, `lastFagroller` |
| `fagfordeling.ts` | Udir-1 | fag- og timefordelingen for skoleåret | `lastFagfordeling` |
| `udir.ts` | udir.no | overordnet del, tilbudene (Grep og Udir-1) | `lastOverordnetDel`, `lastTilbud` |
| `vigo.ts` | VIGO Kodeverksbase | fagrelasjoner, fagmerknader og vitnemålsmerknader | `lastFagrelasjoner`, `lastMerknader` |
| `skolear.ts` | – | skoleåret og valget av fag- og timefordeling etter dato | `iDag`, `skolearFor`, `velgFordeling`, `fordelingsfil` |

Det som regnes ut når appen bygges (Vite-pluginene i `scripts/vite/plugins.ts`), leser de samme filene med
`scripts/data/les.ts`: `virtual:fagsok` (fagsøket i kalkulatorene), `virtual:tilbud` og `virtual:fagroller`.
Lov- og forskriftstekst (`data/lovdata/`) lastes av modulen Lov og forskrift (`src/modules/lov/data.ts`), og
skolelisten (`data/skoler/`) av innstillingene.

Hver laster lastes første gang den trengs og deles av alle (`enGang`). Dataene er ikke i startpakken, bare de små lasterne.
