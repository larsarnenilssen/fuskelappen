# 055 – Ende-til-ende: berørte tester lokalt, hele suiten fordelt i CI

**Kontekst:** Hele ende-til-ende-suiten tok over 20 minutter lokalt og rundt 10 i CI. Eier ville at bare berørte tester kjøres lokalt, og at CI kjører alt med flere jobber og workers (04.10.2026). En gjennomgang fant ingen utdaterte tester, men mye som ble gjort to ganger eller kjørt der det ikke hører hjemme: overflyt i mørk visning (mørk visning endrer bare fargene), mobiltester som startet en nettleser på skrivebord bare for å hoppe over seg selv, tre dobbelttester, to tomme sjekker og forsiden to ganger i rutelisten (`#/arbeidstid` sender til forsiden). Eier godkjente forslaget 04.10.2026.

**Valg:**
- **Lokalt:** `npm run test:e2e:berorte` kjører bare testene som berøres av endringene på grenen (mot `origin/main`, også det som ikke er committet), i WebKit mobil. En modul gir spesifikasjonene sine og overflyttesten for rutene sine. Felles kode (skall, komponenter, kjerne, stiler, felles strenger) gir kjernetestene og overflyt for alle rutene. Dokumentasjon, enhetstester og skript gir ingen. Utvalget står i `scripts/e2e/velg.ts`, med enhetstester. `--alle-prosjekter` kjører alle fire oppsettene, og `--vis` viser bare utvalget.
- **CI:** Appen bygges én gang (`bygg-e2e`), og åtte jobber henter bygget (`E2E_FERDIG_BYGD=1`) og kjører med tre workers. Playwright deler etter antall tester i rekkefølge, så hvert oppsett deles for seg: WebKit mobil i fire deler, Chromium mobil i to, skrivebordsoppsettene i én hver. Erstatter delingen i avgjørelse 040.
- **Merking:** Tester som bare gjelder mobil (overflyt i 320–430 px og axe), merkes `@mobil` og listes ikke i skrivebordsoppsettene (`grepInvert` i `playwright.config.ts`).
- **Overflyt** testes bare i lys visning. **axe** testes i lys og mørk, fordi kontrasten avhenger av temaet.
- **Vurdering** har fått en egen spesifikasjon, og sidene er med i rutelisten.

**Konsekvens:** Suiten gikk fra 1 780 til 1 114 kjøringer. En ny modul får en linje i `MODULSPEKER` i `scripts/e2e/velg.ts`, og nye tester som bare gjelder mobil, merkes `@mobil`. En endring er ferdig når de berørte testene er grønne lokalt og hele suiten er grønn i CI.
