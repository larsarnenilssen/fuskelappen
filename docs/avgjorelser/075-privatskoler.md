# 075 – Privatskoler: privatskolelova i Regelverk, et valg i innstillingene og egne regler der de er ulike

**Kontekst:** Appen er skrevet for fylkeskommunale skoler. Eier ville ha privatskolelova og forskriften til den i appen før skolemiljøet i fase 7, fordi skolemiljøet og skolereglene også gjelder privatskoler (`docs/arbeidsordrer/fase-7.md`). Eier godkjente utvalget av kapitler 06.10.2026. Eier ba også om at den som arbeider ved en privatskole, eller vil se reglene for privatskoler, får se de riktige reglene i appen (`docs/arbeidsordrer/fase-7-forslag.md`).

**Valg:**
- **Lov og forskrift:** `privatskolelova` (lov 2003-07-04-84, kap. 1–5, 5A, 6A og 7) og `privatskoleforskrifta` (forskrift 2024-06-03-901, kap. 3–11) står i `content/lovverk.yaml` med `privatskole: true`. Teksten hentes av kildesjekken som for de andre lovene.
- **Valget i innstillingene:** bryteren «Privatskole» under fylke og skole (`innstillinger.privatskole`, valgfri, så eldre data kan leses uten migrering).
  - Velger brukeren en skole, slås valget på for en privat skole og av for en offentlig.
  - Skoleregisteret har feltet `privat: true` fra Nasjonalt skoleregister (`ErPrivatskole`). Feltet står bare på de private skolene.
  - Bryteren kan også slås på uten valgt skole.
- **Når valget er på:**
  - **Merknad:** Kort og steg med `privatskole` (tekst og kilder) viser det som er ulikt for privatskoler i en boks med stiplet kant, «For privatskoler». Kildene kommer med nederst i kortet.
  - **Paragrafene:** En kilde i opplæringsforskrifta med en parallell i privatskoleforskrifta (`content/privatskole/paralleller.yaml`) viser parallellen i stedet. Det gjelder også «I regelverket».
    - Parallellene er bare paragrafer med samme tittel. Unntaket er tre paragrafer med nesten lik tittel. De har en merknad om hva som er ulikt.
    - Leddet tas ikke med, fordi leddene kan være ulike.
  - **Regelverk:** Privatskolelova og forskriften står først blant lovene og forskriftene, merket «Privatskole». Når valget er av, står de i en egen gruppe, «Privatskoler».
- **Før teksten er hentet:** «I regelverket» viser bare dokumenter som er hentet til `data/lovdata/`. Til da lenker kildene til Lovdata.
- **Første merknader:**
  - inntaksmåten i veiviseren for inntak (pl. § 3-1)
  - klage på karakter (psf. kap. 7)
  - vedtak og klage om individuell tilrettelegging (pl. § 3-6)
  - skoleregler og bortvisning på siden om orden og oppførsel (pl. §§ 5A-6, 5A-7 og 3-10)
  - kortet om privatskoler på Mer opplæring, som har psf. §§ 4-2 og 3-4 som kilde

  Alle har `kontrollert: null` og kontrollspørsmål. Begrepet «Privatskole» er nytt.

**Konsekvens:** Nytt innhold der privatskoler har egne regler, får `privatskole` på elementet. Det trengs ingen kodeendring. Skolemiljøet i fase 7 bruker det samme for henvisningen til privatskolelova § 2-4. Startpakken er om lag 1 kB større på grunn av parallellene. Titlene i parallellene testes mot teksten fra Lovdata når den er hentet.

**Endret 09.10.2026:** Privatskolelova kapittel 6 (tilskudd og skolepenger) er med i Lov og forskrift (eier 09.10.2026). Gratisprinsippet for privatskoler bygger på § 6-2 og privatskoleforskrifta § 15-1, og begrepet «Privatskole» nevner tilskuddet og skolepengene (§§ 6-1 til 6-3).
