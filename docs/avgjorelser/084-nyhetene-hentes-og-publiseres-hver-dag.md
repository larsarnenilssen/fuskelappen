# 084 – Nyhetene hentes og publiseres hver dag

**Status:** Forslag til eier 07.10.2026. Koden for hentingen er laget for å prøve kildene og filteret. Arbeidsflyten og publiseringen lages når eier har sagt ja.

**Kontekst:** Fase 7b skal vise siste nytt fra myndighetene, fagpressen og organisasjonene. Nyheter er ferskvare. Dataene fra de andre kildene går via den ukentlige kildesjekken og kontrollsaken (avgjørelse 020 og 063), og en ny versjon av appen krever tag. Eier har sagt ja til at nyhetsfilen publiseres daglig uten PR når den passer skjemaet (06.10.2026). Appen gjør ingen eksterne kall (AGENTS.md).

**Valg:**
- **Henting:** `scripts/hent-nyheter.ts` (`npm run hent:nyheter`) henter kildene i `content/nyheter/kilder.yaml` med én forespørsel per kilde: en RSS- eller Atom-feed, eller nyhetslisten på én side (Udir og Utdanningsforbundet). Den lagrer kilde, tittel, dato, lenke og ingress, ingen bilder og ingen hele tekster. Den henter aldri sidene til de enkelte sakene. User-Agent er den samme som i kildesjekken.
- **Filter:** Kilder som også skriver om barnehage, grunnskole og høyere utdanning (`filter: vgs`), filtreres med ordlistene i `kilder.yaml`. Sterke ord (f.eks. «videregående», «lærling», «opplæringslova») tar med saken. Generelle ord (f.eks. «skole», «elev») tar den med når ingen ord om de andre delene av utdanningen står der. Et ord om en annen del i tittelen utelukker saken når tittelen ikke har et sterkt ord. Eier kan endre ordene uten kodeendring.
- **Svikt:** Feiler en kilde, eller gir den null saker, beholdes sakene fra før, og kilden får `feilet` eller `tom` med datoen det startet. Siden viser det ved kilden. Sakene som har falt ut av en feed, beholdes også, til de er 90 dager gamle (høyst 25 per kilde).
- **Filen:** `data/nyheter/nyheter.json` ligger ved siden av appen og hentes når nyhetene vises, ikke med appen. Slik gir en ny dag med nyheter ingen ny versjon av appen og ikke noe varsel om oppdatering. Service workeren henter den med `NetworkFirst`, så appen uten nett viser forrige liste.
- **Arbeidsflyt (ny, `nyheter.yml`):** hver dag kl. 05.47 norsk tid. Den kjører hentingen og testene for nyhetene. Er filen endret og passer skjemaet, committes bare den filen til `main` uten PR (som kildestatusen i dag), og publiseringen (`deploy.yml`) startes. Publiseringen tar med `data/nyheter` fra `main`, som den gjør med kildestatusen og registerdataene.
- **Kildestatus:** Arbeidsflyten skriver status for nyhetskildene i nyhetsfilen. Den ukentlige kildesjekken tar dem med i Kildestatus og kontrollsaken, så en kilde som har feilet i flere dager, merkes.

**Konsekvens:** Publiseringen går hver dag i stedet for hver uke. Det er om lag fem minutter i Actions per dag. Nyhetene er aldri mer enn et døgn gamle, og ingenting annet i appen endres uten PR. En kilde som endrer formatet, gir status `tom` i stedet for en tom liste.
