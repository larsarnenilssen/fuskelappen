# 040 – Ende-til-ende-testene delt på fire jobber i CI

**Kontekst:** CI tok om lag 16 minutter, og nesten 15 av dem var ende-til-ende-testene (153 tester i fire nettleseroppsett, med to workers på én maskin). Eier ba om raskere CI med flere workers (03.10.2026).

**Valg:**
- Testene deles på fire jobber som kjører samtidig (`--shard=1/4` … `4/4`). Hver jobb bygger appen selv og bruker to workers, som før, så belastningen per maskin er den samme som var stabil.
- Lint, typesjekk, enhetstester og bygg er en egen jobb ved siden av.
- Jobben «Test og bygg» samler resultatet og er grønn bare når alle jobbene er grønne, så en regel om påkrevd sjekk på main virker som før.
- Repoet er offentlig, så de ekstra jobbene koster ingenting.

**Konsekvens:** CI bør ta om lag 5–6 minutter. Feiler en del, har rapporten delnummeret i navnet (`playwright-report-2`). Lokalt kan `--workers=4` brukes når maskinen har fire kjerner.
