# Fase 6, pakke 4: Kalenderen – overlevering (04.10.2026, etter 0.35.0)

Start en ny samtale med: «Les docs/arbeidsordrer/fase-6-pakke-4.md og start pakke 4.» Les også `AGENTS.md`, `docs/arbeidsordrer/fase-6-pakke-3.md` (føringene som gjelder videre) og `docs/arbeidsordrer/fase-6-forslag.md` (runde 5 og 6).

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

## Pakke 4: kalenderen (godkjent av eier 04.10.2026, runde 6)

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
4. **Lenker** fra hver dato til veivisere, begreper og sider (nytt felt på fristene). Datoer uten fast dag («Udir fastsetter datoen») vises bare når det er filtrert på tema.
5. **På forsiden:** en boks med de tre neste datoene, som kan slås av og på eller står lukket. På mobil viser den bare neste dato til den åpnes. Vurder hvor mye annet innhold den skyver ned. Vis mockup av variantene.
6. Oppdater `OPPDRAG.md` (fase 8 bygger på kalenderen) og skriv en avgjørelse.

**Først et forslag med mockup til eier.** Bygg deretter, og vis skjermbilder (iPhone 15 Pro i WebKit, PC i 1231 px og mørk visning) før testene kjøres.

## Vestland og Grep (venter på eiers avgjørelse)

Kjøringen 37233727798 (04.10.2026, etter #93) viste:
- **vestlandfylke.no** svarer ikke fra GitHub Actions. TCP-tilkoblingen får tidsavbrudd (`ETIMEDOUT`), også i Chromium etter 60 s. Nettstedet ser altså ut til å stenge IP-adressene i skyen. Hypotesen om at nettleseren kommer gjennom, holdt ikke. Chromium-forsøket koster nå 9 minutter per kjøring.
- **Grep** svarer 429 og slipper bare gjennom om lag to forespørsler i sekundet. Ventingen fungerer (ingen forespørsel trengte mer enn ett nytt forsøk), men hentingen når ikke gjennom på 20 minutter. Appen beholder forrige henting.

Når eier har valgt vei og sidene på vestlandfylke.no kan leses, hentes teksten fra artefaktet «kildetekster» (eller fra eier). Selektoren `main` må kanskje rettes. Deretter legges innholdet fram for eier før det bygges:
- antall inntaksområdepoeng (`vlfk-inntaksreglar`, VL § 2-1)
- klagenemnda i Vestland: inntak og fag- og svenneprøven (`vlfk-sider`, `vlfk-fagproven`)
- stegene som venter fra fase 4: Språk steg 2–3 og 5 og Tilrettelegging steg 0b, 5b og 6 (`vlfk-minoritetsspraklege`, `vlfk-innforingskurs`, `vlfk-tilrettelegging`)
- Vestlands eksamensdatoer i `scripts/eksamen/kilder.ts` (`vlfk-eksamen`, `vlfk-klage-standpunkt`, `vlfk-privatist`). De hentes bare fra GitHub Actions, fordi vestlandfylke.no bryter tilkoblingen fra skymiljøet.

## Åpent

- Kontrollspørsmålene fra pakke 1–3 venter på eier (kontrolloversikten), og to poster i praksislisten (`fravaer-15-prosent-legeerklaering` og `fravaer-helse-etter-grensen`).
- Fylker som stenger skymiljøet (Østfold, Buskerud, Vestfold, Agder, Møre og Romsdal og Troms), legges inn i `scripts/eksamen/kilder.ts` når sidene kan leses. Med Agder får høsttrekket (12. november) to kilder.
- «Fag- og svennebrev» i Opplæringstilbud er ikke bygget. Siden om prøvene får «Veiene hit» da.
- «Dagens jukselapp» kommer i fase 8.

## Arbeidsmåte

Som i `fase-6-pakke-3.md`:
- Først et forslag.
- Ingen tester før eier har sagt at designet er ferdig.
- Push til `test` etter hver designrunde.
- Versjons-PR når eier ber om det.
- Kildesjekken kan startes manuelt (eier 04.10.2026). GitHub-appen sender ikke PR-hendelser til økten, så CI og kjøringer følges med GitHub-API-et.
