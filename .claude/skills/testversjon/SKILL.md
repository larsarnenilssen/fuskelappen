---
name: testversjon
description: Legge ut en gren som testversjon på jukselappen.no/test/, så eier kan prøve den på mobil og skrivebord før den flettes eller før en versjon avtales. Brukes når eier vil se en endring, eller når en endring i utseende eller flyt bør prøves på ekte enheter.
---

# Testversjon

Testversjonen er grenen `test`, bygget og lagt under `test/` ved siden av appen (avgjørelse 045 og 065). Appen selv endres ikke.

## Legg ut

1. Grenen skal ha grønne lokale sjekker: `npm run lint`, `npm run typecheck`, `npm test` og `npm run test:e2e:berorte`.
2. Push grenen til `test`:

   ```sh
   git push origin <gren>:test --force
   ```

3. «Testversjon» (`testversjon.yml`) starter «Publiser» fra `main`, som bygger appen og testversjonen (`npm run build:test`, `TESTVERSJON=1`) og publiserer begge. Følg kjøringen under Actions. Feiler bygget av testversjonen, publiseres appen uten den.
4. Gi eier adressen: **https://jukselappen.no/test/**. Den har navnet «Jukselappen test», en linje øverst om at det er en testversjon, og egen lagring, så testing ikke endrer innstillingene og favorittene i appen. Den kan legges på hjemskjermen som en egen app. Den lenkes ikke fra appen, men er åpen for den som kjenner adressen.

Ny commit på grenen: push til `test` på nytt. Bare én gren kan være testversjon om gangen. Kildesjekken, nyhetene og lokale regler tar testversjonen med når de publiserer.

## Tas ned

- **Av seg selv** når en versjon publiseres (tag eller tilbakerulling): `test/` bygges ikke, og grenen `test` slettes (avgjørelse 095). Er grenen pushet mens en versjon publiseres, kan den bli slettet og må pushes på nytt.
- **For hånd:** Actions → Testversjon → Run workflow med `ta_ned`.
