# 009 – Fagsøk og skjematilstand i kalkulatorene

**Kontekst:** Eier fant kalkulatorene i 0.2.0 tungvinte: fag måtte velges fra en lang nedtrekksliste med vedleggets forkortelser, skjemaene krevde mye scrolling, og det utfylte forsvant når man gikk til en kilde og tilbake.

**Valg:**
- **Fagsøk:** søkefelt med trefflister i stedet for nedtrekksliste. Søket (`src/modules/arbeidstid/fagsok.ts`) matcher fag, program, trinn, fulle navn, fagkodeprefikser (ENG, REA …), programområder fra Grep (BAT, HEA …) og kallenavn (1P, R1, Biologi 2). Søkeordene står som data i `rules/sfs2213/fagsok-2026-2027.yaml`, med kilde i Grep. Programområdene og fagnavnene hentes med `npm run hent:grep` til `data/grep/programomrader.json` og `data/grep/fagkoder.json` (bare videregående og bare prefiksene søket bruker). Et programfag knyttes til trinnet med første siffer i fagkoden (HEA2005 → Vg2). Programområdekoden i Grep er utdanningsprogram + fagkodeprefiks + trinn (BABAT1 = BA, BAT, Vg1), så koblingen hentes, den gjettes ikke. Søket brukes bare til å finne raden. Beregningen bruker årsrammen i raden brukeren velger.
- **Brytere** for valg med få alternativer (årstimer/økter, 45/60/90 minutter, 15 eller færre elever, vikartype, lønn). Beregningene godtar både elevtall og ja/nei for små klasser.
- **Skjematilstand i nettleserhistorikken** (`history.state`). Det utfylte står der når brukeren går tilbake, men lagres ikke på enheten og deles ikke.

**Konsekvens:** Nye kallenavn eller koder legges til i regelfilen uten kodeendring. Fase 2 bygger videre på `hent:grep` og erstatter søkeordene med den fulle koblingen fra fagkode til årsramme.
