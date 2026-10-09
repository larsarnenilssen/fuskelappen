# 101 – Velkomsten i fire trinn

**Kontekst:** Velkomsten hadde ni trinn (avgjørelse 094). Gjennomgangen 09.10.2026 viste at det var for mange: må grensesnittet forklares i en omvisning, forklarer det seg ikke selv, og målgruppen bruker appen sjelden og kort. Flere trinn måtte også rulles på en iPhone, særlig rollen med favorittene. Eier bestemte fire trinn (09.10.2026) og ba om at hvert trinn får plass uten rulling.

**Valg:**
- **Trinnene:** «Velkommen» (hva appen er og hvorfor den heter Jukselappen, og det viktigste fra søket og forsiden), «Hvor jobber du?» (fylke, skole, privatskole og lokale regler), «Hvilken rolle har du?» (rollen med forslag til favoritter, og bryteren for dagens jukselapp) og installering, som hoppes over når appen er installert. «Ferdig» lukker. Trinnene om søket, forsiden og sidene, dagens jukselapp som eget trinn, og takken er tatt bort.
- **Én animasjon per trinn, der den får plass:** den lille forsiden med panelet som bytter fane, i første trinn, og knappen for å installere i siste. Logoen, søket, kortet med regelverket, stjernen og haken er tatt bort.
- **Uten rulling** i innholdet på 390 × 844 (iPhone 14) og 1280 × 800, på bokmål og nynorsk, også med en rolle valgt (testes på 390 × 844). Tekstene er kortere, rader og luft er strammet inn, og bryteren for dagens jukselapp har en kort hjelpetekst i velkomsten (`Jukselappbryter hjelp`). På lave skjermer (høyst 44rem, f.eks. iPhone SE og iPhone i Safari med verktøylinjer) er det mindre luft rundt vinduet, bildene er lavere, og overskriften i kortet med fylke og skole er bare for skjermlesere.
- **`?vis=velkomst&trinn=…`** har id-ene `velkommen`, `sted`, `rolle` og `installer`. En id som ikke finnes, også de gamle (`sok`, `forsiden`, `sidene`, `jukselapp`, `takk`), gir første trinn.

**Konsekvens:**
- På iPhone SE (375 × 667) får alle trinnene plass, unntatt rollen når en rolle er valgt: da ruller innholdet omtrent 50 px, og bryteren for dagens jukselapp står under kanten.
- Velkomsten sier ikke lenger at appen er et privat prosjekt laget med hjelp av KI, og har ikke knappen for tilbakemelding. Forbeholdet står nederst på forsiden, KI-støtten under Om appen og tilbakemeldingen i Innstillinger. Eier kan be om en kort setning om det i første trinn.
- Et nytt trinn eller en lengre tekst må få plass uten rulling på 390 × 844 (testen i `tests/e2e/velkomst.spec.ts`).
