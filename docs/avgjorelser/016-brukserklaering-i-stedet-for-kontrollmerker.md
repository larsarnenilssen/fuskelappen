# 016 – Brukserklæring i stedet for «ikke kontrollert»-merker

**Kontekst:** Alt innhold og alle regelverdier hadde merket «Ikke kontrollert», fordi eier ikke har satt `kontrollert` ennå. Merket sto nesten overalt og sa lite. Eier ba 30.09.2026 om å erstatte merkene med en samlet brukserklæring under «Om appen» og en setning nederst på forsiden.

**Valg:**
- `Statusmerke` viser ikke noe for status `utkast`. Merkene for «Kontrollert {dato}», «Kilden er endret» og «Bør kontrolleres på nytt» er beholdt, fordi de sier noe nyttig når eier har kontrollert innhold.
- Resultatkortene har ikke lenger merket, og kopiteksten har ikke linjen «Verdiene er ikke kontrollert av eier». Kopiteksten har i stedet alltid forbeholdet fra forsiden, fordi den tas med ut av appen.
- «Om appen» har seksjonen «Brukserklæring». Den erstatter «Kildene gjelder foran appen» og «Hvordan innholdet lages». Innspill meldes via GitHub-saker. Appen har ingen e-postadresse, fordi repoet ikke skal ha personopplysninger.
- Datamodellen er uendret. Nytt innhold får fortsatt `kontrollert: null`, og bare eier setter en dato (AGENTS.md).

**Konsekvens:** Brukeren ser ikke lenger hvilke enkeltverdier eier har gått gjennom, men får et samlet forbehold. Når eier kontrollerer innhold, får det merket «Kontrollert» med dato.
