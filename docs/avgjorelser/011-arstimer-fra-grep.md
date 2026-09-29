# 011 – Årstimer fylles inn fra Grep

**Kontekst:** Eier ønsket at årstimetallet for faget fylles inn når brukeren velger fag, f.eks. 56 i kroppsøving og 140 i engelsk vg1 studieforberedende. Vedlegg 1 til SFS 2213 har årsrammer, ikke årstimer. Grep har årstimetallet per fagkode (feltet `omfang-totalt`), men ingen kobling fra radene i vedlegg 1 til fagkodene.

**Valg:**
- Koblingen fra rad i vedlegg 1 til fagkoder står som en tabell i regelsettet (`rules/sfs2213/arstimer-2026-2027.yaml`), med Grep som kilde og `kontrollert: null`. Den er laget for hånd ut fra fagnavn, program og trinn i Grep, og kan rettes uten kodeendring.
- Bare rader der fagkodene gir ett årstimetall for trinnet, er tatt med. Norsk og engelsk på yrkesfag er ikke med, fordi fagkoden gjelder flere trinn samlet (norsk 112 timer på vg1 og vg2). Programfag på yrkesfag har mange fag med ulike timetall i samme rad, og er heller ikke med.
- `npm run hent:grep` henter omfanget for fagkodene i tabellen til `data/grep/arstimer.json`. En enhetstest sammenligner tabellen med disse tallene, så en endring i Grep blir synlig.
- I skjemaet fylles tallet inn når faget velges, så lenge brukeren ikke har skrevet inn timene selv. En kort tekst viser at tallet kommer fra Udir, og hvilken fagkode det gjelder.

**Konsekvens:** Nye rader eller fagkoder legges til i regelfilen. Fase 2 kan bygge den fulle koblingen fra fagkode til årsramme og erstatte den håndlagde tabellen.
