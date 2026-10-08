# 092 – Merker og ikoner midt i teksthøyden

**Kontekst:** Eier så at merker og ikoner ved tekst står øverst i teksthøyden og ikke midt i (08.10.2026). Eksempler er pilen i «Mer i Videregående i tall ›» og merkene «SSB» og «Udir». Eier ba om at det rettes i hele appen, og at det holder seg slik. Ikonene sto på grunnlinjen, og ti steder hadde egne småjusteringer (−0,15em, −0,1em, −0,05em, −1px og +0,1em).

**Valg:**
- **I løpende tekst** står ikoner, merker og fargeruter med `vertical-align: middle`, så midten står ved midten av bokstavene. `.ikon` har det som standard, og småjusteringene er fjernet.
- **I flex og grid** plasseres de av beholderen med `align-items: center`.
- **Lenker med pil etter teksten** (`pil-lenke`) er en inline-flex, så pilen står midt i teksthøyden og understreken bare går under teksten.
- **Testen** `tests/e2e/teksthoyde.spec.ts` måler alle ikoner og merker i løpende tekst på alle rutene. Avviket fra midten av bokstavene må være høyst 1,5 px. Den kjøres sammen med overflyten for de berørte rutene.

**Konsekvens:** Et nytt ikon eller merke i tekst trenger ingen egen plassering. En egen `vertical-align` gir feil i testen.
