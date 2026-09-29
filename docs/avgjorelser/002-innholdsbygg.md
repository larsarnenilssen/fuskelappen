# 002 – Innhold som YAML, validert og gjort om ved bygg

**Kontekst:** Innhold og regelsett skal ligge som YAML med Markdown i tekstfeltene (3.5), valideres med zod og ikke gjøre startpakken tung.

**Valg:**
- En lokal Vite-plugin (`scripts/vite/plugins.ts`) leser `*.yaml` fra `content/`, `rules/` og testdata, validerer mot skjemaet og gjør Markdown om til HTML. Feil gir byggefeil med filnavn og felt.
- Nye utviklingsavhengigheter: `yaml` (parser) og `marked` (Markdown). Ingen av dem følger med i appen.
- Samme laster (`scripts/innhold/last.ts`) brukes av skript og tester, så validering skjer likt overalt.

**Konsekvens:** Appen får ferdig validert innhold som HTML. Innhold som lastes ved behov (f.eks. begreper), blir egne filer. Markdown-HTML regnes som trygt fordi innholdet er vårt eget.
