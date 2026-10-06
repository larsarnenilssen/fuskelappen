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
- `docs/arbeidsordrer/fase-6-pakke-6-fag-og-svennebrev.md` («Åpent etter pakke 6»)

**Status:**
- Fase 6 er levert. Siste versjon er 0.38.0 (06.10.2026).
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

**Arbeidsmåte:**
- Først et forslag med mockup til meg. Lag mockupen i appen, med skjermbilder på mobil og skrivebord.
- Ingen ende-til-ende-tester før jeg har sagt at designet er ferdig.
- Push til `test` etter hver designrunde.
- Versjons-PR når vi er enige.
- Nytt innhold får `kontrollert: null` og kontrollspørsmål med kilder.
- Ingen regel eller bestemmelse uten belegg i kildene eller mitt samtykke i chatten (06.10.2026).
- På skrivebord kan sidene stå i to kolonner, som lærlinger og kandidater (avgjørelse 069).

**Åpent fra fase 6 (tas med videre):**
- Forslaget om mer opplæring og en nyhetsside står i `docs/arbeidsordrer/forslag-meropplaering-og-nyheter.md`. Spør meg om rekkefølgen før fase 7 starter.
- «Åpent» i `fase-6-pakke-5.md`:
  - Vestland
  - skoleruta for fylkene som ikke har den i Lovdata
  - inntaksdatoene uten årstall
  - Lovtidend avdeling I
  - orddeling på mobil
- Lokalt kan ende-til-ende-testene bare kjøres i Chromium (`executablePath: /opt/pw-browsers/chromium`). CI kjører begge nettleserne.
