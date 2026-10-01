# 032 – Fagarket med kort og fagtypefarger

**Kontekst:** Eier var usikker på designet for fagarket, og ønsket det mer oversiktlig og bedre å bruke (01.10.2026). Grunnopplysningene sto i en lang liste med to kolonner, og delene hadde lite som skilte dem fra hverandre. Eier godkjente en prototype og ba om at fargen på fagtypen også brukes i fagsøket.

**Valg:**
- Fagkode, fagtype og trinn står som merker under tittelen.
- Årstimetall og årsramme står som nøkkeltall med store tall. «Regn ut i Arbeidsplan» er en knapp.
- Grunnopplysningene, kompetansemålene, vurderingen og programområdene står hver i sitt kort, med en kant i fargen til fagtypen. På smal skjerm står etiketten over verdien.
- Hver fagtype har sin farge, hentet fra paletten: fellesfag blå, felles programfag grønn, valgfrie programfag lilla, yrkesfaglig fordypning gul, og andre fag grå (`--fagtype-*` i `tema.css`). Mørk visning bruker de lyse tonene. Teksten i fagtypefargen har minst 4,5:1 kontrast mot flaten.
- I fagsøket har hvert fag en kant i fargen til fagtypen, og fagtypen står i samme farge. Gruppeoverskriftene har den samme kanten.

**Konsekvens:** Fagtypen kjennes igjen fra søket til fagarket. Fargen er alltid sammen med tekst, så ingenting er bare formidlet med farge.
