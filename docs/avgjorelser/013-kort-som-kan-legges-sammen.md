# 013 – Kort som kan legges sammen

**Kontekst:** Arbeidsplan har fått mange kort (fag, funksjoner, møter og lønn, resultater, diagram). Eier ville vurdere om kortene kan lukkes og åpnes med et trykk på overskriften, slik at scrolling og trengsel kan løses underveis (30.09.2026).

**Valg:**
- Mønsteret er «disclosure» (WAI-ARIA): overskriften er en knapp med `aria-expanded` og `aria-controls` og en pil opp/ned. Innholdet skjules med `hidden`. Tastatur og skjermleser virker uten ekstra kode.
- Alle kort er åpne til brukeren lukker dem. Primærinnhold skjules aldri av appen selv.
- Et lukket kort viser en kort oppsummering: faget i fagkortet, antall og prosent for funksjoner, planfestet og selvdisponert tid for diagrammet. Resultatkort viser fortsatt svaret. Oppsummeringen er med i knappens navn for skjermlesere. Den synlige linjen kan også trykkes på, men er skjult for skjermlesere, så de ikke hører den to ganger.
- Hvilke kort som er lukket, huskes i nettleserhistorikken for siden (`history.state`), som det utfylte (avgjørelse 009). Ingenting lagres på enheten.
- `src/components/Sammenlegg.tsx` har `useSammenlagt`, `Sammenleggknapp`, `Oppsummering` og `Sammenleggbartkort`.

**Konsekvens:** Kort uten overskrift (enkelte skjemakort i de minste kalkulatorene) kan ikke lukkes. Nye kort med overskrift bør bruke komponentene over. Ingen nye avhengigheter.
