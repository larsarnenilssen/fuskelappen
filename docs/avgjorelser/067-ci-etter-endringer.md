# 067 – CI etter hva som er endret

**Kontekst:** CI kjørte alt på hver PR: lint, typesjekk, enhetstester, bygg og åtte jobber med ende-til-ende-tester (avgjørelse 055). En PR med bare dokumentasjon eller bare et nytt versjonsnummer ventet like lenge som en PR med kode. Eier vil at CI først ser hvilke filer som er endret (05.10.2026, fase 6, pakke 5).

**Valg:**
- **Første jobb, «Hva er endret»** (`endringer`), gir nivået `ingen`, `rask` eller `alt`.
  - På en PR sammenligner den med grunnlaget (`git diff --name-only <base>...HEAD`). Logikken står i `scripts/ci/endringer.ts` og har enhetstester. Skriptet kjøres med Node uten `npm ci`.
  - Ved push til `main` og ved manuell start er nivået alltid `alt`. Kildesjekken skriver data rett til `main`, og endringsforslagene starter CI manuelt (avgjørelse 020).
- **`ingen`:** bare filer under `docs/` og `*.md` utenom `content/` og `tests/`. Ingen tester.
  - Unntak: `docs/KOBLING.md`, `docs/TILBUDSSTRUKTUR.md`, `docs/KILDER.md` og `README.md` leses av testene og gir `alt`. En test feiler hvis en test begynner å lese et nytt dokument som ikke står i listen.
- **`rask`:** bare versjonen er endret i `package.json` og `package-lock.json` (`version` og `packages[""].version`), og `CHANGELOG.md` har bare fått en ny overskrift som `## [0.36.1] – 2026-10-05` eller tomme linjer. Annen dokumentasjon kan være med. Da kjøres lint, typesjekk, enhetstester og bygg, ikke ende-til-ende. Bygget kjøres, fordi versjonen bygges inn i appen.
- **`alt`:** alt annet, også når sammenligningen ikke finner noen endrede filer.
- **Hopp over på jobbnivå:** `sjekk` har `if` på nivået, og `bygg-e2e` kjører bare med `alt`. Da hoppes også de åtte jobbene i `e2e` over, så de ikke henter Playwright-bildet bare for å rapportere.
- **«Test og bygg»** (`test`) kjører alltid og samler resultatet. Den feiler når «Hva er endret» feilet, når nivået er ukjent, eller når en jobb er hoppet over uten at nivået tillater det.

**Konsekvens:**
- PR-er med bare dokumentasjon er ferdige på under et minutt, og versjons-PR-er på noen minutter.
- En versjons-PR der `CHANGELOG.md` har fått mer enn overskriften, kjører alt. Det er strengere enn nødvendig, men versjons-PR-en skal bare ha versjonen.
- `main` krever i dag ingen sjekk før fletting. Skal en sjekk kreves, er det «Test og bygg», som eier slår på under Settings → Branches (eller Rules). De andre jobbene kan være hoppet over og skal ikke kreves hver for seg.
- Leser en ny test et dokument under `docs/`, må det føres opp i `TESTEDE_DOKUMENTER` i `scripts/ci/endringer.ts`. Testen i `tests/unit/ci-endringer.test.ts` finner dokumenter som leses med `join(rot, '….md')`.
