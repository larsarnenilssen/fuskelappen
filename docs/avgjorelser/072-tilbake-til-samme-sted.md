# 072 – Tilbake til samme sted: åpne kort og rulleposisjon huskes for siden

**Kontekst:** Mange følger lenkene under «I regelverket» og «Kilder» for å sjekke en paragraf, og går tilbake. Da var kortene lukket igjen, og siden sto ikke der den var, fordi innholdet lastes etter at siden er tegnet. Eier ba 06.10.2026 om at det samme kortet og plasseringen på siden huskes, så brukeren slipper å rulle og åpne kortet på nytt.

**Valg:**
- **Åpne kort huskes:** `useHusketApen` (`src/components/husket.ts`) lagrer i nettleserhistorikken for siden hva som er åpent. Lagringen skjer i `history.state`, som de sammenlagte kortene (`Sammenlegg.tsx`), ikke på enheten.
  - Det gjelder innholdskortene, de lukkede kortene, forklaringene og radene «I regelverket» og «Kilder».
  - Det gjelder også fylkesboksen, de lokale boksene i veiviserne og kortene i Kalenderen.
  - Nøkkelen er id-en eller tittelen. Radene nederst bruker kortets id, eller får en nøkkel laget av kildene.
- **Rulleposisjonen:** Tilbake gjenoppretter posisjonen som før (`ruter.ts`). Er siden for kort med en gang, prøves det igjen mens siden vokser. Det stopper når siden står der den var, når brukeren ruller selv, eller etter tre sekunder.
- **Steget og fanen** i veiviserne og sidene står fortsatt i adressen, som før.
- **Regelen** står i AGENTS.md: nye kort og bokser som kan åpnes, bruker `useHusketApen`.

**Konsekvens:** Det som er åpent, huskes bare for den oppføringen i historikken. En ny lenke til samme side åpner den som ny. Tilbake fra en side i en ny fane (lenker ut av appen) er ikke berørt.
