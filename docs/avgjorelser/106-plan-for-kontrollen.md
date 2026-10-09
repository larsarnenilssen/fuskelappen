# 106 – Plan for kontrollen: ukens kontroll og fylkeslenkene

**Kontekst:** Om lag 557 regelverdier og tekster har `kontrollert: null`. Eier har lest nesten all tekst i appen uten å finne feil, så kontrollen skal være lett og risikobasert: «Noen punkter i uken er i orden» (eier 09.10.2026). Kontrollrundene i mai og august teller bare det som ikke er kontrollert. Lenkene til fylkenes temasider (`content/fylker/lenker.yaml`) hadde 53 lenker med `bekreftet: null`, fordi nettstedene stengte skymiljøet da lenkene ble lagt inn. Nå svarer de, men noen bare med eller bare uten www, og noen er trege.

**Valg:**
- **Ukens kontroll** (`scripts/kilder/ukenskontroll.ts`): kontrollsaken får fem punkter som ikke er kontrollert, valgt etter risiko:
  1. regelverdier som ikke samsvarer automatisk med et sitat (avledet, praksis eller uten sitat)
  2. regelverdier som samsvarer
  3. innhold i modulene med størst juridisk betydning (tilrettelegging, skolemiljø, eksamen, inntak, vurdering, lov, opplæringsløp og arbeidstid)
  4. annet innhold
  5. begreper og innhold som bare gjelder ett fylke
- **Rotasjon:** Innenfor hvert nivå roterer utvalget med ukenummeret. Det som ikke krysses av, kommer igjen en senere uke, og det som er kontrollert, faller ut av seg selv. Ingen tilstand lagres. Verdier med avvik står allerede i saken og er ikke med.
- **Samme avkrysning** som kontrollrunden (`<!-- kontroll:innhold:id -->`, `<!-- kontroll:verdi:id -->`), så `/godkjent` virker uten endring (avgjørelse 021). Hvert punkt har tittel, verdien og sitatet eller kontrollspørsmålene, og kildene med lenke.
- **Ingen ny støy:** Ukens kontroll står mellom merkene `<!-- uten-varsel -->` og `<!-- /uten-varsel -->`. Linjene der teller ikke som punkter (`scripts/varsel/plan.ts`). Den gir verken kommentar når utvalget skifter eller påminnelse annenhver uke. Den holder saken åpen, så den ikke lukkes og lages på nytt. Når noe annet nytt kommer til, har e-posten ukens kontroll med i hele listen. Saken viser også hvor mye som ikke er kontrollert ennå.
- **Fylkeslenkene bekreftes automatisk** (`npm run lenker:fylker`, `scripts/lenker/fylker.ts`). Kildesjekken kjører skriptet hver uke. Hver lenke som ikke er bekreftet de siste fire ukene, hentes:
  - med den ærlige USER_AGENT og 30 sekunders tidsgrense
  - med to nye forsøk ved feil i nettet, 5xx eller 429
  - én forespørsel om gangen per vert, med pause imellom
  - Tittelen, og:title og første overskrift (h1) må ha et ord for temaet, på bokmål eller nynorsk (`TEMAORD`, romslig med vilje).
  - Svarer siden 200 med passende tittel, blir `bekreftet` satt til dagens dato. Endringen gjøres linje for linje, og filen testes før den lagres på main (avgjørelse 098).
- **www eller ikke:** Svarer ikke en adresse (feil i tilkoblingen eller DNS), prøves samme adresse med www lagt til eller tatt bort (`annenVariant` i `scripts/lenker/sjekk.ts`). Det gjelder alle verter, nå og senere, uten en liste over enkelte nettsteder. En videresending mellom variantene er samme side, ikke en flytting.
  - Fylkesskriptet bytter til adressen som virker, og skriver det i rapporten.
  - Den vanlige lenkesjekken regner lenken som ok, med en merknad, så en www-feil ikke gir falsk alarm.
- **Ingen kvartalsrunde for lenkene:** Lenker som ikke er bekreftet på åtte uker, eller aldri, kommer som avkrysningspunkter med lenke i kontrollsaken. Avkrysset og `/godkjent` gir dagens dato i `bekreftet` (`<!-- fylkeslenke:fylke:tema -->`). Lenker som virker, bekrefter seg selv, så eier ser bare det som ikke virker.

**Konsekvens:** Kontrollen går i et fast, lite tempo, med det viktigste først. Om lag 110 uker tar alt, hvis eier krysser av fem punkter i uken. Eier får ingen ekstra e-post for ukens kontroll, men må åpne kontrollsaken selv. `bekreftet` i lenker.yaml betyr nå «sist sett med riktig tittel, av skriptet eller eier». Den fornyes når den er eldre enn fire uker, så filen endres høyst om lag en gang i måneden per lenke. `kontrollert`, `godkjent` og `bekreftet` i praksislisten settes fortsatt bare av eier.
