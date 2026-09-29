# 008 – Kildesjekk for avtaletekst, PDF og Lovdata

**Kontekst:** Fase 1 bygger på selve teksten i SFS 2213, hovedtariffavtalen og arbeidsmiljøloven. KS lenker til SFS 2213 hos KF Infoserie, som er en JavaScript-app uten tekst i HTML-en. Hovedtariffavtalen ligger som PDF hos KS. Lovene skal sjekkes mot Lovdatas gratis datasett (OPPDRAG 3.9).

**Valg:**
- **`kf-infoserie`:** Chromium via Playwright (finnes allerede for ende-til-ende-testene) åpner lenken KS publiserer. Appen henter dokumentet med kallet `Documents/LocalPrimaryVariant`. Svaret gjøres om til normalisert tekst og får et fingeravtrykk. Tittel, versjon og gyldighet tas med i jobbsammendraget. `kilder.yml` installerer Chromium før sjekken. Bak en proxy som Chromium ikke stoler på (utviklingsmiljøet), går trafikken via Playwrights HTTP-klient med Nodes sertifikater. Sertifikatkontrollen slås aldri av.
- **`fil`:** Fingeravtrykk av hele filen, byte for byte. Brukes for PDF-en av hovedtariffavtalen, slik at vi slipper et PDF-bibliotek. En ny utgave av filen gir `endret`, også når bare oppsettet er endret.
- **`lovdata`:** Datasettet `gjeldende-lover.tar.bz2` lastes ned én gang per kjøring og pakkes ut med systemets `tar`. Loven finnes med filnavnet (`nl-20050617-062` for arbeidsmiljøloven), og `uttrekk.selektor` velger delen som sjekkes. For arbeidsmiljøloven er det `[data-name="kap10"]` (kapittel 10). `id` i filen er løpenummer og kan ikke brukes. Finner sjekken ikke delen, viser feilmeldingen eksempler på strukturen i filen.
- Utdanningsforbundets gjengivelse av SFS 2213 står i kilderegisteret som reserve (`udf-sfs2213`), uten sjekk.

**Konsekvens:** Ingen nye avhengigheter. Første kjøring gir `endret` med fingeravtrykk til godkjenning for de tre nye kildene. KF Infoserie kan endre appen sin; da feiler sjekken med en tydelig melding, og reserven kan tas i bruk.
