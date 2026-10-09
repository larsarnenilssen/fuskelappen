# 035 – Opplæringsløp: tilbudsstrukturen i appen

**Kontekst:** Pakke 5 i fase 2 (docs/arkiv/OPPDRAG.md). Tilbudsmodellen (avgjørelse 024) og lenkene til Vilbli (avgjørelse 027) fantes bare i rapporten `docs/TILBUDSSTRUKTUR.md`. Eier ønsker tilbudsstrukturen i appen som en egen boks under «Læreplanverk og opplæringsløp», uten mellomside, med lenker begge veier mellom fag og tilbud (B1, B5).

**Valg:**
- **Ny modul `opplaeringslop`:**
  - Oversikten viser programmene, gruppert i studieforberedende, yrkesfaglige og påbygging.
  - Programsiden viser løpet som et tre fra vg1 og videre, med varianter for særskilte skoler og programområder Grep ikke knytter til løpet for seg.
  - Tilbudssiden viser fag og timer etter rundskrivet Udir-1, plassene for valgfrie programfag og yrkesfaglig fordypning, tilpassede ordninger, hva tilbudet bygger på og fører videre til, og lenker til Vilbli.
- **Adresser:** `#/opplaeringslop/HS/HSHEA2`, med kort kode uten bindestreker. Påbygging får `?via=` med tilbudet brukeren kom fra, slik at Vilbli-lenken står under riktig program (avgjørelse 027).
- **Data:** Tilbudene regnes ut når appen bygges (`virtual:tilbud`), som fagrollene (avgjørelse 031). De er om lag 27 kB komprimert og lastes først når modulen åpnes. Søket bruker navnene i fagindeksen og laster ikke tilbudene.
- **Fag:** Felles programfag tas alle og står med timene for hvert fag. I fellesfag velger eleven ett av fagene (f.eks. 1P eller 1T). Lange lister (fremmedspråk, alternativer, valgfrie programfag, kryssløp) er lukket til brukeren åpner dem.
- **Fagarket:** programområdene er lenker til tilbudene, og fagene i tilbudene lenker til fagarket.
- **Vilbli:** lenken bruker fylket brukeren har valgt, ellers hele landet. Appen gjør ingen kall til Vilbli.
- Linjenavnene i tabellen («Norsk», «Felles programfag fra eget programområde») er rundskrivets tekst og vises uoversatt på bokmål.

**Konsekvens:** Tilbudene følger Grep og rundskrivet hver gang appen bygges, uten egne datafiler. Avvik mellom rundskrivet og Grep vises ikke i appen. De står i `docs/TILBUDSSTRUKTUR.md` til eiers kontroll.

**Endret:** Avgjørelse 036 (0.19.0) viser avvikene i appen og linjenavnene på nynorsk.
