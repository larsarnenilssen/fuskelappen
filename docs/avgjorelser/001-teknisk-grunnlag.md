# 001 – Teknisk grunnlag og versjoner

**Kontekst:** OPPDRAG.md kap. 2 bestemmer TypeScript, Vite, Preact, Vitest, Playwright, axe-core, MiniSearch, vite-plugin-pwa og zod (3.5). Versjonene må velges.

**Valg:**
- Node 22 (LTS), Vite 8, Preact 10, Vitest 5, Playwright 1.63, vite-plugin-pwa 1.3 med workbox-window, zod 4, MiniSearch 7.
- TypeScript ~6.0, ikke 7: typescript-eslint støtter ennå ikke TypeScript 7.
- Ingen `@preact/preset-vite`: Vites innebygde JSX-omforming (`jsxImportSource: preact`) holder, og vi slipper Babel.
- Appen bruker `zod/mini` ved kjøring (lagring og kildestatus), slik at startpakken holdes liten. Byggeskript og tester bruker full zod.

**Konsekvens:** Startpakken er omtrent 30 kB gzip, godt under grensen på 150 kB. Oppgradering til TypeScript 7 vurderes når typescript-eslint støtter det.
