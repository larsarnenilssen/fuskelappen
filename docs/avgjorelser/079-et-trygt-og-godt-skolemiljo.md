# 079 – Et trygt og godt skolemiljø: kapittel 12 som egen side

**Kontekst:** Eier ville ha opplæringslova kapittel 12 som egen side i Skolemiljø eller som et utbrodert begrep, og foretrakk en egen side (06.10.2026). Kapittelet har ti paragrafer med en tydelig gang: retten, skolens plikter, statsforvalteren, det fysiske miljøet og ansvaret. Det er for mye for ett begrep.

**Valg:**
- **Egen side** `#/skolemiljo/trygt-og-godt-skolemiljo`, først under «Oppslag» i Skolemiljø. Innholdet står i `content/skolemiljo/kapittel-12.yaml`, ett kort per tema, med egne ord og kontrollspørsmål.
- **Fem deler som er lukket fra start** (eier 06.10.2026, for mindre scrolling): Hver del er en knapp med nummer, tittel, paragrafene og én setning, så kapittelet kan leses i overskriftene. Delene husker om de er åpne (avgjørelse 072), og `?del=` åpner delen med kortet. Den første versjonen hadde en oversikt med de fem delene øverst og delene åpne under, men det ble for langt.
- **Illustrasjoner:** De fem delpliktene i aktivitetsplikten står som en rad med «Hele veien: dokumentere» under. Veien til statsforvalteren står som en sti fra rektor til vedtak og klage. Begge er lister i HTML, så de leses også av skjermlesere.
- **Henger sammen med:** informasjon til elevene og foreldrene (§ 10-8), fysiske inngrep (§§ 13-3 til 13-5) og lenker til veiviseren, skolereglene og Elevundersøkelsen. Til høyre på skrivebord (avgjørelse 074).
- **Nye kilder:** Udirs rundskriv om skolemiljø kapittel 2–5 har egne adresser og får egne kilder, så kildesjekken følger dem.
- **Privatskoler:** Kortene har merknader etter privatskolelova § 2-4 og §§ 3-10 a til 3-10 c (avgjørelse 075).
- **Begrepene** om skolemiljøet står i `content/begreper/skolemiljo.yaml` med eget tema, «Skolemiljø». Aktivitetsplikt, skoleregler og bortvisning er flyttet dit fra `regelverk.yaml`.

**Konsekvens:** Endres kapittel 12 eller rundskrivet, gir kildesjekken beskjed, og kortene må gjennomgås. Ende-til-ende-tester for siden skrives når eier har godkjent designet.
