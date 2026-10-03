# 051 – Status på søkerønsker, Vg4 påbygging og yrkesfaglig opphenting

**Kontekst:** Eier ba 03.10.2026 om tre ting etter gjennomgangen av VIGO Kodeverksbase: et søkbart oppslag over status på søkerønsker, Vg4 påbygging som alternativ i Opplæringsløp, og at overgangen fra Vg1 studiespesialisering til Vg2 på yrkesfag med yrkesfaglig opphenting vises uten at alle Vg2 står som fortsettelse. Dataene skal være samlet, kontrollert og hentet automatisk.

**Valg:**
- **Henting:** `scripts/hent-vigo.ts` henter også `wish-statuses` og `entry-requirements` hver uke. Statusene står i `data/vigo/merknader.json` (`sokerstatuser`), grunnlaget for inntak i `data/vigo/fagrelasjoner.json` (`grunnlag`), bare nasjonalt og bare for programområdene i fagindeksen fra Grep. Hentingen stopper hvis dataene ser feil ut, og endringer kommer i kontrollsaken.
- **Status på søkerønsker:** Begrepet `status-sokeronsker` viser kodene som FAM- og VMM-oppslagene: søk på kode, nummer og tekst, og treff i det samlede søket. Statusene står i VIGOs nummerrekkefølge, som følger gangen i inntaket, med elevplass og læreplass. Tekstene er VIGOs egne, bare på bokmål. Fristen for svar og steget «Søknad, svar og klage» lenker til begrepet.
- **Vg4 påbygging:** `medGrunnlagFraVigo` legger grunnlaget fra VIGO til «bygger på» bare for påbygging som Grep ikke sier hva bygger på. Det gir Vg4 påbygging (PBPBY4) etter lærefagene. Ellers gjelder Grep. PBPBY4 vises som Vg4, ikke Vg3 som i Grep. Tilbud med koblinger fra VIGO har VIGO som kilde.
- **Kontroll mot Grep:** docs/TILBUDSSTRUKTUR.md viser koblingene som bare finnes i VIGO og bare i Grep, så forskjeller blir sett.
- **Yrkesfaglig opphenting:** Opphentingsfag er felles programfag i Grep som brukes i minst tre utdanningsprogram (i dag YFO2002). Vg2 på yrkesfag med et slikt fag, som bygger på et studieforberedende Vg1, står ikke som kryssløp. Vg1 viser en boks med lenke til faget og søk etter Vg2. Vg2 viser Vg1 under «Fra studieforberedende Vg1 med …».

**Konsekvens:** Nytt i Grep eller VIGO kommer med av seg selv. Et nytt opphentingsfag i Grep fanges opp uten kodeendring.
