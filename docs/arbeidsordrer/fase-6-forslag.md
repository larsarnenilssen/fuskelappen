# Fase 6 – forslag til godkjenning (04.10.2026)

Forslaget legges fram før noe bygges (arbeidsordre fase 6). «ol.» er opplæringslova, «ofo.» er opplæringsforskrifta, «fvl.» er forvaltningsloven og «VL-skule» er skulereglane i Vestland (`vestland-skulereglar`). Alle paragrafene står i Regelverk i appen (`#/lov/<dokument>/<paragraf>`). Forskriftsteksten er lest fra `data/lovdata/` (hentet 02.10.2026, sist endret 01.08.2026).

**Kildene jeg vil bygge på** (lest 04.10.2026). Nye kilder i kilderegisteret er merket *ny*:

| Kilde | Hva | Brukes til |
|---|---|---|
| ofo. kapittel 9 og 10, ofo. § 5-2 | Vurdering, eksamen, dokumentasjon, klage, mer opplæring | Alt |
| Udirs merknader til ofo. kapittel 9 og 10 (én side per paragraf) | Utdyper paragrafene | Stegene i veiviserne. Kilden `udir-merknader-ofo` utvides fra kapittel 4 til 4, 9 og 10 |
| *ny* Udirs rundskriv om fraværsgrensen (sist endret 01.08.2026) | Hvordan grensen regnes, hva som teller, unntak, varsel, vedtak, føring | Fraværskalkulatoren |
| *ny* Udirs veiledning «Behandling av klager på standpunktkarakterer i fag» (sist endret 01.12.2025) | Når klagefristen starter, hva skolen og statsforvalteren kan gjøre | Klageveiviseren |
| Udirs oversikt «Hvem er klageinstanser» (finnes, `udir-klageinstanser`) | Klageinstans for hvert vedtak i kapittel 9 | Klageveiviseren |
| *ny* Udir «Administrere eksamen» (sist endret 12.08.2026) og eksamensplan.udir.no | Datoer for påmelding, trekk, eksamen, sensur og klage | Tidslinjen |
| *ny* Udir «Generelt om særskilt tilrettelegging av eksamen» (sist endret 28.01.2026) | Hvem søker, eksempler på tiltak | Eksamen |
| Udir «Føring av vitnemål og kompetansebevis 2026» (finnes, `udir-foring-vitnemal-merknader`, utvides) | IV, IM, FAM51 | Utfallene |
| Grep (`udir-grep`) og VIGO Kodeverksbase (`vigo-kodeverk`) | Årstimetall og vurderingsordning per fagkode | Kalkulatoren og fagarket |

**vestlandfylke.no** svarer fortsatt ikke (04.10.2026, tilkoblingen brytes). Vestland-innholdet bygger bare på skulereglane.

---

## Modul: ny modul «Vurdering og eksamen»

Ny modul **Vurdering og eksamen** (id `vurdering`) i kategorien «Elever og opplæring», ved siden av Tilrettelegging og Inntak. Vurdering og eksamen er et eget emne i oppdraget og har egne frister til årshjulet i fase 8. Det passer ikke i Fag, som handler om fagene og læreplanene, men fagarket lenker hit (se under).

Oversikten har tre deler, én per pakke, som Inntak:

1. **Vurdering:** veiviseren «Grunnlag for vurdering» (rav) og en kort oversikt over vurderingen gjennom året
2. **Fravær:** kalkulatoren «Fraværsgrensen»
3. **Eksamen og klage:** oversikten «Eksamen», veiviseren «Klage på karakter» (ny farge) og tidslinjen «Eksamen og klage gjennom året»

**Fagarket** får en rad «Vurdering» med fraværsgrensen i faget (lenke til kalkulatoren med faget valgt), om eksamen er sentralt eller lokalt gitt (VIGO), og fagmerknadene som hører til faget (VIGO, lenke til FAM-oppslaget).

---

## Pakke 1: Vurdering

### Reglene

| Regel | Kort | Kilde |
|---|---|---|
| Grunnlaget | Kompetansemålene i læreplanen. Forutsetninger, fravær, orden og oppførsel teller ikke. Innsats bare når læreplanen sier det | ofo. § 9-1 andre og tredje ledd |
| Underveisvurdering | All vurdering før opplæringen er slutt. Ingen klagerett | ofo. § 9-11. Merknad til § 10-1 |
| Halvårsvurdering | Uten karakter gjennom hele opplæringen, med karakter skriftlig. Midt i opplæringsperioden, og ved slutten av skoleåret når faget ikke avsluttes. Føres ikke på vitnemålet | ofo. § 9-13. Merknad til § 9-52 |
| Standpunkt | Samlet kompetanse ved slutten, flere og varierte måter, så sent som mulig, senest dagen før sensur av eksamen i faget | ofo. § 9-16. Merknad til § 9-16 |
| Karakterer | 1–6, bestått med 2. Med 1 i standpunkt er faget bestått når eksamen er 2 eller bedre (ikke tverrfaglig). Fag- og svenneprøve: bestått meget godt, bestått, ikke bestått | ofo. § 9-3, § 9-5 |
| Ikke nok grunnlag | Stort fravær eller andre særlige forhold kan gi for lite grunnlag for karakter | ofo. § 9-1 fjerde ledd |
| Varsel | Skriftlig, straks det er tvil, i hvert fag, på nytt før standpunkt. Uten varsel skal eleven få karakter | ofo. § 9-7. Merknad. Rundskrivet pkt. 6.1 |
| Vedtak om IV | Rektor selv, enkeltvedtak, bare for standpunkt. Ingen klage på manglende halvårsvurdering | ofo. § 9-16 sjette ledd. Rundskrivet pkt. 6.2. Merknad til § 10-5 |
| Etter IV | Eksamen annulleres. Mer opplæring eller privatist. Kompetansebevis | ofo. § 9-41, § 5-2, § 9-51. Rundskrivet pkt. 4.2 |
| Fritak | Veiledning før fritak, vurdering uten karakter, ikke eksamen. I vgo: sidemål (§ 9-19, § 9-21), fremmedspråk (§ 9-22, statsforvalteren avgjør), kroppsøving (§ 9-23), innføringsopplæring (§ 9-20, ikke standpunkt) | ofo. § 9-18–§ 9-23. Udirs klageinstanser |
| IOP | Underveisvurdering ut fra målene i IOP. Gir planen ikke grunnlag for standpunkt: «vurdert etter IOP» på kompetansebeviset, med vedlegg | ofo. § 9-11 fjerde ledd, § 9-19 tredje ledd, § 9-52 sjette ledd |
| Lærlinger | Halvårsvurdering uten karakter fra instruktøren. Fraværsgrensen gjelder ikke | ofo. § 9-13 fjerde ledd. Rundskrivet pkt. 2 |

### Stegene i veiviseren «Grunnlag for vurdering»

Fasene: **Hvem og læreplan**, **Fritak**, **Fravær og grunnlag**, **Varsel og vedtak**. Farge: rav (avgjørelse 042).

| # | Steg | Spørsmål → neste | Frist | Kilder |
|---|---|---|---|---|
| 1 | **Hvem skal vurderes** | Elev → 2. Lærling, lærekandidat eller praksisbrevkandidat → L1 | – | ofo. § 9-13 fjerde ledd. ol. § 7-1 |
| L1 | **Vurdering i bedrift** | Halvårsvurdering uten karakter fra instruktøren, samtale om utviklingen hvert halvår, ingen fraværsgrense → L2 | Hvert halvår | ofo. § 9-6, § 9-13. Rundskrivet pkt. 2 |
| L2 | **Fag- eller svenneprøven** (utfall) | Krav om beståtte fag (unntak for ett eller to fellesfag), oppmelding fra lærebedriften, prøvenemnd, karakterer, tilrettelegging, ny og utsatt prøve, klage. Lenker til begrepene lærling og kontrakt om opplæring og til oppslaget over opplæringskontorer | Oppmelding senest 2 måneder før kontraktstiden er ute. Prøven tidligst 3 måneder før | ofo. § 9-5, § 9-55–§ 9-57, § 9-62, § 9-63, § 9-66, § 9-67 |
| 2 | **Læreplanen eleven følger** | Den vanlige → 3. IOP som avviker fra læreplanen → 2a. Innføringsopplæring → 2b. Grunnleggende norsk eller morsmål for språklige minoriteter → utfall *Læreplanen gir ikke karakter* (lenke til læreplanboksen i særskilt språkopplæring) | – | ofo. § 9-1, § 9-11. Læreplanene i Grep |
| 2a | **Individuell opplæringsplan** | «Gir planen grunnlag for standpunktkarakter i faget?» Ja → 3. Nei → utfall *Vurdert etter IOP*. Lenke begge veier til steget om IOP i Tilrettelegging | – | ofo. § 9-11 fjerde ledd, § 9-19, § 9-52 sjette ledd |
| 2b | **Innføringsopplæring** | «Gjelder det standpunktkarakter?» Ja → 3 (ikke fritak fra standpunkt). Nei → utfall *Fritak i innføringsopplæringen*. Lenke begge veier til steget om innføringsopplæring | Så lenge innføringsopplæringen varer | ofo. § 9-20 andre ledd. Merknad |
| 3 | **Fritak fra vurdering med karakter** | Sidemål → utfall. Fremmedspråk → utfall. Kroppsøving → utfall. Ingen fritak → 4. Hvert utfall sier hvem som avgjør, hva fritaket betyr for eksamen og vitnemål, og klageinstansen | Veiledning før fritaket | ofo. § 9-18–§ 9-23, § 9-46 andre ledd bokstav c. Udirs klageinstanser |
| 4 | **Fravær i faget** | «Hvor mye fravær teller mot grensen?» Høyst 10 % → 5. Over 10 %, høyst 15 % → 4b. Over 15 % → 6. Lenke til kalkulatoren | – | ofo. § 9-8. Rundskrivet |
| 4b | **Rektors skjønn** | «Avgjør rektor at grensen ikke skal gjelde?» Ja → 5. Nei → 6. Ikke en rettighet for eleven, kan ikke delegeres | – | ofo. § 9-8 fjerde ledd. Rundskrivet pkt. 3.4 |
| 5 | **Nok grunnlag for karakter** | «Har faglæreren nok grunnlag?» Ja → utfall *Karakter settes*. Nei eller tvil → 6 | – | ofo. § 9-1 fjerde ledd, § 9-16. Rundskrivet pkt. 5.2 |
| 6 | **Varsel** | «Er eleven varslet skriftlig?» Nei → utfall *Karakter settes* (uten varsel skal eleven få karakter). Ja, og eleven kan likevel ikke få karakter → 7 | Straks | ofo. § 9-7. Rundskrivet pkt. 6.1 |
| 7 | **Halvår eller standpunkt** | Halvårsvurdering → utfall *Ingen halvårsvurdering med karakter* (ikke enkeltvedtak, ingen klage). Standpunkt → utfall *Vedtak om IV*: rektor selv, IV og FAM51 ved fravær, eksamen annulleres, mer opplæring eller privatist, klage innen 10 dager (lenke til klageveiviseren) | Klage: 10 dager | ofo. § 9-16 sjette ledd, § 9-41, § 5-2, § 10-5. Rundskrivet pkt. 4 og 6 |

**Utfallet «Karakter settes»** sier når standpunkt settes, at karakteren er fastsatt når den er ført, og hva karakteren 1 betyr (særskilt eksamen og mer opplæring), med lenke til klageveiviseren.

**Lenker begge veier** (eier 03.10.2026): IOP og vedtaket i «Tilpasset opplæring og individuell tilrettelegging» ↔ steg 2a. Innføringsopplæring og læreplanboksen i «Særskilt språkopplæring og kort botid» ↔ steg 2 og 2b. Begrepene privatist og karakterpoeng (IV og IM teller null) lenker til begrepet IV.

---

## Pakke 2: Fravær

### Hvordan grensen regnes ut

Alt står i ofo. § 9-8 og Udirs rundskriv om fraværsgrensen (pkt. i parentes).

1. **Årstimetallet** i faget det skoleåret, i klokketimer, fra fag- og timefordelingen (pkt. 3.5, 3.6). Appen henter det fra Grep (fagkoden), og VIGO kontrollerer det: tallene stemmer for alle 954 fagkoder med timetall i dag. Har fylket eget årstimetall, eller får eleven mer opplæring med færre timer, kan brukeren skrive inn tallet selv (pkt. 3.5).
2. **Gjennomgående fag** (f.eks. norsk og kroppsøving): timetallet for det ene skoleåret, ikke hele faget (pkt. 3.8). Grep har egne fagkoder med timer per trinn.
3. **Grensen er 10,0 %** av årstimetallet, og den kan ikke rundes ned (ofo. § 9-8 første ledd «meir enn ti prosent», pkt. 3.5). **15 %** er grensen for rektors skjønn (fjerde ledd). Én avregning for hele året, ikke per halvår (pkt. 3.7).
4. **Økter:** Er øktene kortere eller lengre enn 60 minutter, regnes grensen om: grense i økter = årstimer × 10 % × 60 / øktlengde (pkt. 3.6). Eleven er innenfor så lenge fraværet ikke er mer enn grensen. Brukeren velger øktlengde (45, 60, 90 eller annet).
5. **Hva som teller:**
   - *Teller:* udokumentert fravær og helserelatert fravær (med eller uten egenmelding) til 10 % er nådd (tredje ledd, pkt. 3.3.2).
   - *Teller ikke:* fravær dokumentert med grunnene i andre ledd bokstav b–i (velferd, religiøse høytidsdager i to dager, lovpålagt oppmøte, tillitsvalgt, politisk arbeid, hjelpearbeid, trafikkopplæring, representasjon), når som helst i året (pkt. 3.3.3), og helserelatert fravær dokumentert av helsepersonell *etter* at 10 % er nådd (pkt. 3.3.2).
   - *Er ikke fravær:* skolehelsetjenesten, rådgiving, PPT, avtalt studiearbeid, elevråd, intervju til læreplass, særskilt, ny og utsatt eksamen, undervisning som ikke blir holdt (ofo. § 9-9 femte ledd, pkt. 3.2).
6. **Utfallet:** Under eller på grensen: eleven kan få karakter hvis faglæreren har nok grunnlag. Over 10 %, høyst 15 % udokumentert og egenmeldt: rektor kan avgjøre at eleven likevel får karakter. Over 15 %: eleven kan ikke få standpunkt (eller halvårsvurdering med karakter ved slutten av året i et gjennomgående fag). IV føres med FAM51 (pkt. 6.3).

**Kalkulatoren:**
- Øverst: velg fag (søk på navn eller kode, som i Arbeidsplan) eller skriv inn timer, og velg øktlengde. Svaret er **grensen i klokketimer og i økter**, ved 10 % og 15 %, med utregningen linje for linje og kilde (kortnavn) på hver linje, som poengberegningen (avgjørelse 047).
- **«Sjekk fraværet»** (valgfritt): fire felt (udokumentert, helserelatert, helserelatert dokumentert av helsepersonell etter at grensen ble nådd, dokumentert med andre grunner). En stolpe fra 0 til over 15 % viser fraværet som teller, med merker ved 10 % og 15 %, og utfallet med tekst (WCAG 1.4.1). Ingenting lagres, skjemaet huskes bare i nettleserhistorikken, som i de andre kalkulatorene.
- Under: unntakene a–i med eksempler fra rundskrivet, hva som ikke er fravær, og forskjellen mellom fraværsgrensen og fraværet på vitnemålet (ofo. § 9-53, pkt. 5.1), lukket til de åpnes.
- Tallene 10 og 15 og 60 minutter står i `rules/vurdering/2025.yaml` med `sitat` («meir enn ti prosent», «opp til femten prosent», «én time en klokketime»), og leses med `hentVerdi()`. Beregningen er rene funksjoner i `src/modules/vurdering/beregning/fravaer.ts`.

### Forslag til fasittester (godkjennes av deg før de legges inn)

Fag og timetall fra Grep. «Teller» er fraværet som teller mot grensen.

| # | Tilfelle | Utregning | Svar |
|---|---|---|---|
| FR1 | Engelsk vg1 studieforberedende (ENG1007), 140 timer, økter på 60 minutter | 140 × 10 % = 14 | Innenfor med 14 timer. Over med 15. Rektors skjønn opp til 21 |
| FR2 | Som FR1, økter på 45 minutter | 14 × 60 / 45 = 18,67 økter | Innenfor med 18 økter, over med 19. **Udir sier 17 og 18. Se spørsmål 1** |
| FR3 | Norsk vg1 studieforberedende (NOR1260), 113 timer, 60 minutter | 11,3 timer. 15 %: 16,95 | Innenfor med 11, over med 12. Rektors skjønn opp til 16 |
| FR4 | Kroppsøving vg2 (KRO1018), 56 timer, 45 minutter. Gjennomgående fag | 5,6 timer = 7,47 økter. 15 %: 8,4 timer = 11,2 økter | Innenfor med 7 økter, over med 8. Rektors skjønn opp til 11 |
| FR5 | ENG1007, 60 minutter: 6 timer helse med egenmelding og 8 timer udokumentert. Deretter 2 timer sykdom med legeerklæring | 6 + 8 = 14 (nådd, ikke over). De 2 timene etterpå teller ikke | Innenfor (rundskrivet pkt. 3.3.2) |
| FR6 | ENG1007, 60 minutter: 10 timer udokumentert og 12 timer velferd med dokumentasjon | Teller: 10 | Innenfor, selv om alt fraværet er 22 timer (pkt. 3.3.3) |
| FR7 | ENG1007, 60 minutter: 22 timer udokumentert | 22 > 21 | Over 15 %. Ingen karakter, IV og FAM51 |
| FR8 | ENG1007, 60 minutter: 10 timer sykdom med legeerklæring levert med en gang, så 5 timer udokumentert | Legeerklæringen før grensen er nådd, unntar ikke: 15 teller | Over 10 %. Rektors skjønn: **se spørsmål 3** |

---

## Pakke 3: Eksamen og klage

### Oversikten «Eksamen»

Lukkede deler, med visualisering der det gir oversikt:

- **Trekk og antall eksamener:** et rutenett med trinn (Vg1, Vg2, Vg3, påbygging) mot utdanningsprogram, med antall eksamener i hver rute (ofo. § 9-30, § 9-31).
- **Oppmelding:** skolen melder opp elevene, eleven melder seg selv til ny, utsatt og særskilt eksamen, lærebedriften melder opp lærlinger, privatister melder seg selv (ofo. § 9-27).
- **Særskilt tilrettelegging av eksamen:** rett når eleven trenger det for å vise kompetansen, ikke for manglende kompetanse eller norskferdigheter, søknad til fylkeskommunen (eller rektor ved delegering), ingen absolutt søknadsfrist, eksempler på tiltak, vedtak som kan påklages til statsforvalteren (ofo. § 9-34, merknad, Udirs side). Lenke begge veier til Tilrettelegging.
- **Utsatt, ny og særskilt eksamen:** en tabell med hvem som har retten, når, hva som skjer med standpunkt og med retten til mer opplæring (ofo. § 9-36–§ 9-38, § 5-2).
- **Gjennomføring:** tidsrammer, start kl. 09.00 og senest kl. 10.00, forberedelsesdel, sensur, bortvisning og annullering ved juks (ofo. § 9-28, § 9-32, § 9-33, § 9-39–§ 9-42).
- **Vestland** (bare når Vestland er valgt): bortvisning og annullering av eksamen er en sanksjon med klagerett etter skulereglane, og klagen sendes til rektor (VL-skule § 8 tredje ledd nr. 6, § 13).

### Stegene i veiviseren «Klage på karakter»

Fasene: **Hva klagen gjelder**, **Begrunnelse og frist**, **Skolen**, **Klageinstansen**. Farge: ny (se spørsmål 8).

| # | Steg | Spørsmål → neste | Frist | Kilder |
|---|---|---|---|---|
| 1 | **Hva klagen gjelder** | Gruppert: *Standpunkt:* standpunktkarakter i fag → 2. Vedtak om IV → 2. Orden og oppførsel → 2. *Eksamen:* skriftlig → 6. Muntlig, praktisk eller muntlig-praktisk → 8. *Prøver:* fag- og svenneprøve, praksisbrev- og kompetanseprøve → 9. *Annet:* fritak, tilrettelegging, utsatt eksamen, bortvisning eller annullering → 10. Halvårsvurdering eller annen underveisvurdering → utfall *Ingen klagerett* | – | ofo. § 10-1. Merknadene til § 10-1 og § 10-5 |
| 2 | **Begrunnelse** | Skriftlig fra faglæreren (eller kontaktlæreren i orden og oppførsel), krevd innen fristen → 3 | Innen klagefristen | ofo. § 10-3 første ledd. Merknad |
| 3 | **Klagefristen** | Ti kalenderdager fra eleven fikk karakteren, eller begrunnelsen hvis den kom senere. Skriftlig, til skolen. Eleven klager selv fra 15 år → 4 | 10 dager | ofo. § 10-2. Merknad. Klageveiledningen pkt. 2 og 4 |
| 4 | **Skolen vurderer klagen** | Standpunkt i fag: bare om reglene i § 9-16 er fulgt, ikke karakteren i seg selv. Skolen kan sette karakteren opp, ikke ned. «Endrer skolen vedtaket?» Ja → utfall *Ny karakter* (nytt vedtak, ny klagerett). Nei → 5 | – | ofo. § 10-4 andre ledd, § 10-5 andre ledd, § 10-6 andre ledd. fvl. § 33. Klageveiledningen pkt. 5 |
| 5 | **Statsforvalteren** | Standpunkt i fag: avvise, stadfeste eller oppheve, ikke sette ny karakter. Opphevet → skolen vurderer på nytt og kan la karakteren stå, sette den opp eller ned, og det er endelig. IV: vurderer fraværet, varselet og § 9-16, ikke rektors skjønn. Orden og oppførsel: kan justere opp eller ned → utfall | – | ofo. § 10-4–§ 10-6. Klageveiledningen pkt. 6–8 |
| 6 | **Skriftlig eksamen** | Ingen begrunnelse, men kopi av eget svar og sensorveiledningen. Skolen (fylkeskommunen for privatister) sender klagen og svaret videre uten egen vurdering → 7 | 10 dager fra karakteren er tilgjengelig | ofo. § 10-3 fjerde ledd, § 10-7 andre ledd. Udir «Forberede og ta eksamen» |
| 7 | **Klagenemnda** (utfall) | Ser ikke klagen, kan avvise, stadfeste eller sette karakteren opp eller ned, uten begrunnelse. Datoene for behandling står på tidslinjen | – | ofo. § 10-7. Merknad |
| 8 | **Muntlig og praktisk eksamen** (utfall) | Bare formelle feil som kan ha påvirket resultatet. Muntlig begrunnelse innen fristen. Statsforvalteren stadfester eller annullerer. Annullert → ny eksamen, trekkfag trekkes på nytt | 10 dager | ofo. § 10-3 andre ledd, § 10-8, § 9-37. Merknad |
| 9 | **Fag- og svenneprøve, praksisbrev- og kompetanseprøve** (utfall) | Bare «ikke bestått». Karakteren: klagenemnd (ol. § 8-3). Formelle feil: fylkestinget. Praksisbrev og kompetanseprøve: fylkestinget. Lenke til begrepene lærling og kontrakt om opplæring | 3 uker | ofo. § 10-9, § 10-10. fvl. § 29. Merknad til § 10-2 |
| 10 | **Andre vedtak om vurdering og eksamen** (utfall) | Fritak, særskilt tilrettelegging, utsatt eksamen, bortvisning og annullering: enkeltvedtak, klage etter forvaltningsloven til statsforvalteren (fritak i fremmedspråk: Udir). Vestland: boks med skulereglane | 3 uker | fvl. § 28, § 29. ol. § 29-1. Udirs klageinstanser. VL-skule § 13 |

### Frister og datoer

Registreres i felles format (avgjørelse 046), med tidslinjen «Eksamen og klage gjennom året» fra august til juli, og filter for **Elever**, **Privatister** og **Lærlinger**.

**Står i forskriften** (faste regler):

| Når | Hva | Kilde |
|---|---|---|
| Hvert halvår | Samtale om utviklingen. Fraværet dokumenteres | ofo. § 9-6, § 9-9 femte ledd |
| Midt i opplæringsperioden og ved slutten av skoleåret | Halvårsvurdering | ofo. § 9-13 tredje ledd |
| Straks | Varsel om at karakteren kan falle bort | ofo. § 9-7 |
| 1. mars | Har eleven fulgt opplæringen hit, regnes den som gjennomført (rett til mer opplæring) | ofo. § 5-2 andre ledd |
| Dagen før sensur | Standpunkt fastsettes senest | ofo. § 9-16 fjerde ledd |
| Kl. 09.00 | Skriftlig eksamen starter. Etter kl. 10.00 får kandidaten ikke gjennomføre | ofo. § 9-28 femte ledd |
| 10 dager | Klage på standpunkt, IV, orden og oppførsel og eksamen | ofo. § 10-2 |
| 3 uker | Klage på fag- og svenneprøve og andre vedtak | fvl. § 29 |
| 2 måneder før kontraktstiden er ute | Lærebedriften melder opp til fag- eller svenneprøven | ofo. § 9-56 andre ledd |
| Tidligst 3 måneder før læretiden er over | Fag- eller svenneprøven holdes | ofo. § 9-55 andre ledd |
| Minst en uke etter standpunkt og sensur | Melde seg til mer opplæring (fylkeskommunen setter fristen) | ofo. § 4-3. Står alt i Inntak, lenkes |

**Fastsatt av Udir for hver eksamensperiode** (eksamensplan.udir.no, «Viktige datoer»):

| | Høst 2026 | Vår 2027 |
|---|---|---|
| Skolene melder opp | 1.9.–1.10.2026 | 19.1.–1.3.2027 |
| Privatister melder seg opp | 1.9.–15.9.2026 | 15.1.–1.2.2027 |
| Trekket blir kjent | 12.11.2026 kl. 09 | 28.4.2027 kl. 09 (ekstra trekkdato 12.2.2027) |
| Eksamen | 16.–27.11.2026 | 4.–21.5.2027 |
| Sensurfrist | 5.1.2027 | 18.6.2027 |
| Hurtigklage registreres | – | 30.6.2027 kl. 12 |
| Skolene registrerer klager | 22.1.2027 | 1.7.2027 |
| Klagene er behandlet | 11.3.2027 | 10.9.2027 |

Ny, utsatt og særskilt eksamen holdes i høstperioden. Udir har ingen nasjonal frist for når eleven melder seg til skolen; skolen melder opp innen 1. oktober. To steder er Udirs egne sider uenige (påmeldingen åpner 19. eller 21. januar, hurtigklagen i uke 26 eller 27). Tidslinjen bruker eksamensplanen og lenker dit.

---

## Nye begreper til begrepsbanken

underveisvurdering, halvårsvurdering, standpunktkarakter, sluttvurdering, ikke vurderingsgrunnlag (IV), fraværsgrensen, egenmelding, fritak fra vurdering med karakter, trekkfag, sentralt og lokalt gitt eksamen, tverrfaglig eksamen, utsatt eksamen, ny eksamen, særskilt eksamen, særskilt tilrettelegging av eksamen, fag- og svenneprøve, prøvenemnd, klagenemnd, vitnemål og kompetansebevis, orden og oppførsel. I tillegg oppslaget **Karakterkoder** med søk, fra VIGO (som FAM-kodene).

«Klage» er lenkeord for «Klage på enkeltvedtak». Klage på karakter får derfor ikke eget begrep, men veiviseren lenkes fra begrepene standpunktkarakter og klagenemnd.

---

## VIGO Kodeverksbase

Hentes i `scripts/hent-vigo.ts`, kontrolleres (skjema og minstekrav) før de tas inn, og lastes gjennom `src/data/vigo.ts`.

| Tabell | Hva vi tar med | Brukes til |
|---|---|---|
| `courses` (bare fagkodene i fagindeksen fra Grep) | Årstimetall, vurderingsordning for elev og privatist, sentral eller lokal sensur | **Kontroll** av årstimetallet og vurderingsordningen fra Grep. Avvik kommer i kontrollsaken (i dag stemmer alt: 954 årstimetall og 1913 trekkordninger). **Ny opplysning:** sentralt eller lokalt gitt eksamen på fagarket og i eksamensoversikten |
| `grades` | Karakterkodene som gjelder nå, med VIGOs tekst | Oppslaget «Karakterkoder» (IV, IM, fritatt, deltatt, vurdert etter IOP, G, Ng, Lg …) |
| `relation/fam-connected-to-course` | Hvilke fagmerknader som hører til hvilke fag (153 koblinger) | Fagarket |

`exam-assessments` tas ikke med. `courses` har de samme opplysningene for elev og privatist, én rad per fagkode, mens `exam-assessments` har flere rader per fagkode uten å si hvilken som gjelder elev.

---

## Spørsmål til deg

1. **Udirs regneeksempel stemmer ikke.** Rundskrivet pkt. 3.6: Engelsk vg1 har 140 timer, 10 % er 14 klokketimer, og med økter på 45 minutter blir det «17,5 undervisningstimer», så 18 økter er over grensen. Men 14 klokketimer er 18,67 økter à 45 minutter (14 × 60 / 45), og 18 økter er 13,5 klokketimer, under grensen. Forslag: kalkulatoren regner etter regelen (18 innenfor, 19 over), med en merknad om eksemplet. Eller skal den følge Udirs tall?
2. **Hele økter:** Er det riktig at eleven er innenfor så lenge fraværet ikke er mer enn grensen, så 113 timer gir 11 innenfor og 12 over (FR3)?
3. **Legeerklæring før grensen og rektors skjønn:** Helserelatert fravær med legeerklæring før 10 % teller mot grensen (pkt. 3.3.2). Rektors skjønn gjelder «eigenmeldt eller udokumentert» fravær opp til 15 %. Teller da timene med legeerklæring med i 15 %-rammen (FR8: 15 timer, innenfor 21), eller bare de 5 udokumenterte? Udir sier det ikke. Forslag: de teller med, og står i praksislisten.
4. **Elever som begynner sent eller bytter fag:** Rundskrivet sier at timetallet skal være det samme for alle elevene på skolen, og at et nytt fag starter på null. Kalkulatoren bruker derfor alltid hele årstimetallet og sier det i en merknad. Greit?
5. **Orden og oppførsel:** Med i klageveiviseren og som begrep. Skal de også ha egne steg i «Grunnlag for vurdering», eller holder det med en lenke?
6. **Lærlinger:** Er det greit at fag- og svenneprøven står som en egen gren i «Grunnlag for vurdering» (steg L1 og L2), og ikke som en tredje veiviser?
7. **Eksamensdatoene:** eksamensplan.udir.no har en nedlasting (CSV), men robots.txt stenger for alle andre enn søkemotorene. Forslag (som for Vilbli): datoene står i en fil per eksamensperiode med `grunnlag: praksis` og lenke til eksamensplanen. Kildesjekken følger siden «Administrere eksamen» på udir.no, så en endring gir en kontrollsak, og kontrollrunden i mai og august minner om neste periode. Eller vil du at skriptet henter CSV-en hvert halvår, slik du valgte for Lovdatas sider?
8. **Ny veiviserfarge** for «Klage på karakter»: forslag **bær** (dyp rosa, 700-tone #8a1f5c i lyst tema og 300-tone i mørkt), fordi grønt og rødt er opptatt og de andre fire er brukt. Eller en annen?
9. **Navnet:** «Vurdering og eksamen», eller bare «Vurdering»?
10. **Karakterkodene i VIGO** har en type (V, G, O, I, T, S, P, F) som ikke er forklart. Forslag: vise bare kodene for videregående (V) og orden og oppførsel (O), som er de som har tekster som stemmer med forskriften. Greit, eller vet du hva typene betyr?

---

## Svar fra eier (04.10.2026)

1. **Udirs regneeksempel:** Kalkulatoren regner etter regelen, og Udirs eksempel ses bort fra. FR2: 18 økter innenfor, 19 over.
2. **Hele timer:** Ja. 113 timer gir 11 innenfor og 12 over (FR3).
3. **Legeerklæring før grensen og rektors skjønn:** Både de ti timene med legeerklæring og de fem udokumenterte teller i 15 %-rammen. FR8: 15 timer, innenfor 21, rektor kan avgjøre. Føres i praksislisten.
4. **Sent oppstart og fagbytte:** Ja, alltid hele årstimetallet, med merknad.
5. **Orden og oppførsel** påvirker ikke vurderingsgrunnlaget i fag. Steget om varsel kan nevne at det samme gjelder fare for Ng eller Lg i orden og oppførsel. Ellers får orden og oppførsel eget stoff, som ikke blandes med karaktervurderingen i fag.
6. **Lærlinger:** Eier er usikker, fordi det er flere veier til fag- og svennebrev. Vil se et forslag før det bestemmes (under).
7. **Eksamensdatoene:** Skriptet henter eksamensplanen hvert halvår.
8. **Fargen:** Dyp rosa (bær).

Ikke besvart ennå: 9 (navnet), 10 (karakterkodene) og godkjenning av fasittestene.

### Forslag: veiene til fag- og svennebrev (spørsmål 6)

Veiene er ikke valg brukeren går gjennom steg for steg, men ulike løp side om side. Forslaget er derfor en egen side **«Fag- og svenneprøven»** i delen «Eksamen og klage», ikke en veiviser:

**Øverst: veiene som rader i en figur** (skole, bedrift og praksis som farget felt, prøven til høyre):

| Vei | Opplæringen | Kontrakt | Prøve | Melder opp | Fellesfag | Dokumentasjon | Kilde |
|---|---|---|---|---|---|---|---|
| Lærling | Skole og læretid i bedrift etter tilbudsstrukturen | Lærekontrakt | Fag- eller svenneprøve | Lærebedriften | Må være bestått (unntak for ett eller to, som må bestås etterpå) | Fag- eller svennebrev | ol. § 7-1. ofo. § 9-56, § 9-57, § 9-48 |
| Lærling med annen organisering | F.eks. mer i bedrift, mer i skole, annen rekkefølge, eller både yrkes- og studiekompetanse | Lærekontrakt som viser organiseringen | Fag- eller svenneprøve | Lærebedriften | Som over | Som over | ofo. § 6-3 |
| Elev på Vg3 i skole | Tilbud i skole når søkeren ikke får læreplass | – | Fag- eller svenneprøve som elev | Skolen | Som over | Som over | ol. § 5-6. ofo. § 6-2, § 9-56 første ledd |
| Kandidat for fagbrev på jobb | Minst ett års allsidig praksis i heltid før kontrakten, kontraktstid minst ett år | Kontrakt om opplæring | Fag- eller svenneprøve | Lærebedriften | Trengs ikke | Fag- eller svennebrev | ol. § 7-1. ofo. § 9-58, § 9-48 tredje ledd |
| Praksiskandidat | Allsidig praksis 25 % lenger enn opplæringsløpet, uten opplæring | – | Eksamen og fag- eller svenneprøve | Kandidaten selv, med prøveavgift | Trengs ikke | Fag- eller svennebrev | ol. § 23-2. ofo. § 9-25 tredje ledd, § 9-56 tredje ledd, § 9-48 tredje ledd |
| Lærekandidat | Opplæring mot mindre omfattende mål | Opplæringskontrakt | Kompetanseprøve | Lærebedriften | – | Kompetansebevis | ol. § 7-1. ofo. § 9-64, § 9-51 |
| Praksisbrevkandidat | Opplæring etter lokal læreplan | Opplæringskontrakt | Praksisbrevprøve | Lærebedriften | Må være bestått (unntak for ett) | Praksisbrev | ol. § 7-1. ofo. § 6-3 bokstav e, § 9-57, § 9-64, § 9-48 |

Under figuren står **videre fra lærekandidat og praksisbrev** (godskriving etter konkret vurdering, ofo. § 6-9 tredje ledd) og **godskriving av opplæring og praksis** (ofo. § 6-5–§ 6-12), lukket til de åpnes.

**Under: det som er felles for prøvene**, som lukkede kort: krav før prøven (§ 9-57), oppmelding og frister (§ 9-56: senest to måneder før kontraktstiden er ute), når prøven holdes (§ 9-55: tidligst tre måneder før), prøvenemnda (§ 9-59–§ 9-61), særskilt tilrettelegging (§ 9-62), vurdering og karakterer (§ 9-5, § 9-63, § 9-64), ny og utsatt prøve (§ 9-66, § 9-67), og klage (lenke til klageveiviseren). Lenker til begrepene lærling, kontrakt om opplæring og lærebedrift og til oppslaget over opplæringskontorer.

**I veiviseren «Grunnlag for vurdering»** blir steg L1 og L2 borte. Det første steget får svaret «Lærling, lærekandidat eller praksisbrevkandidat», som gir et utfall om halvårsvurdering i bedrift (§ 9-13 fjerde ledd, ingen fraværsgrense) med lenke til siden over.

### Svar fra eier (04.10.2026, runde 2)

- **Fasittestene FR1–FR8 er godkjent**, med svarene over (FR2: 18 økter innenfor, 19 over. FR8: 15 timer teller, rektor kan avgjøre).
- **Spørsmål 6 og 9:** Eier vil se en mockup. «Fag- og svennebrev» passer ikke under «Eksamen og klage». Mockup A og B er vist som skjermbilder (under).
- **Spørsmål 10:** Eier spør om andre kilder, f.eks. registreringshåndboken.

### Karakterkodene: registreringshåndboken (spørsmål 10)

Registreringshåndboken har kodene som egne felt (sist endret 08.04.2025):

- **B26 Karakterer og andre vurderingsuttrykk:** 1–6, B/IB (bestått/ikke bestått), D (deltatt), F (fritatt), GK (godkjent), IV (ikke vurderingsgrunnlag), IM (ikke møtt), VO (vurdert etter individuell opplæringsplan), og IG (ikke godkjent) for voksne som er realkompetansevurdert. Med kommentarer: IM føres med FAM29 eller FAM39, IV ved bortvisning eller juks på eksamen, IB, IV og IM skal ikke stå på vitnemålet i fag som gir kompetansen, og D-fag uten grunnlag får stiplet linje.
- **B25 Orden og oppførsel:** G, NG og LG. Teksten der («klare avvik») er ikke den samme som i forskriften § 9-4 («store negative avvik»). Appen bruker forskriften.
- **B23 Karakterstatus:** E (feilføring), K (klage), S, N og U (særskilt, ny og utsatt eksamen).

Forslag: oppslaget «Karakterer og vurderingsuttrykk» bygger på B26, B25 og B23, sammen med føringsskrivet punkt 5 og forskriften § 9-3–§ 9-5. Kildesjekken følger de tre feltene (som B16–B19). VIGO brukes bare som kontroll: alle kodene i B26 finnes i VIGO med typen V, så V er karakterene i videregående. Typene trenger da ikke forklares i appen.

### Planen for forsiden (OPPDRAG.md 3.7, eier 04.10.2026)

Forslaget er flyttet til grenen `claude/fase-6`, der forsiden har fått overskriften «Inntak og opplæringstilbud». Etter planen heter modulen **Vurdering** og står under «Elever og opplæring» sammen med Tilrettelegging (to hovedbokser). Mockupene er laget på nytt med det navnet. Med Opplæringstilbud under «Inntak og opplæringstilbud» passer mockup B (veiene til fag- og svennebrev i Opplæringstilbud) bedre enn før.

### Eiers ønsker (04.10.2026, runde 3) og forslag

Eier vil ha «Fag- og svennebrev» i Opplæringstilbud, mer vekt på vurderingspraksis i Vurdering, og at fag- og svennebrev bygges som klosser som kan kombineres og byttes mellom.

**Delingen av innholdet** (hver opplysning står ett sted, med lenker begge veier):

| Opplæringstilbud: «Fag- og svennebrev» | Vurdering: «Fag- og svenneprøven og de andre prøvene» |
|---|---|
| Veiene (løpene) mot fag- og svennebrev, praksisbrev og kompetansebevis | Prøven som sluttvurdering: krav før prøven, oppmelding og frister, prøvenemnda, vurdering og karakterer, særskilt tilrettelegging, ny og utsatt prøve |
| Klossene: skole, kontrakt i bedrift (lærling, lærekandidat, praksisbrevkandidat, fagbrev på jobb), praksis i arbeidslivet | Klage på prøven (klageveiviseren) |
| Bytte underveis, godskriving, fellesfag og unntak (§ 6-2–§ 6-12, § 9-48–§ 9-50, ol. kap. 7 og § 23-2) | Fristene på tidslinjen |

**Fag- og svennebrev som klosser:** Hver kloss er et innholdselement med hva den er, hva den ender i, hvilke klosser man kommer fra, og hvilke man kan gå videre til, med kilde på hver overgang. Øverst velger brukeren mål (fag- eller svennebrev, praksisbrev, kompetansebevis) og kan filtrere på veier uten krav om fellesfag. Løpene står som rader av klosser, og et diagram viser byttene. Klossene og overgangene testes som veiviseren: alle kan nås, og ingen overgang mangler kilde. Før det bygges, leses Udirs sider om lærekandidatordningen, praksisbrevordningen, fagbrev på jobb og praksiskandidatordningen, og overgangene legges fram for eier.

**Vurderingspraksis:** Ny side «Underveis- og sluttvurdering» øverst i Vurdering: skoleåret som stripe (underveis hele året, halvår, standpunkt, eksamen), forskjellen mellom underveis- og sluttvurdering side om side, prinsippene for å vurdere kompetansemålene (§ 9-1, § 9-11, § 9-13, § 9-16 med merknadene), og et søk på fag som viser vurderingsteksten i læreplanen fra Grep (underveis og standpunkt per kompetansemålsett). Ny kilde: Udirs sider «Standpunkt- og underveisvurdering».

### Mockup 3 (04.10.2026)

Etter eiers innspill om navigasjon, tidslinjen, side om side-visningen og siden for fag- og svennebrev:

- **Navigasjon mellom modulene:** Begge sider har sti øverst (f.eks. «Opplæringstilbud › Fag- og svennebrev › Lærekandidat»). Lenker til den andre modulen er merket «I Vurdering». Hver vei lenker til sin prøve i Vurdering, og prøvesiden i Vurdering har «Veiene hit» med lenker tilbake til hver vei i Opplæringstilbud.
- **Underveis- og sluttvurdering:** Tidslinjen er én linje med underveisvurdering hele året, og halvår, eksamen og standpunkt som felt med etikettene over og under. Forskjellen står i én boks med de to kolonnene og felles underoverskrifter på hver rad, så radene står på linje.
- **Fag- og svennebrev:** Tre faner etter hvorfor brukeren kommer: «Veiene» (velg mål, se veiene med stegene som knapper, hvem som melder opp, fellesfag og kilde), «Sammenlign» (velg to veier, side om side i samme boks som over) og «Bytte vei» (fra der man er, til veiene videre, med vilkår og kilde). Ordet «klosser» brukes ikke.
- **Hver vei har egen side** med «Kommer fra» og «Veien videre» som knapper, og prøven i Vurdering som første kort.

### Mockup 4: veiene til fag- og svennebrev (04.10.2026)

Eier ba om flere veier (påbygging, lærling før Vg1 eller etter Vg1, praksiskandidat uten skole, opphenting fra Vg1 studieforberedende) og kilder for fellesfagene. Lest 04.10.2026 (notater: Udir-1-2026 pkt. 3.1, 3.4.2–3.4.5, 3.5.2–3.5.3, Udirs sider om lærekandidat, praksisbrevkandidat, fagbrev på jobb, veilederen om praksiskandidatordningen, ol. § 5-1–§ 5-7, § 7-1–§ 7-3, § 18-3–§ 18-8, § 23-2, ofo. § 6-2–§ 6-12, § 9-46–§ 9-58):

- **Veiene til fag- eller svennebrev (8):** lærling i hovedmodellen; lærling rett etter grunnskolen eller etter Vg1 (0+4, 1+3, særløp); praksisbrev og så fagbrev; fra Vg1 studieforberedende med yrkesfaglig opphenting eller kryssløp; Vg3 i skole uten læreplass; lærekandidat som blir lærling; fagbrev på jobb; praksiskandidat. Voksne (ol. kap. 18) står under hver vei.
- **Bytte vei:** fra grunnskolen, Vg1 studieforberedende, Vg1 yrkesfag, Vg2 yrkesfag (også Vg3 påbygging, som bruker opp ungdomsretten), lærling, lærekandidat, praksisbrevkandidat, ferdig fagbrev (Vg4 påbygging, nytt fagbrev) og praksis i arbeidslivet.
- **Fellesfag i veiene** som egen liste i «Sammenlign».
- **Ikke funnet i nasjonale kilder:** fellesfag for lærekandidater (står i planen for kandidaten), fellesfag i TAF/YSK og vekslingsmodeller, uttrykkelig regel om godskriving når lærekandidat blir lærling, nedre aldersgrense for yrkesfaglig rekvalifisering, krav om grunnskole for praksiskandidater.
- **Udirs kilder er uenige** noen steder: merknaden til § 7-6 om særløp (læreplass etter Vg3) mot Udir-1 (kontrakt etter Vg1); merknadene til § 6-3, § 6-4, § 7-1, § 7-3 og § 7-6 viser til «opplæringsloven § 7-7 tredje ledd»; § 9-64 viser til ol. § 7-4 sjette ledd om opplæringsmål; merknadene til § 9-46 og § 9-48 nevner et unntak for fremmedspråk som ikke står i paragrafen. Nasjonale rammer for yrkesfaglig opphenting (2018) har hjemmel i den gamle loven.

### Svar fra eier (04.10.2026, runde 4)

- Veiene og overgangene ser riktige ut. Eier savner lærekandidat som mulighet allerede etter grunnskolen eller Vg1 («en elev kan når som helst bli lærekandidat»).
- «PB» var påbygging. Praksisbrev beholdes.
- Alle forbedringene tas med, og veiene er lukket fra start.
- Eier vil at VIGO også kontrollerer fagarkene, og at de nye modulene lenker til fagarkene og tilbudene (studieforberedende, yrkesfag, påbygging) der det passer.

**Lærekandidat når som helst – dekning i kildene:** Udir «Hvordan bli lærekandidat» (sist endret 05.03.2026): fylkeskommunen kan godkjenne løp som avviker fra tilbudsstrukturen, «i lærebedrift, i skole eller i en kombinasjon av disse» (ol. § 7-2, ofo. § 6-3 første ledd bokstav c), og rådgivere på ungdomsskolen gir informasjon. ofo. § 7-3 tredje og fjerde ledd: formidling som lærekandidat etter bestått individuelt løp, og etter Vg1 eller Vg2 som ikke er bestått. ol. § 7-2 andre ledd: kontrakten kan endres med samtykke fra fylkeskommunen (lærling ↔ lærekandidat). «Når som helst» står ikke ordrett; appen sier «etter grunnskolen, etter Vg1 eller Vg2, eller ved å endre kontrakten», med disse kildene.

### Pakke 3: eksamensdatoene og Vestland (04.10.2026)

robots.txt hos eksamensplan.udir.no stenger fortsatt, og Udir har ikke API eller datasett for datoene. Eier regner ikke med svar fra Udir innen rimelig tid, og har åpnet for fylkenes sider i miljøet. Fylkene gjengir Udirs datoer og har egne datoer (når standpunkt blir kjent, hurtigklage for avgangselever, når datoene for muntlig eksamen for privatister kommer). vlfk.no bryter tilkoblingen fra skymiljøet, men har svart for kildesjekken i Actions.

### Svar fra eier (04.10.2026, runde 5)

- **Nasjonale datoer:** Et skript henter hvert halvår fra udir.no og flere fylkessider. Finnes datoen hos Udir (udir.no), brukes Udirs dato, uten kontrollsak, også når fylkene har en annen. Ellers tas en dato inn når minst to kilder har den samme, og uenighet gir en kontrollsak.
- **Fylkesdatoer:** Med `gyldighet: fylke`, bare når fylket er valgt. Alle fylkene kan legges inn i bygget, men bare fylker vi har nådd og hentet fra, vises for brukeren.
- **Vestland:** `vlfk-sider` slås på, og kildesjekken henter teksten. Oppgavene som venter på vlfk.no (inntaksområdepoeng, klagenemnd, stegene fra fase 4) tas med når teksten er hentet.
- **Fag- og svenneprøven** bygges nå i pakke 3, med lenke til Udir.
- **Fagarket:** Lykkes hentingen av eksamensdatoer per fag, viser fagarket eksamensdatoen (eller lenker til den på tidslinjen).

### Svar fra eier (04.10.2026, runde 6)

- **Oversikten:** Eksamen og fag- og svenneprøven står ved siden av hverandre, med veiviseren og tidslinjen under.
- **Utsatt, ny og særskilt eksamen** står i én boks: det felles øverst, de tre kortene inni.
- **Sti:** Eksamen og prøvene får en loddrett sti med nummer og datoer, og «Gjelder hele veien» for resten. Begge sidene får samme oppsett, med blå bokser øverst (antall eksamener og prøvene).
- **Sensuren for høsten:** 4. januar 2027 fra fylkene beholdes, fordi appen skal bygge på mest mulig automatikk.
- **Vestland:** Kildesjekken startes manuelt for å hente teksten fra vestlandfylke.no (egen PR, #88).
- **Kalenderen** blir neste pakke: én samlet kalender for alle modulene, rullende tolv måneder eller fast skoleår (inneværende og neste når det finnes datoer, ellers generisk), passerte datoer dempet, flere filtre, tre til fire deler side om side på stor skjerm, lenker til veivisere, begreper og sider, ferdig filtrerte lenker fra sidene, og en forsideboks med de tre neste datoene som kan slås av og på eller står lukket. Grunnlag for årshjulet i fase 8.
- **Lenken på fagarket** går til siden «Eksamen» i appen.
