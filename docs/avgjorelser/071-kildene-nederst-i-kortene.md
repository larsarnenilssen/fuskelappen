# 071 – Regelverket og kildene som lukkede rader nederst i kort og bokser

**Kontekst:** Sidene om lærlinger og kandidater (avgjørelse 069) hadde kildene som en egen linje i kortene: i veiene, i «Om veien», under hver overgang og som en rad i sammenligningen. Resten av appen har regelverket og kildene som lukkede rader nederst i kortet (`Kortfot`, eier 04.10.2026). Eier ba 06.10.2026 om at alle kort og bokser følger dette, og at det blir en regel.

**Valg:**
- **Kort og bokser med kilder:** «I regelverket (n)» med paragrafene i Lov og forskrift, og «Kilder (n)» med alle kildene. Begge er lukkede rader nederst, med samme tekst, grafikk og ikon som ellers (`Kortfot`). Paragrafene hentes fra kildene (`paragraferFra`), og hver kilde står én gang (`unikeKilder`).
- **Knapper:** En knapp i kortet, f.eks. «Mer om …», står over radene.
- **Lenkekort i en liste:** Kortet er en lenke, så kildene kan ikke stå inni det. Radene står samlet under listen, f.eks. under «Kommer fra», «Veien videre» og «Bytte vei».
- **Sammenligningen:** Kildene er ikke lenger en rad i tabellen, men lukkede rader under den.
- **Regelen** står i AGENTS.md under «Grensesnitt» og gjelder nye kort og bokser.

**Konsekvens:** Komponenten `Kildefot` i `src/modules/opplaeringslop/sider/fagbrevDeler.tsx` gir radene for en liste med kilder. Andre moduler bruker `Kortfot` eller `Innholdskort` direkte.
