# 015 – Periodebeskjeftigelse er en del av Arbeidsplan

**Kontekst:** Kalkulatoren for periodebeskjeftigelse kunne ikke ta med funksjoner, stilling eller lønn. Eier ba om at perioder heller blir en del av Arbeidsplan, og at den egne kalkulatoren fjernes når Arbeidsplan dekker alt den gjorde (30.09.2026).

**Valg:**
- Arbeidsplan har en bryter «Hele skoleåret / En periode». I en periode er fagene timer i perioden (eller økter per uke, med uker regnet ut fra dagene), og beskjeftigelsen regnes med perioderammen som før (`beregnPeriodebeskjeftigelse`).
- Stillingen og funksjonene gjelder perioden: en funksjon på 10 % er 10 % i perioden (eier).
- Resultatene vises for perioden, og prosentene kan vises på årsbasis (× periodenøkkelen). Timer og kroner er de samme i begge visningene (eier: 100 % i halve året er 50 % for hele året).
- Fordelingen regnes som for et helt år med prosentene i perioden, og timene ganges med periodenøkkelen. Timene per uke blir da de samme som for et helt år.
- Lønnen gjelder perioden: årslønn i stillingen og tillegg × periodenøkkelen. Variabel lønn og overtid regnes som vikartimer med timene i perioden (prosent i perioden × nøkkel = prosent på årsbasis).
- Årstimer fra Grep fylles ikke inn i en periode, fordi de gjelder et helt år. Den gamle kalkulatoren fylte dem inn som timer i perioden.
- Kalkulatoren Periode er fjernet uten videresending (appen er ikke delt ennå, som i avgjørelse 014). Metodeteksten er slått sammen med Arbeidsplan sin. `beregnPeriodebeskjeftigelse` og fasittestene 010 og 022 er beholdt.

**Kontroll før fjerning:** Alt Periode kunne, finnes i Arbeidsplan: dager i perioden og i skoleåret (190 som standard), tidslinjen for perioden, timer eller økter per uke med uker fra dagene og advarsel, delresultat per fag, «Tilsvarer for hele skoleåret», utregningen med periodenøkkel og perioderamme, varianter, favoritt og utskrift. Ende-til-ende-testene for Periode er flyttet til Arbeidsplan og går grønt.

**Konsekvens:** Fire kalkulatorer: Arbeidsplan, beskjeftigelse, vikartimer og overtid. Lagrede varianter fra Periode vises ikke lenger.
