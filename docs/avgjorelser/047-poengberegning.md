# 047 – Poengberegning ved inntak

**Kontekst:** Fase 5, pakke 3: poengberegning etter gjeldende inntaksregler, med utregningen synlig og kilde for hver regel. Reglene og fasittestene F1–F9 ble godkjent av eier 03.10.2026 (`docs/arbeidsordrer/fase-5-forslag.md`).

**Valg:**
- **Beregningen** står i `src/modules/inntak/beregning/poeng.ts` som rene funksjoner: `beregnVg1` (§ 4-19) og `beregnVg2Vg3` (§ 4-25). Tallene (to desimaler, ganger ti, null for IV og IM) står i `rules/inntak/2024.yaml` med sitat. Gjennomsnittet avrundes etter vanlige regler før det ganges med ti (praksislisten «poeng-avrunding»).
- **Tilleggspoeng i Vestland** (§ 2-7 og § 2-8) står i `rules/inntak/vestland-2024.yaml` som fylkesverdier som supplerer, og vises bare når Vestland er valgt. Kalkulatoren finner alle verdier som heter `tilleggspoeng_<gruppe>_<nr>` i fylkets regelfil (`hentLokaleNokler`), så et nytt fylke trenger bare en regelfil og innhold med riktig `gyldighet`. Gruppen får navn fra strings (`inntak.poeng.tilleggsgruppe`), ellers «Tilleggspoeng». Inntaksområdepoeng er ikke med, fordi tallet ikke står i forskriften.
- **Sitater med tallord:** Forskriften skriver «to desimalar» og «multiplisert med ti». Sitatsjekken forstår nå tallord (null, to–ti) i tillegg til sifre.
- **Sitater fra lov og forskrift sjekkes:** Kildesjekken gir teksten fra Lovdata (data/lovdata) til sitatsjekken, så sitatene fra kilder med `sjekkmetode: lovtekst` sjekkes hver uke. Før sto de som «sjekkes ikke ennå». En test sjekker også at sitatene står ordrett i dataene.
- **Grunnskolefagene** følges av kildesjekken som egen side (`udir-fag-og-timefordeling-grunnskole`). Endres tabellen, kommer det en kontrollsak.
- **Kortere kilder i utregningen** (alle kalkulatorene): kilderegisteret har `kortnavn`, og utregningen viser f.eks. «Opplæringsforskrifta § 4-19 første ledd bokstav a» med lenke rett til paragrafen i appen. Kopien og kildelistene har de fulle navnene.
- **Til Vg1** står fagene med standpunkt på vitnemålet fra grunnskolen ferdig (fag- og timefordelingen, og vurderingsordningen i læreplanene: tre karakterer i norsk). Valgfagene har egne felt, og snittet teller som én karakter.
- **Til Vg2 og Vg3** legges karakterene inn rad for rad, med type (standpunkt, eksamen, halvår). «Annen karakter» på en rad gir den beste av to karakterer i samme fag (privatist eller omvalg, fag for fag). Til Vg3 kan en halvårsvurdering fra Vg1 merkes som erstattet av halvår i samme fag på Vg2.
- **Individuell behandling:** Kalkulatoren sier fra i stedet for å vise poeng når mer enn halvparten av fagene mangler karakter (§ 4-20), eller søkeren til Vg2 og Vg3 ikke har tallkarakterer (§ 4-26).
- **VIGO:** Feltet «teller for poeng» i VIGO Kodeverksbase brukes ikke. Det sier at fag med «bestått» teller, mens forskriften (§ 4-25 bokstav b) sier at de ikke skal telle. «Hva et programområde gir grunnlag for» (`entry-requirements`) venter til veiviseren trenger det.

**Konsekvens:** En ny regelperiode for inntak er en ny fil i `rules/inntak/` og nye fasittester. Skjemaet huskes i nettleserhistorikken som i de andre kalkulatorene, og lagres ikke på enheten.
