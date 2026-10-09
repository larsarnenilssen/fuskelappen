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
- Siste versjon er 0.38.3 (06.10.2026).
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

## Overlevering (06.10.2026, 0.39.0)

Pakken er levert etter fire designrunder (`fase-6-pakke-7-forslag.md`) og avgjørelse 073.

- **Siden «Mer opplæring»** i Inntak (`#/inntak/mer-opplaering`), med kortet på oversikten:
  - «Hvem har rett?» som matrise, med regelverket og kildene i samme boks
  - hva retten gir, og privatskoler som lukket kort
  - gangen fra melding til ny standpunktkarakter
  - fag- eller svenneprøven med tabell over løpene
  - vurdering: ny, utsatt eller særskilt eksamen, trekket, fraværsgrensen og førstegangsvitnemål
  - voksne og individuelt tilrettelagt opplæring, med tilpassede løp
  - delene kan lukkes (`Seksjon`), og to kolonner fra 64rem
- **Begrepet `mer-opplaering`** med lenkeordene «mer opplæring» og «rett til mer opplæring» (nynorsk «meir opplæring» og «rett til meir opplæring»). Søket finner også «meropplæring» og «meiropplæring».
- **Lenker til siden:**
  - Eksamen og prøvesiden i Vurdering
  - nytt utgangspunkt «Fag- eller svenneprøven ikke bestått» i «Bytte vei», med fire veier
  - steget om IOP i Tilrettelegging
  - tre datoer i Kalenderen
  - nytt spørsmål og sluttsteg i veiviseren «Rett, inntak og søknad»
- **Kildene:** `udir-mer-opplaering`, `udir-mer-opplaering-voksne` og `udir-fullforingsretten-iop`, med `punkt` og `url` til hvert kapittel.
- **Resten av appen:**
  - matrisene i «Sammenlign» og «Underveis- og sluttvurdering» har kildene i boksen
  - «Om veien» har ikke lenger tomrom (`faktaoppstilling`, testet for alle veiene)
- **Tester:**
  - enhetstest for oppstillingen
  - ende-til-ende for siden, delene som lukkes, `?del=`, veiviseren, søket, den nye knappen og «Om veien»
  - adressene gjennom veiviseren har fått ett ledd til

## Åpent etter pakke 7

- **Kontrollspørsmålene** til kortene, steget, utgangspunktet og begrepet venter på eier i kontrolloversikten.
- **Praksislisten:** «Fra lærling til lærekandidat etter en prøve som ikke er bestått» (`laerling-til-laerekandidat-etter-prove`) bygger bare på ol. § 7-2 og venter på eiers bekreftelse.
- **Forskrift til privatskoleloven** er ikke i Lov og forskrift. Kortet om privatskoler har bare Udirs kapittel 6 som kilde.
- **Lokalt** kjøres ende-til-ende-testene bare i Chromium (se pakke 6). WebKit kjøres i CI.
