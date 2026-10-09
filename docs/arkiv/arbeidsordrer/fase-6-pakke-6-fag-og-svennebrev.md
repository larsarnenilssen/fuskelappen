# Fase 6, pakke 6: «Fag- og svennebrev» i Opplæringstilbud (plukket opp igjen 05.10.2026)

Start en ny samtale med: «Les docs/arbeidsordrer/fase-6-pakke-6-fag-og-svennebrev.md og start pakke 6.» Les også `AGENTS.md`, «Levert så langt», «Domenet» og «Åpent» i `fase-6-pakke-5.md`, og avgjørelsene 066–068. Nye begreper i en ny fil under `content/begreper/` føres opp i `src/modules/begreper/tema.ts`.

## Levert i pakke 5 (0.37.0, 05.10.2026)

- **Kalenderen** (`#/kalender`, avgjørelse 066): fristene fra alle modulene, skoleruta fra fylkenes forskrifter (`data/skolerute/`), fylkenes datoer for svar og inntak (`data/inntak/`) og vedtatte endringer i regelverket (`data/lovdata/kommende.json`).
  - Visning: de neste tolv månedene eller et skoleår (inneværende eller neste).
  - Filter på tema og hvem det gjelder står i adressen, f.eks. `#/kalender?tema=eksamen&vis=privatister`.
  - Kalender for inntak og Kalender for eksamen sender videre til kalenderen, ferdig filtrert.
  - Fristene har feltet `lenker`. En ny side kan lenkes fra en dato ved å legge adressen dit.
  - Siden om prøvene og den nye siden om fag- og svennebrev kan lenke til `#/kalender?tema=eksamen&vis=laerlinger`.
- **Forsiden:**
  - gruppen «Neste datoer»
  - på skrivebord en sidekolonne med «Neste datoer» og favorittene (avgjørelse 068)
- **Kontrollsakene og CI** (avgjørelse 067):
  - En kilde uten godkjent fingeravtrykk merkes «Ny kilde, ikke godkjent ennå».
  - Lenkesjekken lager sak bare for borte og flyttede lenker.
  - CI kjører etter hva som er endret: ingen tester for bare dokumentasjon, den raske jobben for bare versjonsnummer.
- **Søket** legger seg over siden og lukkes med et trykk utenfor.

## Åpent etter pakke 5

- **Vestland:**
  - vestlandfylke.no svarer verken skymiljøet eller GitHub Actions (tidsavbrudd også med Chromium). Vestlands egne eksamens- og inntaksdatoer mangler derfor.
  - Forslag til eier: spør fylket om tilgang eller data, og bygg en «lim inn siden»-kontrollsak som leser datoene med de samme mønstrene.
- **Skoleruta** finnes som forskrift i Lovdata bare for Rogaland, Vestland, Troms og Finnmark. Eier avgjør om de andre fylkenes skolerute skal hentes fra nettsidene deres.
- **Inntaksdatoene** fra Østfold, Buskerud, Rogaland og Møre og Romsdal (sider uten årstall) kommer først når sidene hentes fra januar.
- **Lovtidend avdeling I** kan ikke leses fra skymiljøet. Første ukentlige kjøring i Actions viser om lesingen av kunngjøringene virker.
- **Kontrollspørsmål og godkjenninger** venter på eier:
  - svar og klage på inntak som perioder i juli og august
  - kildene fra fase 6, der 26 er nye og ikke godkjent
- **Orddeling på mobil:** På 320 px deler telefonen lange ord med sin egen ordbok (`hyphens: auto`). Eier kontrollerer det på en liten telefon.
- Resten av «Åpent» i `fase-6-pakke-5.md` står fortsatt, bortsett fra punktene om kalenderen.

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
- **Begrepene** praksisbrev, lærekandidat, praksiskandidat, fagbrev på jobb, Vg3 i skole og formidling til læreplass er levert i 0.36.0 (`docs/arbeidsordrer/fase-6-begreper.md`), så siden kan lenke til dem. Kontrollspørsmålene til dem tas med når veiene skrives.

## Arbeidsmåte

Som i de andre pakkene:
- Først mockup til eier.
- Ingen ende-til-ende-tester før eier har godkjent designet.
- Push til `test` etter hver designrunde.
- Nytt innhold får `kontrollert: null` og kontrollspørsmål med kilder.

## Levert i pakke 6 (0.38.0, 06.10.2026)

Fire designrunder med eier står i `fase-6-pakke-6-forslag.md`. Valgene står i avgjørelse 069.

- **Lærlinger og kandidater** (`#/opplaeringslop/laerlinger-og-kandidater`) i Opplæringstilbud, med tre faner:
  - «Veiene»: målet, filteret uten fellesfag og linjen om kompetansebevis for elever.
  - «Sammenlign»: med fellesfagene i alle veiene som et lukket kort.
  - «Bytte vei»: ni utgangspunkter.
- **Ti veier** med egen side:
  - prøven «I Vurdering» først
  - stegene
  - «Om veien», med oppsigelse og heving på veiene med kontrakt
  - «Kommer fra» og «Veien videre»
- **«Veiene hit»** på prøvesiden i Vurdering, som et lukket kort.
- **To kolonner fra 64rem.** Stegene står på rad eller som sti etter plassen i kolonnen.
- **Innholdet:**
  - `content/opplaeringslop/veier.yaml` med de nye typene `vei` og `utgangspunkt`.
  - Hver overgang har kilde, og `tests/content/veier.test.ts` tester veiene som veiviserne.
  - Ny kilde: `udir-laerekandidatordningen`.
- **Begrepene:**
  - påbygging (ol. § 5-7)
  - kontrakt om opplæring (oppsigelse og heving)
  - individuell tilrettelegging, individuelt tilrettelagt opplæring og tilpasset opplæring (lærekandidater, lærlinger og praksisbrevkandidater)
- **Ungdomsretten og påbygging** bygger på ol. § 5-1 andre ledd og Udirs side «Rett til videregående opplæring», ikke på eiers svar (eier 06.10.2026). Retten varer til studie- eller yrkeskompetanse. Udir skriver også at den som har praksisbrev, har retten i behold.

## Åpent etter pakke 6

- **Kontrollspørsmålene** til veiene, utgangspunktene og de endrede begrepene venter på eier i kontrolloversikten.
- **Løpene i Grep, VIGO og utdanning.no (eiers spørsmål 7, 06.10.2026):** 72 uenigheter i `docs/TILBUDSSTRUKTUR.md`. Mønstrene:
  - **49 av 61 som bare står i Grep, er fra Vg1 studiespesialisering til Vg2 yrkesfag.** Det er yrkesfaglig opphenting, som bare Grep beskriver som løp. De vises allerede umerket (avgjørelse 051).
  - **De 12 andre som bare står i Grep,** er kryssløp mellom utdanningsprogram, f.eks. akvakultur og fiske og fangst til sjømatproduksjon, og naturbruk til byggdrifterfaget. VIGO og utdanning.no ser ut til å beskrive løpene innenfor et program. De vises og er merket.
  - **utdanning.no bruker en gammel kode:** «Grafisk produksjonsteknikk» har koden TPGPT3 på utdanning.no, men IMGPT3 i Grep og VIGO. Faget er flyttet fra teknologi- og industrifag til informasjonsteknologi og medieproduksjon. Det samme løpet teller derfor som to uenigheter.
  - **Grep mangler «bygger på» for Sikkerhetsfaget (SRSIK3) og Service- og administrasjonsfaget (SRSOA3).** Bare VIGO har løpet fra Vg2 salg, service og reiseliv. Løpene vises ikke, og de to lærefagene nås ikke fra inngangen i Opplæringsløp.
  - **Kjøretøy (TPKJT2) til fire mekanikerfag og medieproduksjon (IMMED2) til to fag** står i Grep og VIGO, ikke på utdanning.no.
  - **Gipsmakerfaget** fra Vg1 bygg- og anleggsteknikk står i Grep og på utdanning.no, ikke i VIGO.
  
  Forslag til en egen runde:
  - vis alle løp som minst én kilde har, og merk dem tydelig med kilden når bare én kilde viser dem
  - les gamle koder på utdanning.no som de nye
  - ta med VIGO-løpene der Grep mangler «bygger på»
- **Resten av «Åpent» i `fase-6-pakke-5.md`** står fortsatt: Vestland, skoleruta for de andre fylkene, inntaksdatoene uten årstall, Lovtidend avdeling I, kontrollspørsmålene og orddeling på mobil.
- **Lokalt** kan ende-til-ende-testene bare kjøres i Chromium. Miljøet mangler WebKit og har en annen Chromium enn Playwright venter. Pakke 6 er testet i Chromium mobil og skrivebord (`executablePath: /opt/pw-browsers/chromium`), og i CI i begge nettleserne.
