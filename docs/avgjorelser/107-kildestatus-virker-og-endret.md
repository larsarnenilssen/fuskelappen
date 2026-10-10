# 107 – Kildestatus: «virker» og «endret» for seg, og kontrolloversikten etter godkjenning

**Kontekst:** Kildelisten viste én status per kilde: «virker», «endret {dato}» eller «svarer ikke» (avgjørelse 089). En kilde som var endret, virket også, men det sto ikke. Brukeren kunne tro at «endret» var en feil, eller at endringen ikke var gått gjennom. Kontrolloversikten (`docs/KONTROLL.md`) ble bare laget på nytt av kildesjekken hver mandag. Derfor viste den fortsatt det eier nettopp hadde godkjent, f.eks. «25 av 25» praksis som skulle bekreftes, og kilder under «Må ses på» (eier 10.10.2026).

**Valg:**
- **To opplysninger per kilde i kildelisten:** et merke for om kilden virker («virker» eller «svarer ikke», eller «sjekkes for hånd»), og ved siden av et eget merke «endret {dato}» når innholdet er endret de siste 30 dagene. En kilde kan dermed stå som både «virker» og «endret». Tellingen er «Virker: n. Svarer ikke: n. Endret de siste 30 dagene: n.», og de endrede telles også blant dem som virker eller ikke svarer. «Endret» står i 30 dager også etter at eier har gått gjennom endringen, og appen viser fortsatt ikke om eier har godkjent noe (avgjørelse 089).
- **Godkjenningsjobben lager kontrolloversikten på nytt** (`npm run kontroll:rapport`) etter hver godkjenning, og lagrer den i samme commit.
- **En kilde eier har gått gjennom, får status «ok» med en gang** i `data/status/kildestatus.json` (`markerGjennomgatt`), når fingeravtrykket eier godkjente, er det kildesjekken så sist. Det er det samme kildesjekken kommer fram til neste gang. `endret_siden` står.

**Konsekvens:** Brukerne ser at en endret kilde virker. Kontrolloversikten stemmer med det eier har godkjent, med en gang. Kontrollsaken oppdateres fortsatt ved neste kildesjekk.
