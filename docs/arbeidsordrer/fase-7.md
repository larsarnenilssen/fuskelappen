# Arbeidsordre: fase 7

Lim inn teksten under streken som første melding i en ny samtale.

---

Vi starter fase 7 i Jukselappen (repo `larsarnenilssen/jukselappen`, appen på https://jukselappen.no). Skriv til meg på bokmål, kort og enkelt.

**Les først:**
- `AGENTS.md` (faste regler)
- `OPPDRAG.md` (fase 7 og «Gjelder alle faser»)
- `CHANGELOG.md` (siste versjoner)
- Avgjørelsene i `docs/avgjorelser/`:
  - om innhold og kontroll (016, 017, 019, 021)
  - om Regelverk og lokale forskrifter (039, 061)
  - om veiviseren og fargene (041, 042, 044)
  - om kildekontroll, fylker og data (048, 049, 053)
  - om lenker til begrepsbanken (050)
  - om kalenderen (066)
  - om lærlinger og kandidater, med elementtypene `vei` og `utgangspunkt` (069)
  - om alle løp fra Grep, VIGO og utdanning.no (070)
  - om kildene nederst i kortene og tilbake til samme sted (071, 072)
  - om mer opplæring og delene som kan lukkes (073)
- `docs/arbeidsordrer/fase-6-pakke-6-fag-og-svennebrev.md` («Åpent etter pakke 6»)
- `docs/arbeidsordrer/fase-6-pakke-7-mer-opplaering.md` («Åpent etter pakke 7»)

**Status:**
- Fase 6 er levert, også pakke 7 (mer opplæring, `docs/arbeidsordrer/fase-6-pakke-7-mer-opplaering.md`). Siste versjon er 0.39.0 (06.10.2026).
- Nye lange sider kan bruke delene som kan lukkes (`Seksjon`, avgjørelse 073).
- Fase 6 består av:
  - Vurdering, fraværsgrensen, eksamen og klage
  - fylkene og de lokale forskriftene
  - kalenderen
  - lærlinger og kandidater i Opplæringstilbud
- Kontrollpunktet for fase 6 venter på meg: regler, kalkulator og veivisere, og kontrollspørsmålene i kontrolloversikten.

**Fase 7 – Skolemiljø og skoleregler** (`OPPDRAG.md` kapittel 4):
- **Aktivitetsplikten trinn for trinn:**
  - plikten til å følge med, gripe inn, varsle, undersøke og sette inn tiltak
  - skjerpet aktivitetsplikt
  - aktivitetsplan og dokumentasjon
  - elevens mulighet til å melde saken til statsforvalteren

  Opplæringslova kapittel 12 står i Regelverk.
- **Skolereglene:** reaksjoner og saksbehandling som fylkesinnhold. De lokale forskriftene om skoleregler for alle fylker og mange skoler er alt hentet fra Lovdata (`data/lovdata/*-skoleregler.json`, avgjørelse 061). Vestland bruker `vestland-forskrift-skulereglar`.
- **Plass til skolens egne regler** som `supplerer` (skoleinnhold).
- **Resultater fra Elevundersøkelsen** for valgt skole og fylke, sammenlignet med landet. Udirs statistikkbank har et åpent API under NLOD. Før det bygges, legges dette fram for meg: hvilke spørsmål og indekser som tas med, og hvordan små grupper og skjulte tall vises. Ingen tall om enkeltelever.

**Privatskolelova og forskriften til den (eier 06.10.2026):** Tas først i fasen, som en egen PR før skolemiljøet. Grunnen er at skolemiljøet og skolereglene også gjelder privatskoler, og at kortet «Privatskoler» på «Mer opplæring» i dag bare har Udir som kilde, fordi forskriften mangler.
- **I kildegrunnlaget:** to nye kilder i `content/kilder.yaml`, som de andre lovene: `type: lovdata-datasett`, `sjekkmetode: lovtekst`, `lisens: NLOD 2.0` og adressen hos Lovdata.
  - Loven er etter det jeg vet `lov/2003-07-04-84` (privatskolelova). Forskriften til loven må finnes i datasettet «gjeldende sentrale forskrifter».
  - Skymiljøet når ikke Lovdata (405 fra både lovdata.no og api.lovdata.no 06.10.2026). Id-ene, tittelen og målformen kontrolleres derfor i hentingen i Actions (`npm run hent:lovdata`), ikke gjettes.
- **I Regelverk (Lov og forskrift):** to oppføringer i `content/lovverk.yaml`, med et utvalg av kapitler (avgjørelse 039). Det trengs ingen kodeendring.
  - Utvalget legges fram for meg før det tas inn, som for opplæringslova og forskriften (eier 02.10.2026).
  - Utgangspunkt: det som gjelder videregående opplæring, elevene, inntak, vurdering, skolemiljø og klage.
  - Ikke med: det som bare gjelder grunnskolen, tilskudd og økonomi og tilsyn med økonomien. Si hvis det er grunn til å ta med mer.
- **Forslaget til meg** om hvordan lovene brukes som kilder og regelreferanser i appen, før noe innhold endres:
  1. **Paragrafene som kilde:** Når lovene står i Lov og forskrift, virker `paragrafer: [privatskolelova/…]` og kilder med `punkt: "§ …"` uten ny kode, med «I regelverket» i kortene (avgjørelse 071). Første bruk: kortet «Privatskoler» på «Mer opplæring» får forskriften (Udir viser til «forskrift til privatskoleloven § 4-2») i tillegg til Udir.
  2. **Bare der reglene er ulike:** Appen er skrevet for fylkeskommunale skoler. Privatskolelova tas inn som kilde der den gir egne regler for privatskoler, ikke som en kopi av alt i opplæringslova. Lag en liste over stedene i appen der det gjelder, f.eks. inntak, mer opplæring, vurdering og klage, skolemiljø og aktivitetsplikt, skoleregler og bortvisning. Vis hva privatskolelova sier og om den viser til opplæringslova.
  3. **Skolemiljøet i fase 7:** Undersøk hvilke regler om skolemiljø og skoleregler som gjelder for privatskoler etter privatskolelova. Vis henvisningen i stegene i aktivitetsplikten der det er relevant. Gjett ikke: står det ikke i kildene, spør meg.
  4. **Når valgt skole er en privatskole:** Vurder om appen skal vise en merknad («Skolen er en privatskole. Se også privatskolelova …») når brukeren har valgt en privat skole. Skoleregisteret i appen (`data/skoler/vgs.json`) har i dag bare id, navn, fylke og kommune. Hentingen fra NSR må da utvides med om skolen er offentlig eller privat. Hvordan det vises, legges fram for meg. Det kan kreve et nytt felt eller en ny verdi i `gyldighet`, og i så fall et avgjørelsesnotat.
  5. **Begrepsbanken:** Et begrep «Privatskole» (skole godkjent etter privatskolelova), med lenke til loven i Lov og forskrift.
  6. **Kontroll:** Lovteksten følges av kildesjekken hver uke som de andre lovene. Nytt innhold får `kontrollert: null` og kontrollspørsmål.

  Forslaget skrives i `docs/arbeidsordrer/fase-7-forslag.md`, med svar fra meg før innholdet endres.

**Arbeidsmåte:**
- Først et forslag med mockup til meg. Lag mockupen i appen, med skjermbilder på mobil og skrivebord.
- Ingen ende-til-ende-tester før jeg har sagt at designet er ferdig.
- Push til `test` etter hver designrunde.
- Versjons-PR når vi er enige.
- Nytt innhold får `kontrollert: null` og kontrollspørsmål med kilder.
- Ingen regel eller bestemmelse uten belegg i kildene eller mitt samtykke i chatten (06.10.2026).
- På skrivebord kan sidene stå i to kolonner, som lærlinger og kandidater (avgjørelse 069).

**Åpent fra fase 6 (tas med videre):**
- «Åpent etter pakke 7»: kontrollspørsmålene til «Mer opplæring» og praksispunktet om lærling til lærekandidat etter en prøve som ikke er bestått.
- Etter fase 7 kommer fase 7b, nyheter (`docs/arbeidsordrer/fase-7b-nyheter.md`). Oppdater status og «Les først» i den når fase 7 er levert.
- «Åpent» i `fase-6-pakke-5.md`:
  - Vestland
  - skoleruta for fylkene som ikke har den i Lovdata
  - inntaksdatoene uten årstall
  - Lovtidend avdeling I
  - orddeling på mobil
- Lokalt kan ende-til-ende-testene bare kjøres i Chromium (`executablePath: /opt/pw-browsers/chromium`). CI kjører begge nettleserne.
