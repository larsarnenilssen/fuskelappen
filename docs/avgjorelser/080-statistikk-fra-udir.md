# 080 – Statistikk fra Udirs statistikkbank

**Kontekst:** Eier vil vise at appen er relevant og oppdatert, med tall fra Udirs statistikkbank, uten å drukne brukeren (06.10.2026). Det åpne API-et til statistikkbanken har bare tabellene fra Elevundersøkelsen. Eier har sagt at appen kan bruke rapport-API-et bak statistikkbanken på udir.no (07.10.2026).

**Valg:**
- **Henting:** `npm run hent:statistikk` (`scripts/hent-statistikk.ts`) i kildesjekken hver uke. Skriptet slår opp hver rapportside, tar de siste årene fra filterverdiene og henter tabellene som CSV. Det skriver `data/statistikk/statistikk.json` (ca. 75 kB) og en endringsrapport. Tabellene:
  - søkere
  - elever og skoler
  - formidling til læreplass
  - lærekontrakter
  - fravær
  - gjennomføring
  - fag- og svennebrev
  - eksamenskarakterer
- **Validering:** Skjemaet står i `src/core/statistikk/skjema.ts`. `validerStatistikk` krever tall for landet, alle de 15 fylkene og minst 300 skoler, og at andelene ligger mellom 0 og 100. Feiler hentingen, beholdes forrige fil, og kildesjekken melder fra.
- **Én kilde**, `udir-statistikkbanken` (NLOD), med sjekkmetoden `statistikk`. Publiseringen tar dataene fra `main`, som Elevundersøkelsen (avgjørelse 077).
- **Gjennomføring:** Udir oppgir kullene fra før 2020 på de gamle fylkene. Appen regner om til dagens fylker med teller og nevner (`regnOmTilNyeFylker`), og skriver det under tallet. Fra kullet som startet i 2020 kan ikke Udirs fylker deles opp. Da vurderes SSB for de sju fylkene som mangler.
- **Visning:** samme metode som Elevundersøkelsen.
  - Liggende stolper fra null.
  - Valgt fylke i seriefargen og de andre grå.
  - Landet som stiplet strek.
  - Tekst ved alle farger.
  - Tabeller for oversikten.
  - Visningslogikken er rene funksjoner i `src/modules/statistikk/visning.ts`.

- **Forsiden** (eier 07.10.2026): Videregående i tall er en annen type modul enn de andre og står ikke som boks under «Oppslag» (`paaForsiden: false` i manifestet). Tallene er en visning i panelet øverst på forsiden, sammen med kalenderen og nyhetene (avgjørelse 081).

**Konsekvens:** Rapport-API-et er ikke dokumentert og kan endres. Da stopper hentingen, appen viser de forrige tallene, og skriptet må rettes. Eier godkjente siden, boksene i de andre modulene og panelet på forsiden 07.10.2026 (versjon 0.41.0).
