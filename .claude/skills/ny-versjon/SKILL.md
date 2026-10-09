---
name: ny-versjon
description: Publisere en ny versjon av Jukselappen. Brukes når eier og Claude er enige om at det som er flettet til main, skal ut til brukerne, og om versjonsnummeret. Dekker versjons-PR-en (package.json, CHANGELOG.md og content/versjoner.yaml), taggen, publiseringen og at testversjonen tas ned.
---

# Ny versjon

Bare når eier har sagt ja til versjonen og nummeret (SemVer: x.Y.0 for nytt, x.y.Z for rettinger). Takten står i `DRIFT.md`.

## 1. Versjons-PR

Gren fra `main`, f.eks. `claude/versjon-1-3-0`. PR-en har bare dette:

1. **Versjonen:** `npm version 1.3.0 --no-git-tag-version` (endrer `package.json` og `package-lock.json`).
2. **`CHANGELOG.md`:** sett inn `## [1.3.0] – 2026-11-02` (tankestrek, dagens dato) rett under `## [Unreleased]`, så punktene under hører til versjonen. `## [Unreleased]` blir stående tom. Ikke skriv om punktene.
3. **`content/versjoner.yaml`:** ny oppføring øverst med `versjon`, `dato` og 1–4 punkter under `nytt`, hvert med `nb` og `nn`. Egne ord, korte, bare det brukeren merker (avgjørelse 088). Nynorsk skriver «skule». Ingen komma foran siste «og»/«eller». Tidligere oppføringer endres ikke.
4. Kjør `npm run lint`, `npm run typecheck`, `npm test` (krever punkter for versjonen i `package.json`) og `npm run test:e2e:berorte` (kjører `nyversjon`).
5. Commit `Versjon 1.3.0: <kort om det viktigste>`, push og lag PR med tittel `Versjon 1.3.0 – …`.

## 2. Flett og publiser

1. Flett når CI er grønn og det ikke er konflikter.
2. «Sett versjonstag» (`versjonstag.yml`) ser den nye versjonen på `main`, lager taggen `v1.3.0` og utgivelsen under Releases, og starter «Publiser» (avgjørelse 029). Claude kan ikke pushe tagger selv.
3. Følg kjøringene under Actions til «Publiser» er grønn. Siste steg er røyktesten: jukselappen.no skal vise nøyaktig utgaven som ble bygget (avgjørelse 099). Feiler den, kommer saken med etiketten `feil`. Gi eier lenken og rett feilen.
4. **Testversjonen tas ned av seg selv:** «Publiser» bygger ikke `test/` ved en versjon, og starter «Testversjon» med `ta_ned`, som sletter grenen `test` (avgjørelse 095). Sjekk at grenen er borte. Er den ikke det: Actions → Testversjon → Run workflow med `ta_ned`.
5. Si fra til eier: versjonen er ute, med lenke til utgivelsen.

## Tilbakerulling

Actions → Publiser → Run workflow med forrige tag, f.eks. `v1.2.0`. Det tar også ned testversjonen.

## Ferdig når

- `v1.3.0` finnes, «Publiser» er grønn med røyktesten, og `https://jukselappen.no/versjon.json` viser 1.3.0.
- Grenen `test` finnes ikke.
