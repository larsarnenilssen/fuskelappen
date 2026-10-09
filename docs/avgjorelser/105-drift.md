# 105 – Fra faser til drift: DRIFT.md, arkivet, skills og oversikten over avgjørelsene

**Kontekst:** Fase 0–10 er levert. `OPPDRAG.md` var blitt en logg på nesten 800 linjer med statuslinjen «klar for fase 0», og AGENTS.md sa at arbeidet følger fasene, med en arbeidsordre per fase. Oppskriftene for det som går igjen (ny versjon, testversjon, ny kilde, lokal regel, Dependabot) sto spredt i AGENTS.md, EIER.md og avgjørelsene, og de 103 avgjørelsene hadde ingen oversikt over hva som fortsatt gjelder. Eier sa ja til overgangen 09.10.2026.

**Valg:**
- **`DRIFT.md`** i roten er det aktive dokumentet: de faste jobbene, hvordan en endring og en versjon går, et forslag til versjonstakt, grensene som gjelder (bl.a. startpakken på 150 kB gzip) og de åpne punktene eier har valgt å vente med.
- **Arkivet:** `OPPDRAG.md` og `docs/arbeidsordrer/` er flyttet uendret til `docs/arkiv/` med `git mv`. Henvisningene i dokumentasjon, avgjørelser og kommentarer i innholdet peker dit.
- **Skills** under `.claude/skills/<navn>/SKILL.md`: `ny-versjon`, `testversjon`, `ny-kilde`, `lokal-regel` og `dependabot`. AGENTS.md beholder alle varige regler og har en liste over skillene i stedet for fremgangsmåtene.
- **Oversikten** `docs/avgjorelser/README.md` lages av `npm run avgjorelser` (`scripts/lag-avgjorelser.ts`) med status `gjeldende`, `endret` (linje «**Endret …**») eller `erstattet` («**Erstattet av avgjørelse NNN**»). En enhetstest feiler når den ikke er oppdatert. Derfor gir endringer under `docs/avgjorelser/` den raske jobben i CI, ikke `ingen` (avgjørelse 067).

**Konsekvens:** En ny økt starter med AGENTS.md og DRIFT.md, og laster en skill når oppgaven passer. En ny funksjon som eier vil se før den bygges, får et forslag i `docs/forslag/`, som `docs/forslag/ssb.md`. To grener som legger til hver sin avgjørelse samtidig, må kjøre `npm run avgjorelser` på nytt etter at den første er flettet. Statusen er bare så god som «Endret»-linjene i notatene.
