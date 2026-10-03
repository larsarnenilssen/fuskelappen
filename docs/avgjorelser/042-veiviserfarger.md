# 042 – Farger og rekkefølge for veiviserne

**Kontekst:** Fase 4, etter 0.24.0. Oversikten i Tilrettelegging har to veivisere, og flere kommer i fase 5–7. Eier vil at hver veiviser skal ha sin egen hovedfarge, så brukeren ser hvilken løype hen er i, og at «Tilpasset opplæring og individuell tilrettelegging» står først (03.10.2026).

**Valg:**
- En veiviser har `farge` (`blaa`, `lilla`, `turkis` eller `rav`, standard `blaa`) og `rekkefolge` (lavest står først). Tilpasset opplæring er blå og står først. Særskilt språkopplæring er lilla.
- Fargen settes med `data-veiviserfarge` på kortet på oversikten og på hele veivisersiden. I `tema.css` bytter attributtet ut `--farge-merke`, `--farge-lenke`, `--farge-flate-2` og `--farge-info-flate` for lyst og mørkt tema. Komponentene er uendret: stolpen, kartet, knappene, lenkene og feltene får fargen av seg selv. Topplinjen og menyen er blå som ellers.
- Grønt brukes ikke som veiviserfarge, fordi grønt betyr «ferdig» i fasestolpen. Rødt brukes ikke, fordi det betyr feil.
- Fargene er fra paletten i `tokens.css`, med 700-tonene i lyst tema (minst 4,5:1 mot hvit flate) og 300-tonene i mørkt tema. To nye flatetoner er lagt til for lilla og turkis.
- En test sjekker at hver veiviser har sin egen farge og sin egen plass.

**Konsekvens:** Neste veiviser får `turkis`, deretter `rav`. Trengs flere, legges en ny farge til i `tokens.css`, `tema.css` og skjemaet.
