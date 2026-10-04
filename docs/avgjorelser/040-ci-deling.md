# 040 – Ende-til-ende-testene delt på fire jobber i CI

**Erstattet av avgjørelse 055** (04.10.2026): bygget én gang og åtte jobber med tre workers.

**Kontekst:** CI tok om lag 16 minutter, og nesten 15 av dem var ende-til-ende-testene (153 tester i fire nettleseroppsett, med to workers på én maskin). Eier ba om raskere CI med flere workers (03.10.2026).

**Valg:**
- Testene deles på fire jobber som kjører samtidig (`--shard=1/4` … `4/4`). Hver jobb bygger appen selv og bruker to workers, som før, så belastningen per maskin er den samme som var stabil.
- Lint, typesjekk, enhetstester og bygg er en egen jobb ved siden av.
- Jobben «Test og bygg» samler resultatet og er grønn bare når alle jobbene er grønne, så en regel om påkrevd sjekk på main virker som før.
- Repoet er offentlig, så de ekstra jobbene koster ingenting.

**Konsekvens:** CI bør ta om lag 5–6 minutter. Feiler en del, har rapporten delnummeret i navnet (`playwright-report-2`). Lokalt kan `--workers=4` brukes når maskinen har fire kjerner.

**Endret (eier 03.10.2026):** Den første kjøringen tok 10 minutter, fordi delingen etter antall ga hver jobb nøyaktig ett nettleseroppsett. WebKit mobil har de tunge overflyt- og tilgjengelighetstestene (de kjøres bare i mobiloppsettene, i lys og mørk visning, og WebKit er tregest), og brukte 9 minutter. De andre brukte 1–3. Testene deles nå på seks jobber: Chromium mobil, WebKit mobil i tre deler (lys, mørk og resten, valgt med `--grep` på titlene som ender med «(lys)» og «(mork)»), Chromium skrivebord og WebKit skrivebord. Etter varighetene fra loggen har ingen jobb mer enn om lag fire minutter testtid med to workers, så CI bør ta om lag 5 minutter. Det er sjekket at de tre delene av WebKit mobil til sammen har alle testene (91 + 91 + 153 = 335).
