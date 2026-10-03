# 052 – utdanning.no som kontrollkilde, og merking når kildene er uenige om løpene

**Kontekst:** Grep og VIGO er ikke enige om alle løpene i videregående (avgjørelse 051). Eier ba 03.10.2026 om at utdanning.no (HK-dir) tas inn som tredje kilde i kontrollen, at løp kildene er uenige om merkes i appen etter en fast regel som også varsler når uenighetene endrer seg, og at tilbudene lenker til utdanning.no.

**Valg:**
- **Henting:** `scripts/hent-utdanning.ts` går hver uke gjennom løpstreet i `https://v3.api.utdanning.no/vgs/lop` fra hvert Vg1 og lagrer koblingene i `data/utdanning/lop.json`. Hentingen kontrolleres før dataene tas inn, og endringer kommer i kontrollsaken (kilden `utdanning-no`).
- **Lisens:** API-et er «åpent api for interne tjenester på utdanning.no», ikke versjonert og uten lisens. Løpene brukes derfor bare til kontroll og lenker, og innholdet vises ikke. Yrkes- og utdanningsbeskrivelsene fra utdanning.no er åpne data under NLOD (data.norge.no) og kan brukes med kreditering, hvis eier vil.
- **Regelen for samsvar** (`src/modules/fag/tilbud/kildesamsvar.ts`): en kilde har en mening om koblingen fra → til bare når den beskriver løpet ved den ene enden (Grep: `til` har «bygger på»; VIGO: `fra` har grunnlag for inntak; utdanning.no: `fra` står med løpet videre). En kilde med mening som ikke har koblingen, er uenig. Koder bare utdanning.no har (f.eks. PBPBY4YK), regnes som programområdet i Grep med de samme seks første tegnene.
- **Merking i appen:** Hvert løp i Opplæringsløp der en kilde er uenig, får «Står ikke i …» i ravfarge, og siden har en lukket forklaring. Overgangen med yrkesfaglig opphenting merkes ikke, fordi eier har bekreftet ordningen (avgjørelse 051).
- **Varsel:** `npm run tilbud:rapport` skriver alle uenighetene til `data/status/lopsamsvar.json` og viser dem gruppert i docs/TILBUDSSTRUKTUR.md. Nye uenigheter siden forrige uke blir punkter i kontrollsaken, og uenigheter som er borte, står til orientering. Slik varsles hver endring, uten at de samme uenighetene gjentas hver uke.
- **Lenke:** Tilbud utdanning.no har en side for, lenker dit fra boksen «Vilbli og utdanning.no».

**Konsekvens:** Regelen gjelder alle løp, også nye. Er en kilde ny eller borte, påvirker det bare løpene den beskriver.
