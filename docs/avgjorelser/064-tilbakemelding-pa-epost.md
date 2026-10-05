# 064 – Tilbakemelding på e-post

**Kontekst:** Brukerne kunne bare melde fra på GitHub, som krever en konto. Avgjørelse 016 sa at appen ikke skulle ha en e-postadresse, fordi repoet ikke skal ha personopplysninger. Eier har laget kontoen jukselappen.app@gmail.com for appen og ba 05.10.2026 om at brukerne kan sende tilbakemelding dit, med mulighet til å kopiere adressen for dem som ikke har et e-postprogram.

**Valg:**
- **Ingen tjeneste:** «Skriv e-post» er en vanlig `mailto:`-lenke. Appen sender ingenting og lagrer ingenting, og regelen om ingen kall til eksterne tjenester gjelder fortsatt. Et skjema i appen ville trengt en tjeneste som sender e-posten.
- **Emne og mal:** Emnet er «Tilbakemelding på Jukselappen {versjon}». Teksten har en linje å skrive under, og etter en strek versjonen, siden brukeren kom fra og fylket som er valgt. Skolen tas ikke med. Brukeren ser alt før e-posten sendes.
- **Siden brukeren kom fra:** Skallet husker den siste siden som ikke er Innstillinger eller Om appen (`src/app/tilbakemelding.ts`). Den ligger bare i minnet.
- **Adressen vises ikke** (eier 05.10.2026): «Kopier adressen» legger den på utklippstavlen. Den står bare i `mailto:`-lenken.
- **Plassering:** Under Innstillinger (nederst, før kildestatusen) og i Om appen, etter brukserklæringen. Lenken til GitHub-saker i brukserklæringen er tatt bort; teksten viser til «Tilbakemelding» (eier 05.10.2026).
- Adressen står i `src/config/app.ts`. Teksten ber brukerne ikke skrive personopplysninger om elever eller ansatte.

**Konsekvens:** Avgjørelse 016 er endret på dette punktet: adressen er en konto for appen, ikke en person. E-postene kommer til eier og havner ikke i repoet. Blir det mye søppelpost, kan adressen byttes i `app.ts`.
