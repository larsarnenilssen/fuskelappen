# 021 – Godkjenning med avkrysning og /godkjent

**Kontekst:** Dette er steg 5 i kontrollsystemet. Eier godkjente 30.09.2026 at avkrysning og `/godkjent` i en kontrollsak skal telle som eiers godkjenning. Før måtte eier skrive til Claude for hver godkjenning.

**Valg:**
- **Når jobben starter:** `.github/workflows/godkjenning.yml` starter når noen skriver en kommentar som begynner med `/godkjent`, på en sak med etiketten `kontroll` eller `kontrollrunde`. Jobben kjører bare når kommentaren er skrevet av eieren av repoet (`author_association == OWNER`).
- **Hva som godkjennes:** Punktene eier har krysset av, med skjulte merker i sakene:
  - Nytt fingeravtrykk for en kilde gir `godkjent_fingeravtrykk` og en kommentar med dato og saksnummer.
  - Praksis gir `bekreftet`.
  - Innhold og regelverdier gir `kontrollert`.
  - Id-er etter `/godkjent` (innhold, regelverdi, praksis eller kilde med endret status) gir det samme.
  - Tallforslag og Grep godkjennes ved å flette PR-en, ikke her.
- **Hvordan det lagres:**
  - Filene endres linje for linje, med dagens dato (norsk tid).
  - Består testene, lagres endringen rett på main. Det er bare datoer og fingeravtrykk som endres. Feiler testene, lages en PR i stedet.
  - Jobben svarer i saken med hva som er godkjent, og hva den ikke fant.
- **AGENTS.md:** Claude setter fortsatt aldri `kontrollert`, `bekreftet` eller `godkjent_fingeravtrykk` på eget initiativ. Godkjenningsjobben gjør det bare på eiers kommando.

**Konsekvens:** Eier godkjenner direkte i saken på telefonen, uten å gå via Claude. Merkene «Kontrollert» vises i appen fra neste versjon. Neste kildesjekk lukker punkter som er i orden.

**Endret 09.10.2026:** Ukens kontroll i kontrollsaken bruker de samme merkene, så avkrysning og `/godkjent` virker der. Lenker til fylkene som ikke er bekreftet på åtte uker, har merket `fylkeslenke:fylke:tema`, og avkrysning gir dagens dato i `bekreftet` i `content/fylker/lenker.yaml` (avgjørelse 106).
