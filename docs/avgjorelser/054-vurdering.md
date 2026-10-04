# 054 – Vurdering: underveis og slutt, grunnlag for vurdering og orden og oppførsel

**Kontekst:** Fase 6, pakke 1. Forslaget og mockupene ble godkjent av eier 04.10.2026 (`docs/arbeidsordrer/fase-6-forslag.md`). Eier ville ha en egen modul Vurdering under «Elever og opplæring» (OPPDRAG.md 3.7), mer vekt på vurderingspraksis, orden og oppførsel som eget stoff, og et søkbart oppslag over karakterkodene.

**Valg:**
- **Modulen** `vurdering` har oversikten (`#/vurdering`), siden «Underveis- og sluttvurdering», veiviseren «Grunnlag for vurdering» (rav, avgjørelse 042) og siden «Orden og oppførsel». Fravær, eksamen og klage kommer som egne deler i pakke 2 og 3.
- **Innholdet** står i `content/vurdering/`. Sidene viser vanlige innholdselementer (`forklaring`) som kort som kan åpnes (`Innholdskort`): tittel og første setning synlig, teksten, paragrafene i Regelverk og kildene inne i kortet. Elementene velges med id-prefiks (`us-rad-`, `us-prinsipp-`, `oo-`) i rekkefølgen i filen.
- **Skjemaet** har fått tre felt på vanlige elementer: `paragrafer` (som i stegene, og med i kontrollsakene når en paragraf endres), `sammenligning` (to sider av samme sak, vist med komponenten `Sammenligning` som én tabell med felles underoverskrift per rad) og `kodegrupper` (koder med forklaring i grupper).
- **Skoleåret** er én stripe med underveisvurdering hele året og halvår, eksamen og standpunkt som felt, med etikettene over og under, og en forklaring av fargene (WCAG 1.4.1). Fargene er nye tokens (`--vurdering-*`) i `tema.css`.
- **Vurderingsteksten i læreplanen** hentes fra Grep (underveis og standpunkt per kompetansemålsett, `fag.km`). Faget står i adressen (`?fag=ENG1007`), og fagarket lenker hit med faget valgt.
- **Karakterer og vurderingsuttrykk** er et begrep med `kodegrupper`, bygd på registreringshåndboken B26, B23 og B25 og forskriften. Gruppene er lukket til de åpnes, og åpne når det søkes. Hver kode er med i det samlede søket og åpner oppslaget med koden søkt fram (`?q=IV`). VIGO brukes ikke her.
- **Lenker inn i veiviserne** har med svarene på den korteste veien (`&svar=elev.iop`), så veiviseren ikke viser merknaden om at lenken ikke passet.
- **Regelverk og kilder i kort** (eier 04.10.2026): komponenten `Kortfot` viser paragrafene og kildene som lukkede rader nederst i et kort, slik veiviserne og fristene gjorde fra før. Den brukes i alle kort og bokser i appen. Kilder nederst på en side og i begrepene står som før.
- **Varsel** (eier 04.10.2026): veiviseren har ett steg for varsel om fravær og ett for varsel om manglende grunnlag, rett etter at faren er funnet, og et steg for karakter uten varsel (merknaden til § 9-7, rundskrivet punkt 6.1).
- **Stien tilbake** (`Brodsmuler`) står på alle undersider, også veiviserne, lover og avtaler og fagarket. Kalkulatorene i Arbeidstid står på forsiden (avgjørelse 030) og har ingen sti.
- **Nye kilder:** Udirs merknader til kapittel 9, rundskrivet om fraværsgrensen, siden om standpunktvurdering og registreringshåndboken B26 og oversikten. Alle følges av kildesjekken.

**Konsekvens:** Startpakken øker med 3,1 kB (93,7 kB), fordi tekstene og stilene til modulen lastes med en gang som for de andre modulene. Innholdet og dataene lastes når de trengs. En ny side i Vurdering er innhold med riktig prefiks og en side som viser kortene.
