# 043 – Inntak: ny modul, lokale steg som bokser og felles veiviserkort

**Kontekst:** Fase 5, pakke 1. Eier godkjente forslaget i `docs/arbeidsordrer/fase-5-forslag.md` (03.10.2026): søkerkategorier og rettigheter ved inntak, med veiviseren «Rett, inntak og søknad». Innholdet fra Vestlands lokale forskrift om inntak skal bare vises når Vestland er valgt, og uten valgt fylke står bare de nasjonale reglene, med en merknad.

**Valg:**
- **Ny modul `inntak`** under «Elever og opplæring», før Tilrettelegging. Inntak er et eget emne i oppdraget og får egne frister til årshjulet (fase 8). Tidslinjen (pakke 2) og poengberegningen (pakke 3) kommer i samme modul.
- **Veiviseren** er innhold i `content/inntak/` (avgjørelse 041), med farge turkis og plass 3 (avgjørelse 042). Fasene er rett, inntaksmåte og søknad. Kategorien kommer fram som stegene på veien (ungdomsrett, fortrinnsrett, individuell behandling, poeng, voksenrett). Hver kategori har sin søknadsfrist, og veien ender i «Søknad, svar og klage». Etter eiers innspill 03.10.2026 er fortrinnsrett og individuell behandling ett spørsmål («Inntaksmåte»), voksne har ett utfall, og veiviseren har 23 steg (avgjørelse 044).
- **Lokale steg som supplerer:** Et steg på fylkes- eller skolenivå med `forhold: supplerer` og samme id som et nasjonalt steg, vises som en egen boks i det nasjonale steget, merket med stedet («I Vestland»). Det er ikke et eget steg på veien eller i kartet, og kan ikke ha spørsmål eller neste steg. Kildene står sammen med kildene til steget, og oppsummeringen tar med tittelen og fristen. Tester sjekker at hvert lokalt steg har et nasjonalt steg med samme id.
- **Merknad om lokale regler:** Oversikten og starten av veiviseren sier om appen viser lokale regler for det valgte fylket, eller bare de nasjonale.
- **Veiviserkortene** på oversikten er nå en felles komponent (`Veiviserinnganger`) som Tilrettelegging og Inntak bruker.
- **Lenker mellom veivisere** går til et steg med svarene på veien dit. En test sjekker at alle slike lenker i innholdet fører fram til steget.
- **Nye kilder:** Udirs sider om retten til videregående opplæring, Udirs merknader til opplæringsforskrifta kapittel 4 og Udirs oversikt over klageinstanser.

**Konsekvens:** Nye fylker får inntaksregler ved å legge lokale steg med samme id i `content/inntak/`, uten kodeendring. Lokale steg som skal erstatte et nasjonalt steg, bruker fortsatt `forhold: erstatter`.

**Navn (eier 03.10.2026):** Veiviseren het først «Hvilken søkerkategori?». Den heter «Rett, inntak og søknad» etter de tre fasene, fordi den dekker mer enn søkerkategorien. Adressen er `#/inntak/rett-inntak-soknad`.
