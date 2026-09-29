# 006 – Verktøy for lint, test og skript

**Kontekst:** AGENTS.md krever `npm run lint`, tester i WebKit og Chromium, axe og TypeScript-skript for kildejobb og generering.

**Valg:**
- ESLint 10 med `@eslint/js` og `typescript-eslint`. Egen regel `ingen-tekst-i-jsx` (i `eslint/regler.js`) stopper UI-tekst direkte i JSX.
- `@axe-core/playwright` som kobling mellom axe-core og Playwright.
- `tsx` kjører TypeScript-skriptene i `scripts/`.
- Komponenter testes i Playwright mot en komponentkatalog som bare finnes i utvikling og testing (`#/utvikling/komponenter`). Vi slipper da jsdom og testing-library.
- Testmodulen i `tests/fixtures/moduler/` og testbegrepene tas med via `virtual:testoppsett` utenfor produksjon. Ende-til-ende-testene kjøres mot et eget bygg (`--mode e2e`).
- PNG-ikonene lages fra `ikon/ikon.svg` med Playwright, uten eget bildebibliotek.

**Konsekvens:** Ingen formatteringsverktøy (Prettier) er lagt til. Service worker testes automatisk bare i Chromium. Installering og offline på iOS kontrolleres manuelt ved kontrollpunktet.
