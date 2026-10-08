# 091 – Tallboksene fra Videregående i tall på andre sider

**Kontekst:** Tallene fra Videregående i tall står også i små bokser på sidene der de er nyttige. Eier ba om en gjennomgang (08.10.2026):
- boksene skal ha egne overskrifter, etter én hovedregel
- de skal ikke gå på bekostning av sidens eget innhold
- det skal være tydelig at de er hentet inn fra Videregående i tall

Før sto noen boksene øverst (Lærlinger og kandidater og fylkessiden) og noen midt på siden (Inntak).

**Valg:**
- **Plassering:** Boksen står etter sidens eget innhold. Det er nederst på siden, eller nederst i høyre kolonne over kildene på sider i to kolonner. På mobil kommer den derfor alltid etter innholdet.
- **Oppbygning (`Tallboks`):**
  - merkelappen «Videregående i tall» med ikonet til modulen
  - en tittel som sier hva tallene er og hvor de gjelder, f.eks. «Søkere og ungdomskull i Vestland»
  - tallene, kort
  - lenken til Videregående i tall eller temasiden, og kilden
- **Merking:** En svak flate i temafargen (`--farge-itall-flate`) og en strek til venstre i seriefargen. Det skiller boksen fra sidens egne kort.
- **Fylkessiden:** «Vestland i tall» har samme merkelapp og flate, og står nederst i høyre kolonne.
- **Unntak:** Skolen i tall i skolekortet er en del av kortet og beholder sin form.
- **Boksene nå:**

  | Side | Tall | Kilde |
  |---|---|---|
  | Inntak | søkere og ungdomskull | Udir og SSB |
  | Poengberegning | grunnskolepoeng | SSB |
  | Lærlinger og kandidater | læreplass | Udir |
  | Fraværsgrensen | fravær | Udir |
  | Eksamen | eksamenskarakterer | Udir |
  | Oppfølgingstjenesten (begrepet) | unge utenfor arbeid og utdanning | SSB |
  | Arbeidsplan | lærerne | SSB |
  | Fylkessiden | nøkkeltallene | Udir |

**Konsekvens:** En ny tallboks bruker `Tallboks` og står etter sidens eget innhold (AGENTS.md). Ende-til-ende-testen for statistikk sjekker merkelappen, tittelen og lenken i alle boksene.
