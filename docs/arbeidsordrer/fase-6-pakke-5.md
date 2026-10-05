# Fase 6, pakke 5: Kalenderen – overlevering (04.10.2026, etter 0.35.0; flyttet til pakke 5 av eier 05.10.2026)

Start en ny samtale med: «Les docs/arbeidsordrer/fase-6-pakke-5.md og start pakke 5.» Les også `AGENTS.md`, `docs/arbeidsordrer/fase-6-pakke-3.md` (føringene som gjelder videre) og `docs/arbeidsordrer/fase-6-forslag.md` (runde 5 og 6). Pakke 4 (fylkene, `fase-6-pakke-4-fylkene.md`) må være levert først.

## Levert så langt

- **0.31.0–0.34.0:** fase 6, pakke 1 og 2 (Vurdering og Fraværsgrensen), forsiden og navnet Jukselappen. Se `fase-6-pakke-3.md`.
- **0.35.0:** fase 6, pakke 3, eksamen og klage (avgjørelse 059):
  - **Eksamen** (`#/vurdering/eksamen`) og **Fag- og svenneprøven og de andre prøvene** (`#/vurdering/fag-og-svenneproven`) har samme oppsett:
    - blå bokser øverst
    - en sti med nummer (`components/Sti.tsx`)
    - «Gjelder hele veien»
    - en lukket samleboks for det som skjer når eleven eller kandidaten ikke består (`components/Samleboks.tsx`)
    - «Videre»
    
    Tabeller i innholdet står i `tabell` (rutenett, kort eller bokser). Tidspunktet over et steg står i `naar`.
  - **Veiviseren «Klage på karakter»** har fargen bær.
  - **Kalender for eksamen** (`#/vurdering/eksamen-og-klage`) og **Kalender for inntak** (`#/inntak/frister`) bruker samme tidslinje (`src/core/tidslinje.ts`, `src/components/Tidslinje.tsx`).
  - **Eksamensdatoene** hentes i januar og august av `npm run hent:eksamen` fra udir.no og åtte fylker (`scripts/eksamen/`) til `data/eksamen/datoer.json`:
    - Udirs dato går foran.
    - Ellers må minst to fylker ha samme dato.
    - Uenighet og mønstre som ikke finner datoen, gir kontrollsak.
    - Fylkenes egne datoer vises bare når fylket er valgt.
    - Høstsensuren er 4. januar 2027 fra fylkene (eier: mest mulig automatikk).
  - Fagarket lenker til Eksamen («Eksamen og klage»).
- **Kildesjekken:**
  - Vestland-sidene på vestlandfylke.no er lagt inn (#88).
  - Teksten fra kildene lastes opp som artefaktet «kildetekster».
  - Jobben har 50 minutter, og Grep-hentingen høyst 20 (#91).
  - Sider som ikke svarer på fetch, prøves med Chromium. Feilmeldingen viser årsaken bak «fetch failed». Grep venter ved 429 (#93).
  - Begge de forhåndsgodkjente endringene av kildesjekken er brukt (eier 04.10.2026). Nye endringer krever eiers avgjørelse.

## Pakke 5: kalenderen (godkjent av eier 04.10.2026, runde 6)

Én samlet kalender for fristene og datoene i alle modulene. Den er grunnlaget for årshjulet og eksporten til kalender (.ics) i fase 8 (`OPPDRAG.md`).

1. **Siden** `#/kalender` samler `frister()` fra alle manifestene. Kalender for inntak og Kalender for eksamen blir lenker til kalenderen, ferdig filtrert, f.eks. `#/kalender?tema=eksamen&vis=privatister`.
2. **Visning:**
   - Brukeren velger mellom rullende tolv måneder og fast skoleår.
   - Inneværende og neste skoleår kan velges når det finnes datoer for neste skoleår. Ellers står det som et generisk skoleår.
   - Passerte datoer er dempet.
   - Loddrett tidslinje med en strek for i dag.
   - På stor skjerm står tre til fire deler av året side om side.
3. **Filtre:**
   - Tema: inntak, vurdering og eksamen, og senere arbeidstid og skolemiljø.
   - Hvem det gjelder: elever, privatister, lærlinger, voksne og fortrinnsrett.
   
   Gruppene i modulene har ulike navn i dag (`ungdom` i Inntak, `elever` i Vurdering), og må få felles navn. Filtrene står i adressen.
4. **Skoleruta** (eier 05.10.2026): kalenderen viser skoleruta fra fylkets lokale forskrift (pakke 4, `lokaltype: skolerute`), med skolestart, ferier og fridager.
   - Der skoleruta brukes, står en merknad om at skoleruta ved den enkelte skolen kan avvike. Vestlands skolerute sier for eksempel at skolene følger vertskommunen.
5. **Kommende endringer i regelverket** (eier 05.10.2026): kalenderen viser når en vedtatt endring i en lov eller forskrift appen har, tar til å gjelde, f.eks. «Endring i opplæringslova § 10-7 gjelder fra 1. august».
   - Kilde: kunngjøringene i Norsk Lovtidend avdeling I, lest hver uke som avdeling II for de lokale forskriftene (avgjørelse 061). «Endrer» (metaField_endrer) viser hvilke lover og forskrifter som endres, og «Ikrafttredelse» når. Bare endringer i dokumentene i `content/lovverk.yaml` tas med.
   - Datoen lenker til kunngjøringen hos Lovdata og til paragrafen i Regelverk. Teksten i appen endres først når endringen gjelder (datasettene har bare gjeldende tekst).
   - Undersøk først om ikrafttredelsen alltid står i metadataene, eller om den kommer i en egen kunngjøring senere («Ikrafttredelse av …»). Da må datoen kunne komme etter endringen.
   - Kontroll: Kunnskapsdepartementets oversikt «Endringer i lover og forskrifter fra 1. januar / 1. juli» på regjeringen.no og Udirs «Nytt til barnehage- og skolestart» kan brukes til å sjekke at ingenting mangler. De lenkes fra kalenderen, men kopieres ikke.
6. **Lenker** fra hver dato til veivisere, begreper og sider (nytt felt på fristene). Datoer uten fast dag («Udir fastsetter datoen») vises bare når det er filtrert på tema.
   - **Fra fagarket** (eier 04.10.2026, fase 6-forslaget runde 5): lenke til kalenderen filtrert på eksamen, siden datoene per fag ikke kunne hentes. I dag lenker fagarket til siden Eksamen.
7. **Svar, svarfrist og andre inntak** (eier 03.10.2026, `fase-5-forslag.md`, «Svar fra eier, runde 2»): en fil per inntaksår med datoene, `grunnlag: praksis`, og en påminnelse i kontrollrunden i mai. Ikke bygget i fase 5 (avgjørelse 046 lenker bare til Vilbli). Prøv først å hente datoene fra fylkenes sider, som eksamensdatoene (avgjørelse 059). Funnet igjen i gjennomgangen 05.10.2026.
8. **På forsiden:** en boks med de tre neste datoene, som kan slås av og på eller står lukket. På mobil viser den bare neste dato til den åpnes. Vurder hvor mye annet innhold den skyver ned. Vis mockup av variantene.
9. Oppdater `OPPDRAG.md` (fase 8 bygger på kalenderen) og skriv en avgjørelse.

**Først et forslag med mockup til eier.** Bygg deretter, og vis skjermbilder (iPhone 15 Pro i WebKit, PC i 1231 px og mørk visning) før testene kjøres.

## Vestland og Grep (avklart)

Grep henter bare det som er endret (avgjørelse 060). Kildene på vestlandfylke.no (`vlfk-*`) er ikke i bruk lenger: fylkenes sider lenkes per tema, og de lokale forskriftene hentes fra Lovdata for alle fylker (avgjørelse 061). Inntaksområdepoeng, klagenemnd og stegene fra fase 4 er dekket av boksen «Hos fylkeskommunen». Vestlands egne eksamensdatoer venter fortsatt på at sidene kan leses (se «Åpent»).

## Åpent

- Kontrollspørsmålene fra pakke 1–3 venter på eier (kontrolloversikten), og to poster i praksislisten (`fravaer-15-prosent-legeerklaering` og `fravaer-helse-etter-grensen`).
- Fylker som stenger skymiljøet (Østfold, Buskerud, Vestfold, Agder, Møre og Romsdal og Troms), legges inn i `scripts/eksamen/kilder.ts` når sidene kan leses. Med Agder får høsttrekket (12. november) to kilder.
- «Fag- og svennebrev» i Opplæringstilbud er pakke 6, etter kalenderen: `docs/arbeidsordrer/fase-6-pakke-6-fag-og-svennebrev.md`. Siden om prøvene får «Veiene hit» da.
- «Dagens jukselapp» kommer i fase 8.
- **Parkert uten fase eller pakke** (funnet i gjennomgangen 05.10.2026):
  - VIGO og Grep er uenige om «bygger på» for noen tilbud (`docs/TILBUDSSTRUKTUR.md`). Eier: «Ta dem opp med meg når det passer». Passer i pakke 6.
  - InSchool-data som ekstra kontroll av koblingen fra fagkode til årsramme (fase 2, avgjørelse 023).
  - Fordelingstabellen i Arbeidsplan ved skrift på 150 % eller mer venter etter eiers ønske (`OPPDRAG.md` kapittel 7).
  - Diskré stjerne på rader uten egen side, f.eks. en eksamensfrist (`fase-6-pakke-3.md`): eier er ikke spurt ennå.
  - KS-prosjektet SAMT-BU kartlegger kommunenes plikter på opplæringsområdet (github.com/samt-x, 05.10.2026). Følg med på om det blir en regeloversikt appen kan bruke.

## Arbeidsmåte

Som i `fase-6-pakke-3.md`:
- Først et forslag.
- Ingen tester før eier har sagt at designet er ferdig.
- Push til `test` etter hver designrunde.
- Versjons-PR når eier ber om det.
- Kildesjekken kan startes manuelt (eier 04.10.2026). GitHub-appen sender ikke PR-hendelser til økten, så CI og kjøringer følges med GitHub-API-et.
