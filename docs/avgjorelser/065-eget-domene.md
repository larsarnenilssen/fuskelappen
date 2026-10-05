# 065 – Eget domene: jukselappen.no

**Kontekst:** Eier har kjøpt jukselappen.no hos Webhuset og vil ha appen der (05.10.2026). Appen lå på `https://larsarnenilssen.github.io/jukselappen/`. Med eget domene ligger appen i roten (`/`), ikke under `/jukselappen/`, og GitHub sender den gamle adressen videre til den nye. Lagringen i nettleseren hører til adressen, så innstillinger og favoritter blir ikke med av seg selv. En app som er lagt på hjemskjermen fra den gamle adressen, får heller ikke nye versjoner etter flyttingen, fordi service workeren ikke kan oppdateres gjennom en videresending.

**Valg:**
- **Adressen er `https://jukselappen.no/`.** `www.jukselappen.no` sendes videre dit av GitHub. Testversjonen blir `https://jukselappen.no/test/`.
- **Bygget følger innstillingene for GitHub Pages:** «Publiser» henter stien med `actions/configure-pages` og gir den til bygget i `PAGES_BASE` (`vite.config.ts`): tom med eget domene, `/jukselappen` på github.io. Domenet tas i bruk under Settings → Pages, og så publiseres appen på nytt. Koden trenger ingen endring når domenet tas i bruk. Et steg stopper publiseringen hvis GitHub oppgir en github.io-adresse uten sti.
- **Flyttevarsel på den gamle adressen:** Appen spør etter en fil som ikke finnes, uten å følge videresendingen (`src/app/flytting.ts`). Før flyttingen gir det «ikke funnet», etter flyttingen en videresending. Det gjøres bare på github.io. Da vises et varsel med «Åpne den nye adressen».
- **Innstillingene blir med:** Lenken i varselet har innstillingene og favorittene (samme innhold som «Last ned kopi», kodet i adressen). Under Innstillinger på den nye adressen spør appen om de skal tas med, og fjerner dem fra adressen. Ingenting sendes andre steder.
- Lokalt og i ende-til-ende-testene ligger appen fortsatt under `/jukselappen/` (`app.base`).

**Konsekvens:**
- Versjonen med flyttevarselet (0.36.1) må være publisert før domenet tas i bruk, og helst åpnet en gang på de enhetene som har appen. Eldre installerte versjoner viser ikke varselet og må legges til på nytt fra den nye adressen.
- Eldre versjoner enn 0.36.1 kan ikke publiseres på nytt etter at domenet er tatt i bruk (de bygges under `/jukselappen/`).
- Installerte apper må legges til på hjemskjermen på nytt fra den nye adressen.
- Stegene for eier står i `docs/EIER.md`, punkt 16. Domenet ble tatt i bruk 05.10.2026.
