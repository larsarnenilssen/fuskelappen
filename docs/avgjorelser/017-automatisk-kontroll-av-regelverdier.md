# 017 – Automatisk kontroll av regelverdier mot kildeteksten

**Kontekst:** Kildesjekken varslet bare at en kilde som helhet var endret. Eier fikk ikke vite hvilke verdier og tekster som bygget på kilden, og kontroller som ble gamle, ga ikke beskjed. Eier ba 30.09.2026 om størst mulig automatisk kontroll og støtte til kontrollen, i fem steg. Dette er steg 1, grunnmuren.

**Valg:**
- Tall i `rules/` fra en kilde får `sitat`: et kort, ordrett utdrag (høyst 200 tegn) der tallet står slik kilden skriver det. Et sitat er lovlig bruk også for kilder med opphavsrett. Tall som ikke står i kilden, får `grunnlag: avledet` eller `grunnlag: praksis` og en merknad. Tester sjekker at sitatet inneholder verdien, og at alle tall fra en kilde som kildejobben leser, har sitat.
- Kildejobben tar vare på teksten den leser fra hver kilde. Verdisjekken ser etter sitatet i teksten: står det der, `samsvarer` verdien med kilden. Står det ikke der, er det `avvik`. Finnes teksten rundt tallet med et annet tall, blir det nye tallet et forslag. Resultatet lagres i `data/status/verdistatus.json`.
- Automatisk samsvar er ikke det samme som eiers kontroll. `kontrollert` settes fortsatt bare av eier.
- Teksten i PDF-en av hovedtariffavtalen leses med **pdfjs-dist** (Mozilla, Apache-2.0), som ny utviklingsavhengighet. Den brukes bare i kildejobben, ikke i appen. Fingeravtrykket av hele filen beholdes inntil videre.
- `src/core/kontroll/indeks.ts` kobler hver kilde til regelverdiene og innholdet som bygger på den. `scripts/kontroll/rapport.ts` lager kontrolloversikten `docs/KONTROLL.md`, og kildejobben lager den på nytt hver uke. Oversikten ligger i repoet og ikke i appen, fordi den er for eier.
- Tester sjekker at tallene henger sammen (1687,5 = 225 dager à 7,5 timer, 60/45-minutters enheter i forholdet 3 : 4 i hver rad i vedlegg 1, 100/112 og 12 % feriepenger, garantilønn som øker). En feil i én verdi blir da synlig selv om kilden er uendret.

**Konsekvens:** Når en kilde endres, viser verdisjekken hvilke tall som er berørt og hva de er endret til. Tabeller (vedlegg 1, garantilønn) og lister sjekkes ikke mot kilden ennå. Neste steg er presise ukentlige varsler, kontrollspørsmål og kontrollrunder, automatiske endringsforslag og godkjenning med avkrysning.
