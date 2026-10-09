# 103 – «Skule» på nynorsk i innholdet

**Kontekst:** De nynorske tekstene brukte både «skule» og «skole», også i samme fil. Grensesnittet (`src/strings/nn.ts`) brukte mest «skule». Eier har bestemt at appen skriver «skule» på nynorsk (09.10.2026).

**Valg:**
- **Hva som er byttet:** alle `nn`-felt i `content/`, med sammensetninger (skulen, skuleåret, grunnskulen, skulereglar, privatskular). Byttet ble gjort med et skript som bare rørte verdien til nøkkelen `nn`, og diffen er lest gjennom. `rules/` har ingen `nn`-felt.
- **Hva som ikke er byttet:** kildetekst og sitater (`kildetekst`, `sitat`, `punkt`, lov- og forskriftstekst), navn på lover og dokumenter (privatskolelova, privatskoleforskrifta) og andre egennavn (Skolelederforbundet), lenkemål og adresser (`#/skolemiljo/…`), plassholdere (`{skolear}`) og lenkeord, som har begge formene med vilje, så tekst med «skole» også lenkes. `content/versjoner.yaml` er meldingene om tidligere versjoner og står som de ble vist.
- **Test:** `tests/unit/nynorsk-skule.test.ts` sjekker at `nn`-feltene i `content/` og `rules/` ikke har «skole», med en kort unntaksliste for egennavn.
- **Grensesnittet:** `src/strings/` er ikke endret ennå. Det tas for seg, og testen kan da utvides til UI-tekstene.

**Konsekvens:** Nytt nynorsk innhold skrives med «skule». Kildetekst gjengis fortsatt uoversatt, så lovens «skole» står i sitater og paragraftitler.

**Endret 09.10.2026:** Grensesnittekstene i de nynorske filene i `src/strings/` skriver også «skule» (elleve ord, bl.a. skulen, grunnskulen, skuleåret og skulereglane). Plassholdere (`{skole}`, `{skolear}`), id-er og importstier er ikke endret. Testen sjekker nå også tekstene i enkle anførselstegn i disse filene.
