# 061 – Fylkene og lokale forskrifter

**Kontekst:** Appen hadde eget innhold for Vestland, hentet fra sidene til fylkeskommunen. Flere fylkeskommuner stenger for automatiske forespørsler, og Vestland gjorde det også fra GitHub Actions. Eier vil ha en løsning som gjelder alle fylker likt, uten import som bare gjelder ett fylke (05.10.2026). Skoleregler for fylket og for hver skole er lokale forskrifter og står i Lovdata. Det samme gjelder inntak, skolerute, skyss og fag- og timefordeling når fylket har slike forskrifter.

**Valg:**
- **Lenker, ikke tekst, fra fylkene.** `content/fylker/lenker.yaml` har lenker til fylkets egne sider per tema (inntak, klage, eksamen …), som Vilbli. Teksten hos fylket kopieres ikke. Boksen «Hos fylkeskommunen» i veiviserne lenker til temaet hos brukerens fylke. Lenkesjekken (avgjørelse 062) sjekker adressene.
- **Fylkessiden** (`src/modules/fylker/`) samler lenkene, de lokale forskriftene, skolene, opplæringskontorene, kalenderne og klagen. Den nås fra «Oppslag» på forsiden.
- **Lokale forskrifter for alle fylker og skoler** (`scripts/lovdata/lokale.ts` og `register.ts`):
  - Typen avgjøres av hjemmelen (opplæringslova § 10-7 skoleregler, § 14-1 skolerute, opplæringsforskrifta kap. 4 inntak), ellers av tittelen. Forskrifter etter den gamle loven tas med så lenge de står i Lovdata (eier: de gjelder så lenge de står der).
  - Fylket kommer fra «Gjelder for», skolen fra tittelen og skoleregisteret.
  - Metadataene lagres, og typen regnes ut på nytt hver gang, så endrede regler gjelder uten ny henting.
  - Alle lover og forskrifter merkes med datoen de tok til å gjelde, og når de sist ble endret.
- **Norsk Lovtidend avdeling II hver uke.** Lokale forskrifter skal kunngjøres der, og alle 124 forskriftene appen vurderte, var kunngjort der (sjekket 05.10.2026). Kildesjekken leser kunngjøringene siden forrige gang, ett tidspunkt om gangen (Lovtidend blar ikke):
  - en ny forskrift vurderes, og erstatter den den endrer
  - en endring gir ny henting av forskriften når endringen har tatt til å gjelde
  - en oppheving fjerner forskriften fra den dagen den gjelder fra
  - Menyen viser bare inneværende år. Står ikke forrige tidspunkt der lenger (ved årsskiftet), eller har ett tidspunkt flere kunngjøringer enn én side, leses registeret for inneværende og forrige år i tillegg. Det parallelle løpet brukes bare da.
- **Hele registeret én gang i året** (om lag 600 sider, fylke for fylke), som kontroll, og første gang og med `--alle`. En forskrift som ikke står der lenger, fjernes bare når siden hos Lovdata viser at den ikke er gjeldende.
- **Teksten** hentes fra siden hos Lovdata, én forskrift om gangen på omgang over 13 uker (eier 02.10.2026), og med en gang når forskriften er ny eller endret.

**Konsekvens:** En uke gir om lag 15–20 forespørsler til Lovtidend og noen få sider med tekst. Nye fylker, skoler og forskrifter kommer med uten kodeendringer. Kildene om Vestland (`vlfk-*`) er ikke aktive lenger. Skoleruta fra fylkets forskrift brukes i kalenderen (pakke 5), med merknad om at skolens rute kan avvike.
