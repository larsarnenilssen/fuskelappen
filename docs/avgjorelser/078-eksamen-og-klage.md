# 078 – Eksamen og klage som egen modul

**Kontekst:** Eksamen, fag- og svenneprøven, klage på karakter og kalenderen for eksamen stod under «Eksamen og klage» på oversikten i Vurdering (fase 6, pakke 3, avgjørelse 059). Eier ville ha dem som egen modul på forsiden, under Vurdering i «Elever og opplæring», og ikke som en ekstra boks som lenker til eksamenssiden (06.10.2026).

**Valg:**
- **Ny modul `eksamen`** («Eksamen og klage», `src/modules/eksamen/`), med oversikt (`#/eksamen`) og de fire kortene: Eksamen (`#/eksamen/regler`), Fag- og svenneprøven (`#/eksamen/fag-og-svenneproven`), veiviseren Klage på karakter (`#/eksamen/klage-pa-karakter`) og Kalender for eksamen (kalenderen filtrert på eksamen, med neste dato).
- **Innholdet** er flyttet fra `content/vurdering/` til `content/eksamen/` uten endringer i id-ene, så kontrollen (`kontrollert`, kontrollspørsmål) følger med. Fristene har `modul: eksamen`, og temaene i kalenderen er de samme.
- **Eksamensdatoene** (`src/modules/eksamen/eksamensdatoer/`) hører til modulen. Kalenderen og hentingen bruker dem derfra.
- **De gamle adressene** i Vurdering (`/vurdering/eksamen`, `/vurdering/fag-og-svenneproven` og `/vurdering/klage-pa-karakter`) sender videre til de nye, med spørreparametrene.
- **Favorittene** får nye id-er (`eksamen:…`). Lagrede favoritter med de gamle id-ene byttes når lagringen leses (`FLYTTEDE_FAVORITTER` i `lagring.ts`), uten ny skjemaversjon.
- **Vurdering** har bare vurdering i fag, fravær og orden og oppførsel. Ekstraboksen «Eksamen og klage» på forsiden er fjernet.

**Konsekvens:** Lenker i innhold og kode bruker de nye adressene. En ny flytting av en side gjøres på samme måte: videresending fra den gamle adressen og en linje i `FLYTTEDE_FAVORITTER`.
