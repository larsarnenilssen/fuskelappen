# 059 – Eksamen og klage, og eksamensdatoene fra Udir og fylkene

**Kontekst:** Fase 6, pakke 3: oversikten «Eksamen», veiviseren «Klage på karakter», siden om fag- og svenneprøven og tidslinjen «Eksamen og klage gjennom året» (forslaget godkjent av eier 04.10.2026). Datoene for eksamensperiodene står samlet bare på eksamensplan.udir.no, men robots.txt der stenger for alle andre enn søkemotorene. Udir har ikke API eller datasett for datoene, og eier regner ikke med svar fra Udir innen rimelig tid. Fylkene gjengir mange av Udirs datoer og har egne datoer.

**Valg:**
- **Henting:** `scripts/hent-eksamen.ts` leser datoene fra udir.no («Administrere eksamen» og kalenderen) og fylkenes sider, med ett mønster per dato (`scripts/eksamen/kilder.ts`). Den henter i januar og august (eier: hvert halvår), og lagrer i `data/eksamen/datoer.json`, som lastes gjennom `src/data/eksamen.ts`. eksamensplan.udir.no brukes ikke.
- **Sammenslåing (eier 04.10.2026):** Har Udir datoen, brukes den, uten kontrollsak. Ellers tas en dato inn når minst to fylker har den samme. Er fylkene uenige, blir det en kontrollsak. Har bare ett fylke datoen, står den i rapporten, men tas ikke inn. Finner et mønster ikke datoen lenger, blir det også en kontrollsak (siden kan være endret).
- **Fylkenes egne datoer** (når datoene for muntlig eksamen for privatister kommer, søknadsfristen for tilrettelegging for privatister, når standpunkt blir kjent og hurtigklage) lagres per fylke og vises bare når fylket er valgt. Bare fylker vi har nådd og hentet fra, er med (eier 04.10.2026). Fylker som stenger skymiljøet, legges inn når sidene kan leses.
- **Fristene** i `content/vurdering/frister-eksamen.yaml` har `eksamensdato` (felt og periode). Uten data står fristen med måneden og «Udir fastsetter datoen». Med data står datoen med år, sluttdato og klokkeslett, og siden datoen er lest fra, står blant kildene.
- **Tidslinjen** er felles for Inntak og Vurdering (`src/core/tidslinje.ts`, `src/components/Tidslinje.tsx`), med månedene og filtrene som parametere. Vurdering viser skoleåret fra august til juli.
- **Veiviseren** «Klage på karakter» har fargen bær (dyp rosa, 700-tonen #8a1f5c i lyst tema og 300-tonen i mørkt, avgjørelse 042).
- **Tabeller i kortene:** `tabell` på et kort vises åpen over kortet, som rutenett (antall eksamener per trinn og utdanningsprogram) eller som kort side om side (utsatt, ny og særskilt eksamen, prøvene).
- **Vestland:** Sidene på vestlandfylke.no er lagt inn i kilderegisteret, og kildesjekken laster opp teksten fra kildene som artefakt («kildetekster»), fordi nettstedet bryter tilkoblingen fra skymiljøet.

**Konsekvens:** Datoene oppdateres to ganger i året uten at noen må skrive dem inn. En dato fylkene er uenige om, kommer ikke inn i appen før eier har sett på den. Nye fylker legges inn med en side og et mønster i `scripts/eksamen/kilder.ts`.
