# 096 – Grafikken i kalkulatorene og vurderingen

**Kontekst:** Eier ba om en vurdering av farger, oppløsning, utseende og proporsjoner i grafikken i kalkulatorene og i Underveis- og sluttvurdering (09.10.2026). Stolpene var SVG-er som ble skalert med bredden, så de ble over dobbelt så høye på skrivebord og tekstene for små på mobil. Fargene i årsverket besto ikke sjekken for fargesvakt syn (dataviz-validatoren). Forslaget med bilder og svarene står i `docs/arbeidsordrer/grafikk-forslag.md`.

**Valg:**
- **Én felles stolpe** (`Stolpe` i `src/modules/arbeidstid/komponenter/Grafikk.tsx`). Den er HTML med fast høyde, 2 px mellomrom mellom delene og tekst i tekstfarge. Stillingsmåleren, perioden, beløpet, uka og årsverket bruker den.
- **Paletten** er den samme som i Elevundersøkelsen (`--serie-1` til `--serie-5`: blå, oransje, grønn, gul og fiolett).
  - Den består validatoren i lys og mørk visning.
  - Den mørke fioletten er lysere, så den skilles fra blått for fargesvakt syn.
  - Fargene på fagtypene, i kalenderen og i veiviserne er ikke endret.
- **Fagene** har hver sin farge etter tur, og **funksjonene** er fiolette (eier: G3 B).
- **Beløpsdelene** har faste farger etter hva de er (`Belopsdel`).
- **Tidslinjen for skoleåret** har etikettene i tekstfarge. Tabellen med to sider i Underveis- og sluttvurdering beholder tekstfargene sine (`--vurdering-tekst-*`).

**Konsekvens:**
- Figurene ser like ut på mobil og skrivebord.
- En ny figur i en kalkulator bruker `Stolpe` og fargene fra paletten (docs/DESIGN.md).
- Fag 2 er oransje i stolpen for beskjeftigelse, som møtetid i årsverket. Det valgte eier (G3 B).
