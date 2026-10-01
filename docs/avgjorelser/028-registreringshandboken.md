# 028 – Registreringshåndboken som kilde

**Kontekst:** Eier viste 01.10.2026 til Udirs registreringshåndbok (`regbok.udir.no`) for hva «Fag for studiekompetanse» (PBPBY4) er. Håndboken definerer feltene skoler og fylker registrerer i videregående, med gyldige koder. Den har ikke API, og lisens er ikke oppgitt.

**Valg:**
- Feltet A03 Programområdekode er ny kilde (`udir-regbok-programomradekode`) med sjekkmetode `side`. Adressen er den faste adressen for gjeldende versjon, ikke en eldre versjon.
- A03 er kilde for PBPBY4 i tilbudsstrukturen, sammen med rundskrivet Udir-1 punkt 3.5.3 (avgjørelse 024).
- Feltene B16–B19 (FAM- og VMM-koder) er kilder for begrepene om fagmerknader og vitnemålsmerknader (`udir-regbok-fam`, `udir-regbok-vmm`), sammen med primærkilden, kapittel 3 i Udirs skriv om føring av vitnemål og kompetansebevis (`udir-foring-vitnemal-merknader`). Kodene og tekstene i appen kommer fortsatt fra VIGO (avgjørelse 026). Eier 01.10.2026.
- Adressene er de faste adressene for gjeldende versjon (`/felt/?Id=…`).
- Teksten siteres kort og lenkes. Appen henter ikke noe fra håndboken.
- `docs/REGISTRERINGSHANDBOKEN.md` beskriver innholdet og mulig bruk senere (f.eks. FAM- og VMM-koder, fullførtkoder og fagopplæring).

**Konsekvens:** Når A03 endres (vanligvis i april–mai), kommer det i kontrollsaken. Fingeravtrykket godkjennes av eier. Tas flere felt i bruk, bør hele oversiktssiden hentes, med ett fingeravtrykk per felt.
