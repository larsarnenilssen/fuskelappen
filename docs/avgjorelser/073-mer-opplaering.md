# 073 – Mer opplæring: siden i Inntak, deler som kan lukkes og kildene i boksen med matrisen

**Kontekst:** Fase 6, pakke 7. Eier ville ha retten til mer opplæring (opplæringsforskrifta § 5-2 og Udirs tre veiledninger) samlet på én side, med lenker fra Vurdering, Lærlinger og kandidater, Tilrettelegging, Kalenderen og veiviseren for rett til inntak. Fire designrunder 06.10.2026 (`docs/arkiv/arbeidsordrer/fase-6-pakke-7-forslag.md`).

**Valg:**
- **Siden** `#/inntak/mer-opplaering` er vanlige innholdselementer i `content/inntak/mer-opplaering.yaml`, valgt med prefiks (`mo-rad-`, `mo-retten-`, `mo-sti-`, `mo-fagprove`, `mo-vurdering-`, `mo-voksne-`, `mo-iop-`), som sidene i Vurdering (avgjørelse 054). Fra 64rem står siden i to kolonner. `?del=<id>` åpner delen og kortet.
- **Deler som kan lukkes** (`components/Seksjon.tsx`, eier 06.10.2026): overskriften er en knapp med pil, og en lukket del viser titlene på kortene. Streken står over delen, som radene i Lov og forskrift og overordnet del. Det som er åpent, huskes for siden (avgjørelse 072). «Hvem har rett?» og gangen er åpne fra start.
- **Matrisen med kilder:** `Sammenligning` tar `kilder` og viser regelverket og kildene nederst i samme hvite boks som tabellen (avgjørelse 071). Brukt også i «Sammenlign» for lærlinger og kandidater og i «Underveis- og sluttvurdering».
- **Veiviseren:** eget steg «Fag som ikke er bestått» etter «Kompetanse fra før» (eier 06.10.2026), med sluttsteget «Mer opplæring». Adresser med svar etter «Kompetanse fra før» har fått ett ledd til.
- **Bytte vei:** eget utgangspunkt «Fag- eller svenneprøven ikke bestått» (eier 06.10.2026) med mer opplæring på Vg3 (ikke «Vg3 i skole», eier 06.10.2026), ny eller utsatt prøve, lengre eller ny lærekontrakt og lærekandidat. Overgangen til lærekandidat bygger bare på ol. § 7-2 og står i praksislisten.
- **«Om veien»:** feltene fyller bredden eller deler den to og to (`faktaoppstilling`, eier 06.10.2026). Med et oddetall felt står fellesfagene over to rader.
- **Søket:** stikkordene «meropplæring» og «meiropplæring» i ett ord.
- **Nye kilder:** `udir-mer-opplaering`, `udir-mer-opplaering-voksne` og `udir-fullforingsretten-iop`, fulgt av kildesjekken. Klage på vedtaket er ikke med, fordi kildene ikke har det.

**Konsekvens:** Nye lange sider kan bruke `Seksjon`. Nye matriser med kilder får dem i boksen ved å gi `kilder` til `Sammenligning`.
