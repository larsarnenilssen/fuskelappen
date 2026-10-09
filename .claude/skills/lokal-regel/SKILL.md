---
name: lokal-regel
description: Legge inn en lokal regel som en bruker har meldt inn på e-post (emnet «Lokal regel til Jukselappen … (LR-XXXX)»), så eier kan godkjenne den. Brukes når eier limer inn en slik e-post, skriver «Legg inn den lokale regelen», eller sier at en innlagt regel er godkjent.
---

# Lokal regel

Avgjørelse 093. Formatet står i `docs/INNHOLDSMODELL.md` («Lokale regler») og skjemaet i `src/core/lokale/skjema.ts` (`godkjentRegelSkjema`). Eiers side står i `docs/EIER.md` punkt 17.

## 1. Legg inn

1. Les regelen i fast form nederst i e-posten: kode, tema, type, nivå og sted, verdi eller tekst, kilde og datoer. Står det `endrer: LR-XXXX`, erstatter den en godkjent regel.
2. Gren fra `main` (f.eks. `claude/lokal-regel-lr-xxxx`). Ny oppføring under `regler:` i `lokale/regler.yaml`:
   - `kode`, `tema`, `type`, `niva`, `fylke`, `skole` (eller `null`), `stedsnavn`, `meldt_inn`, og `gjelder_fra`/`gjelder_til` når de er oppgitt.
   - `type: verdi`: `nokkel` (må ha `lokal: true` i `rules/`) og `verdi`.
   - `type: regel`: `tittel` og `tekst` på bokmål og nynorsk, med egne ord. Nynorsk skriver «skule».
   - `kilde`: `{ navn, url, offentlig: true }`, eller `{ navn, offentlig: false }` uten lenke for en lokal avtale som ikke er offentlig.
   - `kontrollert: null` og 1–3 `kontrollsporsmal` til eier om det som er usikkert.
3. **Aldri** vedlegg, navn, e-postadresser, underskrifter eller andre personopplysninger i repoet. Repoet er offentlig.
4. `npm run lint`, `npm run typecheck` og `npm test` (skjemaet og nøklene testes). Commit, push og lag PR. Skriv i PR-en og til eier hva eier bør sjekke mot kilden.

## 2. Når eier har godkjent

Eier ser over PR-en og skriver «godkjent» til Claude. Først da:

1. Sett `kontrollert: { dato: <dagens dato> }` på regelen. Aldri før eier har sagt det.
2. Flett PR-en når CI er grønn. «Lokale regler» (`lokale-regler.yml`) publiserer appen uten ny versjon. Følg kjøringen til den er grønn.
3. Brukerne med samme fylke eller skole får regelen neste gang de åpner appen. Den som meldte den inn, får beskjed i Innstillinger, og kopien byttes ut.

## Ferdig når

Regelen står i `lokale/regler.yaml` med `kontrollert` satt etter eiers beskjed, PR-en er flettet, og «Lokale regler» er grønn.
