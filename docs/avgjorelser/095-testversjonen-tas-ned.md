# 095 – Testversjonen tas ned når en versjon publiseres

**Kontekst:** Testversjonen under `test/` (avgjørelse 045) ble liggende til noen slettet grenen `test`. Etter 1.0.3 viste den fortsatt en skisse som var tatt inn i appen. Eier vil at testversjonen tas ned hver gang en versjon er publisert (09.10.2026).

**Valg:**
- **Hva som teller som en versjon:** publiseringer med tag, det vil si en ny versjon fra «Sett versjonstag», en tag pushet for hånd eller en tilbakerulling med «Publiser». Publiseringer uten tag (kildesjekken, nyhetene, lokale regler og push til `test`) beholder testversjonen.
- **Bygget:** «Publiser» bygger ikke testversjonen når den publiserer en versjon, så `test/` forsvinner med den samme publiseringen.
- **Grenen:** Etter publiseringen starter «Publiser» arbeidsflyten «Testversjon» med `ta_ned`, som sletter grenen `test`. Ellers ville neste publisering uten tag ta testversjonen med igjen. Slettingen ligger i «Testversjon», fordi den trenger å skrive til repoet, og arbeidsflytene som kaller «Publiser», bare gir lesetilgang.

**Konsekvens:** Etter en ny versjon finnes ingen testversjon før noe nytt pushes til `test`. En gren som pushes til `test` mens en versjon publiseres, kan bli slettet, og må da pushes på nytt.
