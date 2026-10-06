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

Spørsmålene er lagt fram på nytt etter runde 2, med valget, hva appen sier i dag og en anbefaling. Se «Spørsmål til eier (lagt fram på nytt 06.10.2026)» nederst.

## Svar fra eier (06.10.2026, runde 1) og endringer i runde 2

Eier liker plasseringen, ikonet, sammenligningen og at veiene har hver sin fane. Endret i runde 2:

- **Rollene først:**
  - Siden heter «Lærlinger og kandidater».
  - Ingressen og kortet på Opplæringstilbud nevner lærling, lærekandidat, praksisbrevkandidat og praksiskandidat, og fag- og svennebrev, praksisbrev og kompetansebevis står som det veiene ender i.
  - Veiene har rollen i tittelen, f.eks. «Praksisbrevkandidat som blir lærling», «Elev på Vg3 i skole» og «Kandidat for fagbrev på jobb».
  - Adressen er fortsatt `#/opplaeringslop/fag-og-svennebrev` og byttes når navnet er bestemt.
- **«Fellesfagene i alle veiene»** i «Sammenlign» er et lukket kort.
  - Bakgrunnen: listen kom fra mockup 4 («fellesfag i veiene som egen liste»), for å se alle veiene samlet.
  - Fellesfagene for de to valgte veiene står allerede i boksen.
- **Stegene:**
  - På mobil en loddrett sti, som stiene ellers i appen: en prikk i fargen til delen på linjen, navnet som lenke og delen og tiden under. Prøven har fylt prikk.
  - Fra 40rem en rad med like brede steg, med en stripe i fargen øverst og pil mellom.
- **Siden for hver vei:**
  - Faktaene står i rammen «Om veien», i to kolonner på stor skjerm.
  - «Kommer fra» har ikonet «sted» (en nål på kartet) i stedet for pil tilbake. Det samme ikonet står ved «Hvor er du nå?» i «Bytte vei».
- **«Veiene hit»** på prøvesiden er et lukket kort under prøvene, med veiene gruppert etter prøven de fører til.

## Spørsmål til eier (lagt fram på nytt 06.10.2026)

«I appen i dag» viser hva som står i appen nå (begrepene, prøvesiden, veiviserne). «I mockupen» viser hva utkastet sier. Ingenting av dette er kontrollert.

### A. Valg om siden

**1. Navnet og adressen**
- **Valget:** «Lærlinger og kandidater» (runde 2) eller «Fag- og svennebrev» (avtalt 04.10.2026).
- **I appen i dag:** Siden heter «Lærlinger og kandidater» i mockupen. Adressen er fortsatt `#/opplaeringslop/fag-og-svennebrev`. Prøvesiden i Vurdering heter «Fag- og svenneprøven og de andre prøvene».
- **Anbefaling:**
  - Navnet «Lærlinger og kandidater», og adressen `#/opplaeringslop/laerlinger-og-kandidater`.
  - «Fag- og svennebrev», «fagbrev» og «svennebrev» blir stikkord, så søket finner siden.

**2. Designet og fargene**
- **Valget:** Godkjenner du designet fra runde 2? Det gjelder fanene, stien på mobil, raden på skrivebord, «Om veien», ikonene og de lukkede kortene. Fargene er skole blå, kontrakt i bedrift rav, praksis grønn og prøven bær.
- **I appen i dag:** Fargene finnes fra før. Skole, bedrift og praksis bruker fagtypefargene på fagarket, og bær er fargen til Vurdering.
- **Anbefaling:** Behold fargene. Ende-til-ende-testene skrives først når du har godkjent designet.

**3. Kompetansebevis for elever**
- **Valget:**
  - Skal målet «Kompetansebevis» bare ha lærekandidaten?
  - Eller også elever som ikke oppfyller kravene til vitnemål eller fagbrev, eller som bare har hatt deler av et fag (ofo. § 9-51 første ledd)?
- **I appen i dag:**
  - Begrepet «Vitnemål og kompetansebevis» sier begge deler.
  - På prøvesiden står kompetanseprøven med «Hvem: Lærekandidater. Gir: Kompetansebevis.»
  - I mockupen er lærekandidat eneste vei til kompetansebevis.
- **Anbefaling:** Ingen egen vei for elevene, fordi kompetansebeviset der er dokumentasjon på et løp som ikke er fullført, ikke et mål man velger. Én linje under målet «Kompetansebevis» viser til begrepet.

**4. Når kontrakten sies opp eller heves**
- **Valget:** Skal «Lærling» (og lærekandidat og praksisbrevkandidat) få en overgang for oppsigelse og heving av kontrakten?
- **Hva loven sier (ol. § 7-3 og § 7-4):**
  - Kontrakten kan sies opp når partene er enige.
  - Fylkeskommunen hever den når den som har læretid, ikke vil fortsette, og kan heve ved vesentlige brudd.
  - Lærebedriften skriver ut en attest, og arbeidsavtalen faller bort.
  - Fristene for formidling gjelder ikke for dem som formidles i samarbeid med oppfølgingstjenesten (ofo. § 7-5 fjerde ledd).
- **I appen i dag:** Ingenting om oppsigelse eller heving. «Kommer fra» og «Veien videre» har bare endring av kontrakten (ol. § 7-2 andre ledd).
- **Anbefaling:**
  - Ta med en overgang som sier det loven sier.
  - Ingen påstand om hva som skjer etterpå (ny læreplass, Vg3 i skole), fordi det ikke står i kildene. Det blir et kontrollspørsmål.

**5. Det som ikke står i nasjonale kilder: synlig eller bare til deg?**
- **I appen i dag:** Begge deler finnes.
  - Uklare punkter er kontrollspørsmål, som bare vises i kontrolloversikten.
  - Praksis som ikke står i kildene, står i praksislisten (`content/kontroll/praksis.yaml`) og vises heller ikke i appen.
  - Noen steder sier teksten det rett ut der brukeren trenger det, f.eks. at poengene for inntaksområde ikke står i forskriften, og at hurtigklage ikke står i forskriften.
  - I mockupen står «Står i planen for kandidaten. Ikke funnet i nasjonale kilder.» om fellesfag for lærekandidater.
- **Anbefaling:** Følg det som gjøres i dag.
  - Synlig, med egne ord, bare der brukeren må gjøre noe annet, f.eks. «Fellesfagene står i planen for kandidaten. Forskriften har ingen egen regel.»
  - Resten blir kontrollspørsmål.
  - Ordet «nasjonale kilder» tas bort fra appen.

**6. Veiene i to kolonner på stor skjerm**
- **I appen i dag:** Etter runde 2 står stegene i én rad på skrivebord, og veiene i én kolonne.
- **Anbefaling:** Behold én kolonne. Kortene åpnes, og to kolonner gir hopp i rekkefølgen når et kort åpnes.

**7. VIGO og Grep**
- **I appen i dag:**
  - VIGO kontrollerer allerede fagarkene (avgjørelse 057). Årstimetallet og trekkordningen i Grep sjekkes mot VIGO, og avvik er merket på fagarket («Grep og VIGO er uenige om faget. Appen bruker Grep.»).
  - Løpene (hva et tilbud bygger på) sammenlignes med Grep, VIGO og utdanning.no. Det er 72 uenigheter: 61 står bare i Grep (vist og merket i appen), 7 står i Grep og VIGO, ikke i utdanning.no, 2 bare i VIGO, 1 i Grep og utdanning.no, ikke i VIGO, og 1 bare i utdanning.no (`docs/TILBUDSSTRUKTUR.md`).
- **Valget:** Skal de 72 gås gjennom med deg i denne pakken, eller i en egen runde etterpå?
- **Anbefaling:** En egen runde etter pakke 6. Ingen av veiene på siden avhenger av dem.

### B. Kildene er uklare eller uenige

**8. Særløp**
- **Uenigheten:** Merknaden til ofo. § 7-6 sier læreplass etter Vg3, mens Udir-1 (vedlegg 1, 3.4.3) sier bare Vg1 i skole og tre års læretid.
- **I appen i dag:** Begrepene «Trinn» og «Opplæring i bedrift» følger Udir-1: «noen har bare vg1 i skole og tre års læretid (særløp)». Mockupen sier det samme («Lærekontrakt etter Vg1 (1+3) eller særløp»).
- **Anbefaling:** Følg Udir-1, med kontrollspørsmål. Merknaden leses på nytt før teksten skrives.

**9. Nasjonale rammer for yrkesfaglig opphenting (2018)**
- **I appen i dag:** Begrepet «Yrkesfaglig opphenting» bygger bare på Udir-1 (3.4.2) og læreplanen YFO2002 i Grep, ikke på rammene. Mockupen har rammene som kilde for veien fra Vg1 studieforberedende.
- **Anbefaling:** Ikke bruk rammene, som har hjemmel i den gamle loven. Udir-1 og Grep dekker det veien trenger.

**10. Merknadene viser til «opplæringsloven § 7-7 tredje ledd»**
- **Problemet:** Merknadene til ofo. § 6-3, § 6-4, § 7-1, § 7-3 og § 7-6 viser dit. § 7-7 tredje ledd er hjemmelen for forskrift om formidling. Hjemmelen for kontrakter som avviker fra opplæringsløpet, er § 7-2 fjerde og femte ledd. Forskriften § 6-3 viser selv til § 5-2 tredje ledd.
- **I appen i dag:** Begrepene (lærekandidat, praksisbrev) og mockupen viser til ol. § 7-2.
- **Anbefaling:** Vis til lovteksten (§ 7-2), ikke til merknaden, og legg inn et kontrollspørsmål.

**11. § 9-64 viser til ol. § 7-4 sjette ledd for målene til lærekandidaten**
- **Problemet:** Det leddet handler om individuell tilrettelegging, ikke om opplæringsmål.
- **I appen i dag:** Begrepet «Lærekandidat» sier «de målene som er fastsatt for opplæringen hans eller hennes», og har dette som kontrollspørsmål. Mockupen sier det samme.
- **Anbefaling:** Behold det slik.

**12. Unntak for fremmedspråk i merknadene til § 9-46 og § 9-48**
- **Problemet:** Unntaket står i merknadene, men ikke i paragrafene. Unntakene i § 9-48 andre ledd er bokstav a–f.
- **I appen i dag:** «Krav før prøven» på prøvesiden følger paragrafene og nevner ikke fremmedspråk. Mockupen nevner det ikke.
- **Anbefaling:** Følg paragrafene, med kontrollspørsmål.

**13. Ikke funnet i kildene**

| Punkt | I appen i dag | I mockupen | Anbefaling |
|---|---|---|---|
| Fellesfag for lærekandidater | Ikke omtalt | «Står i planen for kandidaten» | Synlig med egne ord (punkt 5) |
| Fellesfag i TAF/YSK og vekslingsmodeller | Ikke omtalt noe sted | Ikke omtalt | Utenfor pakke 6. Kan bli en egen vei når kildene finnes. |
| Godskriving når lærekandidaten blir lærling | Begrepet «Lærekandidat» har kontrollspørsmål om § 6-9 tredje ledd | «Læretiden godskrives etter en konkret vurdering» (§ 6-9 tredje ledd) | § 6-9 tredje ledd gjelder godskriving for lærekandidater, ikke uttrykkelig overgangen. Teksten skrives om til det loven sier, med kontrollspørsmål. |
| Nedre aldersgrense for yrkesfaglig rekvalifisering | Veiviseren for rett og inntak sier «ingen øvre aldersgrense» og at opplæringen gis som opplæring for voksne | «Voksne har rett til én ny sluttkompetanse» | Ingen aldersgrense i teksten, med kontrollspørsmål |
| Krav om grunnskole for praksiskandidater | Begrepet «Praksiskandidat» nevner ikke grunnskole | Nevner ikke grunnskole | Som i dag |

**14. «En elev kan når som helst bli lærekandidat»**
- **I appen i dag:** Begrepet sier «etter grunnskolen, etter Vg1 eller Vg2, eller ved å endre kontrakten» (runde 4), med kontrollspørsmål. Mockupen sier det samme.
- **Anbefaling:** Behold det.

### C. Funnet underveis

**15. Retten til Vg4 påbygging**
- **Lovteksten:** Retten varer ut skoleåret som starter det året man fyller 24, og etter det gjelder reglene for voksne (ol. § 5-7).
- **I appen i dag:**
  - Veiviseren for rett og inntak sier det samme som loven.
  - Begrepet «Påbygging» sier «fullført og bestått … innen utgangen av året vedkommende fyller 24» (Udir-1, 3.5.3) og har et kontrollspørsmål om det.
  - Mockupen sa det samme som begrepet, og er nå rettet til lovteksten.
- **Valget:** Skal begrepet følge loven?
- **Anbefaling:** Ja, med Udir-1 som kilde ved siden av.

## Runde 3 (06.10.2026): «Mer om …»

- **Knappen:** Lenken nederst i hver vei er en fylt knapp i hele bredden, «Mer om lærling», «Mer om fagbrev på jobb» osv. Linjen under sier hva siden har: «Kommer fra og veien videre».
- **Kortnavn:** Hver vei har et kort navn til knappen (`kortnavn`), så teksten står på én linje i 390 px. Eksempler: «tidlig lærekontrakt» for lærling rett etter grunnskolen eller Vg1, og «opphenting og kryssløp» for lærling etter Vg1 studieforberedende.
- **320 px:** Knappen har mindre luft og litt mindre skrift. Tre navn går likevel over to linjer: «praksisbrev til fagbrev», «opphenting og kryssløp» og «lærekandidat til lærling».
