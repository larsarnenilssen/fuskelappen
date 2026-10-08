# 087 – Elevundersøkelsen som egen modul, og Skolemiljø får nytt navn

**Kontekst:** Elevundersøkelsen sto som en side i modulen Skolemiljø (avgjørelse 077). Eier vil løfte den til forsiden som en egen modul under kategorien Skolemiljø, og at modulen Skolemiljø får et navn som ikke er det samme som kategorien (08.10.2026).

**Valg:**
- **Ny modul** `elevundersokelsen` i `src/modules/elevundersokelsen/` under kategorien Skolemiljø, med adressen `#/elevundersokelsen`. Siden, søkefeltet for seriene (`Enhetsvelger`), skjemaet, visningen og utdraget til dagens jukselapp er flyttet dit. Tekstene står i `src/strings/moduler/elevundersokelsen.*.ts`.
- **Siden er modulens oversikt**, så den har ingen sti øverst (AGENTS.md), og favoritten er `elevundersokelsen:oversikt`.
- **Den gamle adressen** `#/skolemiljo/elevundersokelsen` sender videre med spørreparametrene, og en lagret favoritt `skolemiljo:elevundersokelsen` blir `elevundersokelsen:oversikt` (`FLYTTEDE_FAVORITTER`).
- **Modulen Skolemiljø** heter nå «Aktivitetsplikt og skoleregler» (nynorsk «Aktivitetsplikt og skulereglar»). Id-en og adressene (`#/skolemiljo/…`) er de samme, så lenker og favoritter virker. Oversikten har ikke lenger Elevundersøkelsen, og delen øverst heter «Retten og pliktene». Siden om kapittel 12 lenker fortsatt til Elevundersøkelsen under «Henger sammen med».
- **Dagens jukselapp:** Faktaene fra Elevundersøkelsen kommer fra den nye modulen.
- **Ende-til-ende:** `elevundersokelsen.spec.ts` med testene som sto i `skolemiljo.spec.ts`, modulen på forsiden og den gamle adressen.

**Konsekvens:** Kategorien Skolemiljø har to moduler. Datafilen og hentingen er uendret (`data/elevundersokelsen/`, `npm run hent:elevundersokelsen`).
