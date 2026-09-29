# 007 – Regelsett i flere filer og tabellverdier

**Kontekst:** Fase 1 skal ha verdiene fra SFS 2213 i `rules/sfs2213/2026-2027.yaml` og vedlegg 1 (årsrammene) i egen fil, `arsrammer-2026-2027.yaml` (OPPDRAG 4, fase 1). Begge gjelder samme periode. Regelmotoren tillot bare én nasjonal fil per periode, og en regelverdi kunne ikke være en tabell.

**Valg:**
- Et regelsett kan deles på flere filer med samme `id` og hver sin `del`. `slaaSammen()` i `src/core/regler/motor.ts` slår delene sammen ved lasting. Delene må ha samme regelverk, periode og gyldighet, og en verdinøkkel kan bare stå i én del. Brudd gir feil i bygg og tester.
- En regelverdi kan være en tabell: en liste av rader med enkle celler (tall, tekst, sann/usann, tom eller liste). Vedlegg 1 lagres slik, én rad per fag, program og trinn.
- `somTall()` og `somTabell()` gir verdien med typesjekk, så beregningene feiler tydelig hvis regelfilen har feil form.

**Konsekvens:** En ny periode legges fortsatt inn uten kodeendring, som to filer med samme `id`. Radene i tabeller valideres i innholdstestene mot skjemaet til modulen som bruker dem.
