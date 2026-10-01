# 023 – Kobling fra fagkode til årsramme

**Kontekst:** Kalkulatorene skal kunne finne årsrammen i vedlegg 1 til SFS 2213 fra en fagkode i Grep (OPPDRAG fase 2). Vedlegg 1 er skrevet for Kunnskapsløftet 2006, med forkortede program- og fagnavn, og har ikke fagkoder. Eier bestemte at fellesfag alltid kobles eksplisitt, og at programfag kan kobles med regler (30.09.2026). InSchool-data er ikke med ennå. Koblingen kontrolleres med tester, en rapport over ukoblede fag og avvik, og eiers gjennomgang av et utvalg.

**Valg:**
- **Data:** `rules/sfs2213/kobling-fagkode.yaml` (del av regelsettet `sfs2213-2026-2027`) har fire tabeller og tabellen over programnavn:
  - `programnavn`: programnavnene i vedlegg 1 koblet til utdanningsprogrammene i Grep. Flyttet fra fagsøket, og påbygging (PB) er lagt til. Skal bekreftes av eier.
  - `kobling_fellesfag`: eksplisitte rader med fagkoder, utdanningsprogram, trinn og radnummer i vedlegg 1.
  - `kobling_programfag`: eksplisitte rader for de valgfrie programfagene på studiespesialisering som vedlegget nevner.
  - `kobling_regler`: regler for felles programfag: fagkodeprefikser + utdanningsprogram + trinn → rad, med unntak.
  - `kobling_yff`: yrkesfaglig fordypning får raden for felles programfag. Dette er en tolkning (vedlegget omtaler «prosjekt til fordypning») og står i praksislisten (`yff-arsramme`).
- **Utdanningsprogram og trinn** for en fagkode kommer fra programområdene i Grep (de to første bokstavene i koden og årstrinnet). Programområder med opplæring i bedrift teller ikke.
- **Oppslaget** (`src/modules/arbeidstid/beregning/kobling.ts`) er en ren funksjon. Eksplisitte koblinger går foran regler for samme program og trinn. Regler gjelder aldri fellesfag, og ikke fag uten årstimer i Grep (eksamens- og vurderingskoder). Svaret er `koblet` (én årsramme, med metode `eksplisitt` eller `regel`), `flertydig` (ulik årsramme for ulike program eller trinn: kalkulatoren spør) eller `ukoblet` med grunn. Brukerens eget valg merkes `manuell` i kalkulatoren.
- **Forslaget** er laget av Claude ut fra fagnavn, program og trinn i Grep og vedlegg 1, og fagsøket og årstimetabellen fra fase 1. Eier avgjorde 01.10.2026 resten:
  - Fellesfag på Kunst, design og arkitektur (KD) og Medier og kommunikasjon (ME) har samme årsramme som på studiespesialisering («Stud.spes»).
  - Varianter av fellesfag (samisk plan, tegnspråk, kort botid, grunnleggende norsk, styrket opplæring, morsmål, kvensk og finsk) har samme årsramme som det ordinære faget. Samisk som første- og andrespråk på ST, KD og ME har radene for samisk i vedlegget. Har programmet faget på et annet trinn (f.eks. engelsk, styrket opplæring, på vg2), brukes raden for det trinnet. Koblingene er laget med skript ut fra fagnavnene og står eksplisitt i tabellen, med merknad.
  - Valgfrie programfag på idrett, musikk, dans og drama, KD, ME, naturbruk og maritime fag har raden for felles programfag på programmet og trinnet (regler).
  - Yrkesfaglig opphenting (YFO2002) har raden for felles programfag på vg1 i programmet som hentes opp.
  - De utgåtte radene «Design og hå» og «Serv/samf» gjelder programmene som har tatt over (DT og FD, SR og IM).
  - Står det en merknad på en kobling eller regel, kan raden gjelde et annet program eller trinn. Det er eiers valg og meldes ikke som avvik.
  - Fremmedspråk som valgfritt programfag (PSP) på studiespesialisering har raden for fellesfaget fremmedspråk på trinnet (496). Kroppsøving vg3 på påbygging har raden for kroppsøving vg3 på studiespesialisering (635).
  - Står det en merknad, kan raden også ha en annen kategori i vedlegget (f.eks. et fellesfag for et valgfritt programfag).
  - Fortsatt ukoblet: andre valgfrie programfag på studiespesialisering som vedlegget ikke nevner (f.eks. sosialkunnskap, statistikk), fordi studiespesialisering ikke har en rad for felles programfag.
- **Rapporten** `docs/KOBLING.md` (`npm run kobling:rapport`) viser sammendrag, avvik, tabellen over programnavn, et fast utvalg koblinger til kontroll, program og trinn uten kobling, og alle ukoblede fagkoder med grunn. `data/status/kobling.json` har det samme som data. Kildesjekken lager rapporten på nytt hver uke etter Grep, før testene, og kontrollsaken tar med nye avvik (til avkrysning) og nye ukoblede fag (til orientering).
- **Tester:** Alle fagkoder er koblet eller står i rapporten. Ingen fellesfag kobles via regel. Tabellene motsier ikke vedlegg 1 (program, trinn og kategori på raden), programnavnene eller fagtypen i Grep. Samme fagkode, program og trinn gir ikke ulik årsramme. Rapporten er oppdatert. Fagkoder som forsvinner fra Grep, gir bare en advarsel, så de ukentlige dataene fortsatt kan tas inn.

**Konsekvens:** Kalkulatorene kan fylle inn årsrammen fra en fagkode, med metode. Nye fag i Grep havner automatisk i rapporten over ukoblede og i kontrollsaken. Årstimetabellen og søkeordene fra fase 1 er beholdt, men koblingen går foran for fag som er valgt med fagkode. InSchool-data kan senere legges inn som fasit med godkjente avvik.
