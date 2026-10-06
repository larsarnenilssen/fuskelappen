# Fase 6, pakke 6: «Fag- og svennebrev» – forslag til eier (06.10.2026)

Grunnlaget er `fase-6-pakke-6-fag-og-svennebrev.md` og runde 3 og 4 i `fase-6-forslag.md`. Mockupen er laget på nytt ut fra beskrivelsen og tegnet inn i appen, så toppfeltet, fargene og skriften er som i dag. Den ligger på grenen `claude/fase-6-pakke-6` og i testversjonen (`https://jukselappen.no/test/#/opplaeringslop/fag-og-svennebrev`).

Innholdet i mockupen er et utkast. Det står i `src/modules/opplaeringslop/fagbrev/mockup.ts`, bare på bokmål, med kildene som korte etiketter. Når designet er godkjent, flyttes det til `content/` med nynorsk, kilder fra kilderegisteret og kontrollspørsmål, og alt får `kontrollert: null`.

## 1. Plassering

- **Opplæringstilbud:** et nytt kort «Fag- og svennebrev» under «Utdanningsprogram og løp», ved siden av Opplæringsløp. Kortet viser antall veier.
- **Adressene:**
  - `#/opplaeringslop/fag-og-svennebrev`
  - `#/opplaeringslop/fag-og-svennebrev/<vei>` for hver vei, f.eks. `/laerekandidat`
- **Fanen og valgene** står i adressen (`?fane=bytte&fra=vg2-yf`), så en lenke kan åpne rett i «Bytte vei» fra Vg2.
- **Ikon:** et nytt ikon «vei» (en vei som deler seg i to).
- **Favoritter:** siden og hver vei har stjerne.

## 2. Fanen «Veiene» (skjermbilde 2)

- **Målet:** bryteren velger Fagbrev, Praksisbrev eller Kompetansebevis. På mobil står «Fagbrev», der det er plass «Fag- eller svennebrev».
- **Filter:** knappen «Bare veier uten krav om fellesfag» (bare for fagbrev) gir fagbrev på jobb og praksiskandidat.
- **Veiene** er lukkede kort med tittel og én linje. Åpnet viser kortet:
  - stegene som knapper på rad med pil mellom
  - hvem som melder opp, fellesfagene og voksne (kapittel 18)
  - kilden
  - lenken til siden for veien
- **Stegene har farge etter delen:** skole (blå), kontrakt i bedrift (rav), praksis i arbeidslivet (grønn) og prøven (bær, som Vurdering).
  - Fargeforklaringen står over kortene.
  - Skjermlesere får delen lest opp foran steget, så fargen er aldri det eneste som skiller dem.
- **Knappene lenker videre:**
  - skole til Opplæringsløp
  - kontrakt og praksis til begrepet (lærling, lærekandidat, praksisbrev, fagbrev på jobb osv.)
  - prøven til siden om prøvene i Vurdering

## 3. Fanen «Sammenlign» (skjermbilde 3)

- **Valg:** to nedtrekkslister med alle ti veiene. Standard er lærling og fagbrev på jobb.
- **Boksen** har samme oppsett som «Underveis- og sluttvurdering» (`Sammenligning`), med en felles underoverskrift over hver rad:
  - stegene
  - kontrakt
  - prøven
  - melder opp
  - fellesfag
  - dokumentasjon
  - voksne
  - kilde
- **«Fellesfagene i veiene»** er en egen liste under boksen: alle veiene med «Må være bestått», «Trengs ikke» eller «Står i planen for kandidaten».

## 4. Fanen «Bytte vei» (skjermbilde 4)

- **«Hvor er du nå?»:** ni knapper.
  - grunnskolen
  - Vg1 studieforberedende
  - Vg1 yrkesfag
  - Vg2 yrkesfag
  - lærling
  - lærekandidat
  - praksisbrevkandidat
  - ferdig fag- eller svennebrev
  - praksis i arbeidslivet
- **«Veiene videre»** fra det valgte utgangspunktet står som kort med vilkåret og kilden under.
  - Kortene lenker til veien.
  - Overganger som ikke er en av veiene, lenker til tilbudet: Vg3 påbygging, Vg4 påbygging og nytt fagbrev.

## 5. Siden for hver vei (skjermbilde 5, lærekandidat)

- **Sti:** «Opplæringstilbud › Fag- og svennebrev».
- **Første kort er prøven i Vurdering**, merket «I Vurdering».
- **Under prøven:**
  - stegene og faktaene: kontrakt, prøven, melder opp, fellesfag, dokumentasjon og voksne, med kilde
- **«Kommer fra»:** utgangspunktene med en overgang hit, med vilkår og kilde. Et trykk åpner «Bytte vei» fra det utgangspunktet.
- **«Veien videre»:** overgangene fra der man står når veien er gått, f.eks. fra lærekandidat til «Lærekandidat som blir lærling», eller fra et fagbrev til Vg4 påbygging og nytt fagbrev.

## 6. «Veiene hit» på prøvesiden i Vurdering (skjermbilde 6)

- **Plassering:** ny del under de blå boksene.
- **Innhold:** lenker til de ti veiene, merket «I Opplæringstilbud», på samme måte som fagarket merker lenkene «I Vurdering».

## 7. Veiene og overgangene i mockupen

**Til fag- eller svennebrev (8):**
- lærling i hovedmodellen
- lærling rett etter grunnskolen eller etter Vg1 (0+4, 1+3, særløp)
- praksisbrev og så fagbrev
- fra Vg1 studieforberedende (opphenting eller kryssløp)
- Vg3 i skole uten læreplass
- lærekandidat som blir lærling
- fagbrev på jobb
- praksiskandidat

**Til praksisbrev:** praksisbrevkandidat.

**Til kompetansebevis:** lærekandidat. Appen sier «etter grunnskolen, etter Vg1 eller Vg2, eller ved å endre kontrakten» (runde 4).

**Hver overgang har vilkår og minst én kilde.** Testene skal kreve:
- at alle veiene kan nås fra et utgangspunkt
- at alle overgangene peker på en vei eller et tilbud som finnes
- at ingen overgang mangler kilde

## 8. Hvordan innholdet lagres (forslag)

- **Fil:** `content/opplaeringslop/fagbrev.yaml`, med to nye typer i innholdsskjemaet:
  - `vei`: mål, steg med del og lenke, kontrakt, prøve, melder opp, fellesfag, dokumentasjon, voksne og kilder.
  - `overgang`: fra, til, vilkår og kilder.
  
  Hver post får `kontrollert: null` og 1–5 kontrollspørsmål med `punkt`.
- **Søket:** søkeoppføringer for siden og hver vei.
- **Kalenderen:** veiene får ikke egne frister, men vilkårene om søknadsfrist (1. februar og 1. mars) lenker til `#/kalender?tema=inntak&vis=laerlinger`.
- **Nye kilder i kilderegisteret** (ikke godkjent før eier sier det):
  - Udirs sider om lærekandidatordningen («Hvordan bli lærekandidat»), praksisbrevordningen og fagbrev på jobb
  - veilederen om praksiskandidatordningen
  - nasjonale rammer for yrkesfaglig opphenting (2018)

## Spørsmål til eier

1. **Designet:** Er fanene, de fargede stegknappene og sidene for hver vei slik du så for deg? Skal noe flyttes eller tas bort?
2. **Fargene:** skole blå, kontrakt i bedrift rav, praksis grønn og prøven bær. Passer de, eller skal bedriften ha en annen farge?
3. **Kompetansebevis:** Mockupen har bare lærekandidat. Kompetansebevis gis også til elever som ikke oppfyller kravene til vitnemål eller fagbrev (ofo. § 9-51 første ledd). Skal den veien med, f.eks. «Elev med kompetansebevis»?
4. **Utgangspunktet «Lærling»** har bare overgangen til lærekandidat (ol. § 7-2 andre ledd). Skal det også stå hva som skjer når kontrakten heves (ol. § 7-3), f.eks. formidling til ny læreplass eller Vg3 i skole?
5. **Det som ikke står i nasjonale kilder** (listen i arbeidsordren, f.eks. fellesfag for lærekandidater og i TAF/YSK): Mockupen skriver «Ikke funnet i nasjonale kilder» der det gjelder. Skal det stå synlig slik, eller bare som kontrollspørsmål til deg?
6. **Udirs kilder er uenige** om særløp (merknaden til § 7-6: læreplass etter Vg3, Udir-1: kontrakt etter Vg1). Mockupen følger Udir-1 og sier «kontrakt etter Vg1». Er det riktig?
7. **Nasjonale rammer for yrkesfaglig opphenting (2018)** har hjemmel i den gamle loven. Kan de brukes som kilde, med en merknad om det?
8. **Stor skjerm:** Skal veiene stå i to kolonner fra 64rem, og «Sammenlign» bli bredere, som kalkulatorene?
9. **VIGO og fagarkene:** Du ønsket at VIGO også kontrollerer fagarkene, og VIGO og Grep er uenige om «bygger på» for noen tilbud (`docs/TILBUDSSTRUKTUR.md`). Skal det tas i denne pakken, eller som en egen pakke etterpå?
