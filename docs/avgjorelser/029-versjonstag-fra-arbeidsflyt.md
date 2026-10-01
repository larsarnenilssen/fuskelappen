# 029 – Versjonstaggen settes av en arbeidsflyt

**Kontekst:** Eier har gitt Claude ansvaret for å sette versjonstaggen når de er enige om en ny versjon (01.10.2026). Claudes arbeidsmiljø kan pushe grener, men ikke tagger: git-proxyen avviser push av `refs/tags/…`, og GitHub-verktøyene har ikke noe for å lage tagger.

**Valg:**
- Arbeidsflyten `.github/workflows/versjonstag.yml` («Sett versjonstag») kjører når `package.json` endres på `main`. Finnes ikke taggen `v<versjon>`, lager den en annotert tag på `main` og kaller publiseringen (`deploy.yml`) med taggen.
- Den kan også startes for hånd (Actions → Sett versjonstag → Run workflow). Da publiseres versjonen i `package.json` på nytt.
- En tag som pushes med `GITHUB_TOKEN`, starter ikke andre arbeidsflyter. Derfor kaller arbeidsflyten publiseringen direkte.
- Versjonsnummeret økes fortsatt bare i en egen PR når eier og Claude er enige om versjonen. Den PR-en er selve beslutningen om å publisere.

**Konsekvens:** Når versjons-PR-en flettes, settes taggen og appen publiseres uten flere steg. Eier kan fortsatt sette en tag selv (EIER.md punkt 3), og da publiserer `deploy.yml` som før.
