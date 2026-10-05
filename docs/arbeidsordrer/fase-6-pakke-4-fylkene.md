# Fase 6, pakke 4: Fylkene (eier 05.10.2026)

Pakken erstatter Vestland-arbeidet. Vi kopierer ikke fylkenes tekster. Appen lenker til fylkenes egne sider og viser de lokale forskriftene fra Lovdata, for alle fylker på samme måte. Kalenderen er flyttet til pakke 5 (`fase-6-pakke-5.md`).

## Eiers føringer (05.10.2026)

- **Generelt:** Alt bygges likt for alle fylker. Lag aldri en funksjon for import av en type lokale forskrifter for bare ett fylke, selv om bare ett fylke har dem i dag.
- **Lokale forskrifter:**
  - Fylkenes forskrifter og skolenes skoleregler vises i appen.
  - En skoles forskrift regnes som gjeldende så lenge den står i Lovdata. Vi kontrollerer ikke jussen.
  - Alle lover og forskrifter merkes med dato for ikrafttredelse (og «sist endret» der Lovdata oppgir det).
- **Boksen «Hos fylkeskommunen»:**
  - Den står i veiviserstegene der fylket bestemmer.
  - Den kan legges sammen: lukket på mobil, åpen på PC.
  - Uten fylke valgt har den en nedtrekksmeny, ikke en lang liste.
  - «Alt om <fylke> · Bytt fylke» står på én linje.
- **Fylkessiden** står under «Oppslag» på forsiden, ikke i innstillingene. Lenken fra boksen beholdes. Den viser:
  - fylkets sider per tema
  - de lokale forskriftene
  - skolene med nettside og skoleregler
  - opplæringskontorene som er godkjent i fylket
  - kalenderne for inntak og eksamen
  - klageinstansen
- **Skolenes nettside** står på skolekortene. Den hentes fra skoleregisteret (NSR).
- **Lenkesjekk:** Alle lenker sjekkes så ofte det er gratis, det vil si hver natt. Massegenererte lenker (utdanning.no, Vilbli, NDLA og lignende) sjekkes med stikkprøver.
- **Skolerute** tas med. Skyss og fagfordeling for enkeltskoler venter.

## Kartleggingen (05.10.2026)

- **Fylkenes sider:** Alle 15 fylker har sider per tema. Adressene står i `content/fylker/lenker.yaml`. Åtte fylker svarer skymiljøet. Sju stenger det: Møre og Romsdal, Østfold, Buskerud, Vestfold, Telemark, Agder og Vestland. Klage på inntak har sjelden egen side. Adressene i Vilbli kan ikke forutsies per fylke.
- **Lovdata:**
  - Alle 15 fylker har felles skoleregler (opplæringslova § 10-7) og en inntaksforskrift (opplæringsforskrifta §§ 4-5 og 7-2).
  - Seks fylker har egne regler for voksne.
  - Nesten alle har skolerute (opplæringslova § 14-1).
  - Skolenes egne regler som forskrift (fastsatt av rektor etter fylkets skoleregler) finnes i dag bare i Vestland, 14 funnet og trolig 15–30.
  - Registeret `https://lovdata.no/register/lokaleForskrifter` har om lag 12 000 gjeldende lokale forskrifter, 20 per side. Det kan filtreres på `county` og `year`.
  - Dokumentsiden har metadata: Dato, Ikrafttredelse (for skolerute en periode), Endrer, Gjelder for, Hjemmel, Kunngjort og Sist endret.
  - Datasettene for lover har `dateInForce` og `lastChangeInForce`.
- Lovdata, vestlandfylke.no og flere fylker stenger utviklingsmiljøet. Eksempelsider hentes med den midlertidige arbeidsflyten `utforsk.yml` på grenen `utforsk/lovdata` til grenen `utforsk-data`. Begge slettes når pakken er ferdig.

## Plan

1. **Lokale forskrifter fra Lovdata (generelt).**
   - `scripts/lovdata/register.ts` leser registeret og plukker ut kandidater på tittelen (skoleregler, ordensregler, tilleggsregler, inntak, skolerute, fra en fylkeskommune eller Oslo kommune).
   - Dokumentsiden avgjør typen ut fra hjemmelen:
     - § 10-7 gir skoleregler: for fylket, for voksne, eller for skolen når rektor har fastsatt den
     - § 14-1 gir skolerute
     - opplæringsforskrifta kapittel 4 eller § 7-2 gir inntak
   - Fylket kommer fra «Gjelder for», skolen fra navnet i tittelen, koblet til skoleregisteret.
   - Hver uke leses inneværende og forrige år i registeret. En gang i måneden leses hele registeret, og forskrifter som er borte, fjernes.
   - Teksten hentes med den lesingen av lokale forskrifter som finnes (`scripts/lovdata/side.ts`), på omgang.
   - Id-ene er faste: `<fylke>-skoleregler`, `<fylke>-skoleregler-voksne`, `<fylke>-inntak`, `<fylke>-skolerute-<skoleår>` og `<skole>-skoleregler`.
   - Vestlands to forskrifter i `content/lovverk.yaml` erstattes av dette.
2. **I kraft og sist endret** på alle dokumenter i Regelverk. Lovene får datoene fra datasettet, de lokale forskriftene fra dokumentsiden.
3. **Fylkesregisteret** `content/fylker/lenker.yaml`:
   - nytt innhold med `kontrollert: null` og kontrollspørsmål
   - temaene: forside, inntak, klage-inntak, sprak, tilrettelegging, eksamen, klage-standpunkt, privatist og fagprove
4. **Boksen «Hos fylkeskommunen»:**
   - Veiviserstegene får `fylketema` og en kort tekst med egne ord om hva fylket bestemmer.
   - Stegene som ventet på Vestland, skrives generelt: Språk 2–3 og 5, Tilrettelegging 0b, 5b og 6, klagenemnda og inntaksområdepoengene.
5. **Fylkessiden** `#/fylker/<nr>` under Oppslag. Uten fylke valgt: `#/fylker`.
6. **Skolenes nettside** fra NSR. Detaljene hentes én og én, bare for skoler med ny `DatoEndret`, med lager som for Grep (avgjørelse 060).
7. **Nattlig lenkesjekk** (`lenker.yml`):
   - Faste lenker sjekkes hver natt, høyst én forespørsel i sekundet per nettsted.
   - Massegenererte lenker sjekkes med stikkprøver, omtrent 100 per natt.
   - Det varsles etter to netter på rad med feil.
   - Nettsteder som stenger, merkes og kommer i kontrollrunden.
   - Kildene `vlfk-*` blir lenker i registeret, så kildesjekken slutter å lese dem.
8. **Avgjørelser:** 061 (fylkene og lokale forskrifter) og 062 (lenkesjekken). I tillegg CHANGELOG og `OPPDRAG.md`.

## Arbeidsmåte

- Bygg i delene over.
- Vis skjermbilder etter boksen og fylkessiden (iPhone 15 Pro, PC 1231 px og mørk visning).
- Push til `test` etter hver designrunde.
- Ingen ende-til-ende-tester før eier har sagt at designet er ferdig.
