# 104 – Sikkerhetskopien kan gjenopprettes

**Kontekst:** Lagringen tar vare på råteksten under `jukselappen-sikkerhetskopi` før data den måtte rette eller ikke kunne lese, blir overskrevet (avgjørelse 097). Brukeren kunne ikke hente kopien tilbake, bare lese den i utviklerverktøyene. Eier har sagt ja til en måte å gjenopprette den på (09.10.2026).

**Valg:**
- `lesSikkerhetskopi()` i `src/core/lagring/lagring.ts` leser kopien felt for felt, som de lagrede dataene. Mangler den, eller kan den ikke leses av denne versjonen (ødelagt JSON, ukjent eldre eller nyere skjemaversjon), gir den null.
- `gjenopprettSikkerhetskopi()` bytter kopien og det som er lagret: kopien blir de lagrede dataene, og det som var lagret, blir den nye kopien. Gjenopprettingen angres ved å gjøre det samme én gang til. Kan den nye kopien ikke skrives, skrives det gjeldende tilbake, og ingenting er endret.
- I Innstillinger, under «Dine data», står en kort forklaring og knappen «Gjenopprett sikkerhetskopien» (nynorsk «tryggleikskopien») bare når kopien er gyldig og ulik det som er lagret nå (`sammeData()`, uavhengig av rekkefølgen på feltene). Knappen ber om bekreftelse med `window.confirm`, som «Hent inn kopi» og «Slett alle lokale data», og gir en kort melding etterpå.
- **Uten tidspunkt:** Kopien er råteksten slik den lå lagret, og har ikke noe tidspunkt. Et tidspunkt ville kreve et nytt format eller en egen nøkkel. Forklaringen sier i stedet hva kopien har: antall favoritter og antall egne lokale regler.

**Konsekvens:** Data som ble rettet bort eller erstattet, kan hentes tilbake uten utviklerverktøy. Etter en gjenoppretting finnes det alltid en kopi (det som var lagret før), så knappen står til innholdet er det samme eller brukeren sletter alt. En kopi fra en nyere skjemaversjon kan ikke gjenopprettes av denne versjonen, men av en versjon som kan lese den.
