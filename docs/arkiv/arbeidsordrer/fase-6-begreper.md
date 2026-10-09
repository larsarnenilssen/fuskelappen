# Fase 6: nye begreper (eier 05.10.2026)

Eier ba 05.10.2026 om en gjennomgang av nye begreper, etter at offentleglova og arkivlova kom inn i Regelverk. Claude foreslo om lag 30 begreper i fem grupper, og eier svarte «Ta med alle». Begrepene skrives i en egen PR rett etter pakke 4 (fylkene) og før pakke 5 (kalenderen), så kalenderen og pakke 6 kan lenke til dem.

**Levert i 0.36.0 (PR #99, 05.10.2026).** Alle 27 har `kontrollert: null` og kontrollspørsmål til eier.

## Begrepene

1. **Innsyn og arkiv** (offentleglova, offentlegforskrifta, arkivlova og arkivforskrifta):
   - innsyn
   - partsinnsyn (forvaltningsloven § 18). Forskjellen fra innsyn etter offentleglova skal komme tydelig fram.
   - taushetsplikt
   - organinternt dokument
   - journalføring
   - arkivplikt
   - bevaring og kassasjon
2. **Forvaltning:**
   - statsforvalteren
   - tilsyn
   - begrunnelse
   - veiledningsplikt
   - delegering
   - hjemmel
3. **Fylkene og lokale forskrifter:**
   - skolerute
   - skoleskyss
   - fleksibilitet i fag- og timefordeling (omfordeling og omdisponering)
   - ikrafttredelse og kunngjøring (Norsk Lovtidend)
4. **Eksamen og vurdering:**
   - oppmelding
   - sensur
   - annullering
   - hurtigklage
5. **Opplæringsløp:**
   - praksisbrev
   - lærekandidat
   - praksiskandidat
   - fagbrev på jobb
   - Vg3 i skole
   - formidling til læreplass

## Slik

- Følg skjemaet i `docs/INNHOLDSMODELL.md` og mønsteret i `content/begreper/`:
  - bokmål og nynorsk
  - kilder med `punkt` (og `url` til paragrafen)
  - `lenkeord` når tittelen ikke er ordet som står i teksten (avgjørelse 050)
  - `relatert`
  - `stikkord`
- Alt får `kontrollert: null` og 1–5 kontrollspørsmål med kilder.
- Sjekk at lenkeordene ikke gir uønskede lenker i brødteksten, for eksempel «tilsyn» og «begrunnelse», som er vanlige ord.
- Hurtigklage er fylkenes ordning. Den skrives med gyldighet etter kildene, og bare det som står i dem.
