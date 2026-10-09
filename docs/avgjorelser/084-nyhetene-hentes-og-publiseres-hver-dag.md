# 084 – Nyhetene hentes og publiseres hver dag

**Status:** Godkjent av eier 07.10.2026 (svar P1 i docs/arbeidsordrer/fase-7b-forslag.md).

**Kontekst:** Fase 7b skal vise siste nytt fra myndighetene, fagpressen og organisasjonene. Nyheter er ferskvare. Dataene fra de andre kildene går via den ukentlige kildesjekken og kontrollsaken (avgjørelse 020 og 063), og en ny versjon av appen krever tag. Eier har sagt ja til at nyhetsfilen publiseres daglig uten PR når den passer skjemaet (06.10.2026). Appen gjør ingen eksterne kall (AGENTS.md).

**Valg:**
- **Henting:** `scripts/hent-nyheter.ts` (`npm run hent:nyheter`) henter kildene i `content/nyheter/kilder.yaml` med én forespørsel per kilde: en RSS- eller Atom-feed, eller nyhetslisten på én side (Udir og Utdanningsforbundet). Den lagrer kilde, tittel, dato, lenke og ingress, ingen bilder og ingen hele tekster. Den henter aldri sidene til de enkelte sakene. User-Agent er den samme som i kildesjekken.
- **Filter:** Kilder som også skriver om barnehage, grunnskole og høyere utdanning (`filter: vgs`), filtreres med ordlistene i `kilder.yaml`. Sterke ord (f.eks. «videregående», «lærling», «opplæringslova») tar med saken. Et generelt ord (f.eks. «skole», «elev») i tittelen, eller minst to ulike i ingressen, tar den med når ingen ord om de andre delene av utdanningen står der. Et ord om en annen del i tittelen utelukker saken når tittelen ikke har et sterkt ord. Sakene fra før vurderes på nytt ved hver henting, så et endret filter gjelder alle. Eier har overlatt vurderingen av ordene til Claude, med konkrete grensetilfeller til eier (07.10.2026).
- **Lovdata:** De vedtatte endringene i regelverket appen har (data/lovdata/kommende.json, som Kalender bruker), står også som nyheter, med tittel og ingress på bokmål og nynorsk. Datoen er datoen endringen ble vedtatt. Ingen ny henting fra Lovdata.
- **Svikt:** Feiler en kilde, eller gir den null saker, beholdes sakene fra før, og kilden får `feilet` eller `tom` med datoen det startet. Siden viser det ved kilden. Sakene som har falt ut av en feed, beholdes også, til de er 90 dager gamle (høyst 25 per kilde).
- **Filen:** `data/nyheter/nyheter.json` ligger ved siden av appen og hentes når nyhetene vises, ikke med appen. Slik gir en ny dag med nyheter ingen ny versjon av appen og ikke noe varsel om oppdatering. Service workeren henter den med `NetworkFirst`, så appen uten nett viser forrige liste.
- **Arbeidsflyt (`nyheter.yml`):** hver dag kl. 05.47 norsk sommertid (04.47 vintertid). Den kjører hentingen og testene for nyhetene. Er filen endret og passer skjemaet, committes bare den filen til `main` uten PR (som kildestatusen), og publiseringen (`deploy.yml`) startes. Publiseringen tar med `data/nyheter` fra `main`, også til testversjonen.
- **Prøvekilder:** Kilder eier vurderer (NRK, forskning.no, NIFU, HKdir, Skolenes landsforbund), står under `prove` i `kilder.yaml`. De hentes bare av `npm run nyheter:prove`, i PR-er som endrer nyhetene og ved manuell kjøring, og rapporten står i sammendraget for kjøringen. Slik kan kilder som er stengt fra skymiljøet, prøves før de tas med.
- **Kildestatus:** Nyhetskildene har sjekkmetoden `nyheter` i kilderegisteret. Kildesjekken leser statusen fra nyhetsfilen og melder en kilde som feilet når den har feilet eller gitt null saker i mer enn to dager.

**Konsekvens:** Publiseringen går hver dag i stedet for hver uke. Det er om lag fem minutter i Actions per dag. Nyhetene er aldri mer enn et døgn gamle, og ingenting annet i appen endres uten PR. En kilde som endrer formatet, gir status `tom` i stedet for en tom liste.

**Tillegg 08.10.2026:** Den første planlagte kjøringen ble hoppet over av GitHub, så nyhetene var fra dagen før. Arbeidsflyten kjører nå også kl. 08.17 og 13.17 norsk sommertid (06.17 og 11.17 UTC). Bare nye saker committes og publiseres, og saken om nyhetskilder får bare en kommentar når noe nytt er galt, så flere kjøringer gir ikke flere varsler.

**Tillegg 09.10.2026:**
- **Det som skjedde:** GitHub starter planlagte kjøringer i dette repoet 6,5–7 timer for sent.
  - 08.10 kom kjøringen fra 05.47 først 12.57, og den fra 13.17 kom 19.53.
  - 09.10 hadde ingen av morgenkjøringene kommet kl. 11.
  - Kildesjekken på mandag kom også 7 timer for sent.
  - Den første natten ble ikke hoppet over, som tillegget 08.10 sier. Kjøringen kom sju timer for sent.
- **Endringen:** Hentingen kjører nå hver time (`47 * * * *`). Med samme forsinkelse kommer det da en kjøring omtrent hver time, også om morgenen.
- **Ingen garanti:** GitHub lover ikke når planlagte kjøringer kommer, eller at de kommer. Skal nyhetene være der på et bestemt tidspunkt, må kjøringen startes utenfra (eier vurderer en ekstern tjeneste).
