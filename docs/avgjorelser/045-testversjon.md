# 045 – Testversjon under test/

**Kontekst:** Eier vil teste endringer selv på telefonen før de publiseres som en versjon (03.10.2026). Appen publiseres bare når en versjonstag settes (avgjørelse 029), så det fantes ingen måte å prøve en gren på.

**Valg:**
- **Adresse:** Testversjonen ligger under `test/` ved siden av appen, for eksempel `https://larsarnenilssen.github.io/fuskelappen/test/`. GitHub Pages har bare én publisering per repo, så «Publiser» bygger både den siste versjonen og testversjonen og legger dem i samme publisering.
- **Hva som testes:** grenen `test`. Claude pusher grenen som skal testes dit (`git push origin <gren>:test --force`). Arbeidsflyten «Testversjon» starter da «Publiser» fra main.
- **Bygget:** `npm run build:test` bygger med `FUSKELAPPEN_TEST=1`: egen sti (`/fuskelappen/test/`), navnet «Fuskelappen test», en linje øverst som sier at det er en testversjon, og egen lagringsnøkkel (`fuskelappen-test`), så testing ikke endrer innstillingene og favorittene i appen.
- **Feil:** Feiler bygget av testversjonen, publiseres appen likevel, uten testversjon.
- **Fjerne:** Slett grenen `test` og kjør «Publiser». Den ukentlige kildesjekken publiserer også på nytt, og tar med testversjonen så lenge grenen finnes. Fra 09.10.2026 tas testversjonen ned av seg selv når en versjon publiseres (avgjørelse 095).

**Konsekvens:** Eier kan prøve en endring på sin egen telefon før versjonen avtales. Testversjonen kan legges til på hjemskjermen som en egen app. Den er offentlig tilgjengelig for den som kjenner adressen, men lenkes ikke fra appen.
