# Fase 5 – forslag til godkjenning (03.10.2026)

Forslaget legges fram før noe bygges (arbeidsordre fase 5). «ol.» er opplæringslova, «ofo.» er opplæringsforskrifta og «VL» er den lokale forskriften om inntak og formidling i Vestland (`vestland-inntak`). Alle paragrafene står i Regelverk i appen (`#/lov/<dokument>/<paragraf>`). Teksten er lest fra `data/lovdata/` (hentet 02.10.2026).

**Udirs sider** (ny kilde `udir-retten-til-vgo`): `https://www.udir.no/regelverk-og-tilsyn/skole-og-opplaring/retten-til-videregaende-opplaring/<side>/`, med sidene `rett-til-videregaende-opplaring`, `inntak-og-formidling`, `inntak-og-formidling-for-voksne`, `kan-jeg-fa-videregaende-opplaring`, `rett-til-omvalg`, `rett-til-pabygging`, `rett-til-mer-opplaring` og `rett-til-yrkesfaglig-rekvalifisering`.

**vestlandfylke.no** svarer fortsatt ikke (03.10.2026, tilkoblingen brytes). Vestland-innholdet bygger derfor bare på den lokale forskriften.

---

## Modul: ny modul «Inntak»

Ny modul **Inntak** i kategorien «Elever og opplæring», ved siden av Tilrettelegging. Inntak er et eget emne i oppdraget (kap. 1.1) og har egne frister til årshjulet i fase 8 (`frister()`). Tilrettelegging handler om opplæringen etter inntaket.

Oversikten i modulen har tre deler, én per pakke:

1. Veiviseren «Hvilken søkerkategori?» (turkis kort, som veiviserne i Tilrettelegging)
2. Tidslinjen «Søknad og frister gjennom året»
3. Kalkulatoren «Poengberegning»

Når Vestland ikke er valgt, står det øverst: «Viser de nasjonale reglene. Velg fylke under Innstillinger for å se lokale regler om inntak.»

---

## Pakke 1: Søkerkategorier og rettigheter

### Søkerkategoriene

| Kategori | Hvem | Kilde |
|---|---|---|
| **Ungdomsrett** | Fullført grunnskole eller tilsvarende (fire grunnlag, se under). Varer til studie- eller yrkeskompetanse, men ikke lenger enn ut skoleåret som starter det året søkeren fyller 24. Skal inn på ett av tre utdanningsprogram på Vg1. | ol. § 5-1 første, andre og sjette ledd. ofo. § 4-1 |
| **Voksenrett** | Fullført grunnskole eller tilsvarende, uten studie- eller yrkeskompetanse, fra skoleåret som starter det året søkeren fyller 19. Skal inn på en av tre sluttkompetanser. | ol. § 18-3. ofo. § 13-1, § 13-3 |
| **Velger voksenrett** | Har ungdomsrett, men kan velge opplæring for voksne fra skoleåret de fyller 19. Før 19 bare ved «særlege grunnar». | ol. § 5-1 tredje og fjerde ledd |
| **Utenlandsk videregående som ikke godkjennes** | Har ungdomsrett. Kan etter søknad få opplæring for voksne. | ol. § 5-1 første ledd andre punktum, fjerde ledd andre punktum |
| **Påbygging** | Bestått fag- og yrkesopplæring. Ungdom til skoleåret de fyller 24, deretter etter reglene for voksne. | ol. § 5-7, § 18-7 |
| **Yrkesfaglig rekvalifisering** | Har studie- eller yrkeskompetanse. Rett til én ny sluttkompetanse på et yrkesfaglig utdanningsprogram. | ol. § 18-4 |
| **Uten rett** | Har brukt opp retten. Kan tas inn hvis fylkeskommunen vil, etter dem med rett. | ol. § 18-5. ofo. § 13-4 tredje ledd. VL § 2-19 |
| **Uten oppholdstillatelse** | Lovlig opphold mens de venter på svar: rett ut skoleåret de fyller 18. Ved avslag: til endelig vedtak. | ol. § 5-9 |

**Grunnlagene for «tilsvarende opplæring»** (ofo. § 4-1 første ledd): a) skrevet ut av grunnskolen etter ol. § 2-2, b) minst ni år grunnopplæring i utlandet, c) realkompetanse tilsvarende fullført forberedende opplæring for voksne, d) privat grunnskoleopplæring i hjemmet.

**Hvordan søkere med ungdomsrett tas inn** (ofo. § 4-14):

| Måte | Vg1 | Vg2 og Vg3 |
|---|---|---|
| Fortrinnsrett: særlig utdanningsprogram (omfattende behov for individuell tilrettelegging) | § 4-21 | – |
| Fortrinnsrett: særskilt tilrettelagt skole (sterkt nedsatt funksjonsevne) | § 4-22 | § 4-27 |
| Fortrinnsrett: tegnspråk | § 4-23 | § 4-28 |
| Individuell behandling | § 4-20 | § 4-26 |
| Konkurrerer på poeng | § 4-18, § 4-19 | § 4-24, § 4-25 |
| Søkere fra andre fylker, ved ledig plass | § 4-14 tredje ledd | samme |
| Deltid (mindre enn fullstendig programområde) | – | § 4-13 fjerde ledd. VL § 2-14 |

### Stegene i veiviseren «Hvilken søkerkategori?»

Fasene: **Rett**, **Inntaksmåte**, **Søknad**. Farge: turkis.

| # | Steg | Spørsmål → neste | Frist | Kilder |
|---|---|---|---|---|
| 1 | **Grunnskolen** | «Har søkeren fullført grunnskolen eller tilsvarende?» Norsk vitnemål → 2. Grunnopplæring i utlandet i minst ni år → 2. Realkompetanse eller hjemmeopplæring → 2. Nei → utfall *Ikke rett til videregående ennå* (mer grunnskoleopplæring, ol. § 9-7, § 18-2) | – | ol. § 5-1 første ledd, § 18-3. ofo. § 4-1. Udir: rett-til-videregaende-opplaring |
| 2 | **Opphold i Norge** | «Har søkeren lovlig opphold, og skal være i Norge mer enn tre måneder?» Ja → 3. Venter på svar på søknad om opphold → 3 (merknad om § 5-9). Nei → utfall *Ikke rett* | – | ol. § 5-1 første ledd, § 5-9 |
| 3 | **Fullført fra før?** | «Har søkeren studie- eller yrkeskompetanse?» Nei → 4. Fra utlandet, men ikke godkjent i Norge → 4. Fag- eller svennebrev → utfall *Påbygging*. Studie- eller yrkeskompetanse → utfall *Yrkesfaglig rekvalifisering* eller *Uten rett* | – | ol. § 5-1, § 5-7, § 18-4, § 18-5, § 18-7 |
| 4 | **Alder** | «Når fyller søkeren 19 og 24?» Under 19 → 5 (ungdomsrett). Fra 19 til og med skoleåret søkeren fyller 24 → «Ungdom eller voksen?» → 5 eller 10. Etter det → 10 (voksenrett) | – | ol. § 5-1 andre–fjerde ledd, § 18-3 |
| 5 | **Kort botid eller særskilt språkopplæring?** | «Har søkeren kommet til Norge nylig, eller har søkeren vedtak om særskilt språkopplæring?» Ja → 6 (frist 1. februar), med lenke til steget «Kort botid?» i veiviseren for særskilt språkopplæring. Nei → 6 | 1. februar | ofo. § 4-9 andre ledd bokstav b og c. ol. § 6-5, § 6-6 |
| 6 | **Hvilket trinn?** | Vg1 → 7. Vg2 eller Vg3 → 7b (vilkår: bestått alle fag på forrige trinn, eller unntakene) | – | ofo. § 4-2, § 4-12, § 4-13 |
| 7 | **Fortrinnsrett?** | «Har søkeren vedtak om individuell tilrettelegging med omfattende behov, sterkt nedsatt funksjonsevne eller rett til tegnspråk?» Ja → utfall *Fortrinnsrett* (frist 1. februar, kommunen melder innen 1. oktober). Nei → 8 | 1. oktober, 1. februar | ofo. § 4-21–§ 4-23, § 4-27, § 4-28, § 4-9 andre ledd bokstav a og d |
| 8 | **Individuell behandling?** | «Mangler søkeren karakter i mer enn halvparten av fagene, har vitnemål uten karakterer, eller ikke sammenlignbart karaktergrunnlag?» Ja → utfall *Individuell behandling* (frist 1. februar ved søknad etter § 4-20 tredje ledd). Nei → 9 | 1. februar | ofo. § 4-20, § 4-26, § 4-9 andre ledd bokstav e |
| 9 | **Konkurrerer på poeng** | → 11. Lenke til poengberegningen (pakke 3) | 1. mars | ofo. § 4-18, § 4-19, § 4-24, § 4-25 |
| 10 | **Voksenrett** | Søker fortløpende, tre sluttkompetanser i prioritert rekkefølge, rett til realkompetansevurdering, ingen ventelister. → utfall | – | ol. § 18-3, § 18-8. ofo. § 13-3–§ 13-5. Udir: inntak-og-formidling-for-voksne |
| 11 | **Hvor søker søkeren?** | «Hvor er søkeren folkeregistrert?» I fylket → utfall. Skal flytte → utfall (søker til nytt fylke). Annet fylke → utfall *Søker fra annet fylke* | – | ofo. § 4-8, § 4-14 tredje ledd |

**Utfallene** sier kategorien, inntaksmåten og søknadsfristen, med lenke til tidslinjen. Klage står som eget utfall fra steg 7–11.

**Vestland** (bare når Vestland er valgt, steg som supplerer de nasjonale):
- Steg 9: inntaksområdepoeng etter folkeregistrert adresse, opptil seks skoler per utdanningsprogram, tilleggspoeng på musikk, dans og drama og idrettsfag (VL § 2-1, § 2-2, § 2-7, § 2-8). Rett til å fortsette på samme skole på studieforberedende, treårig helse- og oppvekstfag og treårig elektrofag (VL § 2-4–§ 2-6).
- Steg 10: ingen søknadsfrist, men bør søke innen 1. mars (høst) eller 1. oktober (vår). Svar innen fristen. Dokumentasjon innen fire uker etter purring (VL § 4-1, § 4-2).
- Steg 11: dokumentasjon av flytting innen 23. juni, folkeregistrert ved skolestart (VL § 2-17). Søkere fra andre fylker etter søkerne i Vestland (VL § 2-20).
- Deltidselever og rekkefølgen for rektor etter det sentrale inntaket (VL § 2-14, § 2-19).

**Lenker begge veier:** Steget «Kort botid?» i særskilt språkopplæring får lenke til steg 5 her. Forklaringen der om rett til videregående peker hit i stedet for å stå alene.

### Rettigheter knyttet til inntak (liste i modulen, lukket til den åpnes)

Omvalg (ol. § 5-5), mer opplæring i fag som ikke er bestått (ofo. § 5-2, § 4-3), læreplass eller annet tilbud på Vg3 (ol. § 5-6), påbygging (ol. § 5-7), gratis opplæring (ol. § 5-8), fullføre på samme skole med tegnspråk eller etter fortrinnsrett (ofo. § 4-17, § 4-27 andre ledd).

---

## Pakke 2: Tidslinje og frister

Tidslinjen går over ett inntaksår, fra oktober til september. Hver frist er et punkt med dato, hvem den gjelder og paragrafen. Fristene registreres i felles format, så årshjulet i fase 8 kan bruke dem.

| Dato | Hva | Hvem | Kilde |
|---|---|---|---|
| 1. oktober | Kommunen melder elever som kan ha fortrinnsrett, til fylkeskommunen | Elever med omfattende behov eller sterkt nedsatt funksjonsevne | ofo. § 4-21 tredje ledd, § 4-22 tredje ledd |
| 4 uker før fristen | Søknadsfristen kunngjøres | Fylkeskommunen | ofo. § 4-9 fjerde ledd |
| **1. februar** | Søknadsfrist: fortrinnsrett, individuell behandling, særskilt språkopplæring, nylig kommet til Norge, tegnspråk | Disse søkerne | ofo. § 4-9 andre ledd. VL § 2-16 |
| **1. mars** | Søknadsfrist for alle andre. Også siste frist for omvalg det året søkeren fyller 19 | Alle | ofo. § 4-9 første ledd. ol. § 5-5. VL § 2-16 |
| 15. mars | Søknader til skoler med tegnspråk sendes videre | Fylkeskommunen | ofo. § 4-11 |
| Etter sensur | Melde seg til mer opplæring i fag som ikke er bestått. Fylkeskommunen setter fristen, minst én uke etter standpunkt og sensur | Elever som ikke har bestått | ofo. § 4-3 |
| 23. juni | Dokumentasjon av flytting til Vestland | Søkere som flytter (Vestland) | VL § 2-17 |
| Juli | **Svar på søknaden (første inntak), svarfrist, andre inntak** | Alle | *Står ikke i lov eller forskrift. Se spørsmål 4.* |
| 3 uker etter svaret | Klage på vedtak om inntak | Søkeren | fvl. § 29. ol. § 29-1 andre ledd |
| Ut august | Rektor følger ventelistene fra det sentrale inntaket | Vestland | VL § 2-19 |
| Første skoledag | Møte, eller melde fra og dokumentere fravær, ellers mistes plassen | Elever (Vestland) | VL § 2-18 |
| 1. september | Inntaket regnes som avsluttet | Vestland | VL § 2-19 |
| 1. oktober | Bør søke innen da for oppstart i vårhalvåret | Voksne (Vestland) | VL § 4-1 |
| 1. november | Slutte i faget innen da for å beholde standpunktkarakteren ved omvalg | Elever som tar fag på nytt (Vestland) | VL § 2-15 |

**Visning:** På mobil en loddrett linje med månedene og fristene som punkter, med dagens dato markert. På PC en vannrett linje over året. Filter: «Ungdom», «Voksne», «Fortrinnsrett og individuell behandling». Lukkede detaljer under hvert punkt. Vestland-punktene vises bare når Vestland er valgt.

---

## Pakke 3: Poengberegning

### Reglene

**Vg1** (ofo. § 4-19 første ledd, med sitat i `rules/inntak/`):
- a) Alle standpunkt- og eksamenskarakterer fra grunnskolen teller med sin tallverdi. Poengsummen er gjennomsnittet med to desimaler, ganget med ti.
- b) Valgfag: gjennomsnittet av standpunktkarakterene i valgfag på ungdomstrinnet, med to desimaler.
- c) Fag med «deltatt» eller «bestått», eller uten vurderingsuttrykk, teller ikke.
- d) Fag med fritak fra opplæring (§ 1-11) eller fritak fra vurdering med karakter (§ 9-19–§ 9-24) teller ikke.
- e) IV og IM teller med verdien null.
- Andre ledd: vitnemål fra forberedende opplæring for voksne (§ 15-26), med egne fritak, og fag godkjent ved realkompetansevurdering teller ikke.

**Vg2 og Vg3** (ofo. § 4-25):
- Standpunkt, eksamen og halvårsvurdering med karakter på Vg1 og eventuelt Vg2. Gjennomsnitt med to desimaler, ganget med ti.
- «Deltatt» og «bestått» teller ikke. Fritak (§ 5-9, § 5-10, § 9-20–§ 9-23) teller ikke. IV og IM teller med null.
- Fag tatt som privatist: det beste utvalget av karakterer. Flere utdanningsprogram eller programområder: det beste utvalget.

**Lik poengsum** avgjøres ved loddtrekning (§ 4-18, § 4-24).

**Vestland** (bare når Vestland er valgt):
- Tilleggspoeng 3, 6 eller 9 på Vg1 musikk, dans og drama og Vg1 idrettsfag (VL § 2-7, § 2-8).
- Inntaksområdepoeng (VL § 2-1). Hvor mange poeng står ikke i forskriften. Se spørsmål 2.
- Vg2 bygger på karakterene fra Vg1, og Vg3 på karakterene fra Vg2 (VL § 2-3 andre ledd). Se spørsmål 3.

**Kalkulatoren:** Legg inn karakterene fag for fag (med valgene «IV», «IM», «fritak» og «deltatt»). Utregningen vises linje for linje: hvilke karakterer som teller, summen, antallet, gjennomsnittet, avrundingen og poengsummen, med paragraf for hver linje. Beregningen er rene funksjoner i `src/modules/inntak/beregning/`. Tallene (to desimaler, ganger ti, tilleggspoengene) leses fra `rules/inntak/` med `sitat`.

**VIGO Kodeverksbase:** Tabellen `courses` har om et fag teller for poeng. Den hentes for fagene i fagindeksen og brukes i Vg2/Vg3 til å merke fag som ikke teller. `entry-requirements` (hva et programområde gir grunnlag for å søke på) kan brukes i steg 6 i veiviseren, filtrert på Vestland (46) og nasjonalt (99). Begge krever ny henting i `scripts/hent-vigo.ts`.

### Forslag til fasittester (godkjennes av deg før de legges inn)

Karakterene er oppdiktet. «Grunnlaget» er de 14 karakterene 5, 4, 4, 3, 4, 5, 5, 4, 5, 5, 4, 5 (standpunkt) og 4, 5 (eksamen). Sum 62.

| # | Tilfelle | Utregning | Poeng |
|---|---|---|---|
| F1 | Vg1, grunnlaget | 62 / 14 = 4,428… → **4,43** × 10 | **44,3** (med avkorting: 44,2. Se spørsmål 1) |
| F2 | Vg1, grunnlaget og valgfag 5, 4, 4 | Valgfag 13 / 3 = 4,33. (62 + 4,33) / 15 = 4,422 → 4,42 × 10 | **44,2** (hvis valgfagene telte hver for seg: 44,1) |
| F3 | Vg1, grunnlaget, men IV i stedet for 3 | 59 / 14 = 4,214 → 4,21 × 10 | **42,1** |
| F4 | Vg1, grunnlaget, men fritak i ett fag med 4 | 58 / 13 = 4,4615 → 4,46 × 10 | **44,6** |
| F5 | Vg1 idrettsfag i Vestland, grunnlaget og 6 tilleggspoeng | 44,3 + 6 | **50,3** |
| F6 | Vg2, ti karakterer fra Vg1 (4, 5, 3, 4, 5, 4, 4, 5, 5, 4) og én halvårsvurdering 3 | 46 / 11 = 4,1818 → 4,18 × 10 | **41,8** |
| F7 | Vg3, karakter 3 i et fag på Vg2, men 5 som privatist | Beste utvalg: 5 brukes | etter svar på spørsmål 3 |
| F8 | Vg2 etter omvalg, to Vg1 som begge gir grunnlag | Beste utvalg av karakterene | etter svar på spørsmål 3 |

---

## Nye begreper til begrepsbanken

ungdomsrett, voksenrett, sluttkompetanse, fortrinnsrett, individuell behandling, karakterpoeng (poengsum ved inntak), omvalg, realkompetansevurdering, privatist, landslinje, og for Vestland (fylkesinnhold): inntaksområde og inntaksområdepoeng, tilleggspoeng, deltidselev.

---

## Spørsmål til deg

1. **Avrunding:** «gjennomsnitt, med to desimalar» (ofo. § 4-19 og § 4-25). Skal 4,428… bli 4,43 (avrunding, 44,3 poeng) eller 4,42 (avkorting, 44,2 poeng)?
2. **Inntaksområdepoeng i Vestland:** Hvor mange poeng? Forskriften sier bare at fylkeskommunen gir utfyllende regler. Skal tallet med i kalkulatoren (som praksis), eller bare forklares?
3. **Vg3:** Forskriften sier karakterene fra Vg1 «og eventuelt» Vg2 (§ 4-25). Vestlands forskrift sier at Vg3 bygger på karakterene fra Vg2 (VL § 2-3). Skal kalkulatoren i Vestland bare bruke Vg2?
4. **Svar, svarfrist og andre inntak** står ikke i lov eller forskrift. Skal tidslinjen lenke til Vilbli for datoene, eller vil du gi meg datoene for Vestland hvert år (som praksis)?
5. **Valgfag:** Teller gjennomsnittet av valgfagene som én karakter i gjennomsnittet (F2)?
6. **Klageinstans:** Vedtak om utdanningsprogram, programområde og skole følger forvaltningsloven § 28 (fylkeskommunens klageorgan), mens vedtak om rett til opplæring går til departementet, i praksis statsforvalteren (ol. § 29-1). Er det riktig forstått?
7. **Fagene på vitnemålet fra grunnskolen:** Skal kalkulatoren ha en ferdig liste over fagene (med kilde i fag- og timefordelingen for grunnskolen), eller bare felt for karakterene?

---

## Svar fra eier (03.10.2026)

1. **Avrunding:** 4,428… blir 4,43, altså 44,3 poeng (F1). Føres i praksislisten.
2. **Inntaksområdepoeng:** Venter til vestlandfylke.no svarer igjen. Kalkulatoren tar dem ikke med, men forklarer at de finnes (VL § 2-1).
3. **Vg3 i Vestland:** Karakterene fra både Vg1 og Vg2 teller, som i ofo. § 4-25. Føres i praksislisten, fordi VL § 2-3 andre ledd bare nevner Vg2.
4. **Svar, svarfrist og andre inntak:** Lenke til Vilbli. Datoene hentes derfra hvert år hvis det er mulig. *Ikke mulig maskinelt:* Vilbli svarer alle automatiske forespørsler med «Human Verification» (avgjørelse 027). Forslag: datoene står i en fil per inntaksår med `grunnlag: praksis` og lenke til Vilbli, og kontrollrunden i mai minner om å legge inn neste års datoer.
5. **Valgfag:** Eier: «Alle standpunktkarakterer, eksamenskarakterer og eventuelle halvårsvurderinger teller like mye i snittet.» *Må avklares:* ofo. § 4-19 første ledd bokstav b sier at det regnes ut et gjennomsnitt av valgfagkarakterene. Skal hver valgfagkarakter telle for seg (F2 = 44,1), eller snittet av valgfagene som én karakter (F2 = 44,2)?
6. **Klageinstans:** Se under.
7. **Fagene på vitnemålet fra grunnskolen:** Ferdig liste, med kilde i fag- og timefordelingen for grunnskolen.

### Klageinstansene (undersøkt 03.10.2026)

Eier 03.10.2026: Klagen sendes til den som fattet vedtaket, normalt inntakskontoret som gjør det på vegne av fylkeskommunen. Undersøk nærmere hvem som er klageinstans.

Det stemmer med fvl. § 32 første ledd bokstav a: klagen settes fram for organet som har truffet vedtaket. Det vurderer klagen først og kan endre vedtaket (fvl. § 33 andre ledd). Hvis ikke, sendes klagen til klageinstansen. Udirs oversikt «Hvem er klageinstanser etter enkeltvedtak?» (sist endret 26.06.2025, ny kilde `udir-klageinstanser`) sier dette om kapittel 4 i opplæringsforskrifta:

| Vedtak (fattes av fylkeskommunen) | Klageinstans | Kilde |
|---|---|---|
| Inntak, unntatt hvilket utdanningsprogram, programområde og skole, f.eks. om søkeren har rett og kommer inn på ett av tre ønsker | Statsforvalteren | ol. § 29-1 første ledd. Departementet har delegert til Udir, som har delegert videre til statsforvalteren |
| Hvilket utdanningsprogram, programområde og skole søkeren tas inn på | Etter fvl. § 28: nærmeste overordnede organ, dvs. fylkestinget eller en klagenemnd fylkestinget har oppnevnt | ol. § 29-1 andre ledd andre punktum. fvl. § 28 andre ledd |
| Inntak av gjesteelever | Samme | Samme |
| Mer opplæring i fag som ikke er bestått (ofo. § 4-3) | Statsforvalteren | ol. § 29-1 første ledd |
| Ikke delta i opplæringen for å ta eksamen som privatist (ofo. § 4-2) | Statsforvalteren | ol. § 29-1 første ledd |

Klagefristen er tre uker fra søkeren fikk vedtaket (fvl. § 29).

**Fortsatt åpent – fortrinnsrett:** Etter den gamle loven var statsforvalteren klageinstans for hele saken når søkeren hadde rett til et særskilt utdanningsprogram på grunnlag av sakkyndig vurdering (Udirs tolkning 30.06.2021, merket utgått). Den nye § 29-1 har ikke det unntaket, og Udirs oversikt nevner ikke ofo. § 4-21. Veiviseren sier derfor bare det som står over, og kontrollspørsmålet spør om klage på fortrinnsrett.

**Vestland:** Hvilket organ som er klagenemnd i Vestland, står ikke i den lokale forskriften. Det venter til vestlandfylke.no svarer.

### Svar fra eier (03.10.2026, runde 2)

- **Valgfag:** Følg forskriften. Gjennomsnittet av valgfagkarakterene teller som én karakter. F2 = **44,2**.
- **Datoer:** Lenke til Vilbli og en fil per inntaksår med `grunnlag: praksis`, med påminnelse i kontrollrunden i mai.

### Nye fasittester for Vg3

| # | Tilfelle | Utregning | Poeng |
|---|---|---|---|
| F7 | Vg3: de elleve karakterene fra Vg1 i F6 (sum 46) og fem fra Vg2: 4, 3, 5, 4, 4. Faget med 3 er tatt på nytt som privatist med 5 | Beste utvalg: 5 i stedet for 3. (46 + 22) / 16 = 4,25 × 10 | **42,5** |
| F7b | Som F7, uten privatisteksamen | (46 + 20) / 16 = 4,125 → 4,13 × 10 | **41,3** (prøver avrundingen ved nøyaktig halv) |
| F8 | Vg2 etter omvalg: to Vg1 som begge gir grunnlag | «Det beste utvalet av karakterar» (ofo. § 4-25 første ledd bokstav f) | *Må avklares:* er det beste av de to løpene som helhet, eller beste karakter fag for fag (f.eks. fellesfag tatt to ganger)? |
