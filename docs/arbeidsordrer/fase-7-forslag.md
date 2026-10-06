# Fase 7 – forslag 1: privatskolelova og forskriften, og to kolonner på skrivebord

Til eier, 06.10.2026. Svar gjerne punkt for punkt (f.eks. «A1 ja, B2 nei»). Ingenting i Lov og forskrift eller i innholdet endres før du har svart.

Del A er gjort i denne runden, fordi du ba om det direkte. Del B og C venter på svar.

---

## A. Gjort i denne runden (dine ønsker a og b)

**A1. To kolonner på skrivebord** (fra 64rem, som Mer opplæring og Lærlinger og kandidater):

| Side | Venstre | Høyre |
|---|---|---|
| Underveis- og sluttvurdering | Skoleåret, forskjellen, prinsippene | Læreplanen for et fag (fagsøket) |
| Eksamen | Eksamener på hvert trinn, gangen | Hele veien, ikke bestått, «Videre» |
| Fag- og svenneprøven og de andre prøvene | Prøvene (med «Veiene hit»), gangen | Hele veien, ikke bestått, «Videre» |
| Fylkessiden (mitt forslag, gjort) | Hos fylkeskommunen, lokale forskrifter | Skoler og kontor, datoer og klage |

- **Mobil er uendret:** Venstre kolonne er de første delene på siden, og høyre resten. Fagsøket i «Underveis- og sluttvurdering» står fortsatt rett under skoleåret på mobil (din beslutning 04.10.2026). På skrivebord står det øverst til høyre.
- **Hovedregel:** En felles komponent (`ToKolonner`) og en regel i AGENTS.md under «Grensesnitt»: nye sider med flere deler står i to kolonner på skrivebord. Avgjørelse 074. Mer opplæring bruker nå samme komponent.

**A2. Regelverk:** Gruppene på oversikten (lover, forskrifter, lokale forskrifter og avtaler) er lukket fra start, på mobil og skrivebord. Det du åpner, er fortsatt åpent når du går tilbake.

**A3. Andre sider jeg har vurdert:**

| Side | Forslag | Hvorfor |
|---|---|---|
| Fylkessiden | Gjort (A1) | Fire korte grupper. På skrivebord ble siden lang og smal. |
| Fagarket | Spør deg | Kompetansemålene kan stå til venstre, og nøkkeltall, vurdering og timer til høyre. Dette er appens mest brukte side. Siden har eget design som du har godkjent, så jeg venter på ja. |
| Tilbudene i Opplæringstilbud (Vg1, Vg2 …) | Spør deg | Fagene til venstre, og «Videre» og påbygging til høyre. Rubrikkene er mange og lange, så det kan bli ujevnt. |
| Kalkulatorene, poengberegningen, fraværsgrensen og veiviserne | Ikke endre | De har allerede eget oppsett på skrivebord (skjema til venstre, resultat til høyre). |
| Kalenderen, forsiden og Lærlinger og kandidater | Ikke endre | Har eget oppsett. |
| Regelverk, Begreper, Fag og oversiktene i modulene | Ikke endre | Søk og lister leses best i én kolonne. |
| Lov- og forskriftstekst og overordnet del | Ikke endre | Løpende tekst skal ikke deles. |

**Spørsmål A3:** Skal fagarket og tilbudene også stå i to kolonner? (ja/nei for hver)

---

## B. Privatskolelova og forskriften i kildegrunnlaget og Lov og forskrift

**B1. Kildene** er lagt i `content/kilder.yaml`, men står som ikke aktive til du har godkjent utvalget. Kildesjekken melder ellers feil, fordi en aktiv lovtekst må stå i `content/lovverk.yaml`. Opplysningene under er lest hos Lovdata 06.10.2026:

| | Loven | Forskriften |
|---|---|---|
| Tittel | Lov om private skolar med rett til statstilskot (privatskolelova) | Forskrift til privatskolelova (privatskoleforskrifta) |
| Adresse | `lov/2003-07-04-84` | `forskrift/2024-06-03-901` |
| Målform | nynorsk | nynorsk |
| I kraft | 1.10.2003, sist endret 1.8.2026 (LOV-2026-06-19-59) | 1.8.2024, sist endret 1.8.2026 (FOR-2026-06-22-1213) |

- Forskriften er ny fra 1.8.2024, samtidig med opplæringsforskrifta (nr. 900). Den erstatter forskriften fra 2006 (nr. 932, § 18-1).
- Hentingen i Actions kontrollerer id og målform når kildene blir aktive. Finnes ikke et kapittel, stopper hentingen med en feil.

**B2. Utvalget av kapitler i privatskolelova** (forslag):

| Kap. | Tittel | Med? | Hvorfor |
|---|---|---|---|
| 1 | Formålet med og verkeområdet for lova | Ja | Hvem loven gjelder for |
| 2 | Godkjenning med rett til statstilskot | Ja | Vurdering (§ 2-3a) og skolemiljø (§ 2-4) står her |
| 3 | Elevane | Ja | Inntak, rett til vgo, individuell tilrettelegging, bortvisning og rådgivning |
| 4 | Personalet i skolen m.m. | Ja | Ledelse, kompetansekrav og politiattest |
| 5 | Styrings- og rådsorgan | Ja | Styret, internkontroll og overgangen fra grunnskolen |
| 5A | Det beste for eleven … skolereglar og plikt til å delta | Ja | Skolereglene (§ 5A-7) og elevdemokratiet |
| 6 | Offentlege tilskot og skolepengar | Nei | Tilskudd og økonomi |
| 6A | Diverse skolar som gir yrkesretta opplæring | Nei, spør | Egne skoler med egne regler for inntak og bortvisning (§§ 6A-3 og 6A-5) |
| 7 | Diverse | Ja, spør | Tilsyn og reaksjoner (§§ 7-2 til 7-2c), teieplikt, melding til barnevernet og vitnemål (§ 7-10). Kapitlet har også budsjett og regnskap (§ 7-1). Utvalget gjelder hele kapitler. |
| 8 | Sluttføresegner | Nei | |

Kapittel 3 har også noen paragrafer som bare gjelder grunnskolen, f.eks. §§ 3-4d og 3-13. De kommer med fordi utvalget gjelder hele kapitler, som for opplæringslova.

**B3. Utvalget i forskriften** (forslag):

| Del og kapittel | Med? | Hvorfor |
|---|---|---|
| Første del, kap. 1–2 (grunnskolen og leksehjelp) | Nei | Gjelder bare grunnskolen |
| Andre del, kap. 3 Inntak til vidaregåande opplæring | Ja | Inntak, mer opplæring (§§ 3-3 og 3-4) og voksne |
| Andre del, kap. 4 Innhaldet i den vidaregåande opplæringa | Ja | Mer opplæring (§ 4-2, som Udir viser til) og fritak |
| Tredje del, kap. 5 Krav til læreplanane | Ja | Godkjente læreplaner |
| Tredje del, kap. 6 Individuell vurdering | Ja | Vurdering, fraværsgrensen (§ 6-8), eksamen og vitnemål |
| Tredje del, kap. 7 Klage på sluttvurderingar | Ja | Klage på karakter og på fag- og svenneprøven |
| Tredje del, kap. 8 Samarbeid med foreldra | Ja | Én paragraf |
| Tredje del, kap. 9 Tilleggskompetanse | Nei, spør | Krav til lærerne ved skoler med en pedagogisk retning og toppidrett |
| Tredje del, kap. 10 Politiattest og yrkesforbod | Ja | Som opplæringsforskrifta |
| Tredje del, kap. 11 Særskilt tilrettelagd opplæring | Ja | Dokumentasjon og kostnader ved individuell tilrettelegging |
| Fjerde og femte del, kap. 12–18 | Nei | Forsikring, rapportering, personopplysninger, delbetaling, søknadsfrist, lovbruddsgebyr og sluttregler |

**Spørsmål B:** Godkjenner du utvalgene (B2 og B3)? Skal 6A, 7 og 9 med?

---

## C. Hvordan lovene brukes som kilder i appen

**C1. Paragrafene som kilde.** Når lovene står i Lov og forskrift, virker `paragrafer: [privatskolelova/…]` og kilder med `punkt: "§ …"` uten ny kode. Kortet får da «I regelverket».

- **Første bruk:** Kortet «Privatskoler» på Mer opplæring får `privatskoleforskrifta` § 4-2 som kilde, i tillegg til Udir.
- I kontrollspørsmålet til kortet står det i dag at forskriften mangler. Det spørsmålet skrives om.
- Kortet får `kontrollert: null` igjen.

**C2. Bare der reglene er ulike.** Appen er skrevet for fylkeskommunale skoler. Privatskolelova tas inn som kilde der den gir egne regler, ikke som en kopi av opplæringslova. Stedene i appen:

| Sted i appen | Privatskolelova eller forskriften | Viser til opplæringslova? | Forslag |
|---|---|---|---|
| Inntak: veiviseren «Rett, inntak og søknad» | pl. § 3-1: skolene skal «stå opne for alle som fyller vilkåra for inntak i offentlege skolar». Inntak er enkeltvedtak, og departementet er klageinstans. Reglene står i forskriften kap. 3. | Ja: «jf. opplæringslova § 2-1 og § 5-1 første ledd» | En kort merknad i steget om inntaksmåte: skolen tar inn selv, og klagen går til departementet |
| Inntak: rett til vgo | pl. § 3-2: elevene bruker retten etter ol. §§ 5-1, 5-5, 5-7, 5-9, 18-3 og 18-4 | Ja | Ingen endring. Retten er den samme. |
| Mer opplæring | psf. §§ 3-3, 3-4 og 4-2 | Delvis | C1 |
| Vurdering, fravær og eksamen | pl. § 2-3a gir hjemmelen. Reglene står i psf. kap. 6, f.eks. § 6-8 om fraværsgrensen, og ligner opplæringsforskrifta. | Nei | Ingen egne kort. Parallellparagrafen kan stå som ekstra kilde der den finnes (spør) |
| Klage på karakter (veiviseren) | psf. kap. 7. Statsforvalteren er klageinstans (§§ 7-4 til 7-6). | Delvis | En merknad i første steg om at reglene for privatskoler står i psf. kap. 7 |
| Individuell tilrettelegging (Tilrettelegging) | pl. § 3-6: «Reglane i opplæringslova §§ 11-4 til 11-11 gjeld tilsvarande». Heimkommunen eller heimfylket gjør vedtaket, og departementet er klageinstans. | Ja | Merknad i steget om vedtak og klage: hvem som vedtar, og klageinstansen |
| Skolemiljø og aktivitetsplikt (fase 7) | pl. § 2-4: ol. kap. 12 gjelder. «Rektor» leses som «dagleg leiar», og «kommunen og fylkeskommunen» som «skolen» eller «skolens styre». | Ja | Se C3 |
| Skoleregler (fase 7) | pl. § 5A-7: skolen skal ha skoleregler, og styret kan si hvilke tiltak som kan brukes og hvordan sakene behandles | Nei, egen regel | Skolereglene for privatskoler er ikke lokale forskrifter i Lovdata. Se C4. |
| Bortvisning | pl. § 3-10: egne grenser. Daglig leder vedtar selv, og departementet er klageinstans. | Nei, egen regel | Tas med i fase 7 sammen med skolereglene |
| Bortvisning fra eksamen | psf. § 6-38 | Nei, parallell | Ingen endring |
| Opplæringstilbud: skolelisten | (ingen regel) | | C4 |

pl. = privatskolelova, psf. = privatskoleforskrifta, ol. = opplæringslova. Paragrafene står i Lovdatas innholdsliste. Teksten jeg siterer, er fra § 2-4, § 3-1, § 3-2, § 3-6 og § 5A-7, lest 06.10.2026.

**Spørsmål C2:** Er listen riktig avgrenset? Skal vurdering og eksamen få parallellparagrafen i privatskoleforskrifta som ekstra kilde, eller bare en merknad ett sted?

**C3. Skolemiljøet i fase 7.** Privatskolelova § 2-4 sier at opplæringslova kapittel 12 gjelder for privatskolene. Det gir disse henvisningene i stegene i aktivitetsplikten:

| Steg | Henvisning |
|---|---|
| Følge med, gripe inn, varsle, undersøke og sette inn tiltak (ol. § 12-4) | «For privatskoler: rektor leses som daglig leder (privatskolelova § 2-4).» |
| Skjerpet aktivitetsplikt (ol. § 12-5) | «For privatskoler er det skolens styre som skal sørge for at den skjerpede aktivitetsplikten følges.» |
| Melde saken til statsforvalteren (ol. § 12-6) | Samme ordning. «Kommunen og fylkeskommunen» leses som «skolen» i tredje og fjerde ledd. |
| Det fysiske miljøet (ol. § 12-7) | Departementet er klageinstans for enkeltvedtak, ikke statsforvalteren |

Ordlyden i høyre kolonne er et utkast og får kontrollspørsmål. Jeg har ikke funnet ut om departementet har delegert klagen etter § 12-7 til Udir eller statsforvalteren. Det skrives ikke før det har belegg.

**C4. Når valgt skole er en privatskole.**

- Skoleregisteret (`data/skoler/vgs.json`) har i dag bare id, navn, fylke og kommune. NSR har et felt for om skolen er offentlig eller privat.
- **Forslag:** Utvide hentingen med feltet `privat: true/false` (bare et ekstra felt i registeret, ikke en ny verdi i `gyldighet`).
- Når brukeren har valgt en privatskole, viser sidene i C2 en liten merknad øverst: «Skolen din er en privatskole. Der privatskolelova har egne regler, står det i kortet.» Merknaden lenker til privatskolelova i Lov og forskrift.
- Skolereglene for en privatskole er ikke lokale forskrifter, så Regelverk har dem ikke. Der står det «Privatskoler har egne skoleregler etter privatskolelova § 5A-7. Spør skolen.»
- Hvordan merknaden ser ut, legges fram med skjermbilder før det bygges. Krever det en endring i `gyldighet`, kommer det et avgjørelsesnotat.

**Spørsmål C4:** Ja til feltet `privat` og merknaden?

**C5. Begrepsbanken.** Et nytt begrep:

> **Privatskole** (nn. privatskole): skole som er godkjent etter privatskolelova og har rett til statstilskudd. Loven gjelder ikke skoler uten slik godkjenning.

- Kilde: pl. §§ 1-2 og 2-1.
- Begrepet lenker til loven i Lov og forskrift og legges i `content/begreper/regelverk.yaml`.
- Det får `kontrollert: null` og kontrollspørsmål.

**C6. Kontroll.** Lovteksten følges av kildesjekken hver uke, som de andre lovene. Nytt innhold får `kontrollert: null` og kontrollspørsmål med kilder.

---

## Rekkefølgen etter svarene dine

1. **PR 1 (denne):** to kolonner og Regelverk (A), kildene som ikke aktive og dette forslaget.
2. **Lovene:** utvalget i `content/lovverk.yaml` og kildene aktive. Teksten kommer i neste kildesjekk, eller når du starter den manuelt i Actions.
3. **Innholdet etter C1, C2, C4 og C5:** kortet om privatskoler, merknadene og begrepet. Deretter skolemiljøet (fase 7), med mockup først.

---

## Svar fra eier 06.10.2026

- **A3:** Fagarket og tilbudssidene skal også stå i to kolonner.
- **B:** Alle kapitlene i forslaget tas med, også 6A og 7 i privatskolelova og 9 i forskriften.
- **C:** Paragrafene skal vises der det er foreslått når brukeren har valgt privatskole, i et felt eller med en bryter ved skolevalget. Sidene merkes der det er nyttig, og de nye kildene vises, eller erstatter de gamle der det er riktig. Brukeren skal få se det lovverket som er relevant, avhengig av om de arbeider ved eller vil ha informasjon om en privatskole.

## Runde 2 (gjort 06.10.2026, avgjørelse 074 og 075)

- **To kolonner:**
  - **Fagarket:** Læreplanverket, kompetansemålene og vurderingen står til venstre. Nøkkeltallene, faktaene og programområdene står til høyre. På mobil er rekkefølgen som før. Delene er lukket fra start, som før, så venstre kolonne er kort til en del åpnes.
  - **Tilbudene:** Fagene og tilpasningene står til venstre, og veien videre, skolene, yrkene og Vilbli til høyre.
- **Lov og forskrift:** Begge står i `content/lovverk.yaml`, og kildene er aktive. Teksten kommer i neste kildesjekk, som bare går fra `main`.
  - Til teksten er hentet, viser Regelverk dem ikke, og kildene lenker til Lovdata.
  - Når teksten er hentet, står lovene i en egen gruppe «Privatskoler». Med «Privatskole» valgt står de først blant lovene og forskriftene.
- **Bryteren «Privatskole»** står under fylke og skole i innstillingene.
  - Et valg av skole setter den etter Nasjonalt skoleregister: på for private skoler og av for offentlige. 141 av de 563 skolene er private.
  - Brukeren kan endre den, også uten valgt skole.
- **Med «Privatskole» på:**
  - **«For privatskoler»** (en boks i kortet eller steget) står på disse stedene:
    - Inntak: inntaksmåten (pl. § 3-1)
    - Klage på karakter: første steg (psf. kap. 7)
    - Tilrettelegging: vedtaket og klagen (pl. § 3-6)
    - Orden og oppførsel: skoleregler og bortvisning (pl. §§ 5A-6, 5A-7 og 3-10)
  - **Kildene byttes:** 56 paragrafer i opplæringsforskrifta har en parallell i privatskoleforskrifta (`content/privatskole/paralleller.yaml`): vurdering, fravær, eksamen, vitnemål, klage, inntak og mer opplæring. Kildene og «I regelverket» viser parallellen i stedet.
  - **Ikke byttet,** fordi privatskoleforskrifta ikke har en paragraf om det samme: inntaksfristene og fordelingen av plassene, fag- og svenneprøven og klage på prøvene.
- **Mer opplæring:** Kortet «Privatskoler» har psf. §§ 4-2 og 3-4 som kilde, alltid.
- **Begrepet «Privatskole».**
- **Kontroll:** Alt nytt har `kontrollert: null` og kontrollspørsmål. Parallellene er en liste til din kontroll. Titlene testes mot teksten fra Lovdata når den er hentet.

**Åpent:**
- Om departementet har delegert klagen etter pl. §§ 3-1, 3-6 og 3-10, f.eks. til Udir eller statsforvalteren. Det er spurt i kontrollspørsmålene.
- Skolemiljøet (fase 7) bruker den samme boksen for henvisningen til pl. § 2-4 («rektor» leses som «dagleg leiar»).

---

## Runde 3: skolemiljøet og Elevundersøkelsen (06.10.2026)

PR-en med privatskolene og to kolonner er flettet ([#116](https://github.com/larsarnenilssen/jukselappen/pull/116)). Kildesjekken er startet, så teksten til privatskolelova og forskriften kommer inn i Lov og forskrift.

### D. Mockup av skolemiljøet (i appen, på `test`)

Ny del av appen, «Skolemiljø», i kategorien med samme navn på forsiden (avgjørelse 076).

**D1. Veiviseren «Aktivitetsplikten»** (`#/skolemiljo/aktivitetsplikten`, egen farge: indigo):

| Fase | Steg | Kilde |
|---|---|---|
| (start) | Hvor starter saken? Seks innganger: ingen sak ennå, du ser en krenkelse, mistanke, eleven sier det selv, en ansatt krenker, eleven eller foreldrene mener skolen ikke gjør nok | ol. § 12-2, rundskrivet 6.2.1 |
| I hverdagen | Følge med, Gripe inn | ol. §§ 12-3, 12-4 første ledd, 13-4, rundskrivet 6.3.1–6.3.2 |
| Melde fra | Melde fra til rektor, Når en som arbeider på skolen, krenker en elev | ol. §§ 12-4 andre ledd, 12-5, 10-8, rundskrivet 6.3.3–6.3.4 |
| Undersøke og sette inn tiltak | Undersøke saken, Tiltak og tiltaksplan, Dokumentere, Følge opp og evaluere (spørsmål: har eleven det trygt og godt nå?), Eleven har det trygt og godt | ol. § 12-4, rundskrivet 6.3.5–6.5 |
| Statsforvalteren | Melde saken til statsforvalteren (én uke, hva statsforvalteren vurderer, klage til Udir) | ol. §§ 12-6, 12-8, rundskrivet kap. 7–8 |

- Hvert steg har ansvar, dokumentasjon og frist, som i Tilrettelegging.
- **Privatskoler** (bryteren «Privatskole»): Melde fra, skjerpet plikt og statsforvalteren har boksen «For privatskoler».
  - Der loven sier rektor, gjelder det daglig leder.
  - Der den sier kommunen eller fylkeskommunen, gjelder det skolens styre (§§ 12-4 andre ledd og 12-5) eller skolen (§ 12-6).
  - Heller ikke privatskoler kan klage på statsforvalterens vedtak.
  - Kilde: privatskolelova § 2-4 og rundskrivet kap. 8.
- **Ordet:** Rundskrivet kaller planen «tiltaksplan». Appen bruker det og nevner «aktivitetsplan» i parentes. Spørsmål til deg i kontrollspørsmålene.

**D2. Siden «Skoleregler»** (`#/skolemiljo/skoleregler`, to kolonner på skrivebord):
- **Venstre: reglene i loven, tre kort.**
  - «Skolereglene er en forskrift» (ol. §§ 10-6 til 10-8)
  - «Bortvisning» (ol. § 13-1)
  - «Pålagt skolebytte» (ol. § 13-2)
  - Hvert kort har en merknad for privatskoler (pl. §§ 5A-7, 3-10 og 2-4).
- **Høyre: skolereglene i fylket.** For valgt fylke står paragrafene om reaksjoner, saksbehandling og klage åpne, med titlene fra Lovdata, og «Les hele skolereglene».
  - Alle 15 fylker har et kort, med paragrafer valgt ut fra titlene. Hvert kort har et kontrollspørsmål om utvalget.
  - Trøndelag har bare én paragraf om konsekvenser og ingen om saksbehandling.
  - Fylker med egne skoleregler for voksne får en lenke til dem.
- **Høyre: skolens egne regler.** For valgt skole står skolens forskrift når den finnes i Lovdata. Finnes den ikke der, står det at skolen likevel kan ha regler som ikke er kunngjort.
- **Med «Privatskole» valgt** står det at fylkets skoleregler ikke gjelder, med henvisning til pl. § 5A-7.
- **Videre:** lenker til aktivitetsplikten, orden og oppførsel og fylkessiden.

**Spørsmål D:**
1. Er inndelingen av veiviseren god, og mangler det steg (f.eks. informasjon til foreldrene som eget steg, eller samarbeid med barnevernet)?
2. Skal skolereglene vise paragrafene som lenker (slik nå), eller teksten i paragrafene åpen på siden?
3. Skal «Skolemiljø» ha flere oppslag, f.eks. det fysiske miljøet (ol. § 12-7 og forskriften om miljørettet helsevern)?

### E. Elevundersøkelsen (forslag, ikke bygget)

**Kilden:**
- Udirs statistikkbank har et åpent API uten nøkkel: `api.statistikkbanken.udir.no/api/rest/v2/Eksport`.
  - Tabell 152 har indeksene (skala 1–5) og tabell 154 mobbing (andel i prosent).
  - Dataene er per skole (organisasjonsnummer, som i skoleregisteret), fylke og hele landet, per trinn (Vg1, Vg2 og Vg3) og skoleår. Nyeste skoleår er 2025–26.
- **Lisens:** NLOD etter data.norge.no. Udirs vilkår krever kreditering («Inneholder data under NLOD, tilgjengeliggjort på data.udir.no»), som legges under «Om».
- **Risiko:** Udir skriver at API-et «ikke er ment for ekstern bruk i dag, og vil endres uten varsel». Hentingen må derfor feile tydelig og beholde forrige datasett, som de andre hentingene (avgjørelse 049).

**Forslag til innhold:**

| Tas med | Hvorfor |
|---|---|
| **Mobbing på skolen** (andel mobbet) | Det viktigste tallet for skolemiljøet |
| Mobbet av andre elever, digitalt og av voksne på skolen | Viser hvem som mobber. Mobbing fra voksne hører til den skjerpede plikten |
| **Trivsel**, **Støtte fra lærer**, **Læringskultur** | Skolemiljøet i klassen |
| **Felles regler**, **Elevdemokrati og medvirkning** | Skolereglene og elevrådet |
| Mestring, Motivasjon, Vurdering for læring, Faglig utfordring | Læringsmiljøet. Kan tas med eller ikke (spør) |
| Ikke med: Støtte hjemmefra, Utdanning og yrkesveiledning | Den siste gjelder bare Vg1 og rådgivingen på ungdomsskolen |

**Forslag til visning** (siden «Elevundersøkelsen» i Skolemiljø):
- **Valgt skole:** Hver indeks som en rad med skolen, fylket og landet side om side, per trinn (Vg1, Vg2 og Vg3), fordi API-et ikke har tall for alle trinn samlet.
  - Appen regner ikke ut egne snitt, fordi det kan avsløre skjulte tall.
- **Mobbing** står først og i prosent, med Udirs egen forklaring av hvem som regnes som mobbet. Forklaringen hentes fra Udir og kontrolleres før den skrives.
- **Uten valgt skole:** fylket mot landet. **Uten valgt fylke:** bare landet.
- **Privatskole valgt:** Tallene for skolen sammenlignes med landet for alle eierformer. Kan også vises mot privatskolene samlet (spør).
- **Skoleår:** siste skoleår, og forrige år som en liten pil opp eller ned.

**Små grupper og skjulte tall:**
- **Skjermede tall:** Udir skjermer tall etter egne regler. Grensen er færre enn 20 svar bak tallet, og færre enn 30 for mobbing, og det finnes også andre regler.
  - I API-et står skjermede tall som «\*». Appen viser «Skjermet» og en forklaring med lenke til Udirs skjermingsregler.
  - Appen viser aldri et tall Udir har skjermet, og regner ikke ut tall som kan avsløre det.
- **Manglende tall:** Har skolen ikke tall for et trinn (ingen elever eller ikke deltatt), står «Ingen tall for Vg2».
- **Ingen tall om enkeltelever:** Appen henter bare tallene Udir publiserer for skolen, fylket og landet.

**Henting:**
- Et skript i kildesjekken (`npm run hent:elevundersokelsen`) lagrer tallene i `data/elevundersokelsen/`. Det er om lag 200 kB per skoleår, som lastes først når siden åpnes.
- Elevundersøkelsen kommer én gang i året, så hentingen gjør bare noe når det er nye tall.

**Spørsmål E:**
1. Hvilke indekser skal med? Alle i tabellen, eller bare skolemiljøet (mobbing, trivsel, støtte fra lærer, læringskultur, felles regler og elevdemokrati)?
2. Skal enkeltspørsmålene om mobbing (av elever, digitalt, av voksne) med, eller bare indeksen?
3. Skal forrige skoleår vises?
4. Privatskoler: Sammenlignes de med landet for alle eierformer eller med privatskolene?

## Svar fra eier 06.10.2026 (runde 3)

- **Forsiden:** Skal «Skolemiljø» ha egen overskrift, eller stå under «Elever og opplæring»? Skal «Eksamen og klage» løftes fram? Eier spurte hva Claude tenker.
- **Veiviseren** er satt sammen feil: seks innganger som møtes, alle går gjennom «melde til rektor», og alt vises på én gang med felles utfall.
- **Skoleregler:** Lenker til paragrafene er greit. Forskriften om mobil og smartklokker for Slåtthaug vgs mangler. Søket i Lovdata skal utvides, også til ordens- og atferdsreglement.
- **Elevundersøkelsen:** Alt skal med, også mobbing. Visuelt og oversiktlig, med skole mot skole, fylke mot fylke og begge mot landet, og fjoråret. Privatskoler skal kunne sammenlignes med andre grupper og sin egen. Standard er eget fylke og egen skole, og det skal være enkelt å bytte.
- **Tiltaksplan (aktivitetsplan i parentes):** Ja, det er greit.

## Runde 4 (gjort 06.10.2026, avgjørelse 061, 076 og 077)

**F1. Forsiden.** Claudes vurdering: «Skolemiljø» beholder egen overskrift, fordi kategorien nå har tre bokser: Aktivitetsplikten, Skoleregler og Elevundersøkelsen. «Eksamen og klage» blir en egen boks under «Elever og opplæring», ved siden av «Vurdering», og ikke en egen modul. Adressene og favorittene er de samme som før.

**F2. Aktivitetsplikten etter rolle.** Veiviseren spør først «Hvem er du i saken?»:

| Rolle | Veien |
|---|---|
| Den som arbeider på skolen | Hva har skjedd? Du ser en krenkelse → gripe inn → melde fra. Mistanke → melde fra. En ansatt krenker → skjerpet plikt. Veien slutter når saken er meldt, med lenke til rektors del |
| Rektor | Undersøke → tiltak og tiltaksplan → dokumentere → følge opp og evaluere. Er eleven ikke trygg ennå, tilbake til tiltak, eller saken til statsforvalteren |
| Eleven eller foreldrene | Har det gått en uke etter at saken ble tatt opp med rektor? Ja → statsforvalteren. Nei → ta saken opp med skolen |

**F3. Flere skoleregler fra Lovdata.** Forskrifter fra fylkeskommunene, Oslo kommune og de videregående skolene med mobil, smartklokke, reglement, atferd, oppførsel eller ordens i tittelen kommer med. Regler for mobil står for seg ved siden av skolereglene. Hele registeret leses på nytt neste gang kildesjekken går på `main`, så forskriften for Slåtthaug kommer først etter fletting.

**F4. Elevundersøkelsen** (`#/skolemiljo/elevundersokelsen`):
- **Tallene:** Alle 15 spørsmål og indekser i Udirs tabeller: «Mobbing på skolen» og mobbet av elever, digitalt og av voksne, og alle de elleve indeksene. Skoleårene 2024–25 og 2025–26, for 412 skoler, alle fylker og landet.
- **Sammenligning:** Opptil tre serier, valgt i tre menyer: landet, et fylke eller en skole. Landet og fylkene finnes for alle, offentlige og private skoler.
  - Standard er egen skole, eget fylke og landet.
  - Med «Privatskole» er standard egen skole, eget fylke og private skoler i hele landet.
- **Visning:**
  - Nøkkeltall for mobbing
  - Mobbing som søyler og indeksene som punkter på skalaen 1–5, med fjoråret som hult merke og endringen i tekst
  - Trinnvalg (Vg1, Vg2 og Vg3) og bryter mellom diagram og tabell
  - Valgene står i adressen, så en sammenligning kan lagres som favoritt
- **Om tallene:** Hvem som svarer, når tallene kommer, hva skjermet betyr, og kreditering under «Om» (NLOD).
