# Arbeidsordre: fase 6, pakke 7 – Mer opplæring

Lim inn teksten under streken som første melding i en ny samtale.

---

Vi starter fase 6, pakke 7 i Jukselappen: **Mer opplæring** (repo `larsarnenilssen/jukselappen`, appen på https://jukselappen.no). Skriv til meg på bokmål, kort og enkelt.

**Les først:**
- `AGENTS.md` (faste regler)
- `OPPDRAG.md` (fase 6, «Pakke 7 – Mer opplæring», og «Gjelder alle faser»)
- `CHANGELOG.md` (siste versjoner)
- Kapittel 1 i `docs/arbeidsordrer/forslag-meropplaering-og-nyheter.md`: kildene, plasseringen og innholdet. Jeg har sagt ja til rekkefølgen (06.10.2026).
- Avgjørelsene i `docs/avgjorelser/`:
  - om innhold og kontroll (016, 017, 019, 021)
  - om veiviseren og fargene (041, 042, 044)
  - om Inntak og fristene (043, 046, 051)
  - om Vurdering og eksamen (054, 059)
  - om lenker til begrepsbanken (050)
  - om kalenderen (066)
  - om lærlinger og kandidater, med elementtypene `vei` og `utgangspunkt` (069)

**Status:**
- Siste versjon er 0.38.2 (06.10.2026).
- Pakken tas før fase 7.

**Pakken:**
- **Ny side «Mer opplæring» i Inntak:**
  - hvem som har rett: gjennomført, men ikke bestått (forskrift til opplæringslova § 5-2)
  - hva retten gir
  - fag- eller svenneprøve ikke bestått: Vg3 i skole (§ 5-2 tredje ledd)
  - søknad, frist og vedtak (§ 4-3)
  - organisering og løpende inntak (§ 4-9 femte ledd)
  - vurdering (§§ 9-16, 9-28 og 9-36–9-38)
  - voksne (§ 14-2)
  - elever med individuelt tilrettelagt opplæring

  Udirs veiledninger «Rett til mer opplæring» (seks kapitler med egne adresser), «Rett til mer opplæring for voksne» og «Fullføringsretten for elever med individuelt tilrettelagt opplæring» er kilder. De skrives med egne ord, med `punkt` og `url` til kapitlet.
- **Begrepet `mer-opplaering`** med `lenkeord` («meir opplæring», «rett til mer opplæring»).
- **Lenker til siden:**
  - Vurdering («ikke bestått»)
  - Lærlinger og kandidater: en overgang «Fag- eller svenneprøven ikke bestått → Vg3 i skole» med § 5-2 tredje ledd som kilde
  - Tilrettelegging (fullføringsretten)
  - fristen `fr-mer-opplaering` i Kalenderen
  - et steg i veiviseren for rett til inntak
- **Kildene:** nye kilder i `content/kilder.yaml`.

**Arbeidsmåte:**
- Først et forslag med mockup til meg. Lag mockupen i appen, med skjermbilder på mobil og skrivebord.
- Ingen ende-til-ende-tester før jeg har sagt at designet er ferdig.
- Push til `test` etter hver designrunde.
- Versjons-PR når vi er enige.
- Nytt innhold får `kontrollert: null` og 1–5 kontrollspørsmål med kilder. Det som ikke står i kildene, f.eks. klage på vedtaket, tas ikke med uten mitt svar.
- Ingen regel eller bestemmelse uten belegg i kildene eller mitt samtykke i chatten (06.10.2026).
- Ingen komma foran siste «og»/«eller» i oppramsinger (testes).

**Når pakken er levert:**
- Skriv overleveringen i denne filen.
- Oppdater status i `OPPDRAG.md` og `docs/arbeidsordrer/fase-7.md`.
