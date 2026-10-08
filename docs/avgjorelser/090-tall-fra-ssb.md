# 090 – Tall fra SSB i Videregående i tall

**Kontekst:** Eier åpnet SSB i miljøet og ba om forslag til tall som utfyller Udirs statistikkbank, blandet med Udirs tall der de handler om det samme (08.10.2026). Eier godkjente skissen med en oversikt og tre temasider, ba om endringer og godkjente SSB som kilde (08.10.2026). Forslaget og skjermbildene står i `docs/forslag/ssb.md`.

**Valg:**
- **Seks tall fra SSB** for landet og fylkene:
  1. 16–18-åringer registrert og framskrevet (07459 og 14746)
  2. unge utenfor arbeid og utdanning (13563 og 13556)
  3. grunnskolepoeng (07495)
  4. utgifter per elev og elever per lærerårsverk (KOSTRA, 12399 og 12609)
  5. lærerne etter alder, kjønn og pedagogisk utdanning (12091 og 12697)
  6. 16–18-åringer i videregående, også etter innvandringsbakgrunn (12274 og 09382)
- **Henting:** `npm run hent:ssb` (`scripts/hent-ssb.ts`) i kildesjekken hver uke, etter tallene fra Udir.
  - PxWebApi v2, json-stat2, 13 kall med minst 2,5 sekunder mellom (SSB tillater 30 i minuttet).
  - Årene velges med `top(n)`, så nye årganger kommer med av seg selv. Tabellene oppdateres en gang i året på ulike tidspunkter, og den ukentlige hentingen tar dem inn innen en uke.
  - Tolkingen er ren logikk i `scripts/statistikk/ssb.ts`, med enhetstester.
  - Skriptet skriver `data/statistikk/ssb.json` (ca. 12 kB) og en endringsrapport med nye årganger.
- **Validering:** Skjemaet står i `src/core/statistikk/ssb-skjema.ts`. `validerSsb` krever tall for landet og alle fylkene det siste året, at verdiene ligger innenfor rimelige grenser, og at fylkene til sammen har like mange 16–18-åringer som landet. Feiler hentingen, beholdes forrige fil, og kildesjekken melder fra.
- **Kilde:** `ssb-statistikkbanken` (CC BY 4.0) med sjekkmetoden `ssb`, godkjent av eier 08.10.2026. Kreditering under «Om» og i hver figur. `ssb-fylkesinndeling` har fått lisensen CC BY 4.0, etter beskjed fra eier.
- **Visning:**
  - Oversikten har fire nøkkeltall fra Udir og tre temakort: Ungdom og søkere, Skolen og Læreplass og fullføring.
  - Hver temaside har «Kort fortalt» med tre tall og kilden, og figurene fra Udir og SSB i deler som kan lukkes. På mobil er bare den første delen åpen.
  - Figurene er tegnet i SVG og CSS (`figurer.tsx`), med fargene fra `tokens.css`, uten nye avhengigheter.
- **Fylkene:** Tabellene på kommunenivå har sammenhengende serier for dagens fylker (`agg_KommFylker`). I de andre har de nye fylkene fra 2024 tall bare fra 2024. Figurene viser null som et hull.

**Konsekvens:** SSBs tall gjelder ofte fylket der folk bor, mens Udirs tall gjelder skolen. Det står under «Hvor tallene kommer fra» og i hver figur. Endrer SSB en tabell, stopper hentingen med en tydelig feil, og appen viser de forrige tallene.
