# Fase 6, pakke 6: «Fag- og svennebrev» i Opplæringstilbud (plukket opp igjen 05.10.2026)

Eier avtalte innhold og plassering 04.10.2026 i fase 6-forslaget (runde 3 og 4, mockup 3 og 4), men oppgaven kom ikke inn i noen pakke. Den står bare som «ikke bygget» under «Åpent» i arbeidsordrene for pakke 3 og 5. Eier ba 05.10.2026 om at den plukkes opp igjen. Den kommer etter kalenderen (pakke 5), med mindre eier vil ha den før.

Alt som er avtalt, står i `docs/arbeidsordrer/fase-6-forslag.md`:
- «Eiers ønsker (04.10.2026, runde 3) og forslag»
- «Mockup 3 (04.10.2026)»
- «Mockup 4: veiene til fag- og svennebrev (04.10.2026)»
- «Svar fra eier (04.10.2026, runde 4)»

Skjermbildene av mockupene ble ikke lagt i repoet. Lag mockupen på nytt ut fra beskrivelsen og vis den til eier før det bygges.

## Avtalt

1. **Plassering:** siden «Fag- og svennebrev» i Opplæringstilbud, med en knapp på oversiktssiden. Prøven som sluttvurdering står allerede i Vurdering («Fag- og svenneprøven og de andre prøvene», pakke 3).
2. **Delingen** (hver opplysning ett sted, lenker begge veier):
   - Opplæringstilbud har veiene mot fag- og svennebrev, praksisbrev og kompetansebevis, hva hver vei består av (skole, kontrakt i bedrift, praksis), bytte underveis, godskriving, fellesfag og unntak.
   - Vurdering har prøven, klagen og fristene.
3. **Tre faner etter hvorfor brukeren kommer:**
   - «Veiene»: velg mål, og se veiene med stegene som knapper, hvem som melder opp, fellesfag og kilde.
   - «Sammenlign»: velg to veier og se dem side om side, med fellesfagene som egen liste.
   - «Bytte vei»: fra der man er, til veiene videre, med vilkår og kilde.

   Ordet «klosser» brukes ikke i appen. Veiene er lukket fra start.
4. **Hver vei har egen side** med sti («Opplæringstilbud › Fag- og svennebrev › Lærekandidat»), «Kommer fra» og «Veien videre» som knapper, og prøven i Vurdering som første kort. Prøvesiden i Vurdering får «Veiene hit». Lenker til den andre modulen merkes «I Vurdering».
5. **Veiene til fag- eller svennebrev (8):**
   - lærling i hovedmodellen
   - lærling rett etter grunnskolen eller etter Vg1 (0+4, 1+3, særløp)
   - praksisbrev og så fagbrev
   - fra Vg1 studieforberedende med yrkesfaglig opphenting eller kryssløp
   - Vg3 i skole uten læreplass
   - lærekandidat som blir lærling
   - fagbrev på jobb
   - praksiskandidat

   Voksne (ol. kap. 18) står under hver vei. I tillegg kommer veiene til praksisbrev og kompetansebevis.
6. **Lærekandidat:** Appen sier «etter grunnskolen, etter Vg1 eller Vg2, eller ved å endre kontrakten». Kildene er Udirs «Hvordan bli lærekandidat», ol. § 7-2 og ofo. § 6-3 og § 7-3. Eier: «en elev kan når som helst bli lærekandidat», men det står ikke ordrett i kildene.
7. **Bytte vei** fra:
   - grunnskolen
   - Vg1 studieforberedende
   - Vg1 og Vg2 yrkesfag (også Vg3 påbygging, som bruker opp ungdomsretten)
   - lærling, lærekandidat og praksisbrevkandidat
   - ferdig fagbrev (Vg4 påbygging, nytt fagbrev)
   - praksis i arbeidslivet
8. **Lenker** til fagarkene og tilbudene (studieforberedende, yrkesfag, påbygging) der det passer, til begrepene og til oppslaget over opplæringskontorer. Eier vil også at VIGO kontrollerer fagarkene.
9. **Testes som veiviseren:** alle veier kan nås, og ingen overgang mangler kilde.

## Åpent fra forslaget (legges fram for eier)

- **Ikke funnet i nasjonale kilder:**
  - fellesfag for lærekandidater (står i planen for kandidaten)
  - fellesfag i TAF/YSK og vekslingsmodeller
  - uttrykkelig regel om godskriving når en lærekandidat blir lærling
  - nedre aldersgrense for yrkesfaglig rekvalifisering
  - krav om grunnskole for praksiskandidater
- **Udirs kilder er uenige:**
  - særløp: merknaden til § 7-6 sier læreplass etter Vg3, mens Udir-1 sier kontrakt etter Vg1
  - merknadene til § 6-3, § 6-4, § 7-1, § 7-3 og § 7-6 viser til «opplæringsloven § 7-7 tredje ledd»
  - § 9-64 viser til ol. § 7-4 sjette ledd
  - merknadene til § 9-46 og § 9-48 nevner et unntak for fremmedspråk som ikke står i paragrafen
- **Gammel hjemmel:** nasjonale rammer for yrkesfaglig opphenting (2018) har hjemmel i den gamle loven.
- **Begreper fra gjennomgangen 05.10.2026:** praksisbrev, lærekandidat, praksiskandidat, fagbrev på jobb og Vg3 i skole skrives før denne pakken, så siden kan lenke til dem.

## Arbeidsmåte

Som i de andre pakkene:
- Først mockup til eier.
- Ingen ende-til-ende-tester før eier har godkjent designet.
- Push til `test` etter hver designrunde.
- Nytt innhold får `kontrollert: null` og kontrollspørsmål med kilder.
