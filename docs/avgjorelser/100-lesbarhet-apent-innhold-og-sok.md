# 100 – Større tekst, hovedinnholdet åpent og bedre treff i søket

**Kontekst:** Gjennomgangen av design og navigasjon 09.10.2026 fant at brødteksten var 15 px og mye metatekst 12 px, at hovedinnholdet på fagsiden og i Regelverk sto bak lukkede deler, at oversiktene i modulene hadde overskrifter med bare én inngang under, og at søket ikke kjente hverdagsord («leseplikt») og rangerte paragrafer om grunnskolen og privatskoler høyt. Eier ba om en runde forbedringer før appen deles med flere.

**Valg:**
- **Tekststørrelsen** (`tokens.css`): brødteksten er 16 px (`--str-m: 1rem`), og skalaen er justert med den: `--str-l` 18 px, `--str-xl` 21 px og `--str-xxl` 26 px. Datoer, merker og dempede linjer (`--str-xs`) er 13 px, ikke 12. `--str-s` er fortsatt 14 px. Merket for kilden i Videregående i tall bruker `--str-xs` i stedet for en egen størrelse. Navnet i toppfeltet har mindre luft på sidene, så det får plass på 320 px.
- Tekstene på aksene i linjediagrammene i Videregående i tall er SVG med egne enheter (9) og skaleres med figuren. De er ikke endret, fordi margene i figuren er laget for den størrelsen og tallene også står i teksten over.
- **Hovedinnholdet står åpent:** På fagsiden står «Kompetansemål og læreplan» og «Vurderingsordning» åpne fra start. Ferdighetene og temaene og «Inngår i tilbud» er lukket som før. Det brukeren åpner og lukker, huskes for siden. I Regelverk står dokumentene i en åpen liste i kort med gruppenavnet som overskrift, ikke i grupper som må åpnes.
- **Oversiktene i modulene** (`Oversiktsdel`): Har en del bare én inngang, står den uten overskrift, og flere slike deler etter hverandre står som én liste. Gjelder Inntak, Vurdering, Eksamen, Skolemiljø og Tilrettelegging, og nye oversikter som bruker komponenten.
- **Hverdagsord i søket** (`hverdagsord` i `content/sok/synonymer.yaml`): Et søk på «leseplikt» finner også undervisningstid, årsramme og beskjeftigelse. Listen er kort og har bare ord der appen har innhold å finne. Den er søkehjelp, ikke en påstand om at ordene betyr det samme.
- **Rangeringen i søket:** Paragrafer om grunnskolen (tittelen nevner grunnskolen, men ikke videregående) og privatskolelova og forskriften til den får halve poengene og står lenger ned. Privatskolene gjør det bare når «Privatskole» ikke er valgt. Ingen treff tas bort.
- **Små avvik fra DESIGN.md:** Det valgte filteret i søket og kalenderen er gult, som de andre valgknappene. Kildene nederst i kalenderen står i `Kildeboks`, med oversiktene over endringer som lenker i boksen. Toppfeltet er like bredt som sidene i to kolonner, så tilbakeknappen står over innholdet.

**Konsekvens:**
- Sidene blir noe lengre. Overflyttestene for 320–430 px gjelder som før.
- Eldre avgjørelser om lukkede deler på fagsiden (eier 02.10.2026) og i Regelverk (avgjørelse 074) gjelder ikke lenger for disse delene.
- Et nytt hverdagsord føres i `synonymer.yaml`, med ett ord per oppføring i `ord` (testes i `tests/unit/sokerangering.test.ts`).
- Fordelingen av årsverket i en tom Arbeidsplan («Annen planfestet tid 65,5 %») er ikke endret. Den er riktig regnet for en stilling uten undervisning og vises med vilje før noe er fylt inn (eier 08.10.2026).
