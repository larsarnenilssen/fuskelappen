# 048 – Gjennomgang av kildekontroll, fylker og data

**Kontekst:** Eier ba 03.10.2026 om at kontrollen fra poengberegningen (kilder som sjekkes, automatisk oppdatering og fylker som legges inn på samme måte) utvides til resten av appen, og om en vurdering av om dataene er samlet nok. Tre gjennomganger av repoet fant hullene under.

**Valg (gjort nå):**
- **Lov og forskrift:** Endres en paragraf hos Lovdata, lister den ukentlige kontrollsaken innhold og regelverdier som viser til paragrafen (punktet i kilden eller lenken til Regelverk), med et punkt å krysse av. Før ble endringene bare listet til orientering.
- **Sitater fra lovtekst** sjekkes hver uke (avgjørelse 047), og testen krever sitat på tall fra lov og forskrift. Skoleåret (38 uker) har fått sitat fra opplæringslova § 14-1. 190 dager er avledet.
- **Fristdatoene** i Inntak må stå ordrett i paragrafene de viser til (test mot data/lovdata).
- **Typen karakter i løpene** (standpunkt eller halvår) testes mot Grep, og programkodene og navnene testes mot Grep.
- **Fag- og timefordelingen** velges for skoleåret i hele appen (`velgFordeling`), også i poengberegningen.
- **Regelverk som går ut:** Kontrollsaken varsler et halvt år før siste periode av et regelverk går ut. Kildesjekken velger regelsettet etter dato i stedet for faste navn, og sier fra når en tabell ikke kan sjekkes.
- **Fylker:** Søket viser fylkesinnhold (f.eks. begreper som bare gjelder Vestland) bare når fylket er valgt. Relaterte begreper filtreres på samme måte. En test sjekker at alle fylkesnumre i innhold, regler, lovverk og kilder finnes i fylkeslisten, og at skolelisten ikke har ukjente fylker.
- **Kilder:** `udir-lokale-forskrifter` er slått på i kildesjekken, fordi begrepsbanken viser til den.

**Vurdert, ikke gjort (forslag til eier):**
- **Tre Grep-filer fra fase 1** (`data/grep/programomrader.json`, `fagkoder.json`, `arstimer.json`) er avledet av samme henting som `fagindeks.json` og har nesten de samme opplysningene. De oppdateres automatisk, men er dobbelt lagret, og Arbeidsplan laster dem med en gang. De kan erstattes av fagindeksen, men det berører kalkulatorene fra fase 1 og bør gjøres som egen oppgave med tester.
- **Én tolkning av Udir-1:** Poengberegningen (`inntak/beregning/lop.ts`) finner tabellene med nummer, mens Opplæringsløp finner dem med tittel (`fag/tilbud/modell.ts`). Begge testes mot dataene, så et nytt rundskriv gir feilende tester. De kan slås sammen til én tolkning.
- **Felles datalag:** Lastingen av fagindeks, fag- og timefordeling og merknader står i flere moduler. Et felles `src/data/` ville gjøre det enklere å se hva som brukes hvor.
- **Nytt rundskriv (Udir-1-2027) og ny avtaleperiode** oppdages automatisk, men adressen i kilderegisteret og nye regelfiler må legges inn for hånd.

**Konsekvens:** Flere endringer i kildene gir en feilende test eller et punkt i kontrollsaken i stedet for gammelt innhold i appen. Ingenting endres uten at eier ser det.
