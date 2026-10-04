# 029 – Versjonstaggen settes av en arbeidsflyt

**Kontekst:** Eier har gitt Claude ansvaret for å sette versjonstaggen når de er enige om en ny versjon (01.10.2026). Claudes arbeidsmiljø kan pushe grener, men ikke tagger: git-proxyen avviser push av `refs/tags/…`, og GitHub-verktøyene har ikke noe for å lage tagger.

**Valg:**
- Arbeidsflyten `.github/workflows/versjonstag.yml` («Sett versjonstag») kjører når `package.json` endres på `main`. Finnes ikke taggen `v<versjon>`, lager den en annotert tag på `main` og kaller publiseringen (`deploy.yml`) med taggen.
- Den kan også startes for hånd (Actions → Sett versjonstag → Run workflow). Da publiseres versjonen i `package.json` på nytt.
- En tag som pushes med `GITHUB_TOKEN`, starter ikke andre arbeidsflyter. Derfor kaller arbeidsflyten publiseringen direkte.
- Versjonsnummeret økes fortsatt bare i en egen PR når eier og Claude er enige om versjonen. Den PR-en er selve beslutningen om å publisere.

**Konsekvens:** Når versjons-PR-en flettes, settes taggen og appen publiseres uten flere steg. Eier kan fortsatt sette en tag selv (EIER.md punkt 3), og da publiserer `deploy.yml` som før.

**Rettelse 01.10.2026:** I en kalt arbeidsflyt er `github.event_name` den kallende arbeidsflytens hendelse. Første kjøring tolket derfor kallet som et push av en tag og prøvde å publisere «main». `deploy.yml` sjekker nå også `github.ref_type == 'tag'`. 0.10.0 ble publisert for hånd med taggen.

**Tillegg 04.10.2026:** Taggene fra arbeidsflyten fikk ingen utgivelse under Releases, så GitHub viste v0.9.0 som siste versjon selv om 0.30.0 var publisert. Jobben «Lag utgivelse» lager nå en utgivelse for hver tag som er nyere enn siste utgivelse, med avsnittet for versjonen i `CHANGELOG.md` som tekst. Den nyeste merkes som siste. Første kjøring etter endringen lager de som mangler fra v0.10.0 til v0.30.0.
