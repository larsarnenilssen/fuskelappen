# 062 – Lenkesjekk for alle lenker i appen

**Kontekst:** Appen lenker til mange nettsteder, blant annet Lovdata, Udir, fylkene, skolene, opplæringskontorene, utdanning.no, NDLA og Vilbli. Eier vil at alle lenker sjekkes, også dem som kommer til senere, uten at noen må føre dem inn et sted (05.10.2026). Hver natt er for ofte. Repoet er offentlig, så GitHub Actions er gratis, men sjekken skal ikke belaste nettstedene unødig.

**Valg:**
- **En regel, ikke et register.** `scripts/lenker/samle.ts` finner selv alle lenker i `content/` (innholdet og kilderegisteret), i `src/` og i `data/`.
  - Lenker i innholdet, kilderegisteret og koden sjekkes hver gang (faste).
  - Datafilene har hver sin regel i `scripts/lenker/regler.ts` (`DATAFILER`). Nettsidene til skolene og opplæringskontorene sjekkes med stikkprøver, kildesidene hver gang.
  - Kodefiler som bygger lenker av data, har en lenkebygger (`LENKEBYGGERE`), og lenkene sjekkes med stikkprøver. Det gjelder lenkene i lovteksten, læreplanene på udir.no, NDLA, utdanning.no, Vilbli og lærebedriftene.
  - En test feiler når en ny datafil med lenker eller en ny kodefil som bygger lenker, mangler regel. Da må det avgjøres om lenkene er faste eller massegenererte.
- **Hver uke, med kildesjekken** (forslag til eier 05.10.2026):
  - alle faste lenker (om lag 500)
  - 300 stikkprøver av de massegenererte (om lag 2 500), de som er sjekket for lengst siden først
  - høyst én forespørsel i sekundet per nettsted, seks nettsteder om gangen
- **Svarene:**
  - 404 og 410 er borte.
  - En videresending til forsiden er borte, en videresending til en annen side er flyttet.
  - 401, 403, 429, 5xx og feil i nettverket er usikre, fordi nettstedet kan stenge for automatiske forespørsler.
  - Svarte ingen av lenkene til et nettsted, regnes nettstedet som stengt. Nettstedene skrives til `data/status/stengte-lenker.json`, med lenkene og hvor de står, og vises i kontrolloversikten (`docs/KONTROLL.md`), ikke i saken. Lenkene dit sjekkes ikke av noen jobb. Kontrollrunden har bare lenkene til Vilbli (avgjørelse 027). Endret etter sak #98 (eier 05.10.2026).
- **Varsel:** Når en lenke har vært borte eller flyttet to uker på rad, kommer den i kontrollsaken for lenkene (etikett «lenker»), med hvor den står. Saken opprettes bare da, og lukkes når ingen lenker er borte eller flyttet, også når det fortsatt finnes stengte nettsteder.
- **Rekkefølgen:** Lenkesjekken går før kontrolloversikten lages i kildesjekken, så de stengte nettstedene kommer med samme uke.
- **Statusen** fra gang til gang ligger på grenen `lenkesjekk`, med én commit som skrives over, som Grep-lageret (avgjørelse 060).
- **Kildene om Vestland** (`vlfk-*`) er ikke aktive lenger. Sidene lenkes fra `content/fylker/lenker.yaml` (avgjørelse 061), og lenkesjekken sjekker adressene.

**Konsekvens:** Nye lenker kommer med uten ekstra arbeid. En død lenke blir oppdaget innen to uker, en massegenerert innen et par måneder. Hyppigheten endres i `kilder.yml`, og antallet stikkprøver med `--antall`.

**Endret 07.10.2026 (sak #118):** Lovdatas korte adresser («lovdata.no/lov/…/§5-1») sendes alltid videre til den lange adressen under /dokument/. De er Lovdatas faste adresser, som Lovdata selv bruker i teksten, og regnes som ok, ikke flyttet. Adresser i kommentarer i YAML-filene er eksempler og sjekkes ikke.

**Endret 09.10.2026:** De elleve Vestland-kildene (`vlfk-*`) er tatt ut av kilderegisteret, og punktet for vestlandfylke.no i kontrollrundene er fjernet. Vestland behandles som de andre fylkene, med lenkene i `content/fylker/lenker.yaml` (eier 09.10.2026).
