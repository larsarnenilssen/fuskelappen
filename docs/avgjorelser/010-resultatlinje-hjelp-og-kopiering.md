# 010 – Resultatlinje, «?»-hjelp og kopiering i kalkulatorene

**Kontekst:** Eier ønsket mindre scrolling og raskere avlesing i 0.2.1. Svaret lå under skjemaet, hjelpetekster tok plass i hvert felt, og to felt side om side sto ikke på linje når bare det ene hadde hjelpetekst.

**Valg:**
- **Resultatlinje** (`src/components/Resultatlinje.tsx`): resultatkortet viser hovedsvaret i en fast linje over bunnmenyen når kortet er utenfor skjermen. Synligheten styres med `IntersectionObserver`. Linjen er en knapp som ruller til kortet. Siden får ekstra plass nederst, så linjen ikke dekker innhold.
- **«?»-hjelp** (`src/components/Hjelp.tsx`): korte forklaringer er skjult til brukeren trykker. Det følger regelen om at forklaringer er skjult til de åpnes.
- **Kopier**: resultatkortet lager utregningen som ren tekst (`lagKopitekst`) og legger den på utklippstavlen med `navigator.clipboard`. Er utklippstavlen stengt, vises teksten i et felt brukeren kan kopiere fra. Ingenting sendes ut av enheten.
- **Felt på linje**: `.feltrad` bruker CSS subgrid for tallfelt, så etikett, felt og hjelpetekst får hver sin rad på tvers av feltene. Hjelpeteksten står under feltet. Nedtrekkslister er holdt utenfor fordi WebKit ellers regner dem som bredere enn de er.
- **Mellomregninger** avrundes fortsatt ikke. Eier ønsket minst fire desimaler bak visningen for å få mest mulig korrekte kronebeløp. Full presisjon oppfyller dette og gir det mest korrekte beløpet. Avrunding til fire desimaler ville gitt 1 øre feil i eksempelet med overtid på 110 %.

**Konsekvens:** Nye kalkulatorer får resultatlinje og kopiering gjennom `Utregningskort` uten ekstra kode. Sider med flere resultater slår av linjen med `fast={false}`.
