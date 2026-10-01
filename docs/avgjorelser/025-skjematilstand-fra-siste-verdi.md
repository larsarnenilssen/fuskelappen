# 025 – Skjematilstand oppdateres fra siste verdi

**Kontekst:** Kalkulatorene oppdaterte skjemaet med verdien som ble vist sist (`sett({ ...s, felt })`, `grupper.map(…)`). Kom to endringer før skjemaet var tegnet på nytt, for eksempel et fagvalg og årstimer rett etter, overskrev den siste den første, og faget eller en gruppe forsvant. Det ga en e2e-test som feilet av og til på CI (PR #30).

**Valg:** `useSkjematilstand` gir `sett`, som tar en ny verdi eller en funksjon av den siste verdien, og `endre`, som fletter felt inn i den siste verdien. Listene i skjemaet (grupper, fagplasser og funksjoner) sender endringer videre som funksjoner (`Oppdater<T>`), så hver endring bygger på den forrige. Nye skjemaer bruker `endre` eller en funksjon, ikke `sett({ ...s, felt })`.

**Konsekvens:** Raske endringer går ikke tapt. En e2e-test gjør to endringer i samme JavaScript-oppgave og sjekker at begge blir med.
