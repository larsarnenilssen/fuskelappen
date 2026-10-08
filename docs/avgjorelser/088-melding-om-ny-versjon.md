# 088 – Melding om ny versjon, med det som er nytt

**Kontekst:** Når en ny versjon var lastet ned, viste appen en liten linje nederst: «Ny versjon er klar». Eier ba 08.10.2026 om et større overlegg over et uklart slør, som søket og den kommende velkomsten, som kort sier hva som er nytt. Teksten skal lages i arbeidet med publiseringen. Meldingen skal bare komme for nye versjoner av appen, ikke hver gang dataene oppdateres (f.eks. nyhetene, kildestatusen eller tallene).

**Valg:**
- **Punktene:** `content/versjoner.yaml` har 1–4 korte punkter per versjon, på bokmål og nynorsk, nyeste øverst. Claude skriver dem i versjons-PR-en ut fra `CHANGELOG.md`, så eier ser dem før publiseringen. En test krever punkter for versjonen i `package.json`, og skjemaet begrenser punktene til 160 tegn.
- **versjon.json:** Bygget legger versjonsnummeret og punktene for versjonen i `versjon.json` ved siden av appen. Filen ligger ikke i service workeren.
- **Når meldingen vises:** Når service workeren har lastet ned en ny versjon, henter appen `versjon.json` fra jukselappen.no (ingen ekstern tjeneste). Er versjonsnummeret høyere enn appens, vises meldingen med punktene. Er det det samme, er bare dataene nye: den nye versjonen tas i bruk uten melding når appen startes eller kommer tilbake i forgrunnen, ikke mens brukeren holder på. Kan filen ikke hentes, vises meldingen uten punkter.
- **Overlegget** (`Overlegg`): et kort midt på skjermen over et uklart slør, med en tynn ramme i merkefargen og luft mellom delene (eier 08.10.2026). Resten av appen er utilgjengelig for tastatur og skjermleser mens det er åpent, fokus går til meldingen, så skjermlesere leser tittelen, og Esc eller «Senere» lukker det. Velkomsten i fase 10 bruker det samme overlegget.
- **«Senere»:** Meldingen kommer igjen neste gang appen er tilbake i forgrunnen.
- **Forhåndsvisning:** `?vis=nyversjon` i adressen viser meldingen i utvikling, i testene og i testversjonen.

**Konsekvens:** En versjons-PR stopper i testene hvis punktene mangler. Nye data gir ingen melding, så nyhetene, kildesjekken og tallene kan publiseres så ofte de trenger. Startpakken økte litt.
