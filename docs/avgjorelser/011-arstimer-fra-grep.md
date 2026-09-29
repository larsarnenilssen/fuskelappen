# 011 – Årstimer fylles inn fra Grep

**Kontekst:** Eier ønsket at årstimetallet for faget fylles inn når brukeren velger fag, f.eks. 56 i kroppsøving og 140 i engelsk vg1 studieforberedende. Vedlegg 1 til SFS 2213 har årsrammer, ikke årstimer. Grep har årstimetallet per fagkode (feltet `omfang-totalt`), men ingen kobling fra radene i vedlegg 1 til fagkodene.

**Valg:**
- Koblingen fra rad i vedlegg 1 til fagkoder står som en tabell i regelsettet (`rules/sfs2213/arstimer-2026-2027.yaml`), med Grep som kilde og `kontrollert: null`. Den er laget for hånd ut fra fagnavn, program og trinn i Grep, og kan rettes uten kodeendring.
- Bare rader der fagkodene gir ett årstimetall, er tatt med. For norsk og engelsk på yrkesfag bekreftet eier at årstimetallet er 112 og 140 (omfanget for NOR1262 og ENG1009), og det står på radene for både vg1 og vg2. Programfag på yrkesfag er ikke med, fordi mange fag med ulike timetall står i samme rad.
- `npm run hent:grep` henter omfanget for fagkodene i tabellen til `data/grep/arstimer.json`. En enhetstest sammenligner tabellen med disse tallene, så en endring i Grep blir synlig.
- I skjemaet fylles tallet inn når faget velges, så lenge brukeren ikke har skrevet inn timene selv. En kort tekst viser at tallet kommer fra Udir, og hvilken fagkode det gjelder.

**Konsekvens:** Nye rader eller fagkoder legges til i regelfilen. Fase 2 kan bygge den fulle koblingen fra fagkode til årsramme og erstatte den håndlagde tabellen.

**Tillegg (programfag):** Søker brukeren fram et bestemt fag, for eksempel HEA2005 eller «Helsefremmende arbeid», følger fagkodene med valget. Årstimetallet hentes da direkte fra Grep for fagkoden. `data/grep/arstimer.json` har omfanget for alle fagkodene fagsøket kjenner. Samme fag kan ha samme navn i flere programområder. Da brukes tallet bare når alle kodene har det samme årstimetallet. Bare bokstavene i en kode (HEA, BAT) peker på programområdet og ikke på ett fag, så de gir ikke noe tall. Slik får programfagene på yrkesfag årstimer uten at noen må kontrollere en tabell for hånd.
