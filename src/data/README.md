# Datalaget

All lasting av data fra kildene i appen går gjennom filene her (avgjørelse 049). Modulene importerer fra filen
de trenger, så lastere som brukes med en gang ikke drar med seg de andre inn i startpakken. Dataene i `data/` hentes hver uke
av skriptene i `scripts/` (kildesjekken, avgjørelse 018) og endres bare av dem. Ingen moduler importerer filer i
`data/` direkte.

| Fil | Kilde | Data | Laster |
|---|---|---|---|
| `grep.ts` | Grep (udir-grep) | fagindeksen, læreplanene, grunnleggende ferdigheter og tverrfaglige temaer, rollene til fagkodene | `lastFagindeks`, `lastLaereplan`, `lastLaereplanverket`, `lastFagroller` |
| `fagfordeling.ts` | Udir-1 | fag- og timefordelingen for skoleåret | `lastFagfordeling` |
| `udir.ts` | udir.no, NOR | overordnet del, tilbudene (Grep og Udir-1), opplæringskontorene | `lastOverordnetDel`, `lastTilbud`, `lastOpplaeringskontor` |
| `utdanning.ts` | utdanning.no, VIGO | skolene og tilbudene deres (med organisasjonsnummer fra VIGO), yrkene | `lastSkoler`, `lastYrker` |
| `ndla.ts` | NDLA | fagene på NDLA per fagkode | `lastNdla` |
| `vigo.ts` | VIGO Kodeverksbase | fagrelasjoner (med vurderingen i fagene og avvikene fra Grep), fagmerknader og vitnemålsmerknader | `lastFagrelasjoner`, `lastMerknader` |
| `eksamen.ts` | udir.no og fylkenes sider | eksamensdatoene, hentet i januar og august (avgjørelse 059) | `lastEksamensdatoer` |
| `elevundersokelsen.ts` | Udirs statistikkbank | resultatene fra Elevundersøkelsen for landet, fylkene og skolene, to skoleår (avgjørelse 077) | `lastElevundersokelsen` |
| `statistikk.ts` | Udirs statistikkbank | søkere, elever, formidling, lærekontrakter, fravær, gjennomføring og eksamenskarakterer for landet, fylkene og skolene (avgjørelse 080) | `lastStatistikk` |
| `statistikk.ts` | SSBs statistikkbank | ungdomskullene og framskrivingen, unge utenfor arbeid og utdanning, grunnskolepoeng, KOSTRA, lærerne og 16–18-åringer i videregående for landet og fylkene (avgjørelse 090) | `lastSsb` |
| `kalender.ts` | Lovdata | skoleruta fra fylkenes forskrifter og vedtatte endringer i regelverket, til kalenderen (avgjørelse 066) | `lastSkoleruter`, `lastKommende` |
| `skolear.ts` | – | skoleåret og valget av fag- og timefordeling etter dato | `iDag`, `skolearFor`, `velgFordeling`, `fordelingsfil` |

Det som regnes ut når appen bygges (Vite-pluginene i `scripts/vite/plugins.ts`), leser de samme filene med
`scripts/data/les.ts`: `virtual:fagsok` (fagsøket i kalkulatorene), `virtual:tilbud`, `virtual:skoler` og `virtual:fagroller`.
Lov- og forskriftstekst (`data/lovdata/`) lastes av modulen Lov og forskrift (`src/modules/lov/data.ts`), og
skolelisten (`data/skoler/`) av innstillingene.

Hver laster lastes første gang den trengs og deles av alle (`enGang`). Dataene er ikke i startpakken, bare de små lasterne.
